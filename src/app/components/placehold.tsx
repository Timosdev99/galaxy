import { useState } from 'react';
import SignupModal from './signup';
import { Ghost } from 'lucide-react';

export default function GhostMarket() {
  return (
    <div className="animated-gradient min-h-screen text-gray-800 font-sans">
     
      <nav className="px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Ghost className="h-8 w-8 md:h-10 md:w-10 text-green-500" />
          <span className="ml-2 text-xl md:text-2xl font-bold text-white">GhostMarket</span>
        </div>
       
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center my-8 md:my-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl flex flex-col md:flex-row items-center justify-center font-bold text-white mb-4 md:mb-6">
            <div className="flex items-center">
              <Ghost className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-green-500" />
              <span className="ml-2">The Modern</span>
            </div>
            <span className="md:ml-2 bg-gradient-to-l from-green-400 to-green-800 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-6 md:mb-8 px-4">
            Sign up to access a wide range of services from multiple vendors.
          </p>
          <div className="flex justify-center">
            <SignupModal />
          </div>
        </div>

        <section className="my-8 md:my-12">
          <h2 className="text-2xl md:text-3xl text-white font-bold mb-4 md:mb-6">Vendors</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <VendorCard name="Vendor One" services={["Service A", "Service B"]} />
            <VendorCard name="Vendor Two" services={["Service C", "Service D"]} />
            <VendorCard name="Vendor Three" services={["Service A", "Service B"]} />
            <VendorCard name="Vendor Four" services={["Service A", "Service B"]} />
          </div>
        </section>
      </main>

      
      <footer className="mt-12 py-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 GhostMarket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function VendorCard({ name, services }: any) {
  return (
    <div className="border bg-slate-950 border-gray-800 rounded-lg p-4 md:p-6 transition hover:border-gray-700">
      <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-white">{name}</h3>
      {services.map((service: any, index: any) => (
        <p key={index} className="text-gray-400 mb-1">{service}</p>
      ))}
      <div className="mt-4 md:mt-6">
        <button className="w-full sm:w-auto border border-gray-700 rounded-lg px-4 py-2 md:px-6 md:py-3 bg-transparent text-white hover:bg-gray-800 transition">
          Place an order
        </button>
      </div>
    </div>
  );
}