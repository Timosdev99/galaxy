'use client';

import { useState } from 'react';
import { FormField } from '../types';

interface OrderFormProps {
  formFields: FormField[];
  onSubmit: (data: any) => void;
  marketplaceColor: string;
}

export default function OrderForm({ formFields, onSubmit, marketplaceColor }: OrderFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [shippingData, setShippingData] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    contactPhone: ''
  });

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleShippingChange = (fieldName: string, value: string) => {
    setShippingData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      shipping: shippingData
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {formFields.map((field, index) => (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData[field.label] || ''}
                onChange={(e) => handleChange(field.label, e.target.value)}
                required={field.required}
              />
            )}

            {field.type === 'select' && (
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData[field.label] || ''}
                onChange={(e) => handleChange(field.label, e.target.value)}
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options?.map((option, i) => (
                  <option key={i} value={option}>{option}</option>
                ))}
              </select>
            )}

            {/* Add other field types as needed */}
          </div>
        ))}

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={shippingData.address}
                onChange={(e) => handleShippingChange('address', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={shippingData.city}
                onChange={(e) => handleShippingChange('city', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={shippingData.state}
                onChange={(e) => handleShippingChange('state', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={shippingData.postalCode}
                onChange={(e) => handleShippingChange('postalCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="px-6 py-3 rounded-md text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: marketplaceColor }}
          >
            Place Order
          </button>
        </div>
      </div>
    </form>
  );
}