
/* ==================== INICIALIZACIÓN DE LA APLICACIÓN ==================== */
document.addEventListener('DOMContentLoaded', () => {
    bienvenida();
    manejarCierreSesion();
    inicializarFormulario();
    cargarProductos();
    const closeButtons = document.querySelectorAll('.title button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const container = document.querySelector('.container');
            container.classList.remove('no-touch');
        });
    });
});

/* ==================== FUNCIONES DE AUTENTICACIÓN Y SESIÓN ==================== */
async function bienvenida() {
    try {
        const response = await fetch('/obtener-nombre');
        const data = await response.json();
        
        if (data.nombre) {
            const bienvenida = document.querySelector('.bienvenida');
            if (bienvenida) {
                bienvenida.innerHTML = '<i class="fas fa-microchip"></i> DB Tec.';
            }
        }
    } catch (error) {
        console.error('Error al obtener el nombre:', error);
    }
}

function manejarCierreSesion() {
    const btnLogout = document.querySelector('.logout-btn');
    btnLogout.addEventListener('click', async () => {
        try {
            const response = await fetch('/cerrar-sesion', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });
}

/* ==================== GESTIÓN DE INTERFAZ Y NAVEGACIÓN ==================== */
// Agregar esta función para cargar los productos
async function cargarProductos() {
    try {
        const response = await fetch('/obtener-productos');
        const data = await response.json();
        
        if (data.success) {
            const datalist = document.getElementById('productos-list');
            datalist.innerHTML = ''; // Limpiar opciones existentes
            
            data.productos.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto;
                datalist.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}


function mostrar(item) {
    var div = document.querySelector(item);
    const container = document.querySelector('.container');
    const otherDiv = item === '.cuentas' ? 
        document.querySelector('.form1') : 
        document.querySelector('.cuentas');
    
    if (item === '.cuentas') {
        document.querySelector('.form1').style.display = 'none';
        cargarRegistros();
        // Deshabilitar touch en el contenedor
        container.classList.add('no-touch');
    } else if (item === '.form1') {
        document.querySelector('.cuentas').style.display = 'none';
        // Deshabilitar touch en el contenedor
        container.classList.add('no-touch');
    } else {
        // Si se está cerrando, habilitar touch en el contenedor
        container.classList.remove('no-touch');
    }
    
    if (div.style.display === 'none' || div.style.display === '') {
        div.style.display = 'flex';
        // Reset animation
        div.style.animation = 'none';
        div.offsetHeight; // Trigger reflow
        div.style.animation = null;
        
        // Apply animations
        div.style.animation = 'fadeIn 0.3s ease-out forwards';
        const content = item === '.form1' ? 
            div.querySelector('form') : 
            div.querySelector('.registros-container');
        if (content) {
            content.style.animation = 'slideUp 0.3s ease-out';
        }
    } else {
        div.style.display = 'none';
        // Habilitar touch en el contenedor cuando se cierra
        container.classList.remove('no-touch');
    }
    resetearFormulario();
}

/* ==================== GESTIÓN DE FORMULARIOS ==================== */
function inicializarFormulario() {
    const form = document.querySelector('.form1 form');
    
    // Agregar manejo de radio buttons para microondas
    const radioButtons = document.querySelectorAll('input[name="microondas-option"]');
    const tiempoMicroondas = document.querySelector('.microondas-tiempo');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'si') {
                tiempoMicroondas.style.display = 'block';
                tiempoMicroondas.querySelector('input').required = true;
            } else {
                tiempoMicroondas.style.display = 'none';
                tiempoMicroondas.querySelector('input').required = false;
                tiempoMicroondas.querySelector('input').value = '';
            }
        });
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {};
        
        // Procesar opción de microondas
        const microOption = form.querySelector('input[name="microondas-option"]:checked').value;
        if (microOption === 'no') {
            data.microondas = 'No';
        } else {
            data.microondas = formData.get('microondas');
        }
        
        // Process other fields
        formData.forEach((value, key) => {
            if (key !== 'microondas' && key !== 'microondas-option') {
                if (['lote', 'gramaje', 'envasesTerminados'].includes(key)) {
                    data[key] = Number(value) || 0;
                } else {
                    data[key] = value;
                }
            }
        });

        try {
            const response = await fetch('/registrar-produccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                mostrarNotificacion('Registro guardado correctamente','success');
                resetearFormulario();
                mostrar('.form1');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al guardar el registro: ' + error.message);
        }
    });
}

function resetearFormulario() {
    const inputs = document.querySelectorAll('.form1 form input:not([type="radio"])');
    inputs.forEach(input => {
        input.value = '';
    });
    
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(radio => {
        radio.checked = false;
    });
    
    const selector = document.querySelector('.form1 form select');
    if (selector) {
        selector.selectedIndex = 0;
    }
    
    document.querySelector('.microondas-tiempo').style.display = 'none';
}

/* ==================== GESTIÓN DE REGISTROS Y DATOS ==================== */
async function cargarRegistros() {
    try {
        const response = await fetch('/obtener-registros');
        const data = await response.json();
        
        if (data.success) {
            const container = document.querySelector('.registros-container');
            container.innerHTML = ''; // Limpiar contenedor

            data.registros.forEach(registro => {
                const card = crearTarjetaRegistro(registro);
                container.appendChild(card);
            });
        } else {
            throw new Error(data.error || 'Error al cargar registros');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los registros');
    }
}

function crearTarjetaRegistro(registro) {
    const div = document.createElement('div');
    div.className = 'registro-card';
    
    div.innerHTML = `
        <div class="registro-header" onclick="mostrarDetalles(this.parentElement)">
            <div class="registro-fecha">${registro[0]}</div>
            <div class="registro-producto">${registro[1]}</div>
        </div>
        <div class="registro-detalles">
            <p><span>Lote:</span> ${registro[2]}</p>
            <p><span>Gramaje:</span> ${registro[3]}gr</p>
            <p><span>Selección/Cernido:</span> ${registro[4]}</p>
            <p><span>Microondas:</span> ${registro[5]}s</p>
            <p><span>Envases Terminados:</span> ${registro[6]}</p>
            <p><span>Fecha Vencimiento:</span> ${registro[7]}</p>
            <p><span>Nombre:</span> ${registro[8]}</p>
            <p><span>Verificar:</span> ${registro[9] || '—'}</p>
            <p><span>Fecha Ver.:</span> ${registro[10] || '—'}</p>
            <p><span>Observaciones:</span> ${registro[11] || '—'}</p>
        </div>
    `;

    return div;
}

function mostrarDetalles(card) {
    const detalles = card.querySelector('.registro-detalles');
    const todosLosDetalles = document.querySelectorAll('.registro-detalles');
    
    // Cerrar otros detalles abiertos
    todosLosDetalles.forEach(det => {
        if (det !== detalles && det.classList.contains('active')) {
            det.classList.remove('active');
        }
    });
    
    // Toggle detalles actuales
    detalles.classList.toggle('active');
}

async function eliminarRegistro(fecha, producto) {
    const anuncio = document.querySelector('.anuncio');
    const confirmarBtn = anuncio.querySelector('.confirmar');
    const cancelarBtn = anuncio.querySelector('.cancelar');

    return new Promise((resolve) => {
        const cerrarAnuncio = () => {
            anuncio.style.display = 'none';
            confirmarBtn.removeEventListener('click', handleConfirmar);
            cancelarBtn.removeEventListener('click', handleCancelar);
        };

        const handleConfirmar = async () => {
            cerrarAnuncio();
            try {
                const response = await fetch('/eliminar-registro', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fecha, producto })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error en la respuesta del servidor');
                }

                const result = await response.json();
                
                if (result.success) {
                    mostrarNotificacion('Registro eliminado correctamente', 'success');
                    await cargarRegistros();
                } else {
                    throw new Error(result.error || 'No se pudo eliminar el registro');
                }
            } catch (error) {
                console.error('Error detallado:', error);
                mostrarNotificacion(`Error al eliminar el registro: ${error.message}`, 'error');
            }
        };

        const handleCancelar = () => {
            cerrarAnuncio();
            mostrarNotificacion('Operación cancelada', 'warning');
        };

        confirmarBtn.addEventListener('click', handleConfirmar);
        cancelarBtn.addEventListener('click', handleCancelar);
        
        anuncio.style.display = 'flex';
    });
}

/* ==================== SISTEMA DE NOTIFICACIONES ==================== */
function mostrarNotificacion(mensaje, tipo = 'success', duracion = 5000) {
    const notificador = document.querySelector('.notificador');
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    
    let icono;
    switch(tipo) {
        case 'success':
            icono = 'fa-check-circle';
            break;
        case 'warning':
            icono = 'fa-exclamation-triangle';
            break;
        case 'error':
            icono = 'fa-times-circle';
            break;
    }
    
    notificacion.innerHTML = `
        <i class="fas ${icono}"></i>
        <span class="mensaje">${mensaje}</span>
        <button class="cerrar"><i class="fas fa-times"></i></button>
    `;
    
    notificador.appendChild(notificacion);
    
    // Manejar el cierre de la notificación
    const cerrarBtn = notificacion.querySelector('.cerrar');
    cerrarBtn.addEventListener('click', () => {
        notificacion.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => notificacion.remove(), 300);
    });
    
    // Auto-cerrar después de la duración especificada
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => notificacion.remove(), 300);
        }
    }, duracion);
}