#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar header
show_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   🚀 API Project Initializer                ║"
    echo "║                                                              ║"
    echo "║            Configura tu nueva API base Next.js              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Función para mostrar mensaje de error
error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Función para mostrar mensaje de éxito
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar mensaje de información
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Función para mostrar mensaje de advertencia
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para validar nombre del proyecto
validate_project_name() {
    local name=$1
    if [[ ! $name =~ ^[a-z0-9-]+$ ]]; then
        return 1
    fi
    return 0
}

# Función para generar JWT secret aleatorio
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

# Función para generar 2FA secret aleatorio
generate_2fa_secret() {
    openssl rand -base64 20 | tr -d "=+/" | tr '[:lower:]' '[:upper:]' | cut -c1-16
}

# Función principal
main() {
    show_header
    
    # Verificar que estamos en el directorio correcto
    if [[ ! -f "package.json" ]]; then
        error "Este script debe ejecutarse desde la raíz del proyecto (donde está package.json)"
    fi
    
    # Verificar que es un proyecto Next.js válido
    if ! grep -q '"next":' package.json; then
        error "Este script debe ejecutarse en un proyecto Next.js válido"
    fi
    
    info "¡Vamos a configurar tu nueva API base!"
    echo
    
    # Solicitar información del proyecto
    while true; do
        read -p "📝 Nombre del proyecto (solo minúsculas, números y guiones): " PROJECT_NAME
        if validate_project_name "$PROJECT_NAME"; then
            break
        else
            warning "Nombre inválido. Use solo minúsculas, números y guiones (ej: mi-api-proyecto)"
        fi
    done
    
    read -p "📄 Descripción del proyecto: " PROJECT_DESCRIPTION
    read -p "👤 Nombre del autor: " AUTHOR_NAME
    read -p "📧 Email del autor: " AUTHOR_EMAIL
    
    # Configuración de autenticación
    echo
    info "Configuración de autenticación:"
    read -p "🔐 Usuario por defecto para la API (default: admin): " AUTH_USERNAME
    AUTH_USERNAME=${AUTH_USERNAME:-admin}
    
    read -s -p "🔑 Contraseña por defecto (mínimo 8 caracteres): " AUTH_PASSWORD
    echo
    while [[ ${#AUTH_PASSWORD} -lt 8 ]]; do
        warning "La contraseña debe tener al menos 8 caracteres"
        read -s -p "🔑 Contraseña por defecto (mínimo 8 caracteres): " AUTH_PASSWORD
        echo
    done
    
    # Generar secrets
    info "Generando secrets de seguridad..."
    JWT_SECRET=$(generate_jwt_secret)
    FA_SECRET=$(generate_2fa_secret)
    
    echo
    info "Configuración a aplicar:"
    echo "  • Nombre: $PROJECT_NAME"
    echo "  • Descripción: $PROJECT_DESCRIPTION"
    echo "  • Autor: $AUTHOR_NAME <$AUTHOR_EMAIL>"
    echo "  • Usuario API: $AUTH_USERNAME"
    echo "  • JWT Secret: ${JWT_SECRET:0:20}... (generado)"
    echo "  • 2FA Secret: $FA_SECRET (generado)"
    
    echo
    read -p "¿Continuar con la configuración? (y/N): " CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        info "Configuración cancelada"
        exit 0
    fi
    
    echo
    info "🚀 Iniciando configuración del proyecto..."
    
    # 1. Actualizar package.json
    info "📦 Actualizando package.json..."
    sed -i.bak "s/\"cl-donlee-api-nextjs\"/\"$PROJECT_NAME\"/" package.json
    success "package.json actualizado"
    
    # 2. Actualizar README.md
    if [[ -f "README.md" ]]; then
        info "📚 Actualizando README.md..."
        # Capitalize first letter of project name
        CAPITALIZED_NAME="$(echo ${PROJECT_NAME:0:1} | tr '[:lower:]' '[:upper:]')${PROJECT_NAME:1}"
        sed -i.bak "s/CL Donlee API/${CAPITALIZED_NAME} API/g" README.md
        sed -i.bak "s/cl-donlee-api-nextjs/$PROJECT_NAME/g" README.md
        sed -i.bak "s/cl-donlee-api-base-nextjs/$PROJECT_NAME/g" README.md
        sed -i.bak "s/cl-donlee-api-base2-nextjs/$PROJECT_NAME/g" README.md
        sed -i.bak "s/A modern Next.js API/$PROJECT_DESCRIPTION/g" README.md
        success "README.md actualizado"
    fi
    
    # 3. Actualizar CLAUDE.md
    if [[ -f "CLAUDE.md" ]]; then
        info "🤖 Actualizando CLAUDE.md..."
        # Capitalize first letter of project name
        CAPITALIZED_NAME="$(echo ${PROJECT_NAME:0:1} | tr '[:lower:]' '[:upper:]')${PROJECT_NAME:1}"
        sed -i.bak "s/CL Donlee API/${CAPITALIZED_NAME} API/g" CLAUDE.md
        sed -i.bak "s/cl-donlee-api-nextjs/$PROJECT_NAME/g" CLAUDE.md
        sed -i.bak "s/cl-donlee-api-base-nextjs/$PROJECT_NAME/g" CLAUDE.md
        sed -i.bak "s/cl-donlee-api-base2-nextjs/$PROJECT_NAME/g" CLAUDE.md
        sed -i.bak "s/A modern Next.js API/$PROJECT_DESCRIPTION/g" CLAUDE.md
        success "CLAUDE.md actualizado"
    fi
    
    # 4. Actualizar archivos de código
    info "💻 Actualizando archivos de código..."
    
    # Actualizar page.tsx
    if [[ -f "src/app/page.tsx" ]]; then
        # Use previously calculated capitalized name
        sed -i.bak "s/CL Donlee API/${CAPITALIZED_NAME} API/g" src/app/page.tsx
        sed -i.bak "s/cl-donlee/$PROJECT_NAME/g" src/app/page.tsx
    fi
    
    # Actualizar docs/page.tsx
    if [[ -f "src/app/docs/page.tsx" ]]; then
        sed -i.bak "s/CL Donlee API/${CAPITALIZED_NAME} API/g" src/app/docs/page.tsx
    fi
    
    # Actualizar swagger.ts
    if [[ -f "src/lib/config/swagger.ts" ]]; then
        sed -i.bak "s/CL Donlee API/${CAPITALIZED_NAME} API/g" src/lib/config/swagger.ts
        sed -i.bak "s/A modern Next.js API/$PROJECT_DESCRIPTION/g" src/lib/config/swagger.ts
    fi
    
    # Actualizar totp.ts
    if [[ -f "src/lib/auth/totp.ts" ]]; then
        sed -i.bak "s/CL Donlee/${CAPITALIZED_NAME}/g" src/lib/auth/totp.ts
        
        # Actualizar documentación
        if [[ -f "docs/CONTRIBUTING.md" ]]; then
            sed -i.bak "s/CL Donlee API/${CAPITALIZED_NAME} API/g" docs/CONTRIBUTING.md
            sed -i.bak "s/CL Donlee/${CAPITALIZED_NAME}/g" docs/CONTRIBUTING.md
            sed -i.bak "s/cl-donlee-api-nextjs/$PROJECT_NAME/g" docs/CONTRIBUTING.md
        fi
        
        if [[ -f "docs/RELEASE_v1.0.0.md" ]]; then
            sed -i.bak "s/CL Donlee API/${CAPITALIZED_NAME} API/g" docs/RELEASE_v1.0.0.md
            sed -i.bak "s/CL Donlee/${CAPITALIZED_NAME}/g" docs/RELEASE_v1.0.0.md
            sed -i.bak "s/cl-donlee-api-nextjs/$PROJECT_NAME/g" docs/RELEASE_v1.0.0.md
        fi
    fi
    
    success "Archivos de código y documentación actualizados"
    
    # 5. Crear archivo .env.local
    info "🔧 Creando archivo .env.local..."
    cat > .env.local << EOF
# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=1h

# Authentication Configuration
AUTH_USERNAME=$AUTH_USERNAME
AUTH_PASSWORD=$AUTH_PASSWORD
AUTH_2FA_SECRET=$FA_SECRET

# Environment Configuration
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=5
EOF
    success ".env.local creado con configuración personalizada"
    
    # 6. Crear .env.example
    info "📋 Creando .env.example..."
    cat > .env.example << EOF
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# Authentication Configuration
AUTH_USERNAME=admin
AUTH_PASSWORD=secure-password-123
AUTH_2FA_SECRET=JBSWY3DPEHPK3PXP

# Environment Configuration
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=5
EOF
    success ".env.example creado"
    
    # 7. Limpiar archivos de backup
    info "🧹 Limpiando archivos temporales..."
    find . -name "*.bak" -delete
    success "Archivos temporales eliminados"
    
    # 8. Limpiar documentos específicos del proyecto original
    if [[ -d "docs" ]]; then
        info "📄 Limpiando documentación específica del proyecto original..."
        rm -f docs/RELEASE_v1.0.0.md
        rm -f docs/CONTRIBUTING.md
        success "Documentación original eliminada"
    fi
    
    echo
    success "🎉 ¡Proyecto inicializado exitosamente!"
    echo
    info "Próximos pasos:"
    echo "  1. Instalar dependencias: pnpm install"
    echo "  2. Configurar 2FA con el secret: $FA_SECRET"
    echo "     • Agregar a Google Authenticator o similar"
    echo "     • Nombre de cuenta: \"${CAPITALIZED_NAME} API\""
    echo "     • Emisor: \"${CAPITALIZED_NAME}\""
    echo "  3. Iniciar desarrollo: pnpm dev"
    echo "  4. Acceder a: http://localhost:3000"
    echo
    warning "¡Importante! Cambia las credenciales por defecto antes de producción"
    echo
    info "Tu nuevo proyecto API está listo para desarrollar 🚀"
}

# Ejecutar función principal
main "$@"