'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/authContext';
import { fetchService, createOrder } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import OrderForm from '../../components/OrderForm';
import { Service } from '../../types';

export default function OrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const marketplaceSlug = searchParams.get('marketplace');
  const serviceId = searchParams.get('service');

  // Properly type the service state
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!marketplaceSlug || !serviceId) {
      setError('Invalid service parameters');
      setLoading(false);
      return;
    }

    const loadService = async () => {
      try {
        const serviceData = await fetchService(marketplaceSlug, serviceId);
        setService(serviceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [marketplaceSlug, serviceId]);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      const orderData = {
        ...formData,
        marketplace: marketplaceSlug,
        serviceId,
        customerId: user?.id
      };
      await createOrder(orderData);
      setOrderSuccess(true);
      setTimeout(() => router.push('/orders'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!service) return <ErrorMessage message="Service not found" />;
  if (orderSuccess) return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Order Placed Successfully!</h2>
      <p>You will be redirected to your orders page shortly.</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Add null check for service.marketplace */}
        {service.marketplace && (
          <>
            <div 
              className="p-6 text-white"
              style={{ backgroundColor: service.marketplace.colorScheme.primary }}
            >
              <h1 className="text-2xl font-bold">
                Order: {service.name} ({service.marketplace.name})
              </h1>
            </div>

            <div className="p-6 md:p-8">
              <OrderForm 
                formFields={service.orderFormFields} 
                onSubmit={handleSubmit} 
                marketplaceColor={service.marketplace.colorScheme.primary}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}