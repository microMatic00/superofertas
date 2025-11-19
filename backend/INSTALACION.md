# Guía de Instalación de PocketBase

## Windows

1. Descarga PocketBase desde: https://github.com/pocketbase/pocketbase/releases

   - Busca la última versión
   - Descarga: `pocketbase_x.x.x_windows_amd64.zip`

2. Extrae el archivo ZIP

3. Copia el archivo `pocketbase.exe` en la carpeta `backend/` de este proyecto

4. Abre una terminal en la carpeta `backend/` y ejecuta:
   ```bash
   ./pocketbase serve
   ```

## Linux / macOS

1. Descarga PocketBase desde: https://github.com/pocketbase/pocketbase/releases

   - Linux: `pocketbase_x.x.x_linux_amd64.zip`
   - macOS: `pocketbase_x.x.x_darwin_amd64.zip` o `darwin_arm64.zip` (para M1/M2)

2. Extrae el archivo

3. Dale permisos de ejecución:

   ```bash
   chmod +x pocketbase
   ```

4. Cópialo a la carpeta `backend/` del proyecto

5. Ejecuta:
   ```bash
   ./pocketbase serve
   ```

## Configuración Inicial

1. Abre http://127.0.0.1:8090/_/ en tu navegador

2. Crea tu cuenta de administrador:

   - Email: tu-email@example.com
   - Contraseña: (elige una segura)

3. Importa el schema:

   - Ve a Settings (⚙️) → Import collections
   - Selecciona el archivo `backend/pb_schema.json`
   - Click en "Import"

4. ¡Listo! PocketBase está configurado

## Datos de Ejemplo (Opcional)

Para agregar productos de prueba:

1. Ve a http://127.0.0.1:8090/_/

2. Crea categorías en la colección "categorias":

   - Frutas y Verduras (🍎)
   - Lácteos (🥛)
   - Panadería (🍞)
   - Bebidas (🥤)
   - Carnes (🥩)

3. Crea algunos productos en la colección "productos":
   - Nombre: Manzanas
   - Categoría: Frutas y Verduras
   - Precio: 2.50
   - Stock: 100
   - Activo: ✓

## Solución de Problemas

### Puerto ya en uso

Si el puerto 8090 está ocupado, puedes usar otro:

```bash
./pocketbase serve --http=127.0.0.1:8091
```

Y actualiza la URL en `public/js/config.js`:

```javascript
export const PB_URL = "http://127.0.0.1:8091";
```

### No se puede ejecutar en Windows

- Asegúrate de que el antivirus no esté bloqueando el ejecutable
- Ejecuta como administrador si es necesario
- Verifica que tengas permisos en la carpeta

### Error de CORS

Si tienes problemas de CORS al acceder desde otro dominio:

1. Crea un archivo `pb_hooks/cors.pb.js`
2. Configura los headers CORS según la documentación de PocketBase
