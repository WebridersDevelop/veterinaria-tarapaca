// Configuración de Google Calendar API para Veterinaria Tarapacá
// COMPLETAR con tus credenciales de Google Cloud Console

const GOOGLE_CONFIG = {
    // Tu API Key de Google Cloud Console (PENDIENTE)
    apiKey: 'PENDIENTE_API_KEY_GOOGLE_CLOUD',
    
    // ID del calendario de la veterinaria (YA CONFIGURADO)
    calendarId: 'veterinariatarapaca@gmail.com',
    
    // Tu Client ID OAuth 2.0 (PENDIENTE)
    clientId: 'PENDIENTE_CLIENT_ID_GOOGLE_CLOUD.apps.googleusercontent.com',
    
    // Permisos necesarios
    scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
    ]
};

// Aplicar configuración globalmente
window.GOOGLE_CONFIG = GOOGLE_CONFIG;