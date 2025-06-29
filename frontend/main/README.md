# ConverZaap - Aplicación Educativa Interactiva

## 🎮 Descripción

ConverZaap es una aplicación educativa interactiva diseñada para niños, que combina el aprendizaje de palabras y frases con actividades de dibujo. La aplicación está construida completamente en HTML, CSS y JavaScript vanilla, sin dependencias externas.

## 🌈 Características

### 🎨 Diseño Visual
- **Colores principales**: Azul (#4A90E2) y Amarillo (#F5A623)
- **Tipografía**: Fredoka (Google Fonts) - redondeada y amigable
- **Estilo**: Gráficos planos y diseño colorido para niños
- **Responsive**: Adaptable a diferentes tamaños de pantalla

### 🎯 Funcionalidades
- **9 pantallas interactivas** con navegación fluida
- **Animaciones suaves** (fade-in, slide, escalado en hover)
- **Sistema de dibujo** con canvas HTML5
- **Selección de palabras** con descripción
- **Modo aleatorio** para palabras
- **Guardado de progreso** en localStorage
- **Soporte táctil** para dispositivos móviles

## 📱 Pantallas de la Aplicación

### 1. **Pantalla de Bienvenida**
- Título: "ConverZaap"
- Subtítulo: "Bienvenidos a un mundo de palabras y frases"
- Botones: JUGAR, DIBUJOS, FRASES

### 2. **Modos de Juego**
- Título: "MODOS DE JUEGO"
- Botones: DIBUJOS, FRASES

### 3. **Selección de Palabras**
- Título: "SELECCIONA UNA PALABRA"
- Palabras disponibles: Silla, Perro, Pantalón, Tomate, Random
- Cada palabra tiene su ícono representativo

### 4. **Descripción de Palabras**
- Título dinámico que muestra la palabra seleccionada
- Campo de texto para escribir descripciones
- Botón para guardar la descripción

### 5-9. **Adivina Dibujando**
- 5 etapas de dibujo
- Canvas interactivo para dibujar
- Navegación entre etapas
- Modal de finalización

## 🚀 Cómo Usar

### Instalación
1. Descarga todos los archivos en una carpeta
2. Abre `index.html` en tu navegador web
3. ¡Listo para usar!

### Navegación
- **Botones principales**: Navegan entre pantallas
- **Botón "Volver"**: Regresa a la pantalla anterior
- **Tecla ESC**: Vuelve al inicio desde cualquier pantalla
- **Enter**: Confirma en campos de texto

### Dibujo
- **Mouse**: Click y arrastrar para dibujar
- **Táctil**: Tocar y arrastrar en dispositivos móviles
- **Color**: Azul por defecto
- **Grosor**: 3px por defecto

## 🎨 Personalización

### Colores
Los colores principales se pueden modificar en `styles.css`:
```css
/* Azul principal */
--color-azul: #4A90E2;

/* Amarillo principal */
--color-amarillo: #F5A623;
```

### Palabras
Para agregar más palabras, edita la función `generarPalabraAleatoria()` en `script.js`:
```javascript
const palabras = [
    'Casa', 'Árbol', 'Sol', 'Luna', 'Estrella', 'Flor', 'Mariposa',
    // Agrega más palabras aquí
];
```

## 📱 Compatibilidad

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles (iOS/Android)

## 🛠️ Estructura de Archivos

```
frontend/main/
├── index.html          # Archivo principal HTML
├── styles.css          # Estilos CSS
├── script.js           # Funcionalidad JavaScript
├── README.md           # Este archivo
└── Fronend.pdf         # Diseño de referencia
```

## 🎯 Características Técnicas

### Animaciones
- **Fade-in**: Entrada suave de elementos
- **Slide**: Transiciones entre pantallas
- **Scale**: Efectos hover en botones
- **Gradient shift**: Fondo animado

### Responsive Design
- **Desktop**: Pantalla completa con elementos grandes
- **Tablet**: Adaptación automática de tamaños
- **Mobile**: Diseño optimizado para pantallas pequeñas

### Funcionalidades Avanzadas
- **LocalStorage**: Guarda progreso del usuario
- **Touch Events**: Soporte completo para dispositivos táctiles
- **Keyboard Shortcuts**: Atajos de teclado
- **Canvas API**: Sistema de dibujo nativo

## 🎨 Paleta de Colores

```css
/* Colores principales */
Azul: #4A90E2
Amarillo: #F5A623

/* Variaciones */
Azul claro: #5BA0F2
Amarillo claro: #FFB74D
Verde éxito: #4CAF50
Rojo error: #F44336
```

## 🔧 Desarrollo

### Agregar Nuevas Pantallas
1. Agrega la sección HTML en `index.html`
2. Define los estilos en `styles.css`
3. Implementa la lógica en `script.js`

### Modificar Animaciones
Las animaciones están definidas en `styles.css` usando `@keyframes`:
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
1. Revisa la consola del navegador para errores
2. Verifica que todos los archivos estén en la misma carpeta
3. Asegúrate de usar un navegador moderno

## 🎉 ¡Disfruta ConverZaap!

Esta aplicación está diseñada para hacer el aprendizaje divertido y interactivo. ¡Esperamos que los niños disfruten explorando el mundo de las palabras y el dibujo! 