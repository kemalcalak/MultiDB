import Image from "next/image";
import Link from "next/link";
import { connectToMongoDB } from "@/lib/db/mongodb";
import mongoose from "mongoose";
import AddToCartButton from '@/components/AddToCartButton';

// Ürün tipi tanımı
type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
};

// Ürün şemasını tanımla ve modeli getir
async function getProducts(): Promise<Product[]> {
  try {
    await connectToMongoDB();
    
    // MongoDB modeli
    const ProductSchema = new mongoose.Schema({
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String, required: true },
      imageUrl: { type: String },
      stock: { type: Number, required: true, default: 0 },
      // Diğer alanları ekleyebilirsiniz
    });
    
    // Modeli oluştur veya var olan modeli kullan
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    
    // Ürünleri getir
    const products = await Product.find({}).lean<Product[]>();
    return products;
  } catch (error) {
    console.error('Ürünleri getirirken hata oluştu:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24">
      <div className="mt-8 mb-4">
        <h1 className="text-3xl font-bold">Ürünlerimiz</h1>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Henüz ürün bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {products.map((product) => (
            <div key={product._id} className="border rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative h-48 w-full">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <p className="text-gray-500">Resim yok</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">{product.price.toFixed(2)} TL</span>
                  <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}
                  </span>
                </div>
                <AddToCartButton product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
