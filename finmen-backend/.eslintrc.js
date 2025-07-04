module.exports = {
    env: {
      node: true,
      es2021: true,
    },
    extends: ['airbnb-base', 'prettier'],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'warn',
    },
  };