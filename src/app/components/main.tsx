"use client"

import React from 'react';
import { ArrowRight, Map, ShoppingCart, Home, Phone, Mail } from 'lucide-react';
import SignupModal from './signup';
import { motion } from "framer-motion";
import OrderLink from './orderlink';

const servicesData = [
    {
        head: "GalaxyServices",  
        icon: <Map className="h-10 w-10 text-blue-600" />,  
        description1: "If you have travel plans coming up, let us know, our team of experts can help you save upto 50%.",
        description2: "We offer up to 50% off on the following services:",
        buttons: ["Flights", "Hotels", "Car Rentals", "Fines/Tickets", "and more"],
        finalDescription: "We specialize in Canada / USA but we may be able to offer discounts on international destinations as well. Connect with a member of our team to find out.",
        cta: "Click here to place an order"
    },
    {
        head: "Studio43",
        icon: <ShoppingCart className="h-10 w-10 text-indigo-600" />,  
        description1: "Feeling hungry? Need food or clothes? Let us give you a hand",
        description2: "We offer up to 50% off on the following services:",
        buttons: ["DoorDash Food Delivery", "Walmart Groceries", "Clothing", "Amazon"],
        cta: "Click here to place an order"
    },
    {
        head: "NorthernEats",
        icon: <Home className="h-10 w-10 text-purple-600" />,  
        description1: "We are the kings of the north!",
        description2: "We offer up to 50% off on the following services:",
        buttons: ["DoorDash Food Delivery", "Walmart", "Refunds", "eBay"],
        cta: "Click here to place an order"
    }
];

const ServiceCard = ({ service, index }: any) => {
    const gradients = [
        "from-blue-50 to-white",
        "from-indigo-50 to-white",
        "from-purple-50 to-white"
    ];

    return (
        <motion.div 
            className={`bg-gradient-to-br ${gradients[index % 3]} p-6 sm:p-8 flex flex-col items-center shadow-lg rounded-xl h-full transition-all duration-300 hover:shadow-xl`}
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
                {service.icon}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 ml-2">{service.head}</h2>
            </motion.div>

            <motion.p 
                className="text-center text-base sm:text-lg text-slate-700 mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                viewport={{ once: true }}
            >
                {service.description1}
            </motion.p>
            
            <motion.p 
                className="text-center text-base sm:text-lg text-slate-700 w-full mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                viewport={{ once: true }}
            >
                {service.description2}
            </motion.p>
            
            <div className="w-full flex flex-col gap-3 mb-6">
                {service.buttons.map((buttonText: string, btnIndex: number) => (
                    <motion.button 
                        key={btnIndex}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 text-base sm:text-lg font-medium shadow-sm hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + btnIndex * 0.1 + index * 0.2 }}
                        viewport={{ once: true }}
                    >
                        {buttonText}
                    </motion.button>
                ))}
            </div>
            
            {service.finalDescription && (
                <motion.p 
                    className="text-center text-sm sm:text-base text-slate-600 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                    viewport={{ once: true }}
                >
                    {service.finalDescription}
                </motion.p>
            )}
            
            <motion.div 
                className={`mt-auto w-full sm:w-auto flex justify-center py-3 px-6 rounded-lg text-white font-semibold text-base sm:text-lg shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] ${
                    index === 0 ? "bg-blue-600 hover:bg-blue-700" :
                    index === 1 ? "bg-indigo-600 hover:bg-indigo-700" :
                    "bg-purple-600 hover:bg-purple-700"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                viewport={{ once: true }}
            >
                <OrderLink marketplace={service.head} />
            </motion.div>
        </motion.div>
    );
};

export default function Mainpage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <header className="bg-white sticky top-0 z-50 py-5 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <div className="flex items-center">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GalaxyServices</h1>
                        </div>
                        
                        <div className="sm:flex items-center space-x-4">
                           
                         <SignupModal/>
                              
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
                        Our Telegram Channels were recently shut down. We are building a new platform from scratch to give users an easier, more reliable experience when using our services. Sign up for an account and join the community today!
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
                        Explore the world with Galaxy - your gate way to unforgettable adventures and seamless travel experince
                    </motion.p>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {servicesData.map((service, index) => (
                        <ServiceCard key={index} service={service} index={index} />
                    ))}
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
                   
                            <motion.button 
                                className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                viewport={{ once: true }}
                            >
                                Create Your Account
                            </motion.button>
                       
                </div>
            </motion.div>
            
            <footer className="bg-gray-900 text-white py-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-xl font-bold mb-4">GalaxyServices</h3>
                            <p className="text-gray-400">Your one-stop solution for discounted services across travel, food, shopping and more.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Home</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Services</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact</a></li>
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-lg font-semibold mb-4">Services</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Travel</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Food Delivery</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Shopping</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Refunds</a></li>
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                    <a href="mailto:info@galaxyservices.com" className="text-gray-400 hover:text-white transition-colors duration-300">info@galaxyservices.com</a>
                                </li>
                                <li className="flex items-center">
                                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className="text-gray-400">+1 (555) 123-4567</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                    <motion.div 
                        className="border-t border-gray-800 mt-8 pt-6 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-gray-400">&copy; {new Date().getFullYear()} GalaxyServices. All rights reserved.</p>
                    </motion.div>
                </div>
            </footer>
        </div>
    );
}