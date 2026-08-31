# Cómo tomar screenshots desde el emulador para Play Store

Play Store exige **mínimo 2, máximo 8** screenshots para la ficha. Para Internal Testing con 2 alcanza.

---

## Especificaciones

- Formato: **PNG o JPG**
- Tamaño mínimo de un lado: **320 px**
- Tamaño máximo de un lado: **3840 px**
- Aspect ratio: entre 1:1 y 9:16 (portrait) o 16:9 (landscape) — para Ewood usamos portrait

El emulador genera screenshots en su resolución nativa (~1080×2400), que está perfecto.

---

## Comando para capturar

Con la app abierta en la pantalla que quieras:

```bash
# Captura screenshot del emulador y lo descarga
~/Android/Sdk/platform-tools/adb shell screencap -p /sdcard/screen.png
~/Android/Sdk/platform-tools/adb pull /sdcard/screen.png ~/Documents/ewood/ewood-mobile/docs/screenshots/$(date +%s).png
```

Lo guardo en `docs/screenshots/`. El nombre con timestamp para no pisarse.

Creá la carpeta primero:

```bash
mkdir -p ~/Documents/ewood/ewood-mobile/docs/screenshots
```

---

## Sugerencias de pantallas a capturar

Las más vendedoras para una app de scooters:

1. **Mapa con scooters** — la pantalla principal con los markers visibles
2. **Pantalla de Saldo** con un balance positivo y movimientos
3. **Pantalla de Viaje en curso** (timer corriendo + costo en tiempo real)
4. **Resumen del viaje** (con duración, distancia, total con IVA)

Con 2-4 alcanza para Internal Testing. Para producción podés agregar onboarding y otras.

---

## Cuando las tengas

En Play Console → **Detalles de la app principal** → **Recursos gráficos** → **Capturas de pantalla del teléfono** → arrastras los PNG.
