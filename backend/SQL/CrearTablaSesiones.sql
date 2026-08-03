
CREATE TABLE IF NOT EXISTS public.sesion_usuario
(
    id_sesion          UUID PRIMARY KEY,
    id_usuario         INTEGER NOT NULL,
    jti                VARCHAR(64) NOT NULL UNIQUE,
    fecha_inicio       TIMESTAMPTZ NOT NULL,
    fecha_expiracion   TIMESTAMPTZ NOT NULL,
    fecha_ultimo_acceso TIMESTAMPTZ NOT NULL,
    direccion_ip       VARCHAR(64) NULL,
    agente_usuario     VARCHAR(500) NULL,
    revocada           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_revocacion   TIMESTAMPTZ NULL,
    motivo_revocacion  VARCHAR(250) NULL,
    CONSTRAINT fk_sesion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES public.usuario (id_usuario)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_sesion_usuario_activa
    ON public.sesion_usuario (id_usuario, revocada, fecha_expiracion);

CREATE INDEX IF NOT EXISTS ix_sesion_ultimo_acceso
    ON public.sesion_usuario (fecha_ultimo_acceso DESC);
