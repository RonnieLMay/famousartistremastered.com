import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentResponse {
  clientSecret: string;
}

class PaymentGateway {
  static async processPayment(amount: number): Promise<boolean> {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
        }),
      });

      const data = await response.json() as PaymentResponse;

      const { error: paymentError } = await stripe.confirmCardPayment(data.clientSecret);

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      return true;
    } catch (error) {
      console.error('Payment failed:', error);
      return false;
    }
  }
}

export default PaymentGateway;