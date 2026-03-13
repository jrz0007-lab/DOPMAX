/**
 * DOPMAX - Servidor Backend para Render
 * Base de datos: PostgreSQL
 * Framework: Express.js
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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
    try {
        // Tabla de usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                nombreusuario VARCHAR(50) PRIMARY KEY,
                contrasena VARCHAR(255) NOT NULL,
                chatsactivos INTEGER DEFAULT 0,
                avatar VARCHAR(10) DEFAULT '🐱',
                sala VARCHAR(50) DEFAULT 'Global',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

// Crear nuevo chat
app.post('/api/chats', async (req, res) => {
    try {
        const { usuario1, usuario2 } = req.body;

        if (!usuario1 || !usuario2) {
            return res.status(400).json({ error: 'Usuarios requeridos' });
        }

        // Verificar que los usuarios existen
        const user1 = await pool.query('SELECT * FROM usuarios WHERE nombreusuario = $1', [usuario1]);
        const user2 = await pool.query('SELECT * FROM usuarios WHERE nombreusuario = $1', [usuario2]);

        if (user1.rows.length === 0 || user2.rows.length === 0) {
            return res.status(404).json({ error: 'Uno o ambos usuarios no existen' });
        }

        // Crear o obtener chat existente
        const result = await pool.query(
            `INSERT INTO chats (usuario1, usuario2)
             VALUES ($1, $2)
             ON CONFLICT (usuario1, usuario2) DO UPDATE SET usuario1 = $1
             RETURNING id`,
            [usuario1, usuario2]
        );

        res.json({ success: true, chatId: result.rows[0].id });
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

// Subir video
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
// INICIAR SERVIDOR
// ============================================

async function startServer() {
    try {
        // Crear tablas
        await createTables();

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

startServer();
