document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/obtener-nombre', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        if (!data.nombre) {
            throw new Error('No se encontró el nombre de usuario');
        }

        // Si llegamos aquí, la sesión es válida
        const bienvenida = document.querySelector('.bienvenida');
        if (bienvenida) {
            bienvenida.innerHTML = '<i class="fas fa-microchip"></i> DB Tec.';
        }

        // Inicializar eventos después de confirmar la sesión
        inicializarEventos();
    } catch (error) {
        console.error('Error:', error);
        // En lugar de redireccionar, mostrar un mensaje
        const bienvenida = document.querySelector('.bienvenida');
        if (bienvenida) {
            bienvenida.innerHTML = 'Error de sesión. Por favor, <a href="/">inicie sesión nuevamente</a>';
        }
    }
});

// ... resto del código se mantiene igual ...
function inicializarEventos() {
    manejarCierreSesion();
    
    // Agregar evento al botón de registro
    const btnRegistro = document.querySelector('.registrarProducto');
    if (btnRegistro) {
        btnRegistro.addEventListener('click', () => {
            mostrar('.form1');
            inicializarFormulario();
        });
    }

    // Agregar evento al botón de consulta
    const btnConsulta = document.querySelector('.consultarProducto');
    if (btnConsulta) {
        btnConsulta.addEventListener('click', () => mostrar('.cuentas'));
    }
}
async function bienvenida() {
    const response = await fetch('/obtener-nombre', {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        },
        credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
    }

    const data = await response.json();
    
    if (!data.nombre) {
        throw new Error('No se encontró el nombre de usuario');
    }

    const bienvenida = document.querySelector('.bienvenida');
    if (bienvenida) {
        bienvenida.innerHTML = '<i class="fas fa-microchip"></i> DB Tec.';
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
function mostrar(item) {
    var div = document.querySelector(item);
    if (!div) return;

    if (item === '.cuentas') {
        document.querySelector('.form1').style.display = 'none';
        cargarRegistros();
    } else if (item === '.form1') {
        document.querySelector('.cuentas').style.display = 'none';
    }
    
    if (div.style.display === 'none' || div.style.display === '') {
        div.style.display = 'flex';
    } else {
        div.style.display = 'none';
    }
    
    if (item === '.form1') {
        resetearFormulario();
    }
}
function inicializarFormulario() {
    const form = document.querySelector('.form1 form');

    if (!form) {
        console.error("Error: No se encontró el formulario dentro de '.form1'.");
        return; // Salir de la función si el formulario no existe
    }

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

        const microOption = form.querySelector('input[name="microondas-option"]:checked');
        if (microOption && microOption.value === 'no') {
            data.microondas = 'No';
        } else {
            data.microondas = formData.get('microondas');
        }

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
                mostrarNotificacion('Registro guardado correctamente', 'success');
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


// Agregar después de las funciones existentes
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

// Agregar después de las funciones existentes
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
            <button class="btn-eliminar" onclick="eliminarRegistro('${registro[0]}', '${registro[1]}')">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
    `;

    return div;
}





// Agregar al inicio del archivo, después de las importaciones
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

// Modificar la función eliminarRegistro
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
