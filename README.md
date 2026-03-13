# DOPMAX - Backend + Frontend

Servidor backend + frontend para la aplicación DOPMAX, una plataforma de videos y chats.

## 🚀 Despliegue en Render (PASO A PASO)

### 1. Sube tu código a GitHub
- Crea un repositorio en GitHub
- Sube todos los archivos de esta carpeta

### 2. Crea el servicio en Render

1. Ve a https://dashboard.render.com/
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub

### 3. Configura el servicio

| Campo | Valor |
|-------|-------|
| **Name** | `dopmax` |
| **Region** | Frankfurt (o el más cercano) |
| **Branch** | `main` o `master` |
| **Root Directory** | (déjalo vacío) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

### 4. Agrega la base de datos PostgreSQL

1. En la misma página de creación, baja a **"Add Database"**
2. Click en **"Add Database"**
3. Configura:
   - **Name**: `dopmax-db`
   - **Database Name**: `dopmax`
   - **User**: `dopmax_user`
   - **Password**: (genera una segura)
   - **Region**: Frankfurt (misma que el web service)

### 5. ¡Desplegar!

1. Click en **"Create Web Service"**
2. Render construirá y desplegará automáticamente
3. Las tablas se crearán solas al iniciar

### 6. Accede a tu aplicación

- **Frontend**: `https://dopmax-XXXX.onrender.com/`
- **API**: `https://dopmax-XXXX.onrender.com/api/`

## Estructura de la Base de Datos

### Tablas:

- **usuarios**: `nombreusuario (PK)`, `contrasena`, `chatsactivos (FK)`, `avatar`, `sala`, `created_at`
- **chats**: `id (PK)`, `usuario1 (FK)`, `usuario2 (FK)`, `created_at`
- **mensajes**: `id (PK)`, `chat_id (FK)`, `remitente (FK)`, `contenido`, `leido`, `created_at`
- **videos**: `id (PK)`, `archivo`, `usuario (FK)`, `titulo`, `vistas`, `created_at`
- **comentarios_video**: `id (PK)`, `video_id (FK)`, `usuario (FK)`, `contenido`, `created_at`
- **likes_video**: `id (PK)`, `video_id (FK)`, `usuario (FK)`, `created_at`
- **seguidores**: `id (PK)`, `seguidor (FK)`, `seguido (FK)`, `created_at`
- **ruleta_saldo**: `id (PK)`, `usuario (FK)`, `saldo`, `ultimo_colecta`

## Endpoints API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users/:nombreusuario` - Obtener perfil
- `GET /api/users/search/:query` - Buscar usuarios
- `POST /api/users/:usuario/seguir` - Seguir usuario
- `DELETE /api/users/:usuario/seguir` - Dejar de seguir

### Chats
- `GET /api/chats/:usuario` - Obtener chats del usuario
- `POST /api/chats` - Crear nuevo chat
- `GET /api/chats/:chatId/mensajes` - Obtener mensajes
- `POST /api/chats/:chatId/mensajes` - Enviar mensaje

### Videos
- `POST /api/videos/upload` - Subir video
- `GET /api/videos` - Obtener todos los videos
- `GET /api/videos/:videoId/comentarios` - Obtener comentarios
- `POST /api/videos/:videoId/comentarios` - Agregar comentario
- `POST /api/videos/:videoId/like` - Dar/quitar like

### Ruleta
- `GET /api/roulette/:usuario/saldo` - Obtener saldo
- `POST /api/roulette/:usuario/colectar` - Colectar monedas
- `POST /api/roulette/:usuario/apostar` - Actualizar saldo después de apuesta

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tu configuración local

# Iniciar servidor
npm start

# O con auto-reload
npm run dev
```

## URL del API

Una vez desplegado en Render:
- **Frontend:** `https://dopmax.onrender.com/`
- **API:** `https://dopmax.onrender.com/api`

(Reemplaza con tu URL real de Render)
