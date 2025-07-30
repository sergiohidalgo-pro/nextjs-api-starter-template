# Gestión de Credenciales de Usuario

## 📋 Resumen

Este documento explica cómo se almacenan y gestionan las credenciales de usuario en la API, incluyendo cómo cambiar contraseñas y gestionar usuarios.

## 🔐 Almacenamiento de Credenciales

### Sí, las credenciales se almacenan en la base de datos

Las credenciales de usuario **SÍ se almacenan** en la base de datos MongoDB en la colección `users`. La información incluye:

- **Username**: Nombre de usuario único
- **Password**: Contraseña hasheada con bcrypt (saltRounds: 12)
- **TOTP Secret**: Secreto para 2FA (Google Authenticator)
- **Metadata**: Información adicional del usuario
- **Timestamps**: Fechas de creación, actualización y último login

### Ejemplo de registro en la base de datos:

```json
{
  "_id": "ObjectId('...')",
  "username": "admin",
  "password": "$2b$12$x0DbA283oZpBAZnRRfqLgOyzqx4IALqVW7QeR60sYqjyrn329MmYW",
  "totp_secret": "JQZTOQKUOR5UM63UN5TE2JTELV5W6SR6PMRSS3KRPERW6VDOMNSQ",
  "is_active": true,
  "created_at": "2025-07-24T21:38:40.972Z",
  "updated_at": "2025-07-24T21:38:40.972Z",
  "last_login": null,
  "metadata": {
    "createdBy": "system",
    "initialSetup": true,
    "passwordPreHashed": false
  }
}
```

## 🚀 Inicialización del Usuario por Defecto

### ¿Cuándo se crea el usuario?

El usuario por defecto se crea **automáticamente** cuando:

1. **Durante el primer inicio de la aplicación** (`pnpm dev`)
2. **Al ejecutar manualmente**: `node scripts/init-user.js`
3. **Cuando no existen usuarios** en la base de datos

### Credenciales por defecto

Las credenciales se toman de las variables de entorno del archivo `.env`:

```env
AUTH_USERNAME=admin
AUTH_PASSWORD=b581268a6175328ef1a7e6c7a5419c12
AUTH_2FA_SECRET=JQZTOQKUOR5UM63UN5TE2JTELV5W6SR6PMRSS3KRPERW6VDOMNSQ
```

## 🔧 Cómo Cambiar Credenciales

### Método 1: Script Interactivo (Recomendado)

```bash
pnpm change-password
```

Este script interactivo te permitirá:
- ✅ Verificar credenciales actuales
- ✅ Validar código 2FA
- ✅ Establecer nueva contraseña
- ✅ Confirmar la nueva contraseña
- ✅ Validar longitud mínima (8 caracteres)

### Método 2: A través del API

Endpoint: `POST /api/auth/change-password`

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "currentPassword": "password-actual",
    "newPassword": "nueva-password-segura",
    "totpCode": "123456"
  }'
```

### Método 3: Modificar Variables de Entorno

Para cambiar las credenciales por defecto para **nuevas instalaciones**:

1. **Edita el archivo `.env`**:
```env
AUTH_USERNAME=tu-nuevo-usuario
AUTH_PASSWORD=tu-nueva-password
AUTH_2FA_SECRET=TU-NUEVO-SECRET-2FA
```

2. **Regenera secretos** (opcional):
```bash
# Generar nuevo JWT secret
pnpm run generate:jwt-secret

# Generar nuevo 2FA secret
pnpm run generate:2fa-secret
```

3. **Reinicia la base de datos** (elimina usuarios existentes):
```bash
# Eliminar usuario existente y crear uno nuevo
docker exec mongodb-dev mongosh nextjs-api --eval "db.users.deleteMany({})"
node scripts/init-user.js
```

## 🔒 Seguridad de Contraseñas

### Hash de Contraseñas

- **Algoritmo**: bcrypt
- **Salt Rounds**: 12
- **Auto-detección**: El sistema detecta si la contraseña ya está hasheada

### Validación de Contraseñas

- **Longitud mínima**: 8 caracteres
- **Verificación 2FA**: Obligatoria para todos los cambios
- **Contraseña actual**: Requerida para cambios

## 📱 Configuración de 2FA

### Para configurar Google Authenticator:

1. **Obtén el secreto** de las variables de entorno o logs de inicialización
2. **Abre Google Authenticator**
3. **Añade cuenta manualmente**:
   - **Nombre de cuenta**: "Next.js API Starter"
   - **Clave**: `JQZTOQKUOR5UM63UN5TE2JTELV5W6SR6PMRSS3KRPERW6VDOMNSQ`
   - **Tipo**: Basado en tiempo

## 🛠️ Scripts Disponibles

### Scripts de gestión de usuarios:

```bash
# Inicializar usuario por defecto
node scripts/init-user.js

# Cambiar contraseña interactivamente
pnpm change-password

# Generar nuevo JWT secret
pnpm run generate:jwt-secret

# Generar nuevo 2FA secret
pnpm run generate:2fa-secret
```

## 🔍 Verificar Usuarios en la Base de Datos

### Ver todos los usuarios:

```bash
docker exec mongodb-dev mongosh nextjs-api --eval "db.users.find().pretty()"
```

### Contar usuarios:

```bash
docker exec mongodb-dev mongosh nextjs-api --eval "db.users.countDocuments()"
```

### Eliminar todos los usuarios:

```bash
docker exec mongodb-dev mongosh nextjs-api --eval "db.users.deleteMany({})"
```

## ⚙️ Configuración de MongoDB

### Requisitos para Transacciones

La aplicación requiere MongoDB con **replica set** habilitado para soportar transacciones de Prisma:

```bash
# Iniciar MongoDB con replica set
docker run -d --name mongodb-dev -p 27017:27017 \
  mongo:7-jammy --replSet rs0 --bind_ip_all

# Inicializar replica set
docker exec mongodb-dev mongosh --eval \
  "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
```

## 🚨 Consideraciones de Producción

### Para entornos de producción:

1. **Cambia las credenciales por defecto** antes del despliegue
2. **Usa contraseñas seguras** de al menos 12 caracteres
3. **Configura MongoDB con autenticación** habilitada
4. **Usa HTTPS** para todas las comunicaciones
5. **Implementa rate limiting** en endpoints sensibles
6. **Monitorea intentos de acceso** fallidos
7. **Rota secretos JWT** periódicamente

## 📚 APIs Relacionadas

### Endpoints de autenticación:

- `POST /api/auth/login` - Login con credenciales + 2FA
- `POST /api/auth/refresh` - Renovar token de acceso
- `POST /api/auth/change-password` - Cambiar contraseña
- `GET /api/validate-token` - Validar token JWT

### Archivos de código relevantes:

- `src/services/authService.ts` - Lógica de autenticación
- `src/lib/auth/userService.ts` - Gestión de usuarios
- `scripts/change-password.js` - Script de cambio de contraseña
- `scripts/init-user.js` - Script de inicialización de usuario

## ❓ Preguntas Frecuentes

### ¿Cómo recupero mi contraseña si la olvido?

No hay sistema de recuperación implementado. Debes:
1. Acceder a la base de datos directamente
2. Eliminar el usuario: `db.users.deleteOne({username: "admin"})`
3. Ejecutar: `node scripts/init-user.js`

### ¿Puedo tener múltiples usuarios?

Actualmente la aplicación está diseñada para un usuario admin. Para múltiples usuarios necesitarías:
1. Crear endpoints de registro
2. Implementar roles y permisos
3. Modificar la lógica de autenticación

### ¿Las contraseñas están seguras?

Sí, las contraseñas:
- Se hashean con bcrypt (12 rounds)
- Nunca se almacenan en texto plano
- Requieren 2FA para cambios
- Se validan con salt automático

---

**✅ Resumen**: Sí, el usuario y contraseña se almacenan en MongoDB de forma segura, hay scripts documentados para cambiar credenciales, y el sistema es completamente funcional para gestión de usuarios.