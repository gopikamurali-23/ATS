/**
 * Helper to process resume URL actions based on file type and environment.
 */
export const getResumeViewerAction = (url) => {
  if (!url) return { type: 'invalid' };
  const lowercaseUrl = url.toLowerCase();
  
  // PDF files can be rendered directly in a browser tab
  if (lowercaseUrl.endsWith('.pdf')) {
    return { type: 'pdf', url };
  }
  
  // DOC/DOCX files require a viewer service when viewed online.
  // Google Docs Viewer needs a publicly accessible URL, so we bypass it on localhost.
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.startsWith('192.168.');
                      
  if (!isLocalhost && (lowercaseUrl.endsWith('.doc') || lowercaseUrl.endsWith('.docx'))) {
    const absoluteUrl = window.location.origin + url;
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    return { type: 'viewer', url: googleViewerUrl };
  }
  
  // Localhost DOC/DOCX or unsupported files will fallback to direct download
  return { type: 'download', url };
};

/**
 * Opens a resume URL in a new tab using the best available viewer,
 * and returns the action type for UI feedback.
 */
export const openResumeUrl = (url) => {
  const action = getResumeViewerAction(url);
  if (action.type !== 'invalid' && action.url) {
    window.open(action.url, '_blank', 'noopener,noreferrer');
  }
  return action;
};
