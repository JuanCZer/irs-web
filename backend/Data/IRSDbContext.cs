using IRS.API.Models;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Data;

public class IRSDbContext : DbContext
{
    public IRSDbContext(DbContextOptions<IRSDbContext> options) : base(options)
    {
    }

    public DbSet<FichaInformativa> Reports { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<CatRol> Roles { get; set; }
    public DbSet<AuditoriaEvento> AuditEvents { get; set; }
    public DbSet<SesionUsuario> UserSessions { get; set; }


    public DbSet<SectorCategory> Sectors { get; set; }
    public DbSet<CatSubsector> Subsectors { get; set; }
    public DbSet<CatPrioridad> Priorities { get; set; }
    public DbSet<CatCondicion> Conditions { get; set; }
    public DbSet<CatInformacion> InformationItems { get; set; }
    public DbSet<CatMunicipio> Municipalities { get; set; }
    public DbSet<CatDelegacion> Delegations { get; set; }
    public DbSet<CatMedidaSeguridad> SecurityMeasures { get; set; }


    public DbSet<DispatchReport> DispatchReports { get; set; }
    public DbSet<DispatchMeasureDraft> DispatchMeasureDrafts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany()
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditoriaEvento>()
            .HasOne(a => a.RelatedUser)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<AuditoriaEvento>()
            .Property(a => a.Details)
            .HasColumnType("jsonb");

        modelBuilder.Entity<SesionUsuario>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<FichaInformativa>(entity =>
        {
            entity.ToTable("ficha", "public");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id_ficha");
            entity.Property(e => e.CertificateNumber).HasColumnName("cedula");
            entity.Property(e => e.Delegation).HasColumnName("delegacion");
            entity.Property(e => e.Municipality).HasColumnName("municipio");
            entity.Property(e => e.Place).HasColumnName("lugar");
            entity.Property(e => e.Latitude).HasColumnName("latitud");
            entity.Property(e => e.Longitude).HasColumnName("longitud");
            entity.Property(e => e.EventStartTime).HasColumnName("hora_suceso_inicio");
            entity.Property(e => e.EventEndTime).HasColumnName("hora_suceso_fin");
            entity.Property(e => e.EventDate).HasColumnName("fecha_suceso");
            entity.Property(e => e.Sector).HasColumnName("sector");
            entity.Property(e => e.Subsector).HasColumnName("subsector");
            entity.Property(e => e.AttendeeCount).HasColumnName("num_asistentes");
            entity.Property(e => e.CreationDate).HasColumnName("fecha_elaboracion");
            entity.Property(e => e.CreationTime).HasColumnName("hora_elaboracion");
            entity.Property(e => e.Priority).HasColumnName("prioridad");
            entity.Property(e => e.Condition).HasColumnName("condicion");
            entity.Property(e => e.Information).HasColumnName("informacion");
            entity.Property(e => e.Subject).HasColumnName("asunto");
            entity.Property(e => e.Facts).HasColumnName("hechos");
            entity.Property(e => e.Agreements).HasColumnName("acuerdos");
            entity.Property(e => e.ReporterId).HasColumnName("id_informo");
            entity.Property(e => e.UserId).HasColumnName("id_usuario");
            entity.Property(e => e.AuthorizerId).HasColumnName("id_autorizo");
            entity.Property(e => e.ReceptionDate).HasColumnName("fecha_recepcion");
            entity.Property(e => e.ReceptionTime).HasColumnName("hora_recepcion");
            entity.Property(e => e.CurrentStatusId).HasColumnName("id_estado_actual");
            entity.Property(e => e.CancellationReason).HasColumnName("motivo_cancelacion");
            entity.Property(e => e.Active).HasColumnName("activo");
            entity.Property(e => e.InternalReference).HasColumnName("folio_interno");
            entity.Property(e => e.Address).HasColumnName("direccion");
            entity.Property(e => e.Seen).HasColumnName("visto");
            entity.Property(e => e.PreviousReportId).HasColumnName("idfichaanterior");
            entity.Property(e => e.ValidationDate).HasColumnName("fecha_validacion");
        });
    }
}

