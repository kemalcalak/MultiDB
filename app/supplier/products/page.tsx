"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toast } from 'sonner';
import Image from 'next/image';

// Ürün tipini tanımla
type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
};

// Boş ürün nesnesi
const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  description: '',
  imageUrl: '',
  stock: 0
};

export default function SupplierProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // State tanımlamaları
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentProduct, setCurrentProduct] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Yetkilendirme ve ürün verilerini yükleme
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Kullanıcı rolünü kontrol et
    const userRole = (session.user as any)?.role;
    if (userRole !== 'supplier') {
      toast.error("Yetkisiz Erişim", {
        description: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
      });
      router.push('/');
      return;
    }

    // Ürünleri yükle
    fetchProducts();
  }, [session, status, router]);

  // Düzenleme modunda resim önizlemesi
  useEffect(() => {
    if (editingProduct && editingProduct.imageUrl) {
      setEditImagePreview(editingProduct.imageUrl);
    } else {
      setEditImagePreview('');
    }
  }, [editingProduct]);

  // Ürünleri getirme fonksiyonu
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/supplier/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session!.user as any).token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ürünler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      
      // API yanıtının yapısını kontrol et
      if (data.products && Array.isArray(data.products)) {
        // MongoDB nesnelerini uygun formata dönüştür
        const formattedProducts = data.products.map((product: any) => ({
          id: product._id, // MongoDB'de _id olarak gelir
          name: product.name,
          price: product.price,
          description: product.description,
          imageUrl: product.imageUrl || '',
          stock: product.stock || 0
        }));
        setProducts(formattedProducts);
      } else {
        console.error("API'den gelen veri yapısı beklenen formatta değil:", data);
        setProducts([]);
        toast.error("Veri formatı hatası", {
          description: "Ürünler yüklenirken veri format hatası oluştu",
        });
      }
      
      // Uyarı mesajı varsa göster
      if (data.notice) {
        toast.warning("Bilgi", {
          description: data.notice,
        });
      }
    } catch (error: any) {
      toast.error("Hata", {
        description: error.message || 'Ürünler yüklenirken bir hata oluştu',
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Form input değişikliklerini yönetmek için
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Editlenmekte olan ürün varsa onun state'ini güncelle
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
      });
    } else {
      // Yeni ürün ekleme durumunda
      setCurrentProduct({
        ...currentProduct,
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
      });
    }
  };

  // Resim yükleme işleyicisi
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipini kontrol et
    if (!file.type.match('image.*')) {
      toast.error("Hata", {
        description: "Lütfen geçerli bir resim dosyası seçin (JPEG, PNG, vb.)",
      });
      return;
    }

    // Dosya boyutunu kontrol et (3MB)
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      toast.error("Hata", {
        description: "Resim boyutu 3MB'dan küçük olmalıdır",
      });
      return;
    }

    // Dosyayı base64 formatına dönüştür
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      
      // Önizleme için
      if (isEdit) {
        setEditImagePreview(base64String);
      } else {
        setImagePreview(base64String);
      }
      
      try {
        setIsUploading(true);
        
        // Cloudinary'ye yükle
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session!.user as any).token}`
          },
          body: JSON.stringify({
            image: base64String
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Resim yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        
        // Yüklenen resmin URL'sini ürün bilgilerine ekle
        if (isEdit && editingProduct) {
          setEditingProduct({
            ...editingProduct,
            imageUrl: data.url
          });
        } else {
          setCurrentProduct({
            ...currentProduct,
            imageUrl: data.url
          });
        }
        
        toast.success("Başarılı", {
          description: "Resim başarıyla yüklendi",
        });
      } catch (error: any) {
        toast.error("Hata", {
          description: error.message || 'Resim yüklenirken bir hata oluştu',
        });
        // Hata durumunda önizlemeyi temizle
        if (isEdit) {
          setEditImagePreview(editingProduct?.imageUrl || '');
        } else {
          setImagePreview('');
        }
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Yeni ürün ekleme
  const handleAddProduct = async () => {
    try {
      // Validation
      if (!currentProduct.name || !currentProduct.description || currentProduct.price <= 0) {
        toast.error("Hata", {
          description: "Ürün adı, açıklaması ve fiyatı gereklidir",
        });
        return;
      }
      
      const response = await fetch('/api/supplier/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session!.user as any).token}`
        },
        body: JSON.stringify(currentProduct)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ürün eklenirken bir hata oluştu');
      }

      const data = await response.json();
      
      // API yanıtının yapısını kontrol et ve ürünü doğru formata dönüştür
      if (data.product) {
        const newProduct = {
          id: data.product._id, // MongoDB'de _id olarak gelir
          name: data.product.name,
          price: data.product.price,
          description: data.product.description,
          imageUrl: data.product.imageUrl || '',
          stock: data.product.stock || 0
        };
        
        // Ürün listesini güncelle
        setProducts([...products, newProduct]);
      }
      
      // Formu temizle
      setCurrentProduct(emptyProduct);
      setImagePreview('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Başarı mesajı göster
      toast.success("Başarılı", {
        description: "Ürün başarıyla eklendi",
      });
      
      // Uyarı mesajı varsa göster
      if (data.notice) {
        toast.warning("Bilgi", {
          description: data.notice,
        });
      }
    } catch (error: any) {
      toast.error("Hata", {
        description: error.message || 'Ürün eklenirken bir hata oluştu',
      });
    }
  };

  // Ürün güncelleme
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      // Validation
      if (!editingProduct.name || !editingProduct.description || editingProduct.price <= 0) {
        toast.error("Hata", {
          description: "Ürün adı, açıklaması ve fiyatı gereklidir",
        });
        return;
      }
      
      const response = await fetch('/api/supplier/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session!.user as any).token}`
        },
        body: JSON.stringify({
          ...editingProduct,
          _id: editingProduct.id // Backend'e _id olarak gönder
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ürün güncellenirken bir hata oluştu');
      }

      const data = await response.json();
      
      // API yanıtının yapısını kontrol et
      if (data.product) {
        const updatedProduct = {
          id: data.product._id, // MongoDB'de _id olarak gelir
          name: data.product.name,
          price: data.product.price,
          description: data.product.description,
          imageUrl: data.product.imageUrl || '',
          stock: data.product.stock || 0
        };
        
        // Ürün listesini güncelle
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      }
      
      // Düzenleme modunu kapat
      setEditingProduct(null);
      setEditImagePreview('');
      
      if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
      }
      
      // Başarı mesajı göster
      toast.success("Başarılı", {
        description: "Ürün başarıyla güncellendi",
      });
      
      // Uyarı mesajı varsa göster
      if (data.notice) {
        toast.warning("Bilgi", {
          description: data.notice,
        });
      }
    } catch (error: any) {
      toast.error("Hata", {
        description: error.message || 'Ürün güncellenirken bir hata oluştu',
      });
    }
  };

  // Ürün silme
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    
    try {
      const response = await fetch(`/api/supplier/products?id=${deleteProductId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session!.user as any).token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ürün silinirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      // Ürün listesini güncelle
      setProducts(products.filter(p => p.id !== deleteProductId));
      
      // Silme ID'sini temizle
      setDeleteProductId(null);
      
      // Başarı mesajı göster
      toast.success("Başarılı", {
        description: "Ürün başarıyla silindi",
      });
      
      // Uyarı mesajı varsa göster
      if (data.notice) {
        toast.warning("Bilgi", {
          description: data.notice,
        });
      }
    } catch (error: any) {
      toast.error("Hata", {
        description: error.message || 'Ürün silinirken bir hata oluştu',
      });
    }
  };

  // Kullanıcı yükleniyor veya oturum açmamışsa
  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Tedarikçi Ürün Yönetimi</h1>
      
      {/* Yeni Ürün Ekleme Diyaloğu */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">Yeni Ürün Ekle</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Ürün Ekle</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini doldurun ve ekle butonuna tıklayın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Ürün Adı</Label>
              <Input 
                id="name" 
                name="name" 
                value={currentProduct.name} 
                onChange={handleInputChange} 
                className="col-span-3" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Fiyat</Label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                value={currentProduct.price} 
                onChange={handleInputChange} 
                className="col-span-3" 
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">Stok</Label>
              <Input 
                id="stock" 
                name="stock" 
                type="number" 
                value={currentProduct.stock} 
                onChange={handleInputChange} 
                className="col-span-3" 
                required
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="image" className="text-right pt-2">Ürün Resmi</Label>
              <div className="col-span-3">
                <Input 
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => handleImageChange(e)}
                  disabled={isUploading}
                />
                {isUploading && <p className="text-sm text-amber-500 mt-1">Resim yükleniyor...</p>}
                {imagePreview && (
                  <div className="mt-2 relative w-full h-40">
                    <Image 
                      src={imagePreview} 
                      alt="Ürün önizleme" 
                      fill
                      className="rounded-md object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Açıklama</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={currentProduct.description} 
                onChange={handleInputChange} 
                className="col-span-3" 
                required
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">İptal</Button>
            </DialogClose>
            <Button onClick={handleAddProduct} disabled={isUploading}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ürün Düzenleme Diyaloğu */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ürün Düzenle</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini güncelleyin ve kaydet butonuna tıklayın.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Ürün Adı</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  value={editingProduct.name} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Fiyat</Label>
                <Input 
                  id="edit-price" 
                  name="price" 
                  type="number" 
                  value={editingProduct.price} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">Stok</Label>
                <Input 
                  id="edit-stock" 
                  name="stock" 
                  type="number" 
                  value={editingProduct.stock} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-image" className="text-right pt-2">Ürün Resmi</Label>
                <div className="col-span-3">
                  <Input 
                    id="edit-image" 
                    name="image" 
                    type="file" 
                    accept="image/*"
                    ref={editFileInputRef}
                    onChange={(e) => handleImageChange(e, true)}
                    disabled={isUploading}
                  />
                  {isUploading && <p className="text-sm text-amber-500 mt-1">Resim yükleniyor...</p>}
                  {editImagePreview && (
                    <div className="mt-2 relative w-full h-40">
                      <Image 
                        src={editImagePreview} 
                        alt="Ürün önizleme" 
                        fill
                        className="rounded-md object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">Açıklama</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  value={editingProduct.description} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>İptal</Button>
            <Button onClick={handleUpdateProduct} disabled={isUploading}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ürün Silme Onay Diyaloğu */}
      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu ürün kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Ürün Tablosu */}
      <div className="rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">Ürünler yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center py-12">Henüz ürün bulunmamaktadır.</div>
        ) : (
          <Table>
            <TableCaption>Ürün Listesi</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Resim</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    <div className="relative h-12 w-12">
                      {product.imageUrl ? (
                        <Image 
                          src={product.imageUrl} 
                          alt={product.name}
                          fill
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          Resim Yok
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price.toFixed(2)} TL</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        Düzenle
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setDeleteProductId(product.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Toaster />
    </div>
  );
}

