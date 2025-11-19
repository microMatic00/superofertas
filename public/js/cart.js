// Gestión del carrito de compras

import { CURRENCY } from "./config.js";

class Cart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  // Cargar carrito del localStorage
  loadCart() {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  }

  // Guardar carrito en localStorage
  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.items));
    this.updateCartUI();
  }

  // Agregar producto al carrito
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

  // Actualizar cantidad de un producto
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

  // Eliminar producto del carrito
  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
  }

  // Vaciar carrito
  clear() {
    this.items = [];
    this.saveCart();
  }

  // Obtener cantidad total de items
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Obtener total del carrito
  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.precio * item.quantity,
      0
    );
  }

  // Actualizar UI del carrito
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

  // Mostrar notificación
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

  // Obtener items del carrito
  getItems() {
    return this.items;
  }
}

// Exportar instancia única del carrito
export const cart = new Cart();

// Hacer el carrito accesible globalmente para eventos onclick
window.cart = cart;
