// ============================================
// CONFIGURACIÓN
// ============================================
const PB_URL = "http://127.0.0.1:8090";
const CURRENCY = "$";

// ============================================
// PANEL DE ADMINISTRACIÓN
// ============================================
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
    const products = await pb.collection("productos").getFullList();

    // Cargar categorías para mapear IDs a nombres
    const categorias = await pb.collection("categorias").getFullList();
    const categoriasMap = {};
    categorias.forEach((cat) => {
      categoriasMap[cat.id] = cat.Nombre || cat.nombre;
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
                          .map((p) => {
                            const nombre = p.Nombre || p.nombre;
                            const precio = p.Precio || p.precio;
                            const stock = p.Stock || p.stock;
                            const activo =
                              p.Activo !== undefined
                                ? p.Activo
                                : p.activo !== undefined
                                ? p.activo
                                : true;
                            const categoriaId = p.Categoria || p.categoria;
                            const categoriaNombre =
                              categoriasMap[categoriaId] || categoriaId;

                            return `
                            <tr>
                                <td>
                                    ${
                                      p.imagen
                                        ? `
                                        <img src="${PB_URL}/api/files/${p.collectionId}/${p.id}/${p.imagen}" 
                                             class="table-img" alt="${nombre}">
                                    `
                                        : "📦"
                                    }
                                </td>
                                <td>${nombre}</td>
                                <td>${categoriaNombre}</td>
                                <td>${CURRENCY}${precio.toFixed(2)}</td>
                                <td>${stock}</td>
                                <td>
                                    <span class="badge ${
                                      activo ? "badge-success" : "badge-danger"
                                    }">
                                        ${activo ? "Activo" : "Inactivo"}
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
                                    }', '${nombre}')" title="Eliminar">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        `;
                          })
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  } catch (error) {
    content.innerHTML = `<div class="error-message">Error cargando productos: ${error.message}</div>`;
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

  // Normalizar datos del producto
  const nombre = product ? product.Nombre || product.nombre || "" : "";
  const descripcion = product
    ? product.Descripcion || product.descripcion || ""
    : "";
  const precio = product ? product.Precio || product.precio || "" : "";
  const stock = product ? product.Stock || product.stock || 0 : 0;
  const categoriaId = product ? product.Categoria || product.categoria : "";
  const activo = product
    ? product.Activo !== undefined
      ? product.Activo
      : product.activo !== undefined
      ? product.activo
      : true
    : true;

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
                        <input type="text" id="nombre" required value="${nombre}">
                    </div>
                    <div class="form-group">
                        <label>Categoría *</label>
                        <select id="categoria" required>
                            <option value="">Seleccionar...</option>
                            ${categories
                              .map((c) => {
                                const catNombre = c.Nombre || c.nombre;
                                return `
                                <option value="${c.id}" ${
                                  categoriaId === c.id ? "selected" : ""
                                }>
                                    ${catNombre}
                                </option>
                            `;
                              })
                              .join("")}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="descripcion" rows="3">${descripcion}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Precio *</label>
                        <input type="number" id="precio" step="0.01" required value="${precio}">
                    </div>
                    <div class="form-group">
                        <label>Stock *</label>
                        <input type="number" id="stock" required value="${stock}">
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
                          activo ? "checked" : ""
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

  // Usar los nombres de campos con mayúscula que tiene tu BD
  formData.append("Nombre", document.getElementById("nombre").value);
  formData.append("Descripcion", document.getElementById("descripcion").value);
  formData.append("Precio", document.getElementById("precio").value);
  formData.append("Categoria", document.getElementById("categoria").value);
  formData.append("Stock", document.getElementById("stock").value);
  formData.append("Activo", document.getElementById("activo").checked);

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
    showNotification("Error al guardar producto: " + error.message, "error");
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
    const categories = await pb.collection("categorias").getFullList();

    content.innerHTML = `
            <div class="content-header">
                <h1>Categorías</h1>
                <button class="btn btn-primary" onclick="showCategoryForm()">
                    + Nueva Categoría
                </button>
            </div>
            <div class="categories-grid">
                ${categories
                  .map((c) => {
                    const nombre = c.Nombre || c.nombre;
                    const icono = c.Texto || c.icono || "📦";

                    return `
                    <div class="category-card">
                        <div class="category-icon">${icono}</div>
                        <h3>${nombre}</h3>
                        <div class="category-actions">
                            <button class="btn-icon" onclick="editCategory('${c.id}')">✏️</button>
                            <button class="btn-icon" onclick="deleteCategory('${c.id}', '${nombre}')">🗑️</button>
                        </div>
                    </div>
                `;
                  })
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

  const nombre = category ? category.Nombre || category.nombre || "" : "";
  const icono = category ? category.Texto || category.icono || "" : "";

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
                    <input type="text" id="nombre" required value="${nombre}">
                </div>
                <div class="form-group">
                    <label>Icono (emoji)</label>
                    <input type="text" id="icono" placeholder="🍎" value="${icono}">
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
    Nombre: document.getElementById("nombre").value,
    Texto: document.getElementById("icono").value,
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
    const orders = await pb.collection("pedidos").getFullList();

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
                          .map((o) => {
                            const clienteNombre =
                              o.Cliente_nombre || o.cliente_nombre;
                            const clienteTelefono =
                              o.Cliente_telefono || o.cliente_telefono;
                            const total = o.Total || o.total;
                            const estado = o.Estado || o.estado;

                            return `
                            <tr>
                                <td>#${o.id.substring(0, 8)}</td>
                                <td>${clienteNombre}</td>
                                <td>${clienteTelefono}</td>
                                <td>${CURRENCY}${total.toFixed(2)}</td>
                                <td>
                                    <span class="badge badge-${estado}">
                                        ${estado}
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
                        `;
                          })
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

    // Normalizar campos
    const clienteNombre = order.Cliente_nombre || order.cliente_nombre;
    const clienteTelefono = order.Cliente_telefono || order.cliente_telefono;
    const total = order.Total || order.total;
    const items = order.Items || order.items || [];
    const notas = order.Notas || order.notas;

    const content = document.getElementById("content");
    content.innerHTML = `
            <div class="content-header">
                <h1>Pedido #${order.id.substring(0, 8)}</h1>
                <button class="btn btn-secondary" onclick="loadOrders()">← Volver</button>
            </div>
            <div class="order-details">
                <div class="order-info">
                    <h3>Información del Cliente</h3>
                    <p><strong>Nombre:</strong> ${clienteNombre}</p>
                    <p><strong>Teléfono:</strong> ${clienteTelefono}</p>
                    <p><strong>Fecha:</strong> ${new Date(
                      order.created
                    ).toLocaleString()}</p>
                    ${notas ? `<p><strong>Notas:</strong> ${notas}</p>` : ""}
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
                            ${items
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
                                <td><strong>${CURRENCY}${total.toFixed(
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
