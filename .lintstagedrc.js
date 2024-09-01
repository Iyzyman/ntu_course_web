const buildEslintCommand = () => `eslint --fix --max-warnings=0 src`

const config = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
}

export default config
