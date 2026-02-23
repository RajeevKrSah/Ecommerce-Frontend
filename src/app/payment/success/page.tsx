'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/payment.service';
import Button from '@/components/ui/Button';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setVerifying(false);
        return;
      }

      try {
        console.log('Starting payment confirmation for order:', orderId);

        // First confirm the payment with Stripe
        const confirmResult = await paymentService.confirmPayment(Number(orderId));
        console.log('Confirmation result:', confirmResult);

        // Then get the updated status
        const status = await paymentService.getPaymentStatus(Number(orderId));
        console.log('Payment status:', status);

        setVerified(status.payment_status === 'paid');
      } catch (err: any) {
        console.error('Failed to verify payment:', err);
        console.error('Error details:', err.response?.data);
      } finally {
        setVerifying(false);
      }
    };

    // Wait a moment for Stripe to process
    setTimeout(verifyPayment, 2000);
  }, [orderId]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
          <p className="text-gray-600 mb-6">No order ID provided</p>
          <Button onClick={() => router.push('/orders')}>
            View Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">Your order has been confirmed.</p>
        <p className="text-sm text-gray-500 mb-8">Order #{orderId}</p>

        {!verified && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Payment is being processed. You'll receive a confirmation email shortly.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="w-full"
          >
            View Order Details
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/products')}
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
