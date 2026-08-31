# Activar GitHub Pages para publicar la política de privacidad

La política de privacidad necesita estar en una URL pública para que Google Play la acepte. Vamos a usar GitHub Pages — gratis, integrado con el repo, sin configurar nada externo.

---

## Pasos

### 1. Hacer commit y push de la carpeta `docs/`

```bash
cd ~/Documents/ewood/ewood-mobile
git add docs/
git commit -m "Agrega política de privacidad y docs para Play Store"
git push origin <tu-rama>
```

### 2. Activar GitHub Pages

1. Andá al repo en GitHub
2. **Settings** (pestaña superior derecha)
3. Menú izquierdo → **Pages**
4. En "Build and deployment" → **Source**: dejar `Deploy from a branch`
5. **Branch**: elegir `main` (o la rama default que tengas)
6. **Folder**: elegir `/docs`
7. Click **Save**

### 3. Esperar 1-2 minutos

GitHub te dice algo tipo:
> Your site is live at https://`<usuario>`.github.io/`<repo>`/

### 4. Confirmar las URLs

Abrí en el navegador:
- `https://<usuario>.github.io/<repo>/` → ve la página de Ewood
- `https://<usuario>.github.io/<repo>/privacy-policy.html` → ve la política

Esa segunda URL es la que vas a pegar en Play Console → "URL de política de privacidad".

---

## Si el repo es PRIVADO

GitHub Pages para repos privados requiere plan paid (GitHub Pro o team).

Opciones gratis si el repo es privado:
- Hacer un **repo nuevo público** llamado `ewood-legal` solo con los HTMLs
- O usar **Netlify Drop** (https://app.netlify.com/drop): arrastrás la carpeta `docs/` al navegador y te da una URL HTTPS al instante, sin cuenta

---

## Cuando cambies el contenido de la política

Editás el `docs/privacy-policy.html`, hacés commit + push, y GitHub Pages se actualiza solo en ~1 minuto. La URL no cambia.
