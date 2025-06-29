# 🎨 Drawing Guesser - Aplicación de Canvas

Esta aplicación permite dibujar en un canvas interactivo y enviar el dibujo al backend para que la IA adivine qué es.

## ✨ Características

### 🖌️ Herramientas de Dibujo
- **5 Tipos de Pincel:**
  - Pincel Normal (línea simple)
  - Pincel Suave (con sombra difuminada)
  - Marcador (trazo cuadrado, semi-transparente)
  - Lápiz (trazo suave)
  - Rotulador (trazo con sombra ligera)

### 🎨 Opciones de Color
- **10 Colores disponibles:**
  - Negro, Rojo, Verde, Azul, Amarillo
  - Magenta, Cian, Naranja, Púrpura, Rosa

### 📏 Grosor de Línea
- Control deslizante de 1px a 50px
- Botones rápidos: 1px, 2px, 5px, 10px, 15px, 20px

### 🧽 Borrador
- Modo borrador activable
- Mantiene el grosor seleccionado para borrar

### 🖼️ Canvas
- Tamaño: 800x600 pixeles
- Fondo blanco
- Botón para limpiar completamente

### 🤖 Integración con IA
- Envío automático al endpoint `/gess-draw`
- Muestra el resultado de la predicción
- Indicador de carga mientras procesa

## 🚀 Cómo Usar

1. **Selecciona tu herramienta:**
   - Elige un pincel del panel izquierdo
   - Selecciona un color
   - Ajusta el grosor de línea

2. **Dibuja:**
   - Haz clic y arrastra en el canvas para dibujar
   - Usa el borrador para corregir errores
   - Limpia el canvas si quieres empezar de nuevo

3. **Obtén predicción:**
   - Haz clic en "¿Qué es mi dibujo?"
   - Espera a que la IA procese tu dibujo
   - Ve el resultado en el panel derecho

## 🔧 Estructura de Componentes

```
src/
├── components/
│   ├── DrawingCanvas.tsx    # Canvas principal de dibujo
│   ├── Toolbar.tsx          # Panel de herramientas
│   └── ResultDisplay.tsx    # Muestra resultados de la IA
├── types/
│   └── drawing.ts           # Tipos TypeScript
├── config/
│   └── api.ts              # Configuración de API
└── App.tsx                 # Componente principal
```

## 📱 Responsive Design

- Diseño adaptativo para móviles y tablets
- Canvas redimensionable en pantallas pequeñas
- Layout flexible que se reorganiza según el tamaño

## 🎯 Funcionalidades Técnicas

- **Canvas HTML5** para dibujo suave
- **React Hooks** para gestión de estado
- **TypeScript** para tipado seguro
- **Blob/FormData** para envío de imágenes
- **Base64** para manejo de datos de imagen
- **CSS-in-JS** para estilos dinámicos

## ⚙️ Configuración

El archivo `config/api.ts` permite modificar:
- URL del backend
- Endpoints de la API
- Dimensiones del canvas

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    guessDraw: '/gess-draw'
  }
};
```

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```

## 🐛 Troubleshooting

### El dibujo no se envía
- Verifica que el backend esté ejecutándose en el puerto 3000
- Asegúrate de haber dibujado algo antes de enviar

### Canvas no responde
- Refresca la página
- Verifica la consola del navegador para errores

### Errores de CORS
- Configura CORS en el backend para permitir `http://localhost:5173`

## 🚀 Próximas Mejoras

- [ ] Deshacer/Rehacer (Ctrl+Z)
- [ ] Guardar dibujos localmente
- [ ] Más tipos de pincel (spray, textura)
- [ ] Capas de dibujo
- [ ] Zoom y paneo
- [ ] Formas geométricas (círculo, rectángulo)

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
