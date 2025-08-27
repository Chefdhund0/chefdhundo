'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const CashfreeTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [testResult, setTestResult] = useState<string>('');

  const testPayment = async () => {
    setStatus('Testing payment...');
    setTestResult('');

    try {
      // Call our server-side API to test the payment
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100,
          planName: 'Test Plan',
          planId: 'test_plan',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create test order');
      }

      console.log('Test order created successfully:', result.data);
      
      setStatus('Test successful!');
      setTestResult(`Order created with ID: ${(result.data as Record<string, unknown>).order_id || 'Unknown'}`);
      
    } catch (error) {
      console.error('Test payment error:', error);
      setStatus('Test failed');
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Cashfree SDK Test</h3>
      <div className="mb-4">
        <p><strong>Status:</strong> {status}</p>
        {testResult && (
          <div className="mt-2 p-2 bg-blue-100 rounded">
            <p><strong>Result:</strong> {testResult}</p>
          </div>
        )}
      </div>
      <Button 
        onClick={testPayment}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Test Payment Integration
      </Button>
    </div>
  );
};

export default CashfreeTest; 