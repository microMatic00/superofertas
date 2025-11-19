// Integración con WhatsApp

import { WHATSAPP_NUMBER, STORE_NAME, CURRENCY } from "./config.js";
import { cart } from "./cart.js";

export function sendOrderToWhatsApp(customerName, customerPhone, notes = "") {
  const items = cart.getItems();

  if (items.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  if (!customerName || !customerPhone) {
    alert("Por favor completa tu nombre y teléfono");
    return;
  }

  // Construir mensaje para WhatsApp
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

  // Codificar mensaje para URL
  const encodedMessage = encodeURIComponent(message);

  // Construir URL de WhatsApp
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  // Abrir WhatsApp
  window.open(whatsappURL, "_blank");

  // Opcional: Limpiar carrito después de enviar
  // cart.clear();
}

export function validateWhatsAppNumber(number) {
  // Remover espacios y caracteres especiales
  const cleaned = number.replace(/\D/g, "");

  // Verificar que tenga al menos 10 dígitos
  return cleaned.length >= 10;
}
