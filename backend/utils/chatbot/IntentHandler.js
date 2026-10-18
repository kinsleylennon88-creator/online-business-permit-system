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
      if (
        msg.includes('status') ||
        msg.includes('check status') ||
        msg.includes('where is my') ||
        msg.includes('track') ||
        msg.includes('my application') ||
        msg.includes('my permit') ||
        msg.includes('ticket') ||
        msg.includes('follow up') ||
        msg.includes('update on my') ||
        /(?:bp|trk|bin)-\d{4}-\d+/i.test(msg)
      ) {
        return 'status_check';
      }
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
        response: "🔒 **Please log in to your citizen account** to check real-time permit status and details.\n\nOnce logged in, I will automatically pull up your application history and current evaluation stage!",
        handled: true
      };
    }

    try {
      const userId = user.id || user._id;
      const userEmail = user.email ? user.email.toLowerCase() : null;

      // Extract tracking, permit, or BIN pattern if provided
      const refMatch = message.match(/(?:BP|TRK|BIN)-\d{4}-\d+/i);

      // Build resilient user query matching applicant ID or registered email
      const userCondition = userEmail
        ? { $or: [{ applicant: userId }, { 'ownerInfo.email': userEmail }] }
        : { applicant: userId };

      let permit = null;

      if (refMatch) {
        const refNo = refMatch[0].toUpperCase();
        permit = await Permit.findOne({
          $and: [
            userCondition,
            {
              $or: [
                { permitNumber: refNo },
                { trackingNumber: refNo },
                { businessIdNumber: refNo }
              ]
            }
          ]
        });
      }

      // If no explicit ref number matched, retrieve the latest application
      if (!permit) {
        permit = await Permit.findOne(userCondition).sort({ createdAt: -1 });
      }

      if (!permit) {
        return {
          response: `I couldn't find any business permit applications under your account (\`${user.email || 'Citizen'}\`) yet.\n\nYou can click **'Apply for New Permit'** on your dashboard to start your application! If you recently submitted, please allow a moment for the registry to synchronize.`,
          handled: true
        };
      }

      // Auto-heal applicant ID on permit if it was previously detached
      if (user._id && permit.applicant?.toString() !== user._id.toString()) {
        permit.applicant = user._id;
        permit.save().catch(e => console.warn('Non-blocking permit applicant auto-heal error:', e.message));
      }

      const bName = permit.businessInfo?.businessName || permit.businessName || 'Business Entity';
      const refNumber = permit.trackingNumber || permit.permitNumber || permit.businessIdNumber || 'N/A';
      const bType = (permit.businessInfo?.businessType || 'business').replace(/_/g, ' ');
      const barangay = permit.businessInfo?.businessAddress?.barangay || 'Janiuay';

      const fireReview = permit.agencyReviews?.fire || permit.agencyReviews?.bureau_of_fire || {};
      const sanitationReview = permit.agencyReviews?.sanitation || permit.agencyReviews?.bureau_of_sanitation || {};
      const fireStatus = fireReview.status || 'pending';
      const sanitationStatus = sanitationReview.status || 'pending';

      const formatAgencyBadge = (st) => {
        if (st === 'approved') return '✅ Approved';
        if (st === 'correction_requested') return '⚠️ Correction Needed';
        if (st === 'rejected') return '❌ Rejected';
        return '⏳ In Review';
      };

      const assessmentAmount = permit.assessment?.fees?.total || permit.paymentInfo?.amount || 0;
      const amountStr = assessmentAmount > 0 ? `₱${Number(assessmentAmount).toLocaleString()}` : 'Assessed by BPLO';

      const statusMap = {
        'draft': `📝 **Draft Application**\n\nYour application for **${bName}** is currently in draft. Please complete all form steps and upload required clearances to submit.`,
        'submitted': `📬 **Submitted & Queued**\n\nYour application for **${bName}** has been received and is queued for BPLO initial verification (SLA: 2-3 business days).\n\n• **BFP Fire Clearance:** ${formatAgencyBadge(fireStatus)}\n• **Sanitation Clearance:** ${formatAgencyBadge(sanitationStatus)}`,
        'under_admin_review': `🔍 **Under Administrative Review**\n\nBPLO licensing evaluators are actively reviewing your submitted application for **${bName}**.\n\n• **BFP Fire Clearance:** ${formatAgencyBadge(fireStatus)}\n• **Sanitation Clearance:** ${formatAgencyBadge(sanitationStatus)}`,
        'under_review': `🔍 **Under Departmental Review**\n\nYour application for **${bName}** is undergoing departmental inspection and clearance reviews.\n\n• **BFP Fire Clearance:** ${formatAgencyBadge(fireStatus)}\n• **Sanitation Clearance:** ${formatAgencyBadge(sanitationStatus)}`,
        'pending_fire_review': `🔥 **Queued for Bureau of Fire Protection (BFP)**\n\nYour application for **${bName}** is being evaluated for Fire Safety Inspection Certificate (FSIC).\n\n• **Sanitation Clearance:** ${formatAgencyBadge(sanitationStatus)}`,
        'pending_sanitation_review': `🩺 **Queued for Sanitation Clearance**\n\nYour application for **${bName}** is undergoing sanitary inspection review by the Municipal Health Office.\n\n• **BFP Fire Clearance:** ${formatAgencyBadge(fireStatus)}`,
        'returned_for_correction': `⚠️ **Action Required: Returned for Correction**\n\nEvaluator remarks: "${permit.remarks || permit.adminComments || 'Please check missing requirements'}".\n\nPlease visit your dashboard to upload the updated or missing clearance documents.`,
        'pending_payment': `🎉 **Payment Assessment Issued!**\n\nBoth Fire Safety and Sanitary clearances are **APPROVED** for **${bName}**!\n\n• **Total Assessed Fees:** **${amountStr}**\n• **Payment Method:** Municipal Treasury Cashier\n\nYou can click **'View Voucher & Pay'** on your dashboard to view/print your official Order of Payment voucher.`,
        'payment_under_review': `💳 **Payment Receipt Under Audit**\n\nYour payment confirmation for **${bName}** has been submitted and is currently undergoing Treasury verification. Once verified, your official permit certificate will be issued.`,
        'approved': `✅ **Application Approved!**\n\nCongratulations! Your business permit for **${bName}** has been approved and is being signed/finalized.`,
        'issued': `🏆 **Active Official Permit Issued!**\n\nYour Official Business Permit (\`${permit.permitNumber || refNumber}\`) for **${bName}** has been granted! You can download or print your permit certificate directly from your citizen dashboard.`,
        'completed': `🏆 **Active Official Permit Issued!**\n\nYour Official Business Permit (\`${permit.permitNumber || refNumber}\`) for **${bName}** is active and completed.`,
        'rejected': `❌ **Application Rejected**\n\nReason: "${permit.remarks || permit.adminComments || 'Please see dashboard notes'}". You can contact BPLO for guidance or submit an updated application.`,
        'cancelled': `🚫 **Application Cancelled**\n\nThis application has been marked as cancelled.`,
        'expired': `⚠️ **Permit Expired**\n\nYour previous permit has expired. Please submit a renewal application on your dashboard.`
      };

      const statusDetail = statusMap[permit.status] || `Current Status: **${permit.status.replace(/_/g, ' ').toUpperCase()}**`;

      let response = `📋 **Permit Status Overview**\n`;
      response += `• **Business:** **${bName}** (${bType})\n`;
      response += `• **Tracking Reference:** \`${refNumber}\`\n`;
      response += `• **Location:** Brgy. ${barangay}, Janiuay\n\n`;
      response += `${statusDetail}\n\n`;

      // Check if user has other permits
      const otherPermits = await Permit.find({
        ...userCondition,
        _id: { $ne: permit._id }
      }).sort({ createdAt: -1 }).limit(3);

      if (otherPermits.length > 0) {
        response += `📁 *Other applications on file:* ${otherPermits.map(p => `\`${p.trackingNumber || p.permitNumber || 'Application'}\` (${p.businessInfo?.businessName || 'Business'})`).join(', ')}`;
      }

      return {
        response,
        handled: true,
        data: {
          permitId: permit._id,
          trackingNumber: permit.trackingNumber,
          status: permit.status
        }
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
