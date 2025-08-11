// Configuración de Google Apps Script para Veterinaria Tarapacá
// ✅ CONFIGURADO con URL real del Apps Script

const APPS_SCRIPT_CONFIG = {
    // URL del Google Apps Script (YA CONFIGURADO)
    scriptUrl: 'https://script.google.com/macros/s/AKfycbzmM_d0mYh7rTjq7XQBIbKP-kKMFBxoFn4hFeQ3eyA6wJnnSrguhNepvadBrZv4oCW1mA/exec',
    
    // Estado de configuración
    isConfigured: true // ✅ ACTIVADO
};

// Configurar la API cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.bookingSystem && window.bookingSystem.appsScriptAPI) {
        if (APPS_SCRIPT_CONFIG.isConfigured) {
            window.bookingSystem.appsScriptAPI.configure(APPS_SCRIPT_CONFIG.scriptUrl);
            console.log('Apps Script API configurada exitosamente');
        } else {
            console.warn('⚠️ Apps Script no configurado. Usando horarios estáticos como respaldo.');
        }
    }
});

// Exportar configuración
window.APPS_SCRIPT_CONFIG = APPS_SCRIPT_CONFIG;