// Módulo de funciones auxiliares
const Helpers = {
    // Formatear fecha
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    },
    
    // Formatear tiempo relativo
    formatTimeAgo(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMins < 1) return 'Hace un momento';
            if (diffMins < 60) return `Hace ${diffMins} min`;
            if (diffHours < 24) return `Hace ${diffHours} h`;
            if (diffDays < 7) return `Hace ${diffDays} d`;
            
            return this.formatDate(dateString);
        } catch (error) {
            return dateString;
        }
    },
    
    // Generar ID único
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}${timestamp}_${random}`;
    },
    
    // Guardar en localStorage
    saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    },
    
    // Cargar desde localStorage
    loadFromLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error cargando desde localStorage:', error);
            return defaultValue;
        }
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Validar email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validar número de operación
    isValidOperationNumber(opNumber) {
        if (!opNumber || opNumber.trim() === '') return true; // Opcional
        return /^[A-Za-z0-9\-_]+$/.test(opNumber);
    },
    
    // Capitalizar texto
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    // Truncar texto
    truncate(text, maxLength = 50, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.substr(0, maxLength) + suffix;
    },
    
    // Obtener iniciales de nombre
    getInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substr(0, 2);
    },
    
    // Crear elemento HTML
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Atributos
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'style' && typeof attributes[key] === 'object') {
                Object.assign(element.style, attributes[key]);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        // Hijos
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    // Crear badge de estado
    createStatusBadge(status, text = null) {
        let className = 'status-badge ';
        let displayText = text || status;
        
        switch (status.toLowerCase()) {
            case 'disponible':
            case 'available':
                className += 'status-available';
                break;
            case 'en-uso':
            case 'in-use':
                className += 'status-in-use';
                break;
            case 'mantenimiento':
            case 'maintenance':
                className += 'status-maintenance';
                break;
            default:
                className += 'status-available';
        }
        
        return this.createElement('span', {
            className: className
        }, [displayText]);
    },
    
    // Crear badge de usuario
    createUserBadge(name, isCurrentUser = false) {
        const initials = this.getInitials(name);
        const badge = this.createElement('div', {
            className: 'user-badge'
        }, [
            this.createElement('div', {
                className: 'user-avatar-small'
            }, [initials]),
            this.createElement('span', {}, [name]),
            isCurrentUser ? this.createElement('span', {
                className: 'user-indicator'
            }, ['TÚ']) : null
        ].filter(Boolean));
        
        return badge;
    }
};