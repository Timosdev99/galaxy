"use client"

import React from 'react';
import { ArrowRight, Map, ShoppingCart, Home, Phone, Mail, Menu, X } from 'lucide-react';



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
        <div className={`bg-gradient-to-br ${gradients[index % 3]} p-6 sm:p-8 flex flex-col items-center shadow-lg rounded-xl h-full transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center justify-center mb-4">
                {service.icon}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 ml-2">{service.head}</h2>
            </div>

            <p className="text-center text-base sm:text-lg text-slate-700 mb-4">{service.description1}</p>
            <p className="text-center text-base sm:text-lg text-slate-700 w-full mb-6">{service.description2}</p>
            
            <div className="w-full flex flex-col gap-3 mb-6">
                {service.buttons.map((buttonText: string, btnIndex: string) => (
                    <button 
                        key={btnIndex}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 text-base sm:text-lg font-medium shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-200"
                    >
                        {buttonText}
                    </button>
                ))}
            </div>
            
            {service.finalDescription && (
                <p className="text-center text-sm sm:text-base text-slate-600 mb-6">{service.finalDescription}</p>
            )}
            
            <button className={`mt-auto w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-semibold text-base sm:text-lg shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] ${
                index === 0 ? "bg-blue-600 hover:bg-blue-700" :
                index === 1 ? "bg-indigo-600 hover:bg-indigo-700" :
                "bg-purple-600 hover:bg-purple-700"
            }`}>
                <a href="https://signal.me/#eu/ZPC2JVhP6HOFJnnJ3n-7PjYdS2CDWj10-0Dngt2CYlnPiIMLO3ZCa66AMfFMJKTp"><span>{service.cta}</span></a>
                <ArrowRight className="h-5 w-5" />
            </button>
        </div>
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
                        
                        
                        
                        
                        
                        <div className=" sm:flex items-center space-x-4">
                            <button className="bg-gradient-to-r from-blue-600 cursor-pointer lg:font-bold to-indigo-600 text-white lg:text-xl sm:py-4 sm:px-3 sm:rounded-sm   px-5 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
                                Login / Register
                            </button>
                        </div>
                    </div>
                </div>
                
               
               
            </header>

            
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 border-y border-amber-300 py-6">
                        <div className="flex-1">
                            <p className=" text-xl text-center  font-bold text-amber-800">
                            Our Telegram Channels were recently shut down. We are building a new platform from scratch to give users an easier, more reliable experience when using our services. Sign up for an account and join the community today!
                         </p>
                        </div>             
            </div>
            
           
            <div className="container mx-auto px-4 py-12 sm:py-16">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your One-Stop Solution for Discounted Services</h2>
                    <p className="text-lg text-gray-600">Explore the world with Galaxy - your gate way to unforgettable adventures and seamless travel experince</p>
                </div>
                
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {servicesData.map((service, index) => (
                        <ServiceCard key={index} service={service} index={index} />
                    ))}
                </div>
            </div>
            
            
           
            
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12 sm:py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start Saving?</h2>
                    <p className="text-blue-100 text-lg mb-6">Join thousands of satisfied customers who are saving money every day.</p>
                    <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-300">
                        Create Your Account
                    </button>
                </div>
            </div>
            
            
            <footer className="bg-gray-900 text-white py-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">GalaxyServices</h3>
                            <p className="text-gray-400">Your one-stop solution for discounted services across travel, food, shopping and more.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Home</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Services</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Services</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Travel</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Food Delivery</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Shopping</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Refunds</a></li>
                            </ul>
                        </div>
                        <div>
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
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-6 text-center">
                        <p className="text-gray-400">&copy; {new Date().getFullYear()} GalaxyServices. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}