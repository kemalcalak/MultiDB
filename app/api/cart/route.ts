import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';
import { connectToMongoDB } from '@/lib/db/mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import Cart from '@/models/Cart';

// Sepet içeriğini getir
export async function GET(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    
    try {
      // MongoDB bağlantısı
      await connectToMongoDB();
      
      // Kullanıcının sepetini bul
      let cart = await Cart.findOne({ userId: userId }).lean();
      
      if (!cart) {
        // Sepet bulunamadıysa boş bir sepet döndür
        return NextResponse.json({ 
          cart: { userId, items: [], totalPrice: 0 } 
        });
      }
      
      return NextResponse.json({ cart });
      
    } catch (dbError) {
      console.error('MongoDB bağlantısı başarısız:', dbError);
      return NextResponse.json({ 
        error: 'Veritabanı bağlantısı sağlanamadı',
        cart: { userId, items: [], totalPrice: 0 }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Sepet bilgisi alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Sepet bilgisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Sepete ürün ekle veya güncelle
export async function POST(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const { productId, name, price, quantity, imageUrl } = await req.json();

    // Girdi doğrulama
    if (!productId || !name || !price || !quantity) {
      return NextResponse.json(
        { error: 'Ürün ID, ad, fiyat ve miktar bilgileri gerekli' },
        { status: 400 }
      );
    }

    try {
      // MongoDB bağlantısı
      await connectToMongoDB();

      // Kullanıcının sepetini bul veya oluştur
      let cart = await Cart.findOne({ userId: userId });

      if (!cart) {
        // Sepet yoksa yeni oluştur
        cart = new Cart({
          userId,
          items: [],
          totalPrice: 0
        });
      }

      // Ürün sepette var mı kontrol et
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === productId.toString()
      );

      if (existingItemIndex > -1) {
        // Ürün sepette varsa miktarını güncelle
        cart.items[existingItemIndex].quantity = quantity;
      } else {
        // Ürün sepette yoksa ekle
        cart.items.push({
          productId,
          name,
          price,
          quantity,
          imageUrl: imageUrl || ''
        });
      }

      // Toplam tutarı güncelle
      cart.totalPrice = cart.items.reduce(
        (total: number, item: any) => total + (item.price * item.quantity),
        0
      );

      // Sepeti kaydet
      await cart.save();

      return NextResponse.json({ 
        message: 'Ürün sepete eklendi',
        cart
      });
      
    } catch (dbError) {
      console.error('MongoDB bağlantısı başarısız:', dbError);
      return NextResponse.json({ 
        error: 'Veritabanı bağlantısı sağlanamadı'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Sepete ürün eklenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Sepete ürün eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Sepetten ürün sil
export async function DELETE(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli' },
        { status: 400 }
      );
    }

    try {
      // MongoDB bağlantısı
      await connectToMongoDB();

      // Kullanıcının sepetini bul
      let cart = await Cart.findOne({ userId: userId });

      if (!cart) {
        return NextResponse.json(
          { error: 'Sepet bulunamadı' },
          { status: 404 }
        );
      }

      // Ürünü sepetten çıkar
      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId
      );

      // Toplam tutarı güncelle
      cart.totalPrice = cart.items.reduce(
        (total: number, item: any) => total + (item.price * item.quantity),
        0
      );

      // Sepeti kaydet
      await cart.save();

      return NextResponse.json({ 
        message: 'Ürün sepetten çıkarıldı',
        cart
      });
      
    } catch (dbError) {
      console.error('MongoDB bağlantısı başarısız:', dbError);
      return NextResponse.json({ 
        error: 'Veritabanı bağlantısı sağlanamadı'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Sepetten ürün silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Sepetten ürün silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
