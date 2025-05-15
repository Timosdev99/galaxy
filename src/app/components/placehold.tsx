import { useState } from 'react';
import SignupModal from './signup';

export default function GhostMarket() {
  return (
    <div className="bg-white min-h-screen text-gray-800 font-sans">


      <main className="max-w-5xl mx-auto p-4">
        <div className="text-center my-16">
          <h1 className="text-5xl font-bold mb-6">The Modern Marketplace</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sign up to access a wide range of services from multiple vendors.
          </p>
            <SignupModal/>
          
        </div>

        <section className="my-12">
          <h2 className="text-3xl font-bold mb-6">Vendors</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <VendorCard name="Vendor One" services={["Service A", "Service B"]} />
            <VendorCard name="Vendor Two" services={["Service C", "Service D"]} />
            <VendorCard name="Vendor Three" services={["Service A", "Service B"]} />
            <VendorCard name="Vendor Four" services={["Service A", "Service B"]} />
          </div>
        </section>
      </main>
    </div>
  );
}

function VendorCard({ name, services }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <h3 className="text-2xl font-bold mb-4">{name}</h3>
      {services.map((service: any, index: any) => (
        <p key={index} className="text-gray-600 mb-1">{service}</p>
      ))}
      <div className="mt-6">
        <button className="border border-gray-300 rounded-lg px-6 py-3 bg-white hover:bg-blue-100">
          Place an order
        </button>
      </div>
    </div>
  );
}