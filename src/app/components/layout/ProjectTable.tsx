import { useState } from 'react';
import StatusBadge from './StatusBadge';

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

interface ProjectTableProps {
  isLightMode: boolean;
  orders: Order[];
}

export default function ProjectTable({ isLightMode, orders = [] }: ProjectTableProps) {
  const [selectedStatus, setSelectedStatus] = useState('All');

  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    return `${day}.${month}.${year}`;
  };

  const getProgressWidth = (status: string) => {
    switch(status) {
      case 'completed': return '100%';
      case 'processing': return '75%';
      case 'shipped': return '60%';
      case 'pending': return '30%';
      case 'canceled': return '0%';
      default: return '15%';
    }
  };

  const getProgressColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-600';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-yellow-400';
      case 'pending': return 'bg-gray-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  // Transform status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-sm border border-gray-300`}>
      <div className={`border-b ${isLightMode ? 'border-gray-200' : 'border-gray-700'} p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-3 sm:mb-0`}>Order Progress</h3>
          <div className="w-full sm:w-auto">
            <select 
              className="w-full sm:w-auto bg-gray-200 rounded-lg border border-gray-300 text-black py-2 px-3 text-sm leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${isLightMode ? 'divide-gray-200' : 'divide-gray-700'}`}>
          <thead className={isLightMode ? 'bg-gray-50' : 'bg-gray-800'}>
            <tr>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Order Number
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Category
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Date Placed
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Status
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Progress
              </th>
            </tr>
          </thead>
          <tbody className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} divide-y ${isLightMode ? 'divide-gray-200' : 'divide-gray-700'}`}>
            {orders.length > 0 ? (
              orders
                .filter(order => selectedStatus === 'All' || order.status === selectedStatus)
                .map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{order.orderNumber}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{order.category}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{formatDate(order.placedAt)}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <StatusBadge status={formatStatus(order.status)} />
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(order.status)}`}
                          style={{ width: getProgressWidth(order.status) }}
                        >
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-4 text-center">
                  <div className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>No orders found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}