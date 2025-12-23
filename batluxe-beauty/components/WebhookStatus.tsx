import React from 'react';
import { useWebhook } from '../context/WebhookContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const WebhookStatus: React.FC = () => {
  const { isProcessingWebhook, webhookError, lastWebhookResponse } = useWebhook();

  if (isProcessingWebhook) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
        <Loader2 className="animate-spin mr-2" size={16} />
        <span className="text-blue-700 text-sm font-medium">Processing webhook...</span>
      </div>
    );
  }

  if (webhookError) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <AlertCircle className="mr-2" size={16} color="#DC2626" />
        <span className="text-red-700 text-sm font-medium">{webhookError}</span>
      </div>
    );
  }

  if (lastWebhookResponse) {
    return (
      <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
        <CheckCircle className="mr-2" size={16} color="#16A34A" />
        <span className="text-green-700 text-sm font-medium">{lastWebhookResponse.message}</span>
      </div>
    );
  }

  return null;
};

export default WebhookStatus;