"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WalletTestPage() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      address,
      isConnected,
      isConnecting,
      isReconnecting,
      connectorsCount: connectors.length,
      connectors: connectors.map(c => ({ name: c.name, id: c.id })),
      error: error?.message,
      window: typeof window !== 'undefined',
      ethereum: typeof window !== 'undefined' ? !!window.ethereum : false,
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    };
    setDebugInfo(info);
    console.log('Wallet Debug Info:', info);
  }, [address, isConnected, isConnecting, isReconnecting, connectors, error]);

  const testConnector = (connector: any) => {
    console.log('Testing connector:', connector);
    connect({ connector });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Wallet Connection Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>RainbowKit ConnectButton</CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Available Connectors:</h4>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => testConnector(connector)}
                  disabled={isPending}
                  variant="outline"
                >
                  {connector.name}
                  {isPending && ' (connecting)'}
                </Button>
              ))}
            </div>
          </div>

          {isConnected && (
            <Button onClick={() => disconnect()} variant="destructive">
              Disconnect
            </Button>
          )}

          {error && (
            <div className="text-red-600 text-sm">
              <strong>Connection Error:</strong> {error.message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Window.ethereum Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            {typeof window !== 'undefined' ? (
              <>
                <p><strong>Window defined:</strong> Yes</p>
                <p><strong>Window.ethereum exists:</strong> {window.ethereum ? 'Yes' : 'No'}</p>
                {window.ethereum && (
                  <div className="space-y-1">
                    <p><strong>IsMetaMask:</strong> {(window.ethereum as any).isMetaMask ? 'Yes' : 'No'}</p>
                    <p><strong>Provider:</strong> {(window.ethereum as any).isMetaMask ? 'MetaMask' : 'Unknown'}</p>
                  </div>
                )}
              </>
            ) : (
              <p><strong>Window:</strong> Not available (SSR)</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}