export function inicializarConsulta() {
    const container = document.querySelector('.consultarRegistros-view');
    container.innerHTML = `
        <div class="consulta-view">
            <div class="title">
                <h3>Consulta de Registros</h3>
            </div>
            <div class="filtros-container">
                <div class="filtro">
                    <p>Rango de Fechas</p>
                    <div class="fecha-range">
                        <input type="date" id="filtroFechaInicio" placeholder="Fecha Inicio">
                        <span>hasta</span>
                        <input type="date" id="filtroFechaFin" placeholder="Fecha Fin">
                    </div>
                </div>
                <div class="filtro">
                    <p>Numero de Lote</p>
                    <input type="number" id="filtroLote" placeholder="Número de Lote">
                </div>
                <div class="filtro">
                    <p>Nombre del producto</p>
                    <input type="text" name="producto" id="producto-input" list="productos-list"
                        placeholder="Nombre del producto" autocomplete="off" required>
                    <datalist id="productos-list">
                    </datalist>
                </div>
                <div class="filtro">
                    <p>Nombre del Operario</p>
                    <input type="text" id="filtroNombre" placeholder="Nombre del operario">
                </div>
                <button class="btn-buscar" onclick="buscarRegistros()">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="resultados-container">
            </div>
        </div>
    `;

    // Configurar el evento de búsqueda en el botón
    const btnBuscar = container.querySelector('.btn-buscar');
    btnBuscar.addEventListener('click', buscarRegistros);
}
export async function buscarRegistros() {
    try {
        mostrarCarga();
        const fechaInicio = document.getElementById('filtroFechaInicio').value;
        const fechaFin = document.getElementById('filtroFechaFin').value;
        const lote = document.getElementById('filtroLote').value;
        const producto = document.getElementById('producto-input').value;
        const nombre = document.getElementById('filtroNombre').value;

        console.log('Filtros:', { fechaInicio, fechaFin, lote, producto, nombre });

        const response = await fetch('/obtener-todos-registros');
        const data = await response.json();

        if (data.success) {
            const registrosFiltrados = data.registros.slice(1).filter(registro => {
                if (!registro || registro.length < 9) return false;

                // Convertir la fecha del registro al formato YYYY-MM-DD
                const [dia, mes, anio] = registro[0].split('/');
                const fechaRegistro = new Date(anio, mes - 1, dia);
                const fechaRegistroStr = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

                // Verificar el rango de fechas
                let cumpleFecha = true;
                if (fechaInicio && fechaFin) {
                    const inicio = new Date(fechaInicio);
                    const fin = new Date(fechaFin);
                    cumpleFecha = fechaRegistro >= inicio && fechaRegistro <= fin;
                } else if (fechaInicio) {
                    const inicio = new Date(fechaInicio);
                    cumpleFecha = fechaRegistro >= inicio;
                } else if (fechaFin) {
                    const fin = new Date(fechaFin);
                    cumpleFecha = fechaRegistro <= fin;
                }

                const cumpleProducto = !producto || 
                    registro[1].toLowerCase().includes(producto.toLowerCase());
                const cumpleLote = !lote || 
                    String(registro[2]).toLowerCase().includes(String(lote).toLowerCase());
                const cumpleNombre = !nombre || 
                    registro[8].toLowerCase().includes(nombre.toLowerCase());

                return cumpleFecha && cumpleProducto && cumpleLote && cumpleNombre;
            });

            console.log('Registros filtrados:', registrosFiltrados);
            mostrarResultadosBusqueda(registrosFiltrados);
        } else {
            mostrarNotificacion('Error al obtener registros', 'error');
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        mostrarNotificacion('Error al buscar registros', 'error');
    }
    finally{
        ocultarCarga();
    }
}
export function mostrarResultadosBusqueda(registros) {
    const container = document.querySelector('.resultados-container');
    container.innerHTML = '';

    if (!registros || registros.length === 0) {
        container.innerHTML = '<p class="no-resultados">No se encontraron registros</p>';
        return;
    }

    registros.forEach(registro => {
        const card = document.createElement('div');
        card.className = 'registro-card';
        card.innerHTML = `
            <div class="registro-header">
                <div class="registro-info">
                    ${registro[10] ? '<i class="fas fa-check-circle verificado-icon"></i>' : ''}
                    <span class="registro-producto">${registro[1]}</span>
                </div>
                <span class="registro-fecha">${registro[0]}</span>
            </div>
            <div class="registro-detalles">
                <p><span>Lote:</span> ${registro[2] || '-'}</p>
                <p><span>Gramaje:</span> ${registro[3] || '-'}</p>
                <p><span>Selección:</span> ${registro[4] || '-'}</p>
                <p><span>Microondas:</span> ${registro[5] || '-'}</p>
                <p><span>Envases:</span> ${registro[6] || '-'}</p>
                <p><span>Vencimiento:</span> ${registro[7] || '-'}</p>
                <p><span>Operario:</span> ${registro[8] || '-'}</p>
                ${registro[10] ? `
                    <p><span>Verificación:</span> ${registro[10]}</p>
                    <p><span>Cantidad Real:</span> ${registro[9] || '-'}</p>
                    <p><span>Observaciones:</span> ${registro[11] || '-'}</p>
                ` : ''}
            </div>
        `;

        // Añadir evento para expandir/colapsar detalles
        const header = card.querySelector('.registro-header');
        const detalles = card.querySelector('.registro-detalles');
        header.addEventListener('click', () => {
            detalles.classList.toggle('active');
        });

        container.appendChild(card);
    });
}
