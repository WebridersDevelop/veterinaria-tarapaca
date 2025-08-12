// Simple Booking System para Veterinaria Tarapacá
// Compatible con Vercel - Frontend Only

class SimpleBookingSystem {
    constructor() {
        this.selectedType = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentMonth = new Date();
        this.appsScriptAPI = new AppsScriptAPI();
        
        // Configuración de horarios
        this.config = {
            endocrinologia: {
                duracion: 60, // minutos
                color: '#10b981',
                nombre: 'Consulta Endocrinología',
                descripcion: 'Especialidad • 60 minutos'
            },
            general: {
                duracion: 30, // minutos  
                color: '#3b82f6',
                nombre: 'Consulta General',
                descripcion: 'Medicina General • 30 minutos'
            }
        };
        
        // Horarios de la clínica
        this.horarios = {
            lunes: { inicio: '10:30', fin: '19:00' },
            martes: { inicio: '10:30', fin: '19:00' },
            miercoles: { inicio: '10:30', fin: '19:00' },
            jueves: { inicio: '10:30', fin: '19:00' },
            viernes: { inicio: '10:30', fin: '19:00' },
            sabado: { inicio: '10:30', fin: '14:00' },
            domingo: null // Cerrado
        };
        
        this.init();
    }
    
    init() {
        // Form submission
        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Inicializar botones de navegación
        this.updateNavigationButtons(1);
    }
    
    selectConsultationType(type) {
        this.selectedType = type;
        console.log(`Tipo seleccionado: ${type}`);
        
        // Actualizar selección visual
        document.querySelectorAll('.consultation-card').forEach(card => {
            card.classList.remove('border-vet-orange', 'bg-orange-50');
            card.classList.add('border-gray-200');
        });
        
        const selectedCard = document.querySelector(`[onclick*="${type}"]`);
        if (selectedCard) {
            selectedCard.classList.add('border-vet-orange', 'bg-orange-50');
            selectedCard.classList.remove('border-gray-200');
        }
        
        // Avanzar al siguiente paso
        setTimeout(() => this.nextStep(3), 500);
    }
    
    nextStep(step) {
        if (step === 2) {
            // Validar paso 1
            if (!this.validateStep1()) {
                return;
            }
        }
        
        // Ocultar paso actual
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Mostrar paso destino
        const targetStep = document.getElementById(`form-step-${step}`);
        if (targetStep) {
            targetStep.classList.remove('hidden');
            
            // Si es paso 3, generar calendario
            if (step === 3) {
                this.generateCalendar();
            }
        }
        
        // Actualizar indicador de progreso
        this.updateProgressBar(step);
        
        // Actualizar botones de navegación
        this.updateNavigationButtons(step);
        
        // Scroll suave
        setTimeout(() => {
            const bookingSection = document.getElementById('agenda');
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
    
    prevStep(step) {
        // Ocultar paso actual
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Mostrar paso anterior
        const targetStep = document.getElementById(`form-step-${step}`);
        if (targetStep) {
            targetStep.classList.remove('hidden');
        }
        
        // Actualizar indicador de progreso
        this.updateProgressBar(step);
        
        // Actualizar botones de navegación
        this.updateNavigationButtons(step);
        
        // Ocultar resumen si volvemos a editar datos
        if (step === 1) {
            document.getElementById('appointment-summary').classList.add('hidden');
        }
        
        // Scroll suave
        setTimeout(() => {
            const bookingSection = document.getElementById('agenda');
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
    
    goBackStep() {
        // Determinar el paso actual y retroceder
        if (!document.getElementById('form-step-1').classList.contains('hidden')) {
            // Estamos en paso 1, no se puede retroceder más
            return;
        } else if (!document.getElementById('form-step-2').classList.contains('hidden')) {
            // Estamos en paso 2, volver al paso 1
            this.prevStep(1);
            this.updateNavigationButtons(1);
        } else if (!document.getElementById('form-step-3').classList.contains('hidden')) {
            // Estamos en paso 3, volver al paso 2
            this.prevStep(2);
            this.updateNavigationButtons(2);
        }
    }
    
    goNextStep() {
        // Determinar el paso actual y avanzar
        if (!document.getElementById('form-step-1').classList.contains('hidden')) {
            // Estamos en paso 1, validar y avanzar al paso 2
            if (this.validateStep1()) {
                this.nextStep(2);
            }
        } else if (!document.getElementById('form-step-2').classList.contains('hidden')) {
            // Estamos en paso 2, pero necesitamos seleccionar tipo de consulta
            // El avance se maneja automáticamente en selectConsultationType()
            return;
        } else if (!document.getElementById('form-step-3').classList.contains('hidden')) {
            // Estamos en paso 3, no hay paso siguiente (se maneja con submit)
            return;
        }
    }
    
    updateNavigationButtons(step) {
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        const submitButton = document.getElementById('submit-button');
        
        // Configurar botones según el paso
        if (step === 1) {
            prevButton.classList.add('hidden');
            nextButton.classList.remove('hidden');
            submitButton.classList.add('hidden');
            nextButton.textContent = 'CONTINUAR';
            nextButton.classList.remove('cursor-not-allowed', 'bg-gray-400');
            nextButton.classList.add('bg-vet-orange', 'hover:bg-vet-brown');
        } else if (step === 2) {
            prevButton.classList.remove('hidden');
            nextButton.classList.add('hidden');
            submitButton.classList.add('hidden');
        } else if (step === 3) {
            prevButton.classList.remove('hidden');
            nextButton.classList.add('hidden');
            // submitButton visibility se maneja cuando se selecciona hora
            submitButton.classList.add('hidden');
        }
    }
    
    validateStep1() {
        const tutorName = document.getElementById('tutor-name').value.trim();
        const tutorPhone = document.getElementById('tutor-phone').value.trim();
        const tutorEmail = document.getElementById('tutor-email').value.trim();
        const petName = document.getElementById('pet-name').value.trim();
        const petSpecies = document.getElementById('pet-species').value;
        const petAge = document.getElementById('pet-age').value.trim();
        
        if (!tutorName || !tutorPhone || !tutorEmail || !petName || !petSpecies || !petAge) {
            alert('Por favor complete todos los campos obligatorios.');
            return false;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(tutorEmail)) {
            alert('Por favor ingrese un email válido.');
            return false;
        }
        
        return true;
    }
    
    updateProgressBar(currentStep) {
        // Actualizar círculos del progreso
        for (let i = 1; i <= 3; i++) {
            const circle = document.querySelector(`.step-circle[data-step="${i}"]`);
            if (circle) {
                if (i < currentStep) {
                    circle.classList.add('completed');
                    circle.classList.remove('active');
                } else if (i === currentStep) {
                    circle.classList.add('active');
                    circle.classList.remove('completed');
                } else {
                    circle.classList.remove('active', 'completed');
                }
            }
        }
        
        // Actualizar título del paso
        const stepTitle = document.getElementById('step-title');
        if (stepTitle) {
            const titles = {
                1: 'Paso 1: Datos del tutor y mascota',
                2: 'Paso 2: Selecciona tipo de consulta',
                3: 'Paso 3: Disponibilidad de horarios'
            };
            stepTitle.textContent = titles[currentStep] || '';
        }
    }
    
    generateCalendar() {
        const container = document.getElementById('calendar-container');
        if (!container) return;
        
        const today = new Date();
        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        let calendarHTML = `
            <div class="booking-calendar">
                <div class="flex items-center justify-between mb-6">
                    <button onclick="bookingSystem.changeMonth(-1)" class="p-2 text-vet-brown hover:bg-vet-orange/10 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <h3 class="text-xl font-bold text-vet-brown">
                        ${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}
                    </h3>
                    <button onclick="bookingSystem.changeMonth(1)" class="p-2 text-vet-brown hover:bg-vet-orange/10 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="grid grid-cols-7 gap-2 mb-4">
                    ${dayNames.map(day => `<div class="text-center text-sm font-semibold text-gray-500 py-2">${day}</div>`).join('')}
                </div>
                
                <div class="grid grid-cols-7 gap-2">
        `;
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === this.currentMonth.getMonth();
            const isPast = new Date(currentDate).setHours(0,0,0,0) < new Date(today).setHours(0,0,0,0);
            const isToday = currentDate.toDateString() === today.toDateString();
            const isAvailable = this.isDateAvailable(currentDate);
            
            let dayClass = 'p-3 text-center rounded-lg cursor-pointer transition-all duration-200 ';
            
            if (!isCurrentMonth) {
                dayClass += 'text-gray-300';
            } else if (isPast) {
                dayClass += 'text-gray-400 cursor-not-allowed';
            } else if (isToday) {
                dayClass += 'bg-vet-orange/20 text-vet-brown font-semibold';
            } else if (isAvailable) {
                dayClass += 'text-vet-brown hover:bg-vet-orange/10 hover:scale-105';
            } else {
                dayClass += 'text-gray-400 cursor-not-allowed';
            }
            
            const clickHandler = isAvailable && !isPast && isCurrentMonth 
                ? `onclick="bookingSystem.selectDate('${currentDate.toISOString().split('T')[0]}')"` 
                : '';
            
            calendarHTML += `
                <div class="${dayClass}" ${clickHandler}>
                    ${currentDate.getDate()}
                </div>
            `;
        }
        
        calendarHTML += `
                </div>
            </div>
        `;
        
        container.innerHTML = calendarHTML;
        
        // Exponer función para cambio de mes
        window.bookingSystem = this;
    }
    
    changeMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.generateCalendar();
    }
    
    isDateAvailable(date) {
        // Crear fecha correctamente para evitar problemas de timezone
        let actualDate;
        if (typeof date === 'string') {
            // Si es string "YYYY-MM-DD", parsearlo correctamente
            const [year, month, day] = date.split('-').map(Number);
            actualDate = new Date(year, month - 1, day);
        } else {
            actualDate = date;
        }
        
        const dayName = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][actualDate.getDay()];
        return this.horarios[dayName] !== null;
    }
    
    async selectDate(dateString) {
        this.selectedDate = dateString;
        
        // Crear fecha correctamente para evitar problemas de timezone
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        console.log(`Fecha seleccionada: ${dateString}`);
        
        // Actualizar visual del calendario
        this.updateCalendarSelection();
        
        // Mostrar loading mientras verifica disponibilidad
        this.showTimeSlotLoading();
        
        try {
            // Obtener horarios disponibles desde Google Apps Script
            const availableSlots = await this.appsScriptAPI.checkAvailability(dateString, this.selectedType);
            this.displayAvailableSlots(availableSlots);
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            // Usar horarios estáticos como respaldo
            this.generateTimeSlotsStatic(date);
        }
        
        // Mostrar sección de horarios
        this.showTimeSlotsSection();
    }
    
    updateCalendarSelection() {
        // Quitar selección previa
        document.querySelectorAll('.booking-calendar .bg-vet-orange').forEach(el => {
            el.classList.remove('bg-vet-orange', 'text-white');
            el.classList.add('hover:bg-vet-orange/10');
        });
        
        // Agregar selección actual
        const selectedElements = document.querySelectorAll('.booking-calendar div[onclick*="' + this.selectedDate + '"]');
        selectedElements.forEach(el => {
            el.classList.add('bg-vet-orange', 'text-white');
            el.classList.remove('hover:bg-vet-orange/10');
        });
    }
    
    showTimeSlotLoading() {
        const container = document.getElementById('available-times');
        if (container) {
            container.innerHTML = `
                <div class="col-span-4 text-center py-8 text-gray-500">
                    <div class="animate-spin w-8 h-8 border-4 border-vet-orange border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Verificando disponibilidad...</p>
                </div>
            `;
        }
    }
    
    displayAvailableSlots(slots) {
        const container = document.getElementById('available-times');
        if (!container) return;
        
        if (slots.length === 0) {
            container.innerHTML = `
                <div class="col-span-4 text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <p>No hay horarios disponibles para esta fecha</p>
                    <p class="text-sm mt-2">Selecciona otra fecha o contacta directamente</p>
                </div>
            `;
            return;
        }
        
        let slotsHTML = '';
        slots.forEach(time => {
            slotsHTML += `
                <button onclick="bookingSystem.selectTime('${time}')" 
                        class="time-slot p-3 text-center border-2 border-gray-200 rounded-xl hover:border-vet-orange hover:bg-orange-50 transition-all duration-200 text-gray-700 font-medium">
                    ${time}
                </button>
            `;
        });
        
        container.innerHTML = slotsHTML;
    }
    
    generateTimeSlotsStatic(date) {
        const dayName = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][date.getDay()];
        const horario = this.horarios[dayName];
        if (!horario) {
            this.displayAvailableSlots([]);
            return;
        }
        
        const slots = this.calculateTimeSlots(horario.inicio, horario.fin);
        this.displayAvailableSlots(slots);
    }
    
    showTimeSlotsSection() {
        const timeSlotsContainer = document.getElementById('time-selection');
        const noDateContainer = document.getElementById('no-date-selected');
        
        if (timeSlotsContainer && noDateContainer) {
            timeSlotsContainer.classList.remove('hidden');
            noDateContainer.classList.add('hidden');
        }
        
        // Actualizar información de la consulta
        this.updateConsultationInfo();
    }
    
    updateConsultationInfo() {
        const config = this.config[this.selectedType];
        
        // Corregir el parsing de fecha para evitar problemas de timezone
        const dateString = this.selectedDate; // formato: "YYYY-MM-DD"
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month es 0-indexed
        
        const formattedDate = date.toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        
        document.getElementById('selected-consultation-type').textContent = config.nombre;
        document.getElementById('selected-duration').textContent = `${config.duracion} minutos`;
        document.getElementById('selected-date').textContent = formattedDate;
    }
    
    calculateTimeSlots(inicio, fin) {
        const slots = [];
        const startTime = this.parseTime(inicio);
        const endTime = this.parseTime(fin);
        const duration = this.config[this.selectedType].duracion;
        
        // Para filtrar horas pasadas si es el día de hoy
        const today = new Date();
        const selectedDate = new Date(this.selectedDate);
        const isToday = selectedDate.toDateString() === today.toDateString();
        
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const timeString = this.formatTime(currentTime);
            
            // Si es hoy, solo agregar horarios futuros (al menos 30 min de adelanto)
            if (isToday) {
                const slotTime = new Date(today);
                slotTime.setHours(...timeString.split(':').map(Number), 0, 0);
                const thirtyMinutesFromNow = new Date(today.getTime() + 30 * 60000);
                
                if (slotTime >= thirtyMinutesFromNow) {
                    slots.push(timeString);
                }
            } else {
                slots.push(timeString);
            }
            
            // Avanzar en intervalos de 30 minutos para mayor flexibilidad
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
        
        return slots;
    }
    
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    }
    
    selectTime(time) {
        this.selectedTime = time;
        console.log(`Hora seleccionada: ${time}`);
        
        // Actualizar visual de horarios
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('border-vet-orange', 'bg-vet-orange', 'text-white');
            slot.classList.add('border-gray-200', 'text-gray-700');
        });
        
        // Marcar selección actual
        const selectedSlot = document.querySelector(`button[onclick*="${time}"]`);
        if (selectedSlot) {
            selectedSlot.classList.add('border-vet-orange', 'bg-vet-orange', 'text-white');
            selectedSlot.classList.remove('border-gray-200', 'text-gray-700');
        }
        
        // Actualizar resumen
        this.updateSummary();
        
        // Mostrar resumen de cita
        this.showAppointmentSummary();
        
        // HABILITAR EL BOTÓN FINAL
        this.enableFinalButton();
    }
    
    showAppointmentSummary() {
        const summaryContainer = document.getElementById('appointment-summary');
        if (summaryContainer) {
            summaryContainer.classList.remove('hidden');
            
            // Actualizar datos del resumen
            const tutorName = document.getElementById('tutor-name').value;
            const petName = document.getElementById('pet-name').value;
            const petSpecies = document.getElementById('pet-species').value;
            
            document.getElementById('summary-tutor').textContent = tutorName;
            document.getElementById('summary-pet').textContent = petName;
            document.getElementById('summary-species').textContent = petSpecies;
        }
    }
    
    enableFinalButton() {
        // Ocultar botón "CONTINUAR" gris
        const nextButton = document.getElementById('next-button');
        if (nextButton) {
            nextButton.classList.add('hidden');
        }
        
        // Mostrar botón "CONFIRMAR CITA" activo
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.classList.remove('hidden');
        }
        
        console.log('✅ Botón final habilitado');
    }
    
    showForm() {
        const formContainer = document.getElementById('appointment-form');
        if (formContainer) {
            formContainer.classList.remove('hidden');
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    updateSummary() {
        const config = this.config[this.selectedType];
        const date = new Date(this.selectedDate);
        const formattedDate = date.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Verificar que los elementos existan antes de actualizar
        const summaryType = document.getElementById('summary-type');
        const summaryDate = document.getElementById('summary-date');
        const summaryTime = document.getElementById('summary-time');
        const summaryDuration = document.getElementById('summary-duration');
        
        if (summaryType) summaryType.textContent = config.nombre;
        if (summaryDate) summaryDate.textContent = formattedDate;
        if (summaryTime) summaryTime.textContent = this.selectedTime;
        if (summaryDuration) summaryDuration.textContent = `${config.duracion} minutos`;
        
        console.log('📋 Resumen actualizado:', {
            type: config.nombre,
            date: formattedDate,
            time: this.selectedTime
        });
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const appointmentData = {
            type: this.selectedType,
            date: this.selectedDate,
            time: this.selectedTime,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            pet_name: formData.get('pet_name'),
            reason: formData.get('reason')
        };
        
        console.log('Datos de la cita:', appointmentData);
        
        // Mostrar loading
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Procesando...';
        submitButton.disabled = true;
        
        try {
            // Recopilar datos de todos los pasos
            const tutorData = {
                name: document.getElementById('tutor-name').value,
                phone: document.getElementById('tutor-phone').value,
                email: document.getElementById('tutor-email').value
            };
            
            const petData = {
                name: document.getElementById('pet-name').value,
                species: document.getElementById('pet-species').value,
                age: document.getElementById('pet-age').value
            };
            
            const completeData = {
                ...appointmentData,
                tutor: tutorData,
                pet: petData
            };
            
            // Aquí se integrará con Google Calendar y EmailJS
            await this.processAppointment(completeData);
            
            // Éxito
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Error al procesar cita:', error);
            alert('Error al agendar la cita. Por favor intenta nuevamente.');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    async processAppointment(data) {
        try {
            // Crear la cita en Google Calendar usando Apps Script
            const result = await this.appsScriptAPI.createAppointment(data);
            console.log('Cita creada exitosamente:', result);
            
            return result;
        } catch (error) {
            console.error('Error al crear cita:', error);
            throw error;
        }
    }
    
    async submitAppointment() {
        console.log('🚀 Iniciando proceso de confirmación de cita');
        
        // Recopilar todos los datos
        const appointmentData = {
            type: this.selectedType,
            date: this.selectedDate,
            time: this.selectedTime,
            tutor: {
                name: document.getElementById('tutor-name').value,
                phone: document.getElementById('tutor-phone').value,
                email: document.getElementById('tutor-email').value
            },
            pet: {
                name: document.getElementById('pet-name').value,
                species: document.getElementById('pet-species').value,
                age: document.getElementById('pet-age').value
            }
        };
        
        console.log('Datos de la cita:', appointmentData);
        
        // Mostrar loading en el botón
        const submitButton = document.getElementById('submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creando cita...';
        submitButton.disabled = true;
        
        try {
            // Crear la cita usando Apps Script
            const result = await this.processAppointment(appointmentData);
            console.log('✅ Cita creada exitosamente:', result);
            
            // Mostrar mensaje de éxito
            this.showSuccessMessage(appointmentData);
            
        } catch (error) {
            console.error('❌ Error al crear cita:', error);
            alert('Error al agendar la cita. Por favor intenta nuevamente.');
            
            // Restaurar botón
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    showSuccessMessage(appointmentData) {
        // Mantener el foco en la sección de citas y mostrar mensaje de éxito
        const agendaSection = document.getElementById('agenda');
        const mainContainer = document.querySelector('#agenda .bg-white');
        
        console.log('🔍 Elementos encontrados:', {
            agendaSection: !!agendaSection,
            mainContainer: !!mainContainer,
            selector: '#agenda .bg-white'
        });
        
        if (mainContainer && agendaSection) {
            // Scroll a la sección de agenda
            agendaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Reemplazar contenido con mensaje de éxito
            mainContainer.innerHTML = `
                <div class="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
                    <div class="w-16 h-16 bg-vet-orange rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-vet-orange mb-4">🎉 ¡Cita Agendada Exitosamente!</h3>
                    <p class="text-gray-600 mb-6">Tu cita ha sido confirmada y agregada al calendario de la veterinaria.</p>
                    
                    <div class="bg-orange-50 rounded-xl p-6 mb-6 text-left">
                        <h4 class="font-bold text-vet-brown mb-4 text-center">📅 Detalles de tu Cita</h4>
                        <div class="grid md:grid-cols-2 gap-4 text-sm">
                            <div class="space-y-2">
                                <p><strong>Tutor:</strong> ${appointmentData.tutor.name}</p>
                                <p><strong>Mascota:</strong> ${appointmentData.pet.name}</p>
                                <p><strong>Especie:</strong> ${appointmentData.pet.species}</p>
                            </div>
                            <div class="space-y-2">
                                <p><strong>Tipo:</strong> ${this.config[appointmentData.type].nombre}</p>
                                <p><strong>Fecha:</strong> ${new Date(appointmentData.date).toLocaleDateString('es-CL')}</p>
                                <p><strong>Hora:</strong> ${appointmentData.time}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p class="text-yellow-800 text-sm">
                            <strong>📱 Próximos pasos:</strong><br>
                            • La cita ya está en nuestro calendario<br>
                            • Te llamaremos para confirmar detalles<br>
                            • Llega 10 minutos antes de tu cita
                        </p>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onclick="location.reload()" class="bg-vet-orange hover:bg-vet-brown text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300">
                            Agendar Otra Cita
                        </button>
                        <a href="tel:+56912345678" class="bg-vet-brown hover:bg-vet-orange text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300">
                            📞 Llamar a la Clínica
                        </a>
                    </div>
                </div>
            `;
        } else {
            console.error('❌ No se encontraron los elementos necesarios para mostrar el mensaje de éxito');
            console.error('agendaSection:', agendaSection);
            console.error('mainContainer:', mainContainer);
            
            // Fallback: mostrar alerta simple
            alert('✅ ¡Cita agendada exitosamente!\nRevisaremos tu solicitud y te contactaremos pronto.');
        }
    }
}

// Inicializar sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.bookingSystem = new SimpleBookingSystem();
});

// Exponer funciones globalmente para compatibilidad
window.nextStep = (step) => {
    if (window.bookingSystem) {
        window.bookingSystem.nextStep(step);
    }
};

window.prevStep = (step) => {
    if (window.bookingSystem) {
        window.bookingSystem.prevStep(step);
    }
};

window.selectConsultationType = (type) => {
    if (window.bookingSystem) {
        window.bookingSystem.selectConsultationType(type);
    }
};

window.submitAppointment = () => {
    if (window.bookingSystem) {
        window.bookingSystem.submitAppointment();
    }
};

// Función global para botón de retroceso
window.previousStep = () => {
    if (window.bookingSystem) {
        window.bookingSystem.goBackStep();
    }
};

// Función global para botón de avance
window.nextStep = () => {
    if (window.bookingSystem) {
        window.bookingSystem.goNextStep();
    }
};