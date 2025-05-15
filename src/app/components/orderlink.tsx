// OrderLink.tsx
'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface OrderLinkProps {
  marketplace: string;
  service: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function OrderLink({
  marketplace,
  service,
  className = '',
  style = {},
  children = 'Place Order'
}: OrderLinkProps) {
  return (
    <Link
      href={`/order?marketplace=${marketplace}&service=${service}`}
      className={`flex items-center justify-center ${className}`}
      style={style}
    >
      {children}
      <ArrowRight className="h-5 w-5 ml-2" />
    </Link>
  );
}