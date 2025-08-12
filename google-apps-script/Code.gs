// Google Apps Script para Veterinaria Tarapacá - VERSIÓN FINAL FUNCIONAL
// Compatible con GET requests desde cualquier dominio - SIN CORS

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

// Configuración de consultas - EXACTAMENTE ASÍ
const CONSULTATION_TYPES = {
  'endocrinologia': { duration: 60, name: 'Consulta Endocrinología' },
  'general': { duration: 30, name: 'Consulta General' }
};

/**
 * Manejar requests GET únicamente (evita CORS)
 */
function doGet(e) {
  try {
    Logger.log('📨 GET Request recibido');
    Logger.log('Parámetros recibidos:', e.parameter);

    // Verificar que e y e.parameter existen
    if (!e || !e.parameter) {
      Logger.log('❌ No hay parámetros en el request');
      return createJSONResponse({
        success: true,
        message: '✅ API de Veterinaria Tarapacá funcionando',
        timestamp: new Date().toISOString(),
        calendar: CALENDAR_ID,
        usage: 'Usa ?action=checkAvailability&date=2025-01-15&consultationType=general'
      });
    }

    const action = e.parameter.action;

    if (!action) {
      // Sin acción - retornar status
      return createJSONResponse({
        success: true,
        message: '✅ API de Veterinaria Tarapacá funcionando',
        timestamp: new Date().toISOString(),
        calendar: CALENDAR_ID,
        availableActions: ['checkAvailability', 'createAppointment']
      });
    }

    Logger.log('🎯 Acción solicitada:', action);

    let response;

    switch (action) {
      case 'checkAvailability':
        Logger.log('Verificando disponibilidad...');
        response = checkAvailability(e.parameter.date, e.parameter.consultationType);
        break;

      case 'createAppointment':
        Logger.log('Creando cita...');
        // Parsear datos de cita desde parámetro JSON
        let appointmentData;
        try {
          if (!e.parameter.appointmentData) {
            throw new Error('No se recibieron datos de la cita');
          }
          // DECODIFICAR URL antes de parsear JSON - LÍNEA CORREGIDA
          appointmentData = JSON.parse(decodeURIComponent(e.parameter.appointmentData));
          Logger.log('📅 Datos de cita parseados:', appointmentData);
        } catch (parseError) {
          Logger.log('❌ Error parseando appointmentData:', parseError);
          response = {
            success: false,
            error: 'Error parseando datos de la cita: ' + parseError.toString()
          };
          break;
        }
        response = createAppointment(appointmentData);
        break;

      default:
        Logger.log('❌ Acción no válida:', action);
        response = {
          success: false,
          error: 'Acción no válida: ' + action,
          availableActions: ['checkAvailability', 'createAppointment']
        };
    }

    Logger.log('📤 Enviando respuesta:', response);
    return createJSONResponse(response);

  } catch (error) {
    Logger.log('❌ Error general en doGet:', error.toString());
    return createJSONResponse({
      success: false,
      error: 'Error interno del servidor: ' + error.toString()
    });
  }
}

/**
 * Crear respuesta JSON simple
 */
function createJSONResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Verificar disponibilidad de horarios
 */
function checkAvailability(dateString, consultationType) {
  try {
    Logger.log(`🔍 Verificando disponibilidad: fecha="${dateString}", tipo="${consultationType}"`);

    // Validar parámetros requeridos
    if (!dateString || !consultationType) {
      Logger.log('❌ Faltan parámetros requeridos');
      return {
        success: false,
        error: 'Faltan parámetros: date y consultationType son requeridos'
      };
    }

    // Validar tipo de consulta
    if (!CONSULTATION_TYPES[consultationType]) {
      Logger.log('❌ Tipo de consulta no válido:', consultationType);
      return {
        success: false,
        error: 'Tipo de consulta no válido: ' + consultationType + '. Tipos disponibles: ' +
Object.keys(CONSULTATION_TYPES).join(', ')
      };
    }

    // Acceso al calendario
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    
    // Parsear fecha correctamente para evitar problemas de timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = Utilities.formatDate(date, TIMEZONE, 'EEEE').toUpperCase();
    
    Logger.log(`🗓️ Fecha parseada: ${dateString} -> ${date.toISOString()} -> Día: ${dayName}`);

    Logger.log('📅 Día de la semana:', dayName);

    // Verificar si la clínica está abierta
    const daySchedule = CLINIC_HOURS[dayName];
    if (!daySchedule) {
      Logger.log('🚫 Clínica cerrada el domingo');
      return {
        success: true,
        availableSlots: [],
        date: dateString,
        consultationType: consultationType,
        message: 'Clínica cerrada los domingos'
      };
    }

    // Generar slots de tiempo
    const consultation = CONSULTATION_TYPES[consultationType];
    const duration = consultation.duration;
    const allSlots = generateTimeSlots(daySchedule.start, daySchedule.end, duration);

    Logger.log(`🕐 Slots generados: ${allSlots.length} horarios`);
    Logger.log('Todos los horarios:', allSlots);

    // Obtener eventos existentes para esa fecha - usar fecha parseada consistente
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    Logger.log(`🗓️ Buscando eventos entre: ${startOfDay.toISOString()} y ${endOfDay.toISOString()}`);
    Logger.log(`🗓️ Fecha original: ${dateString}, Date object: ${date.toISOString()}`);

    const existingEvents = calendar.getEvents(startOfDay, endOfDay);
    Logger.log(`📋 Eventos existentes: ${existingEvents.length}`);

    // Filtrar slots disponibles
    const availableSlots = filterAvailableSlots(allSlots, existingEvents, dateString, duration);

    Logger.log(`✅ Slots disponibles: ${availableSlots.length} horarios`);
    Logger.log('Horarios disponibles:', availableSlots);

    return {
      success: true,
      availableSlots: availableSlots,
      date: dateString,
      consultationType: consultationType,
      totalSlots: allSlots.length,
      occupiedSlots: allSlots.length - availableSlots.length,
      message: `${availableSlots.length} horarios disponibles para ${consultation.name}`
    };

  } catch (error) {
    Logger.log(`❌ Error en checkAvailability: ${error.toString()}`);
    return {
      success: false,
      error: 'Error verificando disponibilidad: ' + error.toString()
    };
  }
}

/**
 * Crear nueva cita en Google Calendar
 */
function createAppointment(appointmentData) {
  try {
    Logger.log('📅 Creando cita con datos:', JSON.stringify(appointmentData));

    // Validar datos básicos
    if (!appointmentData) {
      Logger.log('❌ No se recibieron datos de la cita');
      return {
        success: false,
        error: 'No se recibieron datos de la cita'
      };
    }

    if (!appointmentData.type || !appointmentData.date || !appointmentData.time) {
      Logger.log('❌ Datos de cita incompletos');
      return {
        success: false,
        error: 'Datos de cita incompletos. Se requieren: type, date, time'
      };
    }

    // Validar tipo de consulta
    const consultation = CONSULTATION_TYPES[appointmentData.type];
    if (!consultation) {
      Logger.log('❌ Tipo de consulta no válido:', appointmentData.type);
      return {
        success: false,
        error: 'Tipo de consulta no válido: ' + appointmentData.type + '. Tipos disponibles: ' +
Object.keys(CONSULTATION_TYPES).join(', ')
      };
    }

    Logger.log('✅ Tipo de consulta válido:', consultation);

    // Acceso al calendario
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

    // Crear fechas y horas
    const startDateTime = new Date(appointmentData.date + 'T' + appointmentData.time + ':00');
    const endDateTime = new Date(startDateTime.getTime() + (consultation.duration * 60000));

    Logger.log('🕐 Fecha inicio:', startDateTime.toISOString());
    Logger.log('🕐 Fecha fin:', endDateTime.toISOString());

    // Crear título del evento
    const petName = appointmentData.pet?.name || 'Mascota sin nombre';
    const title = `${consultation.name} - ${petName}`;

    // Crear descripción detallada
    const tutorName = appointmentData.tutor?.name || 'No especificado';
    const tutorPhone = appointmentData.tutor?.phone || 'No especificado';
    const tutorEmail = appointmentData.tutor?.email || 'No especificado';
    const petSpecies = appointmentData.pet?.species || 'No especificado';
    const petAge = appointmentData.pet?.age || 'No especificado';

    const description = `
🐾 CITA VETERINARIA - SISTEMA WEB

📋 INFORMACIÓN DE LA CITA:
• Tipo: ${consultation.name}
• Duración: ${consultation.duration} minutos
• Fecha: ${startDateTime.toLocaleDateString('es-CL')}
• Hora: ${appointmentData.time}

👤 DATOS DEL TUTOR:
• Nombre: ${tutorName}
• Teléfono: ${tutorPhone}
• Email: ${tutorEmail}

🐕 DATOS DE LA MASCOTA:
• Nombre: ${petName}
• Especie: ${petSpecies}
• Edad: ${petAge}

⏰ SOLICITUD GENERADA:
${new Date().toLocaleString('es-CL', { timeZone: TIMEZONE })}

🌐 Generado automáticamente por el sistema de reservas
Veterinaria Tarapacá - Iquique, Chile
    `.trim();

    // Crear evento en el calendario
    Logger.log('🗓️ Creando evento en calendario...');
    const event = calendar.createEvent(title, startDateTime, endDateTime, {
      description: description,
      location: 'Clínica Veterinaria Tarapacá, Av. Salvador Allende #3638, Iquique'
    });

    const eventId = event.getId();
    Logger.log('✅ Evento creado exitosamente con ID:', eventId);

    return {
      success: true,
      eventId: eventId,
      message: 'Cita agendada exitosamente en Google Calendar',
      appointment: {
        title: title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: consultation.duration,
        calendarId: CALENDAR_ID,
        location: 'Clínica Veterinaria Tarapacá, Av. Salvador Allende #3638, Iquique'
      },
      patientInfo: {
        tutor: tutorName,
        pet: petName,
        type: consultation.name
      }
    };

  } catch (error) {
    Logger.log(`❌ Error creando cita: ${error.toString()}`);
    return {
      success: false,
      error: 'Error creando cita en calendario: ' + error.toString()
    };
  }
}

/**
 * Generar slots de tiempo disponibles
 */
function generateTimeSlots(startTime, endTime, duration) {
  try {
    Logger.log(`⏰ Generando slots: ${startTime} - ${endTime}, duración: ${duration}min`);

    const slots = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    let current = new Date(start);

    while (current < end) {
      // Verificar que el slot + duración no exceda el horario de cierre
      const slotEnd = new Date(current.getTime() + (duration * 60000));
      if (slotEnd <= end) {
        const timeString = Utilities.formatDate(current, TIMEZONE, 'HH:mm');
        slots.push(timeString);
      }

      // Avanzar al siguiente slot en intervalos de 30 minutos para mayor flexibilidad
      current = new Date(current.getTime() + (30 * 60000)); // Siempre avanzar 30 min
    }

    Logger.log(`✅ Generados ${slots.length} slots:`, slots);
    return slots;

  } catch (error) {
    Logger.log('❌ Error generando slots:', error.toString());
    return [];
  }
}

/**
 * Parsear string de tiempo a objeto Date
 */
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Filtrar slots disponibles verificando eventos existentes en el calendario
 */
function filterAvailableSlots(allSlots, existingEvents, targetDate, consultationDuration) {
  try {
    Logger.log('🔍 Filtrando slots disponibles...');
    Logger.log('Slots a verificar:', allSlots);
    Logger.log('Eventos existentes:', existingEvents.length);

    const availableSlots = [];

    for (const timeSlot of allSlots) {
      const slotTime = parseTimeForDate(timeSlot, targetDate);
      const slotEndTime = new Date(slotTime.getTime() + (consultationDuration * 60000));
      
      Logger.log(`Verificando slot: ${timeSlot} (${slotTime.toISOString()} - ${slotEndTime.toISOString()})`);

      let isAvailable = true;

      // Verificar si este slot se solapa con algún evento existente
      for (const event of existingEvents) {
        const eventStart = event.getStartTime();
        const eventEnd = event.getEndTime();

        Logger.log(`Comparando con evento: ${event.getTitle()} (${eventStart.toISOString()} - ${eventEnd.toISOString()})`);

        // Verificar solapamiento:
        // El slot está ocupado si:
        // - El slot comienza antes de que termine el evento Y
        // - El slot termina después de que comience el evento
        if (slotTime < eventEnd && slotEndTime > eventStart) {
          Logger.log(`❌ Slot ${timeSlot} se solapa con evento: ${event.getTitle()}`);
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        Logger.log(`✅ Slot ${timeSlot} está disponible`);
        availableSlots.push(timeSlot);
      }
    }

    Logger.log(`🎯 Slots finales disponibles: ${availableSlots.length}/${allSlots.length}`);
    return availableSlots;

  } catch (error) {
    Logger.log('❌ Error filtrando slots:', error.toString());
    // En caso de error, devolver todos los slots
    return allSlots;
  }
}

/**
 * Parsear tiempo para una fecha específica usando la zona horaria correcta
 */
function parseTimeForDate(timeString, targetDate) {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Parsear la fecha string correctamente
  let parsedDate;
  if (typeof targetDate === 'string') {
    // Si es string como "2025-08-13", parsearlo directamente
    parsedDate = new Date(targetDate + 'T00:00:00');
  } else {
    // Si es Date object, usarlo directamente
    parsedDate = new Date(targetDate);
  }
  
  // Crear la fecha con la hora específica manteniendo el día correcto
  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth();
  const day = parsedDate.getDate();
  
  // Crear la fecha con la hora específica
  const result = new Date(year, month, day, hours, minutes, 0, 0);
  
  Logger.log(`parseTimeForDate: ${timeString} en ${targetDate} = ${result.toISOString()} (local: ${Utilities.formatDate(result, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')})`);
  
  return result;
}

/**
 * FUNCIONES DE TESTING - Ejecutar para probar
 */

function testBasico() {
  Logger.log('🧪 === TEST BÁSICO INICIADO ===');

  // Test 1: Configuración
  Logger.log('📋 Configuración:');
  Logger.log('Calendar ID:', CALENDAR_ID);
  Logger.log('Consultation Types:', CONSULTATION_TYPES);

  // Test 2: Verificar disponibilidad
  Logger.log('📅 Test checkAvailability...');
  const availability = checkAvailability('2025-01-20', 'general');
  Logger.log('Resultado disponibilidad:', availability);

  // Test 3: Acceso al calendario
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    Logger.log('✅ Acceso al calendario exitoso:', calendar.getName());
  } catch (calError) {
    Logger.log('❌ Error accediendo al calendario:', calError.toString());
  }

  Logger.log('🧪 === TEST BÁSICO COMPLETADO ===');
  return availability;
}

function debugCreateAppointment() {
  Logger.log('=== DEBUG CREATE APPOINTMENT ===');

  // Test 1: Verificar CONSULTATION_TYPES
  Logger.log('CONSULTATION_TYPES:', CONSULTATION_TYPES);
  Logger.log('Claves disponibles:', Object.keys(CONSULTATION_TYPES));
  Logger.log('Tipo general existe?', CONSULTATION_TYPES.hasOwnProperty('general'));
  Logger.log('Contenido de general:', CONSULTATION_TYPES['general']);

  // Test 2: Simular creación de cita
  const testAppointmentData = {
    type: 'general',
    date: '2025-01-15',
    time: '10:30',
    tutor: {
      name: 'Test',
      phone: '123',
      email: 'test@test.com'
    },
    pet: {
      name: 'Test',
      species: 'perro',
      age: '3'
    }
  };

  Logger.log('Datos de prueba:', testAppointmentData);

  // Test 3: Intentar crear cita
  const resultado = createAppointment(testAppointmentData);
  Logger.log('Resultado:', resultado);

  return resultado;
}

function testAvailabilityWithExistingEvents() {
  Logger.log('🧪 === TEST DISPONIBILIDAD CON EVENTOS EXISTENTES ===');
  
  // Test con una fecha que puede tener eventos
  const testDate = '2025-08-13'; // Ajustar según necesidad
  const consultationType = 'general';
  
  Logger.log(`Probando disponibilidad para: ${testDate}, tipo: ${consultationType}`);
  
  const result = checkAvailability(testDate, consultationType);
  Logger.log('Resultado completo:', result);
  
  if (result.success) {
    Logger.log(`✅ Total slots posibles: ${result.totalSlots || 'No reportado'}`);
    Logger.log(`❌ Slots ocupados: ${result.occupiedSlots || 'No reportado'}`);
    Logger.log(`✅ Slots disponibles: ${result.availableSlots.length}`);
    Logger.log('Horarios disponibles:', result.availableSlots);
  } else {
    Logger.log('❌ Error:', result.error);
  }
  
  return result;
}

function testWithTemporaryEvent() {
  Logger.log('🧪 === TEST CON EVENTO TEMPORAL ===');
  
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  const testDate = '2025-08-13';
  
  // Crear evento temporal usando parseTimeForDate para consistencia
  const eventStart = parseTimeForDate('11:00', testDate);
  const eventEnd = parseTimeForDate('11:30', testDate);
  
  Logger.log(`Fecha de prueba: ${testDate}`);
  Logger.log(`Creando evento temporal: ${eventStart.toISOString()} - ${eventEnd.toISOString()}`);
  Logger.log(`Hora local: ${Utilities.formatDate(eventStart, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')} - ${Utilities.formatDate(eventEnd, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}`);
  
  const tempEvent = calendar.createEvent('TEST - Cita Temporal', eventStart, eventEnd, {
    description: 'Evento temporal para testing - ELIMINAR'
  });
  
  Logger.log(`✅ Evento temporal creado: ${tempEvent.getId()}`);
  
  // Verificar que el evento existe antes de probar
  const startOfDay = new Date(testDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(testDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const eventsOnDate = calendar.getEvents(startOfDay, endOfDay);
  Logger.log(`🔍 Verificando eventos en ${testDate}: encontrados ${eventsOnDate.length}`);
  
  eventsOnDate.forEach((event, index) => {
    Logger.log(`Evento ${index + 1}: ${event.getTitle()} (${event.getStartTime().toISOString()} - ${event.getEndTime().toISOString()})`);
  });
  
  // Probar disponibilidad
  const result = checkAvailability(testDate, 'general');
  
  Logger.log('Resultado con evento temporal:', result);
  Logger.log(`Slots disponibles: ${result.availableSlots.length}/${result.totalSlots}`);
  Logger.log('Horarios disponibles:', result.availableSlots);
  Logger.log('¿Falta las 11:00?', !result.availableSlots.includes('11:00'));
  
  // Limpiar - eliminar evento temporal
  tempEvent.deleteEvent();
  Logger.log('🗑️ Evento temporal eliminado');
  
  return result;
}

function testMondayIssue() {
  Logger.log('🧪 === TEST ESPECÍFICO PARA LUNES ===');
  
  // Probar con el 18 de agosto de 2025 (lunes)
  const mondayDate = '2025-08-18';
  
  Logger.log(`Probando fecha: ${mondayDate}`);
  
  // Test manual del parsing de fecha
  const [year, month, day] = mondayDate.split('-').map(Number);
  const testDate = new Date(year, month - 1, day);
  const dayName = Utilities.formatDate(testDate, TIMEZONE, 'EEEE').toUpperCase();
  
  Logger.log(`Fecha parseada manualmente: ${testDate.toISOString()}`);
  Logger.log(`Día detectado: ${dayName}`);
  Logger.log(`¿Es MONDAY?: ${dayName === 'MONDAY'}`);
  Logger.log(`Configuración para MONDAY:`, CLINIC_HOURS['MONDAY']);
  
  // Probar checkAvailability
  const result = checkAvailability(mondayDate, 'general');
  Logger.log('Resultado para lunes:', result);
  
  return result;
}

function testEndocrinologySlots() {
  Logger.log('🧪 === TEST ENDOCRINOLOGÍA FLEXIBILIDAD ===');
  
  const testDate = '2025-08-19'; // Martes
  
  // Test 1: Verificar slots para endocrinología
  Logger.log('1. Probando disponibilidad para endocrinología...');
  const endoResult = checkAvailability(testDate, 'endocrinologia');
  Logger.log('Slots endocrinología:', endoResult.availableSlots);
  
  // Test 2: Verificar slots para general 
  Logger.log('2. Probando disponibilidad para general...');
  const generalResult = checkAvailability(testDate, 'general');
  Logger.log('Slots general:', generalResult.availableSlots);
  
  Logger.log('🎯 Comparación:');
  Logger.log(`Endocrinología: ${endoResult.availableSlots.length} slots`);
  Logger.log(`General: ${generalResult.availableSlots.length} slots`);
  Logger.log('¿Tienen la misma cantidad?', endoResult.availableSlots.length === generalResult.availableSlots.length);
  
  return { endocrinologia: endoResult, general: generalResult };
}