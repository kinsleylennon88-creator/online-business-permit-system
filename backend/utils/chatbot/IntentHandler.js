const Permit = require('../../models/Permit');
const User = require('../../models/User');

/**
 * Intent Handler for Janiuay BPLO Chatbot
 * Handles complex intents that require database access or specific business logic.
 */
class IntentHandler {
  /**
   * Classify intent based on message content and user role
   */
  static classifyIntent(message, role = 'public') {
    const msg = message.toLowerCase();
    
    if (role === 'admin' || role === 'superadmin') {
      if (msg.includes('summary') || msg.includes('queue') || msg.includes('how are we doing') || msg.includes('registry pulse')) return 'case_summary';
      if (msg.includes('search') || msg.includes('find') || msg.includes('user') || msg.includes('citizen')) return 'user_search';
      if (msg.includes('draft') || msg.includes('write')) return 'draft_response';
    } else {
      if (msg.includes('status') || msg.includes('check status') || msg.includes('where is my') || msg.includes('track')) return 'status_check';
    }
    
    if (msg.includes('human') || msg.includes('agent') || msg.includes('talk to a person') || msg.includes('officer')) return 'human_escalation';
    
    return 'general_chat';
  }

  /**
   * Process an intent based on user role and data
   */
  static async process(intent, message, user, context = {}) {
    const role = user ? user.role : 'public';
    
    // Safety check: Don't allow non-admins to access admin intents
    const adminIntents = ['case_summary', 'user_search', 'queue_management', 'workflow_suggestion'];
    if (adminIntents.includes(intent) && !['admin', 'superadmin'].includes(role)) {
      return {
        response: "I'm sorry, but administrative functions are reserved for authorized BPLO staff.",
        handled: true
      };
    }

    switch (intent) {
      case 'status_check':
        return await this.handleStatusCheck(message, user, context);
      case 'case_summary':
        return await this.handleCaseSummary(user);
      case 'user_search':
        return await this.handleUserSearch(message);
      case 'human_escalation':
        return {
          response: "🤝 **Live Officer Support:**\n\nYou can reach our Business Permit and Licensing Officers directly:\n• 📞 Hotline: **09811568676**\n• 📧 Email: **bplo.janiuay@gmail.com**\n• 🏢 Office: Ground Floor, Janiuay Municipal Hall\n• ⏰ Hours: Monday to Friday, 8:00 AM - 5:00 PM",
          handled: true
        };
      default:
        return { handled: false };
    }
  }

  /**
   * Handle permit status inquiry for applicants
   */
  static async handleStatusCheck(message, user, context) {
    if (!user) {
      return {
        response: "🔒 **Please log in to your citizen account** to check real-time permit status and details.",
        handled: true
      };
    }

    try {
      const permitIdMatch = message.match(/BP-\d{4}-\d+/i);
      let permit;

      if (permitIdMatch) {
        permit = await Permit.findOne({ permitNumber: permitIdMatch[0].toUpperCase(), userId: user.id || user._id });
      } else {
        permit = await Permit.findOne({ userId: user.id || user._id }).sort({ createdAt: -1 });
      }

      if (!permit) {
        return {
          response: "I couldn't find any business permit applications under your account yet. You can click **'Apply for New Permit'** on your dashboard to start your application!",
          handled: true
        };
      }

      const statusMessages = {
        'draft': "Your application is currently in **DRAFT** status. Please complete the form and upload required clearances.",
        'submitted': "Your application has been **SUBMITTED** and is queued for verification by BPLO officers (2-3 business days SLA).",
        'under_review': "Your application is currently **UNDER REVIEW** by municipal department heads.",
        'pending_payment': "🎉 Your application is **ASSESSED & READY FOR PAYMENT**. Please proceed to the payment step on your dashboard.",
        'approved': "✅ Your business permit has been **APPROVED**! You can now view, download, or print your official permit certificate.",
        'rejected': `❌ Your application was **REJECTED**. Reason: ${permit.rejectionReason || 'Please review requirements on your dashboard'}.`,
        'expired': "⚠️ Your permit has **EXPIRED**. Please submit a renewal application."
      };

      return {
        response: `📋 **Application Status for ${permit.businessName || 'Business'}** (\`${permit.permitNumber || 'N/A'}\`):\n\n${statusMessages[permit.status] || 'Current status: ' + permit.status}\n\nNeed to submit updated documents or ask about requirements? Just let me know!`,
        handled: true,
        data: { permitId: permit._id }
      };
    } catch (error) {
      console.error('Error in handleStatusCheck:', error.message);
      return { response: "Unable to retrieve application status at this moment. Please check your dashboard or try again shortly.", handled: true };
    }
  }

  /**
   * Handle case summary for admins
   */
  static async handleCaseSummary(user) {
    try {
      const counts = await Permit.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const summary = counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      const totalPending = (summary['submitted'] || 0) + (summary['under_review'] || 0);

      let response = `📊 **Command Center Summary (Registry Pulse):**\n\n`;
      response += `• Total Registered Applications: **${await Permit.countDocuments()}**\n`;
      response += `• Urgent Review Queue: **${totalPending}** pending\n`;
      response += `• Approved Permits: **${summary['approved'] || 0}**\n`;
      response += `• Awaiting Assessment/Payment: **${summary['pending_payment'] || 0}**\n\n`;
      response += totalPending > 0 
        ? `⚡ *There are applications awaiting your verification in the Admin Dashboard.*`
        : `✨ *The verification queue is all caught up!*`;

      return { response, handled: true };
    } catch (error) {
      console.error('Error in handleCaseSummary:', error.message);
      return { response: "Error generating registry summary.", handled: true };
    }
  }

  /**
   * Handle user search for admins
   */
  static async handleUserSearch(message) {
    try {
      const searchTerms = message.replace(/search|find|user|citizen/gi, '').trim();
      
      if (!searchTerms || searchTerms.length < 3) {
        return { response: "Please provide a citizen name or email to search (at least 3 characters).", handled: true };
      }

      const users = await User.find({
        $or: [
          { firstName: new RegExp(searchTerms, 'i') },
          { lastName: new RegExp(searchTerms, 'i') },
          { email: new RegExp(searchTerms, 'i') }
        ]
      }).limit(3);

      if (users.length === 0) {
        return { response: `No citizen accounts found matching "${searchTerms}".`, handled: true };
      }

      let response = `🔍 **Citizen Directory Matches:**\n\n`;
      users.forEach(u => {
        response += `👤 **${u.firstName} ${u.lastName}** (\`${u.email}\`)\n`;
        response += `   Role: ${u.role.toUpperCase()} | Registered: ${new Date(u.createdAt).toLocaleDateString()}\n\n`;
      });

      return { response, handled: true };
    } catch (error) {
      console.error('Error in handleUserSearch:', error.message);
      return { response: "Error searching citizen records.", handled: true };
    }
  }
}

module.exports = IntentHandler;
