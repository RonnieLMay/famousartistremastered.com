import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

class PaymentGateway {
  static async processPayment(amount: number): Promise<boolean> {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ amount: amount * 100 }), // Convert to cents
      });

      const { clientSecret } = await response.json();

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2024,
            cvc: '123',
          },
        },
      });

      if (stripeError) {
        console.error('Payment failed:', stripeError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  }
}

export default PaymentGateway;