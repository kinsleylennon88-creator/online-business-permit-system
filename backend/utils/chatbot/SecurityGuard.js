/**
 * Security Guard for Municipality of Janiuay BPLO AI Chatbot
 * Enforces domain relevance, prompt injection prevention, and role-based data boundaries.
 */

// Permitted inquiry topics and municipal keywords
const PERMITTED_TOPIC_KEYWORDS = [
  // Permits & Licensing
  'permit', 'license', 'licensing', 'business', 'bplo', 'apply', 'application',
  'renew', 'renewal', 'retire', 'retirement', 'cancel', 'closure',
  // Requirements & Documents
  'requirement', 'document', 'clearance', 'barangay', 'zoning', 'locational',
  'occupancy', 'building', 'sanitary', 'health', 'cedula', 'tax certificate',
  'police', 'dti', 'sec', 'cda', 'lease', 'contract', 'land title', 'fire safety',
  'fsic', 'bir', 'tin', 'id', 'valid id', 'upload', 'photocopy',
  // Process & Steps
  'process', 'step', 'how to', 'procedure', 'guide', 'timeline', 'how long',
  'schedule', 'appointment', 'online', 'portal', 'dashboard', 'status', 'track',
  // Fees & Payments
  'fee', 'fees', 'cost', 'pay', 'payment', 'price', 'assessment', 'tax', 'mayor',
  'capital', 'capitalization', 'gross', 'sales', 'how much',
  // Contact & Municipal Info
  'contact', 'phone', 'telephone', 'mobile', 'call', 'email', 'address', 'location',
  'hall', 'office', 'hours', 'open', 'close', 'janiuay', 'iloilo', 'officer',
  'mpdc', 'treasurer', 'sanitary officer', 'help', 'human', 'agent', 'support',
  // Account & Troubleshooting
  'register', 'login', 'account', 'password', 'forgot', 'reset', 'error',
  'reject', 'rejection', 'correction', 'edit', 'download', 'print', 'certificate',
  // Conversational
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'kamusta',
  'salamat', 'thank', 'thanks', 'bye', 'goodbye', 'who are you', 'what can you do'
];

// Blocked patterns: Prompt Injection / System Jailbreak / Unrelated Tasks
const BLOCKED_PATTERNS = [
  /ignore (all )?(previous|above|prior) (instructions|directions|prompts)/i,
  /you are now (a|an|in|DAN|jailbreak)/i,
  /system prompt/i,
  /reveal (the |your )?prompt/i,
  /write (a |an )?(python|javascript|c\+\+|java|php|ruby|rust|sql|html|css|code|script|exploit)/i,
  /write (a |an )?(poem|story|essay|song|joke|novel|speech) about/i,
  /translate (this )?to/i,
  /who (won|is the president|is the prime minister|won the world cup)/i,
  /solve (this )?(math|equation|calculus|algebra)/i,
  /bypass (security|rules|auth)/i,
  /crypto|bitcoin|ethereum|forex trading|betting|casino/i,
  /nsfw|porn|nude|sex|hack|crack|ddos|malware|keylogger|virus/i
];

class SecurityGuard {
  /**
   * Validate if the incoming query is safe and relevant to Janiuay BPLO services.
   * @param {string} message - Raw user query
   * @param {string} role - User role ('public', 'user', 'admin', 'superadmin')
   * @returns {{ safe: boolean, reason?: string, cannedResponse?: string }}
   */
  static evaluate(message, role = 'public') {
    if (!message || typeof message !== 'string') {
      return {
        safe: false,
        reason: 'empty_input',
        cannedResponse: 'Please provide a valid question or inquiry regarding business permits.'
      };
    }

    const cleanMsg = message.trim().toLowerCase();

    // 1. Check for prompt injection or system extraction attempts
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(cleanMsg)) {
        return {
          safe: false,
          reason: 'security_violation',
          cannedResponse: 'Security Alert: I am configured solely to assist with official Municipality of Janiuay Business Permit & Licensing operations. I cannot execute external scripts, creative writing, or override system guidelines.'
        };
      }
    }

    // 2. Allow administrative inquiries if role is admin / superadmin
    if (['admin', 'superadmin'].includes(role)) {
      return { safe: true };
    }

    // 3. For public / regular users: Check topic relevance
    const words = cleanMsg.split(/[\s,?.!;:()/-]+/);
    const hasPermittedTopic = words.some(word => 
      PERMITTED_TOPIC_KEYWORDS.some(kw => word.includes(kw) || kw.includes(word))
    );

    // If query is too long and contains zero municipal keywords, decline politely
    if (words.length > 3 && !hasPermittedTopic) {
      return {
        safe: false,
        reason: 'out_of_scope',
        cannedResponse: 'I am the AI Assistant for the Municipality of Janiuay Business Permit & Licensing Office (BPLO). I can only answer questions related to business permits, requirements, application procedures, fees, tracking, and municipal services.\n\nHow may I help you with your business permit today?'
      };
    }

    return { safe: true };
  }

  /**
   * Sanitize AI reply to prevent leaking internal system prompts or API keys
   * @param {string} reply - LLM generated reply
   * @returns {string} - Clean sanitized reply
   */
  static sanitizeOutput(reply) {
    if (!reply || typeof reply !== 'string') return '';

    // Remove any accidental leak of internal environment variables or keys
    let sanitized = reply
      .replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_API_KEY]')
      .replace(/mongodb:\/\/[^\s]+/g, '[REDACTED_DB_URI]')
      .replace(/JWT_SECRET=[^\s]+/g, '[REDACTED]')
      .trim();

    return sanitized;
  }
}

module.exports = SecurityGuard;
