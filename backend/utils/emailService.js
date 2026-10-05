const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Municipality of Janiuay BPLO" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Email templates
const emailTemplates = {
  // Welcome email for new users
  welcome: (user) => ({
    to: user.email,
    subject: 'Welcome to Janiuay Online Business Permit System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Janiuay BPLO</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Municipality of Janiuay</h1>
            <h2>Business Permit and Licensing Office</h2>
          </div>
          <div class="content">
            <h3>Welcome, ${user.firstName} ${user.lastName}!</h3>
            <p>Thank you for registering with the Janiuay Online Business Permit System. Your account has been successfully created.</p>
            <p>You can now:</p>
            <ul>
              <li>Apply for new business permits online</li>
              <li>Track your application status</li>
              <li>Upload required documents</li>
              <li>Communicate with our office</li>
            </ul>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Login to Your Account</a>
          </div>
          <div class="footer">
            <p><strong>Municipality of Janiuay</strong><br>
            Municipal Hall, Janiuay, Iloilo<br>
            Phone: 09811568676 | Email: bplo.janiuay@gmail.com<br>
            Office Hours: Monday-Friday 8:00 AM - 5:00 PM</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Permit application confirmation
  applicationReceived: (user, permit) => ({
    to: user.email,
    subject: 'Business Permit Application Received',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 10px 0; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Municipality of Janiuay</h1>
            <h2>Business Permit and Licensing Office</h2>
          </div>
          <div class="content">
            <h3>Application Received!</h3>
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>We have received your business permit application for <strong>${permit.businessInfo.businessName}</strong>.</p>
            
            <div class="info-box">
              <h4>Application Details:</h4>
              <p><strong>Application ID:</strong> ${permit._id}</p>
              <p><strong>Business Name:</strong> ${permit.businessInfo.businessName}</p>
              <p><strong>Business Type:</strong> ${permit.businessInfo.businessType}</p>
              <p><strong>Status:</strong> ${permit.status}</p>
            </div>

            <p>Your application is now under review. You will receive updates via email as it progresses through the approval process.</p>
            
            <p>Current processing time is typically 2-3 business days.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Track Your Application</a>
          </div>
          <div class="footer">
            <p><strong>Municipality of Janiuay</strong><br>
            Municipal Hall, Janiuay, Iloilo<br>
            Phone: 09811568676 | Email: bplo.janiuay@gmail.com<br>
            Office Hours: Monday-Friday 8:00 AM - 5:00 PM</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Permit approval notification
  permitApproved: (user, permit) => ({
    to: user.email,
    subject: 'Business Permit Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Permit Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #16a34a; margin: 10px 0; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <h2>Your Business Permit Has Been Approved</h2>
          </div>
          <div class="content">
            <h3>Dear ${user.firstName} ${user.lastName},</h3>
            <p>We are pleased to inform you that your business permit application has been approved!</p>
            
            <div class="info-box">
              <h4>Permit Details:</h4>
              <p><strong>Permit Number:</strong> ${permit.permitNumber}</p>
              <p><strong>Business Name:</strong> ${permit.businessInfo.businessName}</p>
              <p><strong>Valid Until:</strong> ${permit.expiresAt ? new Date(permit.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
            </div>

            <p>You can now download your official business permit from your dashboard.</p>
            
            <p>Please remember to renew your permit before the expiration date to avoid penalties.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Download Your Permit</a>
          </div>
          <div class="footer">
            <p><strong>Municipality of Janiuay</strong><br>
            Municipal Hall, Janiuay, Iloilo<br>
            Phone: 09811568676 | Email: bplo.janiuay@gmail.com<br>
            Office Hours: Monday-Friday 8:00 AM - 5:00 PM</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Permit rejection notification
  permitRejected: (user, permit, reason) => ({
    to: user.email,
    subject: 'Business Permit Application Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 10px 0; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
            <h2>Business Permit Review</h2>
          </div>
          <div class="content">
            <h3>Dear ${user.firstName} ${user.lastName},</h3>
            <p>Regarding your business permit application for <strong>${permit.businessInfo.businessName}</strong>, we need to inform you of the following:</p>
            
            <div class="info-box">
              <h4>Application Status:</h4>
              <p><strong>Status:</strong> ${permit.status}</p>
              <p><strong>Reason:</strong> ${reason || 'Additional information required'}</p>
            </div>

            <p>Please review the feedback and update your application accordingly. You may need to submit additional documents or correct information.</p>
            
            <p>If you have questions or need clarification, please contact our office.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Update Your Application</a>
          </div>
          <div class="footer">
            <p><strong>Municipality of Janiuay</strong><br>
            Municipal Hall, Janiuay, Iloilo<br>
            Phone: 09811568676 | Email: bplo.janiuay@gmail.com<br>
            Office Hours: Monday-Friday 8:00 AM - 5:00 PM</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
