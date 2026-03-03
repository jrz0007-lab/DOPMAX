// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // DESHABILITAR COPIAR, PEGAR Y MENÚ CONTEXTUAL
    // ==========================================

    // Deshabilitar menú contextual (click derecho)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Deshabilitar copiar
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
    });

    // Deshabilitar cortar
    document.addEventListener('cut', (e) => {
        e.preventDefault();
        return false;
    });

    // Deshabilitar pegar (solo permitir en comentarios y chat)
    document.addEventListener('paste', (e) => {
        const allowedInputs = ['comment-input', 'chat-input'];
        if (e.target.id && allowedInputs.includes(e.target.id)) {
            return; // Permitir pegar en comentarios y chat
        }
        e.preventDefault();
        return false;
    });

    // Deshabilitar atajos de teclado (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A)
    document.addEventListener('keydown', (e) => {
        const allowedInputs = ['comment-input', 'chat-input'];
        
        // Permitir Ctrl+V, Ctrl+C, Ctrl+X solo en inputs de comentarios y chat
        if (e.target.id && allowedInputs.includes(e.target.id)) {
            return;
        }
        
        if ((e.ctrlKey || e.metaKey) && 
            (e.key === 'c' || e.key === 'C' || 
             e.key === 'v' || e.key === 'V' || 
             e.key === 'x' || e.key === 'X' ||
             e.key === 'a' || e.key === 'A')) {
            e.preventDefault();
            return false;
        }
    });

    // Pantalla de carga - simular tiempo de carga
    const loadingScreen = document.getElementById('loading-screen');
    const homeScreen = document.getElementById('home-screen');
    
    // Mostrar pantalla de carga por 2.5 segundos
    setTimeout(() => {
        loadingScreen.classList.remove('active');
        homeScreen.classList.add('active');
        initDVDVideos(); // Iniciar animación DVD al cargar home
    }, 2500);
    
    // Navegación entre pantallas
    const navButtons = document.querySelectorAll('[data-screen]');
    const screens = document.querySelectorAll('.screen:not(#loading-screen)');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreen = button.getAttribute('data-screen');
            navigateToScreen(targetScreen);
        });
    });
    
    // Función de navegación
    function navigateToScreen(screenName) {
        // Ocultar todas las pantallas excepto loading
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar la pantalla objetivo
        const targetElement = document.getElementById(`${screenName}-screen`);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        
        // Actualizar estado activo en la barra de navegación
        updateNavActiveState(screenName);
        
        // Iniciar animación DVD si vamos al home
        if (screenName === 'home') {
            initDVDVideos();
        } else {
            stopDVDVideos();
        }
        
        // Ocultar panel de comentarios y botón central al cambiar de pantalla
        hideCommentsPanel();
    }
    
    // Actualizar el estado activo de los botones de navegación
    function updateNavActiveState(screenName) {
        const allNavBars = document.querySelectorAll('.bottom-nav');
        
        allNavBars.forEach(navBar => {
            const navButtons = navBar.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => {
                const btnScreen = btn.getAttribute('data-screen');
                if (btnScreen === screenName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    }
    
    // Tabs de "Seguidos" y "Para Ti"
    const tabs = document.querySelectorAll('.top-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Tabs de la bandeja de entrada
    const inboxTabs = document.querySelectorAll('.inbox-tab');
    const notificationsContent = document.getElementById('notifications-content');
    const messagesContent = document.getElementById('messages-content');
    
    inboxTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            inboxTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.getAttribute('data-tab');
            if (tabName === 'notifications') {
                notificationsContent.classList.remove('hidden');
                messagesContent.classList.add('hidden');
            } else if (tabName === 'messages') {
                notificationsContent.classList.add('hidden');
                messagesContent.classList.remove('hidden');
            }
        });
    });
    
    // ==========================================
    // ANIMACIÓN DVD - 3 Videos rebotando
    // ==========================================

    let dvdAnimationId = null;
    const dvdVideos = [];
    let selectedVideo = null;
    let draggedVideo = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let lastDragX = 0;
    let lastDragY = 0;
    let lastDragTime = 0;
    const FRICTION = 0.96; // Coeficiente de fricción para desaceleración
    const MIN_SPEED = 0.15; // Velocidad mínima base

    // Lista de videos disponibles
    const videoList = [
        'videos/12313131.mp4',
        'videos/13º112.mp4',
        'videos/151511616.mp4',
        'videos/151516162172172.mp4',
        'videos/211.mp4',
        'videos/314141.mp4',
        'videos/525.mp4',
        'videos/Download (1).mp4',
        'videos/Download (2).mp4',
        'videos/Download (3).mp4',
        'videos/Download (4).mp4',
        'videos/Download (5).mp4',
        'videos/Download (6).mp4',
        'videos/Download (7).mp4',
        'videos/Download.mp4'
    ];

    // Función para obtener un video aleatorio que no sea el actual
    function getRandomVideo(currentVideo) {
        let newVideo;
        do {
            newVideo = videoList[Math.floor(Math.random() * videoList.length)];
        } while (videoList.length > 1 && newVideo === currentVideo);
        return newVideo;
    }

    // Función para asignar videos aleatorios a los 3 elementos
    function assignRandomVideos() {
        const videos = document.querySelectorAll('.dvd-video');
        const shuffledVideos = [...videoList].sort(() => Math.random() - 0.5);
        
        videos.forEach((video, index) => {
            const videoElement = video.querySelector('video');
            const sourceElement = videoElement.querySelector('source');
            if (sourceElement) {
                sourceElement.src = shuffledVideos[index % shuffledVideos.length];
                videoElement.load();
            }
        });
    }

    function initDVDVideos() {
        const container = document.getElementById('dvd-container');
        if (!container) return;

        // Asignar videos aleatorios antes de iniciar
        assignRandomVideos();

        // Pequeño delay para asegurar que el contenedor está renderizado
        setTimeout(() => {
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            // Limpiar array
            dvdVideos.length = 0;

            // Obtener los 3 videos
            const videos = document.querySelectorAll('.dvd-video');

            videos.forEach((video, index) => {
                const videoWidth = video.offsetWidth || 200;
                const videoHeight = video.offsetHeight || 280;

                // Posición inicial aleatoria dentro del contenedor
                const maxX = containerWidth - videoWidth;
                const maxY = containerHeight - videoHeight - 55; // 55px para los tabs
                const startX = Math.random() * maxX;
                const startY = 55 + Math.random() * (containerHeight - videoHeight - 55);

                // Velocidades aleatorias (entre 0.15 y 0.25, con dirección aleatoria)
                const speedX = 0.15 + Math.random() * 0.1;
                const speedY = 0.15 + Math.random() * 0.1;
                const vx = (Math.random() > 0.5 ? 1 : -1) * speedX;
                const vy = (Math.random() > 0.5 ? 1 : -1) * speedY;

                video.style.width = videoWidth + 'px';
                video.style.height = videoHeight + 'px';
                video.style.left = startX + 'px';
                video.style.top = startY + 'px';
                video.style.removeProperty('display');
                video.style.touchAction = 'none'; // Prevenir scroll al arrastrar

                // Obtener el elemento de video y configurar cambio aleatorio
                const videoElement = video.querySelector('video');
                if (videoElement) {
                    videoElement.addEventListener('ended', () => {
                        const currentSrc = videoElement.querySelector('source').src;
                        const newVideoSrc = getRandomVideo(currentSrc);
                        videoElement.querySelector('source').src = newVideoSrc;
                        videoElement.load();
                        videoElement.play();
                    });
                }

                dvdVideos.push({
                    element: video,
                    x: startX,
                    y: startY,
                    vx: vx,
                    vy: vy,
                    width: videoWidth,
                    height: videoHeight
                });

                // Eventos de arrastre (mouse y touch)
                video.addEventListener('mousedown', startDrag);
                video.addEventListener('touchstart', startDrag, { passive: false });

                // Click en video para seleccionar
                video.addEventListener('click', (e) => {
                    if (!draggedVideo) {
                        e.stopPropagation();
                        selectVideo(video);
                    }
                });
            });

            // Eventos globales para arrastre
            const containerEl = document.getElementById('dvd-container');
            containerEl.addEventListener('mousemove', drag);
            containerEl.addEventListener('touchmove', drag, { passive: false });
            containerEl.addEventListener('mouseup', endDrag);
            containerEl.addEventListener('touchend', endDrag);

            // Click en contenedor para deseleccionar
            containerEl.addEventListener('click', () => {
                deselectVideo();
            });

            // Iniciar animación
            animateDVDVideos(containerWidth, containerHeight);
        }, 50);
    }

    // ==========================================
    // ARRASTRAR VIDEOS
    // ==========================================

    function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const touch = e.touches ? e.touches[0] : e;
        const container = document.getElementById('dvd-container');
        const containerRect = container.getBoundingClientRect();
        
        // Encontrar el video que se está arrastrando
        for (const video of dvdVideos) {
            if (video.element === e.currentTarget) {
                draggedVideo = video;
                dragOffsetX = touch.clientX - containerRect.left - video.x;
                dragOffsetY = touch.clientY - containerRect.top - video.y;
                lastDragX = touch.clientX;
                lastDragY = touch.clientY;
                lastDragTime = Date.now();
                
                // Pausar animación del video arrastrado
                video.element.style.transition = 'none';
                video.element.style.zIndex = '100';
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
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Nueva posición
        let newX = touch.clientX - containerRect.left - dragOffsetX;
        let newY = touch.clientY - containerRect.top - dragOffsetY;
        
        // Límites
        const minY = 55;
        const maxY = containerHeight - draggedVideo.height;
        const maxX = containerWidth - draggedVideo.width;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));
        
        // Actualizar posición
        draggedVideo.x = newX;
        draggedVideo.y = newY;
        draggedVideo.element.style.left = newX + 'px';
        draggedVideo.element.style.top = newY + 'px';
        
        // Calcular velocidad basada en el movimiento (reducida para menos deslizamiento)
        const now = Date.now();
        const dt = now - lastDragTime;
        if (dt > 0 && dt < 100) {
            const deltaX = touch.clientX - lastDragX;
            const deltaY = touch.clientY - lastDragY;
            draggedVideo.vx = (deltaX / dt * 16) * 0.3; // 70% menos deslizamiento
            draggedVideo.vy = (deltaY / dt * 16) * 0.3;
        }

        lastDragX = touch.clientX;
        lastDragY = touch.clientY;
        lastDragTime = now;
    }

    function endDrag(e) {
        if (!draggedVideo) return;
        
        draggedVideo.element.style.zIndex = '10';
        draggedVideo = null;
    }
    
    function animateDVDVideos(containerWidth, containerHeight) {
        const container = document.getElementById('dvd-container');
        if (!container) {
            return;
        }

        // Límites exactos
        const tabsHeight = 55; // Altura de los tabs "Seguidos | Para Ti"
        const navHeight = 70;  // Altura del menú inferior

        // Límite superior: tabs
        const minY = tabsHeight;
        // Límite inferior: borde del contenedor (videos llegan hasta abajo del todo)
        const maxY = containerHeight + navHeight;

        // Verificar colisiones entre videos
        checkVideoCollisions();

        dvdVideos.forEach((video, index) => {
            // No mover el video que se está arrastrando
            if (video === draggedVideo) return;

            const videoEl = video.element;
            const videoWidth = video.width;
            const videoHeight = video.height;

            // Aplicar fricción para desacelerar gradualmente
            video.vx *= FRICTION;
            video.vy *= FRICTION;

            // Mantener velocidad mínima
            if (Math.abs(video.vx) < MIN_SPEED) {
                video.vx = (video.vx >= 0 ? 1 : -1) * MIN_SPEED;
            }
            if (Math.abs(video.vy) < MIN_SPEED) {
                video.vy = (video.vy >= 0 ? 1 : -1) * MIN_SPEED;
            }

            // Actualizar posición
            video.x += video.vx;
            video.y += video.vy;

            // Rebote en los bordes
            if (video.x <= 0) {
                video.x = 0;
                video.vx = Math.abs(video.vx);
                flashVideo(videoEl);
            }
            if (video.x + videoWidth >= containerWidth) {
                video.x = containerWidth - videoWidth;
                video.vx = -Math.abs(video.vx);
                flashVideo(videoEl);
            }
            if (video.y <= minY) {
                video.y = minY;
                video.vy = Math.abs(video.vy);
                flashVideo(videoEl);
            }
            if (video.y + videoHeight >= maxY) {
                video.y = maxY - videoHeight;
                video.vy = -Math.abs(video.vy);
                flashVideo(videoEl);
            }

            // Aplicar nueva posición
            videoEl.style.left = video.x + 'px';
            videoEl.style.top = video.y + 'px';
        });

        // Continuar animación
        dvdAnimationId = requestAnimationFrame(() => animateDVDVideos(containerWidth, maxY));
    }
    
    function checkVideoCollisions() {
        for (let i = 0; i < dvdVideos.length; i++) {
            for (let j = i + 1; j < dvdVideos.length; j++) {
                const v1 = dvdVideos[i];
                const v2 = dvdVideos[j];

                // Detectar colisión
                if (v1.x < v2.x + v2.width &&
                    v1.x + v1.width > v2.x &&
                    v1.y < v2.y + v2.height &&
                    v1.y + v1.height > v2.y) {

                    // Separar los videos para evitar que se queden pegados
                    const overlapX = Math.min(v1.x + v1.width, v2.x + v2.width) - Math.max(v1.x, v2.x);
                    const overlapY = Math.min(v1.y + v1.height, v2.y + v2.height) - Math.max(v1.y, v2.y);

                    if (overlapX < overlapY) {
                        // Colisión horizontal
                        if (v1.x < v2.x) {
                            v1.x -= overlapX / 2;
                            v2.x += overlapX / 2;
                        } else {
                            v1.x += overlapX / 2;
                            v2.x -= overlapX / 2;
                        }
                        // Intercambiar velocidad X
                        const tempVx = v1.vx;
                        v1.vx = v2.vx;
                        v2.vx = tempVx;
                    } else {
                        // Colisión vertical
                        if (v1.y < v2.y) {
                            v1.y -= overlapY / 2;
                            v2.y += overlapY / 2;
                        } else {
                            v1.y += overlapY / 2;
                            v2.y -= overlapY / 2;
                        }
                        // Intercambiar velocidad Y
                        const tempVy = v1.vy;
                        v1.vy = v2.vy;
                        v2.vy = tempVy;
                    }

                    flashVideo(v1.element);
                    flashVideo(v2.element);
                }
            }
        }
    }
    
    function flashVideo(videoEl) {
        videoEl.style.boxShadow = '0 0 30px 5px rgba(247, 185, 22, 0.8)';
        setTimeout(() => {
            videoEl.style.boxShadow = '';
        }, 200);
    }

    function stopDVDVideos() {
        if (dvdAnimationId) {
            cancelAnimationFrame(dvdAnimationId);
            dvdAnimationId = null;
        }
    }

    // ==========================================
    // SELECCIÓN DE VIDEO Y COMENTARIOS
    // ==========================================

    function selectVideo(videoEl) {
        // Deseleccionar anterior
        if (selectedVideo) {
            selectedVideo.classList.remove('selected');
        }

        // Seleccionar nuevo
        selectedVideo = videoEl;
        videoEl.classList.add('selected');

        // Mostrar botón central de comentarios
        const commentBtn = document.getElementById('comment-nav-btn');
        commentBtn.classList.remove('hidden');
        commentBtn.style.display = 'flex';
        
        // Quitar active del botón de inicio
        const homeBtn = document.querySelector('.nav-btn[data-screen="home"]');
        if (homeBtn) {
            homeBtn.classList.remove('active');
        }
    }

    function deselectVideo() {
        if (selectedVideo) {
            selectedVideo.classList.remove('selected');
            selectedVideo = null;
        }

        // Ocultar botón central y panel de comentarios
        const commentBtn = document.getElementById('comment-nav-btn');
        commentBtn.classList.add('hidden');
        commentBtn.style.display = 'none';
        hideCommentsPanel();
        
        // Activar botón de inicio
        const homeBtn = document.querySelector('.nav-btn[data-screen="home"]');
        if (homeBtn) {
            homeBtn.classList.add('active');
        }
    }

    // Botón de comentarios en la navegación
    const commentNavBtn = document.getElementById('comment-nav-btn');
    commentNavBtn.addEventListener('click', () => {
        if (selectedVideo) {
            showCommentsPanel();
        }
    });
    
    function showCommentsPanel() {
        const panel = document.getElementById('comments-panel');
        panel.classList.add('active');
        loadComments();
    }
    
    function hideCommentsPanel() {
        const panel = document.getElementById('comments-panel');
        panel.classList.remove('active');
    }
    
    // Cerrar panel de comentarios
    document.getElementById('close-comments').addEventListener('click', hideCommentsPanel);
    
    // Cargar comentarios
    function loadComments() {
        const commentsList = document.getElementById('comments-list');
        const comments = [
            { user: '@carlos_99', avatar: '👨', text: '¡Esto está increíble! 🔥', time: 'hace 2 min', likes: 12, dislikes: 1, liked: false, disliked: false },
            { user: '@maria_gomez', avatar: '👩', text: 'Me encanta, sigue así!', time: 'hace 5 min', likes: 8, dislikes: 0, liked: false, disliked: false },
            { user: '@lucia_fernandez', avatar: '👧', text: '¿Cómo hiciste esto?', time: 'hace 10 min', likes: 5, dislikes: 0, liked: false, disliked: false },
            { user: '@pedro_sanchez', avatar: '👦', text: 'El mejor video que he visto hoy 😂', time: 'hace 15 min', likes: 23, dislikes: 2, liked: false, disliked: false },
            { user: '@ana_lopez', avatar: '👩‍🦰', text: 'Necesito un tutorial de esto', time: 'hace 1 hora', likes: 15, dislikes: 0, liked: false, disliked: false },
            { user: '@david_ruiz', avatar: '🧑', text: 'Jajajaja no puedo parar de verlo', time: 'hace 2 horas', likes: 31, dislikes: 1, liked: false, disliked: false },
        ];

        commentsList.innerHTML = comments.map((c, index) => `
            <div class="comment-item" data-comment-index="${index}">
                <div class="comment-avatar">${c.avatar}</div>
                <div class="comment-content">
                    <div class="comment-user">${c.user}</div>
                    <div class="comment-text">${c.text}</div>
                    <div class="comment-time">${c.time}</div>
                    <div class="comment-actions">
                        <div class="comment-reactions">
                            <button class="reaction-btn ${c.liked ? 'active' : ''}" data-action="like" data-index="${index}">
                                <svg viewBox="0 0 24 24" fill="${c.liked ? '#1a73e8' : 'currentColor'}" class="reaction-icon">
                                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.96 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
                                </svg>
                                <span class="reaction-count">${c.likes}</span>
                            </button>
                            <button class="reaction-btn ${c.disliked ? 'active' : ''}" data-action="dislike" data-index="${index}">
                                <svg viewBox="0 0 24 24" fill="${c.disliked ? '#1a73e8' : 'currentColor'}" class="reaction-icon">
                                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.85.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                                </svg>
                                <span class="reaction-count">${c.dislikes}</span>
                            </button>
                        </div>
                        <button class="report-btn" data-action="report" data-index="${index}">
                            <svg viewBox="0 0 24 24" fill="currentColor" class="report-icon">
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Guardar estado de comentarios
        window.commentsState = comments;

        // Añadir event listeners a botones de reacciones
        document.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const index = parseInt(btn.getAttribute('data-index'));
                handleReaction(action, index);
            });
        });

        // Añadir event listeners a botones de reportar
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                handleReport(index);
            });
        });
    }

    // Manejar reacciones (like/dislike)
    function handleReaction(action, index) {
        const comments = window.commentsState;
        const comment = comments[index];
        
        if (action === 'like') {
            if (comment.liked) {
                comment.liked = false;
                comment.likes--;
            } else {
                comment.liked = true;
                comment.likes++;
                if (comment.disliked) {
                    comment.disliked = false;
                    comment.dislikes--;
                }
            }
        } else if (action === 'dislike') {
            if (comment.disliked) {
                comment.disliked = false;
                comment.dislikes--;
            } else {
                comment.disliked = true;
                comment.dislikes++;
                if (comment.liked) {
                    comment.liked = false;
                    comment.likes--;
                }
            }
        }
        
        loadComments();
    }

    // Manejar reporte
    function handleReport(index) {
        const comment = window.commentsState[index];
        if (confirm(`¿Quieres reportar este comentario de ${comment.user}?`)) {
            alert('Comentario reportado. Gracias por ayudarnos a mantener la comunidad segura.');
        }
    }
    
    // Enviar comentario
    document.getElementById('send-comment').addEventListener('click', sendComment);
    document.getElementById('comment-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendComment();
    });
    
    function sendComment() {
        const input = document.getElementById('comment-input');
        const text = input.value.trim();

        if (text) {
            // Añadir al array de comentarios
            const comments = window.commentsState || [];
            const newCommentData = {
                user: '@Usuario',
                avatar: '🐱',
                text: text,
                time: 'ahora',
                likes: 0,
                dislikes: 0,
                liked: false,
                disliked: false
            };
            comments.push(newCommentData);
            window.commentsState = comments;
            
            // Recargar comentarios
            loadComments();
            
            input.value = '';
        }
    }
    
    // ==========================================
    // CREADOR DE VIDEOS - SUBIDA DE ARCHIVOS
    // ==========================================
    
    const uploadBtn = document.getElementById('upload-btn');
    const videoUpload = document.getElementById('video-upload');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const uploadSuccess = document.getElementById('upload-success');
    const creatorTitle = document.querySelector('.creator-title');
    const creatorUploadBtn = document.querySelector('.creator-upload-btn');
    
    let uploadedFile = null;
    
    // Click en botón de subir
    uploadBtn.addEventListener('click', () => {
        videoUpload.click();
    });
    
    // Manejar selección de archivo
    videoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleVideoUpload(file);
        }
    });
    
    // Drag and drop en toda la pantalla
    const creatorScreen = document.getElementById('creator-screen');
    creatorScreen.addEventListener('dragover', (e) => {
        e.preventDefault();
        creatorScreen.style.background = 'rgba(247, 185, 22, 0.1)';
    });
    
    creatorScreen.addEventListener('dragleave', () => {
        creatorScreen.style.background = '#000';
    });
    
    creatorScreen.addEventListener('drop', (e) => {
        e.preventDefault();
        creatorScreen.style.background = '#000';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            handleVideoUpload(file);
        }
    });
    
    function handleVideoUpload(file) {
        uploadedFile = file;
        
        // Ocultar botón y título durante la subida
        creatorUploadBtn.style.display = 'none';
        creatorTitle.style.display = 'none';
        
        // Mostrar progreso
        uploadProgress.classList.remove('hidden');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Archivo cargado, mostrar éxito
                setTimeout(() => {
                    uploadProgress.classList.add('hidden');
                    uploadSuccess.classList.remove('hidden');
                }, 500);
            }
            
            progressFill.style.width = progress + '%';
            progressText.textContent = `Subiendo ${Math.round(progress)}%`;
        }, 200);
    }
    
    // Publicar video
    document.getElementById('publish-btn').addEventListener('click', () => {
        if (!uploadedFile) return;
        
        // Simular publicación
        alert(`✅ Video publicado con éxito!\n\nArchivo: ${uploadedFile.name}\nTamaño: ${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Resetear y volver al home
        resetCreator();
        navigateToScreen('home');
    });
    
    function resetCreator() {
        uploadedFile = null;
        videoUpload.value = '';
        uploadProgress.classList.add('hidden');
        uploadSuccess.classList.add('hidden');
        creatorUploadBtn.style.display = 'block';
        creatorTitle.style.display = 'block';
        progressFill.style.width = '0%';
    }
    
    // ==========================================
    // BANDEJA DE ENTRADA - CHATS Y NOTIFICACIONES
    // ==========================================
    
    const chatItems = document.querySelectorAll('.chat-item');
    const chatOverlay = document.getElementById('chat-overlay');
    const chatOverlayAvatar = document.getElementById('chat-overlay-avatar');
    const chatOverlayName = document.getElementById('chat-overlay-name');
    const chatOverlayMessages = document.getElementById('chat-overlay-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const backToInbox = document.getElementById('back-to-inbox');
    
    let currentChat = null;
    
    // Datos de los chats
    const chatData = {
        1: { name: 'María Gómez', avatar: '👩', messages: [
            { text: '¡Hola! ¿Qué tal estás?', sent: false },
            { text: 'Bien, ¿y tú?', sent: true },
            { text: 'Vi tu último video, ¡está genial!', sent: false }
        ]},
        2: { name: 'Carlos 99', avatar: '👨', messages: [
            { text: '¿Cuándo subes el próximo video?', sent: false },
            { text: 'Pronto, estoy trabajando en ello', sent: true }
        ]},
        3: { name: 'Lucía Fernández', avatar: '👧', messages: [
            { text: 'Me encantó tu último contenido 🔥', sent: false },
            { text: '¡Gracias!', sent: true }
        ]},
        4: { name: 'Pedro Sánchez', avatar: '👦', messages: [
            { text: 'Gracias por el follow!', sent: false }
        ]},
        5: { name: 'Ana López', avatar: '👩‍🦰', messages: [
            { text: 'Oye, ¿me puedes ayudar con una cosa?', sent: false }
        ]}
    };
    
    // Abrir chat
    chatItems.forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.getAttribute('data-chat');
            openChat(chatId);
        });
    });
    
    function openChat(chatId) {
        currentChat = chatId;
        const data = chatData[chatId];
        
        chatOverlayAvatar.textContent = data.avatar;
        chatOverlayName.textContent = data.name;
        
        loadChatMessages(chatId);
        
        chatOverlay.classList.remove('hidden');
        chatOverlay.classList.add('active');
    }
    
    function loadChatMessages(chatId) {
        const data = chatData[chatId];
        chatOverlayMessages.innerHTML = data.messages.map(msg => `
            <div class="message ${msg.sent ? 'sent' : 'received'}" style="display: flex; ${msg.sent ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}">
                <div class="message-bubble" style="max-width: 70%; padding: 12px 16px; border-radius: 18px; font-size: 15px; line-height: 1.4; ${msg.sent ? 'background: linear-gradient(135deg, #f7b916 0%, #f5a623 100%); color: #000; border-bottom-right-radius: 4px;' : 'background: #e0e0e0; color: #000; border-bottom-left-radius: 4px;'}">
                    ${msg.text}
                </div>
            </div>
        `).join('');
        chatOverlayMessages.scrollTop = chatOverlayMessages.scrollHeight;
    }
    
    // Volver a la bandeja
    backToInbox.addEventListener('click', () => {
        chatOverlay.classList.remove('active');
        chatOverlay.classList.add('hidden');
        currentChat = null;
    });
    
    // Enviar mensaje
    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text || !currentChat) return;

        // Añadir mensaje enviado
        chatData[currentChat].messages.push({ text: text, sent: true });
        loadChatMessages(currentChat);
        chatInput.value = '';
    }
    
    // ==========================================
    // PERFIL Y AJUSTES
    // ==========================================

    // Se inicializa después de que el DOM esté cargado
    setTimeout(() => {
        document.querySelectorAll('.settings-item').forEach(item => {
            item.addEventListener('click', function() {
                alert(`⚙️ ${this.textContent}\n\nEsta opción abriría la pantalla de configuración.`);
            });
        });
        
        const helpBtn = document.querySelector('.help-btn');
        const settingsBtn = document.querySelector('.settings-btn');

        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                alert('❓ Centro de Ayuda\n\nEncuentra respuestas y contacta con soporte.');
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                alert('⚙️ Configuración General');
            });
        }
    }, 100);
    
    // Recalcular al redimensionar
    window.addEventListener('resize', () => {
        if (document.getElementById('home-screen').classList.contains('active')) {
            stopDVDVideos();
            setTimeout(initDVDVideos, 100);
        }
    });
    
    console.log('🎬 DOPMAX - Aplicación cargada correctamente');
});
