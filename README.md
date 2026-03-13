# DOPMAX - Backend

Servidor backend para la aplicación DOPMAX, una plataforma de videos y chats.

## Despliegue en Render

### Pasos para desplegar:

1. **Crear una cuenta en [Render](https://render.com)**

2. **Crear un nuevo Web Service:**
   - Conecta tu repositorio de GitHub
   - Selecciona este repositorio

3. **Configurar el servicio:**
   - **Name:** `dopmax` (o el nombre que prefieras)
   - **Region:** Elige la más cercana a tus usuarios
   - **Branch:** `main` o `master`
   - **Root Directory:** Deja vacío
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

4. **Configurar base de datos PostgreSQL:**
   - En Render, agrega una base de datos PostgreSQL al servicio
   - O crea un servicio de PostgreSQL separado
   - Copia la URL de conexión externa
   - Agrega la variable de entorno `DATABASE_URL` con la URL

5. **Desplegar:**
   - Render automáticamente construirá y desplegará tu aplicación
   - Las tablas se crearán automáticamente al iniciar
   - El frontend y backend estarán disponibles en la misma URL

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
