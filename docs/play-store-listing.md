# Textos para la ficha de Google Play

Copia y pega los textos en las secciones correspondientes de Play Console.

---

## 1. Nombre de la app (máx 30 caracteres)

```
Ewood
```

---

## 2. Descripción corta (máx 80 caracteres)

```
Arrienda scooters eléctricos en tu ciudad. Paga por minuto y muévete fácil.
```

(78 caracteres — válido)

---

## 3. Descripción larga (máx 4000 caracteres)

```
Ewood es la app para moverte por la ciudad arrendando scooters eléctricos por minuto. Encuentra el scooter más cercano en el mapa, desbloquéalo desde tu celular y empieza a moverte. Sin estaciones fijas, sin trámites complicados.

Cómo funciona:
1. Regístrate con tu correo
2. Recarga saldo en tu billetera Ewood usando MercadoPago
3. Ubica un scooter disponible en el mapa
4. Desbloquéalo desde la app
5. ¡Listo, a moverte!

Características principales:
- Mapa en tiempo real con scooters disponibles
- Desbloqueo y bloqueo instantáneo desde tu celular
- Pago por minuto, sin abonos ni suscripciones
- Billetera prepago integrada con MercadoPago
- Historial de viajes y movimientos detallado
- Estado de batería visible antes de arrendar
- Diseñada para la movilidad urbana chilena

Una alternativa sustentable, económica y rápida al transporte tradicional para distancias cortas y medias dentro de la ciudad.

Ewood opera en zonas urbanas de Chile. Para más información o soporte: contacto@exwood.cl
```

---

## 4. Categoría

- **Categoría principal**: Mapas y navegación
- **Categoría secundaria** (si la pide): Estilo de vida

---

## 5. Etiquetas / Tags

- Scooter
- Movilidad eléctrica
- Transporte urbano
- Arriendo
- Sustentable

---

## 6. URL de política de privacidad

```
https://api.exwood.dev/privacy
```

Servida por el backend Go (HTML embed) via Caddy + Let's Encrypt en la EC2 de AWS.
Actualizaciones de la política se despliegan editando `internal/handler/static/privacy.html`
del backend y redeployando.

También disponible:
```
https://api.exwood.dev/terms
```

(Placeholder actual — versión final pendiente de la abogada, ver P1 #11 en ESTADO-ACTUAL.md).

---

## 7. Notas de la versión (release notes)

Para la primera versión:

```
Primera versión interna para pruebas con el equipo Ewood.
```

Para futuras versiones podés ir poniendo el changelog real.

---

## 8. Datos de contacto

- **Email de soporte**: `contacto@exwood.cl`
- **Sitio web** (opcional, podés poner el mismo de la política): `https://<TU_USUARIO_GITHUB>.github.io/<NOMBRE_REPO>/`
