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
    this.showNotification(`${product.nombre} agregado al carrito`);
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
  loadCategories();
  loadProducts();
  setupEventListeners();
});

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
            <button class="category-btn active" data-category="all">Todas</button>
            ${normalizedCategories
              .map(
                (cat) => `
                <button class="category-btn" data-category="${cat.id}">
                    ${cat.icono ? cat.icono + " " : ""}${cat.nombre}
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
        e.target.classList.add("active");
        currentCategory = e.target.dataset.category;
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
                            <button class="btn btn-primary" onclick="addToCart('${product.id}')">
                                Agregar
                            </button>
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

// Agregar al carrito
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    cart.addItem(product);
  }
}

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
