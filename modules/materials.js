// Módulo de materiales
const MaterialsModule = {
    // Datos por defecto de materiales
    getDefaultMaterials() {
        return [
            { id: "1", name: "Molycote", code: "MOLY-001", status: "disponible", operator: "", station: "", location: "Estante-a1" },
            { id: "2", name: "Loctite 270", code: "LOC-270", status: "disponible", operator: "", station: "", location: "Estante-b2"},
            { id: "3", name: "Loctite 244", code: "LOC-002", status: "disponible", operator: "", station: "", location: "Estante-a1"},
            { id: "4", name: "Loctite 222", code: "LOC-222", status: "disponible", operator: "", station: "", location: "Estante-b2"}
        ];
    },
    
    // Cargar materiales por defecto en Firebase
    async loadDefaultMaterials(db) {
        console.log('🧪 Cargando materiales por defecto...');
        const defaultMaterials = this.getDefaultMaterials();
        
        for (const material of defaultMaterials) {
            try {
                await db.collection('TraxxData').doc('materials')
                    .collection('items').doc(material.id).set(material);
            } catch (error) {
                console.error(`Error cargando material ${material.id}:`, error);
            }
        }
        console.log('✅ Materiales por defecto cargados');
    },
    
    // Filtrar materiales por término de búsqueda
    filterMaterials(materials, searchTerm) {
        if (!searchTerm) return materials;
        
        return materials.filter(material => 
            material.name.toLowerCase().includes(searchTerm) || 
            material.code.toLowerCase().includes(searchTerm)
        );
    },
    
    // Ordenar materiales (primero los del usuario actual)
    sortMaterials(materials, currentUserName) {
        return [...materials].sort((a, b) => {
            const aIsUserMaterial = a.status === 'en-uso' && a.operator === currentUserName;
            const bIsUserMaterial = b.status === 'en-uso' && b.operator === currentUserName;
            
            if (aIsUserMaterial && !bIsUserMaterial) return -1;
            if (!aIsUserMaterial && bIsUserMaterial) return 1;
            
            const aInUse = a.status === 'en-uso';
            const bInUse = b.status === 'en-uso';
            if (aInUse && !bInUse) return -1;
            if (!aInUse && bInUse) return 1;
            
            return a.name.localeCompare(b.name);
        });
    },
    
    // Agrupar materiales por estado y operador
    groupMaterials(materials, currentUserName) {
        return {
            usuario: materials.filter(m => m.status === 'en-uso' && m.operator === currentUserName),
            otros: materials.filter(m => m.status === 'en-uso' && m.operator !== currentUserName),
            disponibles: materials.filter(m => m.status === 'disponible')
        };
    }
};