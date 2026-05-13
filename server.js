import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const configPath = path.join(__dirname, "dapp-config.json");
const dbDir = path.join(__dirname, "data");
const dbPath = path.join(dbDir, "cryptedmail-db.json");
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

export async function handleRequest(req, res) {
  try {
    setCors(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (url.pathname.startsWith("/api/")) {
      await routeApi(req, res, url);
      return;
    }

    await serveStatic(res, url.pathname);
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || (status >= 500 ? "server_error" : "request_error");
    sendJson(res, status, { error: code, message: error.message });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createServer(handleRequest);
  server.on("error", (error) => {
    console.error(`Could not start cryptedmail server: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => {
    console.log(`cryptedmail dApp server running at http://${host}:${port}`);
  });
}

async function routeApi(req, res, url) {
  const pathname = apiAlias(url.pathname);

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && pathname === "/api/dapp/config") {
    const config = await loadConfig();
    sendJson(res, 200, publicConfig(config));
    return;
  }

  if (req.method === "GET" && pathname === "/api/dapp/subscription") {
    const config = await loadConfig();
    const auth = await requireAuthenticatedUser(req, {}, url, config);
    const user = await getStoredUser(auth.email);
    if (user?.subscription && isExpired(user.subscription)) {
      user.subscription.status = "expired";
      await saveSubscription(user.email, user.subscription);
    }
    sendJson(res, 200, { user });
    return;
  }

  if (req.method === "POST" && pathname === "/api/dapp/connect-wallet") {
    const body = await readJsonBody(req);
    const config = await loadConfig();
    const auth = await requireAuthenticatedUser(req, body, url, config);
    const email = auth.email;
    const walletAddress = requireAddress(body.walletAddress, "walletAddress");
    const user = await saveWalletLink(email, walletAddress);
    sendJson(res, 200, { user });
    return;
  }

  if (req.method === "POST" && pathname === "/api/dapp/record-pending") {
    const body = await readJsonBody(req);
    const config = await loadConfig();
    const auth = await requireAuthenticatedUser(req, body, url, config);
    const txHash = requireTxHash(body.txHash);
    const walletAddress = requireAddress(body.walletAddress, "walletAddress");
    const tierId = String(body.tierId || "").trim();
    if (!config.tiers?.[tierId]) {
      sendJson(res, 400, { error: "unknown_tier" });
      return;
    }
    await recordPendingPayment({ txHash, email: auth.email, walletAddress, tierId, network: config.activeNetwork });
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/dapp/verify-payment") {
    const body = await readJsonBody(req);
    const config = await loadConfig();
    const auth = await requireAuthenticatedUser(req, body, url, config);
    const email = auth.email;
    const walletAddress = requireAddress(body.walletAddress, "walletAddress");
    const txHash = requireTxHash(body.txHash);
    const tierId = String(body.tierId || "").trim();
    const tier = config.tiers?.[tierId];

    if (!tier) {
      sendJson(res, 400, { error: "unknown_tier" });
      return;
    }

    const existingPayment = await getStoredPayment(txHash);
    if (existingPayment && (existingPayment.email !== email || existingPayment.walletAddress !== walletAddress || existingPayment.tierId !== tierId)) {
      sendJson(res, 409, { error: "transaction_replay_blocked" });
      return;
    }

    const verification = await verifyUsdcPayment({ config, tierId, tier, walletAddress, txHash });
    if (!verification.ok) {
      sendJson(res, 402, verification);
      return;
    }

    const subscription = {
      status: "premium",
      tierId,
      tierName: tier.name,
      network: verification.networkKey,
      txHash,
      explorerUrl: verification.explorerUrl,
      premiumUntil: addDays(config.premiumAccessDays || 30),
      verifiedAt: new Date().toISOString()
    };

    const user = await savePremiumSubscription(email, walletAddress, subscription);
    await recordProcessedPayment(txHash, {
      email,
      walletAddress,
      tierId,
      amountUsdc: verification.amountUsdc,
      network: verification.networkKey,
      verifiedAt: subscription.verifiedAt
    });
    sendJson(res, 200, { ok: true, user, verification });
    return;
  }

  if (req.method === "POST" && pathname === "/api/dapp/verify-membership") {
    const body = await readJsonBody(req);
    const config = await loadConfig();
    const auth = await requireAuthenticatedUser(req, body, url, config);
    const email = auth.email;
    const walletAddress = requireAddress(body.walletAddress, "walletAddress");
    const tierId = String(body.tierId || "").trim();
    const tier = config.tiers?.[tierId];

    if (!tier) {
      sendJson(res, 400, { error: "unknown_tier" });
      return;
    }

    const verification = await verifyMembershipOwnership({ config, tierId, walletAddress });
    if (!verification.ok) {
      sendJson(res, 402, verification);
      return;
    }

    const subscription = {
      status: "premium",
      tierId,
      tierName: tier.name,
      network: verification.networkKey,
      membershipToken: verification.tokenAddress,
      premiumUntil: addDays(config.premiumAccessDays || 30),
      verifiedAt: new Date().toISOString()
    };

    const user = await savePremiumSubscription(email, walletAddress, subscription);
    sendJson(res, 200, { ok: true, user, verification });
    return;
  }

  if (req.method === "POST" && pathname === "/api/cron/reconcile") {
    if (!isCron(req)) {
      sendJson(res, 401, { error: "cron_secret_required" });
      return;
    }
    const result = await reconcilePendingPayments();
    sendJson(res, 200, result);
    return;
  }

  if (req.method === "GET" && pathname === "/api/admin/config") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { error: "admin_token_required" });
      return;
    }
    sendJson(res, 200, await loadConfig());
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/config") {
    if (!isAdmin(req)) {
      sendJson(res, 401, { error: "admin_token_required" });
      return;
    }
    const current = await loadConfig();
    const incoming = await readJsonBody(req);
    const updated = mergeAdminConfig(current, incoming);
    await writeFile(configPath, JSON.stringify(updated, null, 2));
    sendJson(res, 200, publicConfig(updated));
    return;
  }

  sendJson(res, 404, { error: "not_found" });
}

async function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(__dirname, safePath));

  if (!filePath.startsWith(__dirname)) {
    sendJson(res, 403, { error: "forbidden" });
    return;
  }

  const content = await readFile(filePath);
  const ext = path.extname(filePath);
  res.writeHead(200, { "content-type": mimeTypes[ext] || "application/octet-stream" });
  res.end(content);
}

function apiAlias(pathname) {
  const aliases = {
    "/api/dapp-config": "/api/dapp/config",
    "/api/dapp-subscription": "/api/dapp/subscription",
    "/api/dapp-connect-wallet": "/api/dapp/connect-wallet",
    "/api/dapp-record-pending": "/api/dapp/record-pending",
    "/api/dapp-verify-payment": "/api/dapp/verify-payment",
    "/api/dapp-verify-membership": "/api/dapp/verify-membership",
    "/api/cron-reconcile": "/api/cron/reconcile",
    "/api/admin-config": "/api/admin/config"
  };

  return aliases[pathname] || pathname;
}

async function verifyUsdcPayment({ config, tierId, tier, walletAddress, txHash }) {
  const networkKey = config.activeNetwork || "base";
  const network = config.networks?.[networkKey];
  const receivingAddress = normalizeAddress(config.receivingAddress);

  if (!network) {
    return { ok: false, error: "network_not_configured" };
  }
  if (!receivingAddress || receivingAddress === "0x0000000000000000000000000000000000000000") {
    return { ok: false, error: "receiving_address_not_configured" };
  }

  const receipt = await rpc(network.rpcUrl, "eth_getTransactionReceipt", [txHash]);
  if (!receipt) {
    return { ok: false, error: "transaction_pending" };
  }
  if (receipt.status !== "0x1") {
    return { ok: false, error: "transaction_failed" };
  }

  const latestBlock = hexToBigInt(await rpc(network.rpcUrl, "eth_blockNumber", []));
  const receiptBlock = hexToBigInt(receipt.blockNumber);
  const confirmations = Number(latestBlock - receiptBlock + 1n);
  if (confirmations < Number(config.minConfirmations || 1)) {
    return { ok: false, error: "waiting_for_confirmations", confirmations };
  }

  const expectedAmount = parseUsdcUnits(tier.priceUsdc);
  const usdcAddress = normalizeAddress(network.usdcAddress);
  const payer = normalizeAddress(walletAddress);

  const paymentLog = (receipt.logs || []).find((log) => {
    if (normalizeAddress(log.address) !== usdcAddress) {
      return false;
    }
    if ((log.topics?.[0] || "").toLowerCase() !== transferTopic) {
      return false;
    }

    const from = topicAddress(log.topics?.[1]);
    const to = topicAddress(log.topics?.[2]);
    const amount = hexToBigInt(log.data);
    return from === payer && to === receivingAddress && amount >= expectedAmount;
  });

  if (!paymentLog) {
    return {
      ok: false,
      error: "matching_usdc_transfer_not_found",
      expected: {
        tierId,
        amountUsdc: tier.priceUsdc,
        from: payer,
        to: receivingAddress,
        usdcAddress
      }
    };
  }

  return {
    ok: true,
    networkKey,
    networkName: network.name,
    explorerUrl: `${network.blockExplorerTx}${txHash}`,
    amountUsdc: formatUsdc(hexToBigInt(paymentLog.data)),
    confirmations
  };
}

async function verifyMembershipOwnership({ config, tierId, walletAddress }) {
  const token = config.membershipTokens?.[tierId];
  if (!token?.tokenAddress) {
    return { ok: false, error: "membership_token_not_configured" };
  }

  const networkKey = token.network || config.activeNetwork || "base";
  const network = config.networks?.[networkKey];
  if (!network) {
    return { ok: false, error: "network_not_configured" };
  }

  const tokenAddress = requireAddress(token.tokenAddress, "membership token");
  const wallet = requireAddress(walletAddress, "walletAddress");
  const tokenType = String(token.tokenType || "erc721").toLowerCase();
  const data = tokenType === "erc1155"
    ? encodeBalanceOf1155(wallet, BigInt(token.tokenId || "0"))
    : encodeBalanceOf(wallet);
  const result = await rpc(network.rpcUrl, "eth_call", [{ to: tokenAddress, data }, "latest"]);
  const balance = hexToBigInt(result);

  if (balance <= 0n) {
    return { ok: false, error: "membership_token_not_owned", tokenAddress, networkKey };
  }

  return {
    ok: true,
    networkKey,
    networkName: network.name,
    tokenAddress,
    tokenType,
    balance: balance.toString()
  };
}

async function rpc(rpcUrl, method, params) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params })
  });
  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.message || "RPC error");
  }
  return payload.result;
}

function mergeAdminConfig(current, incoming) {
  const next = JSON.parse(JSON.stringify(current));

  if (incoming.activeNetwork) {
    next.activeNetwork = String(incoming.activeNetwork);
  }
  if (incoming.receivingAddress) {
    next.receivingAddress = requireAddress(incoming.receivingAddress, "receivingAddress");
  }
  if (incoming.walletConnectProjectId) {
    next.walletConnectProjectId = String(incoming.walletConnectProjectId).trim();
  }
  if (incoming.premiumAccessDays) {
    next.premiumAccessDays = Math.max(1, Number(incoming.premiumAccessDays));
  }
  if (incoming.tiers && typeof incoming.tiers === "object") {
    Object.entries(incoming.tiers).forEach(([tierId, tier]) => {
      next.tiers[tierId] = {
        name: String(tier.name || next.tiers[tierId]?.name || tierId),
        priceUsdc: String(tier.priceUsdc || next.tiers[tierId]?.priceUsdc || "0")
      };
    });
  }
  if (incoming.membershipTokens && typeof incoming.membershipTokens === "object") {
    next.membershipTokens = next.membershipTokens || {};
    Object.entries(incoming.membershipTokens).forEach(([tierId, token]) => {
      next.membershipTokens[tierId] = {
        ...(next.membershipTokens[tierId] || {}),
        ...token
      };
    });
  }
  if (incoming.networks && typeof incoming.networks === "object") {
    Object.entries(incoming.networks).forEach(([networkId, network]) => {
      next.networks[networkId] = {
        ...(next.networks[networkId] || {}),
        ...network,
        chainId: Number(network.chainId || next.networks[networkId]?.chainId)
      };
    });
  }

  return next;
}

async function loadConfig() {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  if (process.env.CRYPTEDMAIL_TEST_MODE) {
    config.testMode = process.env.CRYPTEDMAIL_TEST_MODE === "true";
  }
  if (process.env.CRYPTEDMAIL_RECEIVER_ADDRESS) {
    config.receivingAddress = process.env.CRYPTEDMAIL_RECEIVER_ADDRESS;
  }
  if (process.env.WALLETCONNECT_PROJECT_ID) {
    config.walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID;
  }
  if (process.env.CRYPTEDMAIL_NETWORK) {
    config.activeNetwork = process.env.CRYPTEDMAIL_NETWORK;
  }
  if (process.env.BASE_RPC_URL && config.networks?.base) {
    config.networks.base.rpcUrl = process.env.BASE_RPC_URL;
  }
  if (process.env.POLYGON_RPC_URL && config.networks?.polygon) {
    config.networks.polygon.rpcUrl = process.env.POLYGON_RPC_URL;
  }
  return config;
}

async function getStoredUser(email) {
  if (hasSupabase()) {
    const profile = await supabaseSelectOne("profiles", `email=eq.${encodeURIComponent(email)}&select=*`);
    const subscription = await supabaseSelectOne("subscriptions", `email=eq.${encodeURIComponent(email)}&select=*`);
    if (!profile) {
      return null;
    }
    return dbUser(profile, subscription);
  }

  const db = await loadDb();
  return db.users[email] || null;
}

async function saveWalletLink(email, walletAddress) {
  if (hasSupabase()) {
    const now = new Date().toISOString();
    await supabaseUpsert("profiles", {
      email,
      wallet_address: walletAddress,
      wallet_linked_at: now,
      updated_at: now
    }, "email");
    return getStoredUser(email);
  }

  const db = await loadDb();
  const user = upsertUser(db, email);
  user.walletAddress = walletAddress;
  user.walletLinkedAt = new Date().toISOString();
  await saveDb(db);
  return user;
}

async function saveSubscription(email, subscription) {
  if (hasSupabase()) {
    await supabaseUpsert("subscriptions", subscriptionRow(email, subscription), "email");
    return;
  }

  const db = await loadDb();
  const user = upsertUser(db, email);
  user.subscription = subscription;
  await saveDb(db);
}

async function savePremiumSubscription(email, walletAddress, subscription) {
  if (hasSupabase()) {
    await saveWalletLink(email, walletAddress);
    await saveSubscription(email, subscription);
    return getStoredUser(email);
  }

  const db = await loadDb();
  const user = upsertUser(db, email);
  user.walletAddress = walletAddress;
  user.subscription = subscription;
  await saveDb(db);
  return user;
}

async function getStoredPayment(txHash) {
  if (hasSupabase()) {
    const payment = await supabaseSelectOne("processed_transactions", `tx_hash=eq.${txHash}&select=*`);
    return payment ? {
      txHash: payment.tx_hash,
      email: payment.email,
      walletAddress: payment.wallet_address,
      tierId: payment.tier_id
    } : null;
  }

  const db = await loadDb();
  const payment = db.payments[txHash];
  return payment ? {
    txHash,
    email: payment.email,
    walletAddress: payment.walletAddress,
    tierId: payment.tierId
  } : null;
}

async function recordProcessedPayment(txHash, payment) {
  if (hasSupabase()) {
    await supabaseUpsert("processed_transactions", {
      tx_hash: txHash,
      email: payment.email,
      wallet_address: payment.walletAddress,
      tier_id: payment.tierId,
      amount_usdc: payment.amountUsdc,
      network: payment.network,
      status: "verified",
      verified_at: payment.verifiedAt
    }, "tx_hash");
    await updatePendingStatus(txHash, "verified");
    return;
  }

  const db = await loadDb();
  db.payments[txHash] = payment;
  if (db.pendingPayments?.[txHash]) {
    db.pendingPayments[txHash].status = "verified";
  }
  await saveDb(db);
}

async function recordPendingPayment(payment) {
  if (hasSupabase()) {
    await saveWalletLink(payment.email, payment.walletAddress);
    await supabaseUpsert("pending_payments", {
      tx_hash: payment.txHash,
      email: payment.email,
      wallet_address: payment.walletAddress,
      tier_id: payment.tierId,
      network: payment.network,
      status: "pending",
      updated_at: new Date().toISOString()
    }, "tx_hash");
    return;
  }

  const db = await loadDb();
  db.pendingPayments = db.pendingPayments || {};
  db.pendingPayments[payment.txHash] = { ...payment, status: "pending", createdAt: new Date().toISOString() };
  await saveDb(db);
}

async function listPendingPayments() {
  if (hasSupabase()) {
    const rows = await supabaseSelect("pending_payments", "status=eq.pending&select=*&limit=50");
    return rows.map((row) => ({
      txHash: row.tx_hash,
      email: row.email,
      walletAddress: row.wallet_address,
      tierId: row.tier_id,
      network: row.network
    }));
  }

  const db = await loadDb();
  return Object.values(db.pendingPayments || {}).filter((payment) => payment.status === "pending");
}

async function updatePendingStatus(txHash, status) {
  if (hasSupabase()) {
    await supabasePatch("pending_payments", `tx_hash=eq.${txHash}`, { status, updated_at: new Date().toISOString() });
    return;
  }

  const db = await loadDb();
  if (db.pendingPayments?.[txHash]) {
    db.pendingPayments[txHash].status = status;
    await saveDb(db);
  }
}

async function loadDb() {
  await mkdir(dbDir, { recursive: true });
  if (!existsSync(dbPath)) {
    return { users: {}, payments: {}, pendingPayments: {} };
  }
  return JSON.parse(await readFile(dbPath, "utf8"));
}

async function saveDb(db) {
  await mkdir(dbDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

function publicConfig(config) {
  const network = config.networks?.[config.activeNetwork];
  return {
    testMode: Boolean(config.testMode),
    activeNetwork: config.activeNetwork,
    network,
    networks: config.networks,
    receivingAddress: config.receivingAddress,
    receiverConfigured: normalizeAddress(config.receivingAddress) !== "0x0000000000000000000000000000000000000000",
    walletConnectProjectId: config.walletConnectProjectId,
    walletConnectConfigured: Boolean(config.walletConnectProjectId && !config.walletConnectProjectId.includes("REPLACE")),
    supabase: {
      configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      url: process.env.SUPABASE_URL || "",
      anonKey: process.env.SUPABASE_ANON_KEY || ""
    },
    premiumAccessDays: config.premiumAccessDays,
    tiers: config.tiers
  };
}

function upsertUser(db, email) {
  db.users[email] = db.users[email] || { email, createdAt: new Date().toISOString() };
  return db.users[email];
}

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseSelect(table, query) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders()
  });
  if (!response.ok) {
    throw new Error(`Supabase select failed for ${table}`);
  }
  return response.json();
}

async function supabaseSelectOne(table, query) {
  const rows = await supabaseSelect(table, `${query}&limit=1`);
  return rows[0] || null;
}

async function supabaseUpsert(table, row, onConflict) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(row)
  });
  if (!response.ok) {
    throw new Error(`Supabase upsert failed for ${table}`);
  }
  return response.json();
}

async function supabasePatch(table, query, body) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Supabase update failed for ${table}`);
  }
}

function supabaseHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  };
}

function dbUser(profile, subscription) {
  return {
    email: profile.email,
    walletAddress: profile.wallet_address || "",
    walletLinkedAt: profile.wallet_linked_at || "",
    subscription: subscription ? {
      status: subscription.status,
      tierId: subscription.tier_id,
      tierName: subscription.tier_name,
      network: subscription.network,
      txHash: subscription.tx_hash,
      explorerUrl: subscription.explorer_url,
      membershipToken: subscription.membership_token,
      premiumUntil: subscription.premium_until,
      verifiedAt: subscription.verified_at
    } : null
  };
}

function subscriptionRow(email, subscription) {
  return {
    email,
    status: subscription.status,
    tier_id: subscription.tierId,
    tier_name: subscription.tierName,
    network: subscription.network,
    tx_hash: subscription.txHash || null,
    explorer_url: subscription.explorerUrl || null,
    membership_token: subscription.membershipToken || null,
    premium_until: subscription.premiumUntil,
    verified_at: subscription.verifiedAt,
    updated_at: new Date().toISOString()
  };
}

function isAdmin(req) {
  const token = process.env.CRYPTEDMAIL_ADMIN_TOKEN;
  return Boolean(token && req.headers["x-admin-token"] === token);
}

function isCron(req) {
  const token = process.env.CRON_SECRET;
  return Boolean(token && req.headers.authorization === `Bearer ${token}`);
}

async function requireAuthenticatedUser(req, body, url, config) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (token) {
    return verifySupabaseJwt(token);
  }

  if (config.testMode || process.env.CRYPTEDMAIL_TEST_MODE === "true") {
    return { email: requireEmail(body.email || url.searchParams.get("email")), testMode: true };
  }

  throw apiError(401, "supabase_token_required", "Supabase login token required");
}

async function verifySupabaseJwt(token) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw apiError(500, "supabase_auth_not_configured", "Supabase auth environment variables are missing");
  }

  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      authorization: `Bearer ${token}`
    }
  });
  const user = await response.json();
  if (!response.ok || !user.email) {
    throw apiError(401, "invalid_supabase_session", "Invalid Supabase session");
  }
  return { email: requireEmail(user.email), id: user.id };
}

async function reconcilePendingPayments() {
  const config = await loadConfig();
  const pending = await listPendingPayments();
  const results = [];

  for (const payment of pending) {
    const tier = config.tiers?.[payment.tierId];
    if (!tier) {
      await updatePendingStatus(payment.txHash, "unknown_tier");
      results.push({ txHash: payment.txHash, ok: false, error: "unknown_tier" });
      continue;
    }

    const verification = await verifyUsdcPayment({
      config,
      tierId: payment.tierId,
      tier,
      walletAddress: payment.walletAddress,
      txHash: payment.txHash
    });

    if (!verification.ok) {
      results.push({ txHash: payment.txHash, ...verification });
      continue;
    }

    const subscription = {
      status: "premium",
      tierId: payment.tierId,
      tierName: tier.name,
      network: verification.networkKey,
      txHash: payment.txHash,
      explorerUrl: verification.explorerUrl,
      premiumUntil: addDays(config.premiumAccessDays || 30),
      verifiedAt: new Date().toISOString()
    };
    await savePremiumSubscription(payment.email, payment.walletAddress, subscription);
    await recordProcessedPayment(payment.txHash, {
      email: payment.email,
      walletAddress: payment.walletAddress,
      tierId: payment.tierId,
      amountUsdc: verification.amountUsdc,
      network: verification.networkKey,
      verifiedAt: subscription.verifiedAt
    });
    results.push({ txHash: payment.txHash, ok: true });
  }

  return { ok: true, checked: pending.length, results };
}

async function readJsonBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    throw apiError(400, "invalid_json", "Request body must be valid JSON");
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function setCors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "authorization,content-type,x-admin-token");
}

function requireEmail(value) {
  const email = normalizeEmail(value);
  if (!email) {
    throw apiError(400, "valid_email_required", "Valid email is required");
  }
  return email;
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email) ? email : "";
}

function requireAddress(value, label) {
  const address = normalizeAddress(value);
  if (!address) {
    throw apiError(400, "valid_address_required", `${label} must be a valid EVM address`);
  }
  return address;
}

function normalizeAddress(value) {
  const address = String(value || "").trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(address) ? address : "";
}

function requireTxHash(value) {
  const txHash = String(value || "").trim().toLowerCase();
  if (!/^0x[a-f0-9]{64}$/.test(txHash)) {
    throw apiError(400, "valid_transaction_hash_required", "txHash must be a valid transaction hash");
  }
  return txHash;
}

function apiError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function topicAddress(topic) {
  const value = String(topic || "").toLowerCase();
  return /^0x[a-f0-9]{64}$/.test(value) ? `0x${value.slice(-40)}` : "";
}

function hexToBigInt(value) {
  return BigInt(value || "0x0");
}

function parseUsdcUnits(value) {
  const [wholeRaw, fractionRaw = ""] = String(value || "0").split(".");
  const whole = BigInt(wholeRaw || "0") * 1_000_000n;
  const fraction = BigInt((fractionRaw.replace(/\D/g, "") + "000000").slice(0, 6));
  return whole + fraction;
}

function encodeBalanceOf(address) {
  return `0x70a08231${normalizeAddress(address).replace("0x", "").padStart(64, "0")}`;
}

function encodeBalanceOf1155(address, tokenId) {
  const wallet = normalizeAddress(address).replace("0x", "").padStart(64, "0");
  const id = tokenId.toString(16).padStart(64, "0");
  return `0x00fdd58e${wallet}${id}`;
}

function formatUsdc(units) {
  const whole = units / 1_000_000n;
  const fraction = String(units % 1_000_000n).padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

function addDays(days) {
  return new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString();
}

function isExpired(subscription) {
  return subscription?.premiumUntil && Date.parse(subscription.premiumUntil) <= Date.now();
}
