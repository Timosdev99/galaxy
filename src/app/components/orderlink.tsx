// Create a new file called "orderlink.tsx" to replace OrderButton

"use client"

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface OrderLinkProps {
  marketplace: string;
  className?: string;
}

const OrderLink: React.FC<OrderLinkProps> = ({ marketplace, className }) => {
 
  const formattedMarketplace = marketplace === "GalaxyServices" ? "GalaxyService" : marketplace;
  
  return (
    <Link 
      href={`/order?marketplace=${formattedMarketplace}`}
      className={`flex items-center justify-center ${className || ""}`}
    >
      Click here to place an order
      <ArrowRight className="h-5 w-5 ml-2" />
    </Link>
  );
};

export default OrderLink;