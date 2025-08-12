// Google Apps Script para Veterinaria Tarapacá - VERSIÓN CORREGIDA
// Compatible con CORS y localhost

const CALENDAR_ID = 'veterinariatarapaca@gmail.com';
const TIMEZONE = 'America/Santiago';

// Horarios de la clínica
const CLINIC_HOURS = {
  'MONDAY': { start: '10:30', end: '19:00' },
  'TUESDAY': { start: '10:30', end: '19:00' },
  'WEDNESDAY': { start: '10:30', end: '19:00' },
  'THURSDAY': { start: '10:30', end: '19:00' },
  'FRIDAY': { start: '10:30', end: '19:00' },
  'SATURDAY': { start: '10:30', end: '14:00' },
  'SUNDAY': null
};

// Configuración de consultas
const CONSULTATION_TYPES = {
  'endocrinologia': { duration: 60, name: 'Consulta Endocrinología' },
  'general': { duration: 30, name: 'Consulta General' }
};

/**
 * Manejar todas las requests HTTP
 */
function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}
function handleRequest(e) {
  // Headers CORS mejorados
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
  
  try {
    Logger.log('📨 Request recibido');
    
    let requestData = {};
    
    // Obtener datos del request
    if (e && e.postData && e.postData.contents) {
      // POST con JSON
      requestData = JSON.parse(e.postData.contents);
      Logger.log('Datos POST:', requestData);
    } else if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      // GET con parámetros
      requestData = e.parameter;
      Logger.log('Datos GET:', requestData);
    } else {
      // Sin acción específica - retornar status
      return createResponse({
        success: true,
        message: '✅ API de Veterinaria Tarapacá funcionando',
        timestamp: new Date().toISOString(),
        calendar: CALENDAR_ID
      }, headers);
    }
    
    const action = requestData.action;
    let response;
    
    switch (action) {
      case 'checkAvailability':
        response = checkAvailability(requestData.date, requestData.consultationType);
        break;
        
      case 'createAppointment':
        response = createAppointment(requestData.appointmentData);
        break;
        
      default:
        response = {
          success: true,
          message: 'API funcionando - sin acción específica',
          availableActions: ['checkAvailability', 'createAppointment']
        };
    }
    
    return createResponse(response, headers);
    
  } catch (error) {
    Logger.log('❌ Error:', error.toString());
    return createResponse({
      success: false,
      error: error.toString()
    }, headers);
  }
}

/**
 * Crear respuesta con headers CORS
 */
function createResponse(data, headers) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Agregar headers CORS
  Object.keys(headers).forEach(key => {
    output.setHeader(key, headers[key]);
  });
  
  return output;
}

function checkAvailability(dateString, consultationType) {
  try {
    Logger.log(`🔍 Verificando disponibilidad: ${dateString}, ${consultationType}`);
    
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const date = new Date(dateString);
    const dayName = Utilities.formatDate(date, TIMEZONE, 'EEEE').toUpperCase();
    
    // Verificar si la clínica está abierta
    const daySchedule = CLINIC_HOURS[dayName];
    if (!daySchedule) {
      return {
        success: true,
        availableSlots: [],
        message: 'Clínica cerrada los domingos'
      };
    }
    
    // Generar slots básicos (mejorable con eventos reales)
    const duration = CONSULTATION_TYPES[consultationType].duration;
    const slots = generateTimeSlots(daySchedule.start, daySchedule.end, duration);
    
    Logger.log(`✅ Slots generados: ${slots.length}`);
    
    return {
      success: true,
      availableSlots: slots,
      date: dateString,
      consultationType: consultationType
    };
    
  } catch (error) {
    Logger.log(`❌ Error en checkAvailability: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Crear nueva cita
 */
function createAppointment(appointmentData) {
  try {
    Logger.log('📅 Creando cita:', JSON.stringify(appointmentData));
    
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const consultation = CONSULTATION_TYPES[appointmentData.type];
    
    // Crear fechas
    const startDateTime = new Date(appointmentData.date + 'T' + appointmentData.time + ':00');
    const endDateTime = new Date(startDateTime.getTime() + (consultation.duration * 60000));
    
    // Crear evento
    const title = `${consultation.name} - ${appointmentData.pet.name}`;
    const description = `
CITA VETERINARIA:
• Tutor: ${appointmentData.tutor.name}
• Teléfono: ${appointmentData.tutor.phone}
• Email: ${appointmentData.tutor.email}
• Mascota: ${appointmentData.pet.name}
• Especie: ${appointmentData.pet.species}
• Edad: ${appointmentData.pet.age}
• Tipo: ${consultation.name}
• Duración: ${consultation.duration} minutos

Generado por sistema web - ${new Date().toLocaleString('es-CL')}
    `.trim();
    
    const event = calendar.createEvent(title, startDateTime, endDateTime, {
      description: description,
      location: 'Clínica Veterinaria Tarapacá, Av. Salvador Allende #3638, Iquique'
    });
    
    Logger.log('✅ Evento creado:', event.getId());
    
    return {
      success: true,
      eventId: event.getId(),
      message: 'Cita creada exitosamente',
      appointment: {
        title: title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      }
    };
    
  } catch (error) {
    Logger.log(`❌ Error creando cita: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generar slots de tiempo
 */
function generateTimeSlots(startTime, endTime, duration) {
  const slots = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  let current = start;
  
  while (current < end) {
    const timeString = Utilities.formatDate(current, TIMEZONE, 'HH:mm');
    slots.push(timeString);
    
    // Avanzar por la duración
    current = new Date(current.getTime() + (duration * 60000));
  }
  
  return slots;
}

/**
 * Parsear tiempo
 */
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Test básico
 */
function testBasico() {
  Logger.log('🧪 Test iniciado');
  const result = checkAvailability('2024-01-20', 'general');
  Logger.log('Resultado:', result);
  return result;
}