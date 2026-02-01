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

interface IndividualReadingData {
  customerName: string
  dropPoint: string
  address: string
  tankNumber: string
  capacity: number
  reading: number
  percentage: number
  volume: number
  submittedBy: string
  submittedAt: Date
  notes: string
}

export async function sendIndividualReadingEmail(
  data: IndividualReadingData
): Promise<void> {
  // Recipient (who receives the readings)
  const recipientEmail = process.env.EMAIL_TO || 'vic@elgas.com.au'
  
  await sendEmail({
    to: recipientEmail,
    subject: `New Tank Reading - ${data.customerName} - ${data.dropPoint}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #3b82f6;">New Tank Reading Submitted</h2>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Customer Information</h3>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${data.customerName}</p>
          <p style="margin: 5px 0;"><strong>Drop Point:</strong> ${data.dropPoint}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${data.address}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Tank Details</h3>
          <p style="margin: 5px 0;"><strong>Tank Number:</strong> ${data.tankNumber}</p>
          <p style="margin: 5px 0;"><strong>Capacity:</strong> ${data.capacity}L</p>
          <p style="margin: 5px 0;"><strong>Current Reading:</strong> ${data.reading}L</p>
          <p style="margin: 5px 0;"><strong>Percentage:</strong> ${data.percentage.toFixed(1)}%</p>
          <p style="margin: 5px 0;"><strong>Estimated Volume:</strong> ${data.volume.toFixed(0)}L</p>
        </div>
        
        ${data.notes ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Notes</h3>
            <p style="margin: 5px 0;">${data.notes}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
            <strong>Submitted by:</strong> ${data.submittedBy}
          </p>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
            <strong>Submitted at:</strong> ${data.submittedAt.toLocaleString()}
          </p>
        </div>
        
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email from the LPG Tank Management System.<br>
          This email contains confidential information. If you received this in error, please delete it.
        </p>
      </div>
    `,
  })
}
