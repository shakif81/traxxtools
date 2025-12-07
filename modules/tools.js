// Módulo de herramientas
const ToolsModule = {
    // Datos por defecto de herramientas
    getDefaultTools() {
        return [
            { id: "1", name: "Llave Dinamométrica M12 56Nm", status: "disponible", operator: "", station: "", icon: "fas fa-tachometer-alt", isTorque: true, location: "estante-1", grupo: "Dinamométricas", numeroSerie: "LD-001" },
            { id: "2", name: "Llave Dinamométrica M10 32Nm", status: "disponible", operator: "", station: "", icon: "fas fa-tachometer-alt", isTorque: true, location: "estante-1", grupo: "Dinamométricas", numeroSerie: "LD-002" },
            { id: "3", name: "Llave Dinamométrica M8 16,2Nm", status: "disponible", operator: "", station: "", icon: "fas fa-tachometer-alt", isTorque: true, location: "estante-2", grupo: "Dinamométricas", numeroSerie: "LD-003" },
            { id: "4", name: "Llave Dinamométrica M6 6,8Nm", status: "disponible", operator: "", station: "", icon: "fas fa-tachometer-alt", isTorque: true, location: "estante-2", grupo: "Dinamométricas", numeroSerie: "LD-004" },
            { id: "5", name: "Destornillador TORX T30", status: "disponible", operator: "", station: "", icon: "fas fa-screwdriver", isTorque: false, location: "estante-3", grupo: "destornilladores", numeroSerie: "" },
            { id: "6", name: "LLave 22", status: "disponible", operator: "", station: "", icon: "fas fa-wrench", isTorque: true, location: "estante-3", grupo: "Llaves", numeroSerie: "" },
            { id: "7", name: "Llave 18", status: "disponible", operator: "", station: "", icon: "fas fa-wrench", isTorque: true, location: "estante-4", grupo: "Llaves", numeroSerie: "" },
            { id: "8", name: "Llave 13", status: "disponible", operator: "", station: "", icon: "fas fa-wrench", isTorque: false, location: "estante-4", grupo: "Llaves", numeroSerie: "" },
        ];
    },
    
    // Cargar herramientas por defecto en Firebase
    async loadDefaultTools(db) {
        console.log('📦 Cargando herramientas por defecto...');
        const defaultTools = this.getDefaultTools();
        
        for (const tool of defaultTools) {
            try {
                await db.collection('TraxxData').doc('tools')
                    .collection('items').doc(tool.id).set(tool);
            } catch (error) {
                console.error(`Error cargando herramienta ${tool.id}:`, error);
            }
        }
        console.log('✅ Herramientas por defecto cargadas');
    },
    
    // Verificar disponibilidad de herramienta
    checkToolAvailability(tools, serialNumber) {
        const tool = tools.find(t => t.numeroSerie === serialNumber);
        
        if (!tool) {
            return {
                available: false,
                message: 'Herramienta no encontrada en el inventario'
            };
        }
        
        if (tool.status === 'disponible') {
            return {
                available: true,
                message: 'Disponible para uso'
            };
        } else if (tool.status === 'en-uso') {
            return {
                available: false,
                message: `En uso por ${tool.operator}`
            };
        } else if (tool.status === 'mantenimiento') {
            return {
                available: false,
                message: 'En mantenimiento'
            };
        }
        
        return {
            available: false,
            message: 'Estado desconocido'
        };
    },
    
    // Obtener historial de herramienta
    getToolHistory(history, toolId, tools, limit = 5) {
        const tool = tools.find(t => t.id === toolId);
        if (!tool) return [];
        
        return history.filter(item => 
            item.numeroSerie === tool.numeroSerie
        ).slice(0, limit);
    },
    
    // Actualizar estadísticas de herramientas
    updateHerramientasStats(tools, colaEspera) {
        if (!tools || tools.length === 0) return { disponible: 0, enUso: 0, mantenimiento: 0, total: 0, enCola: 0 };
        
        const disponible = tools.filter(tool => tool.status === 'disponible').length;
        const enUso = tools.filter(tool => tool.status === 'en-uso').length;
        const mantenimiento = tools.filter(tool => tool.status === 'mantenimiento').length;
        const total = tools.length;
        
        const toolsInUseOrMaint = tools.filter(t => t.status !== 'disponible').map(t => t.id);
        const enCola = colaEspera.filter(item => toolsInUseOrMaint.includes(item.toolId)).length;
        
        return { disponible, enUso, mantenimiento, total, enCola };
    },
    
    // Actualizar elementos DOM con estadísticas
    updateHerramientasStatsDOM(stats) {
        const disponibleElement = document.getElementById('herramientas-disponible-count');
        const enUsoElement = document.getElementById('herramientas-en-uso-count');
        const mantenimientoElement = document.getElementById('herramientas-mantenimiento-count');
        const totalElement = document.getElementById('herramientas-total-count');
        
        if (disponibleElement) disponibleElement.textContent = stats.disponible;
        if (enUsoElement) enUsoElement.textContent = stats.enUso;
        if (mantenimientoElement) mantenimientoElement.textContent = stats.mantenimiento;
        if (totalElement) totalElement.textContent = stats.total;
    }
};