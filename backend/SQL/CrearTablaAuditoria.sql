
CREATE TABLE IF NOT EXISTS public.auditoria_evento
(
    id_auditoria      BIGSERIAL PRIMARY KEY,
    id_usuario        INTEGER NULL,
    usuario           VARCHAR(100) NOT NULL DEFAULT 'ANONIMO',
    nombre_completo   VARCHAR(300) NULL,
    rol               VARCHAR(100) NULL,
    accion            VARCHAR(100) NOT NULL,
    modulo            VARCHAR(100) NOT NULL,
    descripcion       VARCHAR(600) NOT NULL,
    metodo_http       VARCHAR(10) NULL,
    ruta              VARCHAR(500) NULL,
    entidad           VARCHAR(100) NULL,
    id_entidad        VARCHAR(100) NULL,
    direccion_ip      VARCHAR(64) NULL,
    agente_usuario    VARCHAR(500) NULL,
    codigo_estado     INTEGER NOT NULL,
    exitoso           BOOLEAN NOT NULL,
    fecha_hora        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detalles          JSONB NULL,
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES public.usuario (id_usuario)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_auditoria_fecha
    ON public.auditoria_evento (fecha_hora DESC);

CREATE INDEX IF NOT EXISTS ix_auditoria_usuario_fecha
    ON public.auditoria_evento (id_usuario, fecha_hora DESC);

CREATE INDEX IF NOT EXISTS ix_auditoria_modulo_accion
    ON public.auditoria_evento (modulo, accion);

CREATE INDEX IF NOT EXISTS ix_auditoria_exitoso_fecha
    ON public.auditoria_evento (exitoso, fecha_hora DESC);

COMMENT ON TABLE public.auditoria_evento IS
    'Registro de las acciones realizadas por los usuarios del sistema IRS';
