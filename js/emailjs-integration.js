// EmailJS Integration para Veterinaria Tarapacá
// Sistema de notificaciones automáticas - 100% gratuito

class EmailJSNotifier {
    constructor() {
        // Configuración EmailJS (se actualizará con credenciales reales)
        this.config = {
            publicKey: 'EMAILJS_PUBLIC_KEY_AQUI', // Tu Public Key de EmailJS
            serviceId: 'EMAILJS_SERVICE_ID_AQUI', // Tu Service ID 
            templateIdVeterinaria: 'template_veterinaria', // Template para la veterinaria
            templateIdCliente: 'template_cliente' // Template para el cliente
        };
        
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Cargar EmailJS script si no está disponible
            if (typeof emailjs === 'undefined') {
                await this.loadEmailJSScript();
            }
            
            // Inicializar EmailJS con la public key
            emailjs.init(this.config.publicKey);
            this.isInitialized = true;
            
            console.log('EmailJS inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar EmailJS:', error);
            throw error;
        }
    }
    
    loadEmailJSScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    async sendAppointmentNotifications(appointmentData) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        try {
            // Preparar datos para los templates
            const emailData = this.prepareEmailData(appointmentData);
            
            // Enviar notificación a la veterinaria
            const veterinariaResponse = await this.sendToVeterinaria(emailData);
            console.log('Email enviado a veterinaria:', veterinariaResponse);
            
            // Enviar confirmación al cliente
            const clienteResponse = await this.sendToCliente(emailData);
            console.log('Email enviado a cliente:', clienteResponse);
            
            return {
                success: true,
                veterinariaEmail: veterinariaResponse,
                clienteEmail: clienteResponse
            };
            
        } catch (error) {
            console.error('Error al enviar notificaciones:', error);
            throw error;
        }
    }
    
    prepareEmailData(appointmentData) {
        const consultationType = appointmentData.type === 'endocrinologia' ? 'Endocrinología' : 'Consulta General';
        const duration = appointmentData.type === 'endocrinologia' ? '60 minutos' : '30 minutos';
        
        const appointmentDate = new Date(appointmentData.date);
        const formattedDate = appointmentDate.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const appointmentDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`);
        const formattedDateTime = appointmentDateTime.toLocaleString('es-CL');
        
        return {
            // Datos del tutor
            tutor_nombre: appointmentData.tutor.name,
            tutor_telefono: appointmentData.tutor.phone,
            tutor_email: appointmentData.tutor.email,
            
            // Datos de la mascota
            mascota_nombre: appointmentData.pet.name,
            mascota_especie: appointmentData.pet.species,
            mascota_edad: appointmentData.pet.age,
            
            // Datos de la cita
            consulta_tipo: consultationType,
            consulta_duracion: duration,
            cita_fecha: formattedDate,
            cita_hora: appointmentData.time,
            cita_fecha_completa: formattedDateTime,
            
            // Datos de la veterinaria
            veterinaria_nombre: 'Clínica Veterinaria Tarapacá',
            veterinaria_direccion: 'Avenida Salvador Allende #3638, Iquique',
            veterinaria_telefono: '+56 9 1234 5678',
            veterinaria_email: 'veterinariatarapaca@gmail.com',
            
            // Fecha de creación
            fecha_solicitud: new Date().toLocaleString('es-CL')
        };
    }
    
    async sendToVeterinaria(emailData) {
        const templateParams = {
            to_email: 'veterinariatarapaca@gmail.com',
            to_name: 'Clínica Veterinaria Tarapacá',
            subject: `Nueva Cita Agendada - ${emailData.consulta_tipo}`,
            
            // Información de la cita
            ...emailData,
            
            // Template específico para veterinaria
            mensaje_tipo: 'nueva_cita_veterinaria'
        };
        
        return await emailjs.send(
            this.config.serviceId,
            this.config.templateIdVeterinaria,
            templateParams
        );
    }
    
    async sendToCliente(emailData) {
        const templateParams = {
            to_email: emailData.tutor_email,
            to_name: emailData.tutor_nombre,
            subject: `Confirmación de Cita - Veterinaria Tarapacá`,
            
            // Información de la cita
            ...emailData,
            
            // Template específico para cliente
            mensaje_tipo: 'confirmacion_cita_cliente',
            
            // Mensaje personalizado para el cliente
            mensaje_bienvenida: `Estimado/a ${emailData.tutor_nombre}, su cita ha sido agendada exitosamente.`,
            instrucciones: 'Por favor llegue 10 minutos antes de su cita. En caso de necesitar cancelar o reprogramar, contacte directamente a la clínica.',
            recordatorio: 'Recuerde traer la libreta de vacunas de su mascota si la tiene.'
        };
        
        return await emailjs.send(
            this.config.serviceId,
            this.config.templateIdCliente,
            templateParams
        );
    }
    
    // Método de prueba para verificar configuración
    async testConfiguration() {
        try {
            await this.init();
            
            const testData = {
                tutor: {
                    name: 'Cliente de Prueba',
                    email: 'prueba@ejemplo.com',
                    phone: '+56 9 8765 4321'
                },
                pet: {
                    name: 'Mascota de Prueba',
                    species: 'Perro',
                    age: '3 años'
                },
                type: 'general',
                date: '2024-01-15',
                time: '14:30'
            };
            
            console.log('Enviando email de prueba...');
            const result = await this.sendAppointmentNotifications(testData);
            console.log('Prueba exitosa:', result);
            
            return result;
            
        } catch (error) {
            console.error('Error en prueba de EmailJS:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.EmailJSNotifier = EmailJSNotifier;