"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wallet, CheckCircle } from 'lucide-react';
import { AVALANCHE_FUJI_CHAIN_ID } from '@/lib/wagmi';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chainId === AVALANCHE_FUJI_CHAIN_ID;

  const switchToAvalancheFuji = useCallback(async () => {
    try {
      await switchChain({ chainId: AVALANCHE_FUJI_CHAIN_ID });
      toast.success('Network switched to Avalanche Fuji successfully!');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network. Please switch manually in MetaMask.');
    }
  }, [switchChain]);

  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      toast.error('Wrong Network', {
        description: 'Please switch to Avalanche Fuji Testnet',
        action: {
          label: 'Switch Network',
          onClick: () => switchToAvalancheFuji(),
        },
      });
    }
  }, [isConnected, isCorrectNetwork, switchToAvalancheFuji]);

  return (
    <div className="flex items-center space-x-3">
      {/* Network Status */}
      {isConnected && (
        <div className="hidden sm:flex items-center space-x-2">
          {isCorrectNetwork ? (
            <Badge variant="success" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Avalanche Fuji
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Wrong Network
            </Badge>
          )}
        </div>
      )}

      {/* Switch Network Button (shown only when connected but on wrong network) */}
      {isConnected && !isCorrectNetwork && (
        <Button
          variant="outline"
          size="sm"
          onClick={switchToAvalancheFuji}
          className="hidden sm:flex"
        >
          Switch to Fuji
        </Button>
      )}

      {/* Custom Connect Button */}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button onClick={openConnectModal} size="sm">
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive" size="sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </Button>

                    <Button onClick={openAccountModal} variant="outline" size="sm">
                      <Wallet className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        {account.displayName}
                      </span>
                      <span className="sm:hidden">
                        {account.displayName.slice(0, 6)}...
                      </span>
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

export function WalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === AVALANCHE_FUJI_CHAIN_ID;

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span>Wallet Disconnected</span>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center space-x-2 text-sm text-orange-600">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span>Wrong Network</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>Connected to Avalanche Fuji</span>
      <Badge variant="outline" className="text-xs">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </Badge>
    </div>
  );
}