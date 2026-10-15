/**
 * Resolves a document URL with authentication token for browser viewing/downloading.
 * Handles both relative and absolute backend file URLs as well as external Cloudinary/HTTP URLs.
 */
export const getFileViewUrl = (fileUrl) => {
  if (!fileUrl) return '#';
  
  const token = localStorage.getItem('token');
  
  // If already an external third-party URL (e.g. cloudinary, unsplash) that is NOT our permit API
  if ((fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) && !fileUrl.includes('/api/permits/')) {
    return fileUrl;
  }

  // Determine prefix if in local dev with different port
  let targetUrl = fileUrl;
  if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
    const isDev = import.meta.env.DEV;
    const apiBase = import.meta.env.VITE_API_URL || '';
    if (isDev && !fileUrl.startsWith('/api')) {
      targetUrl = `/api${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
    }
    // If running in dev on different port, prepend host if needed
    if (isDev && apiBase.startsWith('http')) {
      try {
        const origin = new URL(apiBase).origin;
        targetUrl = `${origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
      } catch (e) {
        // Fallback
      }
    }
  }

  if (token) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    return `${targetUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  return targetUrl;
};

/**
 * Direct click handler to open a file safely in a new browser tab with fresh auth token.
 */
export const handleViewFile = (e, fileUrl) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  const url = getFileViewUrl(fileUrl);
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
