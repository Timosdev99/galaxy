'use client';

import { motion } from 'framer-motion';
import OrderLink from './orderlink';
import { ShoppingCart, Map, Home, Package } from 'lucide-react';
import { Service } from '../types';

const marketplaceIcons = {
  travel: <Map className="h-10 w-10 text-blue-600" />,
  food: <ShoppingCart className="h-10 w-10 text-indigo-600" />,
  delivery: <Package className="h-10 w-10 text-green-600" />,
  default: <Home className="h-10 w-10 text-purple-600" />
};

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const getMarketplaceIcon = () => {
    if (service.marketplace.slug.includes('travel')) return marketplaceIcons.travel;
    if (service.marketplace.slug.includes('food')) return marketplaceIcons.food;
    if (service.marketplace.slug.includes('delivery')) return marketplaceIcons.delivery;
    return marketplaceIcons.default;
  };

  return (
    <motion.div
      className={`bg-gradient-to-br p-6 sm:p-8 flex flex-col items-center shadow-lg rounde  d-xl h-full transition-all duration-300 hover:shadow-xl`}
      style={{
        background: `linear-gradient(135deg, ${service.marketplace.colorScheme.secondary}20, #ffffff)`
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="flex items-center justify-center mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
        viewport={{ once: true }}
      >
        {getMarketplaceIcon()}
        <div className="flex items-center ml-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {service.marketplace.name}
          </h2>
          <span
            className={`ml-2 h-3 w-3 rounded-full ${
              service.active && service.marketplace.active ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={service.active && service.marketplace.active ? 'Active' : 'Inactive'}
          />
        </div>
      </motion.div>

      <motion.h3
        className="text-xl font-semibold text-gray-800 mb-2 text-center"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
        viewport={{ once: true }}
      >
        {service.name}
      </motion.h3>

      <motion.p
        className="text-center text-base sm:text-lg text-slate-700 mb-4"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
        viewport={{ once: true }}
      >
        {service.description}
      </motion.p>

      <motion.div
        className="mt-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
        viewport={{ once: true }}
      >
        <OrderLink 
          marketplace={service.marketplace.slug} 
          service={service._id} 
          className="w-full flex justify-center py-3 px-6 rounded-lg text-white font-semibold text-base sm:text-lg shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
          style={{ backgroundColor: service.marketplace.colorScheme.primary }}
        />
      </motion.div>
    </motion.div>
  );
}