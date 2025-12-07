// Módulo de autenticación
const AuthModule = {
    // No hay sistema de autenticación complejo en esta versión
    // Solo se mantiene un usuario por defecto
    
    getCurrentUser() {
        return {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: 'Operario General',
            role: 'Operario',
            isAdmin: false,
            isLoggedIn: true
        };
    },
    
    updateUserProfile(avatarElement, nameElement, roleElement) {
        if (avatarElement) avatarElement.textContent = "OP";
        if (nameElement) nameElement.textContent = "Operario General";
        if (roleElement) roleElement.textContent = "Taller TRAXX";
    },
    
    // Método para simular logout (aunque no está implementado en la UI)
    logout() {
        console.log('Cerrando sesión...');
        // Redirigir a página de login si existiera
        // window.location.href = 'login.html';
    }
};