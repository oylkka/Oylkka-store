import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import React, { useState } from 'react';

interface MessageVendorButtonProps {
  vendorId: string;
  vendorName: string;
  productId?: string;
  className?: string;
}

const MessageVendorButton: React.FC<MessageVendorButtonProps> = ({
  vendorId,
  vendorName,
  productId,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  console.log(vendorId, vendorName, productId);

  const handleMessageVendor = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: vendorId,
          productId: productId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/api/auth/signin';
          return;
        }

        throw new Error(errorData.message || 'Failed to start conversation');
      }

      const data = await response.json();

      // Redirect to the conversation
      window.location.href = `/chat/${data.id}`;
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMessageVendor}
      disabled={isLoading}
      variant="outline"
      className={cn('flex items-center justify-center gap-2 py-6', className)}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      <span>Message Vendor</span>
    </Button>
  );
};

export default MessageVendorButton;
