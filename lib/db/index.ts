import { testMySQLConnection } from './mysql';
import { connectToMongoDB } from './mongodb';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken'; // ResetToken modelini import et

// Veritabanı modellerini senkronize et
export async function syncDatabase() {
  try {
    // MySQL tablo senkronizasyonu - User ve ResetToken tabloları
    await User.sync();
    await ResetToken.sync();
    
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
