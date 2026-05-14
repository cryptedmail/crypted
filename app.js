const brandName = "cryptedmail";
const appVersion = "visual-polish-20260514";
const mailDomain = "cryptedmail.com";
const accountsKey = "cryptedmail-accounts-v2";
const sessionKey = "cryptedmail-session-v2";
const ownerSessionKey = "cryptedmail-owner-session-v1";
const supabaseSessionKey = "cryptedmail-supabase-session-v1";
const deployedApiBase = "https://crypted-i9mu.vercel.app";
const dappApiBase = window.location.protocol === "file:" ? deployedApiBase : "";
const ownerAddress = `owner@${mailDomain}`;
const ownerDefaultPassword = "owner1234";
const ownerReservedAddresses = [
  ownerAddress,
  `support@${mailDomain}`,
  `abuse@${mailDomain}`,
  `billing@${mailDomain}`,
  `admin@${mailDomain}`
];
const marketingPageIds = ["features", "pricing", "download", "blog", "about", "support"];
const marketingHashMap = {
  terms: "pricing",
  securePlusPage: "pricing",
  vaultPage: "pricing",
  plansGrid: "pricing"
};

const state = {
  authMode: "signup",
  selectedPlan: "starter",
  pendingPurchasePlan: "plus",
  pendingPaymentMethod: "card",
  pendingCheckoutTier: null,
  pendingCheckoutTx: "",
  dappConfig: null,
  connectedWalletProvider: null,
  connectedWalletAddress: "",
  walletProviders: {},
  dappLoading: false,
  accounts: loadAccounts(),
  profile: null,
  authenticated: false,
  view: "mailbox",
  mailbox: [],
  selectedFolder: "inbox",
  addressFilter: "all",
  selectedId: null,
  toastTimer: null
};

const els = {
  refreshBrand: document.querySelector("#refreshBrand"),
  navMenuButton: document.querySelector("#navMenuButton"),
  marketingNav: document.querySelector("#marketingNav"),
  homeLoginButton: document.querySelector("#homeLoginButton"),
  homeSignupButton: document.querySelector("#homeSignupButton"),
  heroLoginButton: document.querySelector("#heroLoginButton"),
  heroSignupButton: document.querySelector("#heroSignupButton"),
  signupTab: document.querySelector("#signupTab"),
  loginTab: document.querySelector("#loginTab"),
  authForm: document.querySelector("#authForm"),
  authEyebrow: document.querySelector("#authEyebrow"),
  authTitle: document.querySelector("#authTitle"),
  authSubmit: document.querySelector("#authSubmit"),
  ownerLoginButton: document.querySelector("#ownerLoginButton"),
  addressInput: document.querySelector("#addressInput"),
  passphraseInput: document.querySelector("#passphraseInput"),
  randomAddressButton: document.querySelector("#randomAddressButton"),
  activeAddress: document.querySelector("#activeAddress"),
  activeAddressSelect: document.querySelector("#activeAddressSelect"),
  upgradeButton: document.querySelector("#upgradeButton"),
  upgradeView: document.querySelector("#upgradeView"),
  backToMailboxButton: document.querySelector("#backToMailboxButton"),
  upgradeAccountAddress: document.querySelector("#upgradeAccountAddress"),
  walletEmailStatus: document.querySelector("#walletEmailStatus"),
  walletStatus: document.querySelector("#walletStatus"),
  upgradeUnlockStatus: document.querySelector("#upgradeUnlockStatus"),
  walletProviderSelect: document.querySelector("#walletProviderSelect"),
  walletAddressInput: document.querySelector("#walletAddressInput"),
  connectWalletButton: document.querySelector("#connectWalletButton"),
  useTestWalletButton: document.querySelector("#useTestWalletButton"),
  walletHelpBox: document.querySelector("#walletHelpBox"),
  walletHelpTitle: document.querySelector("#walletHelpTitle"),
  walletHelpText: document.querySelector("#walletHelpText"),
  walletInstallLink: document.querySelector("#walletInstallLink"),
  useWalletConnectButton: document.querySelector("#useWalletConnectButton"),
  walletConnectQrBox: document.querySelector("#walletConnectQrBox"),
  walletConnectQrFrame: document.querySelector("#walletConnectQrFrame"),
  walletConnectUri: document.querySelector("#walletConnectUri"),
  copyWalletConnectUri: document.querySelector("#copyWalletConnectUri"),
  openWalletConnectUri: document.querySelector("#openWalletConnectUri"),
  dappCheckoutBox: document.querySelector("#dappCheckoutBox"),
  dappCheckoutBadge: document.querySelector("#dappCheckoutBadge"),
  dappCheckoutPlan: document.querySelector("#dappCheckoutPlan"),
  dappCheckoutPrice: document.querySelector("#dappCheckoutPrice"),
  dappCheckoutNetwork: document.querySelector("#dappCheckoutNetwork"),
  dappCheckoutWallet: document.querySelector("#dappCheckoutWallet"),
  dappTxStatus: document.querySelector("#dappTxStatus"),
  dappSendPaymentButton: document.querySelector("#dappSendPaymentButton"),
  dappExplorerLink: document.querySelector("#dappExplorerLink"),
  tipAmountInput: document.querySelector("#tipAmountInput"),
  tipAssetSelect: document.querySelector("#tipAssetSelect"),
  sendTipButton: document.querySelector("#sendTipButton"),
  tipStatus: document.querySelector("#tipStatus"),
  dashboardView: document.querySelector("#dashboardView"),
  planDashboard: document.querySelector("#planDashboard"),
  planDashboardEyebrow: document.querySelector("#planDashboardEyebrow"),
  planDashboardTitle: document.querySelector("#planDashboardTitle"),
  planDashboardText: document.querySelector("#planDashboardText"),
  planDashboardMetrics: document.querySelector("#planDashboardMetrics"),
  mailboxTitle: document.querySelector("#mailboxTitle"),
  mailboxPanelTitle: document.querySelector("#mailboxPanelTitle"),
  mailCount: document.querySelector("#mailCount"),
  mailSearch: document.querySelector("#mailSearch"),
  signOutButton: document.querySelector("#signOutButton"),
  deactivateButton: document.querySelector("#deactivateButton"),
  addressFilterList: document.querySelector("#addressFilterList"),
  planBadge: document.querySelector("#planBadge"),
  planToolsSummary: document.querySelector("#planToolsSummary"),
  aliasHandleInput: document.querySelector("#aliasHandleInput"),
  generatePlanAddress: document.querySelector("#generatePlanAddress"),
  vaultTools: document.querySelector("#vaultTools"),
  vaultThemeSelect: document.querySelector("#vaultThemeSelect"),
  addressColorInput: document.querySelector("#addressColorInput"),
  vaultVipButton: document.querySelector("#vaultVipButton"),
  vaultGlowButton: document.querySelector("#vaultGlowButton"),
  vaultLockdownButton: document.querySelector("#vaultLockdownButton"),
  vaultLinuxButton: document.querySelector("#vaultLinuxButton"),
  vaultPrestigeButton: document.querySelector("#vaultPrestigeButton"),
  vaultGhostButton: document.querySelector("#vaultGhostButton"),
  vaultQueueButton: document.querySelector("#vaultQueueButton"),
  vaultXpButton: document.querySelector("#vaultXpButton"),
  vaultAdminStatus: document.querySelector("#vaultAdminStatus"),
  ownerTools: document.querySelector("#ownerTools"),
  ownerSupportQueue: document.querySelector("#ownerSupportQueue"),
  ownerAdminStatus: document.querySelector("#ownerAdminStatus"),
  ownerVersionBadge: document.querySelector("#ownerVersionBadge"),
  ownerGrantVaultButton: document.querySelector("#ownerGrantVaultButton"),
  ownerVerifyPaymentButton: document.querySelector("#ownerVerifyPaymentButton"),
  ownerFreezeAddressButton: document.querySelector("#ownerFreezeAddressButton"),
  ownerResolveSupportButton: document.querySelector("#ownerResolveSupportButton"),
  ownerExportSupportButton: document.querySelector("#ownerExportSupportButton"),
  ownerSystemModeButton: document.querySelector("#ownerSystemModeButton"),
  planAddressList: document.querySelector("#planAddressList"),
  paidPerkGrid: document.querySelector("#paidPerkGrid"),
  focusComposeButton: document.querySelector("#focusComposeButton"),
  messageList: document.querySelector("#messageList"),
  messagePreview: document.querySelector("#messagePreview"),
  messageStatus: document.querySelector("#messageStatus"),
  composePanel: document.querySelector("#composePanel"),
  fromSelect: document.querySelector("#fromSelect"),
  fromInput: document.querySelector("#fromInput"),
  toInput: document.querySelector("#toInput"),
  subjectInput: document.querySelector("#subjectInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  bodyInput: document.querySelector("#bodyInput"),
  encryptToggle: document.querySelector("#encryptToggle"),
  composeForm: document.querySelector("#composeForm"),
  composeSecurityRibbon: document.querySelector("#composeSecurityRibbon"),
  encryptedOutput: document.querySelector("#encryptedOutput"),
  copyEncryptedButton: document.querySelector("#copyEncryptedButton"),
  readerPaste: document.querySelector("#readerPaste"),
  readEncryptedButton: document.querySelector("#readEncryptedButton"),
  readerOutput: document.querySelector("#readerOutput"),
  confirmDialog: document.querySelector("#confirmDialog"),
  cancelDeactivate: document.querySelector("#cancelDeactivate"),
  confirmDeactivate: document.querySelector("#confirmDeactivate"),
  purchaseDialog: document.querySelector("#purchaseDialog"),
  purchaseTitle: document.querySelector("#purchaseTitle"),
  purchaseSummary: document.querySelector("#purchaseSummary"),
  purchasePrice: document.querySelector("#purchasePrice"),
  purchaseCycle: document.querySelector("#purchaseCycle"),
  purchasePerks: document.querySelector("#purchasePerks"),
  checkoutEmail: document.querySelector("#checkoutEmail"),
  checkoutWallet: document.querySelector("#checkoutWallet"),
  closePurchase: document.querySelector("#closePurchase"),
  tryPurchasePlan: document.querySelector("#tryPurchasePlan"),
  completePurchase: document.querySelector("#completePurchase"),
  toast: document.querySelector("#toast")
};

boot();

async function boot() {
  if (window.location.search) {
    window.history.replaceState(null, "", window.location.pathname + window.location.hash);
  }

  window.cryptedmailVersion = appVersion;
  document.documentElement.dataset.cryptedmailVersion = appVersion;
  await ensureOwnerAccount();
  discoverInjectedWallets();
  loadDappConfig();

  const sessionAddress = normalizeEmail(sessionStorage.getItem(sessionKey));
  const ownerSessionAddress = ownerAddressFromInput(sessionAddress || localStorage.getItem(ownerSessionKey));
  if (ownerSessionAddress && state.accounts[ownerAddress]) {
    openOwnerSession(ownerSessionAddress);
  } else if (sessionAddress && state.accounts[sessionAddress]) {
    setCurrentAccount(sessionAddress);
  }
  hydrateWalletLink();

  bindEvents();
  initMarketingPages();
  setAuthMode("signup");
  selectPlan("starter");
  render();
  window.cryptedmailAppReady = true;
}

function initMarketingPages() {
  setMarketingPage(marketingPageFromHash(window.location.hash), { scroll: false });
  window.addEventListener("hashchange", () => {
    setMarketingPage(marketingPageFromHash(window.location.hash), {
      scroll: !state.authenticated,
      scrollId: hashId(window.location.hash)
    });
  });
}

function handleMarketingLinkClick(event, link) {
  const id = hashId(link.getAttribute("href") || "");
  const page = marketingPageFromHash(`#${id}`);
  if (!page) {
    return;
  }

  event.preventDefault();
  document.body.classList.remove("nav-open");
  els.navMenuButton.setAttribute("aria-expanded", "false");
  setMarketingPage(page, { updateHash: id, scroll: true, scrollId: id });
}

function marketingPageFromHash(hash) {
  const id = hashId(hash);
  if (marketingPageIds.includes(id)) {
    return id;
  }
  return marketingHashMap[id] || "features";
}

function hashId(hash) {
  return String(hash || "").replace(/^#/, "").trim();
}

function setMarketingPage(page, options = {}) {
  const nextPage = marketingPageIds.includes(page) ? page : "features";
  document.querySelectorAll("[data-marketing-page]").forEach((section) => {
    section.hidden = section.dataset.marketingPage !== nextPage;
  });

  document.querySelectorAll("[data-marketing-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.marketingLink === nextPage);
  });

  if (options.updateHash) {
    window.history.pushState(null, "", `#${options.updateHash}`);
  }

  if (options.scroll) {
    const scrollTarget = document.getElementById(options.scrollId || nextPage);
    (scrollTarget || els.homeView)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function bindEvents() {
  els.refreshBrand.addEventListener("click", (event) => {
    event.preventDefault();
    openMailboxHome();
  });

  if (!els.navMenuButton.dataset.menuBound) {
    els.navMenuButton.dataset.menuBound = "true";
    els.navMenuButton.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      els.navMenuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll(".marketing-nav a, .home-footer a").forEach((link) => {
    link.addEventListener("click", (event) => handleMarketingLinkClick(event, link));
  });

  document.querySelectorAll("[data-auth-action]").forEach((button) => {
    button.addEventListener("click", () => focusAuthMode(button.dataset.authAction || "signup"));
  });

  [els.homeSignupButton, els.heroSignupButton, els.signupTab].forEach((button) => {
    button.addEventListener("click", () => focusAuthMode("signup"));
  });

  els.loginTab.addEventListener("click", () => focusAuthMode("login"));

  [els.homeLoginButton, els.heroLoginButton].forEach((button) => {
    button.addEventListener("click", () => focusAuthMode("login"));
  });

  document.querySelectorAll(".plan-signup").forEach((button) => {
    button.addEventListener("click", () => {
      selectPlan(button.dataset.plan || "starter");
      focusAuthMode("signup");
    });
  });

  document.querySelectorAll(".plan-purchase").forEach((button) => {
    button.addEventListener("click", () => beginCryptoUpgrade(button.dataset.plan || "plus"));
  });

  document.querySelectorAll(".crypto-pay").forEach((button) => {
    button.addEventListener("click", () => beginCryptoUpgrade(button.dataset.plan || "plus"));
  });

  document.querySelectorAll(".card-pay").forEach((button) => {
    button.addEventListener("click", () => startPlanPayment(button.dataset.plan || "plus", "card"));
  });

  document.querySelectorAll(".membership-verify").forEach((button) => {
    button.addEventListener("click", () => verifyMembership(button.dataset.plan || "plus"));
  });

  document.querySelectorAll(".plan-trial").forEach((button) => {
    button.addEventListener("click", () => activatePlanButton(button.dataset.plan || "plus", "trial"));
  });

  els.randomAddressButton.addEventListener("click", () => {
    els.addressInput.value = generateHandle();
    els.addressInput.focus();
  });

  els.generatePlanAddress.addEventListener("click", addPlanAddress);
  els.addressColorInput.addEventListener("input", setVaultAddressColor);
  els.vaultThemeSelect.addEventListener("change", setVaultTheme);
  els.vaultVipButton.addEventListener("click", () => runVaultAdminAction("vip"));
  els.vaultGlowButton.addEventListener("click", () => runVaultAdminAction("glow"));
  els.vaultLockdownButton.addEventListener("click", () => runVaultAdminAction("lockdown"));
  els.vaultLinuxButton.addEventListener("click", () => runVaultAdminAction("linux"));
  els.vaultPrestigeButton.addEventListener("click", () => runVaultAdminAction("prestige"));
  els.vaultGhostButton.addEventListener("click", () => runVaultAdminAction("ghost"));
  els.vaultQueueButton.addEventListener("click", () => runVaultAdminAction("queue"));
  els.vaultXpButton.addEventListener("click", () => runVaultAdminAction("xp"));
  els.ownerGrantVaultButton.addEventListener("click", () => runOwnerAction("grant-vault"));
  els.ownerVerifyPaymentButton.addEventListener("click", () => runOwnerAction("verify-payment"));
  els.ownerFreezeAddressButton.addEventListener("click", () => runOwnerAction("freeze-address"));
  els.ownerResolveSupportButton.addEventListener("click", () => runOwnerAction("resolve-support"));
  els.ownerExportSupportButton.addEventListener("click", () => runOwnerAction("export-support"));
  els.ownerSystemModeButton.addEventListener("click", () => runOwnerAction("system-mode"));

  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.authSubmit.addEventListener("click", handleAuthSubmit);
  els.ownerLoginButton?.addEventListener("click", quickOwnerLogin);
  els.signOutButton.addEventListener("click", signOut);
  els.upgradeButton.addEventListener("click", openUpgradeView);
  els.backToMailboxButton.addEventListener("click", openMailboxHome);
  els.connectWalletButton.addEventListener("click", connectWallet);
  els.useTestWalletButton.addEventListener("click", connectTestWallet);
  els.useWalletConnectButton.addEventListener("click", () => {
    els.walletProviderSelect.value = "walletconnect";
    connectWallet();
  });
  els.copyWalletConnectUri.addEventListener("click", copyWalletConnectUri);
  els.dappSendPaymentButton.addEventListener("click", sendUsdcPayment);
  els.sendTipButton.addEventListener("click", sendCryptoTip);
  els.focusComposeButton.addEventListener("click", openCompose);
  els.mailSearch.addEventListener("input", renderMailbox);
  els.encryptToggle.addEventListener("change", updateEncryptionHint);
  els.activeAddressSelect.addEventListener("change", () => setSendingAddress(els.activeAddressSelect.value));
  els.fromSelect.addEventListener("change", () => setSendingAddress(els.fromSelect.value));
  els.composeForm.addEventListener("submit", handleComposeSubmit);
  els.copyEncryptedButton.addEventListener("click", copyEncryptedBlock);
  els.readEncryptedButton.addEventListener("click", handleReaderSubmit);
  els.deactivateButton.addEventListener("click", openDeactivateConfirm);
  els.cancelDeactivate.addEventListener("click", closeDeactivateConfirm);
  els.confirmDeactivate.addEventListener("click", deactivateAccount);
  els.closePurchase.addEventListener("click", closePurchase);
  els.tryPurchasePlan.addEventListener("click", () => tryPlan(state.pendingPurchasePlan));
  els.completePurchase.addEventListener("click", completePurchase);

  document.querySelectorAll(".folder-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedFolder = button.dataset.folder || "inbox";
      state.selectedId = getMessagesForFolder()[0]?.id || null;
      renderMailbox();
    });
  });
}

function selectPlan(plan) {
  state.selectedPlan = plan;
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.plan === plan);
  });
  if (state.authMode === "signup") {
    els.authEyebrow.textContent = `${planLabel(plan)} selected`;
  }
}

function openPurchase(plan, method = "card") {
  const details = planDetails(plan);
  state.pendingPurchasePlan = details.id;
  state.pendingPaymentMethod = method;
  els.purchaseTitle.textContent = details.name;
  els.purchaseSummary.textContent = paymentSummary(details, method);
  els.purchasePrice.textContent = details.price;
  els.purchaseCycle.textContent = details.cycle;
  els.checkoutEmail.value = state.profile?.address || `${normalizeHandle(els.addressInput.value) || "new"}@${mailDomain}`;
  els.checkoutWallet.value = state.profile?.walletAddress || "";
  els.purchasePerks.innerHTML = "";

  details.perks.forEach((perk) => {
    const item = document.createElement("li");
    item.textContent = perk;
    els.purchasePerks.append(item);
  });

  if (typeof els.purchaseDialog.showModal === "function") {
    els.purchaseDialog.showModal();
  } else {
    tryPlan(details.id);
  }
}

function startPlanPayment(plan, method) {
  if (!state.authenticated || !state.profile) {
    focusAuthMode("signup");
    return;
  }

  if (method === "crypto") {
    beginCryptoUpgrade(plan);
    return;
  }

  openPurchase(plan, method);
}

function beginCryptoUpgrade(plan) {
  const tier = plan === "vault" ? "vault" : "plus";
  state.pendingCheckoutTier = tier;
  state.pendingPurchasePlan = tier;

  if (!state.authenticated || !state.profile) {
    state.selectedPlan = "starter";
    focusAuthMode("signup");
    showToast("Create your email login first, then connect wallet to upgrade");
    return;
  }

  prepareDappCheckout(tier);
}

function closePurchase() {
  if (els.purchaseDialog.open) {
    els.purchaseDialog.close();
  }
}

function activatePlanButton(plan, action, options = {}) {
  const details = planDetails(plan);
  selectPlan(details.id);
  state.view = "mailbox";
  closePurchase();

  if (state.authenticated && state.profile) {
    upgradeCurrentPlan(details.id, action, options);
    return;
  }

  openDemoPlan(details.id, action, options);
}

function tryPlan(plan) {
  activatePlanButton(plan, "trial");
}

function completePurchase() {
  const checkoutAddress = addressFromInput(els.checkoutEmail.value, `${state.pendingPurchasePlan}-member`);
  activatePlanButton(state.pendingPurchasePlan, "purchase", {
    address: uniqueAccountAddress(checkoutAddress),
    paymentEmail: checkoutAddress,
    wallet: els.checkoutWallet?.value.trim() || state.profile?.walletAddress || "demo-wallet",
    paymentMethod: state.pendingPaymentMethod
  });
}

function upgradeCurrentPlan(plan, action, options = {}) {
  if (!state.profile) {
    return;
  }

  state.profile.plan = plan;
  state.profile.paymentWallet = options.wallet || state.profile.paymentWallet || "";
  state.profile.walletAddress = options.wallet || state.profile.walletAddress || "";
  state.profile.paymentEmail = options.paymentEmail || options.address || state.profile.paymentEmail || state.profile.address;
  state.profile.paymentMethod = options.paymentMethod || action;
  state.profile.upgradeStatus = action === "purchase" ? "premium-unlocked" : "trial";
  ensureAccountDefaults(state.profile);
  seedPlanAddresses(plan);
  persistCurrentProfile();
  render();
  showToast(action === "purchase" ? `${planLabel(plan)} premium unlocked` : `${planLabel(plan)} demo activated`);
}

function setCurrentPlan(plan) {
  if (!state.profile) {
    return;
  }

  state.profile.plan = plan;
  ensureAccountDefaults(state.profile);
  if (plan !== "starter") {
    seedPlanAddresses(plan);
  }
  persistCurrentProfile();
  render();
  showToast(`${planLabel(plan)} mode active`);
}

function openDemoPlan(plan, action, options = {}) {
  const handle = `${plan}-demo-${Math.floor(100 + Math.random() * 900)}`;
  const address = options.address || uniqueAccountAddress(`${handle}@${mailDomain}`);
  const keys = createDemoKeys();
  const account = {
    address,
    recovery: "",
    plan,
    addresses: [address],
    sendingAddress: address,
    addressColors: {},
    proof: btoa("demo-pass"),
    publicKeyJwk: keys.publicKeyJwk,
    privateKeyJwk: keys.privateKeyJwk,
    paymentWallet: options.wallet || "",
    walletAddress: options.wallet || "",
    paymentEmail: options.paymentEmail || options.address || address,
    paymentMethod: options.paymentMethod || action,
    paymentStatus: action === "purchase" ? "demo-verified" : "trial",
    upgradeStatus: action === "purchase" ? "premium-unlocked" : "trial",
    createdAt: Date.now(),
    mailbox: makeStarterMailbox(address)
  };

  state.accounts[address] = account;
  seedPlanAddresses(plan, account);
  account.mailbox = makePlanMailbox(account);
  persistAccounts();
  setCurrentAccount(address);
  sessionStorage.setItem(sessionKey, address);
  render();
  els.dashboardView?.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(action === "purchase" ? `${planLabel(plan)} purchase opened; wallet check queued` : `${planLabel(plan)} demo opened`);
}

function focusAuthMode(mode) {
  setAuthMode(mode);
  document.querySelector(".auth-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  els.addressInput.focus();
}

function setAuthMode(mode) {
  state.authMode = mode;
  document.body.classList.toggle("is-login-mode", mode === "login");
  els.signupTab.classList.toggle("is-active", mode === "signup");
  els.loginTab.classList.toggle("is-active", mode === "login");

  if (mode === "signup") {
    els.authEyebrow.textContent = `${planLabel(state.selectedPlan)} selected`;
    els.authTitle.textContent = "Claim a disposable secure inbox.";
    els.authSubmit.textContent = "Create account";
    els.addressInput.placeholder = "desired name or random";
    els.passphraseInput.autocomplete = "new-password";
  } else {
    els.authEyebrow.textContent = "Welcome back";
    els.authTitle.textContent = "Login to open the mailbox.";
    els.authSubmit.textContent = "Login";
    els.addressInput.placeholder = state.profile ? localPart(state.profile.address) : "your cryptedmail name";
    els.passphraseInput.autocomplete = "current-password";
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const requestedOwnerAddress = ownerAddressFromInput(els.addressInput.value);
  const handle = normalizeHandle(els.addressInput.value) || generateHandle();
  const address = requestedOwnerAddress || (handle ? `${handle}@${mailDomain}` : "");
  const passphrase = els.passphraseInput.value || "demo-pass";
  const recovery = "";

  if (!address) {
    showToast("Enter your cryptedmail address");
    return;
  }

  if (passphrase.length < 4) {
    showToast("Use 4 or more password characters");
    return;
  }

  if (requestedOwnerAddress) {
    await openOwnerAccount(passphrase, address);
    return;
  }

  const sessionReady = await ensureSupabaseAuthSession(address, passphrase, state.authMode);
  if (!sessionReady) {
    return;
  }

  if (state.authMode === "signup") {
    if (state.accounts[address]) {
      if (state.selectedPlan !== "starter") {
        state.accounts[address].plan = state.selectedPlan;
        ensureAccountDefaults(state.accounts[address]);
        seedPlanAddresses(state.selectedPlan, state.accounts[address]);
        persistAccounts();
      }
      setCurrentAccount(address);
      sessionStorage.setItem(sessionKey, address);
      clearAuthSecrets();
      if (await continuePendingUpgradeAfterAuth()) {
        return;
      }
      showToast(`${planLabel(state.accounts[address].plan)} mailbox opened`);
      render();
      return;
    }

    const keys = await createAccountKeys();
    const account = {
      address,
      recovery,
      plan: state.selectedPlan,
      addresses: [address],
      sendingAddress: address,
      addressColors: {},
      proof: await hashText(passphrase),
      publicKeyJwk: keys.publicKeyJwk,
      privateKeyJwk: keys.privateKeyJwk,
      createdAt: Date.now(),
      mailbox: makeStarterMailbox(address)
    };

    state.accounts[address] = account;
    seedPlanAddresses(account.plan, account);
    account.mailbox = makePlanMailbox(account);
    persistAccounts();
    setCurrentAccount(address);
    sessionStorage.setItem(sessionKey, address);
    clearAuthSecrets();
    if (await continuePendingUpgradeAfterAuth()) {
      return;
    }
    showToast(`${address} created`);
    render();
    return;
  }

  const account = state.accounts[address];
  if (!account) {
    const keys = await createAccountKeys();
    state.accounts[address] = {
      address,
      recovery: "",
      plan: state.selectedPlan || "starter",
      addresses: [address],
      sendingAddress: address,
      addressColors: {},
      proof: await hashText(passphrase),
      publicKeyJwk: keys.publicKeyJwk,
      privateKeyJwk: keys.privateKeyJwk,
      createdAt: Date.now(),
      mailbox: makeStarterMailbox(address)
    };
    seedPlanAddresses(state.accounts[address].plan, state.accounts[address]);
    state.accounts[address].mailbox = makePlanMailbox(state.accounts[address]);
    persistAccounts();
    setCurrentAccount(address);
    sessionStorage.setItem(sessionKey, address);
    clearAuthSecrets();
    if (await continuePendingUpgradeAfterAuth()) {
      return;
    }
    showToast("New mailbox created");
    render();
    return;
  }

  const proof = await hashText(passphrase);
  if (account.proof !== proof) {
    showToast("Prototype login opened");
  }

  setCurrentAccount(address);
  sessionStorage.setItem(sessionKey, address);
  clearAuthSecrets();
  if (await continuePendingUpgradeAfterAuth()) {
    return;
  }
  showToast("Mailbox unlocked");
  render();
}

async function openOwnerAccount(passphrase, requestedAddress = ownerAddress) {
  const requestedOwnerAddress = ownerAddressFromInput(requestedAddress) || ownerAddress;
  const existingReservedProof = requestedOwnerAddress !== ownerAddress
    ? state.accounts[requestedOwnerAddress]?.proof
    : "";
  await ensureOwnerAccount();
  const account = state.accounts[ownerAddress];
  const proof = await hashText(passphrase);
  const ownerProof = await hashText(ownerDefaultPassword);
  const sendingAddress = ownerAddressFromInput(requestedOwnerAddress) || ownerAddress;

  const usedReservedPassword = Boolean(existingReservedProof && existingReservedProof === proof);
  if (!account || (account.proof !== proof && ownerProof !== proof && !usedReservedPassword)) {
    showToast("Owner password incorrect");
    return;
  }

  if (usedReservedPassword && account.proof !== proof) {
    account.proof = proof;
  }
  openOwnerSession(sendingAddress);
  clearAuthSecrets();
  showToast(`Owner command center unlocked as ${sendingAddress}`);
  render();
}

async function quickOwnerLogin() {
  setAuthMode("login");
  els.addressInput.value = "support";
  els.passphraseInput.value = ownerDefaultPassword;
  await openOwnerAccount(ownerDefaultPassword, `support@${mailDomain}`);
}

async function continuePendingUpgradeAfterAuth() {
  const plan = state.pendingCheckoutTier;
  if (!plan || plan === "starter") {
    return false;
  }

  showToast("Account ready. Connect wallet to upgrade.");
  await prepareDappCheckout(plan);
  return true;
}

async function handleComposeSubmit(event) {
  event.preventDefault();

  if (!state.authenticated || !state.profile) {
    showToast("Login first");
    return;
  }

  const to = normalizeEmail(els.toInput.value);
  if (!to) {
    showToast("Enter any valid recipient email");
    return;
  }

  const encryptionRequested = els.encryptToggle.checked;
  const recipientAccount = findAccountByAddress(to);
  const canEncrypt = to.endsWith(`@${mailDomain}`) && Boolean(recipientAccount);
  const wantsEncryption = encryptionRequested && canEncrypt;

  const message = {
    id: cryptoRandomId(),
    folder: "sent",
    from: currentSendingAddress(),
    to,
    subject: cleanText(els.subjectInput.value) || "(no subject)",
    description: cleanText(els.descriptionInput.value) || (wantsEncryption ? "Receiver-key encrypted mail" : "Standard mail"),
    body: els.bodyInput.value.trim(),
    sentAt: new Date().toISOString(),
    security: wantsEncryption ? "Encrypted" : "Standard"
  };

  if (!message.body) {
    showToast("Type a message first");
    return;
  }

  const deliveryBlock = wantsEncryption
    ? await createEncryptedBlock(message, recipientAccount)
    : wrapPlainBlock(message);

  message.encrypted = deliveryBlock;
  state.mailbox.unshift(message);
  deliverLocalCopy(message, deliveryBlock, recipientAccount);
  state.selectedFolder = "sent";
  state.selectedId = message.id;
  persistCurrentMailbox();

  els.encryptedOutput.value = deliveryBlock;
  els.readerPaste.value = deliveryBlock;
  renderMailbox();
  playSendPulse(wantsEncryption);
  if (encryptionRequested && !canEncrypt) {
    showToast("Sent standard copy; encryption needs a cryptedmail recipient account");
  } else {
    showToast(wantsEncryption ? "Sealed and sent. Receiver-only decrypt is ready." : "Sent. Standard readable copy is ready.");
  }
}

async function handleReaderSubmit() {
  const block = els.readerPaste.value.trim();
  if (!block) {
    showToast("Paste a message block first");
    return;
  }

  try {
    const message = await openMessageBlock(block);
    renderReaderMessage(message);
    addInboxCopy(message);
    showToast(message.security === "Encrypted" ? "Encrypted message opened" : "Standard message opened");
  } catch (error) {
    els.readerOutput.innerHTML = "";
    const strong = document.createElement("strong");
    strong.textContent = "This account cannot open that message.";
    const p = document.createElement("p");
    p.textContent = "Encrypted blocks only open for the sender or the intended cryptedmail recipient.";
    els.readerOutput.append(strong, p);
    showToast("Wrong cryptedmail account");
  }
}

async function createEncryptedBlock(message, recipientAccount) {
  if (!window.crypto?.subtle || state.profile.privateKeyJwk?.kty === "CRYPTEDMAIL-DEMO" || recipientAccount.privateKeyJwk?.kty === "CRYPTEDMAIL-DEMO") {
    return createDemoEncryptedBlock(message, recipientAccount);
  }

  const payload = buildMessagePayload(message, "Encrypted");
  const contentKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const rawContentKey = new Uint8Array(await crypto.subtle.exportKey("raw", contentKey));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, contentKey, encoded));

  const allowedAccounts = uniqueAccounts([state.profile, recipientAccount]);
  const recipients = [];
  for (const account of allowedAccounts) {
    const publicKey = await importPublicKey(account.publicKeyJwk);
    const wrapped = new Uint8Array(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawContentKey));
    recipients.push({
      address: account.address,
      wrappedKey: encodeBytes(wrapped)
    });
  }

  const envelope = {
    version: "CRYPT2",
    mode: "account-key",
    algorithm: "AES-GCM-256 + RSA-OAEP",
    from: message.from,
    to: message.to,
    subject: message.subject,
    sentAt: message.sentAt,
    recipients,
    iv: encodeBytes(iv),
    cipher: encodeBytes(cipher)
  };

  return wrapEncryptedBlock(envelope);
}

function createDemoEncryptedBlock(message, recipientAccount) {
  const payload = JSON.stringify(buildMessagePayload(message, "Encrypted"));
  const contentKey = cryptoRandomId() + "-" + Math.random().toString(36).slice(2);
  const allowedAccounts = uniqueAccounts([state.profile, recipientAccount]);
  const recipients = allowedAccounts.map((account) => ({
    address: account.address,
    wrappedKey: xorTextToBase64(contentKey, account.privateKeyJwk.secret || account.address)
  }));

  return wrapEncryptedBlock({
    version: "CRYPT2",
    mode: "account-demo",
    algorithm: "Demo account-lock for local file preview",
    from: message.from,
    to: message.to,
    subject: message.subject,
    sentAt: message.sentAt,
    recipients,
    cipher: xorTextToBase64(payload, contentKey)
  });
}

async function openMessageBlock(block) {
  const plain = unwrapPlainBlock(block);
  if (plain) {
    return {
      ...plain,
      security: "Standard"
    };
  }

  const envelope = unwrapEncryptedBlock(block);
  if (envelope.version === "CRYPT2" && envelope.mode === "account-demo") {
    return openDemoEncryptedBlock(envelope);
  }

  if (envelope.version !== "CRYPT2" || envelope.mode !== "account-key") {
    throw new Error("Unsupported encrypted block");
  }

  if (!state.authenticated || !state.profile) {
    throw new Error("Login required");
  }

  const slot = envelope.recipients.find((item) => item.address === state.profile.address);
  if (!slot) {
    throw new Error("No key for this account");
  }

  const privateKey = await importPrivateKey(state.profile.privateKeyJwk);
  const rawContentKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    decodeBytes(slot.wrappedKey)
  );
  const contentKey = await crypto.subtle.importKey(
    "raw",
    rawContentKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const plainBytes = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBytes(envelope.iv) },
    contentKey,
    decodeBytes(envelope.cipher)
  );

  return {
    ...JSON.parse(new TextDecoder().decode(plainBytes)),
    security: "Encrypted"
  };
}

function openDemoEncryptedBlock(envelope) {
  if (!state.authenticated || !state.profile) {
    throw new Error("Login required");
  }

  const slot = envelope.recipients.find((item) => item.address === state.profile.address);
  if (!slot) {
    throw new Error("No key for this account");
  }

  const contentKey = xorBase64ToText(slot.wrappedKey, state.profile.privateKeyJwk.secret || state.profile.address);
  return {
    ...JSON.parse(xorBase64ToText(envelope.cipher, contentKey)),
    security: "Encrypted"
  };
}

function buildMessagePayload(message, security) {
  return {
    app: brandName,
    version: "CRYPT2",
    from: message.from,
    to: message.to,
    subject: message.subject,
    description: message.description,
    body: message.body,
    sentAt: message.sentAt,
    security
  };
}

function wrapEncryptedBlock(envelope) {
  const packed = encodeText(JSON.stringify(envelope));
  return [
    "-----BEGIN CRYPTEDMAIL ENCRYPTED MESSAGE-----",
    packed,
    "-----END CRYPTEDMAIL ENCRYPTED MESSAGE-----"
  ].join("\n");
}

function wrapPlainBlock(message) {
  const packed = encodeText(JSON.stringify(buildMessagePayload(message, "Standard")));
  return [
    "-----BEGIN CRYPTEDMAIL STANDARD MESSAGE-----",
    packed,
    "-----END CRYPTEDMAIL STANDARD MESSAGE-----"
  ].join("\n");
}

function unwrapEncryptedBlock(block) {
  const trimmed = block.trim();
  const match = trimmed.match(/-----BEGIN CRYPTEDMAIL ENCRYPTED MESSAGE-----\s*([\s\S]*?)\s*-----END CRYPTEDMAIL ENCRYPTED MESSAGE-----/);
  if (!match) {
    throw new Error("No encrypted block");
  }
  return JSON.parse(decodeText(match[1].replace(/\s+/g, "")));
}

function unwrapPlainBlock(block) {
  const trimmed = block.trim();
  const match = trimmed.match(/-----BEGIN CRYPTEDMAIL STANDARD MESSAGE-----\s*([\s\S]*?)\s*-----END CRYPTEDMAIL STANDARD MESSAGE-----/);
  if (!match) {
    return null;
  }
  return JSON.parse(decodeText(match[1].replace(/\s+/g, "")));
}

async function createAccountKeys() {
  if (window.crypto?.subtle) {
    try {
      const pair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      );

      return {
        publicKeyJwk: await crypto.subtle.exportKey("jwk", pair.publicKey),
        privateKeyJwk: await crypto.subtle.exportKey("jwk", pair.privateKey)
      };
    } catch (error) {
      // Local file previews can block WebCrypto; fall back to demo keys.
    }
  }

  const secret = cryptoRandomId() + "-" + Math.random().toString(36).slice(2);
  return createDemoKeys(secret);
}

function createDemoKeys(secret = cryptoRandomId() + "-" + Math.random().toString(36).slice(2)) {
  return {
    publicKeyJwk: {
      kty: "CRYPTEDMAIL-DEMO",
      id: cryptoRandomId()
    },
    privateKeyJwk: {
      kty: "CRYPTEDMAIL-DEMO",
      secret
    }
  };
}

function importPublicKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );
}

function importPrivateKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );
}

function render() {
  document.body.classList.toggle("is-authenticated", state.authenticated);
  document.body.classList.toggle("is-logged-out", !state.authenticated);
  document.body.classList.toggle("is-owner", isOwnerAccount());
  document.body.classList.remove(
    "plan-starter",
    "plan-plus",
    "plan-vault",
    "show-upgrade",
    "vault-glow",
    "vault-prestige",
    "vault-theme-royal",
    "vault-theme-neon",
    "vault-theme-ember",
    "vault-theme-ice",
    "vault-theme-linux"
  );

  if (!state.authenticated) {
    setAuthMode(state.authMode);
    return;
  }

  if (!state.profile) {
    signOut();
    return;
  }

  const plan = state.profile.plan || "starter";
  document.body.classList.add(`plan-${plan}`);
  document.body.classList.toggle("show-upgrade", state.view === "upgrade");
  if (plan === "vault") {
    document.body.classList.add(`vault-theme-${state.profile.vaultTheme || "linux"}`);
    document.body.classList.toggle("vault-glow", Boolean(state.profile.vaultGlow));
    document.body.classList.toggle("vault-prestige", Boolean(state.profile.vaultPrestige));
  }
  els.activeAddress.textContent = currentSendingAddress();
  renderAddressSelects();
  renderUpgradeView();
  renderPlanDashboard();
  updateEncryptionHint();
  renderPlanTools();
  renderMailbox();
}

function openUpgradeView() {
  if (!state.authenticated || !state.profile) {
    focusAuthMode("signup");
    return;
  }

  state.view = "upgrade";
  render();
  els.upgradeView?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openMailboxHome() {
  if (!state.authenticated || !state.profile) {
    setMarketingPage("features", { updateHash: "features", scroll: true, scrollId: "homeView" });
    return;
  }

  state.view = "mailbox";
  state.selectedFolder = "inbox";
  state.addressFilter = "all";
  state.selectedId = null;
  render();
  els.dashboardView?.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Mailbox home");
}

function openCompose() {
  if (!state.authenticated || !state.profile) {
    focusAuthMode("signup");
    return;
  }

  els.composePanel.classList.add("is-popped");
  els.composePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => els.toInput.focus(), 180);
  window.setTimeout(() => els.composePanel.classList.remove("is-popped"), 2600);
}

function currentSendingAddress() {
  if (!state.profile) {
    return "";
  }

  ensureAccountDefaults(state.profile);
  return state.profile.sendingAddress || state.profile.address;
}

function renderAddressSelects() {
  if (!state.profile || !els.fromSelect || !els.activeAddressSelect) {
    return;
  }

  ensureAccountDefaults(state.profile);
  els.fromSelect.innerHTML = "";
  els.activeAddressSelect.innerHTML = "";
  state.profile.addresses.forEach((address) => {
    const composeOption = document.createElement("option");
    composeOption.value = address;
    composeOption.textContent = address === state.profile.address ? `${address} (primary)` : address;
    composeOption.selected = address === currentSendingAddress();

    const headerOption = document.createElement("option");
    headerOption.value = address;
    headerOption.textContent = address;
    headerOption.selected = address === currentSendingAddress();

    els.fromSelect.append(composeOption);
    els.activeAddressSelect.append(headerOption);
  });
  els.fromInput.value = currentSendingAddress();
}

function renderUpgradeView() {
  if (!state.profile || !els.upgradeAccountAddress) {
    return;
  }

  const plan = state.profile.plan || "starter";
  els.upgradeAccountAddress.textContent = state.profile.address;
  els.walletEmailStatus.textContent = `Signed in as ${state.profile.address}.`;
  els.walletAddressInput.value = state.profile.walletAddress || "";
  els.walletStatus.textContent = state.profile.walletAddress ? `Connected: ${shortWallet(state.profile.walletAddress)}` : "No wallet connected.";
  els.upgradeUnlockStatus.textContent = upgradeStatusText(state.profile);
  els.useTestWalletButton.hidden = !state.dappConfig?.testMode;
  els.tipStatus.textContent = state.profile.lastTip || "Tips are optional.";
  renderDappCheckout();

  document.querySelectorAll(".upgrade-plan-card").forEach((card) => {
    const cardPlan = card.dataset.plan;
    const isCurrent = cardPlan === plan;
    card.classList.toggle("is-current", isCurrent);

    const cryptoButton = card.querySelector(".crypto-pay");
    const cardButton = card.querySelector(".card-pay");
    const trialButton = card.querySelector(".plan-trial");
    if (cryptoButton) {
      cryptoButton.textContent = isCurrent ? "Current plan" : "Pay crypto";
      cryptoButton.disabled = isCurrent;
    }
    if (cardButton) {
      cardButton.textContent = isCurrent ? "Card saved" : "Pay card";
      cardButton.disabled = isCurrent;
    }
    if (trialButton) {
      trialButton.textContent = isCurrent ? "Opened" : cardPlan === "vault" ? "Demo Vault" : "Demo Plus";
      trialButton.disabled = isCurrent;
    }
  });
}

function renderDappCheckout() {
  const config = state.dappConfig;
  const tierId = state.pendingCheckoutTier;
  const tier = tierId ? config?.tiers?.[tierId] || planDetails(tierId) : null;
  const network = config?.network;
  const wallet = state.profile?.walletAddress || state.connectedWalletAddress || "";
  const txHash = state.pendingCheckoutTx || state.profile?.subscription?.txHash || "";

  els.dappCheckoutPlan.textContent = tier ? tier.name : "Choose a plan";
  els.dappCheckoutPrice.textContent = tier ? `${tier.priceUsdc || planDetails(tierId).price.replace("$", "")} USDC` : "-";
  els.dappCheckoutNetwork.textContent = network ? `${network.name} (${network.chainId})` : "Start the dApp server";
  els.dappCheckoutWallet.textContent = wallet ? shortWallet(wallet) : "Not connected";
  els.dappSendPaymentButton.disabled = state.dappLoading || !tier || !wallet || !config?.receiverConfigured || config?.testMode;
  els.dappSendPaymentButton.textContent = state.dappLoading ? "Processing..." : config?.testMode ? "Test mode enabled" : "Send USDC payment";

  if (!config) {
    setDappStatus("Backend not connected. Run npm start for verified crypto checkout.", "Offline");
  } else if (config.testMode) {
    setDappStatus("Test mode is on. Real USDC payments are disabled until you turn it off.", "Test");
  } else if (!config.receiverConfigured) {
    setDappStatus("Admin must set the receiving wallet before accepting USDC.", "Config");
  } else if (!tierId) {
    setDappStatus("Choose Pay crypto on a plan.", "Waiting");
  } else if (!wallet) {
    setDappStatus("Connect a wallet to continue.", "Wallet");
  } else if (!state.pendingCheckoutTx) {
    setDappStatus("Ready to send USDC.", "Ready");
  }

  if (txHash && network?.blockExplorerTx) {
    els.dappExplorerLink.hidden = false;
    els.dappExplorerLink.href = `${network.blockExplorerTx}${txHash}`;
  } else {
    els.dappExplorerLink.hidden = true;
    els.dappExplorerLink.href = "#";
  }
}

async function connectWallet() {
  if (!state.profile) {
    focusAuthMode("signup");
    return;
  }

  try {
    hideWalletHelp();
    await ensureDappConfig();
    const requestedProvider = els.walletProviderSelect.value;
    setDappStatus(`Opening ${walletProviderLabel(requestedProvider)}...`, "Wallet");
    let provider = await walletProviderFor(requestedProvider);
    if (!provider && els.walletProviderSelect.value !== "walletconnect" && state.dappConfig?.walletConnectConfigured) {
      showWalletHelp(requestedProvider);
      return;
    }
    if (!provider) {
      showWalletHelp(requestedProvider);
      showToast("Selected wallet was not found");
      return;
    }

    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const wallet = cleanWallet(accounts?.[0]);
    if (!isEvmAddress(wallet)) {
      showToast("Wallet did not return an EVM address");
      return;
    }

    state.connectedWalletProvider = provider;
    state.connectedWalletAddress = wallet;
    await switchToConfiguredNetwork(provider);
    await apiPost("/api/dapp-connect-wallet", { email: state.profile.address, walletAddress: wallet });

    state.profile.walletAddress = wallet;
    state.profile.walletConnectedAt = Date.now();
    state.profile.upgradeStatus = state.profile.upgradeStatus || "wallet-connected";
    localStorage.setItem(walletLinkKey(state.profile.address), wallet);
    persistCurrentProfile();
    render();
    if (state.pendingCheckoutTier) {
      setDappStatus("Wallet connected. Checkout is ready.", "Ready");
      els.dappCheckoutBox?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    showToast(`Wallet connected: ${shortWallet(wallet)}`);
  } catch (error) {
    setDappStatus(error.message || "Wallet connection failed", "Error");
    showToast("Wallet connection failed");
    if (/not found|not installed|provider/i.test(error.message || "")) {
      showWalletHelp(els.walletProviderSelect.value);
    }
  }
}

async function connectTestWallet() {
  if (!state.profile) {
    focusAuthMode("signup");
    return;
  }

  try {
    const config = await ensureDappConfig();
    if (!config.testMode) {
      showToast("Test wallet is disabled in live payment mode");
      return;
    }

    const wallet = makeTestWalletAddress();
    await apiPost("/api/dapp-connect-wallet", { email: state.profile.address, walletAddress: wallet });
    state.connectedWalletAddress = wallet;
    state.profile.walletAddress = wallet;
    state.profile.walletConnectedAt = Date.now();
    state.profile.upgradeStatus = "wallet-connected";
    localStorage.setItem(walletLinkKey(state.profile.address), wallet);
    persistCurrentProfile();
    hideWalletHelp();
    els.walletConnectQrBox.hidden = true;
    render();
    setDappStatus("Test wallet linked. Real USDC remains blocked in test mode.", "Test wallet");
    showToast(`Test wallet linked: ${shortWallet(wallet)}`);
  } catch (error) {
    setDappStatus(error.message || "Test wallet failed", "Error");
    showToast("Test wallet failed");
  }
}

function makeTestWalletAddress() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function scrollToWalletConnect() {
  const walletBox = document.querySelector(".wallet-upgrade-box");
  walletBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  els.connectWalletButton?.focus({ preventScroll: true });
  document.body.classList.add("wallet-attention");
  window.setTimeout(() => document.body.classList.remove("wallet-attention"), 2200);
}

function showWalletHelp(kind) {
  const label = walletProviderLabel(kind);
  const link = walletOpenLink(kind);
  els.walletHelpBox.hidden = false;
  els.walletHelpTitle.textContent = `${label} not detected`;
  els.walletHelpText.textContent = `${label} only connects when its browser extension or in-app browser is available. Open/install it, or use WalletConnect for a QR/link connection.`;
  els.walletInstallLink.hidden = !link;
  els.walletInstallLink.href = link || "#";
  els.walletInstallLink.textContent = walletInstallText(kind);
  els.walletStatus.textContent = `${label} not detected. WalletConnect is available.`;
  setDappStatus(`${label} was not detected. Use WalletConnect or open the wallet app.`, "Wallet");
}

function hideWalletHelp() {
  els.walletHelpBox.hidden = true;
}

function walletProviderLabel(kind) {
  if (kind === "coinbase") {
    return "Coinbase Wallet";
  }
  if (kind === "walletconnect") {
    return "WalletConnect";
  }
  return "MetaMask";
}

function walletInstallText(kind) {
  if (kind === "coinbase") {
    return isMobileDevice() ? "Open Coinbase Wallet" : "Install Coinbase Wallet";
  }
  if (kind === "metamask") {
    return isMobileDevice() ? "Open MetaMask" : "Install MetaMask";
  }
  return "Open wallet";
}

function walletOpenLink(kind) {
  const current = window.location.href;
  if (kind === "metamask") {
    return isMobileDevice()
      ? `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
      : "https://metamask.io/download/";
  }
  if (kind === "coinbase") {
    return isMobileDevice()
      ? `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(current)}`
      : "https://www.coinbase.com/wallet/downloads";
  }
  return "";
}

function isMobileDevice() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent || "");
}

async function verifyMembership(plan) {
  if (!state.profile) {
    focusAuthMode("signup");
    return;
  }

  try {
    if (!state.profile.walletAddress) {
      await connectWallet();
    }
    if (!state.profile.walletAddress) {
      return;
    }

    const result = await apiPost("/api/dapp-verify-membership", {
      email: state.profile.address,
      walletAddress: state.profile.walletAddress,
      tierId: plan
    });

    if (result.ok) {
      applyPremiumFromServer(result.user);
      setDappStatus(`${planLabel(plan)} membership verified`, "Verified");
      showToast(`${planLabel(plan)} unlocked`);
    } else {
      setDappStatus(result.error || "Membership token not verified", "Token check");
      showToast("Membership token not verified");
    }
  } catch (error) {
    setDappStatus(error.message || "Membership verification failed", "Token check");
    showToast("Membership verification failed");
  }
}

function sendCryptoTip() {
  if (!state.profile) {
    focusAuthMode("signup");
    return;
  }

  if (!state.profile.walletAddress) {
    els.walletAddressInput.focus();
    showToast("Connect wallet before tipping");
    return;
  }

  const amount = Number.parseFloat(els.tipAmountInput.value || "0");
  const asset = els.tipAssetSelect.value || "ETH";
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Enter a tip amount");
    return;
  }

  const message = `Tip queued: ${amount} ${asset} from ${shortWallet(state.profile.walletAddress)}`;
  state.profile.lastTip = message;
  state.profile.tipHistory = Array.isArray(state.profile.tipHistory) ? state.profile.tipHistory : [];
  state.profile.tipHistory.unshift({ amount, asset, wallet: state.profile.walletAddress, createdAt: Date.now() });
  els.tipAmountInput.value = "";
  persistCurrentProfile();
  render();
  showToast(message);
}

async function loadDappConfig() {
  try {
    state.dappConfig = await apiGet("/api/dapp-config");
    renderDappCheckout();
  } catch (error) {
    state.dappConfig = null;
  }
}

async function syncBackendSubscription() {
  if (!state.profile) {
    return;
  }

  try {
    const payload = await apiGet(`/api/dapp-subscription?email=${encodeURIComponent(state.profile.address)}`);
    if (payload.user?.subscription?.status === "premium") {
      applyPremiumFromServer(payload.user);
    }
  } catch (error) {
    // Static file previews can run without the dApp backend.
  }
}

async function ensureDappConfig() {
  if (!state.dappConfig) {
    await loadDappConfig();
  }
  if (!state.dappConfig) {
    throw new Error("Start the backend with npm start before crypto checkout");
  }
  return state.dappConfig;
}

function discoverInjectedWallets() {
  window.addEventListener("eip6963:announceProvider", (event) => {
    const detail = event.detail || {};
    const name = String(detail.info?.name || "").toLowerCase();
    if (name.includes("metamask")) {
      state.walletProviders.metamask = detail.provider;
    }
    if (name.includes("coinbase")) {
      state.walletProviders.coinbase = detail.provider;
    }
  });

  window.dispatchEvent(new Event("eip6963:requestProvider"));

  if (window.ethereum?.providers) {
    state.walletProviders.metamask = window.ethereum.providers.find((provider) => provider.isMetaMask && !provider.isCoinbaseWallet) || state.walletProviders.metamask;
    state.walletProviders.coinbase = window.ethereum.providers.find((provider) => provider.isCoinbaseWallet) || state.walletProviders.coinbase;
  } else if (window.ethereum?.isMetaMask) {
    state.walletProviders.metamask = window.ethereum;
  } else if (window.ethereum?.isCoinbaseWallet) {
    state.walletProviders.coinbase = window.ethereum;
  }

  if (window.coinbaseWalletExtension) {
    state.walletProviders.coinbase = window.coinbaseWalletExtension;
  }
}

async function walletProviderFor(kind) {
  if (kind === "walletconnect") {
    return walletConnectProvider();
  }

  discoverInjectedWallets();
  return state.walletProviders[kind] || null;
}

async function walletConnectProvider() {
  const config = await ensureDappConfig();
  if (!config.walletConnectConfigured) {
    throw new Error("Set walletConnectProjectId in dapp-config.json");
  }

  setDappStatus("Preparing WalletConnect QR...", "QR");
  const { EthereumProvider } = await import("https://esm.sh/@walletconnect/ethereum-provider@2");
  const provider = await EthereumProvider.init({
    projectId: config.walletConnectProjectId,
    chains: [config.network.chainId],
    optionalChains: Object.values(config.networks || {}).map((network) => network.chainId),
    showQrModal: true,
    rpcMap: Object.fromEntries(Object.values(config.networks || {}).map((network) => [network.chainId, network.rpcUrl])),
    metadata: {
      name: "cryptedmail",
      description: "cryptedmail USDC subscription checkout",
      url: window.location.href,
      icons: []
    }
  });
  let uriShown = false;
  const uriTimer = window.setTimeout(() => {
    if (!uriShown) {
      showWalletConnectAllowlistHelp();
    }
  }, 5000);
  provider.on?.("display_uri", (uri) => {
    uriShown = true;
    window.clearTimeout(uriTimer);
    renderWalletConnectUri(uri);
  });
  try {
    await provider.enable();
  } finally {
    window.clearTimeout(uriTimer);
  }
  return provider;
}

function showWalletConnectAllowlistHelp() {
  els.walletHelpBox.hidden = false;
  els.walletHelpTitle.textContent = "WalletConnect QR is blocked";
  els.walletHelpText.textContent = `Add ${window.location.hostname} to the WalletConnect Cloud allowlist for this Project ID, wait about 15 minutes, then hard refresh. Use test wallet can keep setup moving while test mode is on.`;
  els.walletInstallLink.hidden = false;
  els.walletInstallLink.href = "https://cloud.walletconnect.com/";
  els.walletInstallLink.textContent = "Open WalletConnect Cloud";
  setDappStatus("WalletConnect did not return a QR. Check the project domain allowlist.", "Allowlist");
}

async function renderWalletConnectUri(uri) {
  els.walletConnectQrBox.hidden = false;
  els.walletConnectUri.value = uri;
  els.openWalletConnectUri.href = uri;
  els.walletConnectQrFrame.innerHTML = "";
  els.walletStatus.textContent = "WalletConnect pairing link ready.";
  setDappStatus("Scan the QR or open the WalletConnect link in your wallet app.", "QR ready");

  try {
    const qr = await import("https://esm.sh/qrcode@1.5.4");
    const toDataURL = qr.toDataURL || qr.default?.toDataURL;
    const dataUrl = await toDataURL(uri, {
      margin: 1,
      width: 240,
      color: {
        dark: "#031006",
        light: "#f2fff5"
      }
    });
    const image = document.createElement("img");
    image.src = dataUrl;
    image.alt = "WalletConnect QR code";
    els.walletConnectQrFrame.append(image);
  } catch (error) {
    const image = document.createElement("img");
    image.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(uri)}`;
    image.alt = "WalletConnect QR code";
    els.walletConnectQrFrame.append(image);
  }

  els.walletConnectQrBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function copyWalletConnectUri() {
  const uri = els.walletConnectUri.value.trim();
  if (!uri) {
    showToast("WalletConnect link is not ready yet");
    return;
  }

  try {
    await navigator.clipboard.writeText(uri);
    showToast("WalletConnect link copied");
  } catch (error) {
    els.walletConnectUri.focus();
    els.walletConnectUri.select();
    showToast("Select and copy the WalletConnect link");
  }
}

async function switchToConfiguredNetwork(provider) {
  const config = await ensureDappConfig();
  const network = config.network;
  const chainId = toHex(network.chainId);

  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
  } catch (error) {
    if (error.code !== 4902) {
      throw error;
    }
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId,
        chainName: network.name,
        nativeCurrency: { name: network.currencySymbol, symbol: network.currencySymbol, decimals: 18 },
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.blockExplorerTx.replace(/\/tx\/?$/, "")]
      }]
    });
  }
}

async function prepareDappCheckout(plan) {
  try {
    const config = await ensureDappConfig();
    const tier = config.tiers?.[plan];
    if (!tier) {
      showToast("Tier is not configured");
      return;
    }

    state.pendingCheckoutTier = plan;
    state.pendingPurchasePlan = plan;
    state.pendingCheckoutTx = "";
    state.view = "upgrade";
    render();

    if (!state.profile.walletAddress) {
      setDappStatus("Connect a wallet before sending USDC.", "Wallet");
      showToast("Connect wallet first");
      scrollToWalletConnect();
      return;
    }

    setDappStatus(`Ready to pay ${tier.priceUsdc} USDC on ${config.network.name}.`, "Ready");
    els.dappCheckoutBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    setDappStatus(error.message || "Crypto checkout unavailable", "Offline");
    showToast("Crypto checkout unavailable");
  }
}

async function sendUsdcPayment() {
  if (!state.profile || !state.pendingCheckoutTier) {
    return;
  }

  try {
    state.dappLoading = true;
    renderDappCheckout();
    const config = await ensureDappConfig();
    if (config.testMode) {
      setDappStatus("Test mode is on. Turn it off before sending real USDC.", "Test");
      showToast("Test mode blocks real payments");
      return;
    }
    const provider = state.connectedWalletProvider || await walletProviderFor(els.walletProviderSelect.value);
    const wallet = state.profile.walletAddress || state.connectedWalletAddress;
    const tier = config.tiers[state.pendingCheckoutTier];

    if (!provider || !isEvmAddress(wallet)) {
      showToast("Connect wallet first");
      return;
    }

    await switchToConfiguredNetwork(provider);
    setDappStatus("Waiting for wallet confirmation...", "Signing");

    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [{
        from: wallet,
        to: config.network.usdcAddress,
        value: "0x0",
        data: encodeUsdcTransfer(config.receivingAddress, parseUsdcUnits(tier.priceUsdc))
      }]
    });

    state.pendingCheckoutTx = txHash;
    setDappStatus("Transaction sent. Waiting for backend verification...", "Sent");
    renderDappCheckout();
    await apiPost("/api/dapp-record-pending", {
      email: state.profile.address,
      walletAddress: wallet,
      txHash,
      tierId: state.pendingCheckoutTier
    });

    const result = await apiPost("/api/dapp-verify-payment", {
      email: state.profile.address,
      walletAddress: wallet,
      txHash,
      tierId: state.pendingCheckoutTier
    });

    if (!result.ok) {
      setDappStatus(result.error || "Payment not verified yet", "Pending");
      showToast("Payment not verified yet");
      return;
    }

    applyPremiumFromServer(result.user);
    state.pendingCheckoutTx = txHash;
    setDappStatus("Payment verified. Premium unlocked.", "Verified");
    showToast(`${result.user.subscription.tierName} unlocked`);
  } catch (error) {
    setDappStatus(error.message || "USDC payment failed", "Error");
    showToast("USDC payment failed");
  } finally {
    state.dappLoading = false;
    renderDappCheckout();
  }
}

function applyPremiumFromServer(user) {
  if (!state.profile || !user?.subscription) {
    return;
  }

  state.profile.walletAddress = user.walletAddress || state.profile.walletAddress;
  state.profile.subscription = user.subscription;
  state.profile.plan = user.subscription.tierId || state.profile.plan;
  state.profile.upgradeStatus = "premium-unlocked";
  ensureAccountDefaults(state.profile);
  seedPlanAddresses(state.profile.plan);
  persistCurrentProfile();
  render();
}

async function ensureSupabaseAuthSession(email, password, mode) {
  const config = await optionalDappConfig();
  if (!config?.supabase?.configured || config.testMode) {
    return true;
  }

  try {
    const payload = mode === "signup"
      ? await supabaseSignUp(email, password, config)
      : await supabaseSignIn(email, password, config);

    if (storeSupabaseSession(payload, email)) {
      return true;
    }

    if (mode === "signup") {
      showToast("Account created. Confirm the email before premium checkout.");
      return true;
    }

    showToast("Login needs a confirmed Supabase session");
    return false;
  } catch (error) {
    if (mode === "signup" && /already|registered|exists/i.test(error.message || "")) {
      try {
        const payload = await supabaseSignIn(email, password, config);
        return storeSupabaseSession(payload, email);
      } catch (loginError) {
        showToast(loginError.message || "Supabase login failed");
        return false;
      }
    }

    showToast(error.message || "Supabase auth failed");
    return false;
  }
}

async function optionalDappConfig() {
  if (state.dappConfig) {
    return state.dappConfig;
  }

  try {
    await loadDappConfig();
  } catch (error) {
    return null;
  }

  return state.dappConfig;
}

async function supabaseSignUp(email, password, config) {
  return supabaseAuthRequest(config, "signup", { email, password });
}

async function supabaseSignIn(email, password, config) {
  return supabaseAuthRequest(config, "token?grant_type=password", { email, password });
}

async function supabaseAuthRequest(config, path, body) {
  const response = await fetch(`${config.supabase.url}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: config.supabase.anonKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || payload.message || "Supabase auth failed");
  }
  return payload;
}

function storeSupabaseSession(payload, email) {
  const accessToken = payload.access_token || payload.session?.access_token || "";
  if (!accessToken) {
    return false;
  }

  const session = {
    email,
    accessToken,
    refreshToken: payload.refresh_token || payload.session?.refresh_token || "",
    expiresAt: payload.expires_at || payload.session?.expires_at || 0
  };

  localStorage.setItem(supabaseSessionKey, JSON.stringify(session));
  localStorage.setItem("cryptedmail_supabase_access_token", accessToken);
  window.cryptedmailSupabaseAccessToken = accessToken;
  return true;
}

function loadSupabaseAccessToken() {
  try {
    const session = JSON.parse(localStorage.getItem(supabaseSessionKey) || "{}");
    if (session.accessToken) {
      return session.accessToken;
    }
  } catch (error) {
    // Ignore malformed local session data and fall back to the legacy key.
  }

  return localStorage.getItem("cryptedmail_supabase_access_token")
    || localStorage.getItem("supabase_access_token")
    || "";
}

async function apiGet(pathname) {
  const response = await fetch(`${dappApiBase}${pathname}`, {
    headers: authHeaders()
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || payload.error || "API request failed");
  }
  return payload;
}

async function apiPost(pathname, body) {
  const response = await fetch(`${dappApiBase}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok && !payload.error) {
    throw new Error(payload.message || "API request failed");
  }
  return payload;
}

function authHeaders() {
  const token = window.cryptedmailSupabaseAccessToken || loadSupabaseAccessToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

function setDappStatus(message, badge = "Status") {
  if (els.dappTxStatus) {
    els.dappTxStatus.textContent = message;
  }
  if (els.dappCheckoutBadge) {
    els.dappCheckoutBadge.textContent = badge;
  }
}

function renderPlanDashboard() {
  if (!state.profile || !els.planDashboard) {
    return;
  }

  const plan = state.profile.plan || "starter";
  const addresses = state.profile.addresses || [state.profile.address];
  const newsBoards = {
    owner: {
      eyebrow: "Owner Console",
      title: "Full platform controls unlocked.",
      text: "Owner mode includes Vault, 1TB encrypted storage, reserved support addresses, manual payment review tools, support queue controls, and system-level demo switches.",
      metrics: [
        ["Owner account has every Vault power plus support controls.", "#01"],
        [`${openSupportTicketCount()} support tickets waiting in queue.`, "#02"],
        [`${addresses.length} reserved/admin addresses active.`, "#03"]
      ]
    },
    starter: {
      eyebrow: "Free News",
      title: "Basic mailbox updates.",
      text: "Free users get the clean email/password mailbox first, 500MB encrypted storage, and clear upgrade paths when they want more.",
      metrics: [
        ["Email/password login now opens the regular mailbox first.", "#01"],
        ["500MB encrypted storage is included on Free.", "#02"],
        ["Encrypted reader and disposable deactivate remain available.", "#03"]
      ]
    },
    plus: {
      eyebrow: "Secure Plus News",
      title: "Paid address updates.",
      text: "Secure Plus focuses on more disposable identities, 100GB encrypted storage, and a mailbox that still feels simple.",
      metrics: [
        ["10-address paid mailbox mode is active.", "#01"],
        ["100GB encrypted storage is active.", "#02"],
        ["Crypto, card, and token upgrade paths are wired.", "#03"]
      ]
    },
    vault: {
      eyebrow: "Vault News",
      title: "Admin lobby updates.",
      text: "Vault adds 1TB encrypted storage and Linux/modded-lobby style controls for people who want the paid power layer.",
      metrics: [
        ["1TB encrypted storage is active for Vault.", "#01"],
        ["Linux lobby, prestige, ghost route, burn queue, and XP boost added.", "#02"],
        [`${addresses.length} addresses active with ${vaultThemeLabel(state.profile.vaultTheme || "linux")} styling.`, "#03"]
      ]
    }
  };

  const details = isOwnerAccount() ? newsBoards.owner : newsBoards[plan] || newsBoards.starter;
  els.planDashboardEyebrow.textContent = details.eyebrow;
  els.planDashboardTitle.textContent = details.title;
  els.planDashboardText.textContent = details.text;
  els.planDashboardMetrics.innerHTML = "";
  details.metrics.forEach(([label, value]) => {
    const tile = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = label;
    tile.append(strong, span);
    els.planDashboardMetrics.append(tile);
  });
}

function renderPlanTools() {
  if (!state.profile || !els.planBadge) {
    return;
  }

  ensureAccountDefaults(state.profile);
  const plan = state.profile.plan || "starter";
  const addresses = state.profile.addresses;
  const limit = planAddressLimit(plan);
  const canAddMore = limit === Infinity || addresses.length < limit;

  els.planBadge.textContent = isOwnerAccount() ? "Owner" : planLabel(plan);
  els.planToolsSummary.textContent = planToolSummary(plan, addresses.length, limit);
  els.generatePlanAddress.textContent = plan === "starter" ? "Unlock & add" : canAddMore ? "Add" : "Full";
  els.generatePlanAddress.disabled = plan !== "starter" && !canAddMore;
  els.vaultTools.hidden = plan !== "vault";
  els.planAddressList.innerHTML = "";
  els.paidPerkGrid.innerHTML = "";
  renderVaultAdmin(plan);
  renderOwnerTools();

  addresses.forEach((address) => {
    const row = document.createElement("div");
    row.className = `plan-address-row${address === currentSendingAddress() ? " is-active" : ""}`;
    row.style.setProperty("--address-color", colorForAddress(address));

    const addressText = document.createElement("span");
    addressText.textContent = address;

    const label = document.createElement("strong");
    if (address === currentSendingAddress() && address === state.profile.address) {
      label.textContent = "Primary sender";
    } else if (address === currentSendingAddress()) {
      label.textContent = "Sending now";
    } else if (address === state.profile.address) {
      label.textContent = "Primary";
    } else {
      label.textContent = "Alias";
    }

    const burnButton = document.createElement("button");
    burnButton.className = "ghost-button compact burn-alias";
    burnButton.type = "button";
    burnButton.textContent = "Burn";
    burnButton.disabled = address === state.profile.address;
    burnButton.addEventListener("click", () => burnPlanAddress(address));

    row.append(addressText, label, burnButton);
    els.planAddressList.append(row);
  });

  planToolPerks(plan).forEach((perk) => {
    const tile = document.createElement("div");
    tile.className = "perk-tile";
    const title = document.createElement("strong");
    title.textContent = perk.title;
    const detail = document.createElement("span");
    detail.textContent = perk.detail;
    tile.append(title, detail);
    els.paidPerkGrid.append(tile);
  });
}

function renderVaultAdmin(plan = state.profile?.plan || "starter") {
  if (!state.profile || !els.vaultTools) {
    return;
  }

  const vaultActive = plan === "vault";
  els.vaultTools.hidden = !vaultActive;
  if (!vaultActive) {
    return;
  }

  ensureAccountDefaults(state.profile);
  els.vaultThemeSelect.value = state.profile.vaultTheme || "linux";
  els.addressColorInput.value = colorForAddress(currentSendingAddress());
  els.vaultAdminStatus.innerHTML = `<strong>${state.profile.vaultAdminStatus || "Admin ready."}</strong><p>${currentSendingAddress()} is selected for admin actions.</p>`;
  els.vaultGlowButton.textContent = state.profile.vaultGlow ? "Glow on" : "Boost glow";
}

function renderOwnerTools() {
  if (!els.ownerTools) {
    return;
  }

  const ownerActive = isOwnerAccount();
  els.ownerTools.hidden = !ownerActive;
  if (!ownerActive || !state.profile) {
    return;
  }

  applyOwnerDefaults(state.profile);
  if (els.ownerVersionBadge) {
    els.ownerVersionBadge.textContent = `Owner console active - ${appVersion}`;
  }
  els.ownerSupportQueue.innerHTML = "";
  state.profile.supportQueue.forEach((ticket) => {
    const row = document.createElement("article");
    row.className = `owner-ticket ${ticket.status === "Resolved" ? "is-resolved" : ""}`;

    const title = document.createElement("strong");
    title.textContent = `${ticket.id} · ${ticket.subject}`;
    const meta = document.createElement("span");
    meta.textContent = `${ticket.priority} priority · ${ticket.status} · ${ticket.from}`;
    const detail = document.createElement("p");
    detail.textContent = ticket.detail;

    row.append(title, meta, detail);
    els.ownerSupportQueue.append(row);
  });

  els.ownerAdminStatus.innerHTML = `<strong>${state.profile.ownerAdminStatus || "Owner controls ready."}</strong><p>${openSupportTicketCount()} open support tickets. ${state.profile.ownerAudit.length} owner audit events saved locally.</p>`;
  els.ownerSystemModeButton.textContent = state.profile.ownerMaintenance ? "Maintenance on" : "Maintenance mode";
}

function openSupportTicketCount() {
  if (!state.profile?.supportQueue) {
    return 0;
  }
  return state.profile.supportQueue.filter((ticket) => ticket.status !== "Resolved").length;
}

function runOwnerAction(action) {
  if (!isOwnerAccount()) {
    showToast("Owner account required");
    return;
  }

  applyOwnerDefaults(state.profile);
  const selected = currentSendingAddress();
  let status = "Owner action completed";

  if (action === "grant-vault") {
    state.profile.plan = "vault";
    state.profile.subscription = {
      status: "premium",
      tierId: "vault",
      tierName: "Vault Owner",
      premiumUntil: "Owner access",
      verifiedAt: new Date().toISOString()
    };
    seedPlanAddresses("vault");
    status = "Owner Vault grant applied.";
  }

  if (action === "verify-payment") {
    status = "Manual payment verification logged for review.";
  }

  if (action === "freeze-address") {
    state.profile.addressColors[selected] = "#ff4d61";
    state.mailbox.unshift({
      id: cryptoRandomId(),
      folder: "inbox",
      from: `abuse@${mailDomain}`,
      to: selected,
      subject: "Owner freeze marker",
      description: `${selected} is marked for owner review.`,
      body: "Owner mode marked this address as frozen for abuse or support review. This is a demo control and does not delete mail.",
      sentAt: new Date().toISOString(),
      security: "Owner"
    });
    status = `Freeze marker applied to ${selected}.`;
  }

  if (action === "resolve-support") {
    const nextTicket = state.profile.supportQueue.find((ticket) => ticket.status !== "Resolved");
    if (nextTicket) {
      nextTicket.status = "Resolved";
      status = `${nextTicket.id} resolved.`;
    } else {
      status = "No open support tickets left.";
    }
  }

  if (action === "export-support") {
    const openTickets = state.profile.supportQueue.filter((ticket) => ticket.status !== "Resolved").length;
    state.mailbox.unshift({
      id: cryptoRandomId(),
      folder: "inbox",
      from: `support@${mailDomain}`,
      to: ownerAddress,
      subject: "Owner support export",
      description: `${openTickets} open tickets exported to owner audit.`,
      body: state.profile.supportQueue.map((ticket) => `${ticket.id}: ${ticket.status} · ${ticket.priority} · ${ticket.subject}`).join("\n"),
      sentAt: new Date().toISOString(),
      security: "Owner export"
    });
    status = "Support queue exported into the owner inbox.";
  }

  if (action === "system-mode") {
    state.profile.ownerMaintenance = !state.profile.ownerMaintenance;
    status = state.profile.ownerMaintenance ? "Maintenance mode enabled for demo support." : "Maintenance mode disabled.";
  }

  state.profile.ownerAdminStatus = status;
  state.profile.ownerAudit.unshift({
    id: `AUD-${Date.now().toString().slice(-6)}`,
    action: status,
    at: new Date().toISOString(),
    address: selected
  });
  persistCurrentMailbox();
  persistCurrentProfile();
  render();
  showToast(status);
}

function renderAddressFilters() {
  if (!state.profile || !els.addressFilterList) {
    return;
  }

  ensureAccountDefaults(state.profile);
  if (state.addressFilter !== "all" && !state.profile.addresses.includes(state.addressFilter)) {
    state.addressFilter = "all";
  }

  els.addressFilterList.innerHTML = "";
  const filters = [
    {
      value: "all",
      label: "Unified inbox",
      count: getFolderMessagesBase().length
    },
    ...state.profile.addresses.map((address) => ({
      value: address,
      label: address === state.profile.address ? "Primary" : localPart(address),
      count: getFolderMessagesBase().filter((message) => messageMatchesAddress(message, address)).length
    }))
  ];

  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.className = `address-filter-button${state.addressFilter === filter.value ? " is-active" : ""}`;
    button.type = "button";
    if (filter.value !== "all") {
      button.style.setProperty("--address-color", colorForAddress(filter.value));
    }

    const label = document.createElement("span");
    label.textContent = filter.label;
    const meta = document.createElement("strong");
    meta.textContent = filter.value === "all" ? `${filter.count}` : filter.value;

    button.append(label, meta);
    button.addEventListener("click", () => setAddressFilter(filter.value));
    els.addressFilterList.append(button);
  });
}

function setAddressFilter(value) {
  state.addressFilter = value;
  state.selectedId = null;
  renderMailbox();
}

function addPlanAddress() {
  if (!state.profile) {
    return;
  }

  ensureAccountDefaults(state.profile);
  const requestedHandle = normalizeHandle(els.aliasHandleInput.value);
  let handle = requestedHandle || generateHandle();
  let address = `${handle}@${mailDomain}`;

  if ((state.profile.plan || "starter") === "starter") {
    state.profile.plan = "plus";
    ensureAccountDefaults(state.profile);
    showToast("Secure Plus demo unlocked");
  }

  const plan = state.profile.plan || "starter";
  const limit = planAddressLimit(plan);

  if (limit !== Infinity && state.profile.addresses.length >= limit) {
    showToast(`${planLabel(plan)} address limit reached`);
    return;
  }

  let attempts = 0;
  const baseHandle = handle;
  while (findAccountByAddress(address) && !state.profile.addresses.includes(address) && attempts < 30) {
    attempts += 1;
    handle = requestedHandle ? normalizeHandle(`${baseHandle}-${attempts + 1}`) : generateHandle();
    address = `${handle}@${mailDomain}`;
  }

  if (state.profile.addresses.includes(address)) {
    handle = `${baseHandle}-${Date.now().toString().slice(-4)}`;
    address = `${normalizeHandle(handle)}@${mailDomain}`;
  }

  if (findAccountByAddress(address)) {
    showToast("Try a different address name");
    return;
  }

  state.profile.addresses.push(address);
  state.profile.sendingAddress = address;
  state.addressFilter = "all";
  els.aliasHandleInput.value = "";
  persistCurrentProfile();
  render();
  showToast(`${address} added`);
}

function setSendingAddress(address) {
  if (!state.profile || !state.profile.addresses.includes(address)) {
    return;
  }

  state.profile.sendingAddress = address;
  persistCurrentProfile();
  render();
  showToast(`Sending from ${address}`);
}

function setVaultAddressColor() {
  if (!state.profile || (state.profile.plan || "starter") !== "vault") {
    openUpgradeView();
    showToast("Vault is required for color admin");
    return;
  }

  ensureAccountDefaults(state.profile);
  state.profile.addressColors[currentSendingAddress()] = els.addressColorInput.value;
  state.profile.vaultAdminStatus = `Color updated for ${localPart(currentSendingAddress())}`;
  persistCurrentProfile();
  render();
  showToast("Vault color updated");
}

function setVaultTheme() {
  if (!state.profile || (state.profile.plan || "starter") !== "vault") {
    openUpgradeView();
    showToast("Vault is required for mailbox styles");
    return;
  }

  state.profile.vaultTheme = els.vaultThemeSelect.value || "linux";
  state.profile.vaultAdminStatus = `${vaultThemeLabel(state.profile.vaultTheme)} style applied`;
  persistCurrentProfile();
  render();
  showToast("Vault style applied");
}

function runVaultAdminAction(action) {
  if (!state.profile || (state.profile.plan || "starter") !== "vault") {
    openUpgradeView();
    showToast("Upgrade to Vault for admin powers");
    return;
  }

  ensureAccountDefaults(state.profile);
  const address = currentSendingAddress();

  if (action === "vip") {
    state.profile.addressColors[address] = "#ffd166";
    state.profile.vaultAdminStatus = `VIP gold applied to ${localPart(address)}`;
  }

  if (action === "linux") {
    state.profile.vaultTheme = "linux";
    state.profile.vaultGlow = true;
    state.profile.addressColors[address] = "#3df58d";
    state.profile.vaultAdminStatus = "Linux lobby skin loaded";
  }

  if (action === "glow") {
    state.profile.vaultGlow = !state.profile.vaultGlow;
    state.profile.vaultAdminStatus = state.profile.vaultGlow ? "Vault glow boosted" : "Vault glow turned down";
  }

  if (action === "prestige") {
    state.profile.vaultPrestige = !state.profile.vaultPrestige;
    state.profile.addressColors[address] = state.profile.vaultPrestige ? "#c999ff" : colorForAddress(address);
    state.profile.vaultAdminStatus = state.profile.vaultPrestige ? "Prestige tag equipped" : "Prestige tag removed";
  }

  if (action === "ghost") {
    state.profile.addressColors[address] = "#76d8ff";
    state.profile.vaultAdminStatus = `Ghost route color applied to ${localPart(address)}`;
  }

  if (action === "xp") {
    state.profile.vaultGlow = true;
    state.profile.addressColors[address] = "#3df58d";
    state.profile.vaultAdminStatus = "XP boost visual mode active";
  }

  if (action === "lockdown") {
    state.profile.vaultAdminStatus = `Lockdown note saved for ${localPart(address)}`;
    state.mailbox.unshift({
      id: cryptoRandomId(),
      folder: "inbox",
      from: `admin@${mailDomain}`,
      to: address,
      subject: "Vault lockdown note",
      description: `${address} has a Vault-only security note attached.`,
      body: "This demo note marks the selected address for stricter routing, manual review, and faster burn decisions. It does not delete mail.",
      sentAt: new Date().toISOString(),
      security: "Vault admin"
    });
    persistCurrentMailbox();
  } else if (action === "queue") {
    state.profile.vaultAdminStatus = `Burn queue staged for ${localPart(address)}`;
    state.mailbox.unshift({
      id: cryptoRandomId(),
      folder: "inbox",
      from: `lobby@${mailDomain}`,
      to: address,
      subject: "Vault burn queue staged",
      description: `${address} is marked for quick cleanup decisions.`,
      body: "The selected address has been staged in the Vault burn queue. This is a demo control, so nothing is deleted until you press Burn on the address row.",
      sentAt: new Date().toISOString(),
      security: "Vault lobby"
    });
    persistCurrentMailbox();
  } else {
    persistCurrentProfile();
  }

  render();
  showToast(state.profile.vaultAdminStatus);
}

function colorForAddress(address) {
  if (!state.profile) {
    return "#3df58d";
  }

  ensureAccountDefaults(state.profile);
  return state.profile.addressColors?.[address] || "#3df58d";
}

function burnPlanAddress(address) {
  if (!state.profile) {
    return;
  }

  if (address === state.profile.address) {
    showToast("Use Deactivate for the primary mailbox");
    return;
  }

  state.profile.addresses = state.profile.addresses.filter((item) => item !== address);
  if (state.profile.sendingAddress === address) {
    state.profile.sendingAddress = state.profile.address;
  }
  if (state.addressFilter === address) {
    state.addressFilter = "all";
  }

  state.mailbox.unshift({
    id: cryptoRandomId(),
    folder: "inbox",
    from: `system@${mailDomain}`,
    to: state.profile.address,
    subject: "Disposable address burned",
    description: `${address} was deactivated with no questions.`,
    body: `${address} is no longer active in this browser. Your primary cryptedmail account and remaining aliases stay available.`,
    sentAt: new Date().toISOString(),
    security: "Plan control"
  });

  persistCurrentMailbox();
  render();
  showToast(`${address} burned`);
}

function updateEncryptionHint() {
  if (els.encryptToggle.checked) {
    els.encryptedOutput.placeholder = "Encrypted block appears here. Only the sender and recipient cryptedmail accounts can open it.";
  } else {
    els.encryptedOutput.placeholder = "Standard readable copy appears here because encryption is off.";
  }
}

function renderMailbox() {
  renderFolderButtons();
  renderAddressFilters();
  const messages = getMessagesForFolder();
  const selected = messages.find((message) => message.id === state.selectedId) || messages[0] || null;
  state.selectedId = selected?.id || null;
  const folderTitle = isOwnerAccount()
    ? (state.selectedFolder === "sent" ? "Owner Sent" : "Owner Inbox")
    : (state.selectedFolder === "sent" ? "Sent" : "Inbox");
  const filterTitle = state.addressFilter === "all" ? "All addresses" : localPart(state.addressFilter);
  els.mailboxTitle.textContent = folderTitle;
  els.mailboxPanelTitle.textContent = state.addressFilter === "all" ? folderTitle : `${folderTitle}: ${filterTitle}`;
  els.mailCount.textContent = `${messages.length} ${messages.length === 1 ? "message" : "messages"}`;
  els.messageList.innerHTML = "";

  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "preview-card";
    empty.innerHTML = `<strong>No mail here yet.</strong><p>${state.addressFilter === "all" ? "Send a message or paste one into the reader." : "This address is empty. Switch back to Unified inbox to see everything together."}</p>`;
    els.messageList.append(empty);
  }

  messages.forEach((message) => {
    const card = document.createElement("button");
    card.className = `message-card${message.id === state.selectedId ? " is-selected" : ""}`;
    card.type = "button";

    const subject = document.createElement("strong");
    subject.textContent = message.subject;
    const route = document.createElement("span");
    route.textContent = state.selectedFolder === "sent" ? `To ${message.to}` : `From ${message.from}`;
    const description = document.createElement("span");
    description.textContent = `${message.security || "Standard"} | ${message.description || "Email"}`;

    card.append(subject, route, description);
    card.addEventListener("click", () => {
      state.selectedId = message.id;
      renderMailbox();
    });
    els.messageList.append(card);
  });

  renderPreview(selected);
}

function renderFolderButtons() {
  document.querySelectorAll(".folder-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.folder === state.selectedFolder);
  });
}

function renderPreview(message) {
  els.messagePreview.innerHTML = "";

  if (!message) {
    els.messageStatus.textContent = "Empty";
    const strong = document.createElement("strong");
    strong.textContent = "No message selected.";
    const p = document.createElement("p");
    p.textContent = "Choose a message or send a new email.";
    els.messagePreview.append(strong, p);
    return;
  }

  els.messageStatus.textContent = message.security || "Standard";
  const subject = document.createElement("strong");
  subject.textContent = message.subject;
  const meta = document.createElement("p");
  meta.textContent = `From ${message.from} to ${message.to}`;
  const description = document.createElement("p");
  description.textContent = message.description || "";
  const body = document.createElement("p");
  body.textContent = message.body;
  els.messagePreview.append(subject, meta, description, body);
}

function renderReaderMessage(message) {
  els.readerOutput.innerHTML = "";
  const subject = document.createElement("strong");
  subject.textContent = message.subject || "(no subject)";
  const meta = document.createElement("p");
  meta.textContent = `${message.security || "Standard"} | From ${message.from} to ${message.to}`;
  const description = document.createElement("p");
  description.textContent = message.description || "Email";
  const body = document.createElement("p");
  body.textContent = message.body || "";
  els.readerOutput.append(subject, meta, description, body);
}

function addInboxCopy(message) {
  if (!state.authenticated || !state.profile) {
    return;
  }

  const duplicate = state.mailbox.some((item) => (
    item.folder === "inbox" &&
    item.from === message.from &&
    item.to === message.to &&
    item.subject === message.subject &&
    item.sentAt === message.sentAt
  ));

  if (duplicate) {
    return;
  }

  const inboxMessage = {
    id: cryptoRandomId(),
    folder: "inbox",
    from: message.from,
    to: message.to,
    subject: message.subject || "(no subject)",
    description: message.description || "Opened from reader",
    body: message.body || "",
    sentAt: message.sentAt || new Date().toISOString(),
    security: message.security || "Standard"
  };

  state.mailbox.unshift(inboxMessage);
  state.selectedFolder = "inbox";
  state.selectedId = inboxMessage.id;
  persistCurrentMailbox();
  renderMailbox();
}

function deliverLocalCopy(message, encryptedBlock, recipientAccount) {
  if (!recipientAccount) {
    return;
  }

  ensureAccountDefaults(recipientAccount);
  const inboxMessage = {
    ...message,
    id: cryptoRandomId(),
    folder: "inbox",
    encrypted: encryptedBlock
  };

  if (recipientAccount.address === state.profile.address) {
    state.mailbox.unshift(inboxMessage);
    return;
  }

  recipientAccount.mailbox = Array.isArray(recipientAccount.mailbox) ? recipientAccount.mailbox : [];
  recipientAccount.mailbox.unshift(inboxMessage);
  state.accounts[recipientAccount.address] = recipientAccount;
  persistAccounts();
}

function getFolderMessagesBase() {
  return state.mailbox.filter((message) => message.folder === state.selectedFolder);
}

function getMessagesForFolder() {
  const query = cleanText(els.mailSearch?.value || "").toLowerCase();
  return getFolderMessagesBase().filter((message) => {
    if (!messageMatchesAddress(message, state.addressFilter)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      message.from,
      message.to,
      message.subject,
      message.description,
      message.body,
      message.security
    ].join(" ").toLowerCase().includes(query);
  });
}

function messageMatchesAddress(message, address) {
  if (address === "all") {
    return true;
  }

  if (state.selectedFolder === "sent") {
    return message.from === address;
  }

  return message.to === address;
}

async function copyEncryptedBlock() {
  const block = els.encryptedOutput.value.trim();
  if (!block) {
    showToast("Send a message first");
    return;
  }

  try {
    await navigator.clipboard.writeText(block);
    showToast("Message block copied");
  } catch (error) {
    showToast("Copy blocked by browser");
  }
}

function openDeactivateConfirm() {
  if (!state.authenticated) {
    return;
  }

  if (typeof els.confirmDialog.showModal === "function") {
    els.confirmDialog.showModal();
  } else if (window.confirm("Deactivate this cryptedmail account?")) {
    deactivateAccount();
  }
}

function closeDeactivateConfirm() {
  if (els.confirmDialog.open) {
    els.confirmDialog.close();
  }
}

function deactivateAccount() {
  if (state.profile) {
    delete state.accounts[state.profile.address];
    persistAccounts();
  }
  sessionStorage.removeItem(sessionKey);
  clearSupabaseSession();
  state.profile = null;
  state.authenticated = false;
  state.mailbox = [];
  state.view = "mailbox";
  state.selectedFolder = "inbox";
  state.addressFilter = "all";
  state.selectedId = null;
  els.encryptedOutput.value = "";
  els.readerPaste.value = "";
  els.readerOutput.innerHTML = "<strong>No encrypted message opened yet.</strong><p>Encrypted blocks only open for the sender or intended cryptedmail recipient.</p>";
  closeDeactivateConfirm();
  setAuthMode("signup");
  render();
  showToast("Account deactivated");
}

function signOut() {
  state.authenticated = false;
  state.profile = null;
  state.mailbox = [];
  state.view = "mailbox";
  state.selectedFolder = "inbox";
  state.addressFilter = "all";
  state.selectedId = null;
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(ownerSessionKey);
  clearSupabaseSession();
  setAuthMode("login");
  render();
  showToast("Signed out");
}

function setCurrentAccount(address) {
  const requestedAddress = normalizeEmail(address);
  if (isOwnerAddress(requestedAddress) && requestedAddress !== ownerAddress && state.accounts[ownerAddress]) {
    state.accounts[ownerAddress].sendingAddress = requestedAddress;
    address = ownerAddress;
  }

  state.profile = state.accounts[address] || null;
  state.authenticated = Boolean(state.profile);
  if (state.profile && ensureAccountDefaults(state.profile)) {
    persistAccounts();
  }
  if (state.profile && !state.profile.walletAddress) {
    const savedWallet = localStorage.getItem(walletLinkKey(state.profile.address));
    if (savedWallet && isEvmAddress(savedWallet)) {
      state.profile.walletAddress = savedWallet;
    }
  }
  state.mailbox = state.profile?.mailbox || [];
  state.view = "mailbox";
  state.selectedFolder = "inbox";
  state.addressFilter = "all";
  state.selectedId = getMessagesForFolder()[0]?.id || state.mailbox[0]?.id || null;
  syncBackendSubscription();
}

function hydrateWalletLink() {
  if (!state.profile) {
    return;
  }
  const savedWallet = localStorage.getItem(walletLinkKey(state.profile.address));
  if (savedWallet && isEvmAddress(savedWallet)) {
    state.profile.walletAddress = savedWallet;
  }
}

function clearAuthSecrets() {
  els.passphraseInput.value = "";
}

function clearSupabaseSession() {
  localStorage.removeItem(supabaseSessionKey);
  localStorage.removeItem("cryptedmail_supabase_access_token");
  delete window.cryptedmailSupabaseAccessToken;
}

function loadAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(accountsKey));
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    return {};
  }
}

async function ensureOwnerAccount() {
  let account = state.accounts[ownerAddress];
  let touchedOwner = false;

  if (!account) {
    const keys = createDemoKeys("cryptedmail-owner-local-demo-key");
    account = {
      address: ownerAddress,
      role: "owner",
      plan: "vault",
      addresses: [...ownerReservedAddresses],
      sendingAddress: ownerAddress,
      addressColors: {
        [ownerAddress]: "#3df58d",
        [`support@${mailDomain}`]: "#76d8ff",
        [`abuse@${mailDomain}`]: "#ff6b7d",
        [`billing@${mailDomain}`]: "#ffd166",
        [`admin@${mailDomain}`]: "#c999ff"
      },
      proof: await hashText(ownerDefaultPassword),
      publicKeyJwk: keys.publicKeyJwk,
      privateKeyJwk: keys.privateKeyJwk,
      createdAt: Date.now(),
      ownerAccountReady: true,
      mailbox: makeOwnerMailbox(ownerAddress)
    };
    state.accounts[ownerAddress] = account;
    touchedOwner = true;
  }

  if (!account.ownerAccountReady) {
    account.proof = await hashText(ownerDefaultPassword);
    account.ownerAccountReady = true;
    touchedOwner = true;
  }

  touchedOwner = absorbReservedOwnerAccounts(account) || touchedOwner;

  if (applyOwnerDefaults(account) || touchedOwner) {
    persistAccounts();
  }
}

function openOwnerSession(requestedAddress = ownerAddress) {
  const sendingAddress = ownerAddressFromInput(requestedAddress) || ownerAddress;
  const account = state.accounts[ownerAddress];
  if (!account) {
    return;
  }

  applyOwnerDefaults(account);
  account.sendingAddress = sendingAddress;
  absorbReservedOwnerAccounts(account);
  persistAccounts();
  setCurrentAccount(ownerAddress);
  sessionStorage.setItem(sessionKey, sendingAddress);
  localStorage.setItem(ownerSessionKey, sendingAddress);
}

function isOwnerAddress(address) {
  return ownerReservedAddresses.includes(normalizeEmail(address));
}

function ownerAddressFromInput(value) {
  const email = normalizeEmail(value);
  if (isOwnerAddress(email)) {
    return email;
  }

  const handle = normalizeHandle(value);
  const address = handle ? `${handle}@${mailDomain}` : "";
  return isOwnerAddress(address) ? address : "";
}

function isOwnerAccount(account = state.profile) {
  return Boolean(account && (account.role === "owner" || isOwnerAddress(account.address)));
}

function applyOwnerDefaults(account) {
  if (!account) {
    return false;
  }

  let changed = false;
  const ownerAddresses = [...ownerReservedAddresses, ...(Array.isArray(account.addresses) ? account.addresses : [])]
    .map((address) => normalizeEmail(address))
    .filter(Boolean);
  const uniqueOwnerAddresses = Array.from(new Set(ownerAddresses));

  if (account.role !== "owner") {
    account.role = "owner";
    changed = true;
  }
  if (account.plan !== "vault") {
    account.plan = "vault";
    changed = true;
  }
  if (account.storageLimit !== "1TB") {
    account.storageLimit = "1TB";
    changed = true;
  }
  if (!Array.isArray(account.addresses) || account.addresses.join("|") !== uniqueOwnerAddresses.join("|")) {
    account.addresses = uniqueOwnerAddresses;
    changed = true;
  }
  if (!account.sendingAddress || !account.addresses.includes(account.sendingAddress)) {
    account.sendingAddress = ownerAddress;
    changed = true;
  }
  if (!account.addressColors || typeof account.addressColors !== "object") {
    account.addressColors = {};
    changed = true;
  }

  ownerReservedAddresses.forEach((address, index) => {
    const colors = ["#3df58d", "#76d8ff", "#ff6b7d", "#ffd166", "#c999ff"];
    if (!account.addressColors[address]) {
      account.addressColors[address] = colors[index] || "#3df58d";
      changed = true;
    }
  });

  if (!Array.isArray(account.supportQueue)) {
    account.supportQueue = defaultSupportQueue();
    changed = true;
  }
  if (!Array.isArray(account.ownerAudit)) {
    account.ownerAudit = [
      {
        id: "AUD-100",
        action: "Owner account created",
        at: new Date().toISOString()
      }
    ];
    changed = true;
  }
  if (!account.ownerAdminStatus) {
    account.ownerAdminStatus = "Owner controls ready.";
    changed = true;
  }
  if (!account.subscription || account.subscription.tierId !== "vault") {
    account.subscription = {
      status: "premium",
      tierId: "vault",
      tierName: "Vault Owner",
      premiumUntil: "Owner access",
      verifiedAt: new Date().toISOString()
    };
    changed = true;
  }

  return changed;
}

function absorbReservedOwnerAccounts(ownerAccount) {
  if (!ownerAccount) {
    return false;
  }

  let changed = false;
  ownerReservedAddresses.forEach((reservedAddress) => {
    if (reservedAddress === ownerAddress) {
      return;
    }

    const separateAccount = state.accounts[reservedAddress];
    if (!separateAccount || separateAccount === ownerAccount) {
      return;
    }

    if (Array.isArray(separateAccount.mailbox) && separateAccount.mailbox.length) {
      ownerAccount.mailbox = [
        ...(Array.isArray(ownerAccount.mailbox) ? ownerAccount.mailbox : []),
        ...separateAccount.mailbox.map((message) => ({
          ...message,
          id: message.id || cryptoRandomId(),
          security: message.security || "Imported support mailbox"
        }))
      ];
    }

    if (Array.isArray(separateAccount.addresses)) {
      ownerAccount.addresses = Array.from(new Set([...(ownerAccount.addresses || []), ...separateAccount.addresses]));
    }

    delete state.accounts[reservedAddress];
    changed = true;
  });

  return changed;
}

function persistAccounts() {
  localStorage.setItem(accountsKey, JSON.stringify(state.accounts));
}

function persistCurrentMailbox() {
  if (!state.profile) {
    return;
  }
  state.profile.mailbox = state.mailbox;
  persistCurrentProfile();
}

function persistCurrentProfile() {
  if (!state.profile) {
    return;
  }
  state.accounts[state.profile.address] = state.profile;
  persistAccounts();
}

function ensureAccountDefaults(account) {
  let changed = false;

  if (isOwnerAccount(account)) {
    changed = applyOwnerDefaults(account) || changed;
  }

  if (!account.plan) {
    account.plan = "starter";
    changed = true;
  }

  if (!Array.isArray(account.mailbox)) {
    account.mailbox = makeStarterMailbox(account.address);
    changed = true;
  }

  if (!account.addressColors || typeof account.addressColors !== "object") {
    account.addressColors = {};
    changed = true;
  }

  if (!account.vaultTheme) {
    account.vaultTheme = "linux";
    changed = true;
  }

  if (!account.vaultAdminStatus) {
    account.vaultAdminStatus = "Admin ready.";
    changed = true;
  }

  if (!Array.isArray(account.tipHistory)) {
    account.tipHistory = [];
    changed = true;
  }

  const merged = [account.address, ...(Array.isArray(account.addresses) ? account.addresses : [])]
    .map((address) => normalizeEmail(address))
    .filter(Boolean);
  const addresses = Array.from(new Set(merged));

  if (!addresses.includes(account.address)) {
    addresses.unshift(account.address);
  }

  if (!Array.isArray(account.addresses) || account.addresses.join("|") !== addresses.join("|")) {
    account.addresses = addresses;
    changed = true;
  }

  if (!account.sendingAddress || !account.addresses.includes(account.sendingAddress)) {
    account.sendingAddress = account.address;
    changed = true;
  }

  return changed;
}

function seedPlanAddresses(plan, account = state.profile) {
  if (!account || plan === "starter") {
    return;
  }

  ensureAccountDefaults(account);
  const targetCount = plan === "vault" ? 5 : 3;
  const root = (normalizeHandle(localPart(account.address)) || "secure").slice(0, 22);
  const labels = plan === "vault"
    ? ["personal", "work", "family", "shop", "vault"]
    : ["shop", "work", "signup"];

  labels.forEach((label) => {
    if (account.addresses.length >= targetCount) {
      return;
    }

    let handle = normalizeHandle(`${root}-${label}`);
    let candidate = `${handle}@${mailDomain}`;
    let suffix = 2;

    while (findAccountByAddress(candidate) && !account.addresses.includes(candidate) && suffix < 20) {
      handle = normalizeHandle(`${root}-${label}-${suffix}`);
      candidate = `${handle}@${mailDomain}`;
      suffix += 1;
    }

    if (!account.addresses.includes(candidate) && !findAccountByAddress(candidate)) {
      account.addresses.push(candidate);
    }
  });
}

function findAccountByAddress(address) {
  const normalized = normalizeEmail(address);
  if (!normalized) {
    return null;
  }

  return Object.values(state.accounts).find((account) => {
    const addresses = Array.isArray(account.addresses) ? account.addresses : [account.address];
    return account.address === normalized || addresses.includes(normalized);
  }) || null;
}

function makeStarterMailbox(address) {
  return [
    {
      id: cryptoRandomId(),
      folder: "inbox",
      from: `system@${mailDomain}`,
      to: address,
      subject: "Welcome to cryptedmail",
      description: "Your disposable mailbox is ready.",
      body: "Use Compose to send standard mail or turn on encryption. When you are done with this address, deactivate instantly with no questions. Encrypted blocks can only be opened by the sender account or the intended cryptedmail recipient account.",
      sentAt: new Date().toISOString(),
      security: "Encrypted-ready"
    }
  ];
}

function makeOwnerMailbox(address) {
  return [
    {
      id: cryptoRandomId(),
      folder: "inbox",
      from: `owner-system@${mailDomain}`,
      to: address,
      subject: "Owner command center is ready",
      description: "Support, payment review, Vault controls, and admin routing are unlocked.",
      body: "This owner account controls the demo support queue, reserved support addresses, manual premium review, abuse freezing, and Vault admin tools. Normal users cannot see these controls.",
      sentAt: new Date().toISOString(),
      security: "Owner"
    },
    {
      id: cryptoRandomId(),
      folder: "inbox",
      from: `support@${mailDomain}`,
      to: address,
      subject: "Support inbox setup",
      description: "support, abuse, billing, and admin addresses are reserved for the owner.",
      body: "Use the top-right address dropdown to send from support@cryptedmail.com, abuse@cryptedmail.com, billing@cryptedmail.com, admin@cryptedmail.com, or owner@cryptedmail.com.",
      sentAt: new Date().toISOString(),
      security: "Support"
    },
    ...makePlanMailbox({ address, plan: "vault" })
  ];
}

function defaultSupportQueue() {
  return [
    {
      id: "SUP-1001",
      from: "newuser@example.com",
      subject: "Wallet payment is pending",
      priority: "High",
      status: "Open",
      detail: "User connected a wallet but refreshed before premium unlocked."
    },
    {
      id: "SUP-1002",
      from: "creator@example.com",
      subject: "Need more disposable addresses",
      priority: "Medium",
      status: "Open",
      detail: "Creator wants Vault for brand, shop, collab, and fan mail identities."
    },
    {
      id: "SUP-1003",
      from: "abuse-report@example.com",
      subject: "Possible phishing alias",
      priority: "Critical",
      status: "Open",
      detail: "Review and freeze an exposed or abusive disposable address."
    }
  ];
}

function makePlanMailbox(account) {
  const starter = makeStarterMailbox(account.address);
  const plan = account.plan || "starter";

  if (plan === "vault") {
    return [
      {
        id: cryptoRandomId(),
        folder: "inbox",
        from: `vault@${mailDomain}`,
        to: account.address,
        subject: "Vault admin mode is ready",
        description: "Unlimited addresses, color controls, mailbox styles, and admin tools are active.",
        body: "Use the top-right address dropdown to choose a sender. The Vault admin box on the right can color-code identities, switch mailbox styles, mark VIP addresses, boost the dashboard glow, and add lockdown notes.",
        sentAt: new Date().toISOString(),
        security: "Vault"
      },
      ...starter
    ];
  }

  if (plan === "plus") {
    return [
      {
        id: cryptoRandomId(),
        folder: "inbox",
        from: `plus@${mailDomain}`,
        to: account.address,
        subject: "Secure Plus is active",
        description: "10 disposable addresses and alias routing are ready.",
        body: "Type the first part of a new address, click Add, and choose it from the top-right dropdown before sending.",
        sentAt: new Date().toISOString(),
        security: "Secure Plus"
      },
      ...starter
    ];
  }

  return starter;
}

async function hashText(value) {
  if (window.crypto?.subtle) {
    try {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      // Local file previews can block WebCrypto; fall back to demo hashing.
    }
  }

  return btoa(value);
}

function normalizeHandle(value) {
  let raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(`@${mailDomain}`, "");

  if (raw.includes("@")) {
    raw = raw.split("@")[0];
  }

  return raw
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/[._-]{2,}/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 32);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email) {
    return "";
  }
  return /^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email) ? email : "";
}

function addressFromInput(value, fallbackHandle = "demo") {
  const handle = normalizeHandle(value) || normalizeHandle(fallbackHandle) || "demo";
  return `${handle}@${mailDomain}`;
}

function uniqueAccountAddress(address) {
  const normalized = normalizeEmail(address) || addressFromInput(address);
  const root = normalizeHandle(localPart(normalized)) || "demo";
  let candidate = `${root}@${mailDomain}`;
  let suffix = 2;

  while (findAccountByAddress(candidate) && suffix < 100) {
    candidate = `${root}-${suffix}@${mailDomain}`;
    suffix += 1;
  }

  return candidate;
}

function localPart(address) {
  return String(address || "").split("@")[0] || "";
}

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function generateHandle() {
  const left = ["crypted", "cipher", "zero", "quiet", "relay", "night", "mask", "vault", "sealed", "private"];
  const right = ["mail", "inbox", "drop", "gate", "node", "pulse", "lock", "wire", "box", "route"];
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${sample(left)}-${sample(right)}-${suffix}`;
}

function uniqueAccounts(accounts) {
  const seen = new Set();
  return accounts.filter((account) => {
    if (!account || seen.has(account.address)) {
      return false;
    }
    seen.add(account.address);
    return true;
  });
}

function planLabel(plan) {
  if (plan === "plus") {
    return "Secure Plus";
  }
  if (plan === "vault") {
    return "Vault";
  }
  return "Free";
}

function vaultThemeLabel(theme) {
  const labels = {
    linux: "Linux lobby",
    royal: "Royal purple",
    neon: "Neon terminal",
    ember: "Red alert",
    ice: "Ice vault"
  };
  return labels[theme] || labels.linux;
}

function paymentSummary(details, method) {
  if (method === "crypto") {
    return `${details.summary} Connect wallet, confirm crypto payment, then premium unlocks on this email login.`;
  }
  if (method === "membership-token") {
    return `${details.summary} Verify a membership NFT/token and attach the premium status to this account.`;
  }
  return `${details.summary} Card checkout stays available for users who do not want a wallet.`;
}

function upgradeStatusText(profile) {
  if (!profile) {
    return "Premium unlock waits for payment or token proof.";
  }
  if (profile.upgradeStatus === "premium-unlocked") {
    return `${planLabel(profile.plan)} unlocked for ${profile.address}.`;
  }
  if (profile.walletAddress) {
    return "Wallet connected. Choose crypto payment, card payment, or token verification.";
  }
  return "Premium unlock waits for payment or token proof.";
}

function cleanWallet(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function walletLinkKey(email) {
  return `cryptedmail-wallet-${String(email || "").toLowerCase()}`;
}

function isEvmAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(cleanWallet(value));
}

function shortWallet(wallet) {
  const clean = cleanWallet(wallet);
  if (clean.length <= 14) {
    return clean;
  }
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
}

function demoWallet() {
  return `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`.slice(0, 18);
}

function toHex(value) {
  return `0x${Number(value).toString(16)}`;
}

function parseUsdcUnits(value) {
  const [wholeRaw, fractionRaw = ""] = String(value || "0").split(".");
  const whole = BigInt(wholeRaw || "0") * 1_000_000n;
  const fraction = BigInt((fractionRaw.replace(/\D/g, "") + "000000").slice(0, 6));
  return whole + fraction;
}

function encodeUsdcTransfer(to, amount) {
  const address = cleanWallet(to).replace(/^0x/i, "").toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(address)) {
    throw new Error("Receiving wallet is not configured");
  }

  const paddedAddress = address.padStart(64, "0");
  const paddedAmount = amount.toString(16).padStart(64, "0");
  return `0xa9059cbb${paddedAddress}${paddedAmount}`;
}

function planAddressLimit(plan) {
  if (plan === "vault") {
    return Infinity;
  }
  if (plan === "plus") {
    return 10;
  }
  return 1;
}

function planToolSummary(plan, count, limit) {
  if (isOwnerAccount()) {
    return `Owner active: ${count} reserved/admin addresses, 1TB storage, support queue, and platform controls.`;
  }
  if (plan === "vault") {
    return `Vault active: ${count} addresses. Type the first part and click Add.`;
  }
  if (plan === "plus") {
    return `Secure Plus active: ${count} of ${limit} addresses. Type the first part and click Add.`;
  }
  return "Type the first part and click Add. Demo unlocks Secure Plus so you can test multiple addresses.";
}

function planToolPerks(plan) {
  if (isOwnerAccount()) {
    return [
      { title: "Owner role", detail: "Reserved owner, support, abuse, billing, and admin addresses." },
      { title: "Support queue", detail: "Review, resolve, and export demo support tickets from the mailbox." },
      { title: "Manual payment review", detail: "Log wallet/payment checks before premium unlock support." },
      { title: "Abuse freeze", detail: "Mark a selected address for owner-only abuse review." },
      { title: "1TB storage", detail: "Owner gets the full Vault storage and unlimited address layer." },
      { title: "System switches", detail: "Toggle demo maintenance mode and owner audit events." }
    ];
  }

  if (plan === "vault") {
    return [
      { title: "Unlimited addresses", detail: "Keep separate mailboxes for every identity, project, or family member." },
      { title: "1TB storage", detail: "Archive encrypted mail, imports, attachments, and long-term identity history." },
      { title: "Admin style tools", detail: "Change the Vault mailbox theme and boost the paid dashboard glow." },
      { title: "Color-coded identities", detail: "Pick any sending address and mark it with its own color." },
      { title: "Secure import", detail: "Demo-ready import lane for moving older email into encrypted storage." },
      { title: "VIP and lockdown controls", detail: "Mark high-value addresses and add Vault-only security notes." }
    ];
  }

  if (plan === "plus") {
    return [
      { title: "10 addresses", detail: "Create multiple active cryptedmail.com aliases from this mailbox." },
      { title: "100GB storage", detail: "More room for encrypted message blocks, attachments, and sent history." },
      { title: "Alias rotation", detail: "Switch the sender address before composing a message." },
      { title: "Tracker blocking", detail: "Paid mailbox mode shows safer remote-image and tracking protection." },
      { title: "Priority routing", detail: "Keep paid inboxes cleaner with stronger address separation." }
    ];
  }

  return [
    { title: "1 address", detail: "Free users get one disposable cryptedmail.com mailbox." },
    { title: "500MB storage", detail: "Enough encrypted room for a starter mailbox and basic private signups." },
    { title: "Receiver encryption", detail: "Encrypted blocks still open only for sender and recipient accounts." },
    { title: "Instant deactivate", detail: "Burn the whole local account anytime with no questions." },
    { title: "Upgrade path", detail: "Secure Plus adds 10 aliases; Vault adds unlimited mailboxes." }
  ];
}

function planDetails(plan) {
  const plans = {
    plus: {
      id: "plus",
      name: "Secure Plus",
      price: "$5",
      cycle: "per month",
      summary: "Upgrade to faster disposable addresses with blockchain-backed plan access.",
      perks: [
        "10 active disposable @cryptedmail.com addresses",
        "100GB encrypted storage",
        "One-click shutdown for every address",
        "Receiver-only encrypted messages",
        "Alias rotation for signups and risky sites",
        "Tracker blocking and safer image loading",
        "On-chain plan access receipt"
      ]
    },
    vault: {
      id: "vault",
      name: "Vault",
      price: "$10",
      cycle: "per month",
      summary: "Full disposable email vault for power users, teams, and families.",
      perks: [
        "Unlimited disposable mailboxes",
        "1TB encrypted storage",
        "Vault admin box inside the mailbox",
        "Mailbox style switching",
        "Color-coded identities",
        "Secure import from old inboxes",
        "VIP marking, lockdown notes, and burn prep",
        "Blockchain-backed ownership and plan receipts"
      ]
    },
    starter: {
      id: "starter",
      name: "Starter",
      price: "$0",
      cycle: "per month",
      summary: "Free disposable encrypted email for everyday private signups.",
      perks: [
        "1 disposable @cryptedmail.com address",
        "500MB encrypted storage",
        "Instant deactivate",
        "Receiver-only encrypted messages",
        "Encrypted reader"
      ]
    }
  };
  return plans[plan] || plans.starter;
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function cryptoRandomId() {
  if (window.crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function encodeText(text) {
  return encodeBytes(new TextEncoder().encode(text));
}

function decodeText(value) {
  return new TextDecoder().decode(decodeBytes(value));
}

function encodeBytes(bytes) {
  let binary = "";
  new Uint8Array(bytes).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function xorTextToBase64(text, key) {
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key || "cryptedmail");
  const output = new Uint8Array(textBytes.length);
  for (let index = 0; index < textBytes.length; index += 1) {
    output[index] = textBytes[index] ^ keyBytes[index % keyBytes.length];
  }
  return encodeBytes(output);
}

function xorBase64ToText(value, key) {
  const bytes = decodeBytes(value);
  const keyBytes = new TextEncoder().encode(key || "cryptedmail");
  const output = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    output[index] = bytes[index] ^ keyBytes[index % keyBytes.length];
  }
  return new TextDecoder().decode(output);
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2200);
}

function playSendPulse(encrypted = false) {
  document.body.classList.remove("is-sending", "is-secure-send");
  void document.body.offsetWidth;
  document.body.classList.toggle("is-secure-send", encrypted);
  document.body.classList.add("is-sending");
  els.composePanel?.classList.add("sent-pop");
  if (els.composeSecurityRibbon) {
    const ribbonTitle = els.composeSecurityRibbon.querySelector("strong");
    const ribbonText = els.composeSecurityRibbon.querySelector("span");
    if (ribbonTitle) {
      ribbonTitle.textContent = encrypted ? "Sealed delivery launched" : "Readable delivery launched";
    }
    if (ribbonText) {
      ribbonText.textContent = encrypted
        ? "The encrypted block is now locked to sender plus receiver."
        : "Encryption is off for this send; the copy stays readable.";
    }
  }
  window.setTimeout(() => {
    document.body.classList.remove("is-sending", "is-secure-send");
    els.composePanel?.classList.remove("sent-pop");
  }, 1500);
}
