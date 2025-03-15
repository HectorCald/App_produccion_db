
/* ==================== INICIALIZACIÓN DE LA APLICACIÓN ==================== */
document.addEventListener('DOMContentLoaded', () => {
    bienvenida();
    manejarCierreSesion();
    inicializarMenu();
    cargarUsuarios();
});

/* ==================== FUNCIONES DE AUTENTICACIÓN Y SESIÓN ==================== */
async function bienvenida() {
    try {
        const response = await fetch('/obtener-nombre');
        const data = await response.json();
        
        if (data.nombre) {
            const bienvenida = document.querySelector('.bienvenida');
            if (bienvenida) {
                bienvenida.innerHTML = '<i class="fas fa-microchip"></i> Adimin.';
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
/* ==================== MANEJO DEL MENÚ ==================== */
function inicializarMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (!menuBtn || !dropdownMenu) {
        console.error('No se encontraron elementos del menú');
        return;
    }

    // Removemos eventos previos si existen
    menuBtn.removeEventListener('click', toggleMenu);
    document.removeEventListener('click', closeMenuOutside);

    // Función para toggle del menú
    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
    }

    // Función para cerrar al hacer clic fuera
    function closeMenuOutside(e) {
        if (dropdownMenu.classList.contains('active') && 
            !dropdownMenu.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    }

    // Agregamos los eventos
    menuBtn.addEventListener('click', toggleMenu);
    document.addEventListener('click', closeMenuOutside);
}

async function cargarUsuarios() {
    try {
        const response = await fetch('/obtener-usuarios', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            const usuariosView = document.querySelector('.usuarios-view');
            if (!usuariosView) return;

            usuariosView.innerHTML = `
                <div class="usuarios-container">
                    <div class="usuarios-header">
                        <h2>Usuarios</h2>
                        <button class="btn-crear-usuario" onclick="agregarUsuario()">
                            <i class="fas fa-user-plus"></i> Crear Usuario
                        </button>
                    </div>
                    <div class="usuarios-table">
                        <div class="table-header">
                            <div class="header-cell">PIN</div>
                            <div class="header-cell">Nombre</div>
                            <div class="header-cell">Rol</div>
                        </div>
                        <div class="table-body">
                            ${data.usuarios.map(usuario => `
                                <div class="usuario-row">
                                    <div class="usuario-info" onclick="toggleAcciones('${usuario.pin}')">
                                        <div class="cell">${usuario.pin}</div>
                                        <div class="cell">${usuario.nombre}</div>
                                        <div class="cell">${usuario.rol}</div>
                                    </div>
                                    <div class="acciones-dropdown" id="acciones-${usuario.pin}">
                                        <button onclick="mostrarPermisos('${usuario.pin}')">
                                            <i class="fas fa-key"></i> Permisos
                                        </button>
                                        <button onclick="editarUsuario('${usuario.pin}')">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                        <button onclick="eliminarUsuario('${usuario.pin}')">
                                            <i class="fas fa-trash"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            mostrarNotificacion(data.error || 'Error al cargar usuarios', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar usuarios', 'error');
    }
}

async function eliminarUsuario(pin) {
    const anuncio = document.querySelector('.anuncio');
    const contenido = anuncio.querySelector('.anuncio-contenido');
    const btnConfirmar = anuncio.querySelector('.confirmar');
    const btnCancelar = anuncio.querySelector('.cancelar');

    btnConfirmar.textContent = 'Eliminar';
    btnConfirmar.style.backgroundColor = '#f44336';

    // Personalizar el contenido del anuncio
    contenido.querySelector('h2').textContent = '¿Eliminar usuario?';
    contenido.querySelector('p').textContent = 'Esta acción no se puede deshacer';

    // Mostrar el anuncio y aplicar el efecto blur
    anuncio.style.display = 'flex';
    document.querySelector('.container').classList.add('no-touch');

    // Manejar la confirmación
    btnConfirmar.onclick = async () => {
        try {
            const response = await fetch('/eliminar-usuario', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ pin })
            });

            const data = await response.json();
            if (data.success) {
                mostrarNotificacion('Usuario eliminado correctamente', 'success');
                cargarUsuarios(); // Recargar la lista de usuarios
            } else {
                mostrarNotificacion(data.error || 'Error al eliminar usuario', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al eliminar usuario', 'error');
        }

        // Cerrar el anuncio y quitar el efecto blur
        anuncio.style.display = 'none';
        document.querySelector('.container').classList.remove('no-touch');
    };

    // Manejar la cancelación
    btnCancelar.onclick = () => {
        anuncio.style.display = 'none';
        document.querySelector('.container').classList.remove('no-touch');
    };
}

function toggleAcciones(pin) {
    const acciones = document.getElementById(`acciones-${pin}`);
    const row = acciones.parentElement;
    const allRows = document.querySelectorAll('.usuario-row');
    
    // Cerrar otros menús abiertos
    allRows.forEach(r => {
        if (r !== row) {
            r.classList.remove('active');
            r.querySelector('.acciones-dropdown').classList.remove('active');
        }
    });
    
    // Toggle del menú actual
    row.classList.toggle('active');
    acciones.classList.toggle('active');
}
function anuncio(tituloTexto, mensaje) {
    const anuncioElement = document.querySelector('.anuncio');
    const tituloElement = document.querySelector('.anuncio-contenido h2');
    const descripcionElement = document.querySelector('.anuncio-contenido p');

    if (!anuncioElement || !tituloElement || !descripcionElement) {
        console.error('No se encontraron los elementos del anuncio');
        return;
    }

    tituloElement.textContent = tituloTexto;
    descripcionElement.textContent = mensaje;
    anuncioElement.style.display = 'flex';
    document.querySelector('.container').classList.add('no-touch');
}
function agregarUsuario() {
    const anuncio = document.querySelector('.anuncio');
    const contenido = anuncio.querySelector('.anuncio-contenido');
    const btnConfirmar = anuncio.querySelector('.confirmar');
    const btnCancelar = anuncio.querySelector('.cancelar');

    btnConfirmar.textContent = 'Crear';
    btnConfirmar.style.backgroundColor = '#4CAF50';

    // Personalizar el contenido del anuncio
    contenido.querySelector('h2').textContent = 'Nuevo Usuario';
    contenido.querySelector('p').innerHTML = `
        <div class="form-group">
            <p>Nombre</p>
            <input type="text" id="nombre-usuario" required>
        </div>
        <div class="form-group">
            <p>PIN</p>
            <input type="number" id="pin-usuario" required>
        </div>
    `;

    // Mostrar el anuncio
    anuncio.style.display = 'flex';
    document.querySelector('.container').classList.add('no-touch');

    // Manejar la confirmación
    btnConfirmar.onclick = async () => {
        const pin = document.getElementById('pin-usuario').value;
        const nombre = document.getElementById('nombre-usuario').value;

        if (!pin || !nombre) {
            mostrarNotificacion('Por favor complete todos los campos', 'error');
            return;
        }

        try {
            const response = await fetch('/crear-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ pin, nombre })
            });

            const data = await response.json();
            if (data.success) {
                mostrarNotificacion('Usuario creado correctamente', 'success');
                cargarUsuarios(); // Recargar la lista de usuarios
            } else {
                mostrarNotificacion(data.error || 'Error al crear usuario', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al crear usuario', 'error');
        }

        // Cerrar el anuncio
        anuncio.style.display = 'none';
        document.querySelector('.container').classList.remove('no-touch');
    };

    // Manejar la cancelación
    btnCancelar.onclick = () => {
        anuncio.style.display = 'none';
        document.querySelector('.container').classList.remove('no-touch');
    };
}