-- Script para crear las tablas y datos iniciales de Despacho

-- Crear tabla de catálogo de medidas de seguridad
CREATE TABLE IF NOT EXISTS cat_medida_seguridad (
    id_cat_medida SERIAL PRIMARY KEY,
    medida VARCHAR(255) NOT NULL,
    estatus INTEGER DEFAULT 1
);

-- Insertar medidas de seguridad iniciales
INSERT INTO cat_medida_seguridad (medida, estatus) VALUES
('Monitoreo Policial: Despliegue de Dron', 1),
('Patrullaje de Zona', 1),
('Custodia Armada', 1),
('Vigilancia Permanente', 1),
('Punto de Control', 1),
('Cierre de Accesos', 1),
('Evacuación Preventiva', 1),
('Coordinación con Autoridades Locales', 1)
ON CONFLICT DO NOTHING;

-- Crear tabla fichas_despacho
CREATE TABLE IF NOT EXISTS fichas_despacho (
    id_ficha_despacho SERIAL PRIMARY KEY,
    id_ficha INTEGER NOT NULL,
    id_cat_medida INTEGER NOT NULL,
    comentario TEXT NOT NULL DEFAULT '',
    evidencia TEXT,
    fecha_validacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_usuario INTEGER,
    CONSTRAINT fk_ficha FOREIGN KEY (id_ficha) 
        REFERENCES ficha_informativa(id_ficha) 
        ON DELETE CASCADE,
    CONSTRAINT fk_medida FOREIGN KEY (id_cat_medida) 
        REFERENCES cat_medida_seguridad(id_cat_medida) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) 
        ON DELETE SET NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_fichas_despacho_ficha ON fichas_despacho(id_ficha);
CREATE INDEX IF NOT EXISTS idx_fichas_despacho_usuario ON fichas_despacho(id_usuario);
CREATE INDEX IF NOT EXISTS idx_fichas_despacho_fecha ON fichas_despacho(fecha_validacion);

-- Comentarios de documentación
COMMENT ON TABLE cat_medida_seguridad IS 'Catálogo de medidas de seguridad disponibles para aplicar a fichas';
COMMENT ON TABLE fichas_despacho IS 'Registro de fichas validadas con medidas de seguridad aplicadas';
COMMENT ON COLUMN fichas_despacho.comentario IS 'Comentarios adicionales sobre la aplicación de la medida';
COMMENT ON COLUMN fichas_despacho.evidencia IS 'Ruta o referencia a archivos de evidencia (imágenes, documentos)';
