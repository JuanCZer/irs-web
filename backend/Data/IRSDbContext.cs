using IRS.API.Models;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Data;

public class IRSDbContext : DbContext
{
    public IRSDbContext(DbContextOptions<IRSDbContext> options) : base(options)
    {
    }

    public DbSet<FichaInformativa> Fichas { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<CatRol> CatRoles { get; set; }
    
    // Catálogos
    public DbSet<CatSector> CatSectores { get; set; }
    public DbSet<CatSubsector> CatSubsectores { get; set; }
    public DbSet<CatPrioridad> CatPrioridades { get; set; }
    public DbSet<CatCondicion> CatCondiciones { get; set; }
    public DbSet<CatInformacion> CatInformaciones { get; set; }
    public DbSet<CatMunicipio> CatMunicipios { get; set; }
    public DbSet<CatDelegacion> CatDelegaciones { get; set; }
    public DbSet<CatMedidaSeguridad> CatMedidasSeguridad { get; set; }
    
    // Despacho
    public DbSet<FichaDespacho> FichasDespacho { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de la relación Usuario -> CatRol
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Rol)
            .WithMany()
            .HasForeignKey(u => u.IdRol)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de FichaInformativa - mapear a la tabla "ficha"
        modelBuilder.Entity<FichaInformativa>(entity =>
        {
            entity.ToTable("ficha", "public");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Id).HasColumnName("id_ficha");
            entity.Property(e => e.Cedula).HasColumnName("cedula");
            entity.Property(e => e.Delegacion).HasColumnName("delegacion");
            entity.Property(e => e.Municipio).HasColumnName("municipio");
            entity.Property(e => e.Lugar).HasColumnName("lugar");
            entity.Property(e => e.Latitud).HasColumnName("latitud");
            entity.Property(e => e.Longitud).HasColumnName("longitud");
            entity.Property(e => e.HoraSucesoInicio).HasColumnName("hora_suceso_inicio");
            entity.Property(e => e.HoraSucesoFin).HasColumnName("hora_suceso_fin");
            entity.Property(e => e.FechaSuceso).HasColumnName("fecha_suceso");
            entity.Property(e => e.Sector).HasColumnName("sector");
            entity.Property(e => e.Subsector).HasColumnName("subsector");
            entity.Property(e => e.NumAsistentes).HasColumnName("num_asistentes");
            entity.Property(e => e.FechaElaboracion).HasColumnName("fecha_elaboracion");
            entity.Property(e => e.HoraElaboracion).HasColumnName("hora_elaboracion");
            entity.Property(e => e.Prioridad).HasColumnName("prioridad");
            entity.Property(e => e.Condicion).HasColumnName("condicion");
            entity.Property(e => e.Informacion).HasColumnName("informacion");
            entity.Property(e => e.Asunto).HasColumnName("asunto");
            entity.Property(e => e.Hechos).HasColumnName("hechos");
            entity.Property(e => e.Acuerdos).HasColumnName("acuerdos");
            entity.Property(e => e.IdInformo).HasColumnName("id_informo");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.IdAutorizo).HasColumnName("id_autorizo");
            entity.Property(e => e.FechaRecepcion).HasColumnName("fecha_recepcion");
            entity.Property(e => e.HoraRecepcion).HasColumnName("hora_recepcion");
            entity.Property(e => e.IdEstadoActual).HasColumnName("id_estado_actual");
            entity.Property(e => e.MotivoCancelacion).HasColumnName("motivo_cancelacion");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.FolioInterno).HasColumnName("folio_interno");
            entity.Property(e => e.Direccion).HasColumnName("direccion");
            entity.Property(e => e.Visto).HasColumnName("visto");
            entity.Property(e => e.IdFichaAnterior).HasColumnName("idfichaanterior");
            entity.Property(e => e.FechaValidacion).HasColumnName("fecha_validacion");
        });
    }
}

