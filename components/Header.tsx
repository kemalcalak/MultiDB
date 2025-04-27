"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  return (
    <nav className="w-full bg-white shadow p-4 flex justify-between gap-4">
        <Link href="/">
            <h1 className="cursor-pointer">AKC - TEK - EU</h1>
        </Link>
      {!session ? (
        <>
          <Link href="/auth/login" className="text-blue-600 hover:underline">Giriş Yap</Link>
          <Link href="/auth/register" className="text-blue-600 hover:underline">Kayıt Ol</Link>
        </>
      ) : (
        <div className="flex gap-4 items-center">
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
