import { Suspense } from 'react';
import OrderPage from "./container/order";
import { div } from 'framer-motion/client';

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>}>
        <OrderPage/>
      </Suspense>
    </div>
  )
}