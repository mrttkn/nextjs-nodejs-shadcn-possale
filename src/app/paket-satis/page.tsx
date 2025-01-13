'use client';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GoogleMaps } from "@/components/ui/google-maps";
import { packageStore } from '@/lib/packageStore';

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

interface AddressOption {
  id: string;
  name: string;
}

export default function PaketSatis() {
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    cityId: '',
    cityName: '',
    districtId: '',
    districtName: '',
    neighborhoodId: '',
    neighborhoodName: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    notes: '',
    streetId: ''
  });

  const [cities, setCities] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<AddressOption[]>([]);
  const [streets, setStreets] = useState<AddressOption[]>([]);

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/address/cities');
        const data = await response.json();
        if (data.success) {
          setCities(data.data.map((city: { ilId: number; ilAdi: string }) => ({
            id: city.ilId.toString(),
            name: city.ilAdi
          })));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!customerInfo.cityId) {
        setDistricts([]);
        return;
      }

      try {
        const response = await fetch(`/api/address/districts/${customerInfo.cityId}`);
        const data = await response.json();
        if (data.success) {
          setDistricts(data.data.map((district: { ilce_id?: string; id?: string; ilce_adi?: string; name?: string }) => ({
            id: district.ilce_id || district.id || String(Math.random()),
            name: district.ilce_adi || district.name || 'Bilinmeyen İlçe'
          })));
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };

    fetchDistricts();
  }, [customerInfo.cityId]);

  // Mahalleleri yükle
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!customerInfo.cityId || !customerInfo.districtId) {
        setNeighborhoods([]);
        return;
      }

      try {
        const districtParam = `${customerInfo.cityId}_${customerInfo.districtId}`;
        const response = await fetch(`/api/address/neighborhoods/${encodeURIComponent(districtParam)}`);
        const data = await response.json();
        if (data.success) {
          setNeighborhoods(data.data);
        }
      } catch (error) {
        console.error('Error fetching neighborhoods:', error);
      }
    };

    fetchNeighborhoods();
  }, [customerInfo.cityId, customerInfo.districtId]);

  // Sokakları yükle
  useEffect(() => {
    const fetchStreets = async () => {
      if (!customerInfo.cityId || !customerInfo.neighborhoodName) {
        setStreets([]);
        return;
      }

      try {
        const streetParam = `${customerInfo.cityId}_${customerInfo.neighborhoodName}`;
        console.log('Fetching streets with params:', streetParam);
        
        const response = await fetch(`/api/address/streets/${encodeURIComponent(streetParam)}`);
        const data = await response.json();
        
        if (!data.success) {
          console.error('Street API Error:', data.error);
          return;
        }
        
        setStreets(data.data);
      } catch (error) {
        console.error('Error fetching streets:', error);
      }
    };

    fetchStreets();
  }, [customerInfo.cityId, customerInfo.neighborhoodName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => {
      const updates: Partial<CustomerInfo> = { [name]: value };
      
      // İl değiştiğinde ilçe ve mahalle bilgilerini sıfırla
      if (name === 'cityId') {
        const selectedCity = cities.find(city => city.id === value);
        updates.cityName = selectedCity?.name || '';
        updates.districtId = '';
        updates.districtName = '';
        updates.neighborhoodId = '';
        updates.neighborhoodName = '';
      }
      
      // İlçe değiştiğinde mahalle bilgilerini sıfırla
      if (name === 'districtId') {
        const selectedDistrict = districts.find(district => district.id === value);
        updates.districtName = selectedDistrict?.name || '';
        updates.neighborhoodId = '';
        updates.neighborhoodName = '';
      }

      // Mahalle seçildiğinde sokak bilgilerini sıfırla
      if (name === 'neighborhoodId') {
        const selectedNeighborhood = neighborhoods.find(neighborhood => neighborhood.id === value);
        updates.neighborhoodName = selectedNeighborhood?.name || '';
        updates.streetId = '';
        updates.street = '';
      }

      // Sokak seçildiğinde
      if (name === 'streetId') {
        const selectedStreet = streets.find(street => street.id === value);
        updates.street = selectedStreet?.name || '';
      }

      return { ...prev, ...updates };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Müşteri bilgilerini store'a kaydet
    packageStore.setCustomerInfo(customerInfo);
    // Ürünler sayfasına yönlendir
    router.push('/paket-satis/urunler');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold">Paket Sipariş</h1>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ad Soyad*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Telefon*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    İl*
                  </label>
                  <select
                    name="cityId"
                    value={customerInfo.cityId}
                    onChange={handleChange}
                    className="w-full p-3 border rounded"
                    required
                  >
                    <option key="default-city" value="">Seçiniz</option>
                    {cities.map(city => (
                      <option key={`city-${city.id}`} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    İlçe*
                  </label>
                  <select
                    name="districtId"
                    value={customerInfo.districtId}
                    onChange={handleChange}
                    className="w-full p-3 border rounded"
                    required
                    disabled={!customerInfo.cityId}
                  >
                    <option key="default-district" value="">Seçiniz</option>
                    {districts.map(district => (
                      <option key={`district-${district.id}`} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mahalle*
                  </label>
                  <select
                    name="neighborhoodId"
                    value={customerInfo.neighborhoodId}
                    onChange={handleChange}
                    className="w-full p-3 border rounded"
                    required
                    disabled={!customerInfo.districtId}
                  >
                    <option key="default-neighborhood" value="">Seçiniz</option>
                    {neighborhoods.map(neighborhood => (
                      <option key={`neighborhood-${neighborhood.id}`} value={neighborhood.id}>
                        {neighborhood.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Sokak*
                  </label>
                  <select
                    name="streetId"
                    value={customerInfo.streetId}
                    onChange={handleChange}
                    className="w-full p-3 border rounded"
                    required
                    disabled={!customerInfo.neighborhoodId}
                  >
                    <option value="">Seçiniz</option>
                    {streets.map(street => (
                      <option key={`street-${street.id}`} value={street.id}>
                        {street.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bina No*
                  </label>
                  <input
                    type="text"
                    name="buildingNo"
                    value={customerInfo.buildingNo}
                    onChange={handleChange}
                    className="w-full p-3 border rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Daire No
                </label>
                <input
                  type="text"
                  name="apartmentNo"
                  value={customerInfo.apartmentNo}
                  onChange={handleChange}
                  className="w-full p-3 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notlar
                </label>
                <textarea
                  name="notes"
                  value={customerInfo.notes}
                  onChange={handleChange}
                  className="w-full p-3 border rounded h-24"
                  placeholder="Varsa özel istekler, talimatlar..."
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                style={{ backgroundColor: '#22c55e', color: 'white' }}
              >
                Devam Et
              </Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Teslimat Konumu</h2>
            <GoogleMaps
              address={{
                city: customerInfo.cityName,
                district: customerInfo.districtName,
                neighborhood: customerInfo.neighborhoodName,
                street: customerInfo.street
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 