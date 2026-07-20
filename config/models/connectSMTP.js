import nodemailer from 'nodemailer';

// Cache of pooled transporters keyed by unique SMTP config so repeated
// identical configs reuse a single pooled connection instead of leaking
// a new SMTP socket per call.
const transporterCache = new Map();

// Create SMTP transporter
export const createSMTPTransporter = (smtpConfig) => {
  try {
    const host = smtpConfig.smtpHost;
    const port = parseInt(smtpConfig.smtpPort);
    const user = smtpConfig.smtpUser?.trim();
    // Gmail displays app passwords as "abcd efgh ijkl mnop" but the SMTP
    // server only accepts them without the spaces.
    const pass = smtpConfig.smtpPassword?.replace(/\s+/g, '');

    const cacheKey = `${host}:${port}:${user}`;

    // Reuse an existing pooled transporter for this exact config.
    const cached = transporterCache.get(cacheKey);
    if (cached && cached.pass === pass) {
      return cached.transporter;
    }

    // If the config changed for this key (e.g. rotated password), close the
    // stale transporter before creating a new one.
    if (cached) {
      try {
        cached.transporter.close();
      } catch (closeError) {
        console.error('Error closing stale SMTP transporter:', closeError);
      }
      transporterCache.delete(cacheKey);
    }

    // Validate certificates by default. Only relax verification when the
    // operator explicitly opts in for self-signed dev servers.
    const allowInsecureTls = process.env.SMTP_ALLOW_INSECURE_TLS === 'true';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      pool: true, // reuse a pool of connections
      auth: {
        user,
        pass,
      },
      ...(allowInsecureTls
        ? { tls: { rejectUnauthorized: false } }
        : {}),
    });

    transporterCache.set(cacheKey, { transporter, pass });

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
      subject: `SMTP Test Email - ${smtpConfig.fromName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #221E1F 0%, #26A8E0 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">SMTP Test Email</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p><strong>From:</strong> ${smtpConfig.fromName}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #26A8E0;">
              ${testEmailData.message}
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This is a test email sent from the admin panel to verify SMTP configuration.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              Sent at: ${new Date().toLocaleString()}<br>
              From: ${smtpConfig.fromName} Admin Panel
            </p>
          </div>
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
