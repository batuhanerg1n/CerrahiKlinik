using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.BusinessLogicLayer.Services.Concrete;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.DataAccessLayer.Concrete;
using SurgicalClinic.DataAccessLayer.Context;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
        "http://localhost:5173",
        "https://cerrahiklinik.runasp.net"
      )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Surgical Clinic Rest API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Token deðerinizi giriniz (Örn: Bearer ejyhbGciOi..)"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
   {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<INameMaskingService, NameMaskingService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPublicService, PublicService>();
builder.Services.AddScoped<IPersonelPanelService, PersonelPanelService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IDoktorPanelService, DoktorPanelService>();

var screteKey = builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForSurgicalClinicApi2026!";
var key = Encoding.ASCII.GetBytes(screteKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        var hataYolu = Path.Combine(app.Environment.ContentRootPath, "baslangic-hata.txt");
        File.WriteAllText(hataYolu, ex.ToString());
    }
}

app.UseCors("AllowReactApp");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Surgical Clinic API v1");
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();