import nodemailer from 'nodemailer';

// Create SMTP transporter
export const createSMTPTransporter = (smtpConfig) => {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.smtpHost,
      port: parseInt(smtpConfig.smtpPort),
      secure: parseInt(smtpConfig.smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpConfig.smtpUser,
        pass: smtpConfig.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    return transporter;
  } catch (error) {
    console.error('Error creating SMTP transporter:', error);
    throw new Error('Failed to create SMTP transporter');
  }
};

// Test SMTP connection
export const testSMTPConnection = async (smtpConfig) => {
  try {
    const transporter = createSMTPTransporter(smtpConfig);
    
    // Verify connection
    await transporter.verify();
    
    return {
      success: true,
      message: 'SMTP connection successful'
    };
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return {
      success: false,
      message: error.message || 'SMTP connection failed'
    };
  }
};

// Send test email
export const sendTestEmail = async (smtpConfig, testEmailData) => {
  try {
    const transporter = createSMTPTransporter(smtpConfig);
    
    const mailOptions = {
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: testEmailData.email,
      subject: 'SMTP Test Email - Rayzor Industrial Packaging Pvt Ltd',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8CC63F;">SMTP Test Email</h2>
          <p><strong>From:</strong> ${smtpConfig.fromName}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #F0F9E8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8CC63F;">
            ${testEmailData.message}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is a test email sent from Rayzor Industrial Packaging Pvt Ltd admin panel to verify SMTP configuration.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: Rayzor Industrial Packaging Pvt Ltd Admin Panel
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send test email'
    };
  }
};
