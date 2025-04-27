import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToMongoDB } from '@/lib/db/mongodb';
import { authOptions } from '../auth/[...nextauth]/route';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import { sendEmail } from '@/lib/email';

// Sipariş oluştur
export async function POST(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const userName = (session.user as any).name || 'Değerli Müşterimiz';
    const userEmail = (session.user as any).email;
    
    // Gelen veriyi al
    const { items, totalPrice, shippingCost } = await req.json();

    // Girdi doğrulama
    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'Sepet boş olamaz' },
        { status: 400 }
      );
    }

    try {
      // MongoDB bağlantısı
      await connectToMongoDB();
      
      // Stok kontrolü için gereken ürün ID'leri
      const productIds = items.map((item: any) => item.productId);
      
      // MongoDB'den ürün modeli (dynamic import)
      const { default: Product } = await import('@/models/Product');
      
      // Stok kontrolü için ürünleri getir
      const products = await Product.find({
        _id: { $in: productIds }
      });
      
      // Stok kontrol et
      const stockProblems = [];
      for (const item of items) {
        const product = products.find((p: any) => 
          p._id.toString() === item.productId.toString()
        );
        
        if (!product) {
          stockProblems.push(`Ürün bulunamadı: ${item.name}`);
          continue;
        }
        
        if (product.stock < item.quantity) {
          stockProblems.push(
            `${item.name} için yeterli stok yok. Mevcut: ${product.stock}, İstenen: ${item.quantity}`
          );
        }
      }
      
      // Stok problemi varsa hata döndür
      if (stockProblems.length > 0) {
        return NextResponse.json(
          { error: 'Stok problemi', problems: stockProblems },
          { status: 400 }
        );
      }
      
      // Stok güncellemesi
      for (const item of items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }
      
      // Teslimat adresi (gerçek uygulamada kullanıcı adresinden alınabilir)
      const shippingAddress = {
        address: "Örnek Adres",
        city: "İstanbul",
        postalCode: "34000",
        country: "Türkiye"
      };
      
      // Sipariş oluştur
      const order = await Order.create({
        userId,
        orderItems: items,
        shippingAddress,
        paymentMethod: "Kredi Kartı",
        totalPrice,
        isPaid: true,
        paidAt: Date.now(),
        isDelivered: false
      });
      
      // Sepeti temizle
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [], totalPrice: 0 } }
      );
      
      // Sipariş onay e-postası gönder
      await sendOrderConfirmationEmail(
        userEmail,
        userName,
        order._id.toString(),
        items,
        totalPrice,
        shippingCost
      );
      
      return NextResponse.json({
        message: 'Sipariş başarıyla oluşturuldu',
        order
      });
      
    } catch (dbError: any) {
      console.error('Veritabanı işlemi sırasında hata:', dbError);
      return NextResponse.json({ 
        error: dbError.message || 'Veritabanı işlemi sırasında bir hata oluştu'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Sipariş oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: error.message || 'Sipariş oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Sipariş onay e-postası gönderme fonksiyonu
async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string,
  items: any[],
  totalPrice: number,
  shippingCost: number
) {
  // Ürün listesi HTML'i oluştur
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} TL</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} TL</td>
    </tr>
  `).join('');

  const emailOptions = {
    to: email,
    subject: `Siparişiniz Alındı - Sipariş #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center; padding: 20px 0; border-bottom: 2px solid #eee;">Siparişiniz Alındı</h1>
        <p style="margin-bottom: 20px;">Merhaba ${name},</p>
        <p style="margin-bottom: 20px;">Siparişiniz başarıyla alındı. Aşağıda sipariş detaylarınızı bulabilirsiniz.</p>
        
        <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <p><strong>Sipariş Numarası:</strong> #${orderId}</p>
          <p><strong>Sipariş Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        
        <h2 style="color: #333; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Sipariş Detayları</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 12px; text-align: left;">Ürün</th>
              <th style="padding: 12px; text-align: center;">Adet</th>
              <th style="padding: 12px; text-align: right;">Birim Fiyat</th>
              <th style="padding: 12px; text-align: right;">Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Ara Toplam:</strong></td>
              <td style="padding: 10px; text-align: right;">${(totalPrice - shippingCost).toFixed(2)} TL</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Kargo:</strong></td>
              <td style="padding: 10px; text-align: right;">${shippingCost > 0 ? shippingCost.toFixed(2) + ' TL' : 'Ücretsiz'}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #eee;"><strong>Toplam:</strong></td>
              <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #eee;">${totalPrice.toFixed(2)} TL</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px; color: #666;">Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.</p>
        <p style="margin-bottom: 30px; color: #666;">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
        
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #999;">
          <p>© ${new Date().getFullYear()} E-Ticaret Mağazamız. Tüm hakları saklıdır.</p>
        </div>
      </div>
    `
  };

  return sendEmail(emailOptions);
}
