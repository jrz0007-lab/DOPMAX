-- Registrar videos de Cloudinary en la base de datos DOPMAX
-- Ejecutar en Render o localmente con la BD configurada

-- Usuario que sube los videos (reemplaza con tu usuario real)
-- Si no existe, se creará al registrarse

-- Insertar videos (los IDs se generan automáticamente)
INSERT INTO videos (archivo, usuario, titulo, vistas, created_at) VALUES
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824491/Download_1_npvpfo.mp4', 'admin', 'Download 1', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824488/13º112_xpn677.mp4', 'admin', '13º112', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_6_t0h1xv.mp4', 'admin', 'Download 6', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_5_tefkxd.mp4', 'admin', 'Download 5', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_2_uvswgp.mp4', 'admin', 'Download 2', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824486/Download_4_e40d6m.mp4', 'admin', 'Download 4', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824485/Download_3_cvttsl.mp4', 'admin', 'Download 3', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/314141_wcbfxt.mp4', 'admin', '314141', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/12313131_iwv3zt.mp4', 'admin', '12313131', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824483/521515_tmhf6o.mp4', 'admin', '521515', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/151516162172172_y8qnkj.mp4', 'admin', '151516162172172', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/africa_qqp1hm.mp4', 'admin', 'Africa', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824484/151511616_lct0si.mp4', 'admin', '151511616', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824482/Download_ks1gec.mp4', 'admin', 'Download', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824482/525_qtomhc.mp4', 'admin', '525', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824481/211_cowcom.mp4', 'admin', '211', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824481/Download_7_nynrna.mp4', 'admin', 'Download 7', 0, NOW()),
('https://res.cloudinary.com/dr5llopu0/video/upload/v1773824478/13º112_dveosy.mp4', 'admin', '13º112 (2)', 0, NOW())
ON CONFLICT DO NOTHING;

-- Verificar videos insertados
SELECT id, titulo, archivo, usuario, vistas, created_at FROM videos ORDER BY created_at DESC;
