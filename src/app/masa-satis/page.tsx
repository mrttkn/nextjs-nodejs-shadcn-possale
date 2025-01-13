'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { PasswordModal } from '@/components/ui/password-modal';
import { orderStore } from '@/lib/store';
import Link from 'next/link';

interface Table {
  DineInTableID: number;
  DineInTableText: string;
}

export default function MasaSatis() {
  const router = useRouter();
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/tables');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }
        
        setTables(data.data);
      } catch (error) {
        setError('Masalar yüklenirken bir hata oluştu');
        console.error('Error fetching tables:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await fetch('/api/auth/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success && data.isValid) {
        // Şifre doğruysa yeni sayfaya yönlendir
        router.push(`/masa-satis/${selectedTable?.DineInTableID}/urunler`);
      } else {
        alert('Geçersiz şifre!');
      }
    } catch (error) {
      console.error('Password check error:', error);
      alert('Bir hata oluştu!');
    } finally {
      setIsModalOpen(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="page-container">
  //       <div className="flex items-center justify-center min-h-[200px]">
  //         Yükleniyor...
  //       </div>
  //     </div>
  //   );
  // }

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
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Masa Satış</h1>
        <div className="w-[100px]"></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {tables.map((table) => (
          <Button
            key={table.DineInTableID}
            className={`p-6 h-auto ${
              orderStore.hasOrder(table.DineInTableID) && !orderStore.isTableFullyPaid(table.DineInTableID) 
                ? 'bg-red-500 hover:bg-red-600' 
                : ''
            }`}
            onClick={() => handleTableClick(table)}
          >
            {table.DineInTableText}
          </Button>
        ))}
      </div>
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
} 