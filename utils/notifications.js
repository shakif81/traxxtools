// Módulo de notificaciones
const NotificationModule = {
    show(message, type = 'info', duration = 4000) {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.warn('Elemento de notificación no encontrado');
            return;
        }
        
        // Limpiar clases anteriores
        notification.className = `notification notification-${type}`;
        
        // Crear icono según el tipo
        let icon = 'fas fa-info-circle';
        switch (type) {
            case 'success':
                icon = 'fas fa-check-circle';
                break;
            case 'warning':
                icon = 'fas fa-exclamation-triangle';
                break;
            case 'error':
                icon = 'fas fa-times-circle';
                break;
            case 'info':
            default:
                icon = 'fas fa-info-circle';
        }
        
        notification.innerHTML = `<i class="${icon}"></i> ${message}`;
        
        // Mostrar notificación
        notification.classList.add('show');
        
        // Ocultar después de la duración especificada
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
        
        return notification;
    },
    
    showSuccess(message, duration = 4000) {
        return this.show(message, 'success', duration);
    },
    
    showWarning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    },
    
    showError(message, duration = 4000) {
        return this.show(message, 'error', duration);
    },
    
    showInfo(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
};