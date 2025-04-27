'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CartIcon() {
  const { data: session } = useSession();
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      // Sepet bilgilerini getir
      fetchCartData();
    } else {
      setItemCount(0);
      setIsLoading(false);
    }
  }, [session]);

  const fetchCartData = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.items) {
          // Sepetteki toplam ürün sayısını hesapla
          const count = data.cart.items.reduce(
            (total: number, item: any) => total + item.quantity, 
            0
          );
          setItemCount(count);
        }
      }
    } catch (error) {
      console.error('Sepet bilgileri alınırken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <ShoppingCart className="h-6 w-6 text-gray-600" />
      </div>
    );
  }

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-gray-900 transition-colors" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white rounded-full min-w-[1.25rem] text-xs"
        >
          {itemCount}
        </Badge>
      )}
    </Link>
  );
}
