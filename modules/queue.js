// Módulo de cola de espera
const QueueModule = {
    // Filtrar cola de espera por herramientas en uso o mantenimiento
    filterQueue(colaEspera, tools) {
        const toolsInUseOrMaint = tools.filter(t => t.status !== 'disponible').map(t => t.id);
        return colaEspera.filter(item => toolsInUseOrMaint.includes(item.toolId));
    },
    
    // Agrupar cola de espera por herramienta
    groupQueueByTool(colaEsperaFiltrada, tools) {
        return colaEsperaFiltrada.reduce((acc, item) => {
            const tool = tools.find(t => t.id === item.toolId);
            const key = tool ? tool.name : 'Herramienta Desconocida';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
    },
    
    // Verificar si usuario está en cola para una herramienta
    isUserInQueue(colaEspera, toolId, userName) {
        return colaEspera.some(item => 
            item.toolId === toolId && item.operator === userName
        );
    },
    
    // Cancelar reserva en cola
    async cancelQueueReservation(colaEspera, toolId, toolName, userName, db) {
        const index = colaEspera.findIndex(item => 
            item.toolId === toolId && item.operator === userName
        );
        
        if (index !== -1) {
            colaEspera.splice(index, 1);
            
            // Guardar en Firebase si está disponible
            if (db) {
                try {
                    await db.collection('TraxxData').doc('colaEspera')
                        .collection('items').doc(`queue_${toolId}_${userName}`).delete();
                } catch (error) {
                    console.error('Error eliminando reserva:', error);
                }
            }
            
            return true;
        }
        return false;
    },
    
    // Renderizar cola de espera
    renderWaitingQueue(colaEsperaFiltrada, tools, currentUserName, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (colaEsperaFiltrada.length === 0) {
            container.innerHTML = `
                <div class="queue-info-message">
                    <i class="fas fa-check"></i> No hay operarios en espera por herramientas en uso.
                </div>
            `;
            return;
        }
        
        const colaAgrupada = this.groupQueueByTool(colaEsperaFiltrada, tools);
        
        container.innerHTML = '';
        
        Object.keys(colaAgrupada).forEach(toolName => {
            const groupHeader = document.createElement('h5');
            groupHeader.className = 'queue-group-header';
            groupHeader.innerHTML = `<i class="fas fa-tools"></i> ${toolName}`;
            container.appendChild(groupHeader);
            
            colaAgrupada[toolName].forEach((item, index) => {
                const queueItem = document.createElement('div');
                queueItem.className = 'queue-item';
                
                const isFirstInLine = index === 0;
                const isCurrentUser = item.operator === currentUserName;
                
                if (isFirstInLine) {
                    queueItem.classList.add('first-in-line');
                }
                if (isCurrentUser) {
                    queueItem.classList.add('current-user');
                }
                
                const positionHTML = isFirstInLine 
                    ? `<span class="queue-position first">${index + 1}</span>`
                    : `<span class="queue-position">${index + 1}</span>`;
                
                const queueInfo = document.createElement('div');
                queueInfo.className = 'queue-info';
                let indicators = '';
                if (isFirstInLine) {
                    indicators += `<span class="first-in-line-indicator"><i class="fas fa-crown"></i> PRÓXIMO</span>`;
                }
                if (isCurrentUser) {
                    indicators += `<span class="current-user-indicator"><i class="fas fa-user"></i> TÚ</span>`;
                }
                
                queueInfo.innerHTML = `
                    ${positionHTML}
                    <div style="margin-left: 20px;">
                        <strong>${item.operator}</strong>${indicators}<br>
                        <small>Operación: ${item.operationNumber} - ${item.station}</small>
                    </div>
                `;
                
                const queueActions = document.createElement('div');
                queueActions.className = 'queue-actions';
                
                if (isCurrentUser) {
                    queueActions.innerHTML = `
                        <button class="btn-cancel-queue" onclick="window.tallerSystem.cancelQueueReservation('${item.toolId}', '${item.toolName}')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `;
                }
                
                queueItem.appendChild(queueInfo);
                queueItem.appendChild(queueActions);
                container.appendChild(queueItem);
            });
        });
    },
    
    // Renderizar herramientas en uso actualmente
    renderCurrentUsage(tools, colaEspera, containerId, getStationNameFn) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const herramientasEnUso = tools.filter(tool => tool.status === 'en-uso');
        
        if (herramientasEnUso.length === 0) {
            container.innerHTML = `
                <div class="current-usage-item">
                    <div>No hay herramientas en uso</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        herramientasEnUso.forEach(tool => {
            const nextInQueue = colaEspera.find(item => item.toolId === tool.id);
            let nextInQueueHTML = '';
            if (nextInQueue) {
                nextInQueueHTML = `
                    <span style="font-size: 0.8rem; color: var(--success);">
                        Próximo: <strong>${nextInQueue.operator}</strong>
                    </span>
                `;
            }
            
            const usageItem = document.createElement('div');
            usageItem.className = 'current-usage-item';
            
            usageItem.innerHTML = `
                <div>
                    <strong>${tool.name}</strong> (${tool.numeroSerie})<br>
                    <small>En uso por: ${tool.operator} - ${getStationNameFn(tool.station)}</small>
                </div>
                <div style="text-align: right; margin-top: 5px;">
                    ${nextInQueueHTML}
                </div>
            `;
            container.appendChild(usageItem);
        });
    }
};