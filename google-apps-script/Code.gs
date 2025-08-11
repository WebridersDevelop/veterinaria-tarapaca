// Google Apps Script para Veterinaria Tarapacá
// Integración con Google Calendar - 100% Gratuito

// CONFIGURACIÓN
const CALENDAR_ID = 'veterinariatarapaca@gmail.com'; // Tu calendario existente
const TIMEZONE = 'America/Santiago'; // Zona horaria de Chile

// Horarios de la clínica
const CLINIC_HOURS = {
  'MONDAY': { start: '10:30', end: '19:00' },
  'TUESDAY': { start: '10:30', end: '19:00' },
  'WEDNESDAY': { start: '10:30', end: '19:00' },
  'THURSDAY': { start: '10:30', end: '19:00' },
  'FRIDAY': { start: '10:30', end: '19:00' },
  'SATURDAY': { start: '10:30', end: '14:00' },
  'SUNDAY': null // Cerrado
};

// Configuración de consultas
const CONSULTATION_TYPES = {
  'endocrinologia': { duration: 60, name: 'Consulta Endocrinología' },
  'general': { duration: 30, name: 'Consulta General' }
};

/**
 * Función principal para manejar requests HTTP
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doOptions(e) {
  return handleRequest(e, 'OPTIONS');
}

function handleRequest(e, method) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '3600'
  };
  
  // Manejar preflight OPTIONS request
  if (method === 'OPTIONS') {
    return ContentService
      .createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
  }
  
  try {
    // Verificar que e existe
    if (!e) {
      Logger.log('❌ Objeto evento e es undefined o null');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No se recibió objeto de evento',
          debug: 'Event object is undefined'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Log completo del objeto request para debugging
    Logger.log('✅ Evento recibido');
    Logger.log('Tipo de e:', typeof e);
    Logger.log('Keys de e:', Object.keys(e || {}));
    Logger.log('postData existe:', !!(e && e.postData));
    Logger.log('parameter existe:', !!(e && e.parameter));
    
    let requestData;
    
    // Intentar múltiples formas de obtener los datos
    if (e.postData && e.postData.contents) {
      // Método 1: POST con JSON en body
      try {
        requestData = JSON.parse(e.postData.contents);
        Logger.log('Datos parseados desde postData.contents:', requestData);
      } catch (parseError) {
        Logger.log('Error parseando postData.contents:', parseError);
        throw parseError;
      }
    } else if (e.postData && e.postData.getDataAsString) {
      // Método 2: POST con función getDataAsString
      try {
        const dataString = e.postData.getDataAsString();
        requestData = JSON.parse(dataString);
        Logger.log('Datos parseados desde getDataAsString:', requestData);
      } catch (parseError) {
        Logger.log('Error parseando getDataAsString:', parseError);
        throw parseError;
      }
    } else if (e.parameter && Object.keys(e.parameter).length > 0) {
      // Método 3: Parámetros URL (GET-style)
      requestData = e.parameter;
      Logger.log('Datos obtenidos desde parameter:', requestData);
    } else {
      // No hay datos válidos
      Logger.log('No se encontraron datos en el request');
      Logger.log('Estructura de e:', {
        hasPostData: !!e.postData,
        hasParameter: !!e.parameter,
        keys: Object.keys(e)
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No se recibieron datos válidos',
          debug: {
            hasPostData: !!e.postData,
            hasParameter: !!e.parameter,
            requestKeys: Object.keys(e)
          }
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
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
        response = { success: false, error: 'Acción no válida' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    Logger.log('Error en doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Manejar requests GET (para testing)
 */
function doGet(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  // Testing con parámetros GET
  const action = e.parameter.action;
  
  if (action === 'test') {
    // Test de disponibilidad
    const testDate = e.parameter.date || '2024-01-15';
    const testType = e.parameter.type || 'general';
    
    try {
      const result = checkAvailability(testDate, testType);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          test: 'availability',
          result: result
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          test: 'availability',
          error: error.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({
      message: '✅ API de Veterinaria Tarapacá funcionando correctamente',
      timestamp: new Date().toISOString(),
      timezone: TIMEZONE,
      calendar: CALENDAR_ID,
      endpoints: {
        'GET /': 'Status check',
        'GET /?action=test&date=2024-01-15&type=general': 'Test availability',
        'POST /': 'API endpoints (checkAvailability, createAppointment)'
      }
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

/**
 * Verificar disponibilidad de horarios para una fecha específica
 */
function checkAvailability(dateString, consultationType) {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const date = new Date(dateString);
    const dayName = Utilities.formatDate(date, TIMEZONE, 'EEEE').toUpperCase();
    
    // Verificar si la clínica está abierta ese día
    const daySchedule = CLINIC_HOURS[dayName];
    if (!daySchedule) {
      return {
        success: true,
        availableSlots: [],
        message: 'La clínica está cerrada los domingos'
      };
    }
    
    // Obtener eventos existentes del día
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingEvents = calendar.getEvents(startOfDay, endOfDay);
    
    // Generar slots disponibles
    const availableSlots = generateAvailableSlots(date, daySchedule, existingEvents, consultationType);
    
    return {
      success: true,
      availableSlots: availableSlots,
      date: dateString,
      consultationType: consultationType
    };
    
  } catch (error) {
    Logger.log('Error en checkAvailability: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generar slots de tiempo disponibles
 */
function generateAvailableSlots(date, daySchedule, existingEvents, consultationType) {
  const slots = [];
  const consultation = CONSULTATION_TYPES[consultationType];
  const duration = consultation.duration;
  
  // Parsear horarios de inicio y fin
  const startTime = parseTime(daySchedule.start);
  const endTime = parseTime(daySchedule.end);
  
  // Generar todos los slots posibles
  let currentTime = new Date(date);
  currentTime.setHours(startTime.hours, startTime.minutes, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(endTime.hours, endTime.minutes, 0, 0);
  
  while (currentTime < dayEnd) {
    const slotEnd = new Date(currentTime.getTime() + (duration * 60000));
    
    // Verificar que el slot termine dentro del horario de la clínica
    if (slotEnd <= dayEnd) {
      // Verificar si el slot se superpone con eventos existentes
      const isAvailable = !existingEvents.some(event => {
        const eventStart = event.getStartTime();
        const eventEnd = event.getEndTime();
        return (currentTime < eventEnd && slotEnd > eventStart);
      });
      
      if (isAvailable) {
        const timeString = Utilities.formatDate(currentTime, TIMEZONE, 'HH:mm');
        slots.push(timeString);
      }
    }
    
    // Avanzar al siguiente slot
    currentTime = new Date(currentTime.getTime() + (duration * 60000));
  }
  
  return slots;
}

/**
 * Crear nueva cita en Google Calendar
 */
function createAppointment(appointmentData) {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    
    // Preparar datos de la cita
    const consultation = CONSULTATION_TYPES[appointmentData.type];
    const startDateTime = new Date(appointmentData.date + 'T' + appointmentData.time + ':00');
    const endDateTime = new Date(startDateTime.getTime() + (consultation.duration * 60000));
    
    // Crear título del evento
    const title = `${consultation.name} - ${appointmentData.pet.name}`;
    
    // Crear descripción detallada
    const description = `
DATOS DE LA CITA:
• Tipo: ${consultation.name}
• Duración: ${consultation.duration} minutos

TUTOR:
• Nombre: ${appointmentData.tutor.name}
• Teléfono: ${appointmentData.tutor.phone}
• Email: ${appointmentData.tutor.email}

MASCOTA:
• Nombre: ${appointmentData.pet.name}
• Especie: ${appointmentData.pet.species}
• Edad: ${appointmentData.pet.age}

FECHA DE SOLICITUD: ${new Date().toLocaleString('es-CL', { timeZone: TIMEZONE })}

---
Generado automáticamente por el sistema de reservas de Veterinaria Tarapacá
    `.trim();
    
    // Crear el evento
    const event = calendar.createEvent(title, startDateTime, endDateTime, {
      description: description,
      location: 'Clínica Veterinaria Tarapacá, Av. Salvador Allende #3638, Iquique'
    });
    
    Logger.log('Cita creada exitosamente: ' + event.getId());
    
    return {
      success: true,
      eventId: event.getId(),
      message: 'Cita agendada exitosamente',
      appointment: {
        title: title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: consultation.duration
      }
    };
    
  } catch (error) {
    Logger.log('Error en createAppointment: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Utilidades helper
 */
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Función de testing (puedes eliminarla después)
 */
function testAPI() {
  try {
    Logger.log('=== INICIANDO TESTS ===');
    
    // Test 1: Verificar configuración
    Logger.log('Calendar ID:', CALENDAR_ID);
    Logger.log('Timezone:', TIMEZONE);
    
    // Test 2: Acceso al calendario
    try {
      const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
      Logger.log('✅ Acceso al calendario exitoso:', calendar.getName());
    } catch (calError) {
      Logger.log('❌ Error accediendo al calendario:', calError.toString());
      return;
    }
    
    // Test 3: Disponibilidad
    const testDate = '2024-01-20'; // Fecha futura
    const availability = checkAvailability(testDate, 'general');
    Logger.log('✅ Test disponibilidad exitoso:', availability);
    
    // Test 4: Simular request POST
    const mockRequest = {
      postData: null,
      parameter: {
        action: 'checkAvailability',
        date: testDate,
        consultationType: 'general'
      }
    };
    
    const postResult = doPost(mockRequest);
    Logger.log('✅ Test doPost exitoso');
    
    Logger.log('=== TODOS LOS TESTS COMPLETADOS ===');
    
  } catch (error) {
    Logger.log('❌ Error en tests:', error.toString());
  }
}

/**
 * Test simple para ejecutar manualmente
 */
function testSimple() {
  Logger.log('🧪 Test simple iniciado');
  Logger.log('Fecha actual:', new Date().toISOString());
  Logger.log('Calendar ID:', CALENDAR_ID);
  
  try {
    const result = checkAvailability('2024-01-20', 'general');
    Logger.log('✅ Resultado checkAvailability:', result);
    return result;
  } catch (error) {
    Logger.log('❌ Error en checkAvailability:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test directo del calendario sin doPost
 */
function testCalendarDirect() {
  Logger.log('🔍 Probando acceso directo al calendario...');
  
  try {
    // Test 1: Acceso al calendario
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    Logger.log('✅ Calendario encontrado:', calendar.getName());
    
    // Test 2: Obtener eventos de hoy
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const events = calendar.getEvents(today, tomorrow);
    Logger.log('📅 Eventos hoy:', events.length);
    
    events.forEach((event, index) => {
      Logger.log(`Evento ${index + 1}: ${event.getTitle()} - ${event.getStartTime()}`);
    });
    
    // Test 3: Generar slots para mañana
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    Logger.log('🕒 Generando slots para:', tomorrowString);
    
    const slots = checkAvailability(tomorrowString, 'general');
    Logger.log('✅ Slots generados:', slots);
    
    return {
      success: true,
      calendar: calendar.getName(),
      todayEvents: events.length,
      tomorrowSlots: slots
    };
    
  } catch (error) {
    Logger.log('❌ Error en test directo:', error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}