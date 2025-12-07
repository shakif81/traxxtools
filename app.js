class TallerSystem {
    constructor() {
        this.db = null;
        this.unsubscribe = null;
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        this.userName = 'Operario General';
        this.userRole = 'Operario';
        this.isLoggedIn = true;
        this.userIsAdmin = false;
        
        this.operationNumber = localStorage.getItem('taller_operation_number') || '';
        this.selectedTool = null;
        
        // Datos
        this.tools = [];
        this.stations = [];
        this.history = [];
        this.colaEspera = [];
        this.materials = [];
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🔧 Iniciando sistema...');
            
            // Inicializar Firebase
            initializeFirebase();
            this.db = getFirestore();
            
            await this.createInitialData();
            
            // Configurar listeners y UI
            this.updateUserProfile();
            this.setupRealtimeListener();
            
            this.setupEventListeners();
            this.setupOrientationChange();
            
            this.setupMobileNavigation();
            this.setupNavigation();
            this.setupMobileScroll();
            
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión con Firebase', 'error');
            this.loadDefaultData();
        }
    }
    
    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            const sidebar = document.querySelector('.sidebar');
            const sidebarOverlay = document.getElementById('sidebar-overlay');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (sidebar && sidebarOverlay && menuToggle) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
                menuToggle.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            }
            
            setTimeout(() => {
                this.renderAll();
            }, 300);
        });
    }
    
    setupEventListeners() {
        document.getElementById('herramientas-search-tool').addEventListener('input', (e) => {
            clearTimeout(this.searchToolsTimeout);
            this.searchToolsTimeout = setTimeout(() => {
                this.renderToolsInHerramientasSection();
            }, 300);
        });
        
        document.getElementById('materiales-search').addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.renderMaterials(), 300);
        });
        
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        if (menuToggle && sidebar && sidebarOverlay) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                sidebarOverlay.classList.toggle('active');
                menuToggle.classList.toggle('open');
                
                const icon = menuToggle.querySelector('i');
                if (sidebar.classList.contains('open')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            });
            
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
                menuToggle.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            });
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth <= 1180) {
                        sidebar.classList.remove('open');
                        sidebarOverlay.classList.remove('active');
                        menuToggle.classList.remove('open');
                        menuToggle.querySelector('i').className = 'fas fa-bars';
                    }
                });
            });
        }
    }
    
    setupMobileNavigation() {
        const navItems = document.querySelectorAll('.nav-item-mobile');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                const page = item.getAttribute('data-page');
                this.showPage(page);
                
                if (window.innerWidth <= 768) {
                    window.scrollTo(0, 0);
                }
            });
        });
    }
    
    showPage(page) {
        if (window.innerWidth <= 768) {
            this.updateMobileNav(page);
        }
        
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');
        
        if (page === 'herramientas') {
            this.renderToolsInHerramientasSection();
            this.updateHerramientasStats();
        } else if (page === 'materiales') {
            this.renderMaterials();
        } else if (page === 'en-espera') {
            this.renderWaitingQueue();
            this.renderCurrentUsageInOperarios();
        }
    }
    
    updateMobileNav(page) {
        const navItems = document.querySelectorAll('.nav-item-mobile');
        navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-page') === page) {
                nav.classList.add('active');
            }
        });
    }
    
    setupMobileScroll() {
        document.addEventListener('touchmove', function(e) {
            const allowScrollSelectors = [
                '.main-content',
                '.history-table-container',
                '.table-container',
                '.sidebar',
                '.modal-content',
                '.modal-body',
                '.resources-container',
                '.operaciones-table-container',
                '.tools-table',
                '.history-table'
            ];
            const isScrollableElement = allowScrollSelectors.some(selector => 
                e.target.closest(selector) || e.target.matches(selector)
            );
            
            if (!isScrollableElement) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchstart', function() {}, { passive: true });
        
        if ('scrollBehavior' in document.documentElement.style) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                const page = item.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }
    
    updateUserProfile() {
        const userAvatar = document.getElementById('user-avatar');
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');
        
        userAvatar.textContent = "OP";
        userNameElement.textContent = "Operario General";
        userRoleElement.textContent = "Taller TRAXX";
    }
    
    renderAll() {
        this.renderStations();
        this.renderHistoryTable();
        this.updateStats();
        this.renderWaitingQueue();
        this.renderToolsInHerramientasSection();
        this.renderCurrentUsageInOperarios();
        this.renderMaterials();
    }
    
    getStationName(stationId) {
        const station = this.stations.find(s => s.id === stationId);
        return station ? station.name : 'Desconocida';
    }
    
    updateLastSyncTime() {
        const now = new Date().toLocaleTimeString();
        document.getElementById('update-time').textContent = now;
        document.getElementById('sidebar-update-time').textContent = now;
        document.getElementById('herramientas-update').textContent = now;
        document.getElementById('en-espera-update').textContent = now;
        document.getElementById('materiales-update').textContent = now;
    }
}

// Añadir estos métodos a la clase TallerSystem en app.js

async setupRealtimeListener() {
    try {
        console.log('🔍 Configurando listeners en tiempo real...');

        // Escuchar cambios en herramientas
        this.unsubscribeTools = this.db.collection('TraxxData').doc('tools')
            .collection('items').onSnapshot(snapshot => {
                if (snapshot.empty) {
                    console.log('📦 No hay herramientas, cargando datos por defecto...');
                    ToolsModule.loadDefaultTools(this.db);
                    return;
                }
                
                this.tools = [];
                snapshot.forEach(doc => {
                    this.tools.push({ id: doc.id, ...doc.data() });
                });
                console.log(`🛠️ Herramientas cargadas: ${this.tools.length}`);
                this.renderAll();
                this.updateLastSyncTime();
            }, err => {
                console.error('Error en listener de herramientas:', err);
                this.tools = ToolsModule.getDefaultTools();
                this.renderAll();
            });

        // Escuchar cambios en estaciones
        this.unsubscribeStations = this.db.collection('TraxxData').doc('stations')
            .collection('items').onSnapshot(snapshot => {
                if (snapshot.empty) {
                    console.log('🏭 No hay estaciones, cargando datos por defecto...');
                    StationsModule.loadDefaultStations(this.db);
                    return;
                }
                
                this.stations = [];
                snapshot.forEach(doc => {
                    this.stations.push({ id: doc.id, ...doc.data() });
                });
                console.log(`🏭 Estaciones cargadas: ${this.stations.length}`);
                this.renderAll();
            }, err => {
                console.error('Error en listener de estaciones:', err);
                this.stations = StationsModule.getDefaultStations();
                this.renderAll();
            });

        // Escuchar cambios en materiales
        this.unsubscribeMaterials = this.db.collection('TraxxData').doc('materials')
            .collection('items').onSnapshot(snapshot => {
                console.log('📦 Snapshot de materiales recibido:', snapshot.size, 'documentos');
                
                if (snapshot.empty) {
                    console.log('🧪 No hay materiales en Firebase, cargando datos por defecto...');
                    MaterialsModule.loadDefaultMaterials(this.db);
                    return;
                }
                
                this.materials = [];
                snapshot.forEach(doc => {
                    const materialData = doc.data();
                    console.log('📄 Material cargado:', materialData);
                    this.materials.push({ 
                        id: doc.id, 
                        ...materialData,
                        status: materialData.status || 'disponible',
                        operator: materialData.operator || '',
                        station: materialData.station || '',
                        location: materialData.location || 'Sin ubicación',
                        quantity: materialData.quantity || 1
                    });
                });
                
                console.log(`🧪 Materiales cargados: ${this.materials.length}`);
                this.renderMaterials();
                this.updateLastSyncTime();
            }, err => {
                console.error('❌ Error en listener de materiales:', err);
                this.materials = MaterialsModule.getDefaultMaterials();
                this.renderAll();
            });

        // Escuchar cambios en historial
        this.unsubscribeHistory = this.db.collection('TraxxData').doc('history')
            .collection('items').onSnapshot(snapshot => {
                this.history = [];
                snapshot.forEach(doc => {
                    this.history.push({ id: doc.id, ...doc.data() });
                });
                console.log(`📜 Historial cargado: ${this.history.length} registros`);
                this.renderAll();
            });

        // Escuchar cambios en cola de espera
        this.unsubscribeColaEspera = this.db.collection('TraxxData').doc('colaEspera')
            .collection('items').onSnapshot(snapshot => {
                this.colaEspera = [];
                snapshot.forEach(doc => {
                    this.colaEspera.push({ id: doc.id, ...doc.data() });
                });
                console.log(`👥 Cola de espera: ${this.colaEspera.length}`);
                this.renderAll();
            });

    } catch (err) {
        console.error('Error en listener general:', err);
        NotificationModule.show('Error de conexión en tiempo real', 'error');
        this.loadAllDefaultData();
    }
}

async createInitialData() {
    try {
        console.log('🚀 Verificando e inicializando datos en Firebase...');
        
        const traxxDataRef = this.db.collection('TraxxData');
        const traxxDataSnapshot = await traxxDataRef.limit(1).get();
        
        if (traxxDataSnapshot.empty) {
            console.log('📦 La base de datos está vacía, creando estructura...');
            
            const collections = ['tools', 'stations', 'materials', 'history', 'colaEspera'];
            for (const collection of collections) {
                const docRef = this.db.collection('TraxxData').doc(collection);
                await docRef.set({ 
                    created: new Date().toISOString(),
                    system: 'TRAXX Tools',
                    version: '1.0'
                });
                console.log(`✅ Documento ${collection} creado`);
            }
            
            await this.loadAllDefaultData();
            
            NotificationModule.show('Base de datos inicializada con datos por defecto', 'success');
        } else {
            console.log('✅ La base de datos ya existe');
        }
    } catch (error) {
        console.error('Error inicializando datos:', error);
        NotificationModule.show('Error al inicializar datos', 'error');
    }
}

async loadAllDefaultData() {
    console.log('🚀 Cargando todos los datos por defecto...');
    await ToolsModule.loadDefaultTools(this.db);
    await StationsModule.loadDefaultStations(this.db);
    await MaterialsModule.loadDefaultMaterials(this.db);
    console.log('🎉 Todos los datos por defecto cargados');
}

async saveData() {
    try {
        console.log('💾 Guardando datos en Firebase...');
        
        // Guardar herramientas
        for (const tool of this.tools) {
            await this.db.collection('TraxxData').doc('tools')
                .collection('items').doc(tool.id).set(tool);
        }
        
        // Guardar materiales
        for (const material of this.materials) {
            await this.db.collection('TraxxData').doc('materials')
                .collection('items').doc(material.id).set(material);
        }
        
        // Guardar historial (solo los últimos 100 registros para optimizar)
        const recentHistory = this.history.slice(0, 100);
        for (const record of recentHistory) {
            const id = record.id || Helpers.generateId('hist_');
            await this.db.collection('TraxxData').doc('history')
                .collection('items').doc(id).set(record);
        }
        
        console.log('✅ Todos los datos guardados correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error guardando datos:', error);
        NotificationModule.show('Error al guardar datos', 'error');
        return false;
    }
}

// Métodos de renderizado que faltaban
renderToolsInHerramientasSection() {
    this.updateHerramientasStats();
    
    const cardsContainer = document.getElementById('tools-cards-container');
    if (!cardsContainer) return;

    const searchTerm = document.getElementById('herramientas-search-tool').value.toLowerCase();
    let filteredTools = this.tools;

    if (searchTerm) {
        filteredTools = filteredTools.filter(tool => 
            tool.name.toLowerCase().includes(searchTerm) || 
            (tool.numeroSerie && tool.numeroSerie.toLowerCase().includes(searchTerm))
        );
    }

    // ORDENAR: Primero herramientas en uso por el usuario actual
    filteredTools.sort((a, b) => {
        const aIsUserTool = a.operator === this.userName && a.status === 'en-uso';
        const bIsUserTool = b.operator === this.userName && b.status === 'en-uso';
        
        if (aIsUserTool && !bIsUserTool) return -1;
        if (!aIsUserTool && bIsUserTool) return 1;
        
        const aInUse = a.status === 'en-uso';
        const bInUse = b.status === 'en-uso';
        if (aInUse && !bInUse) return -1;
        if (!aInUse && bInUse) return 1;
        
        const aAvailable = a.status === 'disponible';
        const bAvailable = b.status === 'disponible';
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        return a.name.localeCompare(b.name);
    });

    if (filteredTools.length === 0) {
        cardsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-500);">
                <i class="fas fa-tools fa-3x" style="margin-bottom: 1rem;"></i>
                <p>No se encontraron herramientas.</p>
                <p class="small">Intenta con otros términos de búsqueda.</p>
            </div>
        `;
        return;
    }

    cardsContainer.innerHTML = '';
    
    // Usar UIModule para crear tarjetas
    filteredTools.forEach(tool => {
        const isUserTool = tool.operator === this.userName && tool.status === 'en-uso';
        const { cardClass, cardHTML } = UIModule.createToolCard(tool, {
            isUserTool,
            currentUserName: this.userName,
            colaEspera: this.colaEspera,
            getStationName: (stationId) => this.getStationName(stationId),
            onTake: `window.tallerSystem.showTakeToolModal('${tool.id}')`,
            onReturn: `window.tallerSystem.showReturnToolModal('${tool.id}')`,
            onJoinQueue: `window.tallerSystem.showJoinQueueModal('${tool.id}')`,
            onCancelQueue: `window.tallerSystem.cancelQueueReservation('${tool.id}', '${tool.name}')`,
            onViewDetails: `window.tallerSystem.showToolDetailsModal('${tool.id}')`
        });
        
        const card = document.createElement('div');
        card.className = cardClass;
        card.innerHTML = cardHTML;
        cardsContainer.appendChild(card);
    });
}

renderMaterials() {
    const cardsContainer = document.getElementById('materials-cards-container');
    if (!cardsContainer) return;

    const searchTerm = document.getElementById('materiales-search').value.toLowerCase();
    let filteredMaterials = MaterialsModule.filterMaterials(this.materials, searchTerm);
    filteredMaterials = MaterialsModule.sortMaterials(filteredMaterials, this.userName);

    if (filteredMaterials.length === 0) {
        cardsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-500);">
                <i class="fas fa-inbox fa-3x" style="margin-bottom: 1rem;"></i>
                <p>No se encontraron materiales.</p>
                <p class="small">Intenta con otros términos de búsqueda.</p>
            </div>
        `;
        return;
    }

    cardsContainer.innerHTML = '';
    
    const groupedMaterials = MaterialsModule.groupMaterials(filteredMaterials, this.userName);
    
    // Renderizar en orden con encabezados
    const sections = [
        { key: 'usuario', title: `En uso por: ${this.userName} (TÚ)`, icon: 'fas fa-user-check' },
        { key: 'otros', title: 'En uso por otros operarios', icon: 'fas fa-users' },
        { key: 'disponibles', title: 'Materiales Disponibles', icon: 'fas fa-check-circle' }
    ];
    
    sections.forEach(section => {
        const materialsInSection = groupedMaterials[section.key];
        if (materialsInSection.length === 0) return;
        
        // Agregar encabezado de sección
        const header = document.createElement('div');
        header.className = 'section-header-card';
        header.style.cssText = `
            grid-column: 1 / -1;
            margin: 1rem 0 0.5rem 0;
            padding: 1rem 0;
            border-bottom: 2px solid var(--gray-300);
            color: var(--primary);
            font-weight: 600;
            font-size: 1.1rem;
        `;
        header.innerHTML = `<i class="${section.icon}"></i> ${section.title}`;
        cardsContainer.appendChild(header);
        
        // Agrupar por operador si es la sección "otros"
        if (section.key === 'otros') {
            const materialesPorOperador = {};
            materialsInSection.forEach(material => {
                if (!materialesPorOperador[material.operator]) {
                    materialesPorOperador[material.operator] = [];
                }
                materialesPorOperador[material.operator].push(material);
            });
            
            Object.keys(materialesPorOperador).forEach(operador => {
                // Sub-encabezado para cada operador
                const subHeader = document.createElement('div');
                subHeader.className = 'section-header-card';
                subHeader.style.cssText = `
                    grid-column: 1 / -1;
                    margin: 0.5rem 0 0.25rem 1rem;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--gray-300);
                    color: var(--gray-700);
                    font-weight: 600;
                    font-size: 1rem;
                `;
                subHeader.innerHTML = `<i class="fas fa-user"></i> ${operador}`;
                cardsContainer.appendChild(subHeader);
                
                // Tarjetas de este operador
                materialesPorOperador[operador].forEach(material => {
                    cardsContainer.appendChild(this.createMaterialCard(material));
                });
            });
        } else {
            // Para las otras secciones, simplemente renderizar las tarjetas
            materialsInSection.forEach(material => {
                cardsContainer.appendChild(this.createMaterialCard(material));
            });
        }
    });
}

// Métodos para crear tarjetas de materiales (simplificados)
createMaterialCard(material) {
    const isUserMaterial = material.operator === this.userName && material.status === 'en-uso';
    const card = document.createElement('div');
    
    let cardClass = 'material-card';
    if (isUserMaterial) {
        cardClass += ' en-uso-user';
    } else if (material.status === 'en-uso') {
        cardClass += ' en-uso-otros';
    } else if (material.status === 'disponible') {
        cardClass += ' disponible';
    }
    
    let statusClass = 'status-disponible';
    let statusText = 'Disponible';
    if (material.status === 'en-uso') {
        statusClass = 'status-en-uso';
        statusText = 'En Uso';
    }
    
    let actionButtons = '';
    if (material.status === 'disponible') {
        actionButtons = `
            <button class="btn-material-action btn-material-primary" onclick="window.tallerSystem.showTakeMaterialModal('${material.id}')">
                <i class="fas fa-hand-paper"></i> Tomar
            </button>
            <button class="btn-material-action btn-material-outline" onclick="window.tallerSystem.showMaterialDetailsModal('${material.id}')">
                <i class="fas fa-eye"></i> Ver
            </button>
        `;
    } else if (isUserMaterial) {
        actionButtons = `
            <button class="btn-material-action btn-material-success" onclick="window.tallerSystem.showReturnMaterialModal('${material.id}')">
                <i class="fas fa-reply"></i> Devolver
            </button>
            <button class="btn-material-action btn-material-outline" onclick="window.tallerSystem.showMaterialDetailsModal('${material.id}')">
                <i class="fas fa-eye"></i> Ver
            </button>
        `;
    } else if (material.status === 'en-uso') {
        actionButtons = `
            <button class="btn-material-action btn-material-outline" onclick="window.tallerSystem.showMaterialDetailsModal('${material.id}')">
                <i class="fas fa-eye"></i> Ver Detalles
            </button>
        `;
    }
    
    let operatorInfo = '';
    if (material.status === 'en-uso' && material.operator) {
        operatorInfo = `
            <div class="material-info-item">
                <i class="fas fa-user"></i>
                <div>
                    <div style="font-weight: 600;">
                        ${material.operator} 
                        ${isUserMaterial ? '<span class="user-indicator"><i class="fas fa-user"></i> TÚ</span>' : ''}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">
                        ${this.getStationName(material.station)}
                    </div>
                </div>
            </div>
        `;
    }
    
    card.className = cardClass;
    card.innerHTML = `
        <div class="material-card-header">
            <div class="material-icon">
                <i class="fas fa-flask"></i>
            </div>
            <div class="material-title">
                <div class="material-name">${material.name}</div>
                <div class="material-code">Código: ${material.code}</div>
            </div>
            <div class="material-status ${statusClass}">
                <i class="fas fa-circle" style="font-size: 0.6rem;"></i>
                ${statusText}
            </div>
        </div>
        
        <div class="material-card-body">
            ${operatorInfo}
            
            <div class="material-info-item material-location">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                    <div style="font-weight: 600;">Ubicación</div>
                    <div style="font-size: 0.9rem;">${material.location}</div>
                </div>
            </div>
            
            <div class="material-info-item">
                <i class="fas fa-box"></i>
                <div>
                    <div style="font-weight: 600;">Cantidad</div>
                    <div style="font-size: 0.9rem;">${material.quantity || 1} unidad(es)</div>
                </div>
            </div>
        </div>
        
        <div class="material-card-footer">
            <div class="material-actions">
                ${actionButtons}
            </div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">
                <i class="fas fa-info-circle"></i> ID: ${material.id}
            </div>
        </div>
    `;
    
    return card;
}

// Métodos adicionales que faltaban
updateHerramientasStats() {
    const stats = ToolsModule.updateHerramientasStats(this.tools, this.colaEspera);
    ToolsModule.updateHerramientasStatsDOM(stats);
}

updateStats() {
    const stats = ToolsModule.updateHerramientasStats(this.tools, this.colaEspera);
    
    document.getElementById('disponible-count').textContent = stats.disponible;
    document.getElementById('en-uso-count').textContent = stats.enUso;
    document.getElementById('mantenimiento-count').textContent = stats.mantenimiento;
    document.getElementById('en-cola-count').textContent = stats.enCola;

    document.getElementById('sidebar-update-time').textContent = new Date().toLocaleTimeString();
}

renderStations() {
    StationsModule.renderStations(this.stations, this.tools, 'stations');
}

renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    if (this.history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--gray-500);">No hay historial</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    this.history.slice(0, 50).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.operator}</strong></td>
            <td>${Helpers.formatDate(item.time)}</td>
            <td>${item.tool}</td>
            <td>${item.numeroSerie || '-'}</td>
            <td>${item.operationNumber || '-'}</td>
            <td>
                <span class="status-badge ${item.action === 'tomada' ? 'status-in-use' : 'status-available'}">
                    ${item.action}
                </span>
            </td>
            <td>${item.station}</td>
        `;
        tbody.appendChild(row);
    });
}

renderWaitingQueue() {
    const colaFiltrada = QueueModule.filterQueue(this.colaEspera, this.tools);
    QueueModule.renderWaitingQueue(
        colaFiltrada, 
        this.tools, 
        this.userName, 
        'waiting-list'
    );
}

renderCurrentUsageInOperarios() {
    QueueModule.renderCurrentUsage(
        this.tools, 
        this.colaEspera, 
        'operarios-current-usage',
        (stationId) => this.getStationName(stationId)
    );
}