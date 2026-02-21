'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import MainLayout from '@/components/layouts/MainLayout';
import { paymentService } from '@/services/payment.service';
import Button from '@/components/ui/Button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ orderId, clientSecret, expiresAt }: { orderId: string; clientSecret: string; expiresAt: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeRemaining('Expired');
        setError('Payment time has expired. Please create a new order.');
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?orderId=${orderId}`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setProcessing(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Timer Display */}
      <div className={`p-4 rounded-lg border-2 ${
        timeRemaining === 'Expired' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
          <span className={`text-2xl font-bold ${
            timeRemaining === 'Expired' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {timeRemaining}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Complete payment before the timer expires
        </p>
      </div>

      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/orders/${orderId}`)}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing || timeRemaining === 'Expired'}
          className="flex-1"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Secured by Stripe - PCI DSS Compliant</span>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const data = await paymentService.createPaymentIntent(Number(orderId));
        setClientSecret(data.clientSecret);
        setExpiresAt(data.expiresAt);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [orderId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initializing secure payment...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !clientSecret || !expiresAt) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error || 'Unable to initialize payment'}</p>
            <Button onClick={() => router.push(`/orders/${orderId}`)}>
              View Order
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
            <p className="text-gray-600">Order #{orderId}</p>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm orderId={orderId} clientSecret={clientSecret} expiresAt={expiresAt} />
          </Elements>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Test Card:</strong> Use card number 4242 4242 4242 4242 with any future expiry date and any 3-digit CVC.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs text-gray-600">256-bit SSL Encryption</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-xs text-gray-600">PCI DSS Compliant</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">💳</div>
            <p className="text-xs text-gray-600">Secure Payments</p>
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
