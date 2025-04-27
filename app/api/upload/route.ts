import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Base64 resim yükleme için API
export async function POST(req: NextRequest) {
  try {
    // Yalnızca tedarikçiler için erişimi sınırla
    const middlewareResponse = await authMiddleware(req, ['supplier']);
    
    if (middlewareResponse.status && middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Resim dosyası bulunamadı' },
        { status: 400 }
      );
    }

    // Base64 formatında resmi Cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        image,
        {
          folder: 'ecommerce/products', 
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Resim boyutlarını sınırla
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return NextResponse.json({
      message: 'Resim başarıyla yüklendi',
      url: (result as any).secure_url,
      public_id: (result as any).public_id
    });
    
  } catch (error: any) {
    console.error('Resim yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Resim yükleme sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
