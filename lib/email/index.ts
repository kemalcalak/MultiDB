// Email gönderme servisi
// Not: Bu basitleştirilmiş bir örnek, gerçek uygulamada bir SMTP servisi kullanılmalıdır (NodeMailer, SendGrid vb.)

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Email gönderme fonksiyonu
 * Gerçek uygulamada bu fonksiyon bir SMTP servisi kullanmalıdır
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Geliştirme amaçlı konsola yazdırma
    console.log('==========================================');
    console.log('EMAİL GÖNDERİLİYOR');
    console.log('------------------------------------------');
    console.log(`Alıcı: ${options.to}`);
    console.log(`Konu: ${options.subject}`);
    console.log('------------------------------------------');
    console.log(options.html || options.text);
    console.log('==========================================');
    
    // Gerçek uygulamada SMTP servisi çağrılacak
    // Örnek: await nodemailer.sendMail(options);
    
    return true;
  } catch (error) {
    console.error('Email gönderilemedi:', error);
    return false;
  }
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
  };

  return sendEmail(options);
}
