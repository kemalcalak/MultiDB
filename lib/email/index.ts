import nodemailer from 'nodemailer'


interface EmailOptions {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
  return true
}

/**
 * Şifre sıfırlama e-postası gönderme
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  userName: string
): Promise<boolean> {
  const options: EmailOptions = {
    to: email,
    subject: 'Şifre Sıfırlama İsteği',
    html: `
      <h1>Şifre Sıfırlama</h1>
      <p>Merhaba ${userName},</p>
      <p>Hesabınız için bir şifre sıfırlama isteğinde bulundunuz.</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${resetLink}" target="_blank">Şifremi Sıfırla</a>
      <p>Bu bağlantı 1 saat süreyle geçerlidir.</p>
      <p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
      <p>İyi günler,</p>
      <p>E-Ticaret Ekibi</p>
    `,
  }

  return sendEmail(options)
}
