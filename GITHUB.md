# 📦 Guía para Subir a GitHub

## 🔧 Pasos para Publicar tu Proyecto

### 1️⃣ Inicializar Git (si no lo has hecho)

```bash
cd tiendaWeb
git init
```

### 2️⃣ Agregar los Archivos

```bash
# Agregar todos los archivos (el .gitignore ya excluye pb_data/)
git add .

# O agregar archivos específicos
git add README.md
git add public/
git add backend/pb_schema.json
git add backend/CREAR_COLECCIONES.md
git add .gitignore
```

### 3️⃣ Hacer el Primer Commit

```bash
git commit -m "🎉 Inicial commit - Sistema de tienda web con PocketBase"
```

### 4️⃣ Crear el Repositorio en GitHub

1. Ve a https://github.com/new
2. **Nombre del repositorio:** `tiendaWeb` o `supermercado-online`
3. **Descripción:** "Sistema de e-commerce para supermercados con WhatsApp"
4. Marca como **Público** o **Privado**
5. **NO** marques "Add a README file" (ya lo tienes)
6. Click en **"Create repository"**

### 5️⃣ Conectar con GitHub

```bash
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/tiendaWeb.git

# Verificar que se agregó correctamente
git remote -v
```

### 6️⃣ Subir el Código

```bash
# Primera vez (crear rama main y subir)
git branch -M main
git push -u origin main

# Siguientes veces (solo push)
git push
```

### 7️⃣ Agregar un Token de Acceso Personal (si es necesario)

Si GitHub te pide autenticación:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Marca: `repo`, `workflow`
4. Copia el token
5. Al hacer push, usa el token como contraseña

## 📝 Comandos Útiles

### Actualizar el Repositorio

```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Commit con mensaje
git commit -m "✨ Agregar nueva funcionalidad"

# Subir cambios
git push
```

### Mensajes de Commit Recomendados

```bash
git commit -m "🐛 Fix: Corregir error en carrito"
git commit -m "✨ Feat: Agregar filtro por precio"
git commit -m "📝 Docs: Actualizar README"
git commit -m "🎨 Style: Mejorar diseño del header"
git commit -m "♻️ Refactor: Reorganizar código de admin"
git commit -m "🔧 Config: Actualizar configuración de WhatsApp"
```

## ⚠️ Importante: Archivos Excluidos

El `.gitignore` ya está configurado para **NO** subir:

- ❌ `pb_data/` - Datos de la base de datos (privados)
- ❌ `pocketbase` / `pocketbase.exe` - Ejecutable (muy pesado)
- ❌ `node_modules/` - Si agregas Node.js
- ❌ Archivos temporales y de sistema

## 🔐 Seguridad

**Antes de subir, verifica:**

1. ✅ No hay contraseñas en el código
2. ✅ El número de WhatsApp es de ejemplo (o tu número público)
3. ✅ La carpeta `pb_data/` NO se sube (base de datos privada)
4. ✅ El ejecutable de PocketBase NO se sube

## 📄 Licencia

Si quieres agregar una licencia MIT, crea el archivo `LICENSE`:

```bash
echo "MIT License..." > LICENSE
git add LICENSE
git commit -m "📄 Agregar licencia MIT"
git push
```

## 🎉 ¡Listo!

Tu proyecto ahora está en GitHub y puedes:

- 📤 Compartir el link con otros
- 🔄 Clonar en otras computadoras
- 👥 Colaborar con otros desarrolladores
- 📊 Hacer seguimiento de cambios
- 🌟 Recibir estrellas y contribuciones

### Link de tu Repositorio:

```
https://github.com/TU_USUARIO/tiendaWeb
```

## 🚀 Siguientes Pasos

1. Agrega una **imagen de portada** al README
2. Crea **Issues** para mejoras futuras
3. Agrega **topics** al repositorio (javascript, pocketbase, ecommerce, etc.)
4. Considera agregar un **GitHub Pages** para demo
5. Agrega **CONTRIBUTING.md** si quieres contribuciones

---

**¿Necesitas ayuda?** Crea un Issue en el repositorio.
