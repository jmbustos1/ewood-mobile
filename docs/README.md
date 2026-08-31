# Documentación para publicar Ewood en Google Play (Internal Testing)

Archivos preparados para subir la app y empezar las pruebas internas con el equipo.

## Qué hay aquí

| Archivo | Para qué sirve |
|---------|----------------|
| `privacy-policy.html` | Política de privacidad, se publica con GitHub Pages |
| `index.html` | Landing simple del repo (linkea a privacy-policy) |
| `SETUP-PAGES.md` | Cómo activar GitHub Pages en 3 clics para obtener la URL pública |
| `play-store-listing.md` | Textos copy-paste para Play Console (nombre, descripciones, categorías) |
| `play-store-data-safety.md` | Respuestas al cuestionario de Seguridad de datos |
| `play-store-content-rating.md` | Respuestas al cuestionario de Clasificación de contenido |
| `SCREENSHOTS.md` | Cómo tomar screenshots desde el emulador con `adb` |

---

## Orden recomendado

1. **Esperar el build de EAS** (corriendo en https://expo.dev/accounts/desarrollo_exwood/projects/ewood-mobile/builds)
2. **Activar GitHub Pages** según `SETUP-PAGES.md` — te queda la URL de la política
3. **Crear cuenta Google Play Developer** ($25, una vez)
4. **Crear app en Play Console** → `Ewood`
5. **Completar la ficha** usando los textos de `play-store-listing.md`
6. **Responder cuestionarios** con las guías `play-store-data-safety.md` y `play-store-content-rating.md`
7. **Tomar screenshots** según `SCREENSHOTS.md`
8. **Subir el `.aab`** descargado de EAS → Pruebas internas → Crear versión
9. **Agregar emails de testers** → compartir el link

Tiempo total estimado para ti: ~1 hora una vez que tengas el AAB.
