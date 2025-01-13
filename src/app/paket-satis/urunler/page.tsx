'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PaymentModal } from '@/components/ui/payment-modal';
import { packageStore } from '@/lib/packageStore';

interface MenuItem {
  MenuItemKey: string;
  MenuItemText: string;
  DefaultUnitPrice: number | null;
  MenuGroupID: number;
  MenuGroupText: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function PaketSatisUrunler() {
  const router = useRouter();
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const customerInfo = packageStore.getCustomerInfo();

  useEffect(() => {
    if (!customerInfo) {
      router.push('/paket-satis');
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data);
          if (data.data.length > 0) {
            setSelectedGroupId(data.data[0].MenuGroupID);
          }
        } else {
          setError('Ürünler yüklenirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Ürünler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  const groups = React.useMemo(() => {
    const uniqueGroups = new Map();
    products.forEach(product => {
      if (!uniqueGroups.has(product.MenuGroupID)) {
        uniqueGroups.set(product.MenuGroupID, {
          MenuGroupID: product.MenuGroupID,
          MenuGroupText: product.MenuGroupText
        });
      }
    });
    return Array.from(uniqueGroups.values());
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(product => product.MenuGroupID === selectedGroupId);
  }, [products, selectedGroupId]);

  const addToCart = (product: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.MenuItemKey === product.MenuItemKey);
      if (existingItem) {
        return prevCart.map(item =>
          item.MenuItemKey === product.MenuItemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemKey: string) => {
    setCart(prevCart => prevCart.filter(item => item.MenuItemKey !== menuItemKey));
  };

  const updateQuantity = (menuItemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemKey);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.MenuItemKey === menuItemKey
          ? { ...item, quantity }
          : item
      )
    );
  };

  const totalAmount = cart.reduce((sum, item) => {
    return sum + (item.DefaultUnitPrice || 0) * item.quantity;
  }, 0);

  const handlePayment = async () => {
    // Ödeme işlemleri burada yapılacak
    setIsPaymentModalOpen(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[200px]">
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link href="/paket-satis" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          Paket Sipariş - {customerInfo?.name}
        </h1>
        <div className="w-[100px]"></div>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Sol Panel - Gruplar */}
        <div className="w-1/4 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Ürün Grupları</h2>
          <div className="flex flex-col gap-2">
            {groups.map(group => (
              <Button
                key={group.MenuGroupID}
                variant={selectedGroupId === group.MenuGroupID ? "default" : "outline"}
                onClick={() => setSelectedGroupId(group.MenuGroupID)}
                className="justify-start"
              >
                {group.MenuGroupText}
              </Button>
            ))}
          </div>
        </div>

        {/* Orta Panel - Ürünler */}
        <div className="flex-1 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Ürünler</h2>
          <div className="grid grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <Button
                key={product.MenuItemKey}
                variant="outline"
                onClick={() => addToCart(product)}
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span>{product.MenuItemText}</span>
                <span className="text-sm">{formatPrice(product.DefaultUnitPrice)} ₺</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sağ Panel - Sepet */}
        <div className="w-1/4 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Sepet</h2>
          <div className="flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.MenuItemKey} className="flex flex-col gap-2 bg-white p-3 rounded">
                <div className="flex justify-between">
                  <span>{item.MenuItemText}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.MenuItemKey)}
                  >
                    X
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateQuantity(item.MenuItemKey, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      size="sm"
                      onClick={() => updateQuantity(item.MenuItemKey, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <span>{formatPrice((item.DefaultUnitPrice || 0) * item.quantity)} ₺</span>
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <div className="mt-auto">
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam:</span>
                    <span>{formatPrice(totalAmount)} ₺</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Button 
                    className="w-full"
                    variant="secondary"
                    onClick={() => setIsPaymentModalOpen(true)}
                    style={{ backgroundColor: '#22c55e', color: 'white' }}
                  >
                    Ödeme Yap
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPayment={handlePayment}
        totalAmount={totalAmount}
        paidAmount={0}
      />
    </div>
  );
}

const formatPrice = (price: number | null) => {
  if (price === null) return "0.00";
  return price.toFixed(2);
}; 