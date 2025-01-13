// Aktif siparişleri tutacak basit bir store
const activeOrders = new Set<number>();

// Masa başına siparişleri tutacak map
const tableOrders = new Map<number, Array<{
  MenuItemKey: string;
  MenuItemText: string;
  DefaultUnitPrice: number | null;
  quantity: number;
}>>();

// Masa başına ödemeleri tutacak map
const tablePayments = new Map<number, number>();

export const orderStore = {
  addOrder: (tableId: number, items: Array<{
    MenuItemKey: string;
    MenuItemText: string;
    DefaultUnitPrice: number | null;
    quantity: number;
  }>) => {
    activeOrders.add(tableId);
    tableOrders.set(tableId, items);
  },
  removeOrder: (tableId: number) => {
    activeOrders.delete(tableId);
    tableOrders.delete(tableId);
    tablePayments.delete(tableId);
  },
  hasOrder: (tableId: number) => {
    return activeOrders.has(tableId);
  },
  getTableOrders: (tableId: number) => {
    return tableOrders.get(tableId) || [];
  },
  getAllOrders: () => {
    return Array.from(activeOrders);
  },
  // Yeni eklenen metodlar
  addPayment: (tableId: number, amount: number) => {
    const currentPayment = tablePayments.get(tableId) || 0;
    tablePayments.set(tableId, currentPayment + amount);
  },
  getTablePayments: (tableId: number) => {
    return tablePayments.get(tableId) || 0;
  },
  // Yeni metod: Masanın toplam tutarını hesapla
  getTableTotal: (tableId: number) => {
    const orders = tableOrders.get(tableId) || [];
    return orders.reduce((total, item) => 
      total + ((item.DefaultUnitPrice || 0) * item.quantity), 0
    );
  },
  // Yeni metod: Masanın ödemesi tamamlandı mı?
  isTableFullyPaid: (tableId: number) => {
    const totalAmount = orderStore.getTableTotal(tableId);
    const paidAmount = tablePayments.get(tableId) || 0;
    return paidAmount >= totalAmount;
  }
}; 