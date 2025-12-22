import React, { createContext, useContext, useState, useCallback } from 'react';
import { webhookService, WebhookPayload, WebhookResponse } from '../services/webhookService';

interface WebhookContextType {
  isProcessingWebhook: boolean;
  webhookError: string | null;
  lastWebhookResponse: WebhookResponse | null;
  processPaymentSuccess: (payload: WebhookPayload) => Promise<WebhookResponse>;
  processPaymentFailure: (payload: WebhookPayload) => Promise<WebhookResponse>;
  clearWebhookError: () => void;
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

export const useWebhook = () => {
  const context = useContext(WebhookContext);
  if (!context) {
    throw new Error('useWebhook must be used within a WebhookProvider');
  }
  return context;
};

interface WebhookProviderProps {
  children: React.ReactNode;
}

export const WebhookProvider: React.FC<WebhookProviderProps> = ({ children }) => {
  const [isProcessingWebhook, setIsProcessingWebhook] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [lastWebhookResponse, setLastWebhookResponse] = useState<WebhookResponse | null>(null);

  const processPaymentSuccess = useCallback(async (payload: WebhookPayload): Promise<WebhookResponse> => {
    setIsProcessingWebhook(true);
    setWebhookError(null);
    
    try {
      const response = await webhookService.handlePaymentSuccess(payload);
      setLastWebhookResponse(response);
      
      if (!response.success) {
        setWebhookError(response.message);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process payment success webhook';
      setWebhookError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsProcessingWebhook(false);
    }
  }, []);

  const processPaymentFailure = useCallback(async (payload: WebhookPayload): Promise<WebhookResponse> => {
    setIsProcessingWebhook(true);
    setWebhookError(null);
    
    try {
      const response = await webhookService.handlePaymentFailure(payload);
      setLastWebhookResponse(response);
      
      if (!response.success) {
        setWebhookError(response.message);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process payment failure webhook';
      setWebhookError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsProcessingWebhook(false);
    }
  }, []);

  const clearWebhookError = useCallback(() => {
    setWebhookError(null);
  }, []);

  const value: WebhookContextType = {
    isProcessingWebhook,
    webhookError,
    lastWebhookResponse,
    processPaymentSuccess,
    processPaymentFailure,
    clearWebhookError
  };

  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  );
};