const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    //   TODO Add Scope Enum Here
    // 'scope-enum': [2, 'always', ['yourscope', 'yourscope']],
    'type-enum': [
      2,
      'always',
      [
        /** @external https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit-message-header */
        'feat',
        'fix',
        'docs',
        'chore',
        'style',
        'refactor',
        'ci',
        'test',
        'perf',
        'revert',
        'vercel',
        'wip',
      ],
    ],
    'type-case': [2, 'always', ['lowercase']],
  },
}

module.exports = config
