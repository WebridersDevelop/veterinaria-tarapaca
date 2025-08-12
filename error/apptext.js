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
      const date = new Date(dateString);
      const dayName = Utilities.formatDate(date, TIMEZONE, 'EEEE').toUpperCase();

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
      const slots = generateTimeSlots(daySchedule.start, daySchedule.end, duration);

      Logger.log(`✅ Slots generados: ${slots.length} horarios`);
      Logger.log('Horarios:', slots);

      return {
        success: true,
        availableSlots: slots,
        date: dateString,
        consultationType: consultationType,
        message: `${slots.length} horarios disponibles para ${consultation.name}`
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

        // Avanzar al siguiente slot (mismo intervalo que la duración)
        current = new Date(current.getTime() + (duration * 60000));
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

  function verificarLinea76() {
    Logger.log('=== VERIFICAR CÓDIGO ===');
    Logger.log('CONSULTATION_TYPES:', CONSULTATION_TYPES);
    Logger.log('Tiene general?', CONSULTATION_TYPES.hasOwnProperty('general'));
    if (CONSULTATION_TYPES['general']) {
      Logger.log('Duration de general:', CONSULTATION_TYPES['general'].duration);
    }
  }
 function testDirectCreateAppointment() {
    Logger.log('=== TEST DIRECTO ===');

    // Test 1: Crear datos de prueba directamente
    const testData = {
      type: 'general',
      date: '2025-01-15',
      time: '10:30',
      tutor: { name: 'Test', phone: '123', email: 'test@test.com' },
      pet: { name: 'Test', species: 'perro', age: '3' }
    };

    Logger.log('1. Datos de prueba:', testData);

    // Test 2: Ejecutar createAppointment directamente
    const resultado = createAppointment(testData);
    Logger.log('2. Resultado createAppointment:', resultado);

    // Test 3: Verificar consultation types
    Logger.log('3. Tipo buscado:', testData.type);
    Logger.log('4. CONSULTATION_TYPES completo:', CONSULTATION_TYPES);
    Logger.log('5. Consulta encontrada:', CONSULTATION_TYPES[testData.type]);

    if (CONSULTATION_TYPES[testData.type]) {
      Logger.log('6. Duration encontrada:', CONSULTATION_TYPES[testData.type].duration);
    } else {
      Logger.log('6. ERROR: No se encontró el tipo de consulta');
    }

    return resultado;
  }

  function testFromURL() {
    Logger.log('=== TEST DESDE URL ===');

    // Simular request desde web
    const mockE = {
      parameter: {
        action: 'createAppointment',
        appointmentData: '%7B%22type%22%3A%22general%22%7D'
      }
    };

    Logger.log('1. Mock parameter:', mockE.parameter);
    Logger.log('2. appointmentData raw:', mockE.parameter.appointmentData);

    try {
      const decoded = decodeURIComponent(mockE.parameter.appointmentData);
      Logger.log('3. Decoded:', decoded);

      const parsed = JSON.parse(decoded);
      Logger.log('4. Parsed:', parsed);
    } catch (error) {
      Logger.log('ERROR:', error.toString());
    }

    // Ejecutar doGet con este mock
    const result = doGet(mockE);
    Logger.log('5. Resultado doGet:', result);
  }


   function debugCompleto() {
    Logger.log('=== DEBUG COMPLETO ===');

    // Test 1: Verificar CONSULTATION_TYPES paso a paso
    Logger.log('1. CONSULTATION_TYPES existe?', typeof CONSULTATION_TYPES);
    Logger.log('2. CONSULTATION_TYPES valor:', CONSULTATION_TYPES);
    Logger.log('3. Keys de CONSULTATION_TYPES:', Object.keys(CONSULTATION_TYPES));

    // Test 2: Verificar acceso a 'general'
    Logger.log('4. Tipo general existe?', 'general' in CONSULTATION_TYPES);
    Logger.log('5. CONSULTATION_TYPES["general"]:', CONSULTATION_TYPES['general']);
    Logger.log('6. typeof CONSULTATION_TYPES["general"]:', typeof CONSULTATION_TYPES['general']);

    // Test 3: Verificar duration
    if (CONSULTATION_TYPES['general']) {
      Logger.log('7. general.duration existe?', 'duration' in CONSULTATION_TYPES['general']);
      Logger.log('8. general.duration valor:', CONSULTATION_TYPES['general'].duration);
      Logger.log('9. typeof duration:', typeof CONSULTATION_TYPES['general'].duration);
    }

    // Test 4: Simular el problema exacto
    Logger.log('10. === SIMULANDO EL ERROR ===');
    const testType = 'general';
    const consultation = CONSULTATION_TYPES[testType];
    Logger.log('11. testType:', testType);
    Logger.log('12. consultation:', consultation);

    if (!consultation) {
      Logger.log('13. ❌ consultation es undefined/null');
    } else {
      Logger.log('13. ✅ consultation existe');
      Logger.log('14. consultation.duration:', consultation.duration);
    }
  }
  