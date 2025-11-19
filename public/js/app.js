// Aplicación principal de la tienda

import { PB_URL, CONFIG, CURRENCY } from "./config.js";
import { cart } from "./cart.js";
import { sendOrderToWhatsApp } from "./whatsapp.js";

// Inicializar PocketBase
const pb = new PocketBase(PB_URL);

// Estado de la aplicación
let allProducts = [];
let currentCategory = "all";
let searchTerm = "";

// Inicializar app
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts();
  setupEventListeners();
});

// Cargar categorías
async function loadCategories() {
  try {
    const categories = await pb.collection("categorias").getFullList({
      sort: "-created",
    });

    const categoriesContainer = document.getElementById("categories");

    // Normalizar nombres de campos
    const normalizedCategories = categories.map((cat) => ({
      id: cat.id,
      nombre: cat.Nombre || cat.nombre,
      icono: cat.Texto || cat.icono,
    }));

    console.log("Categorías cargadas:", normalizedCategories);

    categoriesContainer.innerHTML = `
            <button class="category-btn active" data-category="all">
                Todas
            </button>
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

    // Event listeners para categorías
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
    const products = await pb.collection("productos").getFullList({
      sort: "-created",
      expand: "Categoria,categoria",
    });

    // Cargar categorías para mapear IDs a nombres
    const categorias = await pb.collection("categorias").getFullList();
    const categoriasMap = {};
    categorias.forEach((cat) => {
      categoriasMap[cat.id] = cat.Nombre || cat.nombre;
    });

    // Normalizar nombres de campos (mayúsculas a minúsculas)
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

  // Filtrar por categoría
  if (currentCategory !== "all") {
    filtered = filtered.filter((p) => p.categoria === currentCategory);
  }

  // Filtrar por búsqueda
  if (searchTerm) {
    filtered = filtered.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filtrar productos sin stock
  if (!CONFIG.showOutOfStock) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  // Filtrar productos activos
  filtered = filtered.filter((p) => p.activo === true);

  console.log("Productos filtrados:", filtered.length);
  renderProducts(filtered);
}

// Renderizar productos
function renderProducts(products) {
  const container = document.getElementById("products");

  console.log("🎨 Renderizando productos:", products);
  console.log("📦 Container encontrado:", container ? "✅" : "❌");

  if (!container) {
    console.error("❌ No se encontró el contenedor #products");
    return;
  }

  if (products.length === 0) {
    console.log("⚠️ No hay productos para mostrar");
    container.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos</p>
            </div>
        `;
    return;
  }

  console.log(`✅ Renderizando ${products.length} productos`);
  container.innerHTML = products
    .map((product) => {
      const imageUrl = product.imagen
        ? `${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.imagen}`
        : "https://via.placeholder.com/300x200?text=Sin+Imagen";

      const outOfStock = product.stock <= 0;

      return `
            <div class="product-card ${outOfStock ? "out-of-stock" : ""}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.nombre}">
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
window.addToCart = async function (productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    cart.addItem(product);
  }
};

// Configurar event listeners
function setupEventListeners() {
  // Búsqueda
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      filterProducts();
    });
  }

  // Abrir/cerrar carrito
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

  // Checkout
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", showCheckoutModal);
  }

  // Modal de checkout
  const checkoutModal = document.getElementById("checkout-modal");
  const closeModal = document.getElementById("close-modal");
  const checkoutForm = document.getElementById("checkout-form");

  if (closeModal && checkoutModal) {
    closeModal.addEventListener("click", () => {
      checkoutModal.classList.remove("active");
    });
  }

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

  // Guardar pedido en la base de datos
  try {
    await pb.collection("pedidos").create({
      cliente_nombre: customerName,
      cliente_telefono: customerPhone,
      items: cart.getItems(),
      total: cart.getTotal(),
      estado: "pendiente",
      notas: notes,
    });

    // Enviar por WhatsApp
    sendOrderToWhatsApp(customerName, customerPhone, notes);

    // Cerrar modal
    document.getElementById("checkout-modal").classList.remove("active");
    document.getElementById("cart-sidebar").classList.remove("active");
    document.getElementById("cart-overlay").classList.remove("active");

    // Limpiar formulario
    e.target.reset();

    // Opcional: limpiar carrito
    // cart.clear();

    showSuccess("¡Pedido enviado! Te estamos redirigiendo a WhatsApp.");
  } catch (error) {
    console.error("Error guardando pedido:", error);
    // Aún así enviar por WhatsApp
    sendOrderToWhatsApp(customerName, customerPhone, notes);
  }
}

// Mostrar error
function showError(message) {
  const container = document.getElementById("products");
  container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
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

// Hacer PocketBase accesible globalmente
window.pb = pb;
