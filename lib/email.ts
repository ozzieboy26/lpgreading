import nodemailer from 'nodemailer'
import { Attachment } from 'nodemailer/lib/mailer'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: Attachment[]
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    })

    console.log(`Email sent successfully to ${options.to}`)
  } catch (error) {
    console.error('Email sending error:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendTankReadingEmail(
  excelBuffer: Buffer,
  fileName: string,
  emailTo?: string
): Promise<void> {
  // Recipient (who receives the readings)
  const recipientEmail = emailTo || process.env.EMAIL_TO || 'vic@elgas.com.au'
  // Sender (who sends the readings - telemetry system)
  const senderEmail = process.env.EMAIL_FROM || 'telemetry@lpgreadings.au'
  
  await sendEmail({
    to: recipientEmail,
    subject: `LPG Tank Readings - ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #3b82f6;">LPG Tank Readings Report</h2>
        <p>Please find attached the tank readings report.</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p>This is an automated email from the LPG Tank Management System.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This email contains confidential information. If you received this in error, please delete it.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: excelBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  })
}
