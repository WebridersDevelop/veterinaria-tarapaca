// Configuración para Google Calendar API
// Copiar este archivo como 'google-config.js' y completar con tus credenciales reales

const GOOGLE_CONFIG = {
    // API Key de Google Cloud Console
    apiKey: 'YOUR_GOOGLE_API_KEY_HERE',
    
    // ID del calendario de la veterinaria (obtener desde Google Calendar)
    calendarId: 'YOUR_CALENDAR_ID@gmail.com',
    
    // Client ID para OAuth (opcional, para creación de eventos)
    clientId: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    
    // Scopes necesarios
    scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
    ]
};

// Configuración para desarrollo/testing
const GOOGLE_CONFIG_DEV = {
    apiKey: 'demo-key',
    calendarId: 'demo@gmail.com',
    clientId: 'demo-client-id',
    scopes: []
};

// Exportar configuración
window.GOOGLE_CONFIG = GOOGLE_CONFIG;
window.GOOGLE_CONFIG_DEV = GOOGLE_CONFIG_DEV;