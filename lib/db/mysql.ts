import { Sequelize } from 'sequelize';

// .env'den MySQL bağlantı bilgilerini al
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'ecommerce',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    dialectModule: require('mysql2'), // mysql2 modülünü açıkça belirt
    dialectOptions: {
      connectTimeout: 60000, // Bağlantı zaman aşımı (ms)
      // SSL kullanmak istiyorsanız aşağıdaki satırı etkinleştirin
      // ssl: { rejectUnauthorized: false }
    },
    pool: {
      max: 5, // Maksimum bağlantı sayısı
      min: 0, // Minimum bağlantı sayısı
      acquire: 30000, // Bağlantı için beklenecek maksimum süre (ms)
      idle: 10000 // Bir bağlantının boşta kalabileceği maksimum süre (ms)
    },
    retry: {
      match: [/Deadlock/i, /ER_ACCESS_DENIED_ERROR/], // Yeniden denenecek hatalar
      max: 3 // Maksimum deneme sayısı
    }
  }
);

// Bağlantıyı test eden fonksiyon
export async function testMySQLConnection() {
  try {
    await sequelize.authenticate();
    console.log('MySQL bağlantısı başarıyla kuruldu.');
    return true;
  } catch (error: any) {
    console.error('MySQL bağlantısı kurulamadı:', error);
    
    // Özel hata mesajları
    if (error.name === 'SequelizeAccessDeniedError') {
      console.error('Kullanıcı adı veya şifre yanlış. .env dosyasındaki MYSQL_USER ve MYSQL_PASSWORD değerlerini kontrol edin.');
    } else if (error.name === 'SequelizeConnectionRefusedError') {
      console.error('MySQL sunucusuna bağlanılamadı. MySQL servisi çalışıyor mu? MYSQL_HOST değerini kontrol edin.');
    } else if (error.name === 'SequelizeHostNotFoundError') {
      console.error('MySQL sunucusu bulunamadı. MYSQL_HOST değerini kontrol edin.');
    } else if (error.name === 'SequelizeConnectionError') {
      console.error('Bağlantı hatası: MySQL sunucunuz çalışıyor ve erişilebilir mi?');
    }
    
    return false;
  }
}

export default sequelize;
