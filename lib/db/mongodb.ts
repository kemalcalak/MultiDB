import mongoose from 'mongoose';

// .env'den MongoDB bağlantı URL'ini al
const MONGODB_URI = process.env.MONGODB_CONNECT || '';

// MongoDB Bağlantı
export async function connectToMongoDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    if (!MONGODB_URI) {
      throw new Error('MongoDB bağlantı URL\'i tanımlanmamış!');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarıyla kuruldu');
  } catch (error) {
    console.error('MongoDB bağlantısı kurulamadı:', error);
    throw error;
  }
}

export default mongoose;
