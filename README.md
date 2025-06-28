# Proyecto BWA

Este proyecto consiste en un backend construido con NestJS y un frontend con React + Vite.

## Estructura del Proyecto

```
proyecto-bwa/
├── backend/          # API con NestJS
└── frontend/         # Aplicación React con Vite (por crear)
```

## Backend (NestJS)

### Instalación

```bash
cd backend
npm install
```

### Variables de Entorno

Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

```bash
# Puerto del servidor
PORT=3000

# API Key de Gemini
GEMINI_API_KEY=tu_api_key_aqui

# Base de datos (opcional)
DATABASE_URL=

# JWT Secret (opcional)
JWT_SECRET=
```

### Comandos Disponibles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Construcción
npm run build

# Tests
npm run test

# Linting
npm run lint
```

### Tecnologías Utilizadas

- **NestJS**: Framework de Node.js
- **TypeScript**: Lenguaje de programación
- **@nestjs/config**: Manejo de variables de entorno

## Frontend (React + Vite)

### Instalación

```bash
cd frontend
npm install
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint
```

### Tecnologías Utilizadas

- **React**: Biblioteca de UI
- **Vite**: Build tool y dev server
- **TypeScript**: Lenguaje de programación

## Configuración del Desarrollo

1. Clona el repositorio
2. Configura las variables de entorno en `backend/.env`
3. Instala las dependencias del backend: `cd backend && npm install`
4. Instala las dependencias del frontend: `cd frontend && npm install`
5. Ejecuta el backend: `cd backend && npm run start:dev`
6. Ejecuta el frontend: `cd frontend && npm run dev`

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT.
