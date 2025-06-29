// Variables globales
let palabraSeleccionada = '';
let descripcionGuardada = '';
let canvasActivo = null;
let contextoActivo = null;
let dibujando = false;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarCanvas();
    mostrarPantalla('pantalla-1');
});

// Función para navegar entre pantallas
function navegarA(pantallaId) {
    // Ocultar todas las pantallas
    const pantallas = document.querySelectorAll('.pantalla');
    pantallas.forEach(pantalla => {
        pantalla.classList.remove('activa');
    });
    
    // Mostrar la pantalla seleccionada
    mostrarPantalla(pantallaId);
}

// Función para mostrar una pantalla específica
function mostrarPantalla(pantallaId) {
    const pantalla = document.getElementById(pantallaId);
    if (pantalla) {
        pantalla.classList.add('activa');
        
        // Aplicar animación de entrada
        const contenido = pantalla.querySelector('.contenido');
        if (contenido) {
            contenido.classList.remove('fade-in');
            void contenido.offsetWidth; // Trigger reflow
            contenido.classList.add('fade-in');
        }
        
        // Configurar canvas si es una pantalla de dibujo
        if (pantallaId.startsWith('pantalla-')) {
            const numero = pantallaId.split('-')[1];
            if (numero >= 5 && numero <= 9) {
                configurarCanvas(numero);
            }
        }
    }
}

// Función para seleccionar una palabra
function seleccionarPalabra(palabra) {
    palabraSeleccionada = palabra;
    
    // Actualizar el título en la pantalla 4
    const tituloPalabra = document.getElementById('palabra-seleccionada');
    if (tituloPalabra) {
        tituloPalabra.textContent = palabra;
    }
    
    // Navegar a la pantalla 4
    navegarA('pantalla-4');
}

// Función para guardar la descripción
function guardarDescripcion() {
    const campoTexto = document.getElementById('descripcion-texto');
    if (campoTexto) {
        descripcionGuardada = campoTexto.value;
        
        // Mostrar mensaje de confirmación
        mostrarMensaje('¡Descripción guardada!', 'success');
        
        // Limpiar el campo
        campoTexto.value = '';
        
        // Volver a la pantalla 3 después de un breve delay
        setTimeout(() => {
            navegarA('pantalla-3');
        }, 1500);
    }
}

// Función para finalizar el juego
function finalizarJuego() {
    const modal = document.getElementById('modal-finalizado');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById('modal-finalizado');
    if (modal) {
        modal.style.display = 'none';
        navegarA('pantalla-1');
    }
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear elemento de mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje mensaje-${tipo}`;
    mensajeElement.textContent = mensaje;
    
    // Estilos del mensaje
    mensajeElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideInRight 0.5s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    // Color según el tipo
    if (tipo === 'success') {
        mensajeElement.style.background = 'linear-gradient(45deg, #4CAF50, #66BB6A)';
    } else if (tipo === 'error') {
        mensajeElement.style.background = 'linear-gradient(45deg, #F44336, #EF5350)';
    } else {
        mensajeElement.style.background = 'linear-gradient(45deg, #4A90E2, #5BA0F2)';
    }
    
    // Agregar al DOM
    document.body.appendChild(mensajeElement);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        mensajeElement.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.parentNode.removeChild(mensajeElement);
            }
        }, 500);
    }, 3000);
}

// Función para inicializar todos los canvas
function inicializarCanvas() {
    for (let i = 1; i <= 5; i++) {
        const canvas = document.getElementById(`canvas-${i}`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Configurar el contexto
            ctx.strokeStyle = '#4A90E2';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Eventos del mouse
            canvas.addEventListener('mousedown', iniciarDibujo);
            canvas.addEventListener('mousemove', dibujar);
            canvas.addEventListener('mouseup', terminarDibujo);
            canvas.addEventListener('mouseout', terminarDibujo);
            
            // Eventos táctiles para dispositivos móviles
            canvas.addEventListener('touchstart', manejarTouch);
            canvas.addEventListener('touchmove', manejarTouch);
            canvas.addEventListener('touchend', terminarDibujo);
        }
    }
}

// Función para configurar el canvas activo
function configurarCanvas(numero) {
    canvasActivo = document.getElementById(`canvas-${numero}`);
    if (canvasActivo) {
        contextoActivo = canvasActivo.getContext('2d');
        
        // Limpiar el canvas
        contextoActivo.clearRect(0, 0, canvasActivo.width, canvasActivo.height);
        
        // Configurar el contexto
        contextoActivo.strokeStyle = '#4A90E2';
        contextoActivo.lineWidth = 3;
        contextoActivo.lineCap = 'round';
        contextoActivo.lineJoin = 'round';
    }
}

// Función para iniciar el dibujo
function iniciarDibujo(e) {
    dibujando = true;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (contextoActivo) {
        contextoActivo.beginPath();
        contextoActivo.moveTo(x, y);
    }
}

// Función para dibujar
function dibujar(e) {
    if (!dibujando || !contextoActivo) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    contextoActivo.lineTo(x, y);
    contextoActivo.stroke();
}

// Función para terminar el dibujo
function terminarDibujo() {
    dibujando = false;
}

// Función para manejar eventos táctiles
function manejarTouch(e) {
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (e.type === 'touchstart') {
        dibujando = true;
        if (contextoActivo) {
            contextoActivo.beginPath();
            contextoActivo.moveTo(x, y);
        }
    } else if (e.type === 'touchmove' && dibujando && contextoActivo) {
        contextoActivo.lineTo(x, y);
        contextoActivo.stroke();
    }
}

// Función para limpiar el canvas actual
function limpiarCanvas() {
    if (contextoActivo && canvasActivo) {
        contextoActivo.clearRect(0, 0, canvasActivo.width, canvasActivo.height);
    }
}

// Función para cambiar el color del pincel
function cambiarColor(color) {
    if (contextoActivo) {
        contextoActivo.strokeStyle = color;
    }
}

// Función para cambiar el grosor del pincel
function cambiarGrosor(grosor) {
    if (contextoActivo) {
        contextoActivo.lineWidth = grosor;
    }
}

// Eventos de teclado para atajos
document.addEventListener('keydown', function(e) {
    // ESC para volver al inicio
    if (e.key === 'Escape') {
        navegarA('pantalla-1');
    }
    
    // Enter para confirmar en campos de texto
    if (e.key === 'Enter' && e.target.id === 'descripcion-texto') {
        guardarDescripcion();
    }
});

// Función para generar palabras aleatorias
function generarPalabraAleatoria() {
    const palabras = [
        'Casa', 'Árbol', 'Sol', 'Luna', 'Estrella', 'Flor', 'Mariposa', 
        'Coche', 'Avión', 'Barco', 'Tren', 'Bicicleta', 'Pelota', 'Libro',
        'Lápiz', 'Mesa', 'Ventana', 'Puerta', 'Televisión', 'Teléfono'
    ];
    
    return palabras[Math.floor(Math.random() * palabras.length)];
}

// Función para manejar la selección de palabra aleatoria
function seleccionarPalabraAleatoria() {
    const palabraAleatoria = generarPalabraAleatoria();
    seleccionarPalabra(palabraAleatoria);
}

// Mejorar la experiencia de usuario con feedback visual
function agregarEfectoClick(elemento) {
    elemento.style.transform = 'scale(0.95)';
    setTimeout(() => {
        elemento.style.transform = '';
    }, 150);
}

// Agregar efectos de click a todos los botones
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        agregarEfectoClick(e.target);
    }
});

// Función para guardar el progreso localmente
function guardarProgreso() {
    const progreso = {
        palabraSeleccionada: palabraSeleccionada,
        descripcionGuardada: descripcionGuardada,
        fecha: new Date().toISOString()
    };
    
    localStorage.setItem('converzaap_progreso', JSON.stringify(progreso));
}

// Función para cargar el progreso guardado
function cargarProgreso() {
    const progresoGuardado = localStorage.getItem('converzaap_progreso');
    if (progresoGuardado) {
        const progreso = JSON.parse(progresoGuardado);
        palabraSeleccionada = progreso.palabraSeleccionada || '';
        descripcionGuardada = progreso.descripcionGuardada || '';
    }
}

// Cargar progreso al iniciar
cargarProgreso();

// Guardar progreso cuando se selecciona una palabra
const seleccionarPalabraOriginal = seleccionarPalabra;
seleccionarPalabra = function(palabra) {
    seleccionarPalabraOriginal(palabra);
    guardarProgreso();
};

// Guardar progreso cuando se guarda una descripción
const guardarDescripcionOriginal = guardarDescripcion;
guardarDescripcion = function() {
    guardarDescripcionOriginal();
    guardarProgreso();
}; 