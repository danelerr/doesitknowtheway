# Módulo Gemini - Guía de Configuración y Uso

Este módulo implementa tres endpoints para interactuar con Google Gemini AI.

## Configuración

### 1. Variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
GEMINI_API_KEY=tu_api_key_de_google_gemini
```

Para obtener una API key:
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un nuevo proyecto o usa uno existente
3. Genera una nueva API key
4. Copia la key al archivo `.env`

## Endpoints implementados

### 1. `/gemini/gess-word` (POST)
Adivina una palabra basada en una descripción ambigua.

**Request:**
```json
{
  "text": "Es redondo, rebota y se usa en deportes"
}
```

**Response:**
```json
{
  "word": "pelota"
}
```

**Validaciones:**
- El texto es requerido
- Máximo 20 palabras

### 2. `/gemini/gess-draw` (POST)
Analiza una imagen/dibujo y responde qué es.

**Request:**
- Multipart form data
- Campo: `image` (archivo de imagen)

**Response:**
```json
{
  "description": "gato"
}
```

### 3. `/gemini/gess-situation` (POST)
Analiza 5 imágenes y describe la situación que representan.

**Request:**
- Multipart form data
- Campo: `images` (exactamente 5 archivos de imagen)

**Response:**
```json
{
  "situation": "un doctor le explica a su paciente que no es un vampiro"
}
```

## Ejemplos de uso

### Con curl:
```bash
# Adivinar palabra
curl -X POST http://localhost:3000/gemini/gess-word \
  -H "Content-Type: application/json" \
  -d '{"text": "Vuela sin alas, no tiene plumas pero canta"}'

# Analizar dibujo
curl -X POST http://localhost:3000/gemini/gess-draw \
  -F "image=@/ruta/a/tu/imagen.jpg"

# Analizar situación
curl -X POST http://localhost:3000/gemini/gess-situation \
  -F "images=@/ruta/imagen1.jpg" \
  -F "images=@/ruta/imagen2.jpg" \
  -F "images=@/ruta/imagen3.jpg" \
  -F "images=@/ruta/imagen4.jpg" \
  -F "images=@/ruta/imagen5.jpg"
```

### Desde Frontend (JavaScript):
```javascript
// Adivinar palabra
const response = await fetch('/gemini/gess-word', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Es redondo, rebota y se usa en deportes' })
});
const result = await response.json();

// Analizar imagen
const formData = new FormData();
formData.append('image', fileInput.files[0]);
const response = await fetch('/gemini/gess-draw', {
  method: 'POST',
  body: formData
});
```

## Notas importantes

1. Asegúrate de tener una API key válida de Google Gemini
2. Las imágenes se procesan en formato base64
3. El módulo maneja errores apropiadamente
4. Los endpoints están diseñados para ser consumidos por un frontend
