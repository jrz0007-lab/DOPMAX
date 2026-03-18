-- Script para agregar comentarios iniciales a los videos
-- Ejecutar en la base de datos dopmaxx en Render

-- Verificar videos existentes
SELECT id, titulo, archivo FROM videos ORDER BY created_at LIMIT 10;

-- Insertar comentarios para cada video (si no existen)
INSERT INTO comentarios_video (video_id, usuario, contenido, created_at)
SELECT 
    v.id as video_id,
    'admin' as usuario,
    '¡Me encanta este video! 🔥' as contenido,
    NOW() as created_at
FROM videos v
WHERE NOT EXISTS (SELECT 1 FROM comentarios_video cv WHERE cv.video_id = v.id)
LIMIT 5;

INSERT INTO comentarios_video (video_id, usuario, contenido, created_at)
SELECT 
    v.id,
    'admin',
    'Esto es increíble 😍',
    NOW()
FROM videos v
WHERE NOT EXISTS (SELECT 1 FROM comentarios_video cv WHERE cv.video_id = v.id)
LIMIT 5;

INSERT INTO comentarios_video (video_id, usuario, contenido, created_at)
SELECT 
    v.id,
    'admin',
    '¿Alguien más viendo esto? 👀',
    NOW()
FROM videos v
WHERE NOT EXISTS (SELECT 1 FROM comentarios_video cv WHERE cv.video_id = v.id)
LIMIT 5;

-- Verificar comentarios insertados
SELECT cv.id, cv.video_id, cv.usuario, cv.contenido, v.titulo 
FROM comentarios_video cv
JOIN videos v ON v.id = cv.video_id
ORDER BY cv.video_id, cv.created_at;
