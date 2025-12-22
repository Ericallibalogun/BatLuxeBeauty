import api from './api';

export interface WebhookPayload {
  orderId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  orderId?: string;
}

class WebhookService {
  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      const response = await api.post('/payment/webhook', {
        event_type: 'payment.succeeded',
        data: {
          order_id: payload.orderId,
          payment_intent_id: payload.paymentIntentId,
          amount: payload.amount,
          currency: payload.currency,
          customer_email: payload.customerEmail,
          metadata: payload.metadata,
          status: 'success'
        }
      });

      return {
        success: true,
        message: 'Payment success webhook processed',
        orderId: payload.orderId
      };
    } catch (error: any) {
      console.error('Payment success webhook failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Webhook processing failed'
      };
    }
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailure(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      const response = await api.post('/payment/webhook', {
        event_type: 'payment.failed',
        data: {
          order_id: payload.orderId,
          payment_intent_id: payload.paymentIntentId,
          amount: payload.amount,
          currency: payload.currency,
          customer_email: payload.customerEmail,
          metadata: payload.metadata,
          status: 'failed'
        }
      });

      return {
        success: true,
        message: 'Payment failure webhook processed',
        orderId: payload.orderId
      };
    } catch (error: any) {
      console.error('Payment failure webhook failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Webhook processing failed'
      };
    }
  }

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // This would typically use crypto to verify the webhook signature
    // Implementation depends on your backend's signature method
    try {
      // Placeholder for signature verification logic
      // In a real implementation, you'd verify the signature matches
      return true;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

export const webhookService = new WebhookService();