import { GlobType, QuestionType, StartTemplateWithLambda } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (i, d) => {
  const templatename = await i.text({
    message: 'What is the name of the template?',
    id: 'atomi-cyan/template-name',
    type: QuestionType.Text,
    desc: 'The name of the template',
  });

  const desc = await i.text({
    message: 'What is the description of the template?',
    id: 'atomi-cyan/template-description',
    type: QuestionType.Text,
    desc: 'The description of the template',
  });

  const platform = await i.text({
    id: 'atomi-cyan/platform',
    type: QuestionType.Text,
    message: 'What is the platform of the template?',
    desc: 'The platform of the template',
  });

  const service = await i.text({
    id: 'atomi-cyan/service',
    type: QuestionType.Text,
    message: 'What is the service of the template?',
    desc: 'The service of the template',
  });

  const vars = { platform, service, templatename, desc };

  return {
    processors: [
      {
        name: 'cyan/default',
        files: [
          {
            root: 'templates',
            glob: '**/*.*',
            exclude: [],
            type: GlobType.Template,
          },
        ],
        config: {
          vars,
          parser: {
            varSyntax: [['constxx', 'xx']],
          },
        },
      },
    ],
    plugins: [],
  };
});
