import { Sequelize } from 'sequelize';

// .env'den MySQL bağlantı bilgilerini al
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'ecommerce',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'password',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

// Bağlantıyı test eden fonksiyon
export async function testMySQLConnection() {
  try {
    await sequelize.authenticate();
    console.log('MySQL bağlantısı başarıyla kuruldu.');
    return true;
  } catch (error) {
    console.error('MySQL bağlantısı kurulamadı:', error);
    return false;
  }
}

export default sequelize;
