# Cuestionario "Seguridad de los datos" de Play Console

En Play Console → Política de la app → **Seguridad de los datos**.
Te aparece un wizard largo con preguntas. Acá tienes las respuestas exactas para Ewood.

---

## Pregunta 1: ¿Tu app recopila o comparte algún tipo de datos del usuario?

**Sí** ✓

---

## Pregunta 2: ¿Todos los datos del usuario que recopila tu app están cifrados durante la transferencia?

**Sí** ✓ (Backend usa HTTPS y WSS)

---

## Pregunta 3: ¿Brindas a los usuarios un método para solicitar que se eliminen sus datos?

**Sí** ✓
- Método: la app tiene un botón "Eliminar Cuenta" en Perfil que borra hard-delete
  el user + su wallet + transactions + trips en la DB.
- Método secundario: contacto por email `contacto@exwood.cl`
- URL de la política: `https://api.exwood.dev/privacy`

---

## Datos recopilados (marcar uno por uno)

Cuando te muestra la lista, marcar **solo estos** y para cada uno indicar para qué se usan.

### ✅ Información personal

| Dato | Marcar | Recopilado / Compartido | Obligatorio o Opcional | Propósito |
|------|--------|--------------------------|------------------------|-----------|
| Nombre | ✓ Recopilado | Obligatorio | Funcionalidad de la app, Administración de cuenta |
| Dirección de correo electrónico | ✓ Recopilado | Obligatorio | Funcionalidad de la app, Administración de cuenta, Comunicación |

### ✅ Información financiera

| Dato | Marcar | Recopilado / Compartido | Obligatorio | Propósito |
|------|--------|--------------------------|-------------|-----------|
| Historial de compras | ✓ Recopilado | Obligatorio | Funcionalidad de la app |

⚠ **NO marcar** "Datos de pago" (tarjetas, etc.) — eso lo maneja MercadoPago directamente, no tu app.

### ✅ Ubicación

| Dato | Marcar | Recopilado / Compartido | Obligatorio | Propósito |
|------|--------|--------------------------|-------------|-----------|
| Ubicación aproximada | ✓ Recopilado | Obligatorio | Funcionalidad de la app |
| Ubicación precisa | ✓ Recopilado | Obligatorio | Funcionalidad de la app |

### ✅ Identificadores de la app

| Dato | Marcar | Recopilado / Compartido | Obligatorio | Propósito |
|------|--------|--------------------------|-------------|-----------|
| ID de usuario | ✓ Recopilado | Obligatorio | Funcionalidad de la app, Administración de cuenta |

### ❌ NO marcar (no aplica a Ewood)

- Información financiera → "Datos de pago" (los maneja MercadoPago, no tu app)
- Datos de salud y estado físico
- Mensajes, correos electrónicos, SMS, fotos, videos, audio, archivos
- Calendario
- Contactos
- Información personal sensible
- Datos de seguimiento publicitario
- Diagnósticos / información del dispositivo (solo si después agregás Crashlytics o analytics)

---

## ¿Datos compartidos con terceros?

**Sí** ✓ — para los siguientes datos compartidos con **MercadoPago**:
- Nombre
- Email
- Historial de compras

Propósito de compartir: **Funcionalidad de la app** (procesamiento de pagos).

---

## Resumen para que te quede claro

Marcamos esto porque:
- Nombre + email → cuenta de usuario
- Historial de compras → recargas y viajes en su billetera
- Ubicación → el mapa y los viajes
- ID de usuario → identificador interno

NO marcamos datos de tarjeta porque MercadoPago los procesa por nosotros (tokenización).
