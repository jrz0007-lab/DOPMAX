# 📋 INSTRUCCIONES PARA DESPLEGAR EN RENDER

## ✅ CONFIGURACIÓN COMPLETADA

- [x] `DATABASE_URL` configurada con la base de datos `dopmaxx` en Render
- [x] `server.js` configurado para servir frontend + backend
- [x] `package.json` con todas las dependencias
- [x] `render.yaml` con configuración automática
- [x] `.gitignore` para no subir archivos innecesarios
- [x] `api-client.js` para conectar frontend con backend
- [x] `.env` configurado para desarrollo local

---

## 🚀 PASOS EN RENDER:

### OPCIÓN A: Despliegue Automático (Recomendado)

1. **Sube tu código a GitHub:**
   ```
   - Crea cuenta en GitHub si no tienes
   - Crea repositorio nuevo (público o privado)
   - Sube todos los archivos de DOPMAXWEBGG
   - ⚠️ NO subas el archivo .env (ya está en .gitignore)
   ```

2. **Conecta Render con GitHub:**
   - Ve a https://dashboard.render.com/
   - Inicia sesión con GitHub
   - Click en **"New +"** → **"Blueprint"**
   - Selecciona tu repositorio `DOPMAXWEBGG`
   - Click en **"Apply"**

3. **¡Listo!** Render creará automáticamente:
   - El servicio web
   - Configurar las variables de entorno con `DATABASE_URL`

---

### OPCIÓN B: Despliegue Manual (Web Service)

1. **Crea el Web Service:**
   - Ve a https://dashboard.render.com/
   - Click en **"New +"** → **"Web Service"**
   - Conecta tu repositorio de GitHub

2. **Configura el servicio:**

   | Campo | Valor |
   |-------|-------|
   | Name | `dopmax-app` |
   | Region | Frankfurt |
   | Branch | main/master |
   | Root Directory | (vacío) |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |

3. **Agrega Variable de Entorno:**
   - En la sección **Environment**
   - Click en **"Add Environment Variable"**
   - Key: `DATABASE_URL`
   - Value: `postgresql://dopmaxx_user:AxAOCstUlJECm8KZePvgUjRcmmbA6Alk@dpg-d6q0ekpj16oc73boo1m0-a/dopmaxx`
   - Click en **"Save Changes"**

4. **Click en "Create Web Service"**

---

## 🔍 VERIFICAR QUE FUNCIONA:

1. Espera a que el deploy termine (5-10 minutos)
2. Verás una URL como: `https://dopmax-app-xxxx.onrender.com`
3. Abre esa URL en tu navegador
4. Deberías ver la página de login de DOPMAX

---

## ⚠️ SOLUCIÓN DE PROBLEMAS:

### Error: "Cannot find module"
- Verifica que `npm install` se ejecutó correctamente
- Revisa los logs en Render → Logs

### Error: "Database not configured"
- Verifica que `DATABASE_URL` está en Environment Variables
- Revisa los logs para ver si hay errores de conexión

### La página carga pero la API no funciona
- En desarrollo local es NORMAL (usa localStorage si no hay DATABASE_URL)
- En Render debería funcionar automáticamente

### Error 500 en los endpoints
- Revisa los logs en Render
- Verifica que las tablas se crearon (ver logs del inicio)

---

## 📊 URLs IMPORTANTES:

Una vez desplegado:

- **Frontend:** `https://dopmax-app-xxxx.onrender.com/`
- **API Base:** `https://dopmax-app-xxxx.onrender.com/api/`
- **Login:** `https://dopmax-app-xxxx.onrender.com/api/auth/login`
- **Register:** `https://dopmax-app-xxxx.onrender.com/api/auth/register`

---

## 💡 NOTA IMPORTANTE:

En **desarrollo local** (tu PC):
- El frontend usa `localStorage` para guardar datos (fallback)
- Si tienes `.env` con `DATABASE_URL`, usará la base de datos de Render
- La API funcionará conectada a la base de datos remota

En **producción** (Render):
- El frontend usa la API con PostgreSQL
- Todo se guarda en la base de datos `dopmaxx`
- Los usuarios persisten entre sesiones
