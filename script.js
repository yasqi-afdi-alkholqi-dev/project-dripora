const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const cartToggle = document.querySelector(".cart-toggle");
const cartCount = document.querySelector("#cart-count");
const toast = document.querySelector("#toast");
let toastTimer;
let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("dripora-cart") || "[]");
  if (!Array.isArray(cart)) cart = [];
} catch {
  cart = [];
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function closeMenu() {
  if (!menuToggle || !nav) return;
  nav.classList.remove("open");
  menuToggle.textContent = "☰";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Buka menu");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.textContent = isOpen ? "✕" : "☰";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
});

nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenu();
});

function updateCart() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = total;
  try { localStorage.setItem("dripora-cart", JSON.stringify(cart)); } catch { /* storage may be unavailable */ }
}

function addToCart(card) {
  const { id, name } = card.dataset;
  const price = Number(card.dataset.price);
  if (!id || !name || !Number.isFinite(price)) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, name, price, quantity: 1 });
  updateCart();
  showToast(`${name} berhasil ditambahkan ke keranjang.`);
}

document.querySelectorAll(".product-card").forEach(card => {
  card.querySelector(".quick-add")?.addEventListener("click", () => addToCart(card));
});

cartToggle?.addEventListener("click", () => {
  if (!cart.length) {
    showToast("Keranjang Anda masih kosong. Jelajahi koleksi kami.");
    return;
  }
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  showToast(`${totalItems} item di keranjang · Subtotal $${subtotal.toFixed(2)}`);
});

const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");
filters.forEach(button => button.addEventListener("click", () => {
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle("active", active);
    filter.setAttribute("aria-pressed", String(active));
  });
  products.forEach(product => {
    product.hidden = button.dataset.filter !== "all" && product.dataset.category !== button.dataset.filter;
  });
}));

const newsletterForm = document.querySelector("#newsletter-form");
const emailInput = document.querySelector("#email");
const formMessage = document.querySelector("#form-message");
newsletterForm?.addEventListener("submit", event => {
  event.preventDefault();
  const email = emailInput?.value.trim();
  if (!email) {
    showToast("Masukkan alamat email Anda terlebih dahulu.");
    return;
  }
  if (formMessage) formMessage.textContent = "Terima kasih! Formulir ini masih berupa demo.";
  newsletterForm.reset();
});

document.querySelectorAll('.footer a[href="#"]').forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Product search filters the visible collection and reports when there are no matches.
const searchToggle = document.querySelector(".search-toggle");
searchToggle?.addEventListener("click", () => {
  const query = window.prompt("Cari produk dalam koleksi:");
  if (query === null) return;
  const term = query.trim().toLocaleLowerCase();
  if (!term) return;
  let matches = 0;
  products.forEach(product => {
    const found = `${product.dataset.name} ${product.textContent}`.toLocaleLowerCase().includes(term);
    product.hidden = !found;
    if (found) matches += 1;
  });
  filters.forEach(filter => {
    const active = filter.dataset.filter === "all";
    filter.classList.toggle("active", active);
    filter.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#collections")?.scrollIntoView({ behavior: "smooth" });
  showToast(matches ? `${matches} produk ditemukan.` : "Produk tidak ditemukan. Coba kata kunci lain.");
});

updateCart();

// Fill the ticker with matching repeated sets so the loop never exposes an empty gap.
const tickerTrack = document.querySelector(".ticker-track");
let tickerResizeTimer;
function buildTickerLoop() {
  if (!tickerTrack) return;
  const source = tickerTrack.querySelector(".ticker-group");
  if (!source) return;

  // Measure the live source before building detached copies; detached elements report zero width.
  const sourceWidth = source.getBoundingClientRect().width;
  if (!Number.isFinite(sourceWidth) || sourceWidth <= 0) return;

  const copyCount = Math.max(1, Math.ceil((window.innerWidth + 100) / sourceWidth));
  const firstSet = document.createElement("div");
  firstSet.className = "ticker-set";
  for (let index = 0; index < copyCount; index += 1) {
    firstSet.append(source.cloneNode(true));
  }

  const secondSet = firstSet.cloneNode(true);
  secondSet.setAttribute("aria-hidden", "true");
  tickerTrack.replaceChildren(firstSet, secondSet);
}
buildTickerLoop();
window.addEventListener("resize", () => {
  clearTimeout(tickerResizeTimer);
  tickerResizeTimer = setTimeout(buildTickerLoop, 150);
});



