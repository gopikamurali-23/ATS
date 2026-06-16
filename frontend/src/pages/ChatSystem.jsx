import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Search, Loader, Clock, User, Check, CheckCheck } from 'lucide-react';

const ChatSystem = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [convSearchTerm, setConvSearchTerm] = useState('');
  const [msgSearchTerm, setMsgSearchTerm] = useState('');
  
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);

  const location = useLocation();

  // 1. Fetch Conversations
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingConvs(true);
    try {
      const res = await api.get('/api/chat/conversations');
      const convList = res.data || [];
      
      const state = location.state;
      if (state) {
        let matching = null;
        if (user.role === 'COMPANY' && state.candidateId) {
          matching = convList.find(c => c.candidateId === Number(state.candidateId));
        } else if (user.role === 'APPLICANT' && state.companyUserId) {
          matching = convList.find(c => c.companyUserId === Number(state.companyUserId));
        }

        if (matching) {
          setSelectedConv(matching);
          setConversations(convList);
        } else {
          // If no existing conversation exists, create a temporary placeholder card
          const tempConv = {
            id: 'new',
            recipientName: state.recipientName || 'New Chat',
            lastMessageText: 'Draft...',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0
          };
          if (user.role === 'COMPANY') {
            tempConv.candidateId = Number(state.candidateId);
            tempConv.recipientUserId = Number(state.candidateUserId);
          } else {
            tempConv.companyUserId = Number(state.companyUserId);
            tempConv.recipientUserId = Number(state.companyUserId);
          }
          setSelectedConv(tempConv);
          setConversations([tempConv, ...convList]);
        }
      } else {
        setConversations(convList);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      if (!silent) setLoadingConvs(false);
    }
  };

  // 2. Fetch Messages for Selected Conversation
  const fetchMessages = async (convId, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const res = await api.get(`/api/chat/messages/${convId}`);
      setMessages(res.data || []);
      // Mark read locally on list
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      if (!silent) setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [location.state]);

  useEffect(() => {
    if (selectedConv) {
      if (selectedConv.id === 'new') {
        setMessages([]);
      } else {
        fetchMessages(selectedConv.id);
      }
    }
  }, [selectedConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Real-Time notification listener
  useEffect(() => {
    const handleRealtimeUpdate = (e) => {
      const notification = e.detail;
      if (notification.text && (notification.text.includes('message') || notification.text.includes('chat') || notification.text.includes('Message'))) {
        fetchConversations(true);
        if (selectedConv && selectedConv.id !== 'new') {
          fetchMessages(selectedConv.id, true);
        }
      }
    };

    window.addEventListener('realtime-notification', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('realtime-notification', handleRealtimeUpdate);
    };
  }, [selectedConv]);

  // 4. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    setSending(true);
    const textToSend = newMessage;
    setNewMessage('');

    try {
      const payload = { text: textToSend };
      if (selectedConv.id === 'new') {
        payload.recipientId = selectedConv.recipientUserId;
      } else {
        payload.conversationId = selectedConv.id;
      }

      const res = await api.post('/api/chat/send', payload);
      
      if (selectedConv.id === 'new') {
        // Conversation was newly created, re-fetch list silently and select the created conversation
        const listRes = await api.get('/api/chat/conversations');
        const list = listRes.data || [];
        setConversations(list);
        const matched = list.find(c => 
          user.role === 'COMPANY' 
            ? c.candidateId === selectedConv.candidateId 
            : c.companyId === selectedConv.companyId
        );
        if (matched) {
          setSelectedConv(matched);
        } else {
          setSelectedConv(null);
        }
      } else {
        setMessages(prev => [...prev, res.data]);
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  // Filter Conversations
  const filteredConversations = conversations.filter(c =>
    c.recipientName.toLowerCase().includes(convSearchTerm.toLowerCase())
  );

  // Filter Messages
  const filteredMessages = messages.filter(m =>
    m.text.toLowerCase().includes(msgSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-brand-500" /> Messages Portal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Real-time chats and communication log history.</p>
      </div>

      <div className="flex-1 flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Left Side: Conversations list */}
        <div className="w-1/3 border-r border-slate-200 dark:border-slate-800/80 flex flex-col bg-slate-50/50 dark:bg-slate-900/40">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/80">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={convSearchTerm}
                onChange={(e) => setConvSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/45">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="animate-spin h-6 w-6 text-brand-500" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">No conversations found.</div>
            ) : (
              filteredConversations.map(c => {
                const isActive = selectedConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConv(c)}
                    className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/20 ${
                      isActive ? 'bg-brand-500/10 border-l-4 border-brand-500 dark:bg-brand-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">
                        {c.recipientName[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.recipientName}</h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.lastMessageText || 'No messages yet'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-[9px] text-slate-400">
                        {new Date(c.lastMessageTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="h-4 min-w-[16px] px-1 bg-brand-500 text-[10px] text-white rounded-full flex items-center justify-center font-bold">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation pane */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-100 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold">
                    {selectedConv.recipientName[0]}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{selectedConv.recipientName}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Channel</p>
                  </div>
                </div>

                {/* Message Search */}
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={msgSearchTerm}
                    onChange={(e) => setMsgSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-[10px]"
                  />
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader className="animate-spin h-8 w-8 text-brand-500" />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-20 text-center text-xs text-slate-400 italic">No messages found.</div>
                ) : (
                  filteredMessages.map(m => {
                    const isSelf = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs space-y-1 shadow-sm border ${
                          isSelf 
                            ? 'bg-brand-600 text-white border-brand-500 rounded-br-none' 
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 border-slate-200 dark:border-slate-850/50 rounded-bl-none'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          <div className={`flex items-center justify-end gap-1.5 text-[9px] opacity-70 ${isSelf ? 'text-slate-100' : 'text-slate-400'}`}>
                            <Clock className="h-2.5 w-2.5" />
                            <span>{new Date(m.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                            {isSelf && (
                              m.isRead ? <CheckCheck className="h-3 w-3 text-emerald-300" /> : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                  disabled={sending}
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <MessageSquare className="h-10 w-10 text-slate-300" />
              <span className="text-xs italic">Select a conversation from the sidebar to start messaging.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatSystem;
