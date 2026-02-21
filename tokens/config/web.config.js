import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['src/**/*.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'generated/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            selector: ':root',
            outputReferences: true,
          },
        },
        {
          destination: 'variables-dark.css',
          format: 'css/variables',
          filter: (token) => token.$extensions?.mode?.dark !== undefined,
          options: {
            selector: '[data-theme="dark"]',
            outputReferences: true,
          },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
console.log('✓ Design tokens built successfully');
