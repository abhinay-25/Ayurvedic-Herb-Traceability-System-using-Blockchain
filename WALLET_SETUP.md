# Wallet Connection Setup Guide

## Issue: Wallet Connection Not Working

The main issue with wallet connection is likely related to the WalletConnect Project ID configuration.

### Step 1: Get a Valid WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a free account or sign in
3. Create a new project
4. Copy your Project ID

### Step 2: Update Environment Variables

Replace the `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in your `.env.local` file:

```bash
# Replace with your actual project ID from WalletConnect Cloud
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
```

### Current Known Issues Fixed:

1. **AbortError in QR Scanner**: Fixed by adding proper error handling for video.play() method
2. **SSR Issues**: Disabled SSR for wallet connections to prevent hydration errors
3. **Network Switching**: Added useCallback for better hook dependency management

### Testing the Wallet Connection:

1. Ensure you have MetaMask or another supported wallet installed
2. Make sure you have Avalanche Fuji testnet configured in your wallet
3. Visit the application and click "Connect Wallet"
4. If prompted to switch networks, allow the application to switch to Avalanche Fuji

### Avalanche Fuji Testnet Configuration:

```
Network Name: Avalanche Fuji C-Chain
New RPC URL: https://api.avax-test.network/ext/bc/C/rpc
Chain ID: 43113
Currency Symbol: AVAX
Block Explorer URL: https://testnet.snowtrace.io/
```

### If Wallet Still Doesn't Connect:

1. Clear browser cache and localStorage
2. Disconnect and reconnect wallet
3. Check browser console for specific error messages
4. Ensure wallet is unlocked and connected to the correct network

The system should now work properly with a valid WalletConnect Project ID.