// Configuración de Google Apps Script para Veterinaria Tarapacá
// ✅ CONFIGURADO con URL real del Apps Script

const APPS_SCRIPT_CONFIG = {
    // URL del Google Apps Script (VERSIÓN FINAL CON DEBUG)
    scriptUrl: 'https://script.google.com/macros/s/AKfycbzkmzZhgJGx3_Hbtz7HiaZ12cyGEPkn36kmpkvRvR_GSLrEJslLv5nIE3evACC3ruHlCg/exec',
    
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