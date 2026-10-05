const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const ChatLog = require('../models/ChatLog');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');
const axios = require('axios');
const SYSTEM_PROMPTS = require('../data/chatbot/system_prompts');
const IntentHandler = require('../utils/chatbot/IntentHandler');
const SecurityGuard = require('../utils/chatbot/SecurityGuard');

const router = express.Router();

// Curated Janiuay BPLO Official Knowledge Base for instant high-speed responses
const knowledgeBase = {
  greetings: [
    'hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'kamusta', 'hey', 'maayong aga', 'maayong hapon'
  ],
  requirements: {
    triggers: ['what document', 'requirements', 'clearance', 'what do i need', 'needed', 'requirements for new', 'documents needed'],
    response: [
      '📋 **Official Document Requirements for New Business Permit (Janiuay BPLO):**',
      '',
      '1. **Barangay Business Clearance** *(from the Barangay where business is located)*',
      '2. **Zoning & Locational Clearance** *(from MPDC, 2nd Floor Municipal Hall)*',
      '3. **Occupancy Permit / Building Clearance** *(from Municipal Engineer)*',
      '4. **Municipal Sanitary Permit** *(from Municipal Health Office)*',
      '5. **Fire Safety Inspection Certificate (FSIC)** *(from BFP Janiuay)*',
      '6. **Proof of Business Name Registration:**',
      '   • Sole Proprietorship: *DTI Certificate*',
      '   • Corporation/Partnership: *SEC Registration*',
      '   • Cooperative: *CDA Certificate*',
      '7. **Community Tax Certificate (Cedula)** *(Treasurer\'s Office)*',
      '8. **Proof of Right Over Property** *(Lease Contract if rented, Land Title if owned)*',
      '9. **Valid Government ID** of owner/representative',
      '',
      '💡 *Tip: You can take clear photos or scans and upload all of these directly through your citizen dashboard!*'
    ].join('\n')
  },
  process: {
    triggers: ['how to apply', 'process', 'step', 'steps', 'procedure', 'how do i apply'],
    response: [
      '🚀 **How to Apply Online in 4 Easy Steps:**',
      '',
      '1. **Register/Login:** Create a citizen account or sign in with Google.',
      '2. **Fill Business Profile:** Click *"Apply for New Permit"* on your dashboard and enter your business details.',
      '3. **Upload Documents:** Upload clear digital copies/photos of your clearances.',
      '4. **Review & Assessment:** Our BPLO officers will verify your documents within 2-3 business days.',
      '5. **Payment & Release:** Pay the assessed fees online or at the Municipal Cashier and instantly download your verified Permit!'
    ].join('\n')
  },
  renewal: {
    triggers: ['renew', 'renewal', 'renew permit', 'how to renew'],
    response: [
      '🔄 **Business Permit Renewal Guide (Annual January 1 - 20):**',
      '',
      '**Requirements for Renewal:**',
      '• Previous Year Official Business Permit',
      '• Current Year Barangay Business Clearance',
      '• Financial Statement / Sworn Declaration of Gross Sales/Receipts',
      '• Updated Sanitary Permit & Fire Safety Clearance (FSIC)',
      '',
      '💡 *Submit your renewal early on the portal to avoid surcharge and penalties.*'
    ].join('\n')
  },
  fees: {
    triggers: ['how much', 'fee', 'fees', 'cost', 'price', 'payment', 'taxes', 'assessment'],
    response: [
      '💰 **Business Permit Fees & Assessment:**',
      '',
      'Permit fees are assessed based on the Local Revenue Code of Janiuay:',
      '• **Graduated Business Tax:** Computed from declared capitalization (New) or gross receipts (Renewal)',
      '• **Mayor\'s Permit Fee:** Based on business classification category',
      '• **Sanitary Inspection Fee & Health Card**',
      '• **Fire Safety Inspection Fee (BFP)**',
      '• **Garbage & Solid Waste Management Fee**',
      '• **Zoning & Regulatory Fees**',
      '',
      'Exact fee assessments are automatically calculated once your application details are submitted.'
    ].join('\n')
  },
  contact: {
    triggers: ['contact', 'phone', 'number', 'email', 'office hours', 'location', 'where is', 'address', 'call'],
    response: [
      '🏛️ **Municipality of Janiuay - Business Permit & Licensing Office (BPLO)**',
      '',
      '📍 **Location:** Ground Floor, Janiuay Municipal Hall, Janiuay, Iloilo',
      '⏰ **Office Hours:** Monday to Friday, 8:00 AM - 5:00 PM',
      '📞 **Official Hotline:** 09811568676',
      '📧 **Email:** bplo.janiuay@gmail.com',
      '',
      '🌐 *Online services are available 24/7 on this portal!*'
    ].join('\n')
  }
};

/**
 * Core LLM caller for Ollama (qwen2.5-coder:7b or configured model)
 */
const callOllamaLLM = async (systemPrompt, message) => {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
  const timeoutMs = parseInt(process.env.OLLAMA_TIMEOUT_MS, 10) || 45000;

  // Try native /api/chat first (supports keep_alive & granular resource options)
  try {
    const response = await axios.post(`${ollamaBaseUrl}/api/chat`, {
      model: ollamaModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: false,
      keep_alive: '60m',
      options: {
        temperature: 0.2,
        num_predict: 250,
        num_ctx: 2048,
        top_k: 40,
        top_p: 0.9
      }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: timeoutMs
    });

    const reply = response.data?.message?.content?.trim();
    if (reply) return reply;
  } catch (nativeErr) {
    // If native /api/chat failed, try OpenAI-compatible /v1/chat/completions endpoint
    try {
      const v1Response = await axios.post(`${ollamaBaseUrl}/v1/chat/completions`, {
        model: ollamaModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.2,
        max_tokens: 250
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      const reply = v1Response.data?.choices?.[0]?.message?.content?.trim();
      if (reply) return reply;
    } catch (v1Err) {
      console.warn(`⚠️ Ollama (${ollamaModel}) unreachable/busy: ${nativeErr.message}`);
      return null;
    }
  }

  return null;
};

/**
 * Main chatbot query resolver with Security Guard, Intent Handler, Ollama Qwen, and resilient fallbacks
 */
const getChatbotResponse = async (message, user) => {
  const role = (user && (user.role === 'admin' || user.role === 'superadmin')) ? 'admin' : (user ? 'user' : 'public');

  // 1. SECURITY & DOMAIN BOUNDARY CHECK
  const securityCheck = SecurityGuard.evaluate(message, role);
  if (!securityCheck.safe) {
    return {
      response: securityCheck.cannedResponse,
      intent: 'security_boundary',
      confidence: 1.0
    };
  }

  // 2. DATA-DRIVEN INTENT HANDLER (Status checks, Admin search, Queue summaries)
  const intent = IntentHandler.classifyIntent ? IntentHandler.classifyIntent(message, role) : 'general_chat';
  try {
    const intentResult = await IntentHandler.process(intent, message, user);
    if (intentResult && intentResult.handled) {
      return {
        response: intentResult.response,
        intent: intent,
        confidence: 1.0,
        data: intentResult.data
      };
    }
  } catch (intentErr) {
    console.warn('IntentHandler non-fatal warning:', intentErr.message);
  }

  const cleanMsg = message.toLowerCase().trim();

  // 3. FAST-PATH: Exact Greetings
  if (knowledgeBase.greetings.some(g => cleanMsg === g || cleanMsg.startsWith(g + ' ') || cleanMsg.endsWith(' ' + g))) {
    const greeting = role === 'admin'
      ? "🏛️ **Command Nexus Online.** Ready for registry monitoring, application reviews, and queue audits."
      : "👋 **Hello! I am Citizen Sentinel**, your AI Assistant for the Municipality of Janiuay Business Permit & Licensing Office (BPLO).\n\nHow can I help you today? You can ask about requirements, fees, application procedures, or permit tracking!";
    return {
      response: greeting,
      intent: 'greeting',
      confidence: 0.95
    };
  }

  // 4. FAST-PATH: Instant Match for Common Official Inquiries
  for (const [key, section] of Object.entries(knowledgeBase)) {
    if (section.triggers && section.triggers.some(trigger => cleanMsg.includes(trigger))) {
      return {
        response: section.response,
        intent: key,
        confidence: 0.95
      };
    }
  }

  // 5. DEEP AI INFERENCE: Ollama (Qwen 7b)
  const systemPrompt = role === 'admin' ? SYSTEM_PROMPTS.ADMIN : SYSTEM_PROMPTS.APPLICANT;
  const ollamaReply = await callOllamaLLM(systemPrompt, message);
  if (ollamaReply) {
    const sanitized = SecurityGuard.sanitizeOutput(ollamaReply);
    return {
      response: sanitized,
      intent: 'ollama_qwen_ai',
      confidence: 0.92
    };
  }

  // 6. CLOUD / OPENAI FALLBACK (if configured in .env)
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    try {
      const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const reply = openaiResponse.data?.choices?.[0]?.message?.content?.trim();
      if (reply) {
        return {
          response: SecurityGuard.sanitizeOutput(reply),
          intent: 'openai_ai_generated',
          confidence: 0.9
        };
      }
    } catch (openAiErr) {
      console.warn('OpenAI fallback unavailable:', openAiErr.message);
    }
  }

  // 7. COMPREHENSIVE MUNICIPAL GENERAL FALLBACK
  return {
    response: [
      'I am here to assist with all matters regarding Janiuay Business Permits and Licensing.',
      '',
      'You can ask me about:',
      '• **Document requirements** for new or renewed permits',
      '• **Application steps** and online submission guide',
      '• **Permit fees** and tax assessment inquiries',
      '• **Permit tracking** and status updates',
      '',
      'For direct assistance, visit us at the Ground Floor, Municipal Hall or contact BPLO at 📞 **09811568676**.'
    ].join('\n'),
    intent: 'municipal_general_fallback',
    confidence: 0.8
  };
};

/**
 * Request Handler for Chatbot Endpoints
 */
const handleChatRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { message, sessionId, userId } = req.body;

    // Security check: Verify user identity from MongoDB token or safe lookup
    let user = req.user;
    if (!user && userId && mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(userId).select('-password');
      } catch (e) {
        user = null;
      }
    }

    const role = (user && (user.role === 'admin' || user.role === 'superadmin')) ? 'admin' : (user ? 'user' : 'public');
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const startTime = Date.now();
    const botResponse = await getChatbotResponse(message, user);
    const responseTime = Date.now() - startTime;
    const reply = botResponse.response;

    // Asynchronously log to database only if MongoDB is connected (non-blocking)
    if (mongoose.connection.readyState === 1) {
      // 1. Save ChatMessage
      ChatMessage.create({
        sender: user ? user._id : undefined,
        userId: user ? user._id.toString() : (userId || null),
        role: role,
        message: message,
        reply: reply,
        type: 'ai'
      }).catch(err => console.warn('Non-blocking ChatMessage log warning:', err.message));

      // 2. Update ChatLog session
      ChatLog.findOne({ sessionId: currentSessionId })
        .then(async (chatLog) => {
          if (!chatLog) {
            chatLog = new ChatLog({
              sessionId: currentSessionId,
              userId: user ? user._id : null,
              role: role,
              userInfo: { ip: req.ip, userAgent: req.get('User-Agent') }
            });
          }

          chatLog.messages.push({ type: 'user', content: message, timestamp: new Date() });
          chatLog.messages.push({
            type: 'bot',
            content: reply,
            timestamp: new Date(),
            metadata: { intent: botResponse.intent, confidence: botResponse.confidence, responseTime }
          });

          if (botResponse.intent === 'human_escalation' || botResponse.confidence < 0.4) {
            chatLog.escalated = true;
            chatLog.escalationReason = botResponse.intent === 'human_escalation' ? 'User requested human' : 'Low AI confidence';
            chatLog.escalatedAt = new Date();
          }

          await chatLog.save();
        })
        .catch(err => console.warn('Non-blocking ChatLog update warning:', err.message));
    }

    // Return prompt response to client
    return res.json({
      success: true,
      reply: reply,
      data: {
        response: reply,
        reply: reply,
        sessionId: currentSessionId,
        escalated: botResponse.intent === 'human_escalation',
        intent: botResponse.intent,
        role: role
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      success: false,
      error: 'Chat failed',
      message: 'Server error in chatbot service'
    });
  }
};

// Routes
router.post('/', optionalAuth, [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('sessionId').optional().isString(),
  body('userId').optional().isString()
], handleChatRequest);

router.post('/chat', optionalAuth, [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('sessionId').optional().isString(),
  body('userId').optional().isString()
], handleChatRequest);

// FAQ Endpoint
router.get('/faq', async (req, res) => {
  res.json({
    success: true,
    data: {
      faqs: [
        {
          question: 'What documents do I need for a new business permit?',
          answer: 'You need: Barangay Clearance, Zoning Clearance, Occupancy Permit, Sanitary Permit, Fire Safety Certificate (FSIC), DTI/SEC/CDA Registration, Cedula, and Property Ownership/Lease proof.'
        },
        {
          question: 'How long does permit processing take?',
          answer: 'Standard review SLA is 2 to 3 business days once all required clearance documents are verified.'
        },
        {
          question: 'When is the renewal period for business permits?',
          answer: 'The annual renewal period is from January 1 to January 20.'
        },
        {
          question: 'Where is the Janiuay BPLO office located?',
          answer: 'Ground Floor, Janiuay Municipal Hall, Janiuay, Iloilo. Open Monday to Friday, 8:00 AM to 5:00 PM.'
        }
      ]
    }
  });
});

module.exports = router;
