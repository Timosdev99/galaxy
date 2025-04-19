import { Suspense } from 'react';
import OrderPage from "./container/order";

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OrderPage/>
      </Suspense>
    </div>
  )
}