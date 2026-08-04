/*
  Limpieza de tablas sin referencias en el desarrollo actual.

  Alcance de la auditoria:
  - Codigo C# y TypeScript del repositorio.
  - Modelos y consultas de EF Core.
  - Claves foraneas, vistas, vistas materializadas, triggers y rutinas de PostgreSQL.

  IMPORTANTE:
  - Este script elimina datos de forma permanente.
  - Ejecutar primero en una copia/restauracion de la base de datos.
  - No usa CASCADE. Si una tabla obtiene una dependencia nueva, PostgreSQL
    abortara la transaccion completa.
  - Al ejecutar el script completo, los dos bloques se confirman juntos.
*/

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '2min';

-- Tablas vacias al momento de la auditoria.
DROP TABLE IF EXISTS
    public.bitacora_autorizo,
    public.bitacora_delegacion_municipio,
    public.bitacora_empleado,
    public.bitacora_informante,
    public.bitacora_oficialia_despacho,
    public.bitacora_sector,
    public.empleados,
    public.empleados_status,
    public.fichadespachooficialia,
    public.foto_empleado,
    public.pasosruta,
    public.ruta_repartidor
RESTRICT;

-- Tablas aisladas que contenian datos al momento de la auditoria.
-- Revisar la politica de conservacion antes de ejecutar este bloque.
DROP TABLE IF EXISTS
    public.activo_estadoactual,
    public.bitacora,
    public.bitacora_usuario,
    public.cat_autorizo,
    public.cat_ciudad_clientes,
    public.cat_estado_actual,
    public.cat_sector_copy1,
    public.cat_subsector_copy1,
    public.clientes_cedis,
    public.clientes_cedis_copy1,
    public.status_ruta
RESTRICT;

COMMIT;

/*
  Tablas excluidas intencionalmente:
  - archivo: tiene FK hacia ficha.
  - delegacion_usuario: tiene FKs hacia usuario y cat_delegacion.
  - historial_logs: recibe escrituras del trigger activo de usuario.
  - ficha, usuario, catalogos, sesiones, auditoria y tablas de Despacho/Drones:
    forman parte de la logica vigente.

  Para ensayar sin conservar el borrado, sustituir COMMIT por ROLLBACK.
*/
