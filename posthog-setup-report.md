<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the cryptedmail project. PostHog is now tracking 13 events across both the client-side vanilla JS app and the Node.js/Vercel server, with full user identification and client-server correlation.

**Files modified:**
- `index.html` — Added posthog-js CDN script tag
- `app.js` — PostHog initialization on config load, 11 client-side event captures, user identify calls, exception capture, and session/distinct-ID headers on API requests
- `server.js` — Added posthog-node import and client, exposed PostHog public config via `/api/dapp-config`, and captured 2 server-side events for payment and membership verification
- `.env` — Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST`
- `package.json` — Added `posthog-node` dependency

**Architecture note:** Since cryptedmail is a vanilla JS SPA without a build step, posthog-js is loaded from CDN and initialized lazily after the `/api/dapp-config` response delivers the public token. This keeps the token in an environment variable (never hardcoded in source) while avoiding a build pipeline.

| Event | Description | File |
|---|---|---|
| `account_signed_up` | New cryptedmail account created during signup flow | `app.js` |
| `account_logged_in` | Existing user logs into their mailbox | `app.js` |
| `email_sent` | User sends a standard email via the compose form | `app.js` |
| `email_encrypted_sent` | User sends a receiver-locked encrypted email | `app.js` |
| `plan_upgrade_started` | User initiates the USDC crypto upgrade flow for a paid plan | `app.js` |
| `plan_trial_activated` | User activates a free trial for a paid plan | `app.js` |
| `plan_purchased` | User completes the card checkout purchase flow | `app.js` |
| `wallet_connected` | User successfully connects their crypto wallet | `app.js` |
| `alias_address_added` | User creates a new disposable alias address | `app.js` |
| `alias_address_burned` | User burns (deactivates) a disposable alias address | `app.js` |
| `account_deactivated` | User permanently deactivates their primary mailbox | `app.js` |
| `payment_verified` | USDC payment successfully verified on-chain (server-side) | `server.js` |
| `membership_verified` | NFT/token membership ownership verified for plan access (server-side) | `server.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1586617)
- [Signups & Logins Over Time](/insights/xZZ4Zzok)
- [Signup to Paid Conversion Funnel](/insights/N1qYDeaR)
- [Plan Upgrades & Trials](/insights/AbHCBwVG)
- [Churn & Burn Events](/insights/xHTwR81c)
- [Email Activity](/insights/lto38a4B)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-pages-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
