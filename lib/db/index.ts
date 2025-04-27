import { testMySQLConnection } from './mysql';
import { connectToMongoDB } from './mongodb';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';

// Veritabanı modellerini senkronize et
export async function syncDatabase() {
  try {
    // MySQL tablo senkronizasyonu - User ve ResetToken tabloları
    await User.sync();
    await ResetToken.sync();
    // Not: Product artık MongoDB'de tutulduğu için burada senkronize edilmiyor
    
    console.log('MySQL tabloları senkronize edildi');
  } catch (error) {
    console.error('MySQL tabloları senkronize edilemedi:', error);
  }
}

// Tüm veritabanı bağlantılarını başlat
export async function initDatabases() {
  try {
    // MySQL bağlantısını test et
    const isMySQLConnected = await testMySQLConnection();
    
    if (!isMySQLConnected) {
      console.error('MySQL bağlantısı kurulamadı. Uygulamanızda MySQL gerektiren özellikler çalışmayabilir.');
    }
    
    // MySQL modellerini senkronize et
    await syncDatabase();
    
    // MongoDB bağlantısını kur
    await connectToMongoDB();
    
    console.log('Tüm veritabanı bağlantıları başarıyla kuruldu');
    return true;
  } catch (error) {
    console.error('Veritabanı bağlantıları kurulurken hata oluştu:', error);
    return false;
  }
}
