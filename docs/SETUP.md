
# Configuración del Proyecto

Esta guía describe los pasos para configurar el entorno de desarrollo local.

## Requisitos

- Node.js (versión 20.x o superior)
- pnpm

## Pasos de Configuración

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/tu_usuario/tu_repositorio.git
    cd tu_repositorio
    ```

2.  **Instalar dependencias:**

    ```bash
    pnpm install
    ```

3.  **Configurar variables de entorno:**

    Copia el archivo `.env.example` a un nuevo archivo llamado `.env`.

    ```bash
    cp .env.example .env
    ```

    Abre el archivo `.env` y completa los valores requeridos. No se necesita ninguna configuración externa; el Rate Limiting funciona en memoria.

4.  **Generar Secretos de Autenticación:**

    El proyecto incluye scripts para facilitar la generación de las credenciales seguras.

    **a. Generar el Secreto de JWT:**

    El secreto de JWT es crucial para la seguridad de la autenticación. Para generar un secreto seguro, ejecuta el siguiente comando:

    ```bash
    pnpm run generate:jwt-secret
    ```

    Copia la línea `JWT_SECRET=...` y pégala en tu archivo `.env`.

    **b. Generar Secreto 2FA:**

    Para generar el secreto de autenticación de dos factores:

    ```bash
    # Para generar un secreto de 2FA
    pnpm run generate:2fa-secret
    ```

    Copia la línea `AUTH_2FA_SECRET=...` y pégala en tu archivo `.env`.

    **c. Configurar Contraseña de Autenticación:**

    Para configurar la contraseña de administrador, usa el script inteligente de hash:

    ```bash
    node scripts/hash-password.js "tu_contraseña_segura"
    ```

    El script actualizará automáticamente ambos archivos `.env` y `.env.local` con el hash correcto.

## Gestión de Contraseñas

### Script de Hash de Contraseñas

El proyecto incluye un script inteligente para gestionar las contraseñas de autenticación de forma segura:

```bash
node scripts/hash-password.js "tu-contraseña"
```

#### ¿Qué hace el script?

1. **Verificación Inteligente**: Antes de generar un nuevo hash, verifica si la contraseña ya está correctamente hasheada en tus archivos de entorno
2. **Sincronización Automática**: Actualiza automáticamente tanto `.env` como `.env.local` para evitar problemas de autenticación
3. **Prevención de Errores**: Detecta cuando los archivos están desincronizados y los corrige

#### Ejemplos de Uso:

**Primera vez o contraseña nueva:**
```bash
node scripts/hash-password.js "mi-nueva-contraseña-segura"
```

**Salida esperada:**
```
=== PASSWORD HASHING RESULT ===
Original password: mi-nueva-contraseña-segura
Hashed password: $2b$12$...

=== AUTO-UPDATED FILES ===
✓ AUTH_PASSWORD has been automatically updated in .env.local
✓ AUTH_PASSWORD has been automatically updated in .env
✓ Both environment files are now synchronized
```

**Contraseña ya configurada correctamente:**
```bash
node scripts/hash-password.js "mi-contraseña-existente"
```

**Salida esperada:**
```
=== PASSWORD ALREADY HASHED ===
Password matches existing hash in both .env files
Current hash: $2b$12$...

=== NO ACTION NEEDED ===
• Your password is already correctly hashed
• Both .env and .env.local are synchronized
• You can use this password for authentication
```

#### Solución de Problemas Comunes:

- **Error de autenticación después de cambiar contraseña**: Ejecuta el script para sincronizar los archivos
- **Archivos .env desincronizados**: El script detecta y corrige automáticamente las diferencias
- **Hash diferente cada vez**: Es normal en bcrypt; todos los hashes son válidos para la misma contraseña

#### Notas Importantes:

- ⚠️ **Nunca commitees contraseñas en texto plano** al control de versiones
- 🔄 **Reinicia el servidor de desarrollo** después de cambiar contraseñas
- 🔒 **Usa contraseñas fuertes** en entornos de producción
- 📁 **Mantén los archivos .env en .gitignore**

6.  **Iniciar el servidor de desarrollo:**

    ```bash
    pnpm run dev
    ```

    La aplicación estará disponible en `http://localhost:3000`.

## Scripts Útiles

-   `pnpm dev`: Inicia el servidor de desarrollo.
-   `pnpm build`: Compila la aplicación para producción.
-   `pnpm start`: Inicia el servidor de producción.
-   `pnpm test`: Ejecuta las pruebas.
-   `pnpm lint`: Analiza el código en busca de errores.
-   `pnpm format`: Formatea el código.
-   `node scripts/hash-password.js "contraseña"`: Gestiona contraseñas de autenticación de forma segura.