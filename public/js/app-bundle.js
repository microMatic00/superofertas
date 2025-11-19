// ============================================
// CONFIGURACIÓN
// ============================================
const PB_URL = "http://127.0.0.1:8090";
const WHATSAPP_NUMBER = "+5492216997476";
const STORE_NAME = "Mi Supermercado";
const CURRENCY = "$";
const CONFIG = {
  showOutOfStock: false,
  enableSearch: true,
  productsPerPage: 12,
  minOrderAmount: 0,
};

// ============================================
// CARRITO DE COMPRAS
// ============================================
class Cart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  loadCart() {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.items));
    this.updateCartUI();
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        quantity: quantity,
        imagen: product.imagen,
      });
    }

    this.saveCart();
    const message =
      quantity > 1
        ? `${quantity}x ${product.nombre} agregados al carrito`
        : `${product.nombre} agregado al carrito`;
    this.showNotification(message);
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.precio * item.quantity,
      0
    );
  }

  getItems() {
    return this.items;
  }

  updateCartUI() {
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const emptyCart = document.getElementById("empty-cart");
    const cartContent = document.getElementById("cart-content");

    if (cartCount) {
      const totalItems = this.getTotalItems();
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? "flex" : "none";
    }

    if (cartItems) {
      if (this.items.length === 0) {
        if (emptyCart) emptyCart.style.display = "block";
        if (cartContent) cartContent.style.display = "none";
      } else {
        if (emptyCart) emptyCart.style.display = "none";
        if (cartContent) cartContent.style.display = "block";

        cartItems.innerHTML = this.items
          .map(
            (item) => `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-info">
                            <h4>${item.nombre}</h4>
                            <p class="cart-item-price">${CURRENCY}${item.precio.toFixed(
              2
            )}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="btn-quantity" onclick="cart.updateQuantity('${
                              item.id
                            }', ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="btn-quantity" onclick="cart.updateQuantity('${
                              item.id
                            }', ${item.quantity + 1})">+</button>
                            <button class="btn-remove" onclick="cart.removeItem('${
                              item.id
                            }')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                            </button>
                        </div>
                        <div class="cart-item-subtotal">
                            ${CURRENCY}${(item.precio * item.quantity).toFixed(
              2
            )}
                        </div>
                    </div>
                `
          )
          .join("");
      }
    }

    if (cartTotal) {
      cartTotal.textContent = `${CURRENCY}${this.getTotal().toFixed(2)}`;
    }
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// ============================================
// WHATSAPP
// ============================================
function sendOrderToWhatsApp(customerName, customerPhone, notes = "") {
  const items = cart.getItems();

  if (items.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  if (!customerName || !customerPhone) {
    alert("Por favor completa tu nombre y teléfono");
    return;
  }

  let message = `🛒 *NUEVO PEDIDO - ${STORE_NAME}*\n\n`;
  message += `👤 *Cliente:* ${customerName}\n`;
  message += `📱 *Teléfono:* ${customerPhone}\n\n`;
  message += `📋 *PRODUCTOS:*\n`;
  message += `${"─".repeat(30)}\n`;

  items.forEach((item, index) => {
    const subtotal = item.precio * item.quantity;
    message += `\n${index + 1}. *${item.nombre}*\n`;
    message += `   Cantidad: ${item.quantity}\n`;
    message += `   Precio: ${CURRENCY}${item.precio.toFixed(2)}\n`;
    message += `   Subtotal: ${CURRENCY}${subtotal.toFixed(2)}\n`;
  });

  message += `\n${"─".repeat(30)}\n`;
  message += `\n💰 *TOTAL: ${CURRENCY}${cart.getTotal().toFixed(2)}*\n`;

  if (notes) {
    message += `\n📝 *Notas:* ${notes}\n`;
  }

  message += `\n✅ Pago en efectivo al recibir`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");
}

// ============================================
// APLICACIÓN PRINCIPAL
// ============================================
const pb = new PocketBase(PB_URL);
const cart = new Cart();

let allProducts = [];
let currentCategory = "all";
let searchTerm = "";

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  loadCategories();
  loadProducts();
  setupEventListeners();
});

// Inicializar carrusel
function initCarousel() {
  let currentSlide = 0;
  const slides = document.querySelectorAll(".carousel-slide");
  const dotsContainer = document.getElementById("carousel-dots");

  if (!slides.length || !dotsContainer) return;

  // Crear dots
  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = `carousel-dot ${index === 0 ? "active" : ""}`;
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".carousel-dot");

  function goToSlide(n) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // Event listeners para botones
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");

  if (prevBtn) prevBtn.addEventListener("click", prevSlide);
  if (nextBtn) nextBtn.addEventListener("click", nextSlide);

  // Auto-advance cada 5 segundos
  setInterval(nextSlide, 5000);
}

// Scroll a productos
function scrollToProducts() {
  const products = document.getElementById("products");
  if (products) {
    products.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Cargar categorías
async function loadCategories() {
  try {
    const categories = await pb.collection("categorias").getFullList();
    const categoriesContainer = document.getElementById("categories");

    const normalizedCategories = categories.map((cat) => ({
      id: cat.id,
      nombre: cat.Nombre || cat.nombre,
      icono: cat.Texto || cat.icono,
    }));

    console.log("Categorías cargadas:", normalizedCategories);

    categoriesContainer.innerHTML = `
            <button class="category-btn active" data-category="all">
                <span class="category-icon">📦</span>
                <span>Todas</span>
            </button>
            ${normalizedCategories
              .map(
                (cat) => `
                <button class="category-btn" data-category="${cat.id}">
                    <span class="category-icon">${cat.icono || "📦"}</span>
                    <span>${cat.nombre}</span>
                </button>
            `
              )
              .join("")}
        `;

    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".category-btn")
          .forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        currentCategory = e.currentTarget.dataset.category;
        filterProducts();
      });
    });
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

// Cargar productos
async function loadProducts() {
  try {
    const products = await pb.collection("productos").getFullList();
    const categorias = await pb.collection("categorias").getFullList();

    const categoriasMap = {};
    categorias.forEach((cat) => {
      categoriasMap[cat.id] = cat.Nombre || cat.nombre;
    });

    allProducts = products.map((p) => {
      const categoriaId = p.Categoria || p.categoria;
      const categoriaNombre = categoriasMap[categoriaId] || categoriaId;

      return {
        id: p.id,
        nombre: p.Nombre || p.nombre,
        descripcion: p.Descripcion || p.descripcion,
        precio: p.Precio || p.precio,
        categoria: categoriaId,
        categoriaNombre: categoriaNombre,
        imagen: p.imagen,
        stock: p.Stock || p.stock,
        activo:
          p.Activo !== undefined
            ? p.Activo
            : p.activo !== undefined
            ? p.activo
            : true,
        collectionId: p.collectionId,
        collectionName: p.collectionName,
      };
    });

    console.log("Productos cargados:", allProducts);
    filterProducts();
  } catch (error) {
    console.error("Error cargando productos:", error);
    showError(
      "No se pudieron cargar los productos. Verifica que PocketBase esté ejecutándose."
    );
  }
}

// Filtrar productos
function filterProducts() {
  let filtered = allProducts;

  if (currentCategory !== "all") {
    filtered = filtered.filter((p) => p.categoria === currentCategory);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (!CONFIG.showOutOfStock) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  filtered = filtered.filter((p) => p.activo === true);

  console.log("Productos filtrados:", filtered.length);

  // Actualizar contador
  const productsCount = document.getElementById("products-count");
  if (productsCount) {
    productsCount.textContent = `${filtered.length} producto${
      filtered.length !== 1 ? "s" : ""
    }`;
  }

  renderProducts(filtered);
}

// Renderizar productos
function renderProducts(products) {
  const container = document.getElementById("products");

  if (!container) {
    console.error("No se encontró el contenedor #products");
    return;
  }

  if (products.length === 0) {
    container.innerHTML =
      '<div class="no-products"><p>No se encontraron productos</p></div>';
    return;
  }

  container.innerHTML = products
    .map((product) => {
      const imageUrl = product.imagen
        ? `${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.imagen}`
        : "https://via.placeholder.com/300x200?text=Sin+Imagen";

      const outOfStock = product.stock <= 0;

      return `
            <div class="product-card ${outOfStock ? "out-of-stock" : ""}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.nombre}" 
                         onerror="this.src='https://via.placeholder.com/300x200?text=Error'">
                    ${
                      outOfStock
                        ? '<div class="out-of-stock-badge">Agotado</div>'
                        : ""
                    }
                </div>
                <div class="product-info">
                    <span class="product-category">${
                      product.categoriaNombre || product.categoria
                    }</span>
                    <h3 class="product-name">${product.nombre}</h3>
                    ${
                      product.descripcion
                        ? `<p class="product-description">${product.descripcion}</p>`
                        : ""
                    }
                    <div class="product-footer">
                        <span class="product-price">${CURRENCY}${product.precio.toFixed(
        2
      )}</span>
                        ${
                          !outOfStock
                            ? `
                            <div class="product-actions" id="actions-${product.id}">
                                <button class="btn btn-primary btn-add" onclick="showQuantitySelector('${product.id}')">
                                    Agregar
                                </button>
                                <div class="quantity-selector" style="display: none;">
                                    <button class="btn-qty" onclick="decreaseQuantity('${product.id}')">-</button>
                                    <input type="number" 
                                           id="qty-${product.id}" 
                                           value="1" 
                                           min="1" 
                                           max="${product.stock}"
                                           class="qty-input"
                                           onchange="validateQuantity('${product.id}', ${product.stock})">
                                    <button class="btn-qty" onclick="increaseQuantity('${product.id}', ${product.stock})">+</button>
                                </div>
                                <button class="btn btn-primary btn-confirm" style="display: none;" onclick="confirmAddToCart('${product.id}')">
                                    ✓ Añadir
                                </button>
                            </div>
                        `
                            : ""
                        }
                    </div>
                    ${
                      product.stock > 0 && product.stock <= 5
                        ? `
                        <span class="stock-warning">Solo quedan ${product.stock}</span>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
    })
    .join("");
}

// Mostrar selector de cantidad
function showQuantitySelector(productId) {
  const actionsContainer = document.getElementById(`actions-${productId}`);
  const btnAdd = actionsContainer.querySelector(".btn-add");
  const quantitySelector = actionsContainer.querySelector(".quantity-selector");
  const btnConfirm = actionsContainer.querySelector(".btn-confirm");

  btnAdd.style.display = "none";
  quantitySelector.style.display = "flex";
  btnConfirm.style.display = "block";

  // Focus en el input
  const input = document.getElementById(`qty-${productId}`);
  input.select();
}

// Aumentar cantidad
function increaseQuantity(productId, maxStock) {
  const input = document.getElementById(`qty-${productId}`);
  let value = parseInt(input.value) || 1;
  if (value < maxStock) {
    input.value = value + 1;
  }
}

// Disminuir cantidad
function decreaseQuantity(productId) {
  const input = document.getElementById(`qty-${productId}`);
  let value = parseInt(input.value) || 1;
  if (value > 1) {
    input.value = value - 1;
  }
}

// Validar cantidad
function validateQuantity(productId, maxStock) {
  const input = document.getElementById(`qty-${productId}`);
  let value = parseInt(input.value) || 1;

  if (value < 1) {
    input.value = 1;
  } else if (value > maxStock) {
    input.value = maxStock;
    cart.showNotification(`Solo hay ${maxStock} unidades disponibles`);
  }
}

// Confirmar agregar al carrito
function confirmAddToCart(productId) {
  const input = document.getElementById(`qty-${productId}`);
  const quantity = parseInt(input.value) || 1;
  const product = allProducts.find((p) => p.id === productId);

  if (product) {
    cart.addItem(product, quantity);

    // Resetear la interfaz
    const actionsContainer = document.getElementById(`actions-${productId}`);
    const btnAdd = actionsContainer.querySelector(".btn-add");
    const quantitySelector =
      actionsContainer.querySelector(".quantity-selector");
    const btnConfirm = actionsContainer.querySelector(".btn-confirm");

    btnAdd.style.display = "block";
    quantitySelector.style.display = "none";
    btnConfirm.style.display = "none";
    input.value = 1;
  }
}

// Agregar al carrito (mantener compatibilidad)
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    cart.addItem(product);
  }
}

// Hacer funciones accesibles globalmente
window.showQuantitySelector = showQuantitySelector;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.validateQuantity = validateQuantity;
window.confirmAddToCart = confirmAddToCart;
window.addToCart = addToCart;
window.scrollToProducts = scrollToProducts;
window.cart = cart;
window.pb = pb;

// Configurar event listeners
function setupEventListeners() {
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      filterProducts();
    });
  }

  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const cartOverlay = document.getElementById("cart-overlay");

  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("active");
      cartOverlay.classList.add("active");
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
      cartOverlay.classList.remove("active");
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
      cartOverlay.classList.remove("active");
    });
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", showCheckoutModal);
  }

  const closeModal = document.getElementById("close-modal");
  const checkoutModal = document.getElementById("checkout-modal");

  if (closeModal && checkoutModal) {
    closeModal.addEventListener("click", () => {
      checkoutModal.classList.remove("active");
    });
  }

  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckout);
  }
}

// Mostrar modal de checkout
function showCheckoutModal() {
  if (cart.getItems().length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const modal = document.getElementById("checkout-modal");
  modal.classList.add("active");
}

// Procesar checkout
async function handleCheckout(e) {
  e.preventDefault();

  const customerName = document.getElementById("customer-name").value;
  const customerPhone = document.getElementById("customer-phone").value;
  const notes = document.getElementById("order-notes").value;

  try {
    await pb.collection("pedidos").create({
      Cliente_nombre: customerName,
      Cliente_telefono: customerPhone,
      Items: cart.getItems(),
      Total: cart.getTotal(),
      Estado: "pendiente",
      Notas: notes,
    });

    sendOrderToWhatsApp(customerName, customerPhone, notes);

    document.getElementById("checkout-modal").classList.remove("active");
    document.getElementById("cart-sidebar").classList.remove("active");
    document.getElementById("cart-overlay").classList.remove("active");

    e.target.reset();

    showSuccess("¡Pedido enviado! Te estamos redirigiendo a WhatsApp.");
  } catch (error) {
    console.error("Error guardando pedido:", error);
    sendOrderToWhatsApp(customerName, customerPhone, notes);
  }
}

// Mostrar error
function showError(message) {
  const container = document.getElementById("products");
  container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}

// Mostrar éxito
function showSuccess(message) {
  const notification = document.createElement("div");
  notification.className = "notification success";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
