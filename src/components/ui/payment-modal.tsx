import React, { useState } from 'react';
import { Button } from './button';
import { X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (method: 'cash' | 'credit', amount: number) => void;
  totalAmount: number;
  paidAmount: number;
}

export function PaymentModal({ isOpen, onClose, onPayment, totalAmount, paidAmount }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'credit' | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const remainingAmount = totalAmount - paidAmount;

  if (!isOpen) return null;

  const handlePayment = () => {
    if (!selectedMethod || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > remainingAmount) return;
    onPayment(selectedMethod, amount);
    setSelectedMethod(null);
    setPaymentAmount('');
  };

  const handleQuickPayment = (method: 'cash' | 'credit', amount: number) => {
    onPayment(method, amount);
    setSelectedMethod(null);
    setPaymentAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Ödeme Yöntemi Seçin</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="text-center space-y-2">
            <div className="text-xl font-bold">
              Toplam Tutar: {totalAmount.toFixed(2)} ₺
            </div>
            {paidAmount > 0 && (
              <div className="text-green-600">
                Ödenen: {paidAmount.toFixed(2)} ₺
              </div>
            )}
            <div className="text-blue-600 font-semibold">
              Kalan: {remainingAmount.toFixed(2)} ₺
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Nakit Ödeme Bölümü */}
          <div className="space-y-2">
            <h3 className="font-semibold">Nakit Ödeme</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                onClick={() => handleQuickPayment('cash', remainingAmount)}
                className="h-12"
              >
                {remainingAmount.toFixed(2)} ₺
              </Button>
              <Button 
                variant={selectedMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('cash')}
                className="h-12"
              >
                Farklı Tutar
              </Button>
            </div>
          </div>

          {/* Kredi Kartı Ödeme Bölümü */}
          <div className="space-y-2">
            <h3 className="font-semibold">Kredi Kartı</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                onClick={() => handleQuickPayment('credit', remainingAmount)}
                className="h-12"
              >
                {remainingAmount.toFixed(2)} ₺
              </Button>
              <Button 
                variant={selectedMethod === 'credit' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('credit')}
                className="h-12"
              >
                Farklı Tutar
              </Button>
            </div>
          </div>
        </div>

        {selectedMethod && (
          <div className="mt-4">
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Ödeme tutarını girin"
              className="w-full p-3 border rounded mb-4"
              step="0.01"
              min="0"
              max={remainingAmount}
            />
            <Button 
              className="w-full"
              onClick={handlePayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount}
            >
              Ödemeyi Tamamla
            </Button>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={onClose}
        >
          İptal
        </Button>
      </div>
    </div>
  );
} 