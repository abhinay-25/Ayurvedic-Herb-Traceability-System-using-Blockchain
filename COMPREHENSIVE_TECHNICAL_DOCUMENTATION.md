# Ayurveda Herb Traceability — Comprehensive Technical Documentation (For Jury Presentation)

Last updated: 2025-10-18

---

## 1) Executive Overview

This project delivers verifiable end-to-end traceability for Ayurvedic herbs using a hybrid architecture:
- On-chain: Immutable events and history on Avalanche Fuji C-Chain via a Solidity contract.
- Off-chain: Rich entity data (herbs, farmers, geolocation, notes) in MongoDB via an Express API.
- Frontend: Next.js + Wagmi + RainbowKit for wallet-driven writes, Leaflet for maps, and robust QR-based consumer verification.

The system prevents duplicate writes, handles nonces safely, ensures deterministic gas configs, and gracefully reconciles off-chain vs on-chain state.

Primary design decisions and their rationale:
- Hybrid storage: keep immutable event history on-chain, keep large/mutable data off-chain for cost, flexibility, and privacy.
- Wallet-first writes: end users sign their own transactions via MetaMask; no custody, better trust model.
- Deterministic gas: fixed gas limits avoid broken wallet estimations ("Missing gas limit").
- Idempotency by design: custom header prevents duplicate on-chain submissions from backend.

---

## 2) Tech Stack and Key Libraries

### Frontend (Next.js + TypeScript)
- next 15.5.x, react 18.3.x, typescript 5.6.x
- wagmi 2.12.x + viem 2.x: wallet connection, read/write contract
- @rainbow-me/rainbowkit 2.1.x: wallet UI/Connectors
- tailwindcss 3.4.x (+ tailwind-merge, tailwindcss-animate): styling
- react-hook-form + zod + @hookform/resolvers: forms + validation
- @tanstack/react-query: async state/caching
- leaflet + react-leaflet: interactive maps
- sonner: notifications
- lucide-react: icons
- @zxing/library: QR code scanning (decode)

### Backend (Node.js/Express)
- express 5.1.x, cors, body-parser
- mongoose 8.18.x (MongoDB ODM)
- ethers 6.15.x (server-side contract access when needed)
- qrcode 1.5.x (QR generation — PNG/base64)
- dotenv, axios

### Smart Contracts (Hardhat)
- Solidity ^0.8.18
- Hardhat 2.26.x, @nomicfoundation/hardhat-ethers
- Network: Avalanche Fuji (chainId 43113)
- Address: 0x5635517478f22Ca57a6855b9fcd7d897D977E958 (from `frontend/src/lib/wagmi.ts`)

---

## 3) System Architecture

- Browser (MetaMask):
  - Connects via RainbowKit/Wagmi.
  - Writes to contract using `useWriteContract` with explicit gas config.
  - Sends REST requests to Express API with `x-skip-blockchain` header to avoid duplicate on-chain writes.

- Backend (Express API):
  - Persists rich herb/farmer documents in MongoDB.
  - Optionally writes to blockchain (server wallet) — but skipped when `x-skip-blockchain: 1` is set by the frontend.
  - Generates QR codes that point to a canonical herb URL for consumer verification.

- Blockchain (Avalanche Fuji):
  - `HerbTraceability.sol` stores immutable history per herbId.
  - Events: `HerbAdded`, `StatusUpdated`.

Interaction pattern eliminates nonce conflicts and duplicates and supports auto-reconciliation if off-chain data exists but the herb hasn’t been created on-chain yet.

Data flow overview (happy path):
- Create Herb (blockchain ON): FE → BE (persist off-chain, skip chain) → FE wallet tx to chain → User sees receipt.
- Update Status (blockchain ON): FE → BE (update off-chain, skip chain) → FE probes chain → if missing then add-on-chain → then status update tx.
- Scan & Verify: Consumer scans QR → FE resolves herbId → FE/BE fetch off-chain details → FE may read latest status on-chain → UI shows combined truth.

---

## 4) On-Chain Data Model and Functions

Contract: `contracts/contracts/HerbTraceability.sol`

Struct: `Herb`
- herbId: string
- name: string
- collector: string
- geoTag: string ("lat,long")
- status: string
- timestamp: uint256

Storage:
- mapping(string => Herb[]) herbHistory;   // full history per herb
- mapping(string => bool)    herbExists;    // guard for existence
- string[]                   allHerbIds;    // enumeration helper

Functions:
- addHerb(herbId, name, collector, geoTag, status)
  - require !herbExists[herbId]
  - push new Herb entry
  - herbExists[herbId] = true
  - allHerbIds.push(herbId)
  - emit HerbAdded

- updateStatus(herbId, newStatus)
  - require herbExists[herbId]
  - copy latest, change status, push
  - emit StatusUpdated

- getHerbHistory(herbId) → Herb[]
- getLatestStatus(herbId) → Herb
- getHistoryCount(herbId) → uint256
- getTotalHerbs() → uint256
- getAllHerbIds() → string[]
- getHerbAtIndex(herbId, index) → Herb
- isValidStatus(status) → bool

Why these fields are on-chain:
- herbId: global identifier to anchor the herb’s immutable ledger history.
- name, collector: minimal provenance signals consumers care about; immutable once recorded in initial entry.
- geoTag: a compact "lat,long" string provides provenance without complex geospatial indexing on-chain.
- status: life-cycle milestone; every change is appended, never overwritten.
- timestamp: chain time for audit.

Network config (Hardhat): `contracts/hardhat.config.js` includes Fuji RPC, chainId 43113, optional PRIVATE_KEY and gas defaults.

---

## 5) Off-Chain Data Model (MongoDB via Mongoose)

Models:
- `backend/models/Herb.js`
  - herbId (unique, required)
  - name, collector
  - geoTag: { latitude, longitude, address? }
  - harvestDate
  - status (enum: Collected/In Processing/Packaged/Final Formulation/Distributed)
  - blockchainTx? (string) — optional link to chain tx
  - plus various metadata fields (quantity, unit, quality, notes, etc. in full file)

- `backend/models/Farmer.js`
  - farmerId (unique, uppercase)
  - name, email, phone, address{...}
  - farmDetails, location, specializations, certifications, walletAddress?, etc.

Database connection: `backend/config/db.js` uses `MONGO_URI` and logs lifecycle events.

Why these fields are off-chain:
- Rich text (notes), addresses, and geo breakdowns are verbose and frequently updated.
- PII and sensitive info (farmer contact) should not be immutable/public.
- Off-chain enables indexing, full-text search, pagination, analytics, and cost efficiency.

---

## 6) API Surface (Express Routes)

Base URL (dev): http://localhost:8080

- Herbs: `backend/routes/herbRoutes.js`
  - GET /api/herbs — list with filters/pagination (status, collector, name)
  - GET /api/herbs/stats — aggregate stats
  - GET /api/herbs/location — geospatial filter
  - GET /api/herbs/:id — by herbId
  - GET /api/herbs/:id/history — full journey
  - GET /api/herbs/:id/qrcode — QR code PNG/base64 for consumer scan
  - POST /api/herbs — create herb (off-chain)
  - PUT /api/herbs/:id/status — update herb status (off-chain)
  - PUT /api/herbs/:id — update details
  - DELETE /api/herbs/:id — remove herb
  - TEST helpers: POST /api/herbs/test, DELETE /api/herbs/test

- Farmers: `backend/routes/farmerRoutes.js`
  - CRUD and geo filters for farmers

- Traceability: `backend/routes/traceabilityRoutes.js`
  - Overview/analytics/alerts endpoints
  - GET /api/traceability/herb/:herbId — merged journey view
  - GET /api/traceability/verify/:herbId — authenticity score

Headers for duplicate prevention:
- Frontend sets `'x-skip-blockchain': '1'` when user elects to sign the transaction in wallet.
- In `backend/controllers/herbController.js`, we read `req.headers['x-skip-blockchain']` and skip any server-side blockchain write if present.

Contract write path options:
- User wallet path (preferred): BE persists records; FE triggers on-chain tx; header prevents BE duplicate write.
- Server wallet path (fallback/ops): BE may invoke `blockchainService.js` to write; FE should send header '0'.

---

## 7) Frontend Architecture and Key Screens

Providers: `frontend/src/components/Providers.tsx`
- Wraps app with WagmiProvider(config), RainbowKitProvider, and React Query.
- Wagmi config in `frontend/src/lib/wagmi.ts` uses Avalanche Fuji and WalletConnect projectId.

Common UI: `frontend/src/components`
- Layout, Header, WalletConnection, QRCodeDisplay, ErrorBoundary, etc.

Maps: `frontend/src/components/maps/MapWrapper.tsx`
- Dynamic import of react-leaflet components with `ssr:false` to prevent SSR hydration issues.
- Props: center, zoom, selectedPosition, markers, interactive.
- Handles `onPositionSelect` to capture lat/long on clicks.

Key Pages:
- Add Herb: `frontend/src/app/add-herb/page.tsx`
  - Form with validation (react-hook-form + zod).
  - POST to backend with `'x-skip-blockchain'` header when user chooses blockchain mode.
  - On blockchain mode, calls `writeContract` for `addHerb` with explicit gas config from `gasUtils.getGasConfig('addHerb')`.
  - Uses `useWaitForTransactionReceipt` to reflect mining status.

- Update Status: `frontend/src/app/update-status/page.tsx`
  - Ensures existence on-chain by probing `getLatestStatus`.
  - If missing on-chain, fetches herb details from backend and first calls `addHerb` on-chain.
  - Then calls `updateStatus` on-chain.
  - All write paths use `useWriteContract`; explicit gas comes from `gasUtils.getGasConfig('updateStatus')`.
  - Backend call always includes `'x-skip-blockchain'` when in blockchain mode to avoid duplicates.
  - Error handling strategy:
    - If wallet rejects or RPC fails, backend record is still intact (off-chain) → user can retry chain write later.
    - If `getLatestStatus` read fails, treat as non-existence and attempt add-then-update.

- Scan QR: `frontend/src/app/scan/page.tsx`
  - Uses `@zxing/library` to decode QR from camera or image upload.
  - Extracts herbId from URL embedded in QR and navigates to `herbs/:id` page for details.
  - Sanitizes/validates URL and herbId before navigation to prevent malformed inputs.

---

## 8) Gas, Nonce, and Transaction Strategy

File: `frontend/src/lib/gasUtils.ts`
- Provides fixed gas limits and 30 gwei gas price tuned for Fuji:
  - addHerb: 500,000 gas
  - updateStatus: 300,000 gas
  - fallback: 400,000 gas
- We do NOT manually set nonces in the frontend. Wallet/provider handles it (prevents "nonce too low").
- A helper `getGasConfigWithNonce` exists but isn’t used in normal flow.

Duplicate-prevention and Nonce conflicts:
- Frontend sets header `'x-skip-blockchain': '1'` when it will write to chain.
- Backend checks this header and skips server wallet writes.
- Result: only one signer (the user’s wallet) pushes a transaction per action.

Why fixed gas limits (vs estimation):
- Estimation can fail on some RPCs/wallets showing "Missing gas limit".
- Our contract logic is deterministic and simple; empirically safe limits reduce UX friction.

---

## 9) QR Code Generation and Verification

Generation (Backend):
- Endpoint: GET `/api/herbs/:id/qrcode`
- Controller: `backend/controllers/herbController.js` (function `generateHerbQRCode`)
- Implementation:
  - Build `qrUrl = ${FRONTEND_URL}/herbs/${herbId}` (defaults to http://localhost:3000)
  - Use `qrcode` library: `QRCode.toDataURL(qrUrl, { width: 512, errorCorrectionLevel: 'M', type: 'image/png' })`
  - Return both data URL and raw base64 for download convenience

Display/Download (Frontend): `frontend/src/components/QRCodeDisplay.tsx`
- Calls backend endpoint, stores response in state, shows preview, offers download.
- `downloadQRCode()` converts base64 to Blob and triggers client-side download.

Consumer Verification:
- Scanning page (`/scan`) uses camera to decode QR (`@zxing/library`).
- Extracts herbId from URL, redirects to herb detail page.
- Herb detail page then calls backend to fetch full journey and optionally reads from chain for latest status.

Verification logic (step-by-step):
1) QR encodes a canonical HTTPS URL pointing to `/herbs/:id` (or `/track/:id`).
2) The Scan page decodes; we parse herbId robustly (`new URL(...)`, segment checks).
3) FE navigates to the details page for that herbId.
4) Details page fetches:
  - Off-chain: `GET /api/herbs/:id` (+ `/history`) for metadata and journey.
  - On-chain: `readContract(getLatestStatus)` to cross-check latest status immutably.
5) UI highlights any mismatch (e.g., DB says Final Formulation but chain shows Packaged) → potential red flag.
6) Consumer can view the tx hash on a block explorer (SnowTrace) for independent validation.

---

## 10) Maps Implementation (GeoTagging)

- Component: `frontend/src/components/maps/MapWrapper.tsx`
- Uses dynamic imports (MapContainer, TileLayer, Marker, Popup) with `ssr:false` to avoid Next.js SSR issues.
- Captures clicks via `onPositionSelect` and stores `[lat, lng]` in form state.
- Display markers list for journey visualization if provided.
- Leaflet CSS is included via `globals.css` and the component’s wrapper ensures correct sizing.

Why Leaflet + dynamic imports:
- Leaflet is mature, lightweight, and open-source friendly.
- `react-leaflet` relies on DOM; SSR disabled avoids hydration mismatches in Next.js.
- Dynamic import keeps bundle size and SSR behavior predictable.

---

## 11) End-to-End Flows

Add Herb (Blockchain ON):
1. User toggles blockchain mode in UI and submits form.
2. Frontend POSTs to `/api/herbs` with `'x-skip-blockchain': '1'` to only persist off-chain.
3. Frontend calls `writeContract(addHerb)` with gas config.
4. Waits for receipt; shows success toast.

Update Status (Blockchain ON):
1. Frontend PUTs to `/api/herbs/:id/status` with `'x-skip-blockchain': '1'`.
2. Frontend probes `getLatestStatus(herbId)`; if not found, it fetches herb details and first sends `addHerb`.
3. Then it sends `updateStatus`.
4. Wait for receipts; success toasts.

Scan QR:
1. Consumer scans QR → URL contains `/herbs/:id`.
2. Frontend resolves herbId, navigates, and fetches both off-chain details and on-chain latest status for display.
  - If camera permission denied: fallback to image upload scanning.
  - If QR invalid: show clear error and link to manual search.

---

## 12) Security and Reliability Notes

- Never commit private keys. `.env` driven for RPC/keys.
- WalletConnect Project ID is required for production; repo warns when demo id is used.
- CORS configured to permit the local frontend origins.
- Validation on both zod (frontend) and Mongoose schema (backend).
- Gas settings are explicit to avoid MetaMask "Missing gas limit" issues.
- No manual nonce: prevents nonce drift and "nonce too low" errors.
 - Rate limit QR generation endpoint to avoid abuse (recommended for prod).
 - Validate payloads on both FE/BE; never trust QR text blindly.
 - Consider server-side allowlist for RPC endpoints; handle retry with backoff.

---

## 13) Developer Operations

Local Dev
- Contracts: `cd contracts && npm i && npx hardhat compile && npx hardhat run --network fuji scripts/deploy.js`
- Backend: `cd backend && npm i && npm run dev` (listens on 8080)
- Frontend: `cd frontend && npm i && npm run dev` (Next.js on 3000)

Environment
- `frontend/src/lib/wagmi.ts` sets chains and contract address.
- `.env` files in each package (`contracts/.env`, `backend/.env`, `frontend/.env.local`) control RPC, keys, DB, and URLs.
 
Why Next.js (vs CRA or plain Vite):
- File-based routing and app router simplifies page composition.
- First-class TypeScript support, image/asset optimizations, and dev ergonomics.
- Works well with SSR/SSG if later needed for public product pages (we keep web3 bits client-only).

---

## 14) Library Index and Rationale

- Wagmi + viem + RainbowKit — modern wallet UX and typed contract interactions.
- Ethers (backend) — mature server-side contract calls and log decoding.
- Leaflet + react-leaflet — proven mapping with rich ecosystem.
- React Hook Form + Zod — type-safe forms with runtime validation.
- TanStack Query — cache and refetch logic for API calls.
- QRCode (backend) and ZXing (frontend) — generate and decode QR reliably.
- Mongoose — schema validation and ODM for MongoDB.
- Sonner — non-intrusive toasts.
 - Lucide — clean icon set with tree-shaking.

---

## 15) Key Files Map (Where to Look)

- Contract: `contracts/contracts/HerbTraceability.sol`
- Deployment config: `contracts/hardhat.config.js`
- Frontend chain config + ABI/address: `frontend/src/lib/wagmi.ts`
- Gas helpers: `frontend/src/lib/gasUtils.ts`
- Add Herb UI: `frontend/src/app/add-herb/page.tsx`
- Update Status UI: `frontend/src/app/update-status/page.tsx`
- QR Scan UI: `frontend/src/app/scan/page.tsx`
- Map wrapper: `frontend/src/components/maps/MapWrapper.tsx`
- Backend API entry: `backend/server.js`
- Blockchain service (server): `backend/services/blockchainService.js`
- Herb controller (QR generation, CRUD): `backend/controllers/herbController.js`
- Routes: `backend/routes/*.js`

Exploration tips during demo:
- Start from `frontend/src/lib/wagmi.ts` to show chain config and contract address.
- Jump to `gasUtils.ts` to explain gas/no nonce policies.
- Show `update-status/page.tsx` for the existence check + auto-add flow.
- Open `herbController.js` to show QR generation and the `x-skip-blockchain` gate.

---

## 16) Common Questions (Jury Q&A Cheatsheet)

- Why hybrid on/off-chain?
  - On-chain gives immutability for status history; off-chain is needed for rich data (geo JSON, notes, farmer profiles) and scalability.

- How do you prevent duplicate or conflicting transactions?
  - A custom `x-skip-blockchain` header tells the backend to skip server-side writes when the user’s wallet is signing, ensuring exactly one on-chain submission per action.

- How do you avoid "nonce too low"?
  - We don’t set nonces manually. The wallet/provider manages nonces based on the latest pending state.

- What happens if herb exists in DB but not on-chain?
  - Update flow checks on-chain first; if missing, it auto-submits an `addHerb` using backend details, then `updateStatus`.

- How do QR codes work?
  - Backend generates a PNG/base64 QR that encodes the canonical herb URL. The `/scan` page decodes it and routes users to the herb details screen for verification.

- How are maps integrated without SSR issues?
  - All react-leaflet components are dynamically imported with `ssr:false` and the component re-mount logic ensures stable rendering when center/zoom changes.

- Why not store everything on-chain?
  - Cost, privacy, and queryability. On-chain is immutable and public—great for proofs, not for PII/large data.

- Why Wagmi/RainbowKit instead of raw ethers in FE?
  - Better UX (connectors, modals), typed calls, fewer edge cases, and ecosystem support.

---

## 17) Next Steps / Enhancements

- Role-based access control on-chain and backend.
- Merkle proofs or IPFS pinning for off-chain blobs.
- Indexing service (TheGraph or custom listener) for event-driven UI.
- Batch operations and gas optimizations.
- Production infra (CI/CD, observability, load tests).

---

## 18) Appendix: Troubleshooting

- MetaMask "Missing gas limit": ensure `gasUtils.getGasConfig` is applied and address/ABI/functionName/args match.
- Connection refused to backend: check CORS and that backend is running on 8080.
- Fuji RPC instability: try alternative RPC endpoints or increase retry timeouts.
- Types in Wagmi: complex generics can be noisy; where needed we use `// @ts-ignore` only at call sites with known-good params.

---

Prepared for: Jury presentation and deep-dive Q&A.
