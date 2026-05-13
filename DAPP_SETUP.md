# cryptedmail dApp Upgrade Setup

This keeps normal email/password login and adds wallet upgrade only for blockchain features.

## Exact Value Placement

- WalletConnect Project ID: put it in Vercel as `WALLETCONNECT_PROJECT_ID`, and locally in `.env` using `.env.example`.
- WalletConnect allowlist: in WalletConnect Cloud project settings, add your deployed Vercel hostname, for example `crypted-i9mu.vercel.app`. Allowlist changes can take about 15 minutes.
- Supabase URL: put it in Vercel as `SUPABASE_URL`.
- Supabase anon/public key: put it in Vercel as `SUPABASE_ANON_KEY`.
- Supabase service role key: put it in Vercel as `SUPABASE_SERVICE_ROLE_KEY`. Never expose this in frontend code.
- Receiving wallet address: already set in `dapp-config.json` as `receivingAddress`; for production also set `CRYPTEDMAIL_RECEIVER_ADDRESS`.
- Base RPC URL: put it in Vercel as `BASE_RPC_URL`. Public fallback is `https://mainnet.base.org`.
- Subscription prices: edit `dapp-config.json` under `tiers.plus.priceUsdc` and `tiers.vault.priceUsdc`.
- Premium access length: edit `premiumAccessDays` in `dapp-config.json` or set it through the admin API.

## Test Mode

`testMode` is on by default in `dapp-config.json`.

While test mode is on:

- users can connect wallets
- the checkout UI appears
- real USDC sending is blocked

Turn test mode off only after Supabase, WalletConnect, receiving wallet, and Base RPC are configured.

## Supabase Tables

Open Supabase, go to SQL Editor, and run:

```text
supabase.sql
```

This creates:

- `profiles`
- `subscriptions`
- `processed_transactions`
- `pending_payments`

The backend uses `SUPABASE_SERVICE_ROLE_KEY` to write verified premium status. Users can only read their own profile/subscription through Supabase policies.

## Supabase Auth Sessions

When `CRYPTEDMAIL_TEST_MODE=false`, premium routes require a real Supabase login token.
The app uses the normal email/password form and, when Supabase is configured, stores the Supabase access token locally for protected flat `/api/dapp-*` calls.

In Supabase, open Authentication -> Providers -> Email and enable email/password signups.
For the smoothest launch demo, leave email confirmation off until your real email-sending domain is configured.

## Local Run

```bash
node server.js
```

Then open:

```text
http://127.0.0.1:8787/index.html
```

## Vercel Deploy

1. Create a GitHub repository.
2. Upload/push this folder.
3. In Vercel, import the GitHub repo.
4. Add every variable from `.env.example` in Vercel Project Settings -> Environment Variables.
5. Set `CRYPTEDMAIL_TEST_MODE=true` for the first deploy.
6. Deploy.
7. Test email login, wallet connection, and checkout UI.
8. After a real receiving wallet, RPC, and Supabase are confirmed, set `CRYPTEDMAIL_TEST_MODE=false`.

## Reliability

The frontend records pending transaction hashes with `/api/dapp-record-pending`.
If a user refreshes or disconnects, `/api/cron-reconcile` can verify pending payments later.
Protect that endpoint with `CRON_SECRET`.

## Security

The frontend never unlocks premium by itself. Premium unlock happens only after the backend verifies:

- the transaction exists
- it is confirmed
- it is a USDC transfer
- it came from the connected wallet
- it went to your receiving wallet
- it paid at least the configured tier price
- the transaction hash has not already been used for another account/tier

No seed phrases, recovery phrases, or private keys are requested or stored.
