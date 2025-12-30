"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnection } from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [apiError, setApiError] = useState<string>('');
  const [herbs, setHerbs] = useState<any[]>([]);
  const { address, isConnected } = useAccount();

  const testAPI = async () => {
    setApiStatus('checking');
    setApiError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/herbs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle the API response format
      if (data.success && data.data) {
        setHerbs(data.data);
        setApiStatus('success');
        console.log('API Success:', data);
      } else {
        setHerbs([]);
        setApiStatus('success');
        console.log('API Success (no data):', data);
      }
    } catch (error) {
      console.error('API Error:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown error');
      setApiStatus('error');
    }
  };

  const testPostAPI = async () => {
    try {
      const testData = {
        herbId: `TEST-${Date.now()}-DBG`,
        name: "Test Herb Debug",
        collector: "Debug Farmer", // API expects 'collector' not 'farmerName'
        geoTag: {
          latitude: 28.6139,
          longitude: 77.209,
          location: "Debug Location"
        },
        harvestDate: new Date().toISOString(),
        quantity: 1,
        unit: "kg",
        quality: "A"
      };

      const response = await fetch('http://localhost:8080/api/herbs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('POST Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('POST Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('POST Success:', result);
      alert('POST request successful!');
    } catch (error) {
      console.error('POST Error:', error);
      alert(`POST Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Page</h1>
      
      {/* Wallet Connection Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WalletConnection />
          <div className="text-sm space-y-2">
            <p><strong>Is Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
            <p><strong>Address:</strong> {address || 'Not connected'}</p>
          </div>
        </CardContent>
      </Card>

      {/* API Connection Debug */}
      <Card>
        <CardHeader>
          <CardTitle>API Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={testAPI}>Test GET /api/herbs</Button>
            <Button onClick={testPostAPI} variant="outline">Test POST /api/herbs</Button>
          </div>
          
          <div className="text-sm space-y-2">
            <p><strong>API Status:</strong> {apiStatus}</p>
            {apiError && <p className="text-red-600"><strong>Error:</strong> {apiError}</p>}
            <p><strong>Herbs Count:</strong> {herbs.length}</p>
          </div>
          
          {herbs.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Recent Herbs:</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(herbs.slice(0, 3), null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
            <p><strong>WalletConnect Project ID:</strong> {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'Not set'}</p>
            <p><strong>Contract Address:</strong> {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not set'}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}