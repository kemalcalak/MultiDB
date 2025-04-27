'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Trash2, Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sepet bileşeni
export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    fetchCart();
  }, [session, status, router]);

  // Sepet verilerini getir
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/cart', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.cart) {
        setCart(data.cart);
      } else {
        toast.error('Sepet bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Sepet bilgileri alınırken hata oluştu:', error);
      toast.error('Sepet bilgileri alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // Ürün miktarını güncelle
  const updateQuantity = async (productId: string, name: string, price: number, newQuantity: number, imageUrl: string) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(productId);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          name,
          price,
          quantity: newQuantity,
          imageUrl
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      } else {
        toast.error('Ürün miktarı güncellenemedi');
      }
    } catch (error) {
      console.error('Ürün miktarı güncellenirken hata oluştu:', error);
      toast.error('Ürün miktarı güncellenemedi');
    } finally {
      setIsUpdating(null);
    }
  };

  // Ürünü sepetten kaldır
  const removeFromCart = async (productId: string) => {
    try {
      setIsUpdating(productId);
      
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        toast.success('Ürün sepetten kaldırıldı');
      } else {
        toast.error('Ürün sepetten kaldırılamadı');
      }
    } catch (error) {
      console.error('Ürün sepetten kaldırılırken hata oluştu:', error);
      toast.error('Ürün sepetten kaldırılamadı');
    } finally {
      setIsUpdating(null);
    }
  };

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-500" />
        <p className="mt-2">Sepet yükleniyor...</p>
      </div>
    );
  }

  // Sepet boş durumu
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Sepetiniz</h1>
        <p className="text-gray-500 mb-6">Sepetinizde ürün bulunmamaktadır.</p>
        <Link href="/">
          <Button>Alışverişe Devam Et</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Sepetiniz</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sepet ürünleri listesi */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {cart.items.map((item: any) => (
              <div 
                key={item.productId} 
                className="flex border-b last:border-b-0 p-4"
              >
                {/* Ürün resmi */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="bg-gray-200 w-24 h-24 flex items-center justify-center rounded">
                      <span className="text-gray-500 text-xs">Resim yok</span>
                    </div>
                  )}
                </div>
                
                {/* Ürün bilgileri */}
                <div className="flex-grow ml-4">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">Birim Fiyat: {item.price.toFixed(2)} TL</p>
                  
                  {/* Miktar ve işlemler */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(
                          item.productId, 
                          item.name, 
                          item.price, 
                          item.quantity - 1, 
                          item.imageUrl
                        )}
                        disabled={isUpdating === item.productId || item.quantity <= 1}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      
                      <span className="mx-2">{item.quantity}</span>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(
                          item.productId, 
                          item.name, 
                          item.price, 
                          item.quantity + 1, 
                          item.imageUrl
                        )}
                        disabled={isUpdating === item.productId}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Toplam fiyat ve silme butonu */}
                    <div className="flex items-center">
                      <span className="font-medium mr-4">
                        {(item.price * item.quantity).toFixed(2)} TL
                      </span>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFromCart(item.productId)}
                        disabled={isUpdating === item.productId}
                        className="text-red-500 hover:text-red-700"
                      >
                        {isUpdating === item.productId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sepet özeti */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4">Sipariş Özeti</h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{cart.totalPrice.toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo:</span>
                <span>{cart.totalPrice > 150 ? 'Ücretsiz' : '29.90 TL'}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Toplam:</span>
                  <span>
                    {cart.totalPrice > 150 
                      ? cart.totalPrice.toFixed(2) 
                      : (cart.totalPrice + 29.90).toFixed(2)
                    } TL
                  </span>
                </div>
              </div>
            </div>
            
            <Button className="w-full">Siparişi Tamamla</Button>
            
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
