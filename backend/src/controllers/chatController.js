import prisma from '../config/db.js';
import { sendRealTimeNotification } from '../services/notificationService.js';

// 1. Fetch Conversations List
export const getConversations = async (req, res, next) => {
  try {
    const isCompany = req.user.role === 'ROLE_COMPANY';
    let conversations = [];

    if (isCompany) {
      const company = await prisma.companies.findUnique({
        where: { user_id: req.user.id }
      });
      if (!company) return res.status(404).json({ message: 'Company not found' });

      conversations = await prisma.chat_conversations.findMany({
        where: { company_id: company.id },
        include: {
          candidates: true,
          messages: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
    } else {
      const candidate = await prisma.candidates.findUnique({
        where: { user_id: req.user.id }
      });
      if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

      conversations = await prisma.chat_conversations.findMany({
        where: { candidate_id: candidate.id },
        include: {
          companies: true,
          messages: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
    }

    const mapped = conversations.map(c => {
      const lastMsg = c.messages[0];
      return {
        id: Number(c.id),
        candidateId: Number(c.candidate_id),
        candidateUserId: c.candidates ? Number(c.candidates.user_id) : null,
        companyId: Number(c.company_id),
        companyUserId: c.companies ? Number(c.companies.user_id) : null,
        recipientName: isCompany 
          ? `${c.candidates.first_name} ${c.candidates.last_name}` 
          : c.companies.name,
        lastMessageText: lastMsg ? lastMsg.text : '',
        lastMessageTime: lastMsg ? lastMsg.created_at : c.created_at,
        lastMessageSenderId: lastMsg ? Number(lastMsg.sender_id) : null,
        unreadCount: c.messages.filter(m => !m.is_read && m.sender_id !== req.user.id).length
      };
    });

    // Sort by last message time descending
    mapped.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return res.status(200).json(mapped);
  } catch (error) {
    next(error);
  }
};

// 2. Fetch Messages History
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.chat_messages.findMany({
      where: { conversation_id: BigInt(conversationId) },
      orderBy: { created_at: 'asc' }
    });

    // Mark other's messages in this conversation as read
    await prisma.chat_messages.updateMany({
      where: {
        conversation_id: BigInt(conversationId),
        sender_id: { not: req.user.id },
        is_read: false
      },
      data: { is_read: true }
    });

    const mapped = messages.map(m => ({
      id: Number(m.id),
      conversationId: Number(m.conversation_id),
      senderId: Number(m.sender_id),
      text: m.text,
      isRead: m.is_read,
      createdAt: m.created_at
    }));

    return res.status(200).json(mapped);
  } catch (error) {
    next(error);
  }
};

// 3. Send Message
export const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, conversationId, text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    let finalConvId;
    let candidateId;
    let companyId;

    if (conversationId) {
      finalConvId = BigInt(conversationId);
      const conv = await prisma.chat_conversations.findUnique({
        where: { id: finalConvId }
      });
      if (!conv) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      candidateId = conv.candidate_id;
      companyId = conv.company_id;
    } else if (recipientId) {
      const isCompany = req.user.role === 'ROLE_COMPANY';

      if (isCompany) {
        const company = await prisma.companies.findUnique({
          where: { user_id: req.user.id }
        });
        const targetCandidate = await prisma.candidates.findUnique({
          where: { user_id: BigInt(recipientId) }
        });
        if (!targetCandidate) return res.status(404).json({ message: 'Recipient candidate not found' });
        companyId = company.id;
        candidateId = targetCandidate.id;
      } else {
        const candidate = await prisma.candidates.findUnique({
          where: { user_id: req.user.id }
        });
        const targetCompany = await prisma.companies.findUnique({
          where: { user_id: BigInt(recipientId) }
        });
        if (!targetCompany) return res.status(404).json({ message: 'Recipient company not found' });
        companyId = targetCompany.id;
        candidateId = candidate.id;
      }

      // Check if interview is scheduled between company and candidate
      const interviewCount = await prisma.interviews.count({
        where: {
          applications: {
            candidate_id: candidateId,
            jobs: {
              company_id: companyId
            }
          }
        }
      });

      if (interviewCount === 0) {
        return res.status(403).json({ message: 'Chat options are only activated after an interview has been scheduled.' });
      }

      let conversation = await prisma.chat_conversations.findFirst({
        where: { candidate_id: candidateId, company_id: companyId }
      });

      if (!conversation) {
        conversation = await prisma.chat_conversations.create({
          data: { candidate_id: candidateId, company_id: companyId }
        });
      }
      finalConvId = conversation.id;
    } else {
      return res.status(400).json({ message: 'Recipient or conversation context required' });
    }

    // Double check the validation if conversationId was directly supplied
    if (conversationId) {
      const interviewCount = await prisma.interviews.count({
        where: {
          applications: {
            candidate_id: candidateId,
            jobs: {
              company_id: companyId
            }
          }
        }
      });

      if (interviewCount === 0) {
        return res.status(403).json({ message: 'Chat options are only activated after an interview has been scheduled.' });
      }
    }

    const message = await prisma.chat_messages.create({
      data: {
        conversation_id: finalConvId,
        sender_id: req.user.id,
        text,
        is_read: false,
        created_at: new Date()
      }
    });

    // Notify recipient in real-time
    let targetUserId;
    const conversationDetail = await prisma.chat_conversations.findUnique({
      where: { id: finalConvId },
      include: {
        candidates: true,
        companies: true
      }
    });

    if (req.user.role === 'ROLE_COMPANY') {
      targetUserId = conversationDetail.candidates.user_id;
    } else {
      targetUserId = conversationDetail.companies.user_id;
    }

    if (targetUserId) {
      const senderName = req.user.role === 'ROLE_COMPANY' 
        ? conversationDetail.companies.name 
        : `${conversationDetail.candidates.first_name} ${conversationDetail.candidates.last_name}`;
      
      const payloadText = `New message from ${senderName}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`;
      await sendRealTimeNotification(targetUserId, payloadText);
    }

    return res.status(200).json({
      id: Number(message.id),
      conversationId: Number(message.conversation_id),
      senderId: Number(message.sender_id),
      text: message.text,
      isRead: message.is_read,
      createdAt: message.created_at
    });
  } catch (error) {
    next(error);
  }
};
