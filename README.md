# 🛒 Sistema de Tienda Web con PocketBase

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PocketBase](https://img.shields.io/badge/PocketBase-0.19+-orange.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)

Sistema completo de e-commerce para tiendas de supermercado con carrito de compras y notificaciones por WhatsApp. Ideal para pequeños negocios que quieren vender en línea de forma rápida y sencilla.

## ✨ Características

- ✅ **Catálogo de productos** con categorías y búsqueda
- 🛒 **Carrito de compras** con persistencia local
- 💰 **Cálculo automático** de totales y subtotales
- 📱 **Integración WhatsApp** para recibir pedidos
- 🔐 **Panel de administración** completo
- 💾 **Base de datos PocketBase** (SQLite)
- 📦 **Sin dependencias** - Frontend puro HTML/CSS/JavaScript
- 📱 **Responsive** - Funciona en móviles y desktop
- 🚀 **Fácil de personalizar** para diferentes negocios

## 📸 Screenshots

```
[Aquí puedes agregar capturas de pantalla de tu aplicación]
```

## 🎯 Demo

Puedes ver una demo en vivo aquí: [Agregar URL de demo]

## 📋 Requisitos

- [PocketBase](https://pocketbase.io/) v0.19.0 o superior
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- WhatsApp instalado en el dispositivo (para recibir pedidos)

## 🛠️ Instalación

### 1. Descargar PocketBase

Descarga PocketBase según tu sistema operativo:

- Windows: https://pocketbase.io/docs/
- Extrae el archivo en la carpeta `backend/`

### 2. Iniciar PocketBase

```bash
cd backend
./pocketbase serve
```

PocketBase estará disponible en: http://127.0.0.1:8090

### 3. Configuración Inicial

1. Abre http://127.0.0.1:8090/_/ en tu navegador
2. Crea tu cuenta de administrador
3. Las colecciones se crearán automáticamente al importar el schema

### 4. Importar Schema

En el panel de PocketBase:

1. Ve a Settings → Import collections
2. Carga el archivo `backend/pb_schema.json`

### 5. Abrir la Aplicación

Abre `public/index.html` en tu navegador o usa un servidor local:

```bash
# Opción 1: Con Python
python -m http.server 8000

# Opción 2: Con PHP
php -S localhost:8000

# Opción 3: Abrir directamente
# public/index.html
```

## 📱 Configuración de WhatsApp

1. Abre `public/js/config.js`
2. Modifica el número de WhatsApp del negocio:

```javascript
export const WHATSAPP_NUMBER = "573001234567"; // Incluye código de país
```

## 🎯 Uso

### Para Clientes

1. Navega por el catálogo de productos
2. Agrega productos al carrito
3. Revisa tu pedido y el total
4. Haz clic en "Enviar Pedido por WhatsApp"
5. Confirma el envío en WhatsApp

### Para Administradores

1. Accede a `public/admin.html`
2. Usa las credenciales de PocketBase
3. Gestiona productos:
   - Agregar nuevos productos
   - Editar precios
   - Actualizar inventario
   - Eliminar productos

## 📁 Estructura del Proyecto

```
tiendaWeb/
├── backend/
│   ├── pocketbase.exe        # Ejecutable de PocketBase
│   ├── pb_schema.json         # Schema de la base de datos
│   └── pb_data/               # Datos de PocketBase (auto-generado)
├── public/
│   ├── index.html             # Tienda (cliente)
│   ├── admin.html             # Panel de administración
│   ├── css/
│   │   ├── styles.css         # Estilos principales
│   │   └── admin.css          # Estilos del admin
│   ├── js/
│   │   ├── config.js          # Configuración
│   │   ├── app.js             # Lógica de la tienda
│   │   ├── cart.js            # Gestión del carrito
│   │   ├── admin.js           # Lógica del admin
│   │   └── whatsapp.js        # Integración WhatsApp
│   └── images/                # Imágenes de productos
└── README.md
```

## 🔧 Personalización

### Cambiar Colores

Edita `public/css/styles.css` y modifica las variables CSS:

```css
:root {
  --primary-color: #4caf50;
  --secondary-color: #2196f3;
  /* ... más colores */
}
```

### Agregar Campos a Productos

1. Modifica el schema en PocketBase
2. Actualiza los formularios en `admin.html`
3. Actualiza la visualización en `index.html`

## 🐛 Solución de Problemas

### PocketBase no inicia

- Verifica que el puerto 8090 esté disponible
- Ejecuta como administrador si es necesario

### Productos no se cargan

- Verifica que PocketBase esté corriendo
- Revisa la consola del navegador (F12)
- Verifica la URL de la API en `config.js`

### WhatsApp no abre

- Verifica que el número incluya el código de país
- Asegúrate de tener WhatsApp instalado

## 📄 Licencia

MIT License - Libre para uso comercial

## 🤝 Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio.

---

**¡Éxito con tu tienda! 🚀**
