// Paket satış bilgilerini tutacak store
interface CustomerInfo {
  name: string;
  phone: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  neighborhoodId: string;
  neighborhoodName: string;
  street: string;
  buildingNo: string;
  apartmentNo: string;
  notes: string;
  streetId: string;
}

let customerInfo: CustomerInfo | null = null;

export const packageStore = {
  setCustomerInfo: (info: CustomerInfo) => {
    customerInfo = info;
  },
  getCustomerInfo: () => customerInfo,
  clearCustomerInfo: () => {
    customerInfo = null;
  }
}; 