# Configuración de Google Calendar API

## Pasos para configurar la integración con Google Calendar

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Calendar API**:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Calendar API"
   - Haz clic en "Habilitar"

### 2. Crear credenciales

#### API Key (para lectura):
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la API Key generada
4. (Opcional) Restringe la clave a Google Calendar API

#### OAuth 2.0 Client ID (para creación de eventos):
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
3. Selecciona "Aplicación web"
4. Agrega tus dominios autorizados:
   - `https://tudominio.com`
   - `http://localhost:8000` (para desarrollo)
5. Copia el Client ID generado

### 3. Configurar el calendario

1. Ve a [Google Calendar](https://calendar.google.com)
2. Crea un calendario específico para la veterinaria o usa uno existente
3. Ve a configuración del calendario > "Integrar calendario"
4. Copia el **ID del calendario** (formato: `abc123@group.calendar.google.com`)

### 4. Configurar permisos

1. Haz el calendario público o compártelo con permisos específicos
2. Para crear eventos, necesitarás permisos de escritura

### 5. Configurar en el código

1. Copia `config/google-config.example.js` como `config/google-config.js`
2. Completa con tus credenciales:

```javascript
const GOOGLE_CONFIG = {
    apiKey: 'tu-api-key-aqui',
    calendarId: 'tu-calendario-id@group.calendar.google.com',
    clientId: 'tu-client-id.apps.googleusercontent.com',
    scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
    ]
};
```

3. Incluye el archivo de configuración en tu HTML:
```html
<script src="config/google-config.js"></script>
```

### 6. Funcionalidades disponibles

#### ✅ Lectura de disponibilidad
- Verifica eventos existentes en el calendario
- Calcula slots de tiempo disponibles
- Considera horarios de la clínica

#### ✅ Creación de citas
- Crea eventos en Google Calendar
- Incluye información del tutor y mascota
- Configura duración según tipo de consulta
- Envía invitaciones por email

#### ✅ Modo fallback
- Si falla la API, usa horarios estáticos
- Mantiene la funcionalidad básica del sistema

### 7. Consideraciones de seguridad

- **No expongas** las credenciales en el código fuente
- Usa **variables de entorno** en producción
- Restringe las **API Keys** a dominios específicos
- Considera implementar un **backend proxy** para mayor seguridad

### 8. Testing

Para probar sin configurar Google Calendar:
- El sistema usa horarios estáticos como fallback
- Puedes simular la funcionalidad antes de configurar la API
- Revisa la consola del navegador para logs de debugging

### 9. Producción en Vercel

Para desplegar en Vercel:
1. Agrega las credenciales como **variables de entorno**
2. Modifica el código para usar `process.env.GOOGLE_API_KEY`
3. O usa un **serverless function** para manejar las credenciales de forma segura

### 10. Soporte

Si necesitas ayuda:
- Revisa la [documentación de Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- Consulta los logs en la consola del navegador
- Verifica que todas las credenciales estén correctamente configuradas