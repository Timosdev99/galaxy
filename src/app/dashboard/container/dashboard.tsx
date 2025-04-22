"use client"

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'next/navigation';
import { Ticket, Package, Percent } from 'lucide-react';
import DashboardLayout from '../../components/layout/dashboardLayout';
import StatCard from '../../components/layout/StatCard';
import ProjectTable from '../../components/layout/ProjectTable';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  _id: string;
}

interface Payment {
  method: string;
  amount: number;
  currency: string;
  status: string;
  _id: string;
}

interface Shipping {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactPhone: string;
  _id: string;
}

interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  customerId: string;
  marketplace: string;
  category: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  tax: number;
  shippingCost: number;
  discount: number;
  finalAmount: number;
  placedAt: string;
  payment: Payment;
  shipping: Shipping;
  notes: string;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  isRefundEligible: boolean;
  isDigitalService: boolean;
  isPhysicalProduct: boolean;
  isFood: boolean;
}

interface OrdersResponse {
  message: string;
  orders: Order[];
}

export default function Dashboard() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [orderData, setOrderData] = useState<OrdersResponse>({ message: '', orders: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/');
    }
  }, [isAuthenticated, token, router]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`https://galaxy-backend-imkz.onrender.com/order/v1/orders/customer/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data: OrdersResponse = await response.json();
        setOrderData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Calculate stat metrics
  const pendingOrders = orderData.orders?.filter(order => order.status === 'pending').length || 0;
  const totalOrders = orderData.orders?.length || 0;
  const totalRevenue = orderData.orders?.reduce((sum, order) => sum + order.finalAmount, 0).toFixed(2) || 0;

  // Add console logs for debugging
  console.log("Auth state:", { isAuthenticated, hasToken: !!token, hasUser: !!user });
  console.log("Order data:", { totalOrders, pendingOrders, hasError: !!error });

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8">
          <h2 className={`text-xl sm:text-2xl font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'} mb-3 sm:mb-0`}>Overview</h2>
          <div>
            <select 
              className="bg-gray-200 rounded-lg border border-gray-300 text-black py-2 px-3 sm:py-3 sm:px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
              defaultValue="Last 30 days"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading order data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error loading orders: {error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard 
                title="Open Tickets"
                value={pendingOrders.toString()}
                subtitle={`/${totalOrders} total`}
                trend="info"
                trendValue="Pending"
                icon={Ticket}
                iconText="Waiting for processing"
                isLightMode={isLightMode}
              />
              
              <StatCard 
                title="Total Orders"
                value={totalOrders.toString()}
                subtitle="/100 target"
                trend={totalOrders > 50 ? "up" : "steady"}
                trendValue={totalOrders > 50 ? "On track" : "Building"}
                icon={Package}
                iconText={`$${totalRevenue} cost`}
                isLightMode={isLightMode}
              />
              
              <StatCard 
                title="Discount Tier"
                value="15%"
                subtitle="standard discount"
                trend="premium"
                trendValue="Premium"
                icon={Percent}
                iconText="Up to 25% on bulk orders"
                isLightMode={isLightMode}
              />
            </div>

            <ProjectTable 
              isLightMode={isLightMode}
              orders={orderData.orders} 
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}