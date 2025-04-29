"use client"

import React, { useState, useEffect } from "react";
import { X, Home, ShoppingCart, Check, ArrowLeft, Plus, Trash2, CreditCard, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth,  } from '../../context/authContext'; 

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface CreateOrder {
  customerId: string;
  marketplace: "GalaxyService" | "studio43" ;
  category: string;
  items: OrderItem[];
  paymentMethod: "E-transfer" | "Shake Pay"  | "paypal" ;
  totalAmount: number;
  tax?: number;
  shippingCost?: number;
  discount?: number;
  shipping: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPhone: string;
  };
  notes?: string;
}

 function OrderContent() {
  const searchParams = useSearchParams();
  const initialMarketplace = searchParams.get("marketplace") || "GalaxyService";
  const { token, user } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState<OrderItem>({
    name: "",
    price: 0,
    quantity: 1,
    discount: 0
  });


  const marketplaceCategories = {
    GalaxyService: ["Flights", "Hotels", "Car Rentals", "Fines/Tickets", "International Travel"],
    studio43: ["DoorDash Food Delivery", "Walmart Groceries", "Clothing", "Amazon"],
    NorthernEats: ["DoorDash Food Delivery", "Walmart", "Refunds", "eBay"]
  };
  

  const [orderData, setOrderData] = useState<CreateOrder>({
    customerId: "",
    marketplace: initialMarketplace as "GalaxyService" | "studio43" ,
    category: "",
    items: [],
    paymentMethod: "E-transfer",
    totalAmount: 0,
    tax: 0,
    shippingCost: 0,
    discount: 0,
    shipping: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      contactPhone: ""
    },
    notes: ""
  });

  useEffect(() => {
    setOrderData(prev => ({
      ...prev,
      marketplace: initialMarketplace as "GalaxyService" | "studio43" ,
      category: "",
      customerId: user?.id || "" 
    }));
  }, [initialMarketplace, user?.id]);

  useEffect(() => {
    let itemsTotal = orderItems.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      // Apply 50% discount to each item
      const itemDiscount = itemTotal * 0.5;
      return sum + (itemTotal - itemDiscount);
    }, 0);
  
    const totalBeforeDiscount = itemsTotal + (orderData.tax || 0) + (orderData.shippingCost || 0);
    // No need for order-level discount since it's applied to items
    const finalTotal = totalBeforeDiscount;
    
    setOrderData(prev => ({
      ...prev,
      items: orderItems,
      totalAmount: finalTotal > 0 ? finalTotal : 0,
      discount: itemsTotal * 0.5 // Set discount to 50% of items total for display
    }));
  }, [orderItems, orderData.tax, orderData.shippingCost]);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    
    if (name === "marketplace") {
      
      setOrderData({
        ...orderData,
        marketplace: value,
        category: "" 
      });
    } else if (name.startsWith("shipping.")) {
      const shippingField = name.split(".")[1];
      setOrderData({
        ...orderData,
        shipping: {
          ...orderData.shipping,
          [shippingField]: value
        }
      });
    } else {
      setOrderData({
        ...orderData,
        [name]: value
      });
    }
  };

  const handleNumberInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setOrderData({
      ...orderData,
      [name]: numValue
    });
  };

  const handleNewItemChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    const updatedValue = name === "price" || name === "quantity" || name === "discount" 
      ? parseFloat(value) || 0 
      : value;
    
    setNewItem({
      ...newItem,
      [name]: updatedValue
    });
  };

 const addOrderItem = () => {
  if (!newItem.name || newItem.price <= 0) {
    setError("Please fill out required item fields");
    return;
  }
  
  
  const itemTotal = newItem.price * newItem.quantity;
  const discountAmount = itemTotal * 0.5;
  
  setOrderItems([...orderItems, { 
    ...newItem,
    discount: discountAmount 
  }]);
  
  setNewItem({
    name: "",
    price: 0,
    quantity: 1,
    discount: 0
  });
  setError("");
};

  const removeOrderItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (orderItems.length === 0) {
      setError("Please add at least one item to the order");
      setLoading(false);
      return;
    }

    try {
      
      const response = await fetch("https://api.ghostmarket.net/order/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setOrderItems([]);
        setOrderData({
          customerId: "",
          marketplace: initialMarketplace as "GalaxyService" | "studio43" ,
          category: "",
          items: [],
          paymentMethod: "E-transfer",
          totalAmount: 0,
          tax: 0,
          shippingCost: 0,
          discount: 0,
          shipping: {
            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            contactPhone: ""
          },
          notes: ""
        });
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getMarketplaceColor = () => {
    switch(orderData.marketplace) {
      case "GalaxyService": return "bg-indigo-700";
      case "studio43": return "bg-emerald-700";
     // case "NorthernEats": return "bg-amber-700";
      default: return "bg-indigo-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className={`${getMarketplaceColor()} text-white p-6 flex items-center justify-between`}>
            <div className="flex items-center">
              <ShoppingCart className="mr-3" size={28} />
              <h1 className="text-2xl md:text-3xl font-bold">Create New Order</h1>
            </div>
            <Link href="/" className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-2 rounded-md transition-colors">
              <Home size={18} className="mr-1" />
              <span>Home</span>
            </Link>
          </div>

          {success && (
  <div className="mx-6 mt-6 p-6 bg-green-50 border border-green-200 rounded-lg shadow-sm">
    <div className="flex items-center">
      <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
        <Check className="h-6 w-6 text-green-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-green-800">Order Created Successfully!</h3>
        <p className="mt-1 text-sm text-green-700">Your order has been submitted and is now being processed.</p>
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-green-200">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-green-700">Order Total:</span>
        <span className="font-bold text-green-800">${orderData.totalAmount.toFixed(2)}</span>
      </div>
      <div className="mt-3">
        <button 
          className={`w-full ${getMarketplaceColor()} text-white py-2 px-4 rounded-md flex items-center justify-center`}
          onClick={() => setSuccess(false)}
        >
          <Check className="mr-2" size={16} />
          Continue
        </button>
      </div>
    </div>
  </div>
)}

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 text-red-800 rounded-md border-l-4 border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <CreditCard className="mr-2 text-indigo-600" size={20} />
                Order Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Customer ID 
                  </label>
                  <input
                    type="text"
                    value={orderData.customerId}
                    placeholder={user?.id}
                    disabled
                    className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Marketplace 
                  </label>
                  <select
                    name="marketplace"
                    value={orderData.marketplace}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  >
                    <option value="GalaxyService">Galaxy Service</option>
                    <option value="studio43">Studio 43</option>
                    {/* <option value="NorthernEats">Nothern Eats</option> */}
                  </select>
                </div>

                <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Category 
  </label>
  <select
    name="category"
    value={orderData.category}
    onChange={handleInputChange}
    required
    className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
  >
    <option value="" disabled>Select a category</option>
    {marketplaceCategories[orderData.marketplace] && marketplaceCategories[orderData.marketplace].map((category, index) => (
      <option key={index} value={category}>
        {category}
      </option>
    ))}
  </select>
</div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Method 
                  </label>
                  <select
                    name="paymentMethod"
                    value={orderData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  >
                    <option value="E-transfer">E-transfer</option>
                    <option value="Shake pay">Shake Pay</option>
                    {/* <option value="credit">Bitcoin</option>
                    <option value="debit">Ethereum</option> */}
                    <option value="paypal">PayPal</option>
                    {/* <option value="crypto">Credit Card</option> */}
                  </select>
                </div>  
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <ShoppingCart className="mr-2 text-indigo-600" size={20} />
                Order Items
              </h2>
              
              <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-md font-medium text-slate-700 mb-3">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                 
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={newItem.name}
                      onChange={handleNewItemChange}
                      placeholder="Product Name "
                      className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="price"
                      value={newItem.price || ""}
                      onChange={handleNewItemChange}
                      placeholder="Price "
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="quantity"
                      value={newItem.quantity}
                      onChange={handleNewItemChange}
                      placeholder="Quantity"
                      min="1"
                      className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                                  <input
                    type="number"
                    name="discount"
                    value={orderData.discount || ""}
                    placeholder="50% discount"
                    disabled
                    className="w-full p-3 pl-8 border border-slate-300 text-slate-900 bg-slate-50 rounded-md shadow-sm"
                  />
                    <button
                      type="button"
                      onClick={addOrderItem}
                      className={`${getMarketplaceColor()} text-white px-4 py-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {orderItems.length > 0 ? (
                <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            ${item.discount ? item.discount.toFixed(2) : "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            ${((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center justify-end w-full"
                            >
                              <Trash2 size={16} className="mr-1" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 bg-white rounded-lg border border-dashed border-slate-300 text-slate-500">
                  <ShoppingCart size={24} className="mr-2 opacity-50" />
                  <p>No items added yet. Add your first item above.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Truck className="mr-2 text-indigo-600" size={20} />
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address 
                    </label>
                    <input
                      type="text"
                      name="shipping.address"
                      value={orderData.shipping.address}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        City 
                      </label>
                      <input
                        type="text"
                        name="shipping.city"
                        value={orderData.shipping.city}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        State/Province 
                      </label>
                      <input
                        type="text"
                        name="shipping.state"
                        value={orderData.shipping.state}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Country 
                      </label>
                      <input
                        type="text"
                        name="shipping.country"
                        value={orderData.shipping.country}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Postal Code 
                      </label>
                      <input
                        type="text"
                        name="shipping.postalCode"
                        value={orderData.shipping.postalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Phone 
                    </label>
                    <input
                      type="text"
                      name="shipping.contactPhone"
                      value={orderData.shipping.contactPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <CreditCard className="mr-2 text-indigo-600" size={20} />
                  Additional Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tax
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                        <input
                          type="number"
                          name="tax"
                          value={orderData.tax || ""}
                          onChange={handleNumberInputChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full p-3 pl-8 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Shipping Cost
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                        <input
                          type="number"
                          name="shippingCost"
                          value={orderData.shippingCost || ""}
                          onChange={handleNumberInputChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full p-3 pl-8 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Order Discount
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                      <input
                        type="number"
                        name="discount"
                        value={orderData.discount || ""}
                        onChange={handleNumberInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full p-3 pl-8 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={orderData.notes || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      placeholder="Add any additional notes about this order..."
                    ></textarea>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between font-medium text-lg items-center">
                      <span className="text-slate-700">Total Amount:</span>
                      <span className={`text-xl font-bold ${getMarketplaceColor().replace('bg-', 'text-')}`}>
                        ${orderData.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-slate-200">
              <Link
                href="/"
                className="mr-4 px-5 py-3 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center"
              >
                <ArrowLeft size={18} className="mr-2" />
                Cancel
              </Link>
              <button
                type="submit"
                className={`${getMarketplaceColor()} px-6 py-3 text-white rounded-md hover:opacity-90 transition-opacity flex items-center font-medium shadow-sm`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Create Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <OrderContent />
  );
}