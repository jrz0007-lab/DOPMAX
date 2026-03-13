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

        const defaultUsers = [
            { id: '1', username: 'maria_gomez', password: '1234', room: 'Global', avatar: '👩', createdAt: new Date().toISOString() },
            { id: '2', username: 'carlos_99', password: '1234', room: 'Global', avatar: '👨', createdAt: new Date().toISOString() },
            { id: '3', username: 'lucia_fernandez', password: '1234', room: 'Global', avatar: '👧', createdAt: new Date().toISOString() },
            { id: '4', username: 'pedro_sanchez', password: '1234', room: 'Musica', avatar: '👦', createdAt: new Date().toISOString() },
            { id: '5', username: 'ana_lopez', password: '1234', room: 'Gaming', avatar: '👩‍🦰', createdAt: new Date().toISOString() },
            { id: '6', username: 'dj_ricardo', password: '1234', room: 'Musica', avatar: '🎧', createdAt: new Date().toISOString() },
            { id: '7', username: 'guitarhero', password: '1234', room: 'Musica', avatar: '🎸', createdAt: new Date().toISOString() },
            { id: '8', username: 'progamer_x', password: '1234', room: 'Gaming', avatar: '🎮', createdAt: new Date().toISOString() },
            { id: '9', username: 'futbolfan', password: '1234', room: 'Deportes', avatar: '⚽', createdAt: new Date().toISOString() },
            { id: '10', username: 'chefmaster', password: '1234', room: 'Comida', avatar: '👨‍🍳', createdAt: new Date().toISOString() }
        ];

        defaultUsers.forEach(user => DB.saveUser(user));
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
                { id: 5, name: 'Ana Lopez', avatar: '👩‍🦰', lastMessage: 'Oye, ¿me puedes ayudar con...?', time: 'Lun', isUser: false }
            ],
            'Musica': [
                { id: 6, name: 'DJ_Ricardo', avatar: '🎧', lastMessage: '¡Esa canción está increíble!', time: '11:00', isUser: false },
                { id: 7, name: 'GuitarHero', avatar: '🎸', lastMessage: '¿Vamos a jam session?', time: '10:45', isUser: false },
                { id: 8, name: 'PianoMaster', avatar: '🎹', lastMessage: 'Te mando la partitura', time: '09:30', isUser: false },
                { id: 9, name: 'BassLine', avatar: '🎵', lastMessage: 'El ritmo está perfecto', time: 'Ayer', isUser: false }
            ],
            'Gaming': [
                { id: 10, name: 'ProGamer_X', avatar: '🎮', lastMessage: '¿Partida hoy?', time: '12:00', isUser: false },
                { id: 11, name: 'SpeedRun_King', avatar: '🏆', lastMessage: 'Nuevo record mundial!', time: '11:30', isUser: false },
                { id: 12, name: 'NoobSlayer', avatar: '⚔️', lastMessage: 'Te enseño a jugar', time: '10:00', isUser: false },
                { id: 13, name: 'CasualPlayer', avatar: '🎲', lastMessage: 'Solo quiero divertirme', time: 'Ayer', isUser: false }
            ],
            'Deportes': [
                { id: 14, name: 'FutbolFan', avatar: '⚽', lastMessage: '¿Viste el partido?', time: '13:00', isUser: false },
                { id: 15, name: 'GymRat', avatar: '💪', lastMessage: 'Rutina de hoy completada', time: '12:30', isUser: false },
                { id: 16, name: 'RunnerGirl', avatar: '🏃', lastMessage: '10km en 45min!', time: '11:00', isUser: false },
                { id: 17, name: 'BasketPro', avatar: '🏀', lastMessage: '¿Cancha a las 5?', time: 'Ayer', isUser: false }
            ],
            'Comida': [
                { id: 18, name: 'ChefMaster', avatar: '👨‍🍳', lastMessage: 'Receta de pasta lista', time: '14:00', isUser: false },
                { id: 19, name: 'FoodLover', avatar: '🍕', lastMessage: 'El mejor restaurante italiano', time: '13:30', isUser: false },
                { id: 20, name: 'VeggieLife', avatar: '🥗', lastMessage: 'Ensalada del día', time: '12:00', isUser: false },
                { id: 21, name: 'DulcePostre', avatar: '🍰', lastMessage: 'Tarta de chocolate casera', time: 'Ayer', isUser: false }
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
        const rooms = ['Global', 'Musica', 'Gaming', 'Deportes', 'Comida'];
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
    // Initialize default users and bots
    DB.initDefaultUsers();
    DB.initBots();

    // Initialize comment events
    setTimeout(() => {
        initCommentEvents();
    }, 100);

    // Disable context menu and copy/paste
    document.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });
    document.addEventListener('copy', (e) => { e.preventDefault(); return false; });
    document.addEventListener('cut', (e) => { e.preventDefault(); return false; });
    document.addEventListener('paste', (e) => {
        const allowed = ['comment-input', 'chat-input', 'login-username', 'login-password', 'register-username', 'register-password', 'register-confirm'];
        if (e.target.id && allowed.includes(e.target.id)) return;
        e.preventDefault(); return false;
    });
    document.addEventListener('keydown', (e) => {
        const allowed = ['comment-input', 'chat-input', 'login-username', 'login-password', 'register-username', 'register-password', 'register-confirm'];
        if (e.target.id && allowed.includes(e.target.id)) return;
        if ((e.ctrlKey || e.metaKey) && ['c','v','x','a'].includes(e.key.toLowerCase())) {
            e.preventDefault(); return false;
        }
    });

    // Check if user is logged in
    const currentUser = DB.getCurrentUser();
    if (currentUser) {
        initializeApp(currentUser);
    } else {
        showAuthScreen();
    }

    // Auth form handlers
    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('register-error').classList.add('hidden');
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('login-error').classList.add('hidden');
    });

    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('register-btn').addEventListener('click', handleRegister);

    // Enter key for login
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Enter key for register
    document.getElementById('register-confirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });

    // Logout handlers
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('logout-settings').addEventListener('click', handleLogout);
});

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    if (!username || !password) {
        errorEl.textContent = 'Por favor completa todos los campos';
        errorEl.classList.remove('hidden');
        return;
    }

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
    initializeApp(user);
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

    if (DB.getUserByUsername(username)) {
        errorEl.textContent = 'Este nombre de usuario ya está en uso';
        errorEl.classList.remove('hidden');
        return;
    }

    const rooms = ['Global', 'Musica', 'Gaming', 'Deportes', 'Comida'];
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    
    const newUser = {
        id: Date.now().toString(),
        username: username,
        password: password,
        room: randomRoom,
        avatar: ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁'][Math.floor(Math.random() * 6)],
        createdAt: new Date().toISOString()
    };

    DB.saveUser(newUser);
    DB.setCurrentUser(newUser);
    initializeApp(newUser);
}

function handleLogout() {
    DB.setCurrentUser(null);
    showAuthScreen();
    
    // Reset forms
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm').value = '';
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('register-error').classList.add('hidden');
}

function showAuthScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function initializeApp(user) {
    // Hide loading and auth screens
    document.getElementById('loading-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.remove('active');
    
    // Update UI with user info
    document.getElementById('current-username').textContent = user.username;
    document.getElementById('profile-username').textContent = '@' + user.username;
    document.querySelector('.profile-pic-large').textContent = user.avatar;
    document.querySelector('.profile-avatar').textContent = user.avatar;
    
    // Update room indicator
    document.getElementById('room-indicator').textContent = 'Sala: ' + user.room;
    
    // Show home screen
    document.getElementById('home-screen').classList.add('active');
    
    // Initialize DVD videos
    setTimeout(initDVDVideos, 100);
    
    // Setup navigation
    setupNavigation();
    
    // Load chats for current room
    loadChatsForRoom(user.room);
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('[data-screen]');
    const screens = document.querySelectorAll('.screen:not(#loading-screen):not(#auth-screen)');
    
    navButtons.forEach((button) => {
        button.addEventListener('click', () => {
            navigateToScreen(button.getAttribute('data-screen'));
        });
    });

    function navigateToScreen(screenName) {
        screens.forEach((screen) => screen.classList.remove('active'));
        const targetElement = document.getElementById(screenName + '-screen');
        if (targetElement) targetElement.classList.add('active');
        if (screenName === 'home') initDVDVideos(); else stopDVDVideos();
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
document.getElementById('back-to-inbox').addEventListener('click', () => {
    document.getElementById('chat-overlay').classList.remove('active');
    document.getElementById('chat-overlay').classList.add('hidden');
});

document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

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
    
    const userChats = DB.getUserChats(currentUser.id);
    const container = document.getElementById('user-chats-list');
    
    if (!container) return;
    
    if (userChats.length === 0) {
        container.innerHTML = '<div class="no-chats-message">No tienes chats aún. ¡Busca usuarios y escribeles!</div>';
        return;
    }
    
    container.innerHTML = '';
    userChats.forEach(chat => {
        const chatEl = document.createElement('div');
        chatEl.className = 'chat-item';
        chatEl.setAttribute('data-chat', chat.userId);
        chatEl.setAttribute('data-user-chat', 'true');
        chatEl.innerHTML = `
            <div class="chat-avatar">${chat.avatar || '👤'}</div>
            <div class="chat-info">
                <div class="chat-name">@${chat.username}</div>
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
    
    const users = DB.searchUsers(query, currentUser.id);
    
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
                startChatWithUser(userId, username, avatar);
            });
        });
    }
    
    searchResults.classList.remove('hidden');
}

function startChatWithUser(userId, username, avatar) {
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;
    
    // Verificar si ya existe el chat
    let userChats = DB.getUserChats(currentUser.id);
    let existingChat = userChats.find(c => c.userId === userId);
    
    if (!existingChat) {
        // Crear nuevo chat
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        existingChat = {
            userId: userId,
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
    const chatEl = document.querySelector(`.chat-item[data-chat="${userId}"][data-user-chat="true"]`);
    if (chatEl) {
        openUserChat(chatEl);
    }
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
                <div class="chat-message-avatar">${msg.sent ? '🐱' : '👤'}</div>
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

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    const currentUser = DB.getCurrentUser();
    if (!currentUser) return;
    
    const chatOverlay = document.getElementById('chat-overlay');
    const chatName = chatOverlay.querySelector('#chat-overlay-name').textContent.replace('@', '');
    
    // Verificar si es un chat de usuario
    const isUserChat = chatOverlay.querySelector('.chat-item[data-user-chat="true"]') !== null || 
                       document.querySelector(`.chat-item .chat-name:contains("@${chatName}")`) !== null;
    
    // Obtener userId del chat actual
    let chatId = null;
    const userChats = DB.getUserChats(currentUser.id);
    const userChat = userChats.find(c => c.username === chatName);
    
    if (userChat) {
        // Es un chat con usuario real
        chatId = userChat.userId;
        
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        const message = {
            text: text,
            sent: true,
            time: time
        };
        
        DB.saveMessage(chatId, null, message, true, currentUser.id);
        
        // Actualizar último mensaje
        userChat.lastMessage = text;
        userChat.time = time;
        DB.saveUserChat(currentUser.id, userChat);
        
        loadUserChatMessages(chatId);
        loadUserChats();
    } else {
        // Chat predeterminado (no usuario real)
        const roomName = currentUser.room;
        const defaultChats = DB.getChatsForRoom(roomName);
        const defaultChat = defaultChats.find(c => c.name === chatName);
        
        if (defaultChat) {
            chatId = defaultChat.id;
            
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
    
    input.value = '';
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

const videoList = [
    'videos/12313131.mp4',
    'videos/13º112.mp4',
    'videos/151511616.mp4',
    'videos/151516162172172.mp4',
    'videos/211.mp4',
    'videos/314141.mp4',
    'videos/521515.mp4',
    'videos/525.mp4',
    'videos/africa.mp4',
    'videos/Download (1).mp4',
    'videos/Download (2).mp4',
    'videos/Download (3).mp4',
    'videos/Download (4).mp4',
    'videos/Download (5).mp4',
    'videos/Download (6).mp4',
    'videos/Download (7).mp4',
    'videos/Download.mp4'
];

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
                source.src = getRandomVideo(source.src);
                video.load();
                video.play();
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
    });
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

        document.querySelectorAll('.dvd-video').forEach((video, index) => {
            const videoWidth = video.offsetWidth || 200;
            const videoHeight = video.offsetHeight || 280;
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
    const comments = DB.getVideoComments(videoId);
    const commentsList = document.getElementById('comments-list');
    
    if (!commentsList) return;
    
    console.log('Cargando comentarios para:', videoId, 'Total:', comments.length);
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">Sé el primero en comentar</div>';
        return;
    }
    
    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        commentEl.innerHTML = `
            <div class="comment-avatar">${comment.avatar || '👤'}</div>
            <div class="comment-content">
                <div class="comment-user">${comment.username}</div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-time">${comment.time}</div>
            </div>
        `;
        commentsList.appendChild(commentEl);
    });
}

function sendVideoComment() {
    if (!currentVideoId) return;
    
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;
    
    const currentUser = DB.getCurrentUser();
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const comment = {
        id: 'user_' + Date.now(),
        username: currentUser ? currentUser.username : 'Usuario',
        avatar: currentUser ? currentUser.avatar : '🐱',
        text: text,
        time: time,
        isBot: false
    };
    
    DB.saveVideoComment(currentVideoId, comment);
    console.log('Comentario guardado:', comment);
    input.value = '';
    loadVideoComments(currentVideoId);
}

function showCommentsPanel() { 
    const panel = document.getElementById('comments-panel');
    if (panel) panel.classList.add('active'); 
}
function hideCommentsPanel() { 
    const panel = document.getElementById('comments-panel');
    if (panel) panel.classList.remove('active'); 
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

document.getElementById('comment-nav-btn').addEventListener('click', () => { if (selectedVideo) showCommentsPanel(); });
document.getElementById('close-comments').addEventListener('click', hideCommentsPanel);

// Creator
document.getElementById('upload-btn').addEventListener('click', () => document.getElementById('video-upload').click());
document.getElementById('video-upload').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        document.getElementById('upload-progress').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('upload-progress').classList.add('hidden');
            document.getElementById('upload-success').classList.remove('hidden');
        }, 2000);
    }
});
document.getElementById('publish-btn').addEventListener('click', () => {
    alert('Video publicado!');
    document.getElementById('upload-success').classList.add('hidden');
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
    
    if (!rouletteBtn) return;
    
    // Open roulette
    rouletteBtn.addEventListener('click', () => {
        updateRouletteBalance();
        rouletteOverlay.classList.remove('hidden');
        startAutoCollect();
    });
    
    // Close roulette
    if (rouletteClose) {
        rouletteClose.addEventListener('click', () => {
            rouletteOverlay.classList.add('hidden');
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
