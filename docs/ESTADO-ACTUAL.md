# Estado actual de operacion — Ewood

> Snapshot del 2026-06-10. Sirve para entender como esta operando la app hoy,
> que hacks/parches tenemos vigentes y cual es la lista de prioridades para sacarlos.

## TL;DR

| Componente | Estado | Notas |
|---|---|---|
| App mobile (Expo SDK 55) | Funcional, builds en EAS Cloud | Package real: `com.anonymous.ewoodmobile` (no `cl.ewood.app`) |
| Backend Go | Vivo en EC2 `98.92.176.224:8200` | **HTTP plano**, sin TLS |
| PostgreSQL | RDS produccion | OK |
| WebSocket | `ws://98.92.176.224:8200` | OK |
| Firmware ESP32 | Funcional | GPS real, BMS via UART1, recovery mejorado |
| Pagos MercadoPago | **Sandbox con TESTUSER vendor** | NO produccion real |
| Webhooks MP | Tunel Cloudflare temporal | `penn-congratulations-polymer-proceed.trycloudflare.com` |
| Google Play | Pre-publicacion (Internal Testing) | Verificaciones de owner pendientes |
| Distribucion a testers internos | APK universal por WhatsApp/Drive | Generado con bundletool |

---

## Como esta operando la app hoy (flujo real)

### 1. Build de la app

- **Builds en la nube con EAS** (Expo Application Services), perfil `production`.
- Cuenta: `desarrollo_exwood`, project ID `0e36bac8-94c9-4e27-afb8-b150ce143181`.
- Tres profiles en `eas.json`:
  - `development`: dev-client APK (para `expo start --dev-client`).
  - `preview`: app-bundle interno (lo usabamos antes de tener Play).
  - `production`: app-bundle (AAB) con `autoIncrement` y `channel: production`.
- El AAB se sube a Play Store (cuando este aprobada la cuenta) o se convierte a APK con bundletool para mandarlo directo a un tester.

### 2. Backend

- Servidor Go en una EC2 (Ubuntu) con direccion publica `98.92.176.224`.
- Escucha en `:8200` (HTTP + WebSocket) y un puerto TCP separado para scooters ESP32.
- PostgreSQL en RDS, conectado por VPC.
- Sin reverse proxy con TLS — la app pega directo al puerto 8200.

### 3. Pagos

- Integracion con **MercadoPago Checkout Pro** dentro de un `WebView`.
- Estamos usando **credenciales de un usuario de prueba (TESTUSER vendor)** + una app de prueba dentro de ese vendor.
- El webhook de MP llega a un **tunel de Cloudflare temporal** (`trycloudflare.com`) que reenvia al backend local.
- El backend acepta dos topics: `payment` (resource = id) y `merchant_order` (extrae los payments asociados).

### 4. Distribucion para testing antes de Play

- Hasta que apruebe el ciclo de Play Store + verificacion de identidad del owner, mandamos el APK directo a colegas:
  - `eas build --profile production` genera un `.aab` en la nube.
  - Descargamos el AAB y lo pasamos por `docs/aab-to-apk.sh` que llama a **bundletool** para sacar un `universal.apk` firmado con el mismo keystore EAS.
  - El APK pesa ~120 MB, lo mandamos por Drive/Telegram (WhatsApp limita a 100 MB).

---

## Hacks / Workarounds vigentes (deuda tecnica)

### 1. Backend HTTP sin TLS

**Donde:** todo el codigo cliente usa `http://98.92.176.224:8200` y `ws://...`.

**Que necesita el hack:**
- `android:usesCleartextTraffic="true"` en `AndroidManifest.xml` + plugin `expo-build-properties` en `app.json`.
- Sin esto, Android 9+ bloquea el trafico HTTP en builds de release y los testers ven "no puedo iniciar sesion".

**Como sacarlo:**
- Opcion A: comprar dominio (`exwood.cl` por NIC Chile o Route 53), apuntarlo a la EC2, levantar `caddy` o `nginx` con Let's Encrypt en frente del backend Go.
- Opcion B: dejar Cloudflare Tunnel como puerta definitiva (te da HTTPS automatico sin abrir puerto 443). Mas barato y rapido pero te ata a Cloudflare.
- Una vez hecho: cambiar las env vars (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_URL`) y **quitar el cleartext** del manifest y del `app.json`.

### 2. ~~MercadoPago en sandbox con TESTUSER vendor~~ ✅ RESUELTO (2026-06-10)

**Estado:** ya estamos con credenciales de producción real del comercio Exwood (`APP_USR-267034982093480-...`). Primera prueba con plata real exitosa.

**Para el futuro:**
- Las credenciales viven en `env.production` del backend. Se suben a S3 con `deploy.sh`.
- Public Key + Client ID + Client Secret de producción quedan disponibles para cuando se implemente Card Tokenization (tarjetas guardadas, P2).

### 3. Webhook MP via tunel Cloudflare quick + tmux

**Donde:** `MP_BACKEND_BASE_URL=https://dietary-textiles-violations-compliant.trycloudflare.com` (cambia cada vez que reiniciamos el tunel).

**Por que es un hack:**
- Los tuneles `trycloudflare.com` son **quick tunnels**: URL aleatoria, mueren al reiniciar.
- Cada vez que cambia hay que: actualizar `env.production`, redeployar backend, actualizar URL del webhook en el panel de MP.
- Hoy corre dentro de `tmux` en la EC2 (sesion `cf`). Sobrevive a desconexion SSH pero NO a reboot de la EC2.

**Solucion definitiva (parte del plan HTTPS — ver seccion al final):**
- Cuando el backend tenga HTTPS estable con dominio propio, el webhook va directo a `https://api.exwood.cl/api/wallet/mp-webhook`.
- Cloudflare Tunnel desaparece de la stack.

### 4. NVM environment para correr eas/expo

**Donde:** todos los scripts que llaman a `eas`/`expo`/`npx` arrancan con:
```bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use default
```

**Por que:**
- Node v24 (el del sistema) era muy nuevo para Expo SDK 55. Bajamos a Node v22 LTS (`lts/jod`) via nvm.
- `nvm` no carga su `PATH` automaticamente en shells no-interactivos, por eso hay que source-arlo manualmente.

**Como sacarlo (opcional):**
- No urge. Mientras Expo SDK 55 siga vivo, dejar Node 22 LTS como default por nvm esta bien.
- Si en algun momento se actualiza a Expo SDK 56+ que soporte Node 24, se puede ir al system Node y dropear el dance.

### 5. Carpeta `android/` hardcodeada con package viejo

**Donde:** `app.json` dice `"package": "cl.ewood.app"` pero el AAB final sale con `com.anonymous.ewoodmobile`.

**Por que:**
- Existe la carpeta `android/` local (no fue generada con `expo prebuild` reciente). EAS detecta esa carpeta y usa el package que esta hardcodeado en los archivos Java/Gradle, ignorando `app.json`.
- Resultado: el AAB esta firmado para `com.anonymous.ewoodmobile`.

**Como sacarlo:**
- `rm -rf android/` y volver a buildear — `eas build` correra `expo prebuild` desde cero y respetara `cl.ewood.app`.
- **Atencion:** una vez que cambies el package, la app en Play Store es una app distinta (no se puede actualizar la version vieja con package nuevo). Decidirlo ANTES de subir a produccion real.
- Recomendacion: si vamos a salir al publico, hacer el cambio ahora antes del primer release de Play.

### 6. WebView de MercadoPago — depurado (2026-06-11)

**Donde:** `app/(app)/wallet/recharge.tsx`.

**Configuracion actual (ya no es hack):**
- User-agent del dispositivo (mobile) → MP sirve HTML responsive. Layout vertical correcto.
- `injectedJavaScriptBeforeContentLoaded` con viewport meta → refuerzo defensivo.
- `onShouldStartLoadWithRequest` bloquea `mercadopago://` y `mercadolibre://` → evita que MP/ML intenten abrir su app nativa.
- `incognito={true}` → arranca sin cookies cacheadas.

**Decisiones de producto (no son hacks):**
- **Bloqueo de schemas nativos**: el flow es siempre WebView con tarjeta, consistente para todos los usuarios. Si en algun momento queremos permitir "Pagar con MP App", se saca el filtro de `mercadopago://`.
- **incognito**: en sandbox era necesario para evitar mix de cookies test+real. En produccion ya no hace falta. **Se puede sacar** si queremos que MP recuerde sesion entre recargas (un click menos al usuario), pero conviene dejarlo si queremos que cada recarga sea limpia.

**Camino "sin WebView" (P2):**
- Migrar a **MercadoPago Checkout Bricks** (componentes React Native nativos) o **Card Tokenization** (form nuestro + token MP).
- Habilita: layout 100% nativo, tarjetas guardadas, UX mas rapida.
- Costo: bastante mas trabajo (SDK, 3DS, errores de tarjeta, etc.).

### 7. Console logs removidos solo en produccion via babel

**Donde:** `babel.config.js` con `transform-remove-console` activo solo en `NODE_ENV=production`.

**Por que:**
- Logs detallados durante desarrollo, pero limpiar la consola en release.
- No es un hack grave, mas un detalle a documentar.

---

## Pendientes priorizados

### P0 — Bloqueantes para soft-launch publico

1. **Backend HTTPS** (ver hack #1). Sin esto no podemos publicar en Play production sin la bandera de cleartext.
2. **MercadoPago credenciales reales** (ver hack #2). Sin esto no se cobra plata real.
3. **Webhook MP estable** (ver hack #3). Sin esto los pagos no se acreditan a la billetera.
4. **Decision de package final**: `cl.ewood.app` o `com.anonymous.ewoodmobile` (ver hack #5). Cambiarlo despues de publicar es irreversible.

### P1 — Para que la experiencia sea solida

5. ~~**Recuperacion de contrasena por email**~~ ✅ RESUELTO (2026-07-18) — Amazon SES + DKIM + endpoints backend + pantalla mobile + pagina web fallback. Pendiente: aprobacion de production access de AWS (SES sale de sandbox) — solicitud enviada 2026-07-18, esperando respuesta.
6. **Verificacion de identidad del owner en Google Play** + verificacion de telefono + verificacion de sitio web.
7. **Cuestionarios Data Safety y Content Rating en Play Console**. Tenemos las respuestas en `docs/play-store-data-safety.md` y `play-store-content-rating.md`, falta cargarlas.
8. **Subir AAB final a Internal Testing en Play** (lo bloquea P0 #4).
9. **Registro persistente del consentimiento de Politica/T&C en la DB**. Hoy el checkbox del registro se valida en el cliente pero NO se persiste un registro de quien acepto, cuando, ni que version del documento. Para defensa legal ante reclamos, agregar tabla `user_consents (user_id, document, version, accepted_at)` y exigir re-aceptacion cuando suba la version. Comprometido en mail a la abogada del 2026-06-16.
10. **Bounce/Complaint handling de SES via SNS** (comprometido a AWS en la solicitud de production access, 2026-07-18). Requiere:
    - Crear topic SNS `ewood-ses-events`.
    - Configurar SES notifications para bounces/complaints al topic.
    - Endpoint `/webhooks/ses` en el backend que reciba las notificaciones.
    - Tabla `email_events` o campos `email_invalid` / `email_opted_out` en `users`.
    - Politica: hard bounce -> nunca mas enviar; 3 soft bounces = hard bounce; complaint -> opt-out inmediato.
    - Target metricas SES: bounce rate < 1%, complaint rate < 0.1%.
    - **Debe estar antes del launch publico** — sin esto, si tenemos bounces AWS puede bajar el sending capacity o revocar production access.
11. **Terminos y Condiciones + Politica de Privacidad publicas**. Hoy la app tiene los links en el registro pero apuntan a placeholders. Necesitamos:
    - Recibir el texto final de la abogada (mail contestado 2026-06-16, esperando iteracion post-respuestas).
    - Hostearlos publicamente: dos opciones son `https://exwood.dev/terminos.html` + `/privacidad.html` servidos por Caddy en la EC2, o subirlos al Shopify de `exwood.cl` si prefieren mantener el dominio principal.
    - Actualizar los links en `app/(auth)/register.tsx` y `app/(app)/about.tsx`.
    - Se enlaza con pendiente #9 (registro de consentimiento) — cuando persistan la aceptacion, guardar la version del documento.

### P2 — Mejoras y features

12. **Tarjetas guardadas con MercadoPago tokenization** (ver hack #6). Mejora flujo de recarga, evita WebView.
13. **Actualizacion de paquetes Expo** (`npx expo install --check`) — varios desactualizados.
14. **Reporte de uso post-viaje**: pantalla bonita con resumen del recorrido.
15. **Notificaciones push** (Expo push tokens + envio desde el backend cuando se acredita saldo / inicia un viaje).
16. **Emails transaccionales adicionales via SES** (una vez que #10 este listo): welcome email al registrarse, recibo por viaje pagado (obligatorio SII para facturacion), alerta de saldo bajo.

### P3 — Operacional / DX

17. **Separar config local del firmware** (ver `project_firmware_config_local.md` en memoria).
18. **Pipeline CI/CD para el backend Go** (hoy es `git pull && systemctl restart` manual en la EC2).
19. **Backups automatizados de RDS** (verificar si los snapshots por default son suficientes o configurar un dump diario a S3).

---

## Que vive donde (referencia rapida)

| Que | Donde |
|---|---|
| Backend Go | EC2 `98.92.176.224`, repo `ewood-backend` |
| Frontend admin | Next.js 14, deploy manual (ver `project_ewood_frontend.md`) |
| App mobile | Repo `ewood-mobile` (este) — Expo SDK 55 |
| Firmware ESP32 | Repo separado — flasheo via PlatformIO |
| Base de datos | RDS PostgreSQL, mismo VPC que EC2 |
| Webhook MP (hoy) | Cloudflare quick tunnel temporal |
| Keystore Android | `@desarrollo_exwood__ewood-mobile.jks` (local) + EAS server |
| Politica de privacidad | `docs/privacy-policy.html` (subir a GitHub Pages) |
| Imagenes Play Store | `docs/developer-icon-512.*`, `feature-graphic-*`, `developer-header-*` |

---

## Como mando un APK a un colega (resumen)

```bash
# 1. Build en EAS
eas build --platform android --profile production --non-interactive

# 2. Cuando termine, descargar el AAB (link en stdout o en https://expo.dev)

# 3. Convertir a APK universal firmado
./docs/aab-to-apk.sh /ruta/al/archivo.aab

# 4. Mandar /home/tecob/Documents/ewood/ewood-mobile/builds/ewood-universal.apk
#    por Drive / Telegram / WeTransfer (WhatsApp solo admite 100MB).
```

---

## Plan: HTTPS profesional sin Cloudflare (P0)

Estado actual: backend en `http://98.92.176.224:8200` con tunel Cloudflare quick para webhook MP. Hay que pasar a un setup propio con dominio + TLS.

### Que falta en el Terraform actual (`backend-ewood/terraform/`)

Lo que ya esta: `aws_instance` (EC2) + security group + RDS + ECR + S3 + IAM + SSM.

Lo que falta para HTTPS profesional:
1. **`aws_eip`** — IP elastica para que la EC2 mantenga IP estable a traves de reboots.
2. **Apertura de puertos 80 y 443** en el security group; cerrar el 8200 publico.
3. **Dominio** — `exwood.cl` registrado en NIC.cl (~$15 USD/año) o uno `.com` via Route 53 (~$13 USD/año).
4. **DNS** — Route 53 (`aws_route53_zone` + `aws_route53_record` A → EIP) o panel del registrador apuntando al EIP.
5. **Reverse proxy + TLS** dentro de la EC2 — Caddy o Nginx + Let's Encrypt.

### Tres caminos posibles

**Camino A — EIP + dominio + Caddy en EC2** (recomendado para hoy)
- Costo: solo el dominio anual.
- Cambios Terraform: `aws_eip`, abrir 80/443, cerrar 8200, opcional Route 53.
- En EC2: instalar Caddy con `Caddyfile`:
  ```
  api.exwood.cl {
    reverse_proxy localhost:8200
  }
  ```
- Caddy pide cert Let's Encrypt automaticamente y lo renueva solo cada 60 dias.
- Update mobile: `EXPO_PUBLIC_API_URL=https://api.exwood.cl`, `EXPO_PUBLIC_WS_URL=wss://api.exwood.cl`.
- Update backend: `MP_BACKEND_BASE_URL=https://api.exwood.cl` + actualizar webhook URL en panel MP.
- Quitar `usesCleartextTraffic` del manifest + plugin.
- Matar Cloudflare Tunnel.

**Camino B — ALB + ACM + Route 53** (HA-ready, AWS-native)
- Costo: ~$18-22 USD/mes (ALB ~$16 + traffico) + dominio.
- Cambios Terraform: `aws_lb`, `aws_lb_target_group`, `aws_lb_listener`, `aws_acm_certificate`, `aws_route53_zone`, `aws_route53_record`.
- ALB termina TLS, EC2 sigue sirviendo HTTP por dentro de la VPC.
- Pro: cert managed por AWS, ready para multi-AZ.
- Contra: overkill para nuestro trafico actual; $16/mes minimo aunque no haya usuarios.

**Camino C — Cloudflare Tunnel "named"** (gratis pero atado a Cloudflare)
- Costo: $0 + dominio opcional.
- Crear cuenta Cloudflare gratuita, named tunnel, `cloudflared` como systemd service.
- URL fija (`xxx.cfargotunnel.com` o tu dominio).
- Pro: gratis, pieza ya casi armada.
- Contra: dependencia de Cloudflare; no es AWS-native.

### Recomendacion

Camino A. Razones:
- Es lo profesional para apps de nuestra escala antes de necesitar HA.
- Barato, simple, Caddy es trivial.
- Tu Terraform queda limpio (EIP + opcional Route 53).
- Cuando llegues a uptime critico, migras a B sin tocar la app.

### Detalles importantes

- **WebSocket**: Caddy proxy-ea `wss://` automaticamente. Cero codigo nuevo.
- **Puerto TCP 8201 (ESP32)**: NO pasa por Caddy. Dejar en TCP plano. La seguridad la da el `DEVICE_SECRET` que el firmware envia al conectar. ESP32 + SIM7600 manejan TLS pero es engorroso y los datos (telemetria GPS) no son altamente sensibles.
- **RDS publico**: el Terraform tiene `allow_public_access = true` para RDS (marcado como "CAMBIAR EN PRODUCCION"). Cuando ataquemos HTTPS, conviene tambien cerrar el RDS — pasar el backend a leer credenciales de Secrets Manager y eliminar el acceso publico al puerto 5432.
- **Tema dominio Chile vs internacional**: si el comercio es chileno y el target es Chile, `exwood.cl` por NIC.cl es lo natural. Si queres expandir, `exwood.com` queda mejor pero suele estar tomado.

### Pasos concretos para arrancar Camino A

1. Decidir y comprar dominio.
2. Reservar EIP via Terraform (`aws_eip` + asociacion a EC2). `terraform apply`.
3. Apuntar A record del dominio al EIP (en NIC.cl o Route 53).
4. SSH a EC2: `sudo apt install caddy` + crear `/etc/caddy/Caddyfile`.
5. Verificar HTTPS desde tu maquina: `curl https://api.exwood.cl/check`.
6. Abrir 443 en SG, cerrar 8200.
7. Actualizar env vars (backend + mobile) y rebuildear AAB.
8. Quitar usesCleartextTraffic.
9. Apagar cloudflared.

Tiempo estimado: 2-3 horas si todo va bien.

