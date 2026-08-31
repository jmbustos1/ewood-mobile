#!/usr/bin/env bash
# Convierte un AAB descargado de EAS a un APK universal instalable directo.
# Útil para testers que no usan Play Store.
#
# Uso:
#   ./aab-to-apk.sh                       # Descarga el último AAB de EAS y lo convierte
#   ./aab-to-apk.sh path/to/ewood.aab     # Convierte un AAB local específico

set -e

# Auto-cargar nvm si está disponible (para que eas funcione)
if [ -z "$(command -v eas)" ] && [ -d "$HOME/.nvm" ]; then
    export NVM_DIR="$HOME/.nvm"
    # shellcheck disable=SC1091
    source "$NVM_DIR/nvm.sh"
    nvm use default >/dev/null 2>&1 || true
fi

# Asegurar que JAVA_HOME esté seteado para bundletool
if [ -z "$JAVA_HOME" ] && [ -d /opt/android-studio/jbr ]; then
    export JAVA_HOME=/opt/android-studio/jbr
    export PATH="$JAVA_HOME/bin:$PATH"
fi

OUT_DIR="$(pwd)/builds"
mkdir -p "$OUT_DIR"
cd "$OUT_DIR"

BUNDLETOOL_VERSION="1.18.1"
BUNDLETOOL_JAR="$OUT_DIR/bundletool.jar"

# 1. Descargar bundletool si no está
if [ ! -f "$BUNDLETOOL_JAR" ]; then
    echo "▶ Descargando bundletool..."
    wget -q "https://github.com/google/bundletool/releases/download/${BUNDLETOOL_VERSION}/bundletool-all-${BUNDLETOOL_VERSION}.jar" -O "$BUNDLETOOL_JAR"
    echo "✓ bundletool listo"
fi

# 2. Obtener el AAB
if [ -n "$1" ]; then
    AAB_PATH="$1"
    if [ ! -f "$AAB_PATH" ]; then
        echo "✗ No existe el archivo $AAB_PATH"
        exit 1
    fi
    echo "▶ Usando AAB local: $AAB_PATH"
else
    AAB_PATH="$OUT_DIR/ewood.aab"
    echo "▶ Descargando último AAB de EAS..."
    eas build:list --platform android --limit 1 --status finished --json >/dev/null 2>&1 || {
        echo "✗ Necesitas estar logueado en EAS: eas login"
        exit 1
    }
    eas build:download --platform android --latest --output "$AAB_PATH"
    echo "✓ AAB descargado: $AAB_PATH"
fi

# 3. Generar APKs desde el AAB (firmado con el keystore EAS)
APKS_PATH="$OUT_DIR/ewood.apks"
echo "▶ Generando APKs..."
rm -f "$APKS_PATH"

# Keystore: las credenciales viven en keystore.env (gitignoreado).
# Sin firmar, el APK NO se instala en Android.
PROJECT_ROOT="$(cd "$OUT_DIR/.." && pwd)"
KEYSTORE_ENV="$PROJECT_ROOT/keystore.env"
if [ ! -f "$KEYSTORE_ENV" ]; then
    echo "✗ Falta $KEYSTORE_ENV"
    echo "   Bajalo con: eas credentials --platform android (opcion: download keystore)"
    echo "   y crea keystore.env con KEYSTORE_PATH, KEYSTORE_PASS, KEY_ALIAS, KEY_PASS."
    exit 1
fi
# shellcheck disable=SC1090
source "$KEYSTORE_ENV"
# Resolver KEYSTORE_PATH relativo al proyecto si no es absoluto
case "$KEYSTORE_PATH" in
    /*) ;;
    *) KEYSTORE_PATH="$PROJECT_ROOT/$KEYSTORE_PATH" ;;
esac
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "✗ Keystore no encontrado en $KEYSTORE_PATH"
    exit 1
fi

java -jar "$BUNDLETOOL_JAR" build-apks \
    --bundle="$AAB_PATH" \
    --output="$APKS_PATH" \
    --mode=universal \
    --ks="$KEYSTORE_PATH" \
    --ks-pass="pass:$KEYSTORE_PASS" \
    --ks-key-alias="$KEY_ALIAS" \
    --key-pass="pass:$KEY_PASS"

# 4. Extraer el universal.apk
APK_OUT="$OUT_DIR/ewood-universal.apk"
echo "▶ Extrayendo universal.apk..."
unzip -p "$APKS_PATH" universal.apk > "$APK_OUT"

# 5. Verificar
SIZE_MB=$(du -m "$APK_OUT" | cut -f1)
echo ""
echo "✓ Listo: $APK_OUT (${SIZE_MB} MB)"
echo ""
echo "Para mandárselo al colega:"
echo "  • WhatsApp / Drive / Telegram → $APK_OUT"
echo "  • Tu colega lo abre desde el celular y acepta el permiso de \"orígenes desconocidos\""
