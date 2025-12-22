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
   * Check if webhook endpoint is available
   */
  private async isWebhookEndpointAvailable(): Promise<boolean> {
    try {
      // Try a simple HEAD request to check if endpoint exists
      await api.head('/payment/webhook');
      return true;
    } catch (error: any) {
      // If 404 or CORS error, endpoint doesn't exist or isn't configured
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('Webhook endpoint not available:', error.message);
        return false;
      }
      return true; // Other errors might be temporary
    }
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(payload: WebhookPayload): Promise<WebhookResponse> {
    // Check if webhook endpoint is available
    const isAvailable = await this.isWebhookEndpointAvailable();
    if (!isAvailable) {
      console.log('Webhook endpoint not available, skipping webhook call');
      return {
        success: true,
        message: 'Payment success recorded (webhook endpoint not configured)',
        orderId: payload.orderId
      };
    }

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
      
      // Don't fail the payment if webhook fails
      return {
        success: true,
        message: 'Payment successful (webhook notification failed)',
        orderId: payload.orderId
      };
    }
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailure(payload: WebhookPayload): Promise<WebhookResponse> {
    // Check if webhook endpoint is available
    const isAvailable = await this.isWebhookEndpointAvailable();
    if (!isAvailable) {
      console.log('Webhook endpoint not available, skipping webhook call');
      return {
        success: true,
        message: 'Payment failure recorded (webhook endpoint not configured)',
        orderId: payload.orderId
      };
    }

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
      
      // Don't interfere with error handling if webhook fails
      return {
        success: true,
        message: 'Payment failure recorded (webhook notification failed)',
        orderId: payload.orderId
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