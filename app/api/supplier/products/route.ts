import { NextRequest, NextResponse } from 'next/server';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: string;
    } & DefaultSession['user'];
  }
}
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { connectToMongoDB } from '@/lib/db/mongodb';

// Dummy veri - MongoDB bağlantısı kurulamazsa örnek ürün verileri
const sampleProducts = [
  {
    _id: '1',
    name: 'Örnek Ürün 1',
    description: 'MongoDB bağlantısı kurulamadığı için gösterilen örnek ürün.',
    price: 99.99,
    imageUrl: 'https://via.placeholder.com/150',
    stock: 10,
    category: 'Örnek',
    features: ['Özellik 1', 'Özellik 2'],
    ratings: [],
    averageRating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Örnek Ürün 2',
    description: 'MongoDB Atlas IP izinlerini yapılandırmanız gerekiyor.',
    price: 149.99,
    imageUrl: 'https://via.placeholder.com/150',
    stock: 5,
    category: 'Örnek',
    features: ['Özellik 1', 'Özellik 2'],
    ratings: [],
    averageRating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// MongoDB ürün modelini doğrudan import etmek yerine buradan erişiyoruz
// Bu yaklaşım MongoDB bağlantı sorunlarını önler
async function getMongoProduct(useDummyData = false) {
  if (useDummyData) {
    console.log('MongoDB bağlantısı atlanıyor, örnek veri kullanılıyor');
    // Örnek verileri kullanmak için sahte model oluştur
    return {
      find: () => ({
        lean: () => Promise.resolve(sampleProducts)
      }),
      create: (data: any) => Promise.resolve({...data, _id: Math.random().toString(36).substr(2, 9)})
    };
  }
  
  try {
    await connectToMongoDB();
    // Model zaten tanımlanmışsa onu kullan, yoksa oluştur
    const ProductSchema = new mongoose.Schema(
      {
        name: {
          type: String,
          required: [true, 'Ürün adı gereklidir'],
          trim: true,
        },
        price: {
          type: Number,
          required: [true, 'Ürün fiyatı gereklidir'],
          min: [0, 'Fiyat negatif olamaz'],
        },
        description: {
          type: String,
          required: [true, 'Ürün açıklaması gereklidir'],
        },
        imageUrl: {
          type: String,
          required: false,
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
        },
        category: {
          type: String,
          required: false,
        },
        features: {
          type: [String],
          default: [],
        },
        ratings: {
          type: Array,
          default: [],
        },
        averageRating: {
          type: Number,
          default: 0,
        },
      },
      {
        timestamps: true,
      }
    );
    
    return mongoose.models.Product || mongoose.model('Product', ProductSchema);
  } catch (error) {
    console.error('MongoDB modeli alınamadı:', error);
    console.log('Örnek veri kullanılıyor...');
    
    // Hata durumunda örnek verileri kullan
    return {
      find: () => ({
        lean: () => Promise.resolve(sampleProducts)
      }),
      create: (data: any) => Promise.resolve({...data, _id: Math.random().toString(36).substr(2, 9)})
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // Kullanıcının supplier olup olmadığını kontrol et
    if (session.user?.role !== 'supplier') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    try {
      // MongoDB ürün modelini almayı dene
      const Product = await getMongoProduct();
      // MongoDB sorgu yöntemini kullan
      const products = await Product.find({}).lean();
      
      return NextResponse.json({ 
        products, 
        notice: products === sampleProducts ? 'MongoDB bağlantısı kurulamadı. Örnek veriler gösteriliyor. MongoDB Atlas IP izinlerini kontrol edin.' : undefined 
      }, { status: 200 });
    } catch (dbError) {
      console.error('MongoDB bağlantısı başarısız, örnek veriler kullanılıyor:', dbError);
      
      // Örnek verileri kullan
      return NextResponse.json({ 
        products: sampleProducts,
        notice: 'MongoDB bağlantısı kurulamadı. Örnek veriler gösteriliyor. MongoDB Atlas IP izinlerini kontrol edin.'
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Ürünleri getirirken hata oluştu:', error);
    return NextResponse.json(
      { 
        error: 'Ürünler alınırken bir hata oluştu',
        products: sampleProducts,
        notice: 'Hata oluştu. Örnek veriler gösteriliyor.'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // Kullanıcının supplier olup olmadığını kontrol et
    if (session.user?.role !== 'supplier') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Gelen veriyi al
    const body = await req.json();
    
    try {
      // MongoDB ürün modelini almayı dene
      const Product = await getMongoProduct();
      // Yeni ürün oluştur
      const newProduct = await Product.create(body);
      
      return NextResponse.json({ 
        product: newProduct,
        notice: newProduct._id && typeof newProduct._id === 'string' && newProduct._id.length < 10 ? 
          'MongoDB bağlantısı kurulamadı. Ürün sadece geçici olarak oluşturuldu. MongoDB Atlas IP izinlerini kontrol edin.' : undefined
      }, { status: 201 });
    } catch (dbError) {
      console.error('MongoDB bağlantısı başarısız, işlem simüle ediliyor:', dbError);
      
      // Simüle edilmiş işlem
      const dummyProduct = {...body, _id: Math.random().toString(36).substr(2, 9), createdAt: new Date(), updatedAt: new Date()};
      
      return NextResponse.json({ 
        product: dummyProduct,
        notice: 'MongoDB bağlantısı kurulamadı. Ürün sadece geçici olarak oluşturuldu. MongoDB Atlas IP izinlerini kontrol edin.' 
      }, { status: 201 });
    }
    
  } catch (error) {
    console.error('Ürün eklerken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Ürün eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
