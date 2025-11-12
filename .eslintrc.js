module.exports = {
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}