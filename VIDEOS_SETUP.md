# 📹 SOLUCIÓN PARA VIDEOS EN DOPMAX

## Problema
Los videos locales pesan mucho y no se pueden subir a Render (límite de 100MB en plan free).

## Solución: Usar Cloudinary (25GB GRATIS)

---

## PASO 1: Crear cuenta en Cloudinary

1. Ve a https://cloudinary.com/
2. Click en **"Sign Up Free"**
3. Regístrate con Google o email
4. Completa el formulario (es gratis)

---

## PASO 2: Subir videos a Cloudinary

1. En el dashboard de Cloudinary, ve a **"Media Library"**
2. Click en **"Upload"** (arriba a la derecha)
3. Arrastra tus videos o haz click para seleccionar
4. Espera a que se suban todos

---

## PASO 3: Obtener URLs de los videos

1. En **Media Library**, haz click en un video subido
2. Copia la **URL** que aparece (ej: `https://res.cloudinary.com/TU_CLOUD_NAME/video/upload/v1234567890/tu_video.mp4`)
3. Repite para cada video

---

## PASO 4: Actualizar videoList en script.js

Reemplaza la lista de videos local por URLs de Cloudinary:

```javascript
const videoList = [
    'https://res.cloudinary.com/TU_CLOUD_NAME/video/upload/v1234567890/video1.mp4',
    'https://res.cloudinary.com/TU_CLOUD_NAME/video/upload/v1234567891/video2.mp4',
    'https://res.cloudinary.com/TU_CLOUD_NAME/video/upload/v1234567892/video3.mp4',
    // ... más videos
];
```

---

## PASO 5: Actualizar el código para soportar URLs externas

El código ya está actualizado para soportar tanto:
- ✅ Videos locales (`videos/archivo.mp4`)
- ✅ URLs de Cloudinary (`https://res.cloudinary.com/...`)
- ✅ URLs de YouTube (`https://www.youtube.com/watch?v=...`)

---

## ALTERNATIVA: YouTube (si los videos pueden ser públicos)

1. Sube los videos a YouTube (pueden ser "No listado")
2. Copia el ID del video (ej: `dQw4w9WgXcQ`)
3. Usa la URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`

---

## ALTERNATIVA: Google Drive

1. Sube videos a Google Drive
2. Click derecho → "Compartir" → "Cualquier persona con el enlace"
3. Copia el ID del archivo
4. Usa: `https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO`

---

## NOTAS IMPORTANTES

- Cloudinary es GRATIS hasta 25GB de videos
- Los videos en Cloudinary cargan más rápido (CDN)
- YouTube es ilimitado pero puede mostrar anuncios
- Google Drive tiene límite de 15GB

---

## SOPORTE

Si necesitas ayuda subiendo los videos, avísame y te guío paso a paso.
