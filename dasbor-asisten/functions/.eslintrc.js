module.exports = {
  root: true,
  
  // ⬇️ BLOK INI WAJIB ADA ⬇️
  env: {
    es2021: true,
    node: true, // Ini memberitahu linter bahwa 'require' dan 'module' itu valid
  },
  // ⬆️ AKHIR DARI BLOK ⬆️

  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "quotes": ["error", "double"],
    "max-len": "off", 
    "require-jsdoc": "off",
  },
};