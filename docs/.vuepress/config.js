const path = require('path');
const tailwindcss = require('tailwindcss');

module.exports = {
  title: 'V-Calendar',
  description: 'An elegant calendar and datepicker plugin for Vuejs.',
  plugins: [
    // Components
    [
      '@vuepress/register-components',
      {
        componentsDir: path.resolve(__dirname, './components'),
      },
    ],
    [
      // Google analytics
      ('@vuepress/google-analytics', { ga: 'UA-113780759-1' }),
    ],
  ],
  head: [['link', { rel: 'icon', href: 'favicon.png' }]],
  themeConfig: {
    nav: [
      {
        text: 'Guide',
        link: '/',
      },
      {
        text: 'API',
        link: '/api/',
        items: [
          { text: 'v1.0', link: '/api/v1.0/' },
          { text: 'v2.0', link: '/api/v2.0/' },
        ],
      },
      {
        text: 'Changelog',
        link: '/changelog/v2.0',
      },
      {
        text: 'Sponsor',
        link: 'https://github.com/sponsors/nathanreyes',
      },
    ],
    sidebar: {
      '/api/v1.0/': [
        {
          title: 'API',
          collapsable: false,
          children: [
            '',
            'defaults',
            'calendar',
            'page-object',
            'day-object',
            'attribute',
            'datepicker',
            'date-patterns',
          ],
        },
      ],
      '/api/v2.0/': [
        {
          title: 'API',
          collapsable: false,
          children: [
            '',
            'defaults',
            'calendar',
            'page-object',
            'day-object',
            'attribute',
            'datepicker',
            'date-patterns',
          ],
        },
      ],
      '/changelog/': [
        {
          title: 'Changelog',
          collapsable: false,
          children: [
            'v2.0',
            'v1.0',
            'v0.9',
            'v0.8',
            'v0.7',
            'v0.6',
            'v0.5',
            'v0.4',
            'v0.3',
            'v0.2',
            'v0.1',
          ],
        },
      ],
      '/tests/': [
        {
          title: 'Tests',
          children: [''],
        },
      ],
      '/showcase/': [
        {
          title: 'Showcase',
          collapsable: false,
          children: ['', 'github'],
        },
      ],
      '/': [
        {
          title: '',
          collapsable: false,
          children: ['', 'sponsors'],
        },
        {
          title: 'Getting Started',
          collapsable: false,
          children: ['installation', 'custom-defaults'],
        },
        {
          title: 'Core Concepts',
          collapsable: false,
          children: [
            'colors-dark-mode',
            'layouts',
            'navigation',
            'dates',
            'attributes',
            'datepicker',
            'timezones',
            'i18n',
          ],
        },
        {
          title: 'Examples',
          collapsable: false,
          children: ['/examples/datepickers'],
        },
      ],
    },
    // Assumes GitHub. Can also be a full GitLab url.
    repo: 'nathanreyes/v-calendar',
    // if your docs are not at the root of the repo
    docsDir: 'docs',
    // optional, defaults to master
    docsBranch: 'master',
    // defaults to true, set to false to disable
    editLinks: true,
    // custom text for edit link. Defaults to "Edit this page"
    editLinkText: 'Help me improve this page!',
  },
  bundlerConfig: {
    viteOptions: {
      css: {
        postcss: {
          plugins: [
            require('autoprefixer'),
            require('postcss-nested'),
            tailwindcss('./.vuepress/tailwind.config.js'),
          ],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../../src'),
        },
        extensions: ['.js', '.ts'],
      },
    },
  },
};
