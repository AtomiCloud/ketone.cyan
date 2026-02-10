# CyanPrint Template Reference

## CyanPrint Commands

### cyanprint update

Updates all templates in a project to their latest versions.

```bash
cyanprint update [OPTIONS] [PATH]
```

**Options:**

- `-c, --coordinator-endpoint <COORDINATOR_ENDPOINT>` - Custom coordinator endpoint
- `-i, --interactive` - Enable interactive mode to select specific versions
- `-h, --help` - Print help

**Default behavior:** Updates all templates from the default registry.

**Note:** This command may prompt for user input if there are conflicts or choices to be made. When used in automated workflows, this is a signal to abort.

### Other CyanPrint Commands

| Command  | Description                      |
| -------- | -------------------------------- |
| `push`   | Publish a CyanPrint artifact     |
| `create` | Create a project from a template |
| `daemon` | Start the CyanPrint Coordinator  |
| `update` | Update all templates to latest   |

## CyanPrint Template Project Structure

A typical CyanPrint template repository:

```
cyan-template-repo/
├── cyan.yaml              # Template configuration
├── cyan/                  # Template scaffolding logic
│   ├── index.ts           # Main entry point, prompts for variables
│   ├── package.json       # Dependencies for the scaffolding script
│   └── tsconfig.json      # TypeScript config
├── templates/             # The actual template files to be generated
│   ├── cyan/              # Nested cyan (part of generated output)
│   │   ├── package.json   # Dependencies for generated cyan
│   │   └── index.ts       # Entry point for generated cyan
│   ├── flake.nix          # Nix flake template
│   ├── Taskfile.yaml      # Taskfile template
│   └── ...                # Other template files
├── .cyan_state.yaml       # CyanPrint state tracking
└── package.json           # Root package.json (if any)
```

## cyan.yaml Format

```yaml
username: atomi
name: cyan
description: Template description
project: https://github.com/org/repo
source: https://github.com/org/repo.git
email: admin@example.com
tags: ['template', 'tags']
readme: cyan/README.MD
processors: ['cyan/default']
templates: []
plugins: []
```

## index.ts Structure

The `cyan/index.ts` file defines the template scaffolding logic:

```typescript
import { GlobType, QuestionType, StartTemplateWithLambda } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (i, d) => {
  // Prompt user for variables
  const var1 = await i.text({
    message: 'Question text?',
    id: 'unique/question-id',
    type: QuestionType.Text,
    desc: 'Description',
  });

  // Return processors configuration
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
          vars: { var1 },
          parser: {
            varSyntax: [['constxx', 'xx']],
          },
        },
      },
    ],
    plugins: [],
  };
});
```

## Dependency Management

### Cyan SDK Version

The `@atomicloud/cyan-sdk` package is the main dependency for template scaffolding:

```json
{
  "dependencies": {
    "@atomicloud/cyan-sdk": "^2.0.0"
  }
}
```

When updating, check for:

- New SDK versions that may introduce breaking changes
- New features or APIs in the SDK
- Deprecation warnings

### Updating Strategies

| Strategy          | Command                           | Use Case                              |
| ----------------- | --------------------------------- | ------------------------------------- |
| Latest compatible | `bun update`                      | Update within semver ranges           |
| Latest major      | `bun update` + manual bump to `*` | Get latest including breaking changes |
| Specific version  | `bun add package@version`         | Pin to specific version               |

## Common Issues

### Interactive Prompts During Update

If `cyanprint update` prompts for input, it may indicate:

1. **Version conflicts** - Multiple versions available, needs selection
2. **State mismatch** - Local `.cyan_state.yaml` conflicts with remote
3. **Registry issues** - Unable to reach default registry

**Solution:** Abort and run with `--interactive` flag to see options, or resolve manually.

### .cyan_state.yaml Conflicts

The state file tracks template versions. If corrupted:

```bash
# Backup and remove state
mv .cyan_state.yaml .cyan_state.yaml.bak
cyanprint update
```

### Nix Shell Environment

Many cyan projects use nix for dependency management. Always prefix commands with:

```bash
direnv exec . <command>
```

This ensures the correct environment (including bun, node, etc.) is loaded.
