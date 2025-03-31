import { loadStripe } from '@stripe/stripe-js';

interface PaymentGatewayProps {
  amount: number;
}

class PaymentGateway {
  private static stripe: any;

  private static async initStripe() {
    if (!this.stripe) {
      this.stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    }
    return this.stripe;
  }

  static async processPayment(amount: number): Promise<boolean> {
    try {
      const stripe = await this.initStripe();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ amount: Math.round(amount * 100) }), // Convert to cents
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const { clientSecret } = await response.json();

      const { error: stripeError } = await stripe.confirmPayment({
        elements: null,
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
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