const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add PDF and DOCX support to asset extensions
config.resolver.assetExts.push('pdf', 'docx');

module.exports = config;
