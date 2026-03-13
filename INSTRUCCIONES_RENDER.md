# 📋 INSTRUCCIONES PARA DESPLEGAR EN RENDER

## ✅ LO QUE YA ESTÁ LISTO:

- [x] server.js configurado para servir frontend + backend
- [x] package.json con todas las dependencias
- [x] render.yaml con configuración automática
- [x] .gitignore para no subir archivos innecesarios
- [x] api-client.js para conectar frontend con backend

---

## 🚀 PASOS EN RENDER:

### OPCIÓN A: Despliegue Automático (Recomendado)

1. **Sube tu código a GitHub:**
   ```
   - Crea cuenta en GitHub si no tienes
   - Crea repositorio nuevo (público o privado)
   - Sube todos los archivos de DOPMAXWEBGG
   ```

2. **Conecta Render con GitHub:**
   - Ve a https://dashboard.render.com/
   - Inicia sesión con GitHub
   - Click en **"New +"** → **"Blueprint"**
   - Selecciona tu repositorio `DOPMAXWEBGG`
   - Click en **"Apply"**

3. **¡Listo!** Render creará automáticamente:
   - El servicio web
   - La base de datos PostgreSQL
   - Configurar las variables de entorno

---

### OPCIÓN B: Despliegue Manual

1. **Crea el Web Service:**
   - Ve a https://dashboard.render.com/
   - Click en **"New +"** → **"Web Service"**
   - Conecta tu repositorio de GitHub

2. **Configura el servicio:**

   | Campo | Valor |
   |-------|-------|
   | Name | `dopmax` |
   | Region | Frankfurt |
   | Branch | main/master |
   | Root Directory | (vacío) |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |

3. **Agrega la Base de Datos:**
   - Baja hasta **"Add Database"**
   - Click **"Add Database"**
   - Nombre: `dopmax-db`
   - Database Name: `dopmax`
   - User: `dopmax_user`
   - Region: Frankfurt

4. **Click en "Create Web Service"**

---

## 🔍 VERIFICAR QUE FUNCIONA:

1. Espera a que el deploy termine (5-10 minutos)
2. Verás una URL como: `https://dopmax-xxxx.onrender.com`
3. Abre esa URL en tu navegador
4. Deberías ver la página de login de DOPMAX

---

## ⚠️ SOLUCIÓN DE PROBLEMAS:

### Error: "Cannot find module"
- Verifica que `npm install` se ejecutó correctamente
- Revisa los logs en Render → Logs

### Error: "Database not configured"
- Verifica que la base de datos está creada
- Revisa que `DATABASE_URL` está en Environment Variables

### La página carga pero la API no funciona
- En desarrollo local es NORMAL (usa localStorage)
- En Render debería funcionar automáticamente

### Error 500 en los endpoints
- Revisa los logs en Render
- Verifica que las tablas se crearon (ver logs del inicio)

---

## 📊 URLs IMPORTANTES:

Una vez desplegado:

- **Frontend:** `https://dopmax-xxxx.onrender.com/`
- **API Base:** `https://dopmax-xxxx.onrender.com/api/`
- **Login:** `https://dopmax-xxxx.onrender.com/api/auth/login`
- **Register:** `https://dopmax-xxxx.onrender.com/api/auth/register`

---

## 💡 NOTA IMPORTANTE:

En **desarrollo local** (tu PC):
- El frontend usa `localStorage` para guardar datos
- La API devuelve error 503 (base de datos no configurada)
- Esto es NORMAL y esperado

En **producción** (Render):
- El frontend usa la API con PostgreSQL
- Todo se guarda en la base de datos
- Los usuarios persisten entre sesiones
