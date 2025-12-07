// Módulo de modales
const ModalModule = {
    currentModal: null,
    
    // Crear modal para tomar herramienta
    showTakeToolModal(tool, onConfirm, currentOperationNumber, stations) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Tomar Herramienta</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-tools"></i> Herramienta seleccionada</label>
                    <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                        <strong>${tool.name}</strong><br>
                        <small>Serie: ${tool.numeroSerie} | Grupo: ${tool.grupo}</small>
                    </div>
                </div>
                <div class="form-group">
                    <label for="take-operation-number"><i class="fas fa-hashtag"></i> Número de Operación</label>
                    <input type="text" id="take-operation-number" placeholder="Ingrese el número de operación (opcional)" value="${currentOperationNumber}">
                </div>
                <div class="form-group">
                    <label for="take-station"><i class="fas fa-industry"></i> Estación de Trabajo</label>
                    <select id="take-station">
                        <option value="">Seleccione una estación</option>
                        ${stations.map(station => 
                            `<option value="${station.id}">${station.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline" id="cancel-take-tool">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn btn-primary" id="confirm-take-tool">
                        <i class="fas fa-check"></i> Confirmar Toma
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.querySelector('#cancel-take-tool').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        modal.querySelector('#confirm-take-tool').addEventListener('click', () => {
            const operationNumber = modal.querySelector('#take-operation-number').value || 'General';
            const station = modal.querySelector('#take-station').value;
            
            if (!station) {
                NotificationModule.showWarning('Seleccione una estación');
                return;
            }
            
            onConfirm(tool, operationNumber, station);
            this.close();
        });
        
        return modal;
    },
    
    // Crear modal para devolver herramienta
    showReturnToolModal(tool, onConfirm, getStationName) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Devolver Herramienta</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-tools"></i> Herramienta a devolver</label>
                    <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                        <strong>${tool.name}</strong><br>
                        <small>Serie: ${tool.numeroSerie} | Estación: ${getStationName(tool.station)}</small>
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Ubicación para devolución</label>
                    <div style="padding: 1rem; background: var(--success); color: white; border-radius: 8px; text-align: center;">
                        <i class="fas fa-arrow-down"></i><br>
                        <strong>${tool.location}</strong><br>
                        <small>Llevar la herramienta a esta ubicación</small>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline" id="cancel-return-tool">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn btn-success" id="confirm-return-tool">
                        <i class="fas fa-check"></i> Confirmar Devolución
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.querySelector('#cancel-return-tool').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        modal.querySelector('#confirm-return-tool').addEventListener('click', () => {
            onConfirm(tool);
            this.close();
        });
        
        return modal;
    },
    
    // Crear modal para unirse a la cola
    showJoinQueueModal(tool, onConfirm, currentOperationNumber, stations) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-users"></i> Unirse a la Cola</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="queue-modal-info">
                    Estás solicitando la herramienta: <strong>${tool.name}</strong> (Serie: ${tool.numeroSerie})
                </div>
                <div class="form-group">
                    <label for="queue-operation-number"><i class="fas fa-hashtag"></i> Número de Operación</label>
                    <input type="text" id="queue-operation-number" placeholder="Ingrese el número de operación (opcional)" value="${currentOperationNumber}">
                </div>
                <div class="form-group">
                    <label for="queue-station-modal"><i class="fas fa-industry"></i> Estación de Trabajo</label>
                    <select id="queue-station-modal">
                        <option value="">Seleccione su estación</option>
                        ${stations.map(station => 
                            `<option value="${station.id}">${station.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline" id="cancel-join-queue">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn btn-warning" id="confirm-join-queue">
                        <i class="fas fa-users"></i> Unirse a la Cola
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.querySelector('#cancel-join-queue').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        modal.querySelector('#confirm-join-queue').addEventListener('click', () => {
            const operationNumber = modal.querySelector('#queue-operation-number').value || 'General';
            const station = modal.querySelector('#queue-station-modal').value;
            
            if (!station) {
                NotificationModule.showWarning('Seleccione una estación');
                return;
            }
            
            onConfirm(tool, operationNumber, station);
            this.close();
        });
        
        return modal;
    },
    
    // Crear modal para tomar material
    showTakeMaterialModal(material, onConfirm, currentOperationNumber, stations) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Tomar Material</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-flask"></i> Material seleccionado</label>
                    <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                        <strong>${material.name}</strong><br>
                        <small>Código: ${material.code}</small>
                    </div>
                </div>
                <div class="form-group">
                    <label for="take-material-operation-number"><i class="fas fa-hashtag"></i> Número de Operación</label>
                    <input type="text" id="take-material-operation-number" placeholder="Ingrese el número de operación (opcional)" value="${currentOperationNumber}">
                </div>
                <div class="form-group">
                    <label for="take-material-station"><i class="fas fa-industry"></i> Estación de Trabajo</label>
                    <select id="take-material-station">
                        <option value="">Seleccione una estación</option>
                        ${stations.map(station => 
                            `<option value="${station.id}">${station.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline" id="cancel-take-material">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn btn-primary" id="confirm-take-material">
                        <i class="fas fa-check"></i> Confirmar Toma
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.querySelector('#cancel-take-material').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        modal.querySelector('#confirm-take-material').addEventListener('click', () => {
            const operationNumber = modal.querySelector('#take-material-operation-number').value || 'General';
            const station = modal.querySelector('#take-material-station').value;
            
            if (!station) {
                NotificationModule.showWarning('Seleccione una estación');
                return;
            }
            
            onConfirm(material, operationNumber, station);
            this.close();
        });
        
        return modal;
    },
    
    // Crear modal para devolver material
    showReturnMaterialModal(material, onConfirm, getStationName) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Devolver Material</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-flask"></i> Material a devolver</label>
                    <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                        <strong>${material.name}</strong><br>
                        <small>Código: ${material.code} | Estación: ${getStationName(material.station)}</small>
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Ubicación para devolución</label>
                    <div style="padding: 1rem; background: var(--success); color: white; border-radius: 8px; text-align: center;">
                        <i class="fas fa-arrow-down"></i><br>
                        <strong>${material.location}</strong><br>
                        <small>Llevar el material a esta ubicación</small>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline" id="cancel-return-material">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn btn-success" id="confirm-return-material">
                        <i class="fas fa-check"></i> Confirmar Devolución
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.querySelector('#cancel-return-material').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        modal.querySelector('#confirm-return-material').addEventListener('click', () => {
            onConfirm(material);
            this.close();
        });
        
        return modal;
    },
    
    // Crear modal para detalles de herramienta
    showToolDetailsModal(tool, history, tools, stations) {
        const toolHistory = history.filter(item => item.numeroSerie === tool.numeroSerie).slice(0, 3);
        const grupoTools = tools.filter(t => t.grupo === tool.grupo);
        const disponibles = grupoTools.filter(t => t.status === 'disponible').length;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="${tool.icon}"></i> Detalles de Herramienta</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <h4 style="color: var(--primary); margin-bottom: 1rem;">${tool.name}</h4>
                
                <div style="background: var(--gray-100); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>Grupo:</strong> ${tool.grupo}<br>
                        <strong>Ubicación:</strong> ${tool.location}<br>
                        <strong>Tipo:</strong> ${tool.isTorque ? 'Dinamométrica' : 'Manual'}
                    </div>
                    <div>
                        <strong>Estado:</strong> <span class="status-badge ${tool.status === 'disponible' ? 'status-available' : tool.status === 'en-uso' ? 'status-in-use' : 'status-maintenance'}">${tool.status}</span><br>
                        <strong>En grupo:</strong> ${disponibles}/${grupoTools.length} disp.
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h5 style="color: var(--primary); margin-bottom: 1rem;">Historial Reciente</h5>
                    ${toolHistory.length === 0 ? '<p style="color: var(--gray-500); text-align: center;">No hay historial registrado</p>' : 
                        toolHistory.map(item => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--gray-50); border-radius: 8px; margin-bottom: 0.5rem;">
                                <div>
                                    <strong>${item.operator}</strong><br>
                                    <small style="color: var(--gray-600);">${new Date(item.time).toLocaleString()}</small>
                                </div>
                                <span class="status-badge ${item.action === 'tomada' ? 'status-in-use' : 'status-available'}" style="font-size: 0.7rem;">
                                    ${item.action}
                                </span>
                            </div>
                        `).join('') 
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        return modal;
    },
    
    // Crear modal para detalles de material
    showMaterialDetailsModal(material, history) {
        const materialHistory = history.filter(item => item.numeroSerie === material.code && item.type === 'material').slice(0, 3);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-flask"></i> Detalles de Material</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <h4 style="color: var(--primary); margin-bottom: 1rem;">${material.name}</h4>
                
                <div style="background: var(--gray-100); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>Código:</strong> ${material.code}<br>
                        <strong>Ubicación:</strong> ${material.location}<br>
                    </div>
                    <div>
                        <strong>Cantidad actual:</strong> ${material.quantity} unidades<br>
                        <strong>Estado:</strong> <span class="status-badge ${material.quantity === 0 ? 'status-maintenance' : material.status === 'en-uso' ? 'status-in-use' : 'status-available'}">
                            ${material.quantity === 0 ? 'Agotado' : material.status === 'en-uso' ? 'En Uso' : 'Disponible'}
                        </span>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h5 style="color: var(--primary); margin-bottom: 1rem;">Historial Reciente</h5>
                    ${materialHistory.length === 0 ? '<p style="color: var(--gray-500); text-align: center;">No hay historial registrado</p>' : 
                        materialHistory.map(item => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--gray-50); border-radius: 8px; margin-bottom: 0.5rem;">
                                <div>
                                    <strong>${item.operator}</strong><br>
                                    <small style="color: var(--gray-600);">${new Date(item.time).toLocaleString()}</small>
                                </div>
                                <span class="status-badge ${item.action === 'tomada' ? 'status-in-use' : 'status-available'}" style="font-size: 0.7rem;">
                                    ${item.action}
                                </span>
                            </div>
                        `).join('') 
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        return modal;
    },
    
    // Cerrar modal actual
    close() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }
};