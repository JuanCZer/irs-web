-- Script para agregar columnas de foreign keys de catálogos a ficha_informativa

-- Agregar columna id_cat_sector
ALTER TABLE ficha_informativa 
ADD COLUMN IF NOT EXISTS id_cat_sector INTEGER;

-- Agregar columna id_cat_prioridad
ALTER TABLE ficha_informativa 
ADD COLUMN IF NOT EXISTS id_cat_prioridad INTEGER;

-- Agregar columna id_cat_condicion
ALTER TABLE ficha_informativa 
ADD COLUMN IF NOT EXISTS id_cat_condicion INTEGER;

-- Agregar columna id_cat_informacion
ALTER TABLE ficha_informativa 
ADD COLUMN IF NOT EXISTS id_cat_informacion INTEGER;

-- Agregar columna id_cat_municipio
ALTER TABLE ficha_informativa 
ADD COLUMN IF NOT EXISTS id_cat_municipio INTEGER;

-- Agregar columna id_cat_delegacion
ALTER TABLE ficha_informativa 
ADD COLUMN IF NOT EXISTS id_cat_delegacion INTEGER;

-- Agregar foreign keys (opcional, pero recomendado)
ALTER TABLE ficha_informativa
ADD CONSTRAINT fk_ficha_cat_sector 
FOREIGN KEY (id_cat_sector) REFERENCES cat_sector(id_cat_sector);

ALTER TABLE ficha_informativa
ADD CONSTRAINT fk_ficha_cat_prioridad 
FOREIGN KEY (id_cat_prioridad) REFERENCES cat_prioridad(id_cat_prioridad);

ALTER TABLE ficha_informativa
ADD CONSTRAINT fk_ficha_cat_condicion 
FOREIGN KEY (id_cat_condicion) REFERENCES cat_condicion(id_cat_condicion);

ALTER TABLE ficha_informativa
ADD CONSTRAINT fk_ficha_cat_informacion 
FOREIGN KEY (id_cat_informacion) REFERENCES cat_informacion(id_cat_informacion);

ALTER TABLE ficha_informativa
ADD CONSTRAINT fk_ficha_cat_municipio 
FOREIGN KEY (id_cat_municipio) REFERENCES cat_municipio(id_municipio);

ALTER TABLE ficha_informativa
ADD CONSTRAINT fk_ficha_cat_delegacion 
FOREIGN KEY (id_cat_delegacion) REFERENCES cat_delegacion(id_delegacion);

-- Agregar foreign key en cat_municipio hacia cat_delegacion
ALTER TABLE cat_municipio
ADD COLUMN IF NOT EXISTS id_delegacion INTEGER;

ALTER TABLE cat_municipio
ADD CONSTRAINT fk_municipio_delegacion 
FOREIGN KEY (id_delegacion) REFERENCES cat_delegacion(id_delegacion);
