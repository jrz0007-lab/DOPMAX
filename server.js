/**
 * DOPMAX - Servidor Backend para Render
 * Base de datos: PostgreSQL
 * Framework: Express.js
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde el directorio actual (frontend)
app.use(express.static(__dirname));

// Configuración de PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';

let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false
    });
    console.log('📊 Conectado a PostgreSQL en Render (dopmaxx):', isProduction ? '(producción)' : '(local)');
} else {
    console.log('⚠️  DATABASE_URL no configurada - la API no estará disponible');
}

// Configuración de multer para subida de videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const videosDir = path.join(__dirname, 'videos');
        if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir, { recursive: true });
        }
        cb(null, videosDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|webm|ogg|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de video (mp4, webm, ogg, mov)'));
        }
    }
});

// ============================================
// TABLAS DE BASE DE DATOS
// ============================================

async function createTables() {
    if (!pool) {
        console.log('⚠️  No hay conexión a base de datos');
        return;
    }

    try {
        // Tabla de usuarios (con columnas adicionales para configuración)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                nombreusuario VARCHAR(50) PRIMARY KEY,
                contrasena VARCHAR(255) NOT NULL,
                chatsactivos INTEGER DEFAULT 0,
                avatar VARCHAR(10) DEFAULT '🐱',
                sala VARCHAR(50) DEFAULT 'Global',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                foto_perfil VARCHAR(500),
                cuenta_privada BOOLEAN DEFAULT FALSE,
                permitir_mensajes BOOLEAN DEFAULT TRUE,
                permitir_comentarios BOOLEAN DEFAULT TRUE,
                es_empresa BOOLEAN DEFAULT FALSE,
                tiempo_uso_acumulado INTEGER DEFAULT 0
            )
        `);

        // Tabla de usuarios bloqueados
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios_bloqueados (
                id SERIAL PRIMARY KEY,
                usuario_bloqueador VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                usuario_bloqueado VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario_bloqueador, usuario_bloqueado)
            )
        `);

        // Tabla de preferencias de contenido (encuesta ampliada)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS preferencias_usuario (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                musica BOOLEAN DEFAULT TRUE,
                gaming BOOLEAN DEFAULT TRUE,
                deportes BOOLEAN DEFAULT TRUE,
                comedia BOOLEAN DEFAULT TRUE,
                tecnologia BOOLEAN DEFAULT TRUE,
                educacion BOOLEAN DEFAULT TRUE,
                arte BOOLEAN DEFAULT TRUE,
                cocina BOOLEAN DEFAULT TRUE,
                viajes BOOLEAN DEFAULT TRUE,
                mascotas BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario)
            )
        `);

        // Tabla de tiempo de uso
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tiempo_uso (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                fecha DATE DEFAULT CURRENT_DATE,
                minutos INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario, fecha)
            )
        `);

        // Tabla de chats
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chats (
                id SERIAL PRIMARY KEY,
                usuario1 VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                usuario2 VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario1, usuario2)
            )
        `);

        // Tabla de mensajes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mensajes (
                id SERIAL PRIMARY KEY,
                chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                remitente VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                contenido TEXT NOT NULL,
                leido BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de videos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS videos (
                id SERIAL PRIMARY KEY,
                archivo VARCHAR(255) NOT NULL,
                usuario VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                titulo VARCHAR(100),
                vistas INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de comentarios de videos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comentarios_video (
                id SERIAL PRIMARY KEY,
                video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
                usuario VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                contenido TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de likes en videos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS likes_video (
                id SERIAL PRIMARY KEY,
                video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
                usuario VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(video_id, usuario)
            )
        `);

        // Tabla de seguidores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS seguidores (
                id SERIAL PRIMARY KEY,
                seguidor VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                seguido VARCHAR(50) NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(seguidor, seguido)
            )
        `);

        // Tabla de gato clicker (clicks por usuario)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS gato_clicks (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                clicks INTEGER DEFAULT 0,
                ultimo_click TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de ruleta (saldo de usuarios)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ruleta_saldo (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE NOT NULL REFERENCES usuarios(nombreusuario) ON DELETE CASCADE,
                saldo INTEGER DEFAULT 5000,
                ultimo_colecta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Tablas creadas exitosamente');
    } catch (error) {
        console.error('❌ Error creando tablas:', error);
    }
}

// ============================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================

// Middleware para verificar BD en todas las rutas /api
app.use('/api', (req, res, next) => {
    if (!pool) {
        return res.status(503).json({ 
            error: 'Base de datos no configurada',
            hint: 'Agrega DATABASE_URL en las variables de entorno de Render'
        });
    }
    next();
});

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombreusuario, contrasena } = req.body;

        if (!nombreusuario || !contrasena) {
            return res.status(400).json({ error: 'Nombre de usuario y contraseña requeridos' });
        }

        if (nombreusuario.length < 3) {
            return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
        }

        if (contrasena.length < 4) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await pool.query(
            'SELECT * FROM usuarios WHERE LOWER(nombreusuario) = LOWER($1)',
            [nombreusuario]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Este nombre de usuario ya está en uso' });
        }

        // Hashear contraseña
        const contrasenaHash = await bcrypt.hash(contrasena, 10);

        // Salas disponibles
        const salas = ['Global', 'Musica', 'Gaming', 'Deportes', 'Comida'];
        const salaAleatoria = salas[Math.floor(Math.random() * salas.length)];

        // Avatares disponibles
        const avatares = ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁'];
        const avatarAleatorio = avatares[Math.floor(Math.random() * avatares.length)];

        // Crear usuario
        const result = await pool.query(
            `INSERT INTO usuarios (nombreusuario, contrasena, avatar, sala)
             VALUES ($1, $2, $3, $4) RETURNING nombreusuario, avatar, sala, created_at`,
            [nombreusuario, contrasenaHash, avatarAleatorio, salaAleatoria]
        );

        // Inicializar saldo de ruleta
        await pool.query(
            'INSERT INTO ruleta_saldo (usuario, saldo) VALUES ($1, 5000)',
            [nombreusuario]
        );

        res.status(201).json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
    try {
        const { nombreusuario, contrasena } = req.body;

        if (!nombreusuario || !contrasena) {
            return res.status(400).json({ error: 'Nombre de usuario y contraseña requeridos' });
        }

        // Buscar usuario
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE LOWER(nombreusuario) = LOWER($1)',
            [nombreusuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, user.contrasena);

        if (!contrasenaValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Rotar sala
        const salas = ['Global', 'Musica', 'Gaming', 'Deportes', 'Comida'];
        const indiceActual = salas.indexOf(user.sala);
        const nuevaSala = salas[(indiceActual + 1) % salas.length];

        await pool.query(
            'UPDATE usuarios SET sala = $1 WHERE nombreusuario = $2',
            [nuevaSala, user.nombreusuario]
        );

        res.json({
            success: true,
            user: {
                nombreusuario: user.nombreusuario,
                avatar: user.avatar,
                sala: nuevaSala
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener perfil de usuario
app.get('/api/users/:nombreusuario', async (req, res) => {
    try {
        const { nombreusuario } = req.params;

        const result = await pool.query(
            `SELECT u.nombreusuario, u.avatar, u.sala, u.chatsactivos, u.created_at,
                    COUNT(DISTINCT s.id) as seguidores_count,
                    COUNT(DISTINCT s2.id) as seguidos_count,
                    COUNT(DISTINCT v.id) as videos_count
             FROM usuarios u
             LEFT JOIN seguidores s ON u.nombreusuario = s.seguido
             LEFT JOIN seguidores s2 ON u.nombreusuario = s2.seguidor
             LEFT JOIN videos v ON u.nombreusuario = v.usuario
             WHERE LOWER(u.nombreusuario) = LOWER($1)
             GROUP BY u.nombreusuario, u.avatar, u.sala, u.chatsactivos, u.created_at`,
            [nombreusuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// ENDPOINTS DE CHATS
// ============================================

// Obtener chats de un usuario
app.get('/api/chats/:usuario', async (req, res) => {
    try {
        const { usuario } = req.params;

        const result = await pool.query(
            `SELECT c.id, 
                    CASE WHEN c.usuario1 = $1 THEN c.usuario2 ELSE c.usuario1 END as otro_usuario,
                    u.avatar as otro_avatar,
                    (SELECT m.contenido FROM mensajes m 
                     WHERE m.chat_id = c.id 
                     ORDER BY m.created_at DESC LIMIT 1) as ultimo_mensaje,
                    (SELECT m.created_at FROM mensajes m 
                     WHERE m.chat_id = c.id 
                     ORDER BY m.created_at DESC LIMIT 1) as ultimo_mensaje_time
             FROM chats c
             JOIN usuarios u ON u.nombreusuario = CASE WHEN c.usuario1 = $1 THEN c.usuario2 ELSE c.usuario1 END
             WHERE c.usuario1 = $1 OR c.usuario2 = $1
             ORDER BY ultimo_mensaje_time DESC`,
            [usuario]
        );

        res.json({ chats: result.rows });
    } catch (error) {
        console.error('Error obteniendo chats:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Crear nuevo chat (funciona bidireccionalmente)
app.post('/api/chats', async (req, res) => {
    try {
        const { usuario1, usuario2 } = req.body;

        if (!usuario1 || !usuario2) {
            return res.status(400).json({ error: 'Usuarios requeridos' });
        }

        // Verificar que los usuarios existen
        const user1 = await pool.query('SELECT * FROM usuarios WHERE LOWER(nombreusuario) = LOWER($1)', [usuario1]);
        const user2 = await pool.query('SELECT * FROM usuarios WHERE LOWER(nombreusuario) = LOWER($1)', [usuario2]);

        if (user1.rows.length === 0 || user2.rows.length === 0) {
            return res.status(404).json({ error: 'Uno o ambos usuarios no existen' });
        }

        // Crear chat verificando en ambos sentidos (usuario1, usuario2) o (usuario2, usuario1)
        let result = await pool.query(
            `SELECT id FROM chats WHERE (usuario1 = $1 AND usuario2 = $2) OR (usuario1 = $2 AND usuario2 = $1)`,
            [usuario1, usuario2]
        );

        if (result.rows.length > 0) {
            // Chat ya existe
            return res.json({ success: true, chatId: result.rows[0].id, exists: true });
        }

        // Crear nuevo chat
        result = await pool.query(
            `INSERT INTO chats (usuario1, usuario2) VALUES ($1, $2) RETURNING id`,
            [usuario1, usuario2]
        );

        res.json({ success: true, chatId: result.rows[0].id, exists: false });
    } catch (error) {
        console.error('Error creando chat:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener mensajes de un chat
app.get('/api/chats/:chatId/mensajes', async (req, res) => {
    try {
        const { chatId } = req.params;

        const result = await pool.query(
            `SELECT m.id, m.contenido, m.remitente, m.created_at, u.avatar
             FROM mensajes m
             JOIN usuarios u ON u.nombreusuario = m.remitente
             WHERE m.chat_id = $1
             ORDER BY m.created_at ASC`,
            [chatId]
        );

        res.json({ mensajes: result.rows });
    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Enviar mensaje
app.post('/api/chats/:chatId/mensajes', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { remitente, contenido } = req.body;

        if (!remitente || !contenido) {
            return res.status(400).json({ error: 'Remitente y contenido requeridos' });
        }

        const result = await pool.query(
            `INSERT INTO mensajes (chat_id, remitente, contenido)
             VALUES ($1, $2, $3)
             RETURNING id, contenido, remitente, created_at`,
            [chatId, remitente, contenido]
        );

        res.status(201).json({ success: true, mensaje: result.rows[0] });
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// ENDPOINTS DE VIDEOS
// ============================================

// Subir video (archivo local)
app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
    try {
        const { usuario, titulo } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Archivo de video requerido' });
        }

        if (!usuario) {
            return res.status(400).json({ error: 'Usuario requerido' });
        }

        const result = await pool.query(
            `INSERT INTO videos (archivo, usuario, titulo)
             VALUES ($1, $2, $3)
             RETURNING id, archivo, usuario, titulo, created_at`,
            [req.file.filename, usuario, titulo || 'Video sin título']
        );

        res.status(201).json({ success: true, video: result.rows[0] });
    } catch (error) {
        console.error('Error subiendo video:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Registrar video con URL externa (Cloudinary, YouTube, etc.)
app.post('/api/videos/register', async (req, res) => {
    try {
        const { usuario, titulo, videoUrl } = req.body;

        if (!usuario) {
            return res.status(400).json({ error: 'Usuario requerido' });
        }

        if (!videoUrl) {
            return res.status(400).json({ error: 'URL del video requerida' });
        }

        // Validar que sea una URL válida
        try {
            new URL(videoUrl);
        } catch (e) {
            return res.status(400).json({ error: 'URL inválida' });
        }

        const result = await pool.query(
            `INSERT INTO videos (archivo, usuario, titulo)
             VALUES ($1, $2, $3)
             RETURNING id, archivo, usuario, titulo, created_at`,
            [videoUrl, usuario, titulo || 'Video sin título']
        );

        res.status(201).json({ success: true, video: result.rows[0] });
    } catch (error) {
        console.error('Error registrando video:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener todos los videos
app.get('/api/videos', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT v.*, u.avatar,
                    COUNT(DISTINCT cv.id) as comentarios_count,
                    COUNT(DISTINCT lv.id) as likes_count
             FROM videos v
             JOIN usuarios u ON u.nombreusuario = v.usuario
             LEFT JOIN comentarios_video cv ON cv.video_id = v.id
             LEFT JOIN likes_video lv ON lv.video_id = v.id
             GROUP BY v.id, u.avatar
             ORDER BY v.created_at DESC`
        );

        res.json({ videos: result.rows });
    } catch (error) {
        console.error('Error obteniendo videos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener comentarios de un video
app.get('/api/videos/:videoId/comentarios', async (req, res) => {
    try {
        const { videoId } = req.params;

        const result = await pool.query(
            `SELECT cv.id, cv.contenido, cv.usuario, cv.created_at, u.avatar
             FROM comentarios_video cv
             JOIN usuarios u ON u.nombreusuario = cv.usuario
             WHERE cv.video_id = $1
             ORDER BY cv.created_at ASC`,
            [videoId]
        );

        res.json({ comentarios: result.rows });
    } catch (error) {
        console.error('Error obteniendo comentarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Agregar comentario a video
app.post('/api/videos/:videoId/comentarios', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { usuario, contenido } = req.body;

        if (!usuario || !contenido) {
            return res.status(400).json({ error: 'Usuario y contenido requeridos' });
        }

        const result = await pool.query(
            `INSERT INTO comentarios_video (video_id, usuario, contenido)
             VALUES ($1, $2, $3)
             RETURNING id, contenido, usuario, created_at`,
            [videoId, usuario, contenido]
        );

        res.status(201).json({ success: true, comentario: result.rows[0] });
    } catch (error) {
        console.error('Error agregando comentario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Dar like a video
app.post('/api/videos/:videoId/like', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { usuario } = req.body;

        if (!usuario) {
            return res.status(400).json({ error: 'Usuario requerido' });
        }

        // Verificar si ya dio like
        const existing = await pool.query(
            'SELECT * FROM likes_video WHERE video_id = $1 AND usuario = $2',
            [videoId, usuario]
        );

        if (existing.rows.length > 0) {
            // Quitar like
            await pool.query(
                'DELETE FROM likes_video WHERE video_id = $1 AND usuario = $2',
                [videoId, usuario]
            );
            res.json({ success: true, liked: false });
        } else {
            // Dar like
            await pool.query(
                'INSERT INTO likes_video (video_id, usuario) VALUES ($1, $2)',
                [videoId, usuario]
            );
            res.json({ success: true, liked: true });
        }
    } catch (error) {
        console.error('Error dando like:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// ENDPOINTS DE RULETA
// ============================================

// Obtener saldo de ruleta
app.get('/api/roulette/:usuario/saldo', async (req, res) => {
    try {
        const { usuario } = req.params;

        const result = await pool.query(
            'SELECT saldo, ultimo_colecta FROM ruleta_saldo WHERE usuario = $1',
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.json({ saldo: 5000, ultimo_colecta: new Date() });
        }

        res.json({ 
            saldo: result.rows[0].saldo, 
            ultimo_colecta: result.rows[0].ultimo_colecta 
        });
    } catch (error) {
        console.error('Error obteniendo saldo:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Colectar monedas diarias
app.post('/api/roulette/:usuario/colectar', async (req, res) => {
    try {
        const { usuario } = req.params;
        const MONEDAS_POR_COLECTA = 5;
        const INTERVALO_COLECTA = 60000; // 1 minuto

        let result = await pool.query(
            'SELECT saldo, ultimo_colecta FROM ruleta_saldo WHERE usuario = $1',
            [usuario]
        );

        if (result.rows.length === 0) {
            await pool.query(
                'INSERT INTO ruleta_saldo (usuario, saldo) VALUES ($1, 5000)',
                [usuario]
            );
            result = await pool.query(
                'SELECT saldo, ultimo_colecta FROM ruleta_saldo WHERE usuario = $1',
                [usuario]
            );
        }

        const ahora = new Date();
        const ultimoColecta = new Date(result.rows[0].ultimo_colecta);
        const diferencia = ahora - ultimoColecta;

        if (diferencia < INTERVALO_COLECTA) {
            return res.status(400).json({ 
                error: 'Debes esperar para colectar',
                tiempoRestante: Math.ceil((INTERVALO_COLECTA - diferencia) / 1000)
            });
        }

        const nuevoSaldo = result.rows[0].saldo + MONEDAS_POR_COLECTA;

        await pool.query(
            'UPDATE ruleta_saldo SET saldo = $1, ultimo_colecta = $2 WHERE usuario = $3',
            [nuevoSaldo, ahora, usuario]
        );

        res.json({ success: true, saldo: nuevoSaldo });
    } catch (error) {
        console.error('Error colectando monedas:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar saldo después de apuesta
app.post('/api/roulette/:usuario/apostar', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { monto, gano } = req.body;

        let result = await pool.query(
            'SELECT saldo FROM ruleta_saldo WHERE usuario = $1',
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const saldoActual = result.rows[0].saldo;
        const nuevoSaldo = gano ? saldoActual + monto : saldoActual - monto;

        if (nuevoSaldo < 0) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        await pool.query(
            'UPDATE ruleta_saldo SET saldo = $1 WHERE usuario = $2',
            [nuevoSaldo, usuario]
        );

        res.json({ success: true, saldo: nuevoSaldo });
    } catch (error) {
        console.error('Error apostando:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// ENDPOINTS DE SEGUIDORES
// ============================================

// Seguir usuario
app.post('/api/users/:usuario/seguir', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { seguidor } = req.body;

        if (!seguidor) {
            return res.status(400).json({ error: 'Seguidor requerido' });
        }

        await pool.query(
            'INSERT INTO seguidores (seguidor, seguido) VALUES ($1, $2)',
            [seguidor, usuario]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error siguiendo usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Dejar de seguir
app.delete('/api/users/:usuario/seguir', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { seguidor } = req.query;

        await pool.query(
            'DELETE FROM seguidores WHERE seguidor = $1 AND seguido = $2',
            [seguidor, usuario]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error dejando de seguir:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Buscar usuarios
app.get('/api/users/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const { exclude } = req.query;

        const result = await pool.query(
            `SELECT nombreusuario, avatar, sala 
             FROM usuarios 
             WHERE LOWER(nombreusuario) LIKE LOWER($1) 
             AND nombreusuario != $2
             LIMIT 10`,
            [`%${query}%`, exclude || '']
        );

        res.json({ usuarios: result.rows });
    } catch (error) {
        console.error('Error buscando usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// ENDPOINTS DE GATO CLICKER
// ============================================

// Obtener clicks del gato
app.get('/api/gato/:usuario/clicks', async (req, res) => {
    try {
        const { usuario } = req.params;

        const result = await pool.query(
            'SELECT clicks FROM gato_clicks WHERE usuario = $1',
            [usuario]
        );

        if (result.rows.length === 0) {
            // Crear registro si no existe
            await pool.query(
                'INSERT INTO gato_clicks (usuario, clicks) VALUES ($1, 0)',
                [usuario]
            );
            res.json({ clicks: 0 });
        } else {
            res.json({ clicks: result.rows[0].clicks });
        }
    } catch (error) {
        console.error('Error obteniendo clicks:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Guardar clicks del gato
app.post('/api/gato/:usuario/clicks', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { clicks } = req.body;

        const result = await pool.query(
            `INSERT INTO gato_clicks (usuario, clicks)
             VALUES ($1, $2)
             ON CONFLICT (usuario) DO UPDATE SET clicks = $2, ultimo_click = CURRENT_TIMESTAMP
             RETURNING clicks`,
            [usuario, clicks]
        );

        res.json({ success: true, clicks: result.rows[0].clicks });
    } catch (error) {
        console.error('Error guardando clicks:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// ENDPOINTS DE CONFIGURACIÓN DE USUARIO
// ============================================

// Actualizar configuración de privacidad
app.put('/api/users/:usuario/privacy', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { cuenta_privada, permitir_mensajes, permitir_comentarios } = req.body;

        await pool.query(
            `UPDATE usuarios SET 
             cuenta_privada = COALESCE($1, cuenta_privada),
             permitir_mensajes = COALESCE($2, permitir_mensajes),
             permitir_comentarios = COALESCE($3, permitir_comentarios)
             WHERE nombreusuario = $4`,
            [cuenta_privada, permitir_mensajes, permitir_comentarios, usuario]
        );

        res.json({ success: true, message: 'Privacidad actualizada' });
    } catch (error) {
        console.error('Error actualizando privacidad:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar foto de perfil
app.put('/api/users/:usuario/foto', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { foto_url } = req.body;

        await pool.query(
            'UPDATE usuarios SET foto_perfil = $1 WHERE nombreusuario = $2',
            [foto_url, usuario]
        );

        res.json({ success: true, message: 'Foto actualizada' });
    } catch (error) {
        console.error('Error actualizando foto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Bloquear usuario
app.post('/api/users/:usuario/bloquear', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { usuario_bloqueado } = req.body;

        await pool.query(
            'INSERT INTO usuarios_bloqueados (usuario_bloqueador, usuario_bloqueado) VALUES ($1, $2)',
            [usuario, usuario_bloqueado]
        );

        res.json({ success: true, message: 'Usuario bloqueado' });
    } catch (error) {
        console.error('Error bloqueando usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Desbloquear usuario
app.delete('/api/users/:usuario/bloquear/:usuario_bloqueado', async (req, res) => {
    try {
        const { usuario, usuario_bloqueado } = req.params;

        await pool.query(
            'DELETE FROM usuarios_bloqueados WHERE usuario_bloqueador = $1 AND usuario_bloqueado = $2',
            [usuario, usuario_bloqueado]
        );

        res.json({ success: true, message: 'Usuario desbloqueado' });
    } catch (error) {
        console.error('Error desbloqueando usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener usuarios bloqueados
app.get('/api/users/:usuario/bloqueados', async (req, res) => {
    try {
        const { usuario } = req.params;

        const result = await pool.query(
            'SELECT usuario_bloqueado, created_at FROM usuarios_bloqueados WHERE usuario_bloqueador = $1',
            [usuario]
        );

        res.json({ bloqueados: result.rows });
    } catch (error) {
        console.error('Error obteniendo bloqueados:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar preferencias de contenido
app.put('/api/users/:usuario/preferencias', async (req, res) => {
    try {
        const { usuario } = req.params;
        const prefs = req.body;

        await pool.query(`
            INSERT INTO preferencias_usuario (usuario, musica, gaming, deportes, comedia, tecnologia, educacion, arte, cocina, viajes, mascotas)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (usuario) DO UPDATE SET
                musica = EXCLUDED.musica,
                gaming = EXCLUDED.gaming,
                deportes = EXCLUDED.deportes,
                comedia = EXCLUDED.comedia,
                tecnologia = EXCLUDED.tecnologia,
                educacion = EXCLUDED.educacion,
                arte = EXCLUDED.arte,
                cocina = EXCLUDED.cocina,
                viajes = EXCLUDED.viajes,
                mascotas = EXCLUDED.mascotas
            `,
            [usuario, prefs.musica, prefs.gaming, prefs.deportes, prefs.comedia, 
             prefs.tecnologia, prefs.educacion, prefs.arte, prefs.cocina, prefs.viajes, prefs.mascotas]
        );

        res.json({ success: true, message: 'Preferencias actualizadas' });
    } catch (error) {
        console.error('Error actualizando preferencias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener preferencias de contenido
app.get('/api/users/:usuario/preferencias', async (req, res) => {
    try {
        const { usuario } = req.params;

        const result = await pool.query(
            'SELECT * FROM preferencias_usuario WHERE usuario = $1',
            [usuario]
        );

        if (result.rows.length === 0) {
            res.json({ preferencias: null });
        } else {
            res.json({ preferencias: result.rows[0] });
        }
    } catch (error) {
        console.error('Error obteniendo preferencias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Registrar tiempo de uso
app.post('/api/users/:usuario/tiempo', async (req, res) => {
    try {
        const { usuario } = req.params;
        const { minutos } = req.body;
        const hoy = new Date().toISOString().split('T')[0];

        await pool.query(`
            INSERT INTO tiempo_uso (usuario, fecha, minutos)
            VALUES ($1, $2, $3)
            ON CONFLICT (usuario, fecha) DO UPDATE SET minutos = tiempo_uso.minutos + $3
            `,
            [usuario, hoy, minutos]
        );

        res.json({ success: true, message: 'Tiempo registrado' });
    } catch (error) {
        console.error('Error registrando tiempo:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener estadísticas de tiempo de uso
app.get('/api/users/:usuario/tiempo', async (req, res) => {
    try {
        const { usuario } = req.params;

        const result = await pool.query(`
            SELECT fecha, minutos FROM tiempo_uso 
            WHERE usuario = $1 
            ORDER BY fecha DESC 
            LIMIT 30
            `,
            [usuario]
        );

        res.json({ tiempo_uso: result.rows });
    } catch (error) {
        console.error('Error obteniendo tiempo de uso:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Verificar si usuario está bloqueado
app.get('/api/users/:usuario/esta-bloqueado/:otro_usuario', async (req, res) => {
    try {
        const { usuario, otro_usuario } = req.params;

        const result = await pool.query(
            'SELECT * FROM usuarios_bloqueados WHERE usuario_bloqueador = $1 AND usuario_bloqueado = $2',
            [otro_usuario, usuario]
        );

        res.json({ bloqueado: result.rows.length > 0 });
    } catch (error) {
        console.error('Error verificando bloqueo:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// RUTA PARA SERVICIO DEL FRONTEND
// ============================================

// Servir index.html para todas las rutas que no son de la API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// INICIAR SERVIDOR
// ============================================

// Inicializar comentarios por defecto en videos
async function initVideoComments() {
    if (!pool) {
        console.log('⚠️ No hay conexión para inicializar comentarios');
        return;
    }

    try {
        // Obtener todos los videos de la BD
        const videosResult = await pool.query('SELECT id FROM videos ORDER BY created_at');

        // IDs de videos hardcodeados en el frontend (video1, video2, video3)
        const hardcodedVideoIds = ['video1', 'video2', 'video3'];
        
        // Combinar videos de BD con hardcodeados
        const allVideoIds = [
            ...videosResult.rows.map(v => v.id),
            ...hardcodedVideoIds
        ];

        // Eliminar duplicados
        const uniqueVideoIds = [...new Set(allVideoIds)];

        if (uniqueVideoIds.length === 0) {
            console.log('⚠️ No hay videos para inicializar comentarios');
            return;
        }

        console.log(`📹 Inicializando comentarios para ${uniqueVideoIds.length} videos...`);

        // Comentarios por defecto
        const defaultComments = [
            '¡Me encanta este video! 🔥',
            'Esto es increíble 😍',
            '¿Alguien más viendo esto? 👀',
            '¡Brutal! 💯',
            'Necesito más contenido así'
        ];

        let commentsAdded = 0;

        // Agregar 2 comentarios a cada video
        for (const videoId of uniqueVideoIds) {
            // Verificar si el video ya tiene comentarios
            const existingComments = await pool.query(
                'SELECT COUNT(*) FROM comentarios_video WHERE video_id = $1',
                [videoId]
            );

            const commentCount = parseInt(existingComments.rows[0].count);

            // Si tiene menos de 2 comentarios, agregar
            if (commentCount < 2) {
                for (let i = 0; i < 2 - commentCount; i++) {
                    const randomComment = defaultComments[Math.floor(Math.random() * defaultComments.length)];
                    await pool.query(
                        'INSERT INTO comentarios_video (video_id, usuario, contenido) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                        [videoId, 'admin', randomComment]
                    );
                    commentsAdded++;
                }
            }
        }

        console.log(`✅ Comentarios inicializados: ${commentsAdded} nuevos`);
    } catch (error) {
        console.error('❌ Error inicializando comentarios:', error);
    }
}

async function startServer() {
    try {
        // Crear tablas
        await createTables();

        // Inicializar comentarios en videos
        await initVideoComments();

        // Actualizar tabla de usuarios con columnas adicionales (si no existen)
        await updateUsersTable();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor DOPMAX corriendo en puerto ${PORT}`);
            console.log(`📊 Base de datos: ${process.env.NODE_ENV === 'production' ? 'PostgreSQL (Render)' : 'PostgreSQL (local)'}`);
        });
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Actualizar tabla de usuarios con columnas adicionales
async function updateUsersTable() {
    if (!pool) return;

    try {
        // Agregar columna foto_perfil si no existe
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(500)
        `);
        console.log('✅ Columna foto_perfil verificada');

        // Agregar columna cuenta_privada si no existe
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS cuenta_privada BOOLEAN DEFAULT FALSE
        `);
        console.log('✅ Columna cuenta_privada verificada');

        // Agregar columna permitir_mensajes si no existe
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS permitir_mensajes BOOLEAN DEFAULT TRUE
        `);
        console.log('✅ Columna permitir_mensajes verificada');

        // Agregar columna es_empresa si no existe
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS es_empresa BOOLEAN DEFAULT FALSE
        `);
        console.log('✅ Columna es_empresa verificada');

        console.log('✅ Tabla de usuarios actualizada correctamente');
    } catch (error) {
        console.error('❌ Error actualizando tabla de usuarios:', error);
    }
}

startServer();
