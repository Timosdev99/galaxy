import { Marketplace, Service } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://galaxy-backend-imkz.onrender.com';

export async function fetchMarketplaces(token: string): Promise<Marketplace[]> {
    const res = await fetch(`${API_BASE_URL}/marketplace`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch marketplaces');
    }
    
    const data = await res.json();
    return data.marketplaces;
}


export async function fetchService(marketplaceId: string, serviceId: string): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/services/${serviceId}?marketplace=${marketplaceId}`);
  if (!res.ok) throw new Error('Failed to fetch service');
  return res.json();
}

export async function createOrder(orderData: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}