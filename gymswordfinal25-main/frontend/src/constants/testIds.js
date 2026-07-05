/**
 * Centralized data-testid registry.
 */
export const HOME = {
  emergentLink: "home-emergent-link",
  hero: "home-hero",
  shopCta: "home-shop-cta",
  newsletterInput: "home-newsletter-input",
  newsletterSubmit: "home-newsletter-submit",
};

export const NAV = {
  logo: "nav-logo",
  shop: "nav-shop",
  men: "nav-men",
  women: "nav-women",
  accessories: "nav-accessories",
  cart: "nav-cart",
  wishlist: "nav-wishlist",
  account: "nav-account",
  login: "nav-login",
  logout: "nav-logout",
  search: "nav-search",
  mobileToggle: "nav-mobile-toggle",
};

export const AUTH = {
  emailInput: "auth-email-input",
  passwordInput: "auth-password-input",
  nameInput: "auth-name-input",
  submit: "auth-submit",
  switch: "auth-switch",
  error: "auth-error",
  forgotLink: "auth-forgot-link",
  resetSubmit: "auth-reset-submit",
};

export const PRODUCT = {
  card: (id) => `product-card-${id}`,
  cardImage: (id) => `product-card-image-${id}`,
  detail: "product-detail",
  thumb: (i) => `product-thumb-${i}`,
  sizeBtn: (size) => `product-size-${size}`,
  colorBtn: (c) => `product-color-${c}`,
  addToCart: "product-add-to-cart",
  addToWishlist: "product-add-wishlist",
  reviewSubmit: "product-review-submit",
};

export const CART = {
  page: "cart-page",
  item: (id) => `cart-item-${id}`,
  qtyInc: (id) => `cart-qty-inc-${id}`,
  qtyDec: (id) => `cart-qty-dec-${id}`,
  remove: (id) => `cart-remove-${id}`,
  checkoutBtn: "cart-checkout-btn",
  empty: "cart-empty",
  subtotal: "cart-subtotal",
};

export const CHECKOUT = {
  fullName: "checkout-full-name",
  phone: "checkout-phone",
  line1: "checkout-line1",
  line2: "checkout-line2",
  city: "checkout-city",
  state: "checkout-state",
  postal: "checkout-postal",
  country: "checkout-country",
  coupon: "checkout-coupon",
  applyCoupon: "checkout-apply-coupon",
  placeOrder: "checkout-place-order",
  successId: "checkout-success-id",
};

export const ACCOUNT = {
  dashboard: "account-dashboard",
  orders: "account-orders",
  addresses: "account-addresses",
  wishlist: "account-wishlist",
  settings: "account-settings",
};

export const ADMIN = {
  loginEmail: "admin-login-email",
  loginPass: "admin-login-pass",
  loginSubmit: "admin-login-submit",
  sidebar: "admin-sidebar",
  productNew: "admin-product-new",
  productSave: "admin-product-save",
  productImageUpload: "admin-product-image-upload",
  couponCreate: "admin-coupon-create",
  settingsSave: "admin-settings-save",
};
