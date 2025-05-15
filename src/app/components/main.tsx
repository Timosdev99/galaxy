'use client';

import { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import NoServices from '../components/NoServices';
import { fetchMarketplaces } from '../services/api';
import { Marketplace, Service } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { motion } from 'framer-motion';
import SignupModal from './signup';
import { useAuth } from '../context/authContext';
import UserProfile from './userProfile';
import { Ghost } from 'lucide-react';
import GhostMarket from './placehold';

export default function Mainpage() {
    const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, token, user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!isAuthenticated || !token) {
                    setLoading(false);
                    return;
                }

                setLoading(true);
                const data = await fetchMarketplaces(token);
                setMarketplaces(data || []); // Ensure we never set undefined
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load services');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, token]);

    // Safely flatten services from all marketplaces
    const allServices = marketplaces.flatMap((mp) => 
        mp.services?.map((s: any) => ({
            ...s,
            marketplace: mp
        })) || []
    );

    // Filter only active services from active marketplaces
    const activeServices = allServices.filter(
        (service) => service.active && service.marketplace?.active
    );

    if (!isAuthenticated) {
        return <GhostMarket />;
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <header className="bg-white sticky top-0 z-50 py-5 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <div className="flex items-center">
                            <Ghost className="h-8 w-8 text-blue-500 mr-3" />
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                GhostMarket
                            </h1>
                        </div>
                        
                        <div className="sm:flex items-center space-x-4">
                            {isAuthenticated ? (
                                <UserProfile />
                            ) : (
                                <SignupModal />
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <motion.div 
                className="bg-gradient-to-r from-amber-100 to-amber-200 border-y border-amber-300 py-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex-1">
                    <motion.p 
                        className="text-xl text-center font-bold text-amber-800"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Our Telegram Channels were recently shut down. We are building a new platform from scratch to give users an easier, more reliable experience when using our services.
                    </motion.p>
                </div>             
            </motion.div>
        
            <div className="container mx-auto px-4 py-12 sm:py-16">
                <motion.div 
                    className="text-center max-w-3xl mx-auto mb-12"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <motion.h2 
                        className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Your One-Stop Solution for Discounted Services
                    </motion.h2>
                    <motion.p 
                        className="text-lg text-gray-600"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        Explore the world with Galaxy - your gateway to unforgettable adventures and seamless travel experience
                    </motion.p>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {activeServices.length > 0 ? (
                        activeServices.map((service, index) => (
                            <ServiceCard key={service._id} service={service} index={index} />
                        ))
                    ) : (
                        <NoServices />
                    )}
                </div>
            </div>
            
            <motion.div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12 sm:py-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.h2 
                        className="text-2xl sm:text-3xl font-bold text-white mb-4"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Ready to Start Saving?
                    </motion.h2>
                    <motion.p 
                        className="text-blue-100 text-lg mb-6"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        Join thousands of satisfied customers who are saving money every day.
                    </motion.p>
                </div>
            </motion.div>
            
            <footer className="bg-gray-900 text-white py-10">
                <div className="container mx-auto px-4">
                    <motion.div 
                        className="border-t border-gray-800 mt-8 pt-6 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-gray-400">&copy; {new Date().getFullYear()} GhostMarket. All rights reserved.</p>
                    </motion.div>
                </div>
            </footer>
        </div>
    );
}