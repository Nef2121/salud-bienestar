const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite en la web usa WebAssembly (.wasm): Metro debe tratarlo como un archivo más.
config.resolver.assetExts.push('wasm');

// SQLite en el navegador necesita estas cabeceras (SharedArrayBuffer) en el servidor de desarrollo.
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  middleware(req, res, next);
};

module.exports = config;
