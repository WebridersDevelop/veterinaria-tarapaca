# Apps Script Debug Logs - Veterinaria Tarapacá

## Instrucciones para el usuario

Para ayudarte a debuggear problemas con el sistema de citas, puedes copiar y pegar los logs de Google Apps Script aquí.

### Cómo obtener los logs:

1. Ve a [Google Apps Script](https://script.google.com/)
2. Abre tu proyecto de Veterinaria Tarapacá  
3. Ve a **Executions** (Ejecuciones) en el menú lateral
4. Haz clic en una ejecución reciente para ver los logs
5. Copia y pega los logs completos abajo

### Formato recomendado:

```
## [FECHA/HORA] - Descripción del problema

### Logs de Google Apps Script:
```
[PEGAR LOGS AQUÍ]
```

### Contexto adicional:
- Fecha seleccionada: 
- Tipo de consulta:
- Hora esperada:
- Comportamiento observado:
- Comportamiento esperado:
```

---

## Logs de Debug

### Ejemplo de formato:
```
## [2025-08-12 15:30] - Horarios ocupados no se filtran

### Logs de Google Apps Script:
📨 GET Request recibido
🎯 Acción solicitada: checkAvailability
🔍 Verificando disponibilidad: fecha="2025-08-13", tipo="general"
📅 Día de la semana: TUESDAY
🕐 Slots generados: 17 horarios
Todos los horarios: ["10:30","11:00","11:30"...]
📋 Eventos existentes: 2
✅ Slots disponibles: 15 horarios
```

### Contexto adicional:
- Fecha seleccionada: 2025-08-13
- Tipo de consulta: general  
- Hora esperada: Debería faltar 11:00 si está ocupada
- Comportamiento observado: Muestra todas las horas
- Comportamiento esperado: No mostrar horas ocupadas

---

**Pega tus logs aquí abajo:**
1:17:33	Aviso	Se ha iniciado la ejecución
1:17:32	Información	🧪 === TEST CON EVENTO TEMPORAL ===
1:17:32	Información	parseTimeForDate: 11:00 en 2025-08-13 = 2025-08-13T15:00:00.000Z (local: 2025-08-13 11:00:00)
1:17:32	Información	parseTimeForDate: 11:30 en 2025-08-13 = 2025-08-13T15:30:00.000Z (local: 2025-08-13 11:30:00)
1:17:32	Información	Fecha de prueba: 2025-08-13
1:17:32	Información	Creando evento temporal: 2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z
1:17:32	Información	Hora local: 2025-08-13 11:00:00 - 2025-08-13 11:30:00
1:17:33	Información	✅ Evento temporal creado: jje076hhp2j3o07q58jk2ift3k@google.com
1:17:33	Información	🔍 Verificando eventos en 2025-08-13: encontrados 0
1:17:33	Información	🔍 Verificando disponibilidad: fecha="2025-08-13", tipo="general"
1:17:33	Información	📅 Día de la semana:
1:17:33	Información	⏰ Generando slots: 10:30 - 19:00, duración: 30min
1:17:33	Información	✅ Generados 17 slots:
1:17:33	Información	🕐 Slots generados: 17 horarios
1:17:33	Información	Todos los horarios:
1:17:33	Información	🗓️ Buscando eventos entre: 2025-08-13T04:00:00.000Z y 2025-08-14T03:59:59.000Z
1:17:33	Información	🗓️ Fecha original: 2025-08-13, Date object: 2025-08-13T00:00:00.000Z
1:17:33	Información	📋 Eventos existentes: 2
1:17:33	Información	🔍 Filtrando slots disponibles...
1:17:33	Información	Slots a verificar:
1:17:33	Información	Eventos existentes:
1:17:33	Información	parseTimeForDate: 10:30 en 2025-08-13 = 2025-08-13T14:30:00.000Z (local: 2025-08-13 10:30:00)
1:17:33	Información	Verificando slot: 10:30 (2025-08-13T14:30:00.000Z - 2025-08-13T15:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 10:30 está disponible
1:17:33	Información	parseTimeForDate: 11:00 en 2025-08-13 = 2025-08-13T15:00:00.000Z (local: 2025-08-13 11:00:00)
1:17:33	Información	Verificando slot: 11:00 (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	❌ Slot 11:00 se solapa con evento: TEST - Cita Temporal
1:17:33	Información	parseTimeForDate: 11:30 en 2025-08-13 = 2025-08-13T15:30:00.000Z (local: 2025-08-13 11:30:00)
1:17:33	Información	Verificando slot: 11:30 (2025-08-13T15:30:00.000Z - 2025-08-13T16:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 11:30 está disponible
1:17:33	Información	parseTimeForDate: 12:00 en 2025-08-13 = 2025-08-13T16:00:00.000Z (local: 2025-08-13 12:00:00)
1:17:33	Información	Verificando slot: 12:00 (2025-08-13T16:00:00.000Z - 2025-08-13T16:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 12:00 está disponible
1:17:33	Información	parseTimeForDate: 12:30 en 2025-08-13 = 2025-08-13T16:30:00.000Z (local: 2025-08-13 12:30:00)
1:17:33	Información	Verificando slot: 12:30 (2025-08-13T16:30:00.000Z - 2025-08-13T17:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 12:30 está disponible
1:17:33	Información	parseTimeForDate: 13:00 en 2025-08-13 = 2025-08-13T17:00:00.000Z (local: 2025-08-13 13:00:00)
1:17:33	Información	Verificando slot: 13:00 (2025-08-13T17:00:00.000Z - 2025-08-13T17:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 13:00 está disponible
1:17:33	Información	parseTimeForDate: 13:30 en 2025-08-13 = 2025-08-13T17:30:00.000Z (local: 2025-08-13 13:30:00)
1:17:33	Información	Verificando slot: 13:30 (2025-08-13T17:30:00.000Z - 2025-08-13T18:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 13:30 está disponible
1:17:33	Información	parseTimeForDate: 14:00 en 2025-08-13 = 2025-08-13T18:00:00.000Z (local: 2025-08-13 14:00:00)
1:17:33	Información	Verificando slot: 14:00 (2025-08-13T18:00:00.000Z - 2025-08-13T18:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 14:00 está disponible
1:17:33	Información	parseTimeForDate: 14:30 en 2025-08-13 = 2025-08-13T18:30:00.000Z (local: 2025-08-13 14:30:00)
1:17:33	Información	Verificando slot: 14:30 (2025-08-13T18:30:00.000Z - 2025-08-13T19:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 14:30 está disponible
1:17:33	Información	parseTimeForDate: 15:00 en 2025-08-13 = 2025-08-13T19:00:00.000Z (local: 2025-08-13 15:00:00)
1:17:33	Información	Verificando slot: 15:00 (2025-08-13T19:00:00.000Z - 2025-08-13T19:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 15:00 está disponible
1:17:33	Información	parseTimeForDate: 15:30 en 2025-08-13 = 2025-08-13T19:30:00.000Z (local: 2025-08-13 15:30:00)
1:17:33	Información	Verificando slot: 15:30 (2025-08-13T19:30:00.000Z - 2025-08-13T20:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 15:30 está disponible
1:17:33	Información	parseTimeForDate: 16:00 en 2025-08-13 = 2025-08-13T20:00:00.000Z (local: 2025-08-13 16:00:00)
1:17:33	Información	Verificando slot: 16:00 (2025-08-13T20:00:00.000Z - 2025-08-13T20:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 16:00 está disponible
1:17:33	Información	parseTimeForDate: 16:30 en 2025-08-13 = 2025-08-13T20:30:00.000Z (local: 2025-08-13 16:30:00)
1:17:33	Información	Verificando slot: 16:30 (2025-08-13T20:30:00.000Z - 2025-08-13T21:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 16:30 está disponible
1:17:33	Información	parseTimeForDate: 17:00 en 2025-08-13 = 2025-08-13T21:00:00.000Z (local: 2025-08-13 17:00:00)
1:17:33	Información	Verificando slot: 17:00 (2025-08-13T21:00:00.000Z - 2025-08-13T21:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 17:00 está disponible
1:17:33	Información	parseTimeForDate: 17:30 en 2025-08-13 = 2025-08-13T21:30:00.000Z (local: 2025-08-13 17:30:00)
1:17:33	Información	Verificando slot: 17:30 (2025-08-13T21:30:00.000Z - 2025-08-13T22:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 17:30 está disponible
1:17:33	Información	parseTimeForDate: 18:00 en 2025-08-13 = 2025-08-13T22:00:00.000Z (local: 2025-08-13 18:00:00)
1:17:33	Información	Verificando slot: 18:00 (2025-08-13T22:00:00.000Z - 2025-08-13T22:30:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	✅ Slot 18:00 está disponible
1:17:33	Información	parseTimeForDate: 18:30 en 2025-08-13 = 2025-08-13T22:30:00.000Z (local: 2025-08-13 18:30:00)
1:17:33	Información	Verificando slot: 18:30 (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	Comparando con evento: TEST - Cita Temporal (2025-08-13T15:00:00.000Z - 2025-08-13T15:30:00.000Z)
1:17:33	Información	Comparando con evento: CONSULTA OFTALMO CANINO REX (2025-08-13T22:30:00.000Z - 2025-08-13T23:00:00.000Z)
1:17:33	Información	❌ Slot 18:30 se solapa con evento: CONSULTA OFTALMO CANINO REX
1:17:33	Información	🎯 Slots finales disponibles: 15/17
1:17:33	Información	✅ Slots disponibles: 15 horarios
1:17:33	Información	Horarios disponibles:
1:17:33	Información	Resultado con evento temporal:
1:17:33	Información	Slots disponibles: 15/17
1:17:33	Información	Horarios disponibles:
1:17:33	Información	¿Falta las 11:00?
1:17:33	Información	🗑️ Evento temporal eliminado
1:17:34	Aviso	Se ha completado la ejecución