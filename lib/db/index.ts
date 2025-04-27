import { testMySQLConnection } from './mysql';
import { connectToMongoDB } from './mongodb';
import User from '@/models/User';

// Veritabanı modellerini senkronize et
export async function syncDatabase() {
  try {
    // MySQL tablo senkronizasyonu - sadece User tablosu
    await User.sync();
    
    console.log('MySQL tabloları senkronize edildi');
  } catch (error) {
    console.error('MySQL tabloları senkronize edilemedi:', error);
  }
}

// Tüm veritabanı bağlantılarını başlat
export async function initDatabases() {
  try {
    // MySQL bağlantısını test et
    const mysqlConnected = await testMySQLConnection();
    
    if (mysqlConnected) {
      await syncDatabase();
    }
    
    // MongoDB'ye bağlan
    await connectToMongoDB();
    
    return {
      mysqlConnected,
      mongoConnected: true,
    };
  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
    return {
      mysqlConnected: false,
      mongoConnected: false,
    };
  }
}
