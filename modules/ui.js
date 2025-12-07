// Módulo de interfaz de usuario
const UIModule = {
    // Mostrar/ocultar páginas
    showPage(pageId) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const pageElement = document.getElementById(pageId);
        if (pageElement) {
            pageElement.classList.add('active');
        }
    },
    
    // Activar elemento de navegación
    activateNavItem(pageId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            }
        });
        
        document.querySelectorAll('.nav-item-mobile').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            }
        });
    },
    
    // Crear modal básico
    createModal(title, content, buttons) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        let buttonsHTML = '';
        if (buttons && buttons.length > 0) {
            buttonsHTML = buttons.map(btn => 
                `<button class="btn ${btn.class || ''}" onclick="${btn.onclick}">
                    ${btn.icon ? `<i class="${btn.icon}"></i>` : ''} ${btn.text}
                </button>`
            ).join('');
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttonsHTML ? `<div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    ${buttonsHTML}
                </div>` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic en X o fuera
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        return modal;
    },
    
    // Crear tarjeta de herramienta
    createToolCard(tool, options = {}) {
        const {
            isUserTool = false,
            currentUserName = '',
            colaEspera = [],
            getStationName = () => '',
            onTake = () => {},
            onReturn = () => {},
            onJoinQueue = () => {},
            onCancelQueue = () => {},
            onViewDetails = () => {}
        } = options;
        
        let cardClass = 'tool-card';
        let iconClass = '';
        let statusClass = '';
        let statusText = '';
        
        if (isUserTool) {
            cardClass += ' en-uso-user';
            iconClass = 'tool-icon-en-uso';
            statusClass = 'status-en-uso-tool';
            statusText = 'En Uso (TÚ)';
        } else if (tool.status === 'en-uso') {
            cardClass += ' en-uso-otros';
            iconClass = 'tool-icon-en-uso';
            statusClass = 'status-en-uso-tool';
            statusText = 'En Uso';
        } else if (tool.status === 'disponible') {
            cardClass += ' disponible';
            iconClass = 'tool-icon-disponible';
            statusClass = 'status-disponible-tool';
            statusText = 'Disponible';
        } else if (tool.status === 'mantenimiento') {
            cardClass += ' mantenimiento';
            iconClass = 'tool-icon-mantenimiento';
            statusClass = 'status-mantenimiento-tool';
            statusText = 'Mantenimiento';
        }
        
        const toolType = tool.isTorque ? 'Dinamométrica' : 'Manual';
        const typeClass = tool.isTorque ? 'type-dinamometrica' : 'type-manual';
        
        let actionButtons = '';
        if (tool.status === 'disponible') {
            actionButtons = `
                <button class="btn-tool-action btn-tool-primary" onclick="${onTake}(event)">
                    <i class="fas fa-hand-paper"></i> Tomar
                </button>
                <button class="btn-tool-action btn-tool-outline" onclick="${onViewDetails}(event)">
                    <i class="fas fa-eye"></i> Ver
                </button>
            `;
        } else if (isUserTool) {
            actionButtons = `
                <button class="btn-tool-action btn-tool-success" onclick="${onReturn}(event)">
                    <i class="fas fa-reply"></i> Devolver
                </button>
                <button class="btn-tool-action btn-tool-outline" onclick="${onViewDetails}(event)">
                    <i class="fas fa-eye"></i> Ver
                </button>
            `;
        } else if (tool.status === 'en-uso') {
            const userInQueue = colaEspera.some(item => item.toolId === tool.id && item.operator === currentUserName);
            if (!userInQueue) {
                actionButtons = `
                    <button class="btn-tool-action btn-tool-warning" onclick="${onJoinQueue}(event)">
                        <i class="fas fa-users"></i> Reservar
                    </button>
                    <button class="btn-tool-action btn-tool-outline" onclick="${onViewDetails}(event)">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                `;
            } else {
                actionButtons = `
                    <button class="btn-tool-action btn-tool-danger" onclick="${onCancelQueue}(event)">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-tool-action btn-tool-outline" onclick="${onViewDetails}(event)">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                `;
            }
        } else if (tool.status === 'mantenimiento') {
            actionButtons = `
                <button class="btn-tool-action btn-tool-outline" onclick="${onViewDetails}(event)">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
            `;
        }
        
        let operatorInfo = '';
        if (tool.status === 'en-uso' && tool.operator) {
            operatorInfo = `
                <div class="tool-info-item operator">
                    <i class="fas fa-user"></i>
                    <div>
                        <div style="font-weight: 600;">
                            ${tool.operator} 
                            ${isUserTool ? '<span class="tool-user-indicator"><i class="fas fa-user"></i> TÚ</span>' : ''}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--gray-600);">
                            ${getStationName(tool.station)}
                        </div>
                    </div>
                </div>
            `;
        }
        
        const cardHTML = `
            <div class="tool-card-header">
                <div class="tool-icon-large ${iconClass}">
                    <i class="${tool.icon}"></i>
                </div>
                <div class="tool-title">
                    <div class="tool-name">${tool.name}</div>
                    <div class="tool-serial">Serie: ${tool.numeroSerie || 'N/A'}</div>
                    <div class="tool-type ${typeClass}">
                        <i class="${tool.isTorque ? 'fas fa-tachometer-alt' : 'fas fa-wrench'}"></i>
                        ${toolType}
                    </div>
                </div>
                <div class="tool-status-badge ${statusClass}">
                    <i class="fas fa-circle" style="font-size: 0.6rem;"></i>
                    ${statusText}
                </div>
            </div>
            
            <div class="tool-card-body">
                ${operatorInfo}
                
                <div class="tool-info-item location">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <div style="font-weight: 600;">Ubicación</div>
                        <div style="font-size: 0.9rem;">${tool.location}</div>
                    </div>
                </div>
                
                <div class="tool-info-item group">
                    <i class="fas fa-layer-group"></i>
                    <div>
                        <div style="font-weight: 600;">Grupo</div>
                        <div style="font-size: 0.9rem;">${tool.grupo || 'General'}</div>
                    </div>
                </div>
                
                ${tool.status === 'en-uso' && colaEspera.filter(item => item.toolId === tool.id).length > 0 ? `
                    <div class="tool-info-item" style="background: rgba(0, 180, 216, 0.1); border-left: 3px solid var(--accent);">
                        <i class="fas fa-users"></i>
                        <div>
                            <div style="font-weight: 600;">En cola</div>
                            <div style="font-size: 0.9rem;">
                                ${colaEspera.filter(item => item.toolId === tool.id).length} operario(s) esperando
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="tool-card-footer">
                <div class="tool-actions">
                    ${actionButtons}
                </div>
                <div style="font-size: 0.75rem; color: var(--gray-500);">
                    <i class="fas fa-info-circle"></i> ID: ${tool.id}
                </div>
            </div>
        `;
        
        return { cardClass, cardHTML };
    }
};