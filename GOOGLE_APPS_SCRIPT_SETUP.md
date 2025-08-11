# 🚀 Configuración Google Apps Script - Veterinaria Tarapacá

## Paso 1: Crear el Apps Script

1. **Ve a [Google Apps Script](https://script.google.com/)**
2. **Inicia sesión** con la cuenta `veterinariatarapaca@gmail.com`
3. **Haz clic en "Nuevo proyecto"**
4. **Cambia el nombre** a "Veterinaria Tarapacá - Calendar API"

## Paso 2: Copiar el código

1. **Borra** todo el código que aparece por defecto
2. **Copia** todo el contenido del archivo `google-apps-script/Code.gs`
3. **Pega** el código en el editor
4. **Guarda** el proyecto (Ctrl+S)

## Paso 3: Configurar permisos

1. **Haz clic en el icono de "Ejecutar"** (▶️) 
2. Te pedirá **autorización** - haz clic en "Revisar permisos"
3. **Selecciona** la cuenta `veterinariatarapaca@gmail.com`
4. **Haz clic en "Ir a Veterinaria Tarapacá - Calendar API (no seguro)"**
5. **Haz clic en "Permitir"**

## Paso 4: Desplegar como Web App

1. **Haz clic en "Implementar"** (Deploy) > **"Nueva implementación"**
2. **Selecciona tipo:** "Aplicación web"
3. **Configuración:**
   - **Ejecutar como:** "Yo (tu-email)"
   - **Acceso:** "Cualquier persona"
4. **Haz clic en "Implementar"**
5. **COPIA** la URL que aparece (algo como: `https://script.google.com/macros/s/ABC123.../exec`)

## Paso 5: Probar el deployment

1. **Abre** la URL copiada en una nueva pestaña
2. Deberías ver un JSON como:
```json
{
  "message": "API de Veterinaria Tarapacá funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## ⚠️ URL Importante

**GUARDA** la URL del Apps Script, la necesitaremos para conectar con tu sitio web en Vercel:

```
https://script.google.com/macros/s/TU_ID_UNICO_AQUI/exec
```

## 🧪 Testing Opcional

Para probar que todo funciona:

1. En el editor de Apps Script, **cambia** la función a `testAPI`
2. **Ejecuta** la función
3. **Ve a "Ejecuciones"** para ver los logs
4. Debería mostrar disponibilidad de horarios

## 🔧 Configuración del Calendar ID

El código ya está configurado para usar `veterinariatarapaca@gmail.com`, pero verifica que:

1. **El calendario esté accesible** para la cuenta
2. **Tengas permisos** para crear eventos
3. **El calendar ID** sea correcto en el código

## ✅ Próximos pasos

Una vez que tengas la **URL del Apps Script**, podremos:

1. **Conectar** tu sitio en Vercel con el Apps Script
2. **Probar** la verificación de disponibilidad real
3. **Crear** citas automáticamente en Google Calendar

---

**¿Algún problema en la configuración? Compárteme:**
- ✅ URL del Apps Script generada
- 🚨 Cualquier error que aparezca
- ❓ Dudas en algún paso