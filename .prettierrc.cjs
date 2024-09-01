/** @type {import("prettier").Config} */
const config = {
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,

  semi: false,
  singleQuote: true,

  singleAttributePerLine: true,
  bracketSpacing: true,

  plugins: ['prettier-plugin-tailwindcss'],
}

module.exports = config
