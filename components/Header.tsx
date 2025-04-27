"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Sepet bilgilerini getirmek için useEffect
  useEffect(() => {
    if (session) {
      fetchCartData();
    } else {
      setCartItemCount(0);
    }
  }, [session]);
  
  // Sepet verilerini al
  const fetchCartData = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.items) {
            // Define interfaces for cart data
            interface CartItem {
            quantity: number;
            [key: string]: any; // For other properties the item might have
            }
            
            interface Cart {
            items: CartItem[];
            [key: string]: any; // For other properties the cart might have
            }
            
            interface CartResponse {
            cart: Cart;
            [key: string]: any; // For other properties in the response
            }
            
            const count: number = (data as CartResponse).cart.items.reduce(
            (total: number, item: CartItem) => total + item.quantity, 
            0
            );
          setCartItemCount(count);
        }
      }
    } catch (error) {
      console.error('Sepet bilgileri alınamadı:', error);
    }
  };

  return (
    <nav className="w-full bg-white shadow p-4 flex justify-between gap-4">
        <Link href="/">
            <h1 className="cursor-pointer">AKC - TEK - EU</h1>
        </Link>
      {!session ? (
        <div className="flex gap-4 items-center">
          {/* Sepet ikonu - giriş yapmamış kullanıcılar için */}
          <Link href="/cart" className="relative flex items-center">
            <ShoppingCart className="w-5 h-5 text-blue-600 hover:text-blue-800" />
          </Link>
          <Link href="/auth/login" className="text-blue-600 hover:underline">Giriş Yap</Link>
          <Link href="/auth/register" className="text-blue-600 hover:underline">Kayıt Ol</Link>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
            {/* Sepet ikonu - giriş yapmış kullanıcılar için */}
            <Link href="/cart" className="relative flex items-center">
              <ShoppingCart className="w-5 h-5 text-blue-600 hover:text-blue-800" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {session.user?.role === "supplier" && (
              <Link href="/supplier/products" className="text-blue-600 hover:underline">Ürünlerim</Link>
            )}
            <Link href="/profile" className="text-blue-600 hover:underline">Profil</Link>
          <button
            onClick={() => signOut()}
            className="text-red-600 hover:underline"
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </nav>
  );
}
