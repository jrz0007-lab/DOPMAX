/**
 * DOPMAX - Cliente API para conectar con el backend
 * Este archivo permite la comunicación con el servidor backend
 */

// Configuración de la API - usa ruta relativa (mismo dominio frontend/backend)
const API_CONFIG = {
    baseURL: '/api',
    timeout: 10000
};

// Cliente API
const API = {
    // ============================================
    // AUTENTICACIÓN
    // ============================================

    register: async (nombreusuario, contrasena) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreusuario, contrasena })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el registro');
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: error.message };
        }
    },

    login: async (nombreusuario, contrasena) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreusuario, contrasena })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el login');
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: error.message };
        }
    },

    getUserProfile: async (nombreusuario) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/users/${encodeURIComponent(nombreusuario)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error obteniendo perfil');
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return { success: false, error: error.message };
        }
    },

    searchUsers: async (query, exclude = '') => {
        try {
            const response = await fetch(
                `${API_CONFIG.baseURL}/users/search/${encodeURIComponent(query)}?exclude=${encodeURIComponent(exclude)}`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error buscando usuarios');
            }

            return { success: true, usuarios: data.usuarios };
        } catch (error) {
            console.error('Error buscando usuarios:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // CHATS
    // ============================================

    getUserChats: async (usuario) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/chats/${encodeURIComponent(usuario)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error obteniendo chats');
            }

            return { success: true, chats: data.chats };
        } catch (error) {
            console.error('Error obteniendo chats:', error);
            return { success: false, error: error.message };
        }
    },

    createChat: async (usuario1, usuario2) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario1, usuario2 })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error creando chat');
            }

            return { success: true, chatId: data.chatId };
        } catch (error) {
            console.error('Error creando chat:', error);
            return { success: false, error: error.message };
        }
    },

    getChatMessages: async (chatId) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/chats/${chatId}/mensajes`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error obteniendo mensajes');
            }

            return { success: true, mensajes: data.mensajes };
        } catch (error) {
            console.error('Error obteniendo mensajes:', error);
            return { success: false, error: error.message };
        }
    },

    sendMessage: async (chatId, remitente, contenido) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/chats/${chatId}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ remitente, contenido })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error enviando mensaje');
            }

            return { success: true, mensaje: data.mensaje };
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // VIDEOS
    // ============================================

    uploadVideo: async (videoFile, usuario, titulo = '') => {
        try {
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('usuario', usuario);
            formData.append('titulo', titulo);

            const response = await fetch(`${API_CONFIG.baseURL}/videos/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error subiendo video');
            }

            return { success: true, video: data.video };
        } catch (error) {
            console.error('Error subiendo video:', error);
            return { success: false, error: error.message };
        }
    },

    getVideos: async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/videos`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error obteniendo videos');
            }

            return { success: true, videos: data.videos };
        } catch (error) {
            console.error('Error obteniendo videos:', error);
            return { success: false, error: error.message };
        }
    },

    getVideoComments: async (videoId) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/videos/${videoId}/comentarios`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error obteniendo comentarios');
            }

            return { success: true, comentarios: data.comentarios };
        } catch (error) {
            console.error('Error obteniendo comentarios:', error);
            return { success: false, error: error.message };
        }
    },

    addVideoComment: async (videoId, usuario, contenido) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/videos/${videoId}/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contenido })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error agregando comentario');
            }

            return { success: true, comentario: data.comentario };
        } catch (error) {
            console.error('Error agregando comentario:', error);
            return { success: false, error: error.message };
        }
    },

    toggleVideoLike: async (videoId, usuario) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/videos/${videoId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error dando like');
            }

            return { success: true, liked: data.liked };
        } catch (error) {
            console.error('Error dando like:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // RULETA
    // ============================================

    getRouletteBalance: async (usuario) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/roulette/${encodeURIComponent(usuario)}/saldo`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error obteniendo saldo');
            }

            return { success: true, saldo: data.saldo, ultimo_colecta: data.ultimo_colecta };
        } catch (error) {
            console.error('Error obteniendo saldo:', error);
            return { success: false, error: error.message };
        }
    },

    collectRouletteCoins: async (usuario) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/roulette/${encodeURIComponent(usuario)}/colectar`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                return { 
                    success: false, 
                    error: data.error || 'Error colectando monedas',
                    tiempoRestante: data.tiempoRestante
                };
            }

            return { success: true, saldo: data.saldo };
        } catch (error) {
            console.error('Error colectando monedas:', error);
            return { success: false, error: error.message };
        }
    },

    betRoulette: async (usuario, monto, gano) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/roulette/${encodeURIComponent(usuario)}/apostar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto, gano })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error apostando');
            }

            return { success: true, saldo: data.saldo };
        } catch (error) {
            console.error('Error apostando:', error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // SEGUIDORES
    // ============================================

    followUser: async (usuario, seguidor) => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/users/${encodeURIComponent(usuario)}/seguir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seguidor })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error siguiendo usuario');
            }

            return { success: true };
        } catch (error) {
            console.error('Error siguiendo usuario:', error);
            return { success: false, error: error.message };
        }
    },

    unfollowUser: async (usuario, seguidor) => {
        try {
            const response = await fetch(
                `${API_CONFIG.baseURL}/users/${encodeURIComponent(usuario)}/seguir?seguidor=${encodeURIComponent(seguidor)}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error dejando de seguir');
            }

            return { success: true };
        } catch (error) {
            console.error('Error dejando de seguir:', error);
            return { success: false, error: error.message };
        }
    }
};

// Utilidad para verificar conectividad con el servidor
API.checkConnection = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch(`${API_CONFIG.baseURL}/videos`, {
            signal: controller.signal,
            method: 'HEAD'
        });

        clearTimeout(timeoutId);
        return true;
    } catch (error) {
        return false;
    }
};

// Modo híbrido: intentar usar API, fallback a localStorage
const HybridDB = {
    useAPI: false,

    async init() {
        this.useAPI = await API.checkConnection();
        console.log('🔌 Conectado al backend:', this.useAPI ? '✅ Sí' : '❌ No (usando localStorage)');
        return this.useAPI;
    },

    // Métodos de autenticación híbridos
    async register(nombreusuario, contrasena) {
        if (this.useAPI) {
            return await API.register(nombreusuario, contrasena);
        }
        // Fallback a localStorage
        const users = DB.getUsers();
        if (users.find(u => u.username.toLowerCase() === nombreusuario.toLowerCase())) {
            return { success: false, error: 'Este nombre de usuario ya está en uso' };
        }
        const rooms = ['Global', 'Musica', 'Gaming', 'Deportes', 'Comida'];
        const avatares = ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁'];
        const newUser = {
            id: Date.now().toString(),
            username: nombreusuario,
            password: contrasena,
            room: rooms[Math.floor(Math.random() * rooms.length)],
            avatar: avatares[Math.floor(Math.random() * avatares.length)],
            createdAt: new Date().toISOString()
        };
        DB.saveUser(newUser);
        return { success: true, user: { nombreusuario: newUser.username, avatar: newUser.avatar, sala: newUser.room } };
    },

    async login(nombreusuario, contrasena) {
        if (this.useAPI) {
            return await API.login(nombreusuario, contrasena);
        }
        // Fallback a localStorage
        const user = DB.getUserByUsername(nombreusuario);
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }
        if (user.password !== contrasena) {
            return { success: false, error: 'Contraseña incorrecta' };
        }
        return { success: true, user: { nombreusuario: user.username, avatar: user.avatar, sala: user.room } };
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, API_CONFIG, HybridDB };
}
