# 📋 Guía para Crear las Colecciones en PocketBase

Si no puedes importar el schema, sigue estos pasos para crear las colecciones manualmente.

## 🚀 Paso 1: Iniciar PocketBase

1. Abre una terminal en la carpeta `backend/`
2. Ejecuta: `./pocketbase serve`
3. Abre en tu navegador: http://127.0.0.1:8090/_/
4. Si es la primera vez, crea tu cuenta de administrador

---

## 📦 Paso 2: Crear Colección "productos"

1. Click en **"New collection"** (+ Nueva colección)
2. **Collection type**: Base collection
3. **Name**: `productos`
4. Click en **"New field"** para agregar cada campo:

### Campos de la colección productos:

**Campo 1: nombre**

- Type: `Text`
- Name: `nombre`
- ✅ Required
- Min length: `1`
- Max length: `200`

**Campo 2: descripcion**

- Type: `Text`
- Name: `descripcion`
- ⬜ Required (dejar sin marcar)
- Max length: `1000`

**Campo 3: precio**

- Type: `Number`
- Name: `precio`
- ✅ Required
- Min: `0`

**Campo 4: categoria**

- Type: `Text`
- Name: `categoria`
- ✅ Required
- Max length: `100`

**Campo 5: imagen**

- Type: `File`
- Name: `imagen`
- ⬜ Required (dejar sin marcar)
- Max select: `1`
- Max size: `5242880` (5MB)
- Mime types: `image/jpeg, image/png, image/webp, image/gif`

**Campo 6: stock**

- Type: `Number`
- Name: `stock`
- ✅ Required
- Min: `0`

**Campo 7: activo**

- Type: `Bool`
- Name: `activo`
- ⬜ Required (dejar sin marcar)

### API Rules (Reglas de acceso) para productos:

Ve a la pestaña **"API Rules"**:

- **List/Search rule**: (dejar vacío) - permite listar sin autenticación
- **View rule**: (dejar vacío) - permite ver sin autenticación
- **Create rule**: `@request.auth.id != ""` - solo usuarios autenticados
- **Update rule**: `@request.auth.id != ""` - solo usuarios autenticados
- **Delete rule**: `@request.auth.id != ""` - solo usuarios autenticados

Click en **"Save"** (Guardar)

---

## 📁 Paso 3: Crear Colección "categorias"

1. Click en **"New collection"**
2. **Collection type**: Base collection
3. **Name**: `categorias`
4. Agregar campos:

### Campos de la colección categorias:

**Campo 1: nombre**

- Type: `Text`
- Name: `nombre`
- ✅ Required
- Max length: `100`

**Campo 2: icono**

- Type: `Text`
- Name: `icono`
- ⬜ Required (dejar sin marcar)
- Max length: `50`

### API Rules para categorias:

- **List/Search rule**: (dejar vacío)
- **View rule**: (dejar vacío)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

Click en **"Save"**

---

## 🛍️ Paso 4: Crear Colección "pedidos"

1. Click en **"New collection"**
2. **Collection type**: Base collection
3. **Name**: `pedidos`
4. Agregar campos:

### Campos de la colección pedidos:

**Campo 1: cliente_nombre**

- Type: `Text`
- Name: `cliente_nombre`
- ✅ Required
- Max length: `200`

**Campo 2: cliente_telefono**

- Type: `Text`
- Name: `cliente_telefono`
- ✅ Required
- Max length: `50`

**Campo 3: items**

- Type: `JSON`
- Name: `items`
- ✅ Required

**Campo 4: total**

- Type: `Number`
- Name: `total`
- ✅ Required
- Min: `0`

**Campo 5: estado**

- Type: `Select`
- Name: `estado`
- ✅ Required
- Max select: `1`
- Values (uno por línea):
  ```
  pendiente
  confirmado
  entregado
  cancelado
  ```

**Campo 6: notas**

- Type: `Text`
- Name: `notas`
- ⬜ Required (dejar sin marcar)
- Max length: `1000`

### API Rules para pedidos:

- **List/Search rule**: (dejar vacío)
- **View rule**: (dejar vacío)
- **Create rule**: (dejar vacío) - permite crear pedidos sin autenticación
- **Update rule**: `@request.auth.id != ""` - solo admins pueden actualizar
- **Delete rule**: `@request.auth.id != ""` - solo admins pueden eliminar

Click en **"Save"**

---

## ✅ Paso 5: Verificar

Deberías ver 3 colecciones en el panel:

- ✅ productos
- ✅ categorias
- ✅ pedidos

---

## 🎨 Paso 6: Agregar Datos de Prueba (Opcional)

### Crear Categorías:

1. Click en la colección **"categorias"**
2. Click en **"New record"**
3. Agrega estas categorías:

```
nombre: Frutas y Verduras    icono: 🍎
nombre: Lácteos              icono: 🥛
nombre: Panadería            icono: 🍞
nombre: Bebidas              icono: 🥤
nombre: Carnes               icono: 🥩
nombre: Limpieza             icono: 🧼
nombre: Despensa             icono: 🥫
```

### Crear Productos de Prueba:

Click en la colección **"productos"** → **"New record"**

**Producto 1:**

- nombre: `Manzanas`
- descripcion: `Manzanas rojas frescas`
- precio: `2.50`
- categoria: `Frutas y Verduras`
- stock: `100`
- activo: ✅

**Producto 2:**

- nombre: `Leche Entera`
- descripcion: `Leche entera 1 litro`
- precio: `1.50`
- categoria: `Lácteos`
- stock: `50`
- activo: ✅

**Producto 3:**

- nombre: `Pan Blanco`
- descripcion: `Pan blanco de 500g`
- precio: `1.00`
- categoria: `Panadería`
- stock: `30`
- activo: ✅

**Producto 4:**

- nombre: `Coca Cola`
- descripcion: `Coca Cola 2 litros`
- precio: `2.00`
- categoria: `Bebidas`
- stock: `80`
- activo: ✅

**Producto 5:**

- nombre: `Carne Molida`
- descripcion: `Carne molida de res 500g`
- precio: `5.00`
- categoria: `Carnes`
- stock: `25`
- activo: ✅

---

## 🎯 ¡Listo!

Ahora puedes:

1. Abrir `public/index.html` para ver la tienda
2. Abrir `public/admin.html` para gestionar productos

---

## 🐛 Solución de Problemas

### No veo los productos en la tienda

- Verifica que PocketBase esté corriendo en el puerto 8090
- Abre la consola del navegador (F12) y busca errores
- Verifica que la URL en `public/js/config.js` sea correcta

### No puedo crear productos desde el admin

- Asegúrate de haber iniciado sesión con tu cuenta de PocketBase
- Verifica que las API Rules de "productos" estén correctamente configuradas

### Error de CORS

- PocketBase por defecto permite CORS desde cualquier origen
- Si tienes problemas, verifica la configuración de tu navegador

---

## 📸 Capturas de Referencia

**Así se debe ver cada campo:**

### Campo Text:

```
[Text] nombre
  ✅ Required
  Min length: 1
  Max length: 200
```

### Campo Number:

```
[Number] precio
  ✅ Required
  Min: 0
```

### Campo File:

```
[File] imagen
  ⬜ Required
  Max select: 1
  Max size (bytes): 5242880
  Mime types: image/jpeg, image/png, image/webp, image/gif
```

### Campo Select:

```
[Select] estado
  ✅ Required
  Max select: 1
  Values:
    - pendiente
    - confirmado
    - entregado
    - cancelado
```

---

**¡Ahora tu base de datos está lista para usar! 🎉**
