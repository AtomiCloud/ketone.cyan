import { StartTemplateWithLambda } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (i, d) => {
  return {
    processors: [
      {
        name: 'cyan/default',
        files: ['template/**/*.*'],
        config: {},
      },
    ],
    plugins: [],
  };
});
