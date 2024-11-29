// @ts-check
const depend = require('eslint-plugin-depend');
const eslint = require('@eslint/js');
const angular = require('angular-eslint');
const jasmine = require('eslint-plugin-jasmine');
const nosecrets = require('eslint-plugin-no-secrets');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const promise = require('eslint-plugin-promise');
const rxjsX = require('eslint-plugin-rxjs-x');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    ignores: ['src/environments/dev-keys.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsAll,
      prettierRecommended,
      depend.configs['flat/recommended'],
      promise.configs['flat/recommended'],
      rxjsX.configs.strict,
      jasmine.configs.recommended,
    ],
    plugins: {
      jasmine: jasmine,
      'no-secrets': nosecrets,
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'checklist'],
          style: 'camelCase',
        },
      ],
      // TODO: Move to OnPush
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/max-params': ['error', { max: 5 }],
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['memberLike', 'classProperty'],
          modifiers: ['static', 'readonly'],
          format: ['UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: ['variableLike'],
          modifiers: ['const', 'global'],
          format: ['UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: ['variableLike'],
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: ['memberLike', 'method', 'property'],
          modifiers: ['public'],
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: ['memberLike', 'method', 'property'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
          trailingUnderscore: 'forbid',
        },
        {
          selector: ['typeLike'],
          format: ['PascalCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: true }],
      '@typescript-eslint/typedef': [
        'error',
        {
          parameter: true,
          propertyDeclaration: true,
        },
      ],
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      'accessor-pairs': 'error',
      'array-callback-return': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'block-scoped-var': 'error',
      // complexity: 'error',
      curly: ['error', 'multi-line'],
      eqeqeq: 'error',
      'func-name-matching': 'error',
      'func-names': ['error', 'as-needed'],
      'grouped-accessor-pairs': 'error',
      'jasmine/new-line-before-expect': 'off',
      'logical-assignment-operators': 'error',
      'max-nested-callbacks': ['error', { max: 5 }],
      'no-alert': 'error',
      'no-array-constructor': 'error',
      'no-await-in-loop': 'error',
      'no-caller': 'error',
      'no-console': ['error', { allow: ['debug', 'warn', 'error'] }],
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'error',
      'no-empty-function': ['error', { allow: ['constructors'] }],
      'no-eq-null': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-implicit-coercion': 'error',
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-invalid-this': 'error',
      'no-iterator': 'error',
      'no-label-var': 'error',
      'no-labels': ['error', { allowLoop: true }],
      'no-lone-blocks': 'error',
      'no-multi-assign': 'error',
      'no-nested-ternary': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-object-constructor': 'error',
      'no-octal-escape': 'error',
      'no-promise-executor-return': 'error',
      'no-proto': 'error',
      'no-return-assign': 'error',
      'no-script-url': 'error',
      'no-secrets/no-secrets': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-unreachable-loop': 'error',
      'no-unused-expressions': 'error',
      'no-useless-assignment': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-warning-comments': ['error', { terms: ['DO NOT SUBMIT'], location: 'anywhere' }],
      'operator-assignment': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-named-capture-group': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-regex-literals': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      radix: 'error',
      'require-atomic-updates': 'error',
      'rxjs-x/finnish': [
        'error',
        {
          functions: false,
          methods: false,
        },
      ],
      'rxjs-x/no-ignored-error': 'off',
      'rxjs-x/no-ignored-subscribe': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      // jasmine spy expectations are expressed unbound
      '@typescript-eslint/unbound-method': 'off',
      'no-await-in-loop': 'off',
      'no-restricted-imports': ['error', '@testing-library/dom'],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility, prettierRecommended],
    rules: {
      'prettier/prettier': [
        'error',
        {
          parser: 'angular',
        },
      ],
    },
  },
);
