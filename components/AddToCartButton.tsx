'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
}

// Client component - Sepete Ekle butonu
export default function AddToCartButton({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  
  const addToCart = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setIsAdding(true);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Ürün sepete eklenemedi');
      }
      
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      toast.error('Ürün sepete eklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <Button 
      onClick={addToCart} 
      className="w-full mt-2" 
      disabled={isAdding || product.stock <= 0}
    >
      {isAdding ? 'Ekleniyor...' : 'Sepete Ekle'}
    </Button>
  );
}
