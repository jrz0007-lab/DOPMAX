/**
 * DOPMAX - Cliente de Base de Datos Unificado
 * Maneja usuarios, mensajes y chats con PostgreSQL en Render
 * Funciona entre diferentes sistemas operativos
 */

// Configuración
const DB_CONFIG = {
    baseURL: '/api',
    timeout: 10000,
    useLocalStorage: false // Se detectará automáticamente
};

// Detectar si estamos en producción (Render) - usar window.isProduction si existe
const isProduction = typeof window.isProduction !== 'undefined' 
    ? window.isProduction 
    : (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

// ============================================
// CLIENTE DE BASE DE DATOS
// ============================================

const DBClient = {
    // Estado inicial
    currentUser: null,
    connected: false,

    // Inicializar conexión
    async init() {
        console.log('🔄 Inicializando DBClient...');
        
        // Verificar conectividad con el backend
        this.connected = await this.checkConnection();
        DB_CONFIG.useLocalStorage = !this.connected;
        
        console.log('🌐 Modo:', this.connected ? '✅ PostgreSQL (Render)' : '⚠️ localStorage (offline)');
        
        // Intentar restaurar sesión
        await this.restoreSession();
        
        return this.connected;
    },

    // Verificar conexión con el servidor
    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            // Usar GET en lugar de HEAD para mejor compatibilidad
            const response = await fetch(`${DB_CONFIG.baseURL}/videos`, {
                signal: controller.signal,
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            clearTimeout(timeoutId);
            
            // Si responde (200, 201, 503, etc.), hay conexión
            const connected = response.status !== 404 && response.status !== 502 && response.status !== 503;
            
            if (connected) {
                console.log('✅ Conexión con el backend verificada');
            }
            
            return connected;
        } catch (error) {
            console.log('❌ No hay conexión con el backend:', error.message);
            return false;
        }
    },

    // Restaurar sesión del usuario
    async restoreSession() {
        const savedUser = localStorage.getItem('dopmax_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('👤 Sesión restaurada:', this.currentUser.username);
            } catch (e) {
                console.error('Error restaurando sesión:', e);
                localStorage.removeItem('dopmax_current_user');
            }
        }
    },

    // ============================================
    // AUTENTICACIÓN
    // ============================================

    async register(username, password) {
        // SIEMPRE intentar con la base de datos primero
        try {
            console.log('📝 Registrando usuario en BD:', username);
            
            const response = await fetch(`${DB_CONFIG.baseURL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreusuario: username,
                    contrasena: password
                })
            });

            const data = await response.json();
            console.log('Respuesta del registro:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Error en el registro');
            }

            this.currentUser = {
                id: data.user.nombreusuario,
                username: data.user.nombreusuario,
                avatar: data.user.avatar,
                room: data.user.sala,
                createdAt: data.user.created_at
            };

            localStorage.setItem('dopmax_current_user', JSON.stringify(this.currentUser));
            console.log('✅ Usuario registrado y guardado en BD:', this.currentUser.username);

            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('❌ Error en registro con BD:', error.message);
            // Solo fallback a localStorage si falla la BD
            console.log('⚠️ Usando fallback a localStorage');
            return this.registerLocal(username, password);
        }
    },

    async login(username, password) {
        // SIEMPRE intentar con la base de datos primero
        try {
            console.log('🔑 Login en BD:', username);
            
            const response = await fetch(`${DB_CONFIG.baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreusuario: username,
                    contrasena: password
                })
            });

            const data = await response.json();
            console.log('Respuesta del login:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Error en el login');
            }

            this.currentUser = {
                id: data.user.nombreusuario,
                username: data.user.nombreusuario,
                avatar: data.user.avatar,
                room: data.user.sala
            };

            localStorage.setItem('dopmax_current_user', JSON.stringify(this.currentUser));
            console.log('✅ Login exitoso en BD:', this.currentUser.username);

            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('❌ Error en login con BD:', error.message);
            // Solo fallback a localStorage si falla la BD
            console.log('⚠️ Usando fallback a localStorage');
            return this.loginLocal(username, password);
        }
    },

    async logout() {
        this.currentUser = null;
        localStorage.removeItem('dopmax_current_user');
        return { success: true };
    },

    getCurrentUser() {
        return this.currentUser;
    },

    // ============================================
    // USUARIOS
    // ============================================

    async getUserProfile(username) {
        if (this.connected) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(username)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo perfil');
                }

                return { success: true, user: data.user };
            } catch (error) {
                console.error('Error obteniendo perfil:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async searchUsers(query, exclude = '') {
        if (this.connected) {
            try {
                const response = await fetch(
                    `${DB_CONFIG.baseURL}/users/search/${encodeURIComponent(query)}?exclude=${encodeURIComponent(exclude)}`
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
        }
        return { success: false, error: 'No hay conexión' };
    },

    async followUser(usernameToFollow) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(usernameToFollow)}/seguir`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ seguidor: this.currentUser.username })
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
        }
        return { success: false, error: 'No hay conexión' };
    },

    async unfollowUser(usernameToUnfollow) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(
                    `${DB_CONFIG.baseURL}/users/${encodeURIComponent(usernameToUnfollow)}/seguir?seguidor=${encodeURIComponent(this.currentUser.username)}`,
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
        return { success: false, error: 'No hay conexión' };
    },

    // ============================================
    // CHATS Y MENSAJES
    // ============================================

    async getUserChats() {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/chats/${encodeURIComponent(this.currentUser.username)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo chats');
                }

                // Transformar formato de la BD al formato del frontend
                const chats = data.chats.map(chat => ({
                    id: chat.id.toString(),
                    userId: chat.otro_usuario,
                    name: chat.otro_usuario,
                    avatar: chat.otro_avatar || '👤',
                    lastMessage: chat.ultimo_mensaje || '',
                    time: chat.ultimo_mensaje_time ? this.formatMessageTime(chat.ultimo_mensaje_time) : '',
                    isUser: false
                }));

                return { success: true, chats };
            } catch (error) {
                console.error('Error obteniendo chats:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async createChat(otherUsername) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/chats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        usuario1: this.currentUser.username, 
                        usuario2: otherUsername 
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error creando chat');
                }

                return { success: true, chatId: data.chatId.toString() };
            } catch (error) {
                console.error('Error creando chat:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async getChatMessages(chatId) {
        if (this.connected) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/chats/${chatId}/mensajes`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo mensajes');
                }

                // Transformar formato de la BD al formato del frontend
                const mensajes = data.mensajes.map(msg => ({
                    text: msg.contenido,
                    sent: msg.remitente === this.currentUser?.username,
                    time: this.formatMessageTime(msg.created_at),
                    avatar: msg.avatar || '👤'
                }));

                return { success: true, mensajes };
            } catch (error) {
                console.error('Error obteniendo mensajes:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async sendMessage(chatId, content) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/chats/${chatId}/mensajes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        remitente: this.currentUser.username, 
                        contenido: content 
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error enviando mensaje');
                }

                return { 
                    success: true, 
                    mensaje: {
                        text: data.mensaje.contenido,
                        sent: true,
                        time: this.formatMessageTime(data.mensaje.created_at)
                    }
                };
            } catch (error) {
                console.error('Error enviando mensaje:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    // ============================================
    // VIDEOS
    // ============================================

    async getVideos() {
        if (this.connected) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/videos`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo videos');
                }

                return { success: true, videos: data.videos };
            } catch (error) {
                console.error('Error obteniendo videos:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async uploadVideo(videoFile, titulo = '') {
        if (this.connected && this.currentUser) {
            try {
                const formData = new FormData();
                formData.append('video', videoFile);
                formData.append('usuario', this.currentUser.username);
                formData.append('titulo', titulo);

                const response = await fetch(`${DB_CONFIG.baseURL}/videos/upload`, {
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
        }
        return { success: false, error: 'No hay conexión' };
    },

    async registerVideo(videoUrl, titulo = '') {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/videos/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        videoUrl: videoUrl,
                        usuario: this.currentUser.username,
                        titulo: titulo
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error registrando video');
                }

                console.log('✅ Video registrado:', data.video);
                return { success: true, video: data.video };
            } catch (error) {
                console.error('Error registrando video:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async getVideoComments(videoId) {
        if (this.connected) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/videos/${videoId}/comentarios`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo comentarios');
                }

                return { success: true, comentarios: data.comentarios };
            } catch (error) {
                console.error('Error obteniendo comentarios:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async addVideoComment(videoId, content) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/videos/${videoId}/comentarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        usuario: this.currentUser.username, 
                        contenido: content 
                    })
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
        }
        return { success: false, error: 'No hay conexión' };
    },

    async toggleVideoLike(videoId) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/videos/${videoId}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: this.currentUser.username })
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
        }
        return { success: false, error: 'No hay conexión' };
    },

    // ============================================
    // RULETA / CASINO
    // ============================================

    async getRouletteBalance() {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/roulette/${encodeURIComponent(this.currentUser.username)}/saldo`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo saldo');
                }

                return { success: true, saldo: data.saldo, ultimo_colecta: data.ultimo_colecta };
            } catch (error) {
                console.error('Error obteniendo saldo:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async collectRouletteCoins() {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/roulette/${encodeURIComponent(this.currentUser.username)}/colectar`, {
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
        }
        return { success: false, error: 'No hay conexión' };
    },

    async betRoulette(monto, gano) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/roulette/${encodeURIComponent(this.currentUser.username)}/apostar`, {
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
        }
        return { success: false, error: 'No hay conexión' };
    },

    // ============================================
    // GATO CLICKER
    // ============================================

    async getGatoClicks() {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/gato/${encodeURIComponent(this.currentUser.username)}/clicks`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo clicks');
                }

                return { success: true, clicks: data.clicks };
            } catch (error) {
                console.error('Error obteniendo clicks:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async saveGatoClicks(clicks) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/gato/${encodeURIComponent(this.currentUser.username)}/clicks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clicks })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error guardando clicks');
                }

                return { success: true, clicks: data.clicks };
            } catch (error) {
                console.error('Error guardando clicks:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    // ============================================
    // CONFIGURACIÓN DE USUARIO
    // ============================================

    async updatePrivacy(cuenta_privada, permitir_mensajes, permitir_comentarios) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/privacy`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cuenta_privada, permitir_mensajes, permitir_comentarios })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error actualizando privacidad');
                }

                return { success: true };
            } catch (error) {
                console.error('Error actualizando privacidad:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async updateFoto(foto_url) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/foto`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ foto_url })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error actualizando foto');
                }

                return { success: true };
            } catch (error) {
                console.error('Error actualizando foto:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async getPerfil(username) {
        if (this.connected) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(username)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo perfil');
                }

                return { success: true, perfil: data.user };
            } catch (error) {
                console.error('Error obteniendo perfil:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async bloquearUsuario(usuario_bloqueado) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/bloquear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_bloqueado })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error bloqueando usuario');
                }

                return { success: true };
            } catch (error) {
                console.error('Error bloqueando usuario:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async desbloquearUsuario(usuario_bloqueado) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/bloquear/${encodeURIComponent(usuario_bloqueado)}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error desbloqueando usuario');
                }

                return { success: true };
            } catch (error) {
                console.error('Error desbloqueando usuario:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async getBloqueados() {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/bloqueados`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo bloqueados');
                }

                return { success: true, bloqueados: data.bloqueados };
            } catch (error) {
                console.error('Error obteniendo bloqueados:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async updatePreferencias(prefs) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/preferencias`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(prefs)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error actualizando preferencias');
                }

                return { success: true };
            } catch (error) {
                console.error('Error actualizando preferencias:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async getPreferencias() {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/preferencias`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo preferencias');
                }

                return { success: true, preferencias: data.preferencias };
            } catch (error) {
                console.error('Error obteniendo preferencias:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async registrarTiempo(minutos) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/tiempo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ minutos })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error registrando tiempo');
                }

                return { success: true };
            } catch (error) {
                console.error('Error registrando tiempo:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async getTiempoUso() {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(this.currentUser.username)}/tiempo`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error obteniendo tiempo de uso');
                }

                return { success: true, tiempo_uso: data.tiempo_uso };
            } catch (error) {
                console.error('Error obteniendo tiempo de uso:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    async estaBloqueado(otro_usuario) {
        if (this.connected && this.currentUser) {
            try {
                const response = await fetch(`${DB_CONFIG.baseURL}/users/${encodeURIComponent(otro_usuario)}/esta-bloqueado/${encodeURIComponent(this.currentUser.username)}`);
                const data = await response.json();

                return { success: true, bloqueado: data.bloqueado };
            } catch (error) {
                console.error('Error verificando bloqueo:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'No hay conexión' };
    },

    // ============================================
    // UTILIDADES
    // ============================================

    formatMessageTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `hace ${minutes}m`;
        if (hours < 24) return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        if (days < 7) return `hace ${days}d`;
        
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    },

    // ============================================
    // FALLBACK LOCAL (para desarrollo sin backend)
    // ============================================

    registerLocal(username, password) {
        const users = JSON.parse(localStorage.getItem('dopmax_users') || '[]');
        
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, error: 'Este nombre de usuario ya está en uso' };
        }

        const rooms = ['Global', 'Musica', 'Gaming', 'Deportes', 'Comida'];
        const avatares = ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁'];
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: password,
            room: rooms[Math.floor(Math.random() * rooms.length)],
            avatar: avatares[Math.floor(Math.random() * avatares.length)],
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('dopmax_users', JSON.stringify(users));
        
        this.currentUser = {
            id: newUser.id,
            username: newUser.username,
            avatar: newUser.avatar,
            room: newUser.room
        };
        
        localStorage.setItem('dopmax_current_user', JSON.stringify(this.currentUser));
        
        return { success: true, user: this.currentUser };
    },

    loginLocal(username, password) {
        const users = JSON.parse(localStorage.getItem('dopmax_users') || '[]');
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }
        
        if (user.password !== password) {
            return { success: false, error: 'Contraseña incorrecta' };
        }

        this.currentUser = {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            room: user.room
        };
        
        localStorage.setItem('dopmax_current_user', JSON.stringify(this.currentUser));
        
        return { success: true, user: this.currentUser };
    }
};

// Exportar para uso global
window.DBClient = DBClient;
window.isProduction = isProduction;

console.log('📦 DBClient.js cargado');
