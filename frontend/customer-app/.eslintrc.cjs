module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    '*.min.js',
    'public',
    'coverage',
    '.eslintrc.js',
    'vite.config.js',
    'tailwind.config.js',
    'postcss.config.js'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      alias: {
        '@': './src',
        '@components': './src/components',
        '@pages': './src/pages',
        '@utils': './src/utils',
        '@services': './src/services',
        '@hooks': './src/hooks',
        '@store': './src/store',
        '@assets': './src/assets',
      },
    },
  },
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/no-unsafe': 'warn',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'warn',
    'react/jsx-fragments': ['warn', 'syntax'],
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // React Refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    

    // General JavaScript rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': 'warn',
    'no-unused-vars': ['error', { 
      vars: 'all', 
      args: 'after-used', 
      ignoreRestSiblings: true,
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'template-curly-spacing': ['warn', 'never'],
    'object-shorthand': 'warn',
    'quote-props': ['warn', 'as-needed'],
    'no-useless-concat': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-return': 'warn',
    'no-useless-computed-key': 'warn',
    'no-useless-rename': 'warn',
    'no-useless-constructor': 'warn',
    'no-lonely-if': 'warn',
    'no-else-return': 'warn',
    'no-unneeded-ternary': 'warn',
    'no-nested-ternary': 'warn',
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
    'no-trailing-spaces': 'warn',
    'eol-last': 'warn',
    'comma-dangle': ['warn', 'always-multiline'],
    'semi': ['error', 'never'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'linebreak-style': ['warn', 'unix'],
    'max-len': ['warn', { 
      code: 120, 
      tabWidth: 2, 
      ignoreUrls: true, 
      ignoreStrings: true, 
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true
    }],
    'max-depth': ['warn', 4],
    'max-nested-callbacks': ['warn', 3],
    'max-params': ['warn', 4],
    'complexity': ['warn', 10],
    

  },

}