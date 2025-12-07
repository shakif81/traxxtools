// Módulo de estaciones
const StationsModule = {
    // Datos por defecto de estaciones
    getDefaultStations() {
        return [
            { id: "estacion-0", name: "Estación 0" },
            { id: "estacion-1", name: "Estación 1" },
            { id: "estacion-2", name: "Estación 2" },
            { id: "estacion-3", name: "Estación 3" },
            { id: "estacion-4", name: "Estación 4" },
            { id: "estacion-5", name: "Estación 5" }
        ];
    },
    
    // Cargar estaciones por defecto en Firebase
    async loadDefaultStations(db) {
        console.log('🏭 Cargando estaciones por defecto...');
        const defaultStations = this.getDefaultStations();
        
        for (const station of defaultStations) {
            try {
                await db.collection('TraxxData').doc('stations')
                    .collection('items').doc(station.id).set(station);
            } catch (error) {
                console.error(`Error cargando estación ${station.id}:`, error);
            }
        }
        console.log('✅ Estaciones por defecto cargadas');
    },
    
    // Obtener nombre de estación por ID
    getStationName(stations, stationId) {
        const station = stations.find(s => s.id === stationId);
        return station ? station.name : 'Desconocida';
    },
    
    // Obtener herramientas en una estación
    getToolsInStation(tools, stationId) {
        return tools.filter(tool => 
            tool.status === 'en-uso' && tool.station === stationId
        );
    },
    
    // Renderizar estaciones
    renderStations(stations, tools, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        stations.forEach((station, index) => {
            const toolsInStation = this.getToolsInStation(tools, station.id);
            
            const stationCard = document.createElement('div');
            stationCard.className = `station-card estacion-${index}`;
            
            let toolsListHTML = toolsInStation.length > 0 ? 
                toolsInStation.map(tool => `
                    <div class="herramienta-in-station">
                        <i class="${tool.icon}"></i> 
                        <span>${tool.name}</span>
                    </div>
                `).join('') :
                '<p style="color: var(--gray-500); font-size: 0.875rem;">Sin herramientas en uso.</p>';
            
            stationCard.innerHTML = `
                <i class="fas fa-industry"></i>
                <div class="station-label">${station.name}</div>
                <div class="station-value">${toolsInStation.length}</div>
                <div class="station-label" style="margin-bottom: 0;">Herramientas en Uso</div>
                <div class="station-tools">
                    ${toolsListHTML}
                </div>
            `;
            container.appendChild(stationCard);
        });
    }
};