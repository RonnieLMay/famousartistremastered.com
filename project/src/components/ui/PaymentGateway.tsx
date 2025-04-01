import { loadStripe } from '@stripe/stripe-js';

interface PaymentGatewayError extends Error {
  code?: string;
  decline_code?: string;
  payment_intent?: {
    status: string;
    id: string;
  };
}

class PaymentGateway {
  private static stripe: Promise<any>;
  private static STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  private static getStripe() {
    if (!this.stripe) {
      if (!this.STRIPE_PUBLIC_KEY) {
        throw new Error('Stripe public key is not configured');
      }
      this.stripe = loadStripe(this.STRIPE_PUBLIC_KEY);
    }
    return this.stripe;
  }

  static async processPayment(amount: number): Promise<void> {
    try {
      const stripe = await this.getStripe();
      
      // Create payment intent
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const { clientSecret } = await response.json();

      // Confirm the payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa', // Test token, replace with real card in production
          },
        },
      });

      if (error) {
        const paymentError = error as PaymentGatewayError;
        throw new Error(paymentError.message || 'Payment failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during payment');
    }
  }
}

export default PaymentGateway;