// DOPMAX - Script with Authentication and Dynamic Chat Rooms

// Database functions using localStorage
const DB = {
    getUsers: () => {
        const users = localStorage.getItem('dopmax_users');
        return users ? JSON.parse(users) : [];
    },

    saveUser: (user) => {
        const users = DB.getUsers();
        users.push(user);
        localStorage.setItem('dopmax_users', JSON.stringify(users));
    },

    getUserByUsername: (username) => {
        const users = DB.getUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    },

    updateUser: (updatedUser) => {
        const users = DB.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('dopmax_users', JSON.stringify(users));
        }
    },

    getCurrentUser: () => {
        const current = localStorage.getItem('dopmax_current_user');
        return current ? JSON.parse(current) : null;
    },

    setCurrentUser: (user) => {
        if (user) {
            localStorage.setItem('dopmax_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('dopmax_current_user');
        }
    },

    searchUsers: (query, currentUserId) => {
        const users = DB.getUsers();
        return users
            .filter(u => u.id !== currentUserId && u.username.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10);
    },

    // Sistema de comentarios por video
    getVideoComments: (videoId) => {
        const comments = localStorage.getItem('dopmax_comments_' + videoId);
        return comments ? JSON.parse(comments) : [];
    },

    saveVideoComment: (videoId, comment) => {
        const comments = DB.getVideoComments(videoId);
        comments.push(comment);
        localStorage.setItem('dopmax_comments_' + videoId, JSON.stringify(comments));
    },

    // Sistema de ruleta
    getRouletteBalance: () => {
        const user = DB.getCurrentUser();
        if (!user) return 5000;
        
        // Admin users get 10 million
        if (user.username.endsWith('_admin')) {
            const balance = localStorage.getItem('dopmax_roulette_balance_' + user.id);
            return balance ? parseInt(balance) : 10000000;
        }
        
        const balance = localStorage.getItem('dopmax_roulette_balance_' + user.id);
        return balance ? parseInt(balance) : 5000;
    },

    setRouletteBalance: (balance) => {
        const user = DB.getCurrentUser();
        if (!user) return;
        
        localStorage.setItem('dopmax_roulette_balance_' + user.id, balance.toString());
    },

    addRouletteBalance: (amount) => {
        const user = DB.getCurrentUser();
        if (!user) return;
        
        const current = DB.getRouletteBalance();
        const newBalance = current + amount;
        localStorage.setItem('dopmax_roulette_balance_' + user.id, newBalance.toString());
        console.log('Balance actualizado:', current, '+', amount, '=', newBalance);
    },

    getLastCollectTime: () => {
        const user = DB.getCurrentUser();
        if (!user) return 0;
        const time = localStorage.getItem('dopmax_last_collect_' + user.id);
        return time ? parseInt(time) : 0;
    },

    setLastCollectTime: () => {
        const user = DB.getCurrentUser();
        if (!user) return;
        localStorage.setItem('dopmax_last_collect_' + user.id, Date.now().toString());
    },

    initBots: () => {
        const botNames = [
            { name: 'María García', avatar: '👩' },
            { name: 'Carlos López', avatar: '👨' },
            { name: 'Laura Martín', avatar: '👧' },
            { name: 'David Rodríguez', avatar: '👦' },
            { name: 'Ana Sánchez', avatar: '👩' },
            { name: 'Pedro González', avatar: '🧔' },
            { name: 'Sofía Hernández', avatar: '👵' },
            { name: 'Miguel Díaz', avatar: '👮' },
            { name: 'Elena Torres', avatar: '💃' },
            { name: 'Javier Ruiz', avatar: '🕺' }
        ];

        const fakeComments = [
            '¡Me encanta! 🔥',
            'Esto es increíble 😍',
            '¿Alguien más viendo esto en 2024?',
            'No puedo parar de verlo 😂',
            '¡Qué bueno! 👏',
            'Necesito más contenido así',
            '¡Brutal! 💯',
            'Me tiene loco esto 🤯',
            'El mejor video que he visto hoy',
            '¡Repetir! 🔁',
            'Esto merece más likes 👍',
            '¡Guau! 😮',
            'Compartiendo con todos mis amigos',
            '¡Calidad! ✨',
            'No me lo esperaba 🙈'
        ];

        // Inicializar comentarios para cada video SIEMPRE
        const videos = ['video1', 'video2', 'video3'];
        videos.forEach(videoId => {
            let existingComments = DB.getVideoComments(videoId);
            
            // Si no hay comentarios, crear iniciales
            if (!existingComments || existingComments.length === 0) {
                const numComments = 3 + Math.floor(Math.random() * 3);
                const shuffledBots = [...botNames].sort(() => Math.random() - 0.5);
                const shuffledComments = [...fakeComments].sort(() => Math.random() - 0.5);
                
                for (let i = 0; i < numComments; i++) {
                    const bot = shuffledBots[i % shuffledBots.length];
                    const commentText = shuffledComments[i % shuffledComments.length];
                    const now = new Date();
                    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                    
                    DB.saveVideoComment(videoId, {
                        id: 'bot_' + videoId + '_' + i,
                        username: bot.name,
                        avatar: bot.avatar,
                        text: commentText,
                        time: time,
                        isBot: true
                    });
                }
            }
        });
        
        console.log('Bots inicializados correctamente');
    },

    initDefaultUsers: () => {
        const users = DB.getUsers();
        if (users.length > 0) return; // Ya hay usuarios

        // Lista de fotos de perfil aleatorias (usando picsum.photos para demos)
        const defaultPhotos = [
            'https://picsum.photos/seed/user1/200/200',
            'https://picsum.photos/seed/user2/200/200',
            'https://picsum.photos/seed/user3/200/200',
            'https://picsum.photos/seed/user4/200/200',
            'https://picsum.photos/seed/user5/200/200',
            'https://picsum.photos/seed/user6/200/200',
            'https://picsum.photos/seed/user7/200/200',
            'https://picsum.photos/seed/user8/200/200',
            'https://picsum.photos/seed/user9/200/200',
            'https://picsum.photos/seed/user10/200/200',
            'https://picsum.photos/seed/user11/200/200'
        ];

        const defaultUsers = [
            { id: '0', username: 'rafa', password: '1234', room: 'Global', avatar: 'R', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[0] },
            { id: '1', username: 'maria_gomez', password: '1234', room: 'Global', avatar: 'M', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[1] },
            { id: '2', username: 'carlos_99', password: '1234', room: 'Global', avatar: 'C', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[2] },
            { id: '3', username: 'lucia_fernandez', password: '1234', room: 'Global', avatar: 'L', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[3] },
            { id: '4', username: 'pedro_sanchez', password: '1234', room: 'Musica', avatar: 'P', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[4] },
            { id: '5', username: 'ana_lopez', password: '1234', room: 'Musica', avatar: 'A', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[5] },
            { id: '6', username: 'dj_ricardo', password: '1234', room: 'Musica', avatar: 'D', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[6] },
            { id: '7', username: 'guitarhero', password: '1234', room: 'Musica', avatar: 'G', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[7] },
            { id: '8', username: 'sofia_music', password: '1234', room: 'Musica', avatar: 'S', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[8] },
            { id: '9', username: 'laura_artist', password: '1234', room: 'Musica', avatar: 'R', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[9] },
            { id: '10', username: 'chefmaster', password: '1234', room: 'Global', avatar: 'H', createdAt: new Date().toISOString(), foto_perfil: defaultPhotos[10] }
        ];

        defaultUsers.forEach(user => {
            DB.saveUser(user);
            // Guardar foto de perfil en localStorage para cada usuario
            if (user.foto_perfil) {
                localStorage.setItem('dopmax_foto_perfil_' + user.username, user.foto_perfil);
            }
        });
    },

    getChatsForRoom: (roomName) => {
        const chats = localStorage.getItem('dopmax_chats_' + roomName);
        return chats ? JSON.parse(chats) : DB.getDefaultChats(roomName);
    },

    saveChatsForRoom: (roomName, chats) => {
        localStorage.setItem('dopmax_chats_' + roomName, JSON.stringify(chats));
    },

    getDefaultChats: (roomName) => {
        const chatSets = {
            'Global': [
                { id: 1, name: 'Maria Gomez', avatar: '👩', lastMessage: '¡Hola! ¿Qué tal estás?', time: '10:30', isUser: false },
                { id: 2, name: 'Carlos 99', avatar: '👨', lastMessage: '¿Cuándo subes el próximo video?', time: '09:15', isUser: false },
                { id: 3, name: 'Lucia Fernandez', avatar: '👧', lastMessage: 'Me encantó tu último contenido 🔥', time: 'Ayer', isUser: false },
                { id: 4, name: 'Pedro Sanchez', avatar: '👦', lastMessage: 'Gracias por el follow!', time: 'Ayer', isUser: false },
                { id: 5, name: 'Ana Lopez', avatar: '👩', lastMessage: 'Oye, ¿me puedes ayudar con...?', time: 'Lun', isUser: false }
            ],
            'Musica': [
                { id: 6, name: 'DJ_Ricardo', avatar: '🎧', lastMessage: '¡Esa canción está increíble!', time: '11:00', isUser: false },
                { id: 7, name: 'GuitarHero', avatar: '🎸', lastMessage: '¿Vamos a jam session?', time: '10:45', isUser: false },
                { id: 8, name: 'PianoMaster', avatar: '🎹', lastMessage: 'Te mando la partitura', time: '09:30', isUser: false },
                { id: 9, name: 'BassLine', avatar: '🎵', lastMessage: 'El ritmo está perfecto', time: 'Ayer', isUser: false }
            ]
        };
        return chatSets[roomName] || chatSets['Global'];
    },

    getUserChats: (currentUserId) => {
        const key = 'dopmax_user_chats_' + currentUserId;
        const chats = localStorage.getItem(key);
        return chats ? JSON.parse(chats) : [];
    },

    saveUserChat: (currentUserId, chat) => {
        const key = 'dopmax_user_chats_' + currentUserId;
        let chats = DB.getUserChats(currentUserId);
        const existingIndex = chats.findIndex(c => c.userId === chat.userId);
        if (existingIndex !== -1) {
            chats[existingIndex] = chat;
        } else {
            chats.push(chat);
        }
        localStorage.setItem(key, JSON.stringify(chats));
    },

    getMessagesForChat: (chatId, roomName, isUserChat = false, currentUserId = null) => {
        let key;
        if (isUserChat && currentUserId) {
            key = 'dopmax_messages_user_' + currentUserId + '_' + chatId;
        } else {
            key = 'dopmax_messages_' + roomName + '_' + chatId;
        }
        const messages = localStorage.getItem(key);
        return messages ? JSON.parse(messages) : DB.getDefaultMessages(chatId);
    },

    saveMessage: (chatId, roomName, message, isUserChat = false, currentUserId = null) => {
        let key;
        if (isUserChat && currentUserId) {
            key = 'dopmax_messages_user_' + currentUserId + '_' + chatId;
        } else {
            key = 'dopmax_messages_' + roomName + '_' + chatId;
        }
        let messages = localStorage.getItem(key);
        messages = messages ? JSON.parse(messages) : [];
        messages.push(message);
        localStorage.setItem(key, JSON.stringify(messages));
    },

    getDefaultMessages: (chatId) => {
        const defaultMessages = {
            1: [
                { text: '¡Hola! ¿Qué tal estás?', sent: false, time: '10:30' },
                { text: 'Todo bien, ¿y tú?', sent: true, time: '10:31' },
                { text: 'Genial! ¿Viste el nuevo video?', sent: false, time: '10:32' }
            ],
            2: [
                { text: '¿Cuándo subes el próximo video?', sent: false, time: '09:15' },
                { text: 'Pronto! Estoy editando', sent: true, time: '09:20' }
            ],
            6: [
                { text: '¡Esa canción está increíble!', sent: false, time: '11:00' },
                { text: 'Gracias! Me inspiré en ti', sent: true, time: '11:05' }
            ],
            10: [
                { text: '¿Partida hoy?', sent: false, time: '12:00' },
                { text: 'Claro! A las 8?', sent: true, time: '12:05' }
            ]
        };
        return defaultMessages[chatId] || [
            { text: 'Hola!', sent: false, time: '10:00' },
            { text: 'Hola, ¿qué tal?', sent: true, time: '10:01' }
        ];
    },
    
    getUserRoom: (username) => {
        const user = DB.getUserByUsername(username);
        return user ? user.room : 'Global';
    },
    
    assignRoom: (username) => {
        const rooms = ['Global', 'Musica'];
        const user = DB.getUserByUsername(username);
        if (user) {
            const roomIndex = rooms.indexOf(user.room);
            const nextRoom = rooms[(roomIndex + 1) % rooms.length];
            user.room = nextRoom;
            DB.updateUser(user);
            return nextRoom;
        }
        return 'Global';
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Quitar pantalla de carga inmediatamente
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }

        // Detectar si estamos en producción (Render) - usar variable global
        console.log('🌐 Modo:', isProduction ? 'Producción (API)' : 'Desarrollo (localStorage)');

        // IMPORTANTE: Inicializar DBClient para conectar con la base de datos (NO BLOQUEAR)
        if (typeof DBClient !== 'undefined') {
            console.log('🔄 Inicializando DBClient...');
            DBClient.init().then(() => {
                console.log('✅ DBClient inicializado. Conectado:', DBClient.connected);
            }).catch(err => {
                console.log('⚠️ DBClient init error (usando fallback):', err.message);
            });
        } else {
            console.log('⚠️ DBClient no disponible');
        }

        // Initialize default users and bots (solo para fallback local)
        DB.initDefaultUsers();
        DB.initBots();

        // Check if user is logged in
        const currentUser = DB.getCurrentUser();
        if (currentUser) {
            // Usuario ya logueado, inicializar app
            setTimeout(async () => {
                try {
                    await initializeApp(currentUser);
                } catch(e) {
                    console.error('Error al inicializar usuario:', e);
                    showAuthScreen();
                }
            }, 100);
        } else {
            // No hay usuario logueado, mostrar auth
            showAuthScreen();

            // Initialize comment events
            setTimeout(() => {
                try { initCommentEvents(); } catch(e) { console.log('Comment events error:', e); }
            }, 100);
        }

        // Disable context menu and copy/paste
        document.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });
        document.addEventListener('copy', (e) => { e.preventDefault(); return false; });
        document.addEventListener('cut', (e) => { e.preventDefault(); return false; });
        document.addEventListener('paste', (e) => {
            const allowed = ['comment-input', 'chat-input', 'login-username', 'login-password', 'register-username', 'register-password', 'register-confirm', 'foto-url-input'];
            if (e.target.id && allowed.includes(e.target.id)) return;
            e.preventDefault(); return false;
        });
        document.addEventListener('keydown', (e) => {
            const allowed = ['comment-input', 'chat-input', 'login-username', 'login-password', 'register-username', 'register-password', 'register-confirm', 'foto-url-input'];
            if (e.target.id && allowed.includes(e.target.id)) return;
            if ((e.ctrlKey || e.metaKey) && ['c','v','x','a'].includes(e.key.toLowerCase())) {
                e.preventDefault(); return false;
            }
        });

        // Auth form handlers
        setupAuthHandlers();

    } catch(error) {
        console.error('Error inicializando app:', error);
        showAuthScreen();
    }
});

// Setup auth handlers
function setupAuthHandlers() {
    try {
        document.getElementById('show-register')?.addEventListener('click', () => {
            document.getElementById('login-form')?.classList?.add('hidden');
            document.getElementById('register-form')?.classList?.remove('hidden');
            document.getElementById('register-error')?.classList?.add('hidden');
        });

        document.getElementById('show-login')?.addEventListener('click', () => {
            document.getElementById('register-form')?.classList?.add('hidden');
            document.getElementById('login-form')?.classList?.remove('hidden');
            document.getElementById('login-error')?.classList?.add('hidden');
        });

        document.getElementById('login-btn')?.addEventListener('click', handleLogin);
        document.getElementById('register-btn')?.addEventListener('click', handleRegister);

        document.getElementById('login-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });

        document.getElementById('register-confirm')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleRegister();
        });

        document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
        document.getElementById('logout-settings')?.addEventListener('click', handleLogout);
    } catch(e) {
        console.log('Auth setup error:', e);
    }
}

// Setup Profile Settings
async function setupProfileSettings() {
    try {
        const currentUser = DB.getCurrentUser();
        if (!currentUser) return;

        // Botones de modales
        const btnPrivacidad = document.getElementById('btn-privacidad');
        const btnFotoPerfil = document.getElementById('btn-foto-perfil');
        const btnBloqueadas = document.getElementById('btn-bloqueadas');
        const btnTiempo = document.getElementById('btn-tiempo');
        const btnPreferencias = document.getElementById('btn-preferencias');
        const btnEmpresa = document.getElementById('btn-empresa');

        // Modales
        const modalFotoPerfil = document.getElementById('modal-foto-perfil');
        const modalTiempo = document.getElementById('modal-tiempo');
        const modalBloqueadas = document.getElementById('modal-bloqueadas');
        const modalPrivacidad = document.getElementById('modal-privacidad');
        const modalPreferencias = document.getElementById('modal-preferencias');
        const modalEmpresa = document.getElementById('modal-empresa');

        // Abrir modal Foto de Perfil - Ahora usa DBClient
        if (btnFotoPerfil && modalFotoPerfil) {
            btnFotoPerfil.addEventListener('click', () => {
                modalFotoPerfil.classList.remove('hidden');
            });
            document.getElementById('close-foto-perfil')?.addEventListener('click', () => {
                modalFotoPerfil.classList.add('hidden');
            });
            document.getElementById('guardar-foto')?.addEventListener('click', async () => {
                let url = document.getElementById('foto-url-input').value.trim();

                // Convertir URL de Imgur a URL directa si es necesario
                if (url.includes('imgur.com/') && !url.includes('i.imgur.com/')) {
                    url = url.replace('imgur.com/', 'i.imgur.com/');
                    if (!url.endsWith('.jpg') && !url.endsWith('.png') && !url.endsWith('.jpeg')) {
                        url = url + '.jpg';
                    }
                }

                if (url && isValidImageUrl(url)) {
                    // Intentar guardar en BD primero
                    const result = await DBClient.updateFoto(url);

                    // Guardar SIEMPRE en localStorage (funcione o no la BD)
                    localStorage.setItem('dopmax_foto_perfil_' + currentUser.username, url);
                    actualizarFotoPerfil(currentUser.username, url);
                    modalFotoPerfil.classList.add('hidden');
                    document.getElementById('foto-url-input').value = '';

                    console.log('✅ Foto de perfil actualizada:', url);

                    // Solo mostrar error si falla la BD (pero la foto ya está guardada localmente)
                    if (!result.success) {
                        console.log('Foto guardada localmente (BD no disponible):', result.error);
                    }
                } else {
                    alert('Introduce una URL de imagen válida (ej: https://i.imgur.com/imagen.png o https://picsum.photos/200/200)');
                }
            });
        }

        // Abrir modal Tiempo en Pantalla - Con estadísticas de BD
        if (btnTiempo && modalTiempo) {
            btnTiempo.addEventListener('click', async () => {
                await actualizarTiempoPantalla();
                modalTiempo.classList.remove('hidden');
            });
            document.getElementById('close-tiempo')?.addEventListener('click', () => {
                modalTiempo.classList.add('hidden');
            });
        }

        // Abrir modal Cuentas Bloqueadas - Ahora usa DB
        if (btnBloqueadas && modalBloqueadas) {
            btnBloqueadas.addEventListener('click', async () => {
                await cargarCuentasBloqueadas();
                modalBloqueadas.classList.remove('hidden');
            });
            document.getElementById('close-bloqueadas')?.addEventListener('click', () => {
                modalBloqueadas.classList.add('hidden');
            });
        }

        // Abrir modal Privacidad - Ahora guarda en BD
        if (btnPrivacidad && modalPrivacidad) {
            btnPrivacidad.addEventListener('click', async () => {
                await cargarPrivacidad(currentUser.username);
                modalPrivacidad.classList.remove('hidden');
            });
            document.getElementById('close-privacidad')?.addEventListener('click', () => {
                modalPrivacidad.classList.add('hidden');
            });
            document.getElementById('guardar-privacidad')?.addEventListener('click', async () => {
                await guardarPrivacidad(currentUser.username);
                modalPrivacidad.classList.add('hidden');
            });
        }

        // Abrir modal Preferencias - Ahora guarda en BD
        if (btnPreferencias && modalPreferencias) {
            btnPreferencias.addEventListener('click', async () => {
                await cargarPreferencias(currentUser.username);
                modalPreferencias.classList.remove('hidden');
            });
            document.getElementById('close-preferencias')?.addEventListener('click', () => {
                modalPreferencias.classList.add('hidden');
            });
            document.getElementById('guardar-preferencias')?.addEventListener('click', async () => {
                await guardarPreferencias(currentUser.username);
                modalPreferencias.classList.add('hidden');
            });
        }

        // Abrir modal Empresa (solo para _admin) - Mostrar solo si es admin
        if (btnEmpresa && modalEmpresa) {
            // Mostrar botón solo si es admin
            if (currentUser.username.endsWith('_admin')) {
                btnEmpresa.classList.remove('hidden');
            }
            
            btnEmpresa.addEventListener('click', () => {
                modalEmpresa.classList.remove('hidden');
            });
            document.getElementById('close-empresa')?.addEventListener('click', () => {
                modalEmpresa.classList.add('hidden');
            });
            document.getElementById('activar-empresa')?.addEventListener('click', async () => {
                modalEmpresa.classList.add('hidden');
            });
        }

        // Cerrar modales al hacer click fuera
        [modalFotoPerfil, modalTiempo, modalBloqueadas, modalPrivacidad, modalPreferencias, modalEmpresa].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.add('hidden');
                    }
                });
            }
        });

    } catch(e) {
        console.log('Profile settings error:', e);
    }
}

function isValidImageUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://');
}

function actualizarFotoPerfil(username, url) {
    // Actualizar foto grande del perfil
    const profilePicLarge = document.querySelector('.profile-pic-large');
    if (profilePicLarge) {
        profilePicLarge.classList.add('has-image');
        profilePicLarge.style.background = `url(${url}) no-repeat center center`;
        profilePicLarge.style.backgroundSize = 'cover';
        profilePicLarge.textContent = '';
    }

    // Actualizar avatares en la navegación inferior
    const profileAvatars = document.querySelectorAll('.profile-avatar');
    profileAvatars.forEach(avatar => {
        avatar.classList.add('has-image');
        avatar.style.background = `url(${url}) no-repeat center center`;
        avatar.style.backgroundSize = 'cover';
        avatar.textContent = '';
    });

    // Guardar en localStorage para persistencia
    localStorage.setItem('dopmax_foto_perfil_' + username, url);
}

// Cargar foto de perfil al iniciar la app
async function cargarFotoPerfil(username) {
    // Primero intentar obtener desde la base de datos
    let savedFoto = localStorage.getItem('dopmax_foto_perfil_' + username);
    
    // Si no hay en localStorage, intentar obtener de la BD
    if (!savedFoto && typeof DBClient !== 'undefined' && DBClient.connected) {
        try {
            const result = await DBClient.getPerfil(username);
            if (result.success && result.perfil && result.perfil.foto_perfil) {
                savedFoto = result.perfil.foto_perfil;
                // Guardar en localStorage para futuras cargas
                localStorage.setItem('dopmax_foto_perfil_' + username, savedFoto);
                console.log('📥 Foto cargada desde BD:', savedFoto);
            }
        } catch (err) {
            console.log('No se pudo cargar foto desde BD:', err.message);
        }
    }
    
    console.log('🖼️ Cargando foto de perfil para', username, ':', savedFoto);
    
    if (savedFoto) {
        const profilePicLarge = document.querySelector('.profile-pic-large');
        if (profilePicLarge) {
            profilePicLarge.classList.add('has-image');
            profilePicLarge.style.background = `url(${savedFoto}) no-repeat center center`;
            profilePicLarge.style.backgroundSize = 'cover';
            profilePicLarge.textContent = '';
            console.log('✅ Foto aplicada en profile-pic-large');
        }

        const profileAvatars = document.querySelectorAll('.profile-avatar');
        profileAvatars.forEach(avatar => {
            avatar.classList.add('has-image');
            avatar.style.background = `url(${savedFoto}) no-repeat center center`;
            avatar.style.backgroundSize = 'cover';
            avatar.textContent = '';
            console.log('✅ Foto aplicada en profile-avatar');
        });
    } else {
        console.log('⚠️ No hay foto guardada para', username);
    }
}

async function actualizarTiempoPantalla() {
    // Intentar obtener datos de la BD
    let tiempoHoy = 0, tiempoSemana = 0, tiempoMes = 0;

    if (typeof DBClient !== 'undefined') {
        const result = await DBClient.getTiempoUso();
        if (result.success && result.tiempo_uso) {
            const hoy = new Date().toISOString().split('T')[0];
            const usoHoy = result.tiempo_uso.find(t => t.fecha === hoy);
            tiempoHoy = usoHoy ? parseInt(usoHoy.minutos) : 0;
            tiempoSemana = result.tiempo_uso.slice(0, 7).reduce((sum, t) => sum + parseInt(t.minutos), 0);
            tiempoMes = result.tiempo_uso.reduce((sum, t) => sum + parseInt(t.minutos), 0);
        }
    } else {
        // Fallback a localStorage
        const now = Date.now();
        const sessionStart = parseInt(localStorage.getItem('dopmax_session_start') || now.toString());
        tiempoHoy = Math.floor((now - sessionStart) / 60000);
        tiempoSemana = tiempoHoy + Math.floor(Math.random() * 120);
        tiempoMes = tiempoSemana * 4 + Math.floor(Math.random() * 500);
    }

    const hoyH = Math.floor(tiempoHoy / 60);
    const hoyM = tiempoHoy % 60;
    const semanaH = Math.floor(tiempoSemana / 60);
    const semanaM = tiempoSemana % 60;
    const mesH = Math.floor(tiempoMes / 60);
    const mesM = tiempoMes % 60;

    const tiempoHoyEl = document.getElementById('tiempo-hoy');
    const tiempoSemanaEl = document.getElementById('tiempo-semana');
    const tiempoMesEl = document.getElementById('tiempo-mes');

    if (tiempoHoyEl) tiempoHoyEl.textContent = `${hoyH}h ${hoyM}m`;
    if (tiempoSemanaEl) tiempoSemanaEl.textContent = `${semanaH}h ${semanaM}m`;
    if (tiempoMesEl) tiempoMesEl.textContent = `${mesH}h ${mesM}m`;

    // AVISO DE SALUD si ha usado más de 2 horas hoy
    if (tiempoHoy > 120) {
        setTimeout(() => {
            alert('⚠️ RECOMENDACIÓN DE SALUD\n\nLlevas más de 2 horas usando DOPMAX hoy.\n\nTe recomendamos:\n• Tomar descansos cada 30 minutos\n• Mirar a lo lejos para descansar la vista\n• Mantener una postura correcta\n\n¡Tu salud es lo primero! 💚');
        }, 500);
    }
}

async function cargarCuentasBloqueadas() {
    const lista = document.getElementById('lista-bloqueadas');
    if (!lista) return;

    let bloqueadas = [];

    // Intentar obtener de la BD
    if (typeof DBClient !== 'undefined') {
        const result = await DBClient.getBloqueados();
        if (result.success && result.bloqueados) {
            bloqueadas = result.bloqueados.map(b => b.usuario_bloqueado);
        }
    } else {
        bloqueadas = JSON.parse(localStorage.getItem('dopmax_bloqueadas') || '[]');
    }

    if (bloqueadas.length === 0) {
        lista.innerHTML = '<p class="no-items">No tienes cuentas bloqueadas</p>';
    } else {
        lista.innerHTML = '';
        bloqueadas.forEach(username => {
            const item = document.createElement('div');
            item.className = 'bloqueado-item';
            item.innerHTML = `
                <span class="username">@${username}</span>
                <button class="desbloquear-btn" data-username="${username}">Desbloquear</button>
            `;
            lista.appendChild(item);
        });

        lista.querySelectorAll('.desbloquear-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const username = btn.getAttribute('data-username');
                await desbloquearUsuario(username);
            });
        });
    }
}

async function desbloquearUsuario(username) {
    let success = false;

    // Intentar desbloquear en BD
    if (typeof DBClient !== 'undefined') {
        const result = await DBClient.desbloquearUsuario(username);
        success = result.success;
    }

    // También eliminar de localStorage (fallback)
    let bloqueadas = JSON.parse(localStorage.getItem('dopmax_bloqueadas') || '[]');
    bloqueadas = bloqueadas.filter(u => u !== username);
    localStorage.setItem('dopmax_bloqueadas', JSON.stringify(bloqueadas));

    if (success) {
        alert(`✅ @${username} desbloqueado`);
    }
    cargarCuentasBloqueadas();
}

async function cargarPrivacidad(username) {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;

    let privacidad = { cuentaPrivada: false, mensajes: true };

    // Intentar obtener de la BD
    if (typeof DBClient !== 'undefined' && typeof fetch !== 'undefined') {
        try {
            const response = await fetch(`/api/users/${encodeURIComponent(username)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    privacidad = {
                        cuentaPrivada: data.user.cuenta_privada || false,
                        mensajes: data.user.permitir_mensajes !== false
                    };
                }
            }
        } catch (e) {
            console.log('Error cargando privacidad:', e);
        }
    }

    // Fallback a localStorage
    const localPrivacidad = JSON.parse(localStorage.getItem('dopmax_privacidad_' + username) || '{}');
    privacidad = { ...privacidad, ...localPrivacidad };

    const cuentaPrivada = document.getElementById('opcion-cuenta-privada');
    const mensajes = document.getElementById('opcion-mensajes');

    if (cuentaPrivada) cuentaPrivada.checked = privacidad.cuentaPrivada || false;
    if (mensajes) mensajes.checked = privacidad.mensajes !== false;
}

async function guardarPrivacidad(username) {
    const privacidad = {
        cuentaPrivada: document.getElementById('opcion-cuenta-privada')?.checked || false,
        mensajes: document.getElementById('opcion-mensajes')?.checked !== false
    };

    // Guardar en BD
    if (typeof DBClient !== 'undefined') {
        await DBClient.updatePrivacy(privacidad.cuentaPrivada, privacidad.mensajes, false);
    }

    // También guardar en localStorage (fallback)
    localStorage.setItem('dopmax_privacidad_' + username, JSON.stringify(privacidad));
}

async function cargarPreferencias(username) {
    let prefs = {
        musica: true,
        gaming: true,
        deportes: true,
        comedia: true
    };

    // Intentar obtener de la BD
    if (typeof DBClient !== 'undefined') {
        const result = await DBClient.getPreferencias();
        if (result.success && result.preferencias) {
            prefs = {
                musica: result.preferencias.musica !== false,
                gaming: result.preferencias.gaming !== false,
                deportes: result.preferencias.deportes !== false,
                comedia: result.preferencias.comedia !== false
            };
        }
    }

    // Fallback a localStorage
    const localPrefs = JSON.parse(localStorage.getItem('dopmax_preferencias_' + username) || '{}');
    prefs = { ...prefs, ...localPrefs };

    const musica = document.getElementById('opcion-musica');
    const gaming = document.getElementById('opcion-gaming');
    const deportes = document.getElementById('opcion-deportes');
    const comedia = document.getElementById('opcion-comedia');

    if (musica) musica.checked = prefs.musica !== false;
    if (gaming) gaming.checked = prefs.gaming !== false;
    if (deportes) deportes.checked = prefs.deportes !== false;
    if (comedia) comedia.checked = prefs.comedia !== false;
}

async function guardarPreferencias(username) {
    const prefs = {
        musica: document.getElementById('opcion-musica')?.checked !== false,
        gaming: document.getElementById('opcion-gaming')?.checked !== false,
        deportes: document.getElementById('opcion-deportes')?.checked !== false,
        comedia: document.getElementById('opcion-comedia')?.checked !== false
    };

    // Guardar en BD
    if (typeof DBClient !== 'undefined') {
        await DBClient.updatePreferencias(prefs);
    }

    // También guardar en localStorage (fallback)
    localStorage.setItem('dopmax_preferencias_' + username, JSON.stringify(prefs));
}

// Setup DVD videos
function setupDVDVideos() {
    try {
        initDVDVideos();
    } catch(e) {
        console.log('DVD setup error:', e);
    }
}

// Setup creator
function setupCreator() {
    try {
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            document.getElementById('video-upload')?.click();
        });
        document.getElementById('video-upload')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                document.getElementById('upload-progress')?.classList?.remove('hidden');
                setTimeout(() => {
                    document.getElementById('upload-progress')?.classList?.add('hidden');
                    document.getElementById('upload-success')?.classList?.remove('hidden');
                }, 2000);
            }
        });
    } catch(e) {
        console.log('Creator setup error:', e);
    }
}

// Setup roulette
function setupRoulette() {
    try {
        // Roulette setup si existe
        const rouletteBtn = document.getElementById('roulette-btn');
        const rouletteOverlay = document.getElementById('roulette-overlay');
        if (rouletteBtn && rouletteOverlay) {
            rouletteBtn.addEventListener('click', () => {
                rouletteOverlay.classList.remove('hidden');
            });
            document.getElementById('roulette-close')?.addEventListener('click', () => {
                rouletteOverlay.classList.add('hidden');
            });
        }
    } catch(e) {
        console.log('Roulette setup error:', e);
    }
}

// Setup Gato Clicker
let catClicks = 0;
let catLevel = 1;
let counterTimeout = null;

const CAT_LEVELS = [
    { level: 1, clicks: 0, name: 'level-1' },
    { level: 2, clicks: 5000, name: 'level-2' },
    { level: 3, clicks: 15000, name: 'level-3' },
    { level: 4, clicks: 50000, name: 'level-4' },
    { level: 5, clicks: 100000, name: 'level-5' },
    { level: 6, clicks: 500000, name: 'level-6' }
];

function setupCatClicker() {
    try {
        const catContainer = document.getElementById('cat-clicker');
        const catBtn = document.getElementById('cat-clicker-btn');
        const clickCounter = document.getElementById('click-counter');
        const catSvg = document.getElementById('cat-svg');
        
        if (!catContainer || !catBtn) return;
        
        // Verificar si el usuario está logueado
        const currentUser = DB.getCurrentUser();
        if (!currentUser) {
            catContainer.classList.add('hidden');
            return;
        }
        
        // Mostrar el gato solo si está logueado
        catContainer.classList.remove('hidden');
        
        // Cargar clicks guardados (de la BD en producción, localStorage en desarrollo)
        if (typeof API !== 'undefined' && isProduction) {
            API.getGatoClicks(currentUser.username)
                .then(result => {
                    if (result.success) {
                        catClicks = result.clicks;
                        updateCatLevel();
                    } else {
                        // Fallback a localStorage
                        loadLocalClicks();
                    }
                })
                .catch(err => {
                    console.log('Error cargando clicks de BD:', err);
                    loadLocalClicks();
                });
        } else {
            loadLocalClicks();
        }
        
        function loadLocalClicks() {
            const savedClicks = localStorage.getItem('cat_clicks');
            if (savedClicks) {
                catClicks = parseInt(savedClicks);
                updateCatLevel();
            }
        }
        
        // Click en el gato
        catBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            catClicks++;
            
            // Guardar en BD (producción) o localStorage (desarrollo)
            if (typeof API !== 'undefined' && isProduction) {
                API.saveGatoClicks(currentUser.username, catClicks)
                    .catch(err => console.log('Error guardando clicks:', err));
            } else {
                localStorage.setItem('cat_clicks', catClicks.toString());
            }
            
            // Crear número flotante (estilo Startrak/Bongo Cat)
            createFloatingNumber(e.clientX, e.clientY);
            
            // Actualizar nivel
            updateCatLevel();
            
            // Efecto de animación
            catBtn.style.transform = 'scale(0.9) rotate(-5deg)';
            setTimeout(() => {
                catBtn.style.transform = 'scale(1)';
            }, 100);
        });
        
    } catch(e) {
        console.log('Cat clicker error:', e);
    }
}

function createFloatingNumber(x, y) {
    const counter = document.getElementById('click-counter');
    if (!counter) return;
    
    // Crear elemento de número flotante
    const number = document.createElement('div');
    number.className = 'click-number';
    number.textContent = '+' + catClicks;
    number.style.left = '50%';
    number.style.top = '0px';
    
    counter.appendChild(number);
    
    // Eliminar después de la animación
    setTimeout(() => {
        if (number.parentNode) {
            number.remove();
        }
    }, 800);
}

function updateCatLevel() {
    const pouImage = document.getElementById('pou-image');
    
    if (!pouImage) return;
    
    // Encontrar nivel actual
    let currentLevel = CAT_LEVELS[0];
    for (const level of CAT_LEVELS) {
        if (catClicks >= level.clicks) {
            currentLevel = level;
        }
    }
    
    // Actualizar clase (solo color, sin texto)
    pouImage.className = 'pou-image ' + currentLevel.name;
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    if (!username || !password) {
        errorEl.textContent = 'Por favor completa todos los campos';
        errorEl.classList.remove('hidden');
        return;
    }

    // Usar DBClient SIEMPRE para login (intenta BD, fallback a local)
    if (typeof DBClient !== 'undefined') {
        console.log('🔑 Iniciando sesión con DBClient:', username);
        
        DBClient.login(username, password)
            .then(result => {
                console.log('Resultado login:', result);
                
                if (result.success) {
                    // Guardar inicio de sesión para tiempo en pantalla
                    localStorage.setItem('dopmax_session_start', Date.now().toString());
                    // Inicializar app directamente sin recargar
                    setTimeout(async () => {
                        await initializeApp(result.user);
                    }, 200);
                } else {
                    errorEl.textContent = result.error || 'Usuario o contraseña incorrectos';
                    errorEl.classList.remove('hidden');
                }
            })
            .catch(err => {
                console.error('Error en login:', err);
                errorEl.textContent = 'Error de conexión. Inténtalo de nuevo.';
                errorEl.classList.remove('hidden');
            });
    } else {
        // Fallback al método local (solo si DBClient no existe)
        const user = DB.getUserByUsername(username);
        if (!user) {
            errorEl.textContent = 'Usuario no encontrado';
            errorEl.classList.remove('hidden');
            return;
        }

        if (user.password !== password) {
            errorEl.textContent = 'Contraseña incorrecta';
            errorEl.classList.remove('hidden');
            return;
        }

        // Assign new room on login
        const newRoom = DB.assignRoom(username);
        user.room = newRoom;

        DB.setCurrentUser(user);

        // Guardar inicio de sesión para tiempo en pantalla
        localStorage.setItem('dopmax_session_start', Date.now().toString());

        // Inicializar app directamente sin recargar
        setTimeout(async () => {
            await initializeApp(user);
        }, 200);
    }
}

function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirm = document.getElementById('register-confirm').value.trim();
    const errorEl = document.getElementById('register-error');

    if (!username || !password || !confirm) {
        errorEl.textContent = 'Por favor completa todos los campos';
        errorEl.classList.remove('hidden');
        return;
    }

    if (username.length < 3) {
        errorEl.textContent = 'El nombre debe tener al menos 3 caracteres';
        errorEl.classList.remove('hidden');
        return;
    }

    if (password.length < 4) {
        errorEl.textContent = 'La contraseña debe tener al menos 4 caracteres';
        errorEl.classList.remove('hidden');
        return;
    }

    if (password !== confirm) {
        errorEl.textContent = 'Las contraseñas no coinciden';
        errorEl.classList.remove('hidden');
        return;
    }

    // Usar DBClient SIEMPRE para registro (intenta BD, fallback a local)
    if (typeof DBClient !== 'undefined') {
        console.log('📝 Registrando usuario con DBClient:', username);
        
        DBClient.register(username, password)
            .then(result => {
                console.log('Resultado registro:', result);
                
                if (result.success) {
                    // Guardar inicio de sesión para tiempo en pantalla
                    localStorage.setItem('dopmax_session_start', Date.now().toString());
                    // Inicializar app directamente sin recargar
                    setTimeout(async () => {
                        await initializeApp(result.user);
                    }, 200);
                } else {
                    errorEl.textContent = result.error || 'Error en el registro';
                    errorEl.classList.remove('hidden');
                }
            })
            .catch(err => {
                console.error('Error en registro:', err);
                errorEl.textContent = 'Error de conexión. Inténtalo de nuevo.';
                errorEl.classList.remove('hidden');
            });
    } else {
        // Fallback al método local (solo si DBClient no existe)
        if (DB.getUserByUsername(username)) {
            errorEl.textContent = 'Este nombre de usuario ya está en uso';
            errorEl.classList.remove('hidden');
            return;
        }

        const rooms = ['Global', 'Musica'];
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        
        // Foto de perfil aleatoria para nuevos usuarios
        const randomPhotoIndex = Math.floor(Math.random() * 11);
        const randomPhoto = 'https://picsum.photos/seed/user' + randomPhotoIndex + '/200/200';

        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: password,
            room: randomRoom,
            avatar: ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)],
            foto_perfil: randomPhoto,
            createdAt: new Date().toISOString()
        };

        DB.saveUser(newUser);
        // Guardar foto de perfil en localStorage
        localStorage.setItem('dopmax_foto_perfil_' + username, randomPhoto);
        DB.setCurrentUser(newUser);

        // Inicializar app directamente sin recargar
        setTimeout(async () => {
            await initializeApp(newUser);
        }, 200);
    }
}

function handleLogout() {
    console.log('Cerrando sesión...');

    // Usar DBClient si está disponible
    if (typeof DBClient !== 'undefined') {
        DBClient.logout().then(() => {
            DB.setCurrentUser(null);
            completeLogout();
        });
    } else {
        DB.setCurrentUser(null);
        completeLogout();
    }
}

function completeLogout() {
    // Ocultar todas las pantallas excepto auth
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });

    // Mostrar auth screen
    const authScreen = document.getElementById('auth-screen');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (authScreen) {
        authScreen.classList.add('active');
        authScreen.style.display = 'flex';
    }
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');

    // Ocultar gato
    const catContainer = document.getElementById('cat-clicker');
    if (catContainer) catContainer.classList.add('hidden');

    // Reset forms
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    const registerConfirm = document.getElementById('register-confirm');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    if (loginUsername) loginUsername.value = '';
    if (loginPassword) loginPassword.value = '';
    if (registerUsername) registerUsername.value = '';
    if (registerPassword) registerPassword.value = '';
    if (registerConfirm) registerConfirm.value = '';
    if (loginError) loginError.classList.add('hidden');
    if (registerError) registerError.classList.add('hidden');

    console.log('✅ Sesión cerrada correctamente');
}

function showAuthScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

async function initializeApp(user) {
    try {
        console.log('Inicializando usuario:', user.username);

        // Ocultar loading y auth screens
        const loadingScreen = document.getElementById('loading-screen');
        const authScreen = document.getElementById('auth-screen');
        const homeScreen = document.getElementById('home-screen');

        if (loadingScreen) loadingScreen.classList.remove('active');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (authScreen) authScreen.classList.remove('active');
        if (authScreen) authScreen.style.display = 'none';

        // Mostrar home screen
        if (homeScreen) homeScreen.classList.add('active');
        if (homeScreen) homeScreen.style.display = 'flex';

        // Update UI with user info - Mostrar candado si es cuenta privada
        const currentUsernameEl = document.getElementById('current-username');
        const profileUsernameEl = document.getElementById('profile-username');
        const profilePicLarge = document.querySelector('.profile-pic-large');
        const profileAvatar = document.querySelector('.profile-avatar');

        // Verificar si es cuenta privada (mostrar candado 🔒)
        const esPrivada = user.cuenta_privada || false;
        const usernameConCandado = esPrivada ? `${user.username} 🔒` : user.username;

        if (currentUsernameEl) currentUsernameEl.innerHTML = usernameConCandado;
        if (profileUsernameEl) profileUsernameEl.textContent = '@' + usernameConCandado;

        // Cargar foto de perfil (async - desde BD o localStorage)
        await cargarFotoPerfil(user.username);

        // Si no hay foto, usar avatar por defecto
        const savedFoto = localStorage.getItem('dopmax_foto_perfil_' + user.username);
        if (!savedFoto) {
            if (profilePicLarge) profilePicLarge.textContent = user.avatar;
            if (profileAvatar) profileAvatar.textContent = user.avatar;
        }

        // Update room indicator
        const roomIndicator = document.getElementById('room-indicator');
        if (roomIndicator) roomIndicator.textContent = 'Sala: ' + user.room;

        // Initialize DVD videos
        setTimeout(() => {
            try { initDVDVideos(); } catch(e) { console.log('DVD init error:', e); }
        }, 300);

        // Setup navigation
        setupNavigation();

        // Load chats for current room
        loadChatsForRoom(user.room);

        // Inicializar gato clicker SOLO cuando hay login
        setTimeout(() => {
            try { setupCatClicker(); } catch(e) { console.log('Cat init error:', e); }
        }, 500);

        // Inicializar ajustes de perfil
        setTimeout(() => {
            try { setupProfileSettings(); } catch(e) { console.log('Profile settings error:', e); }
        }, 600);

        console.log('✅ Usuario inicializado correctamente');
    } catch(error) {
        console.error('Error en initializeApp:', error);
        showAuthScreen();
    }
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('[data-screen]');
    const screens = document.querySelectorAll('.screen:not(#loading-screen):not(#auth-screen)');
    const catContainer = document.getElementById('cat-clicker');

    navButtons.forEach((button) => {
        button.addEventListener('click', () => {
            navigateToScreen(button.getAttribute('data-screen'));
        });
    });

    function navigateToScreen(screenName) {
        screens.forEach((screen) => screen.classList.remove('active'));
        const targetElement = document.getElementById(screenName + '-screen');
        if (targetElement) targetElement.classList.add('active');
        
        // Mostrar/Ocultar gato según la pantalla
        if (screenName === 'home') {
            initDVDVideos();
            if (catContainer) catContainer.classList.remove('hidden');
        } else {
            stopDVDVideos();
            if (catContainer) catContainer.classList.add('hidden');
        }
        hideCommentsPanel();
    }

    // Tabs
    document.querySelectorAll('.top-tabs .tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.top-tabs .tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    document.querySelectorAll('.inbox-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.inbox-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById('notifications-content').classList.toggle('hidden', tabName !== 'notifications');
            document.getElementById('messages-content').classList.toggle('hidden', tabName !== 'messages');
        });
    });
}

function loadChatMessages(chatId, roomName) {
    const messages = DB.getMessagesForChat(chatId, roomName);
    const container = document.getElementById('chat-overlay-messages');
    container.innerHTML = '';

    messages.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message' + (msg.sent ? ' sent' : '');
        msgEl.innerHTML = `
            <div class="chat-message-avatar">${msg.sent ? '🐱' : '👤'}</div>
            <div class="chat-message-content">
                <div class="chat-message-text">${msg.text}</div>
                <div class="chat-message-time">${msg.time}</div>
            </div>
        `;
        container.appendChild(msgEl);
    });

    container.scrollTop = container.scrollHeight;
}

// Chat overlay handlers
const backToInbox = document.getElementById('back-to-inbox');
if (backToInbox) backToInbox.addEventListener('click', () => {
    const chatOverlay = document.getElementById('chat-overlay');
    if (chatOverlay) {
        chatOverlay.classList.remove('active');
        chatOverlay.classList.add('hidden');
        // DETENER polling cuando se cierra el chat
        stopChatPolling();
    }
});

const chatSendBtn = document.getElementById('chat-send-btn');
if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);

const chatInput = document.getElementById('chat-input');
if (chatInput) chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

// Mostrar mensaje de error
function showError(message) {
    console.error('❌ Error:', message);
    alert(message);
}

function loadChatsForRoom(roomName) {
    const chats = DB.getChatsForRoom(roomName);
    const container = document.getElementById('messages-content');
    
    // Mantener el buscador y limpiar solo la lista de chats
    const searchContainer = container.querySelector('.user-search-container');
    const existingChatsList = container.querySelector('#user-chats-list');
    
    if (!searchContainer) {
        // Crear el HTML del buscador si no existe
        const searchHTML = `
            <div class="user-search-container">
                <div class="search-input-wrapper">
                    <input type="text" id="user-search-input" placeholder="Buscar usuarios..." autocomplete="off">
                    <button id="search-btn">🔍</button>
                </div>
                <div class="search-results hidden" id="search-results"></div>
            </div>
            
            <div class="chats-section-title">Tus Chats</div>
            <div id="user-chats-list"></div>
        `;
        container.innerHTML = searchHTML;
    }
    
    // Cargar chats del usuario
    loadUserChats();
    setupUserSearch();
}

function loadUserChats() {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;

    // Intentar cargar desde DBClient (producción con BD)
    if (typeof DBClient !== 'undefined' && DBClient.connected) {
        DBClient.getUserChats()
            .then(result => {
                if (result.success && result.chats) {
                    displayUserChats(result.chats);
                } else {
                    // Fallback a localStorage
                    loadUserChatsLocal();
                }
            })
            .catch(err => {
                console.error('Error cargando chats:', err);
                loadUserChatsLocal();
            });
    } else {
        // Local
        loadUserChatsLocal();
    }
}

function loadUserChatsLocal() {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;

    const userChats = DB.getUserChats(currentUser.id);
    displayUserChats(userChats);
}

function displayUserChats(chats) {
    const container = document.getElementById('user-chats-list');
    if (!container) return;

    if (!chats || chats.length === 0) {
        container.innerHTML = '<div class="no-chats-message">No tienes chats aún. ¡Busca usuarios y escribeles!</div>';
        return;
    }

    container.innerHTML = '';
    chats.forEach(chat => {
        const chatEl = document.createElement('div');
        chatEl.className = 'chat-item';
        chatEl.setAttribute('data-chat', chat.userId || chat.id);
        chatEl.setAttribute('data-user-chat', 'true');
        chatEl.innerHTML = `
            <div class="chat-avatar">${chat.avatar || '👤'}</div>
            <div class="chat-info">
                <div class="chat-name">@${chat.name || chat.userId || chat.otro_usuario}</div>
                <div class="chat-preview">${chat.lastMessage || 'Inicia una conversación'}</div>
            </div>
            <div class="chat-time">${chat.time || 'Reciente'}</div>
        `;
        container.appendChild(chatEl);
    });

    container.querySelectorAll('.chat-item').forEach((item) => {
        item.addEventListener('click', () => {
            openUserChat(item);
        });
    });
}

function setupUserSearch() {
    const searchInput = document.getElementById('user-search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchBtn || !searchResults) return;
    
    searchBtn.addEventListener('click', performUserSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performUserSearch();
    });
}

function performUserSearch() {
    const searchInput = document.getElementById('user-search-input');
    const searchResults = document.getElementById('search-results');
    const currentUser = DB.getCurrentUser();

    if (!searchInput || !searchResults || !currentUser) return;

    const query = searchInput.value.trim();
    if (query.length < 2) {
        searchResults.innerHTML = '<div class="no-search-results">Escribe al menos 2 caracteres</div>';
        searchResults.classList.remove('hidden');
        return;
    }

    // Intentar buscar en la API primero (producción)
    if (typeof API !== 'undefined' && isProduction) {
        API.searchUsers(query, currentUser.username)
            .then(result => {
                if (result.success && result.usuarios && result.usuarios.length > 0) {
                    displaySearchResults(result.usuarios, searchResults, currentUser);
                } else {
                    // Fallback a localStorage
                    const users = DB.searchUsers(query, currentUser.id);
                    displaySearchResultsLocal(users, searchResults, currentUser);
                }
            })
            .catch(err => {
                console.error('Error buscando usuarios:', err);
                const users = DB.searchUsers(query, currentUser.id);
                displaySearchResultsLocal(users, searchResults, currentUser);
            });
    } else {
        // Búsqueda local (desarrollo)
        const users = DB.searchUsers(query, currentUser.id);
        displaySearchResultsLocal(users, searchResults, currentUser);
    }
}

function displaySearchResults(users, searchResults, currentUser) {
    if (users.length === 0) {
        searchResults.innerHTML = '<div class="no-search-results">No se encontraron usuarios</div>';
    } else {
        searchResults.innerHTML = '';
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'search-result-item';
            userEl.innerHTML = `
                <div class="search-result-avatar">${user.avatar || '👤'}</div>
                <div class="search-result-info">
                    <div class="search-result-name">${user.nombreusuario || user.username}</div>
                    <div class="search-result-username">@${user.nombreusuario || user.username}</div>
                </div>
                <button class="search-result-action" data-user="${encodeURIComponent(user.nombreusuario || user.username)}" data-avatar="${user.avatar || '👤'}">Chatear</button>
            `;
            searchResults.appendChild(userEl);
        });

        searchResults.querySelectorAll('.search-result-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const username = btn.getAttribute('data-user');
                const avatar = btn.getAttribute('data-avatar');
                startChatWithUser(decodeURIComponent(username), avatar);
            });
        });
    }

    searchResults.classList.remove('hidden');
}

function displaySearchResultsLocal(users, searchResults, currentUser) {
    if (users.length === 0) {
        searchResults.innerHTML = '<div class="no-search-results">No se encontraron usuarios</div>';
    } else {
        searchResults.innerHTML = '';
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'search-result-item';
            userEl.innerHTML = `
                <div class="search-result-avatar">${user.avatar || '👤'}</div>
                <div class="search-result-info">
                    <div class="search-result-name">${user.username}</div>
                    <div class="search-result-username">@${user.username}</div>
                </div>
                <button class="search-result-action" data-user-id="${user.id}" data-username="${user.username}" data-avatar="${user.avatar || '👤'}">Chatear</button>
            `;
            searchResults.appendChild(userEl);
        });

        searchResults.querySelectorAll('.search-result-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = btn.getAttribute('data-user-id');
                const username = btn.getAttribute('data-username');
                const avatar = btn.getAttribute('data-avatar');
                startChatWithUserLocal(userId, username, avatar);
            });
        });
    }

    searchResults.classList.remove('hidden');
}

function startChatWithUser(username, avatar) {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;

    // Usar DBClient si está disponible (producción con BD)
    if (typeof DBClient !== 'undefined' && DBClient.connected) {
        DBClient.createChat(username)
            .then(result => {
                if (result.success) {
                    // Chat creado/obtenido, ahora abrirlo
                    openChatWithUser(username, avatar);
                } else {
                    console.error('Error creando chat:', result.error);
                    startChatWithUserLocal(null, username, avatar);
                }
            })
            .catch(err => {
                console.error('Error en DBClient:', err);
                startChatWithUserLocal(null, username, avatar);
            });
    } else if (typeof API !== 'undefined' && isProduction) {
        // Fallback a API antigua
        API.createChat(currentUser.username, username)
            .then(result => {
                if (result.success || result.chatId) {
                    openChatWithUser(username, avatar);
                } else {
                    console.error('Error creando chat:', result.error);
                    startChatWithUserLocal(null, username, avatar);
                }
            })
            .catch(err => {
                console.error('Error en API:', err);
                startChatWithUserLocal(null, username, avatar);
            });
    } else {
        // Local
        startChatWithUserLocal(null, username, avatar);
    }
}

function startChatWithUserLocal(userId, username, avatar) {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;

    // Verificar si ya existe el chat
    let userChats = DB.getUserChats(currentUser.id);
    let existingChat = userChats.find(c => c.username === username);

    if (!existingChat) {
        // Crear nuevo chat
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        existingChat = {
            userId: userId || username,
            username: username,
            avatar: avatar,
            lastMessage: '',
            time: time
        };

        DB.saveUserChat(currentUser.id, existingChat);
    }

    // Ocultar resultados de búsqueda
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('user-search-input');
    if (searchResults) searchResults.classList.add('hidden');
    if (searchInput) searchInput.value = '';

    // Recargar lista de chats
    loadUserChats();

    // Abrir el chat
    const chatEl = document.querySelector(`.chat-item[data-chat="${userId || username}"][data-user-chat="true"]`);
    if (chatEl) {
        openUserChat(chatEl);
    } else {
        // Abrir directamente
        openChatWithUser(username, avatar);
    }
}

function openChatWithUser(username, avatar) {
    // Configurar overlay del chat
    document.getElementById('chat-overlay-avatar').textContent = avatar || '👤';
    document.getElementById('chat-overlay-name').textContent = '@' + username;
    document.getElementById('chat-overlay').classList.remove('hidden');
    document.getElementById('chat-overlay').classList.add('active');

    // Cargar mensajes
    loadUserChatMessages(username);
}

// Variables para polling de mensajes en tiempo real
let chatPollingInterval = null;
let currentChatIdPolling = null;

// Iniciar polling para mensajes nuevos (cada 2 segundos)
function startChatPolling(chatId) {
    stopChatPolling(); // Detener polling anterior
    currentChatIdPolling = chatId;
    console.log('🔄 Iniciando polling para chat:', chatId);

    chatPollingInterval = setInterval(() => {
        const chatOverlay = document.getElementById('chat-overlay');
        if (currentChatIdPolling && chatOverlay?.classList?.contains('active')) {
            loadChatMessagesFromDB(currentChatIdPolling, false); // false = no scroll
        }
    }, 3000);
}

// Detener polling
function stopChatPolling() {
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
        console.log('⏹️ Deteniendo polling de chat');
    }
    currentChatIdPolling = null;
}

function openUserChat(chatItem) {
    const userId = chatItem.getAttribute('data-chat');
    const username = chatItem.querySelector('.chat-name').textContent.replace('@', '');
    const avatar = chatItem.querySelector('.chat-avatar').textContent;

    document.getElementById('chat-overlay-avatar').textContent = avatar;
    document.getElementById('chat-overlay-name').textContent = '@' + username;
    document.getElementById('chat-overlay').classList.remove('hidden');
    document.getElementById('chat-overlay').classList.add('active');

    // Cargar mensajes del chat con usuario
    loadUserChatMessages(userId);
}

function loadUserChatMessages(userId) {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;

    console.log('📨 Cargando chat con:', userId);

    // SIEMPRE usar DBClient para cargar mensajes
    DBClient.createChat(userId)
        .then(result => {
            console.log('Resultado createChat:', result);

            if (result.success && result.chatId) {
                const chatId = result.chatId;
                const chatOverlay = document.getElementById('chat-overlay');
                if (chatOverlay) {
                    chatOverlay.setAttribute('data-chat-id', chatId);
                }
                loadChatMessagesFromDB(chatId);
                
                // INICIAR POLLING para mensajes nuevos en tiempo real
                startChatPolling(chatId);
            } else {
                console.error('Error creando chat:', result.error);
                showError('No se pudo cargar el chat');
            }
        })
        .catch(err => {
            console.error('Error cargando chat:', err);
            showError('Error de conexión');
        });
}

function loadChatMessagesFromDB(chatId, scrollToBottom = true) {
    console.log('📥 Cargando mensajes del chat:', chatId);

    DBClient.getChatMessages(chatId)
        .then(result => {
            console.log('Mensajes recibidos:', result);

            if (result.success && result.mensajes) {
                const container = document.getElementById('chat-overlay-messages');
                if (!container) return;

                // Guardar posición actual del scroll
                const previousScrollHeight = container.scrollHeight;
                const previousScrollTop = container.scrollTop;

                container.innerHTML = '';
                const currentUser = DB.getCurrentUser();

                result.mensajes.forEach(msg => {
                    const msgEl = document.createElement('div');
                    msgEl.className = 'chat-message' + (msg.sent ? ' sent' : '');
                    msgEl.innerHTML = `
                        <div class="chat-message-avatar">${msg.sent ? (currentUser?.avatar || '🐱') : '👤'}</div>
                        <div class="chat-message-content">
                            <div class="chat-message-text">${msg.text}</div>
                            <div class="chat-message-time">${msg.time}</div>
                        </div>
                    `;
                    container.appendChild(msgEl);
                });

                // Scroll al final solo si es la primera carga o si hay mensajes nuevos
                if (scrollToBottom) {
                    container.scrollTop = container.scrollHeight;
                } else {
                    // Mantener posición si hay mensajes nuevos
                    const newScrollHeight = container.scrollHeight;
                    if (newScrollHeight > previousScrollHeight) {
                        container.scrollTop = newScrollHeight;
                    } else {
                        container.scrollTop = previousScrollTop;
                    }
                }
            }
        })
        .catch(err => {
            console.error('Error cargando mensajes:', err);
            showError('No se pudieron cargar los mensajes');
        });
}

function loadUserChatMessagesLocal(userId) {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;

    const messages = DB.getMessagesForChat(userId, null, true, currentUser.id);
    const container = document.getElementById('chat-overlay-messages');
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = '<div class="no-chats-message">Escribe el primer mensaje</div>';
    } else {
        messages.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-message' + (msg.sent ? ' sent' : '');
            msgEl.innerHTML = `
                <div class="chat-message-avatar">${msg.sent ? (currentUser.avatar || '🐱') : '👤'}</div>
                <div class="chat-message-content">
                    <div class="chat-message-text">${msg.text}</div>
                    <div class="chat-message-time">${msg.time}</div>
                </div>
            `;
            container.appendChild(msgEl);
        });
    }

    container.scrollTop = container.scrollHeight;
}
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();

    if (!text) return;

    const currentUser = DB.getCurrentUser();
    if (!currentUser) {
        showError('Debes iniciar sesión');
        return;
    }

    const chatOverlay = document.getElementById('chat-overlay');
    const chatName = chatOverlay.querySelector('#chat-overlay-name').textContent.replace('@', '');
    let currentChatId = chatOverlay.getAttribute('data-chat-id');

    // VERIFICAR si el usuario nos tiene bloqueado
    if (typeof DBClient !== 'undefined') {
        const bloqueadoResult = await DBClient.estaBloqueado(chatName);
        if (bloqueadoResult.success && bloqueadoResult.bloqueado) {
            showError('❌ Esta persona no recibe mensajes de usuarios desconocidos');
            return;
        }
    }

    console.log('💬 Enviando mensaje:', text, 'al chat:', currentChatId || 'nuevo');

    // Función para enviar mensaje una vez tengamos chatId
    const sendMessageWithChatId = (chatId) => {
        console.log('Enviando mensaje al chat ID:', chatId);

        DBClient.sendMessage(chatId, text)
            .then(result => {
                console.log('Resultado envío:', result);

                if (result.success) {
                    input.value = '';
                    // Recargar mensajes para mostrar el nuevo
                    loadChatMessagesFromDB(chatId);
                } else {
                    showError(result.error || 'No se pudo enviar el mensaje');
                }
            })
            .catch(err => {
                console.error('Error enviando mensaje:', err);
                showError('Error de conexión al enviar');
            });
    };

    // Si no tenemos chatId, crear el chat primero
    if (!currentChatId) {
        console.log('Creando nuevo chat con:', chatName);

        DBClient.createChat(chatName)
            .then(result => {
                console.log('Chat creado:', result);

                if (result.success && result.chatId) {
                    const chatId = result.chatId;
                    chatOverlay.setAttribute('data-chat-id', chatId);
                    sendMessageWithChatId(chatId);
                } else {
                    showError('No se pudo crear el chat: ' + (result.error || 'Error desconocido'));
                }
            })
            .catch(err => {
                console.error('Error creando chat:', err);
                showError('Error de conexión al crear chat');
            });
    } else {
        // Ya tenemos chatId, enviar directamente
        sendMessageWithChatId(currentChatId);
    }
}

function sendChatMessageLocal(text, currentUser, chatName) {
    const userChats = DB.getUserChats(currentUser.id);
    const userChat = userChats.find(c => c.username === chatName);

    if (userChat) {
        const chatId = userChat.userId;
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const message = {
            text: text,
            sent: true,
            time: time
        };

        DB.saveMessage(chatId, null, message, true, currentUser.id);

        userChat.lastMessage = text;
        userChat.time = time;
        DB.saveUserChat(currentUser.id, userChat);

        loadUserChatMessages(chatId);
        loadUserChats();
    } else {
        // Chat predeterminado
        const roomName = currentUser.room;
        const defaultChats = DB.getChatsForRoom(roomName);
        const defaultChat = defaultChats.find(c => c.name === chatName);

        if (defaultChat) {
            const chatId = defaultChat.id;
            const now = new Date();
            const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            const message = {
                text: text,
                sent: true,
                time: time
            };

            DB.saveMessage(chatId, roomName, message);
            loadChatMessages(chatId, roomName);
        }
    }

    const input = document.getElementById('chat-input');
    if (input) input.value = '';
}

function updateLocalChat(chatName, text, currentUser) {
    const userChats = DB.getUserChats(currentUser.id);
    let userChat = userChats.find(c => c.username === chatName);
    
    if (userChat) {
        userChat.lastMessage = text;
        userChat.time = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
        DB.saveUserChat(currentUser.id, userChat);
        loadUserChats();
    }
}

function loadChatMessagesFromAPI(chatId) {
    if (typeof API === 'undefined') return;
    
    API.getChatMessages(chatId)
        .then(result => {
            if (result.success && result.mensajes) {
                const container = document.getElementById('chat-overlay-messages');
                if (!container) return;
                
                container.innerHTML = '';
                const currentUser = DB.getCurrentUser();
                
                result.mensajes.forEach(msg => {
                    const msgEl = document.createElement('div');
                    const isSent = msg.remitente === currentUser?.username;
                    msgEl.className = 'chat-message' + (isSent ? ' sent' : '');
                    msgEl.innerHTML = `
                        <div class="chat-message-avatar">${isSent ? (currentUser?.avatar || '🐱') : '👤'}</div>
                        <div class="chat-message-content">
                            <div class="chat-message-text">${msg.contenido}</div>
                            <div class="chat-message-time">${formatTimestamp(msg.created_at)}</div>
                        </div>
                    `;
                    container.appendChild(msgEl);
                });
                
                container.scrollTop = container.scrollHeight;
            }
        })
        .catch(err => console.error('Error cargando mensajes:', err));
}

// DVD Videos
let dvdAnimationId = null;
const dvdVideos = [];
let selectedVideo = null;
let draggedVideo = null;
let dragOffsetX = 0, dragOffsetY = 0;
const FRICTION = 0.995, MIN_SPEED = 0.8, MAX_SPEED = 2.5, SPEED_MAINTAIN_FRAMES = 300;
let closeButtonsInitialized = false;

// Variables para calcular velocidad al soltar
let lastDragX = 0, lastDragY = 0, lastDragTime = 0, prevLastDragX = 0, prevLastDragY = 0;
let dragVelocityX = 0, dragVelocityY = 0;

let lastVideo = null;

// Lista de videos de Cloudinary - DOPMAX
const videoList = [
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824491/Download_1_npvpfo.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824488/13%C2%BA112_xpn677.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_6_t0h1xv.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_5_tefkxd.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_2_uvswgp.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_4_e40d6m.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824485/Download_3_cvttsl.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/314141_wcbfxt.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/12313131_iwv3zt.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824483/521515_tmhf6o.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/151516162172172_y8qnkj.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/africa_qqp1hm.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/151511616_lct0si.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824482/Download_ks1gec.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824482/525_qtomhc.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824481/211_cowcom.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824481/Download_7_nynrna.mp4',
    'https://res.cloudinary.com/dr5llopu0/video/upload/v1773824478/13%C2%BA112_dveosy.mp4'
];

// Generar ID único para cada video basado en su URL
function getVideoIdFromUrl(url) {
    // Extraer el nombre del archivo de la URL
    const match = url.match(/\/([^\/]+)\.[^\.]+$/);
    if (match) {
        return 'video_' + match[1]; // ej: video_Download_1_npvpfo
    }
    // Fallback: usar hash de la URL
    return 'video_' + btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
}

function getRandomVideo(currentVideo) {
    if (videoList.length <= 1) return videoList[0];
    
    // Filter out the current video and the last played video
    let availableVideos = videoList.filter(v => v !== currentVideo && v !== lastVideo);
    
    // If only one video would remain, allow repeats
    if (availableVideos.length === 0) {
        availableVideos = videoList.filter(v => v !== currentVideo);
    }
    
    const newVideo = availableVideos[Math.floor(Math.random() * availableVideos.length)];
    lastVideo = newVideo;
    return newVideo;
}

function setupVideoCloseButtons() {
    if (closeButtonsInitialized) return;
    closeButtonsInitialized = true;
    document.querySelectorAll('.video-close-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = btn.getAttribute('data-video');
            const videoEl = document.getElementById(videoId);
            if (videoEl) {
                const video = videoEl.querySelector('.video-element');
                const source = video.querySelector('source');
                const newVideoUrl = getRandomVideo(source.src);
                source.src = newVideoUrl;
                video.load();
                video.play();
                
                // Si este video estaba seleccionado, actualizar comentarios
                if (selectedVideo === videoEl) {
                    const newVideoId = getVideoIdFromUrl(newVideoUrl);
                    console.log('🔄 Video actualizado, nuevos comentarios para:', newVideoId);
                    loadVideoComments(newVideoId);
                }
            }
        });
    });
}

function initVideoSources() {
    // Reset last video to avoid repeats on init
    lastVideo = null;

    // Inicializar cada video con una URL aleatoria
    document.querySelectorAll('.dvd-video').forEach((video, index) => {
        const videoElement = video.querySelector('.video-element');
        const sourceElement = videoElement.querySelector('source');
        const randomVideo = getRandomVideo('');
        sourceElement.src = randomVideo;
        videoElement.load();
        videoElement.play();
        
        // Inicializar comentarios para este video (usando su URL)
        const videoId = getVideoIdFromUrl(randomVideo);
        console.log('📹 Inicializando video', index + 1, ':', videoId);
        
        // Inicializar comentarios por defecto si no existen (localStorage fallback)
        const existingComments = DB.getVideoComments(videoId);
        if (!existingComments || existingComments.length === 0) {
            initVideoCommentsLocal(videoId);
        }
    });
}

// Inicializar comentarios por defecto en localStorage para un video
function initVideoCommentsLocal(videoId) {
    const botNames = [
        { name: 'María García', avatar: '👩' },
        { name: 'Carlos López', avatar: '👨' },
        { name: 'Laura Martín', avatar: '👧' },
        { name: 'David Rodríguez', avatar: '👦' },
        { name: 'Ana Sánchez', avatar: '👩' }
    ];

    const fakeComments = [
        '¡Me encanta! 🔥',
        'Esto es increíble 😍',
        '¿Alguien más viendo esto?',
        'No puedo parar de verlo 😂',
        '¡Qué bueno! 👏',
        '¡Brutal! 💯',
        '¡Guau! 😮',
        '¡Calidad! ✨'
    ];

    // Crear 2-3 comentarios iniciales
    const numComments = 2 + Math.floor(Math.random() * 2);
    const shuffledBots = [...botNames].sort(() => Math.random() - 0.5);
    const shuffledComments = [...fakeComments].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numComments; i++) {
        const bot = shuffledBots[i % shuffledBots.length];
        const commentText = shuffledComments[i % shuffledComments.length];
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        DB.saveVideoComment(videoId, {
            id: 'bot_' + videoId + '_' + i,
            username: bot.name,
            avatar: bot.avatar,
            text: commentText,
            time: time,
            isBot: true
        });
    }
    
    console.log('✅ Comentarios inicializados para', videoId);
}

function checkCollisions() {
    for (let i = 0; i < dvdVideos.length; i++) {
        for (let j = i + 1; j < dvdVideos.length; j++) {
            const v1 = dvdVideos[i];
            const v2 = dvdVideos[j];
            
            // Verificar colisión
            if (v1.x < v2.x + v2.width && v1.x + v1.width > v2.x && 
                v1.y < v2.y + v2.height && v1.y + v1.height > v2.y) {
                
                // Calcular solapamiento
                const overlapX = Math.min(v1.x + v1.width, v2.x + v2.width) - Math.max(v1.x, v2.x);
                const overlapY = Math.min(v1.y + v1.height, v2.y + v2.height) - Math.max(v1.y, v2.y);
                
                // Resolver colisión separando los videos
                if (overlapX < overlapY) {
                    // Colisión horizontal
                    const totalOverlap = overlapX;
                    if (v1 === draggedVideo) {
                        // Si v1 es arrastrado, solo mover v2
                        v2.x += totalOverlap;
                        v2.vx = Math.max(v2.vx, draggedVideo.vx * 0.5);
                    } else if (v2 === draggedVideo) {
                        // Si v2 es arrastrado, solo mover v1
                        v1.x -= totalOverlap;
                        v1.vx = Math.min(v1.vx, draggedVideo.vx * 0.5);
                    } else {
                        // Ninguno es arrastrado, separar ambos
                        if (v1.x < v2.x) {
                            v1.x -= totalOverlap / 2;
                            v2.x += totalOverlap / 2;
                        } else {
                            v1.x += totalOverlap / 2;
                            v2.x -= totalOverlap / 2;
                        }
                        // Intercambiar velocidades X
                        const tempVx = v1.vx;
                        v1.vx = v2.vx * 0.8;
                        v2.vx = tempVx * 0.8;
                    }
                } else {
                    // Colisión vertical
                    const totalOverlap = overlapY;
                    if (v1 === draggedVideo) {
                        // Si v1 es arrastrado, solo mover v2
                        v2.y += totalOverlap;
                        v2.vy = Math.max(v2.vy, draggedVideo.vy * 0.5);
                    } else if (v2 === draggedVideo) {
                        // Si v2 es arrastrado, solo mover v1
                        v1.y -= totalOverlap;
                        v1.vy = Math.min(v1.vy, draggedVideo.vy * 0.5);
                    } else {
                        // Ninguno es arrastrado, separar ambos
                        if (v1.y < v2.y) {
                            v1.y -= totalOverlap / 2;
                            v2.y += totalOverlap / 2;
                        } else {
                            v1.y += totalOverlap / 2;
                            v2.y -= totalOverlap / 2;
                        }
                        // Intercambiar velocidades Y
                        const tempVy = v1.vy;
                        v1.vy = v2.vy * 0.8;
                        v2.vy = tempVy * 0.8;
                    }
                }
                
                // Efecto visual de colisión
                v1.element.style.boxShadow = '0 0 30px 5px rgba(247,185,22,0.8)';
                v2.element.style.boxShadow = '0 0 30px 5px rgba(247,185,22,0.8)';
                setTimeout(() => { 
                    v1.element.style.boxShadow = ''; 
                    v2.element.style.boxShadow = ''; 
                }, 200);
            }
        }
    }
}

function initDVDVideos() {
    stopDVDVideos();
    const container = document.getElementById('dvd-container');
    if (!container) return;

    dvdVideos.length = 0;

    setTimeout(() => {
        const containerWidth = container.clientWidth || window.innerWidth;
        const containerHeight = container.clientHeight || window.innerHeight;

        // Tamaños fijos para los videos
        const VIDEO_WIDTH = 360;
        const VIDEO_HEIGHT = 320;

        document.querySelectorAll('.dvd-video').forEach((video, index) => {
            // Forzar tamaño correcto
            video.style.width = VIDEO_WIDTH + 'px';
            video.style.height = VIDEO_HEIGHT + 'px';
            
            const videoWidth = VIDEO_WIDTH;
            const videoHeight = VIDEO_HEIGHT;
            const startX = Math.random() * (containerWidth - videoWidth);
            const startY = 55 + Math.random() * (containerHeight - videoHeight - 55);
            const baseSpeed = 1.5 + Math.random() * 0.5;
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * baseSpeed;
            const vy = Math.sin(angle) * baseSpeed;
            video.style.cssText = 'width:' + videoWidth + 'px;height:' + videoHeight + 'px;left:' + startX + 'px;top:' + startY + 'px;touch-action:none;position:absolute;display:block;';
            dvdVideos.push({ element: video, x: startX, y: startY, vx: vx, vy: vy, width: videoWidth, height: videoHeight, framesSinceBoost: 0 });
            video.addEventListener('mousedown', startDrag);
            video.addEventListener('touchstart', startDrag, { passive: false });
            video.addEventListener('click', (e) => { if (!draggedVideo) { e.stopPropagation(); selectVideo(video); } });
        });

        setupVideoCloseButtons();
        initVideoSources();
        initVideoCommentButtons();
        initCommentEvents();

        const containerEl = document.getElementById('dvd-container');
        containerEl.addEventListener('mousemove', drag);
        containerEl.addEventListener('touchmove', drag, { passive: false });
        containerEl.addEventListener('mouseup', endDrag);
        containerEl.addEventListener('touchend', endDrag);
        containerEl.addEventListener('click', () => deselectVideo());

        animateDVDVideos(containerWidth, containerHeight);
    }, 50);
}

function startDrag(e) {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches ? e.touches[0] : e;
    const container = document.getElementById('dvd-container');
    const containerRect = container.getBoundingClientRect();
    for (const video of dvdVideos) {
        if (video.element === e.currentTarget) {
            draggedVideo = video;
            dragOffsetX = touch.clientX - containerRect.left - video.x;
            dragOffsetY = touch.clientY - containerRect.top - video.y;
            video.element.style.zIndex = '100';
            // Inicializar posición para calcular velocidad
            lastDragX = touch.clientX - containerRect.left;
            lastDragY = touch.clientY - containerRect.top;
            prevLastDragX = lastDragX;
            prevLastDragY = lastDragY;
            lastDragTime = Date.now();
            dragVelocityX = 0;
            dragVelocityY = 0;
            break;
        }
    }
}

function drag(e) {
    if (!draggedVideo) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const container = document.getElementById('dvd-container');
    const containerRect = container.getBoundingClientRect();
    
    // Guardar posición anterior
    prevLastDragX = lastDragX;
    prevLastDragY = lastDragY;
    
    // Actualizar última posición
    lastDragX = touch.clientX - containerRect.left;
    lastDragY = touch.clientY - containerRect.top;
    
    // Calcular velocidad instantánea del ratón
    const currentTime = Date.now();
    const dt = Math.max(currentTime - lastDragTime, 1);
    dragVelocityX = (lastDragX - prevLastDragX);
    dragVelocityY = (lastDragY - prevLastDragY);
    lastDragTime = currentTime;
    
    // Mover video directamente a la posición del ratón
    let newX = lastDragX - dragOffsetX;
    let newY = lastDragY - dragOffsetY;
    
    // Limitar a los bordes del contenedor
    newX = Math.max(0, Math.min(newX, containerRect.width - draggedVideo.width));
    newY = Math.max(55, Math.min(newY, containerRect.height - draggedVideo.height - 70));
    
    draggedVideo.x = newX;
    draggedVideo.y = newY;
    draggedVideo.element.style.left = newX + 'px';
    draggedVideo.element.style.top = newY + 'px';
}

function endDrag() {
    if (draggedVideo) {
        draggedVideo.element.style.zIndex = '10';
        
        // Aplicar la velocidad del ratón al video
        draggedVideo.vx = dragVelocityX;
        draggedVideo.vy = dragVelocityY;
        
        // Resetear contador de frames para mantener la velocidad
        draggedVideo.framesSinceBoost = 0;
        
        draggedVideo = null;
    }
}

function animateDVDVideos(containerWidth, containerHeight) {
    const container = document.getElementById('dvd-container');
    if (!container) return;
    const minY = 55, maxY = containerHeight - 70;
    
    // Primero resolver colisiones
    checkCollisions();
    
    dvdVideos.forEach((video) => {
        // El video arrastrado sigue al ratón, no aplica física
        if (video === draggedVideo) {
            // La posición ya se actualiza en drag(), solo actualizar elemento
            video.element.style.left = video.x + 'px';
            video.element.style.top = video.y + 'px';
            return;
        }
        
        // Increment frame counter
        video.framesSinceBoost++;
        
        // Maintain speed for SPEED_MAINTAIN_FRAMES, then gradually slow down
        if (video.framesSinceBoost > SPEED_MAINTAIN_FRAMES) {
            // Apply friction to gradually reduce speed
            video.vx *= FRICTION;
            video.vy *= FRICTION;
        }
        
        // Ensure minimum speed is maintained
        const currentSpeed = Math.sqrt(video.vx * video.vx + video.vy * video.vy);
        if (currentSpeed < MIN_SPEED) {
            // Boost speed back to minimum
            const angle = Math.atan2(video.vy, video.vx);
            video.vx = Math.cos(angle) * MIN_SPEED;
            video.vy = Math.sin(angle) * MIN_SPEED;
            video.framesSinceBoost = 0;
        }
        
        // Cap maximum speed
        if (currentSpeed > MAX_SPEED) {
            const angle = Math.atan2(video.vy, video.vx);
            video.vx = Math.cos(angle) * MAX_SPEED;
            video.vy = Math.sin(angle) * MAX_SPEED;
            video.framesSinceBoost = 0;
        }
        
        video.x += video.vx;
        video.y += video.vy;
        
        // Bounce off walls
        if (video.x <= 0) { 
            video.x = 0; 
            video.vx = Math.abs(video.vx);
            video.framesSinceBoost = 0;
        }
        if (video.x + video.width >= containerWidth) { 
            video.x = containerWidth - video.width; 
            video.vx = -Math.abs(video.vx);
            video.framesSinceBoost = 0;
        }
        if (video.y <= minY) { 
            video.y = minY; 
            video.vy = Math.abs(video.vy);
            video.framesSinceBoost = 0;
        }
        if (video.y + video.height >= maxY) { 
            video.y = maxY - video.height; 
            video.vy = -Math.abs(video.vy);
            video.framesSinceBoost = 0;
        }
        
        video.element.style.left = video.x + 'px';
        video.element.style.top = video.y + 'px';
    });
    dvdAnimationId = requestAnimationFrame(() => animateDVDVideos(containerWidth, containerHeight));
}

function stopDVDVideos() {
    if (dvdAnimationId) { cancelAnimationFrame(dvdAnimationId); dvdAnimationId = null; }
}

function selectVideo(videoEl) {
    if (selectedVideo) selectedVideo.classList.remove('selected');
    selectedVideo = videoEl;
    videoEl.classList.add('selected');
    const commentBtn = document.getElementById('comment-nav-btn');
    commentBtn.classList.remove('hidden');
    commentBtn.style.display = 'flex';
    
    // Obtener la URL del video actual y generar su ID único
    const videoElement = videoEl.querySelector('.video-element');
    const sourceElement = videoElement.querySelector('source');
    const videoUrl = sourceElement.src;
    const videoId = getVideoIdFromUrl(videoUrl);
    
    console.log('📹 Video seleccionado:', videoId, 'URL:', videoUrl);
    
    // Cargar comentarios para este video específico
    loadVideoComments(videoId);
}

function deselectVideo() {
    if (selectedVideo) { selectedVideo.classList.remove('selected'); selectedVideo = null; }
    const commentBtn = document.getElementById('comment-nav-btn');
    commentBtn.classList.add('hidden');
    commentBtn.style.display = 'none';
    hideCommentsPanel();
}

// Sistema de comentarios por video
let currentVideoId = null;

function loadVideoComments(videoId) {
    currentVideoId = videoId;
    const commentsList = document.getElementById('comments-list');

    if (!commentsList) {
        console.error('❌ No existe comments-list');
        return;
    }

    console.log('📹 Cargando comentarios del video:', videoId);

    // Intentar cargar desde DBClient primero
    if (typeof DBClient !== 'undefined' && DBClient.connected) {
        DBClient.getVideoComments(videoId)
            .then(result => {
                console.log('Comentarios recibidos:', result);

                if (result.success && result.comentarios && result.comentarios.length > 0) {
                    renderComments(commentsList, result.comentarios);
                } else {
                    // Fallback a localStorage si no hay comentarios en BD
                    loadCommentsFromLocalStorage(videoId, commentsList);
                }
            })
            .catch(err => {
                console.error('❌ Error cargando comentarios desde BD:', err);
                // Fallback a localStorage
                loadCommentsFromLocalStorage(videoId, commentsList);
            });
    } else {
        // Usar localStorage directamente si no hay DBClient
        loadCommentsFromLocalStorage(videoId, commentsList);
    }
}

function loadCommentsFromLocalStorage(videoId, commentsList) {
    const comments = DB.getVideoComments(videoId);
    console.log('📂 Cargando comentarios desde localStorage:', comments ? comments.length : 0);
    
    if (comments && comments.length > 0) {
        renderComments(commentsList, comments);
    } else {
        commentsList.innerHTML = '<div class="no-comments">Sé el primero en comentar</div>';
    }
}

function renderComments(commentsList, comments) {
    console.log('Renderizando comentarios:', comments ? comments.length : 0);

    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">Sé el primero en comentar</div>';
        return;
    }

    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        
        const likes = comment.likes || 0;
        const dislikes = comment.dislikes || 0;
        const reports = comment.reports || 0;
        
        commentEl.innerHTML = `
            <div class="comment-avatar">${comment.avatar || '👤'}</div>
            <div class="comment-content">
                <div class="comment-user">${comment.usuario || comment.username}</div>
                <div class="comment-text">${comment.contenido || comment.text}</div>
                <div class="comment-time">${formatTimestamp(comment.created_at)}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn like-btn" data-comment-id="${comment.id}" data-action="like">
                        👍 <span class="count">${likes}</span>
                    </button>
                    <button class="comment-action-btn dislike-btn" data-comment-id="${comment.id}" data-action="dislike">
                        👎 <span class="count">${dislikes}</span>
                    </button>
                    <button class="comment-action-btn report-btn" data-comment-id="${comment.id}" data-action="report">
                        🚩 Reportar
                    </button>
                </div>
            </div>
        `;
        commentsList.appendChild(commentEl);
    });
    
    // Añadir event listeners a los botones
    addCommentActionListeners();
}

// Añadir event listeners a los botones de comentarios
function addCommentActionListeners() {
    // Like
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const commentId = btn.getAttribute('data-comment-id');
            await handleCommentReaction(commentId, 'like');
        });
    });
    
    // Dislike
    document.querySelectorAll('.dislike-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const commentId = btn.getAttribute('data-comment-id');
            await handleCommentReaction(commentId, 'dislike');
        });
    });
    
    // Reportar
    document.querySelectorAll('.report-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const commentId = btn.getAttribute('data-comment-id');
            await handleCommentReport(commentId);
        });
    });
}

// Manejar like/dislike en comentarios
async function handleCommentReaction(commentId, tipo) {
    if (typeof DBClient !== 'undefined' && DBClient.connected) {
        const result = await DBClient.reaccionarComentario(commentId, tipo);
        if (result.success) {
            console.log(`✅ ${tipo} ${result.accion}`);
            // Recargar comentarios para actualizar contadores
            loadVideoComments(currentVideoId);
        } else {
            alert(result.error || 'Error en la reacción');
        }
    } else {
        alert('No hay conexión para reaccionar');
    }
}

// Manejar reportar comentario
async function handleCommentReport(commentId) {
    const razon = prompt('¿Por qué quieres reportar este comentario? (opcional)');
    
    if (typeof DBClient !== 'undefined' && DBClient.connected) {
        const result = await DBClient.reportarComentario(commentId, razon || '');
        if (result.success) {
            alert('✅ Comentario reportado. Gracias por ayudar a mantener la comunidad segura.');
        } else {
            alert(result.error || 'Error reportando comentario');
        }
    } else {
        alert('No hay conexión para reportar');
    }
}

// Formatear timestamp de PostgreSQL
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
}

function sendVideoComment() {
    if (!currentVideoId) {
        console.error('❌ No hay video seleccionado');
        return;
    }

    const input = document.getElementById('comment-input');
    const text = input ? input.value.trim() : '';

    if (!text) {
        console.warn('⚠️ Comentario vacío');
        return;
    }

    const currentUser = DB.getCurrentUser();
    if (!currentUser) {
        alert('Debes iniciar sesión para comentar');
        return;
    }

    console.log('💬 Enviando comentario al video:', currentVideoId, 'Texto:', text);

    // Intentar enviar a BD primero
    if (typeof DBClient !== 'undefined' && DBClient.connected) {
        DBClient.addVideoComment(currentVideoId, text)
            .then(result => {
                console.log('✅ Resultado comentario:', result);

                if (result.success) {
                    console.log('Comentario guardado en BD');
                    input.value = '';
                    // Recargar comentarios para mostrar el nuevo
                    loadVideoComments(currentVideoId);
                } else {
                    console.error('Error en comentario:', result.error);
                    // Fallback a localStorage
                    saveCommentLocal(currentVideoId, currentUser, text, input);
                }
            })
            .catch(err => {
                console.error('❌ Error enviando comentario:', err);
                // Fallback a localStorage
                saveCommentLocal(currentVideoId, currentUser, text, input);
            });
    } else {
        // Usar localStorage directamente si no hay DBClient
        saveCommentLocal(currentVideoId, currentUser, text, input);
    }
}

function saveCommentLocal(videoId, currentUser, text, input) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const comment = {
        id: 'user_' + Date.now(),
        username: currentUser.username,
        avatar: currentUser.avatar || '🐱',
        text: text,
        time: time,
        isBot: false
    };

    DB.saveVideoComment(videoId, comment);
    console.log('Comentario guardado (localStorage):', comment);
    input.value = '';
    loadVideoComments(videoId);
}

function showCommentsPanel() {
    const panel = document.getElementById('comments-panel');
    if (panel) panel.classList.add('active');
    
    // Ocultar Pou cuando se abren comentarios
    const catContainer = document.getElementById('cat-clicker');
    if (catContainer) catContainer.classList.add('hidden');
}

function hideCommentsPanel() {
    const panel = document.getElementById('comments-panel');
    if (panel) panel.classList.remove('active');
    
    // Mostrar Pou cuando se cierran comentarios (si estás en home)
    const catContainer = document.getElementById('cat-clicker');
    const homeScreen = document.getElementById('home-screen');
    if (catContainer && homeScreen && homeScreen.classList.contains('active')) {
        catContainer.classList.remove('hidden');
    }
}

// Función para inicializar botones de comentar en videos
function initVideoCommentButtons() {
    document.querySelectorAll('.video-comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = btn.getAttribute('data-video');
            console.log('Click en comentar video:', videoId);
            loadVideoComments(videoId);
            showCommentsPanel();
        });
    });
}

// Eventos para enviar comentarios
function initCommentEvents() {
    const sendBtn = document.getElementById('send-comment');
    const commentInput = document.getElementById('comment-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendVideoComment);
    }
    if (commentInput) {
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendVideoComment();
        });
    }
}

// Event listeners con validación
const commentNavBtn = document.getElementById('comment-nav-btn');
if (commentNavBtn) commentNavBtn.addEventListener('click', () => { if (selectedVideo) showCommentsPanel(); });

const closeCommentsBtn = document.getElementById('close-comments');
if (closeCommentsBtn) closeCommentsBtn.addEventListener('click', hideCommentsPanel);

// Creator
const uploadBtn = document.getElementById('upload-btn');
if (uploadBtn) uploadBtn.addEventListener('click', () => {
    const videoUpload = document.getElementById('video-upload');
    if (videoUpload) videoUpload.click();
});

const videoUpload = document.getElementById('video-upload');
if (videoUpload) videoUpload.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        const uploadProgress = document.getElementById('upload-progress');
        if (uploadProgress) uploadProgress.classList.remove('hidden');
        setTimeout(() => {
            if (uploadProgress) uploadProgress.classList.add('hidden');
            const uploadSuccess = document.getElementById('upload-success');
            if (uploadSuccess) uploadSuccess.classList.remove('hidden');
        }, 2000);
    }
});

const publishBtn = document.getElementById('publish-btn');
if (publishBtn) publishBtn.addEventListener('click', () => {
    alert('Video publicado!');
    const uploadSuccess = document.getElementById('upload-success');
    if (uploadSuccess) uploadSuccess.classList.add('hidden');
    navigateToScreen('home');
});

// Settings
document.querySelectorAll('.settings-item').forEach((item) => {
    item.addEventListener('click', function() {
        if (this.id === 'logout-settings') return;
        alert(this.textContent);
    });
});

// Ruleta Game Logic
let rouletteBalance = 5000;
let currentBetColor = null;
let currentBetAmount = 0;
let isSpinning = false;
let autoCollectInterval = null;

// Números de ruleta: 0-13 alternan rojo/negro, 14 = verde
// Cada número ocupa 24 grados (360/15)
// El marcador está arriba en 0 grados
// Distribución en la ruleta (en sentido horario desde 0°):
// 0=rojo, 1=negro, 2=rojo, 3=negro, 4=rojo, 5=negro, 6=rojo, 7=negro,
// 8=rojo, 9=negro, 10=rojo, 11=negro, 12=rojo, 13=negro, 14=verde
const rouletteNumbers = {
    green: [14],
    red: [0, 2, 4, 6, 8, 10, 12],
    black: [1, 3, 5, 7, 9, 11, 13]
};

// Mapeo de ángulo a número
// El segmento 0 está en 0-24°, segmento 1 en 24-48°, etc.
function getNumberFromAngle(angle) {
    // Normalizar ángulo a 0-360
    angle = angle % 360;
    if (angle < 0) angle += 360;
    
    // Cada número ocupa 24 grados
    const number = Math.floor(angle / 24);
    return number % 15;
}

function getColorFromNumber(number) {
    if (rouletteNumbers.green.includes(number)) return 'green';
    if (rouletteNumbers.red.includes(number)) return 'red';
    return 'black';
}

function updateRouletteBalance() {
    rouletteBalance = DB.getRouletteBalance();
    document.getElementById('roulette-balance').textContent = rouletteBalance.toLocaleString();
    console.log('Saldo actualizado:', rouletteBalance);
}

function startAutoCollect() {
    if (autoCollectInterval) clearInterval(autoCollectInterval);
    
    // Recolección inmediata si es la primera vez
    const user = DB.getCurrentUser();
    if (user) {
        const now = Date.now();
        const lastCollect = DB.getLastCollectTime();
        const timeDiff = now - lastCollect;
        
        if (timeDiff >= 60000 || lastCollect === 0) {
            DB.addRouletteBalance(5);
            DB.setLastCollectTime();
            updateRouletteBalance();
            console.log('🪙 +5 monedas recolectadas automáticamente');
        }
    }
    
    autoCollectInterval = setInterval(() => {
        const user = DB.getCurrentUser();
        if (!user) return;
        
        const now = Date.now();
        const lastCollect = DB.getLastCollectTime();
        const timeDiff = now - lastCollect;
        
        // Collect every 60 seconds (1 minute)
        if (timeDiff >= 60000) {
            DB.addRouletteBalance(5);
            DB.setLastCollectTime();
            updateRouletteBalance();
            console.log('🪙 +5 monedas recolectadas automáticamente');
        }
    }, 30000); // Check every 30 seconds
}

function initRoulette() {
    const rouletteBtn = document.getElementById('roulette-btn');
    const rouletteOverlay = document.getElementById('roulette-overlay');
    const rouletteClose = document.getElementById('roulette-close');
    const spinBtn = document.getElementById('spin-btn');
    const betAmountInput = document.getElementById('bet-amount');
    const betDecrease = document.getElementById('bet-decrease');
    const betIncrease = document.getElementById('bet-increase');
    const wheel = document.getElementById('roulette-wheel');
    const wheelNumber = document.getElementById('wheel-number');
    const wheelResult = document.getElementById('wheel-result');
    const catContainer = document.getElementById('cat-clicker');

    if (!rouletteBtn) return;

    // Open roulette
    rouletteBtn.addEventListener('click', () => {
        updateRouletteBalance();
        rouletteOverlay.classList.remove('hidden');
        startAutoCollect();
        // Ocultar Pou cuando se abre la ruleta
        if (catContainer) catContainer.classList.add('hidden');
    });

    // Close roulette
    if (rouletteClose) {
        rouletteClose.addEventListener('click', () => {
            rouletteOverlay.classList.add('hidden');
            // Mostrar Pou cuando se cierra la ruleta (si estás en home)
            if (catContainer) catContainer.classList.remove('hidden');
        });
    }
    
    // Bet options
    document.querySelectorAll('.bet-option').forEach(option => {
        option.addEventListener('click', () => {
            if (isSpinning) return;
            
            document.querySelectorAll('.bet-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            currentBetColor = option.getAttribute('data-color');
            
            const colorNames = { red: 'ROJO', green: 'VERDE', black: 'NEGRO' };
            document.getElementById('current-bet-color').textContent = colorNames[currentBetColor];
            document.getElementById('current-bet-color').style.color = 
                currentBetColor === 'red' ? '#ff6b6b' : 
                currentBetColor === 'green' ? '#00b894' : '#fff';
        });
    });
    
    // Bet amount controls
    if (betDecrease) {
        betDecrease.addEventListener('click', () => {
            let amount = parseInt(betAmountInput.value) || 50;
            amount = Math.max(50, amount - 50);
            amount = Math.min(10000, amount);
            betAmountInput.value = amount;
        });
    }
    
    if (betIncrease) {
        betIncrease.addEventListener('click', () => {
            let amount = parseInt(betAmountInput.value) || 50;
            amount = Math.min(10000, amount + 50);
            amount = Math.max(50, amount);
            betAmountInput.value = amount;
        });
    }
    
    // Bet presets
    document.querySelectorAll('.bet-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const amount = parseInt(preset.getAttribute('data-amount'));
            betAmountInput.value = amount;
        });
    });
    
    // Spin button
    if (spinBtn) {
        spinBtn.addEventListener('click', () => {
            if (isSpinning) return;
            if (!currentBetColor) {
                alert('Selecciona un color para apostar (ROJO, VERDE o NEGRO)');
                return;
            }

            const betAmount = parseInt(betAmountInput.value) || 50;

            // Validate bet amount
            if (betAmount < 50) {
                alert('La apuesta mínima es 50 monedas');
                return;
            }
            if (betAmount > 10000) {
                alert('La apuesta máxima es 10,000 monedas');
                return;
            }
            if (betAmount > rouletteBalance) {
                alert('No tienes suficientes monedas');
                return;
            }

            // Deduct bet
            currentBetAmount = betAmount;
            DB.addRouletteBalance(-betAmount);
            updateRouletteBalance();
            console.log('Apuesta realizada:', betAmount);

            // Spin
            isSpinning = true;
            spinBtn.disabled = true;
            wheelResult.textContent = '';
            wheelResult.className = 'wheel-result';

            // Determinar el resultado con probabilidades:
            // 30% verde (número 14), 70% rojo/negro (números 0-13)
            const randomChance = Math.random();
            let targetSegment;
            
            if (randomChance < 0.30) {
                // 30% probabilidad de verde (segmento 14: 336-360 grados)
                targetSegment = 14;
            } else {
                // 70% probabilidad de rojo o negro (segmentos 0-13: 0-336 grados)
                targetSegment = Math.floor(Math.random() * 14); // 0-13
            }
            
            // Calcular ángulo dentro del segmento (centro del segmento + variación)
            const segmentAngle = 360 / 15; // 24 grados por segmento
            const randomOffset = Math.floor(Math.random() * 16) + 4; // 4-20 grados (centro del segmento)
            const baseAngle = targetSegment * segmentAngle;
            const finalSegmentAngle = baseAngle + randomOffset;
            
            const totalRotations = 8 * 360; // 8 vueltas completas para más realismo
            const finalAngle = totalRotations + finalSegmentAngle;

            console.log('Segmento objetivo:', targetSegment, 'Ángulo final:', finalAngle % 360);

            // Animate con rotación específica - parada suave y realista
            wheel.style.transition = 'none';
            wheel.style.transform = 'rotate(0deg)';
            
            setTimeout(() => {
                // Cubic bezier para desaceleración realista (empieza rápido, frena suavemente)
                wheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
                wheel.style.transform = `rotate(${finalAngle}deg)`;
            }, 50);

            setTimeout(() => {
                // Calcular el número ganador basado en el ángulo final
                const resultNumber = getNumberFromAngle(finalAngle);
                const resultColor = getColorFromNumber(resultNumber);
                
                wheelNumber.textContent = resultNumber;
                wheelNumber.style.color = 
                    resultColor === 'green' ? '#00b894' : 
                    resultColor === 'red' ? '#ff6b6b' : '#fff';

                console.log('Resultado:', resultNumber, 'Color:', resultColor, 'Ángulo:', finalAngle % 360);

                const colorNames = { red: 'ROJO', black: 'NEGRO', green: 'VERDE' };
                const colorStyles = { red: '#ff6b6b', black: '#fff', green: '#00b894' };

                // Check win/lose - SOLO ganas si apostaste al color que salió
                if (currentBetColor === resultColor) {
                    // Win!
                    let multiplier = 2; // red/black
                    if (resultColor === 'green') multiplier = 14;

                    const winAmount = currentBetAmount * multiplier;
                    DB.addRouletteBalance(winAmount);
                    updateRouletteBalance();
                    console.log('¡GANASTE!', winAmount);

                    // Mostrar mensaje de victoria con cantidad y color
                    wheelResult.innerHTML = `
                        <div class="win-message">
                            <div>¡GANASTE ${winAmount.toLocaleString()} 🪙!</div>
                            <div class="color-result" style="color: ${colorStyles[resultColor]}">Salió ${colorNames[resultColor]}</div>
                        </div>
                    `;
                    wheelResult.className = 'wheel-result win';
                } else {
                    // Lose - mala suerte
                    wheelResult.innerHTML = `
                        <div class="lose-message">
                            <div>¡Oh, qué mala suerte!</div>
                            <div class="color-result" style="color: ${colorStyles[resultColor]}">Salió ${colorNames[resultColor]}</div>
                        </div>
                    `;
                    wheelResult.className = 'wheel-result lose';
                }

                isSpinning = false;
                spinBtn.disabled = false;
                currentBetAmount = 0;
                // NO reset rotation - leave wheel at result position
            }, 4000);
        });
    }
    
    // Initialize balance
    updateRouletteBalance();
}

// Initialize roulette when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initRoulette, 500);
});

window.addEventListener('resize', () => {
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen && homeScreen.classList.contains('active')) {
        stopDVDVideos();
        setTimeout(initDVDVideos, 100);
    }
});

console.log('DOPMAX - Aplicacion cargada correctamente con sistema de login y ruleta');
