// Panel de administración

import { PB_URL, CURRENCY } from "./config.js";

const pb = new PocketBase(PB_URL);

let currentView = "products";
let editingProduct = null;

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupEventListeners();
  loadProducts();
  loadCategories();
});

// Verificar autenticación
async function checkAuth() {
  if (!pb.authStore.isValid) {
    showLoginForm();
  } else {
    showAdminPanel();
  }
}

// Mostrar formulario de login
function showLoginForm() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <h2>Panel de Administración</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        Iniciar Sesión
                    </button>
                </form>
                <div id="login-error" class="error-message" style="display: none;"></div>
            </div>
        </div>
    `;

  document.getElementById("login-form").addEventListener("submit", handleLogin);
}

// Manejar login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("login-error");

  try {
    await pb.collection("users").authWithPassword(email, password);
    showAdminPanel();
  } catch (error) {
    errorDiv.textContent = "Credenciales incorrectas";
    errorDiv.style.display = "block";
  }
}

// Mostrar panel de admin
function showAdminPanel() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div class="admin-container">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2>🛒 Admin Panel</h2>
                </div>
                <nav class="sidebar-nav">
                    <a href="#" data-view="products" class="nav-item active">
                        📦 Productos
                    </a>
                    <a href="#" data-view="categories" class="nav-item">
                        📁 Categorías
                    </a>
                    <a href="#" data-view="orders" class="nav-item">
                        🛍️ Pedidos
                    </a>
                </nav>
                <button class="btn btn-secondary" onclick="logout()">
                    Cerrar Sesión
                </button>
            </aside>
            <main class="main-content">
                <div id="content"></div>
            </main>
        </div>
    `;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".nav-item")
        .forEach((i) => i.classList.remove("active"));
      e.target.classList.add("active");
      currentView = e.target.dataset.view;
      loadView(currentView);
    });
  });

  loadView("products");
}

// Cargar vista
function loadView(view) {
  switch (view) {
    case "products":
      loadProducts();
      break;
    case "categories":
      loadCategories();
      break;
    case "orders":
      loadOrders();
      break;
  }
}

// Cargar productos
async function loadProducts() {
  const content = document.getElementById("content");
  content.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const products = await pb.collection("productos").getFullList({
      sort: "-created",
    });

    content.innerHTML = `
            <div class="content-header">
                <h1>Productos</h1>
                <button class="btn btn-primary" onclick="showProductForm()">
                    + Nuevo Producto
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products
                          .map(
                            (p) => `
                            <tr>
                                <td>
                                    ${
                                      p.imagen
                                        ? `
                                        <img src="${PB_URL}/api/files/${p.collectionId}/${p.id}/${p.imagen}" 
                                             class="table-img" alt="${p.nombre}">
                                    `
                                        : "📦"
                                    }
                                </td>
                                <td>${p.nombre}</td>
                                <td>${p.categoria}</td>
                                <td>${CURRENCY}${p.precio.toFixed(2)}</td>
                                <td>${p.stock}</td>
                                <td>
                                    <span class="badge ${
                                      p.activo
                                        ? "badge-success"
                                        : "badge-danger"
                                    }">
                                        ${p.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-icon" onclick="editProduct('${
                                      p.id
                                    }')" title="Editar">
                                        ✏️
                                    </button>
                                    <button class="btn-icon" onclick="deleteProduct('${
                                      p.id
                                    }', '${p.nombre}')" title="Eliminar">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  } catch (error) {
    content.innerHTML = `<div class="error-message">Error cargando productos</div>`;
    console.error(error);
  }
}

// Mostrar formulario de producto
window.showProductForm = async function (productId = null) {
  let product = null;
  let categories = [];

  try {
    categories = await pb.collection("categorias").getFullList();
    if (productId) {
      product = await pb.collection("productos").getOne(productId);
    }
  } catch (error) {
    console.error(error);
  }

  const content = document.getElementById("content");
  content.innerHTML = `
        <div class="content-header">
            <h1>${product ? "Editar" : "Nuevo"} Producto</h1>
            <button class="btn btn-secondary" onclick="loadProducts()">
                ← Volver
            </button>
        </div>
        <div class="form-container">
            <form id="product-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" id="nombre" required value="${
                          product?.nombre || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label>Categoría *</label>
                        <select id="categoria" required>
                            <option value="">Seleccionar...</option>
                            ${categories
                              .map(
                                (c) => `
                                <option value="${c.nombre}" ${
                                  product?.categoria === c.nombre
                                    ? "selected"
                                    : ""
                                }>
                                    ${c.nombre}
                                </option>
                            `
                              )
                              .join("")}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="descripcion" rows="3">${
                      product?.descripcion || ""
                    }</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Precio *</label>
                        <input type="number" id="precio" step="0.01" required value="${
                          product?.precio || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label>Stock *</label>
                        <input type="number" id="stock" required value="${
                          product?.stock || "0"
                        }">
                    </div>
                </div>
                <div class="form-group">
                    <label>Imagen</label>
                    <input type="file" id="imagen" accept="image/*">
                    ${
                      product?.imagen
                        ? `
                        <img src="${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.imagen}" 
                             class="preview-img" alt="Preview">
                    `
                        : ""
                    }
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="activo" ${
                          product?.activo !== false ? "checked" : ""
                        }>
                        Producto activo
                    </label>
                </div>
                <button type="submit" class="btn btn-primary">
                    ${product ? "Actualizar" : "Crear"} Producto
                </button>
            </form>
        </div>
    `;

  document.getElementById("product-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveProduct(productId);
  });
};

// Guardar producto
async function saveProduct(productId) {
  const formData = new FormData();
  formData.append("nombre", document.getElementById("nombre").value);
  formData.append("descripcion", document.getElementById("descripcion").value);
  formData.append("precio", document.getElementById("precio").value);
  formData.append("categoria", document.getElementById("categoria").value);
  formData.append("stock", document.getElementById("stock").value);
  formData.append("activo", document.getElementById("activo").checked);

  const imageFile = document.getElementById("imagen").files[0];
  if (imageFile) {
    formData.append("imagen", imageFile);
  }

  try {
    if (productId) {
      await pb.collection("productos").update(productId, formData);
    } else {
      await pb.collection("productos").create(formData);
    }
    showNotification("Producto guardado exitosamente", "success");
    loadProducts();
  } catch (error) {
    showNotification("Error al guardar producto", "error");
    console.error(error);
  }
}

// Editar producto
window.editProduct = function (productId) {
  showProductForm(productId);
};

// Eliminar producto
window.deleteProduct = async function (productId, productName) {
  if (confirm(`¿Eliminar el producto "${productName}"?`)) {
    try {
      await pb.collection("productos").delete(productId);
      showNotification("Producto eliminado", "success");
      loadProducts();
    } catch (error) {
      showNotification("Error al eliminar producto", "error");
      console.error(error);
    }
  }
};

// Cargar categorías
async function loadCategories() {
  const content = document.getElementById("content");
  content.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const categories = await pb.collection("categorias").getFullList({
      sort: "nombre",
    });

    content.innerHTML = `
            <div class="content-header">
                <h1>Categorías</h1>
                <button class="btn btn-primary" onclick="showCategoryForm()">
                    + Nueva Categoría
                </button>
            </div>
            <div class="categories-grid">
                ${categories
                  .map(
                    (c) => `
                    <div class="category-card">
                        <div class="category-icon">${c.icono || "📦"}</div>
                        <h3>${c.nombre}</h3>
                        <div class="category-actions">
                            <button class="btn-icon" onclick="editCategory('${
                              c.id
                            }')">✏️</button>
                            <button class="btn-icon" onclick="deleteCategory('${
                              c.id
                            }', '${c.nombre}')">🗑️</button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  } catch (error) {
    content.innerHTML = `<div class="error-message">Error cargando categorías</div>`;
    console.error(error);
  }
}

// Mostrar formulario de categoría
window.showCategoryForm = async function (categoryId = null) {
  let category = null;

  if (categoryId) {
    try {
      category = await pb.collection("categorias").getOne(categoryId);
    } catch (error) {
      console.error(error);
    }
  }

  const content = document.getElementById("content");
  content.innerHTML = `
        <div class="content-header">
            <h1>${category ? "Editar" : "Nueva"} Categoría</h1>
            <button class="btn btn-secondary" onclick="loadCategories()">← Volver</button>
        </div>
        <div class="form-container">
            <form id="category-form">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="nombre" required value="${
                      category?.nombre || ""
                    }">
                </div>
                <div class="form-group">
                    <label>Icono (emoji)</label>
                    <input type="text" id="icono" placeholder="🍎" value="${
                      category?.icono || ""
                    }">
                </div>
                <button type="submit" class="btn btn-primary">
                    ${category ? "Actualizar" : "Crear"} Categoría
                </button>
            </form>
        </div>
    `;

  document.getElementById("category-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveCategory(categoryId);
  });
};

// Guardar categoría
async function saveCategory(categoryId) {
  const data = {
    nombre: document.getElementById("nombre").value,
    icono: document.getElementById("icono").value,
  };

  try {
    if (categoryId) {
      await pb.collection("categorias").update(categoryId, data);
    } else {
      await pb.collection("categorias").create(data);
    }
    showNotification("Categoría guardada", "success");
    loadCategories();
  } catch (error) {
    showNotification("Error al guardar categoría", "error");
    console.error(error);
  }
}

// Editar categoría
window.editCategory = function (categoryId) {
  showCategoryForm(categoryId);
};

// Eliminar categoría
window.deleteCategory = async function (categoryId, categoryName) {
  if (confirm(`¿Eliminar la categoría "${categoryName}"?`)) {
    try {
      await pb.collection("categorias").delete(categoryId);
      showNotification("Categoría eliminada", "success");
      loadCategories();
    } catch (error) {
      showNotification("Error al eliminar categoría", "error");
      console.error(error);
    }
  }
};

// Cargar pedidos
async function loadOrders() {
  const content = document.getElementById("content");
  content.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const orders = await pb.collection("pedidos").getFullList({
      sort: "-created",
    });

    content.innerHTML = `
            <div class="content-header">
                <h1>Pedidos</h1>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Teléfono</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders
                          .map(
                            (o) => `
                            <tr>
                                <td>#${o.id.substring(0, 8)}</td>
                                <td>${o.cliente_nombre}</td>
                                <td>${o.cliente_telefono}</td>
                                <td>${CURRENCY}${o.total.toFixed(2)}</td>
                                <td>
                                    <span class="badge badge-${o.estado}">
                                        ${o.estado}
                                    </span>
                                </td>
                                <td>${new Date(
                                  o.created
                                ).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn-icon" onclick="viewOrder('${
                                      o.id
                                    }')" title="Ver">
                                        👁️
                                    </button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  } catch (error) {
    content.innerHTML = `<div class="error-message">Error cargando pedidos</div>`;
    console.error(error);
  }
}

// Ver pedido
window.viewOrder = async function (orderId) {
  try {
    const order = await pb.collection("pedidos").getOne(orderId);

    const content = document.getElementById("content");
    content.innerHTML = `
            <div class="content-header">
                <h1>Pedido #${order.id.substring(0, 8)}</h1>
                <button class="btn btn-secondary" onclick="loadOrders()">← Volver</button>
            </div>
            <div class="order-details">
                <div class="order-info">
                    <h3>Información del Cliente</h3>
                    <p><strong>Nombre:</strong> ${order.cliente_nombre}</p>
                    <p><strong>Teléfono:</strong> ${order.cliente_telefono}</p>
                    <p><strong>Fecha:</strong> ${new Date(
                      order.created
                    ).toLocaleString()}</p>
                    ${
                      order.notas
                        ? `<p><strong>Notas:</strong> ${order.notas}</p>`
                        : ""
                    }
                </div>
                <div class="order-items">
                    <h3>Productos</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.nombre}</td>
                                    <td>${item.quantity}</td>
                                    <td>${CURRENCY}${item.precio.toFixed(
                                  2
                                )}</td>
                                    <td>${CURRENCY}${(
                                  item.precio * item.quantity
                                ).toFixed(2)}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3"><strong>Total:</strong></td>
                                <td><strong>${CURRENCY}${order.total.toFixed(
      2
    )}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
  } catch (error) {
    showNotification("Error cargando pedido", "error");
    console.error(error);
  }
};

// Cerrar sesión
window.logout = function () {
  pb.authStore.clear();
  showLoginForm();
};

// Mostrar notificación
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Hacer funciones accesibles globalmente
window.pb = pb;

function setupEventListeners() {
  // Se configurarán cuando se cargue el panel
}
