CREATE TABLE IF NOT EXISTS public.borradores_medidas_despacho (
    id_borrador_medidas SERIAL PRIMARY KEY,
    id_ficha INTEGER NOT NULL REFERENCES public.ficha(id_ficha) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL,
    ids_medidas INTEGER[] NOT NULL DEFAULT '{}',
    comentario TEXT NOT NULL DEFAULT '',
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_borrador_medidas_ficha_usuario UNIQUE (id_ficha, id_usuario)
);

CREATE INDEX IF NOT EXISTS ix_borrador_medidas_usuario
    ON public.borradores_medidas_despacho (id_usuario);
