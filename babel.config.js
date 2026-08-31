module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    env: {
      // Solo en builds de producción: remover todos los console.* del bundle.
      // En dev (npm run android, expo start) los logs siguen funcionando normal.
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  }
}
