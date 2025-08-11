// Google Calendar API Integration para Veterinaria Tarapacá
// Compatible con Vercel - Frontend Only

class GoogleCalendarAPI {
    constructor() {
        // Configuración desde archivo externo
        this.config = {
            apiKey: window.GOOGLE_CONFIG?.apiKey || 'NOT_CONFIGURED',
            calendarId: window.GOOGLE_CONFIG?.calendarId || 'NOT_CONFIGURED',
            clientId: window.GOOGLE_CONFIG?.clientId || 'NOT_CONFIGURED',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scopes: window.GOOGLE_CONFIG?.scopes?.join(' ') || 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
        };
        
        this.isInitialized = false;
        this.gapi = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            if (typeof gapi === 'undefined') {
                // Cargar Google API Script dinámicamente
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.onload = () => {
                    this.initializeGAPI().then(resolve).catch(reject);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            } else {
                this.initializeGAPI().then(resolve).catch(reject);
            }
        });
    }
    
    async initializeGAPI() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.config.apiKey,
                        clientId: this.config.clientId,
                        discoveryDocs: this.config.discoveryDocs,
                        scope: this.config.scopes
                    });
                    
                    this.isInitialized = true;
                    console.log('Google Calendar API inicializada correctamente');
                    resolve();
                } catch (error) {
                    console.error('Error al inicializar Google Calendar API:', error);
                    reject(error);
                }
            });
        });
    }
    
    async checkAvailability(date, consultationType) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        try {
            // Calcular rango de tiempo para el día seleccionado
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            // Obtener eventos existentes para el día
            const response = await gapi.client.calendar.events.list({
                calendarId: this.config.calendarId,
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });
            
            const events = response.result.items || [];
            
            // Calcular slots disponibles
            const availableSlots = this.calculateAvailableSlots(date, events, consultationType);
            
            return availableSlots;
            
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            // Fallback a horarios estáticos si falla la API
            return this.getFallbackSlots(date, consultationType);
        }
    }
    
    calculateAvailableSlots(date, existingEvents, consultationType) {
        const dayName = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][date.getDay()];
        
        // Horarios de la clínica
        const clinicHours = {
            lunes: { inicio: '10:30', fin: '19:00' },
            martes: { inicio: '10:30', fin: '19:00' },
            miercoles: { inicio: '10:30', fin: '19:00' },
            jueves: { inicio: '10:30', fin: '19:00' },
            viernes: { inicio: '10:30', fin: '19:00' },
            sabado: { inicio: '10:30', fin: '14:00' },
            domingo: null // Cerrado
        };
        
        const daySchedule = clinicHours[dayName];
        if (!daySchedule) return []; // Día cerrado
        
        // Duración según tipo de consulta
        const duration = consultationType === 'endocrinologia' ? 60 : 30;
        
        // Generar todos los slots posibles
        const allSlots = this.generateTimeSlots(daySchedule.inicio, daySchedule.fin, duration);
        
        // Filtrar slots ocupados
        const availableSlots = allSlots.filter(slot => {
            const slotStart = this.parseDateTime(date, slot);
            const slotEnd = new Date(slotStart.getTime() + (duration * 60000));
            
            // Verificar si el slot se superpone con eventos existentes
            return !existingEvents.some(event => {
                const eventStart = new Date(event.start.dateTime);
                const eventEnd = new Date(event.end.dateTime);
                
                return (slotStart < eventEnd && slotEnd > eventStart);
            });
        });
        
        return availableSlots;
    }
    
    generateTimeSlots(startTime, endTime, duration) {
        const slots = [];
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        
        let current = new Date(start);
        
        while (current < end) {
            const timeString = this.formatTime(current);
            slots.push(timeString);
            
            // Avanzar por la duración
            current = new Date(current.getTime() + (duration * 60000));
        }
        
        return slots;
    }
    
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }
    
    parseDateTime(date, timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes, 0, 0);
        return dateTime;
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    }
    
    getFallbackSlots(date, consultationType) {
        // Horarios estáticos como respaldo
        const dayName = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][date.getDay()];
        
        const schedules = {
            lunes: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
            martes: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
            miercoles: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
            jueves: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
            viernes: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
            sabado: ['10:30', '11:30', '12:30'],
            domingo: []
        };
        
        return schedules[dayName] || [];
    }
    
    async createAppointment(appointmentData) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        try {
            // Crear fecha y hora de inicio
            const startDateTime = new Date(appointmentData.date);
            const [hours, minutes] = appointmentData.time.split(':');
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Calcular duración
            const duration = appointmentData.type === 'endocrinologia' ? 60 : 30;
            const endDateTime = new Date(startDateTime.getTime() + (duration * 60000));
            
            // Crear evento en Google Calendar
            const event = {
                summary: `${appointmentData.type === 'endocrinologia' ? 'Consulta Endocrinología' : 'Consulta General'} - ${appointmentData.pet.name}`,
                description: `Tutor: ${appointmentData.tutor.name}\\nMascota: ${appointmentData.pet.name} (${appointmentData.pet.species}, ${appointmentData.pet.age})\\nTeléfono: ${appointmentData.tutor.phone}\\nEmail: ${appointmentData.tutor.email}`,
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'America/Santiago'
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'America/Santiago'
                },
                attendees: [
                    { email: appointmentData.tutor.email }
                ]
            };
            
            const response = await gapi.client.calendar.events.insert({
                calendarId: this.config.calendarId,
                resource: event
            });
            
            console.log('Cita creada exitosamente:', response.result);
            return response.result;
            
        } catch (error) {
            console.error('Error al crear cita en Google Calendar:', error);
            throw error;
        }
    }
    
    // Método para autenticación si es necesario
    async signIn() {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const authInstance = gapi.auth2.getAuthInstance();
        return await authInstance.signIn();
    }
}

// Exportar para uso global
window.GoogleCalendarAPI = GoogleCalendarAPI;