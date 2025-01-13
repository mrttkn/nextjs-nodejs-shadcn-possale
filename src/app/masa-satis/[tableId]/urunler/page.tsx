'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { orderStore } from '@/lib/store';
import { PaymentModal } from '@/components/ui/payment-modal';

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

interface Table {
  DineInTableID: number;
  DineInTableText: string;
}

export default function UrunlerPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const { tableId } = params;
  const [products, setProducts] = useState<MenuItem[]>([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [tableInfo, setTableInfo] = useState<Table | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data);
          // İlk grup ID'sini seç
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
        // setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Sayfa yüklendiğinde mevcut siparişleri yükle
  useEffect(() => {
    const tableIdNumber = parseInt(tableId);
    if (orderStore.hasOrder(tableIdNumber)) {
      const existingOrders = orderStore.getTableOrders(tableIdNumber);
      setCart(existingOrders.map(order => ({
        ...order,
        MenuGroupID: products.find(p => p.MenuItemKey === order.MenuItemKey)?.MenuGroupID || 0,
        MenuGroupText: products.find(p => p.MenuItemKey === order.MenuItemKey)?.MenuGroupText || ''
      })));
    }
  }, [tableId, products]);

  // Masa bilgisini al
  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const response = await fetch(`/api/tables/${tableId}`);
        const data = await response.json();
        if (data.success) {
          setTableInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching table info:', error);
      }
    };

    fetchTableInfo();
  }, [tableId]);

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
        item.MenuItemKey === menuItemKey ? { ...item, quantity } : item
      )
    );
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '0.00';
    return price.toFixed(2);
  };

  const handleCompleteOrder = () => {
    const tableIdNumber = parseInt(tableId);
    // Siparişi hafızaya kaydet
    orderStore.addOrder(tableIdNumber, cart);
    // Masalar sayfasına dön
    router.push('/masa-satis');
  };

  const handlePayment = (method: 'cash' | 'credit', amount: number) => {
    const tableIdNumber = parseInt(tableId);
    // Ödemeyi store'a kaydet
    orderStore.addPayment(tableIdNumber, amount);
    setIsPaymentModalOpen(false);
    
    // Eğer toplam tutar tamamen ödendiyse siparişi tamamla
    const totalPaid = orderStore.getTablePayments(tableIdNumber);
    if (totalPaid >= totalAmount) {
      handleCompleteOrder();
    }
  };

  const totalAmount = cart.reduce((total, item) => 
    total + ((item.DefaultUnitPrice || 0) * item.quantity), 0
  );

  // if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="page-container h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link href="/masa-satis" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {tableInfo ? `Ürünler - ${tableInfo.DineInTableText}` : `Ürünler - Masa ${tableId}`}
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
                  
                  {/* Ödeme Durumu */}
                  {orderStore.getTablePayments(parseInt(tableId)) > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Ödenen:</span>
                        <span>{formatPrice(orderStore.getTablePayments(parseInt(tableId)))} ₺</span>
                      </div>
                      <div className="flex justify-between text-blue-600 font-medium">
                        <span>Kalan:</span>
                        <span>
                          {formatPrice(totalAmount - orderStore.getTablePayments(parseInt(tableId)))} ₺
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Button 
                    className="w-full"
                    onClick={handleCompleteOrder}
                  >
                    Siparişi Tamamla
                  </Button>
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
        paidAmount={orderStore.getTablePayments(parseInt(tableId))}
      />
    </div>
  );
} 