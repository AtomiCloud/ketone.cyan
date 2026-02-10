---
name: upgrade-cyan-template
description: Upgrade a CyanPrint template repository to latest versions. Use when user asks to "upgrade the template", "update cyan", or "update template dependencies" in a CyanPrint template project.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Upgrade Cyan Template

Upgrades CyanPrint template repositories by updating templates, dependencies, and verifying the changes.

## When to Use

- User asks to "upgrade the template"
- User asks to "update cyan" or "update cyanprint"
- User asks to "update template dependencies"
- User asks to "bump cyan version"

## Prerequisites

- Must be in a CyanPrint template repository root (contains `cyan.yaml`)
- `cyanprint` or `cyan` CLI must be installed and available in PATH
- Working directory should be clean (no uncommitted changes recommended)

## Instructions

### Step 1: Locate and Verify Project Structure

**CRITICAL**: The CyanPrint template repository root contains `cyan.yaml`. You may not be in the correct directory initially.

First, determine the template repository root by searching for `cyan.yaml`:

```bash
# Find cyan.yaml - this identifies the template repository root
# Start by checking current directory, then parent directories
TEMPLATE_ROOT=""
if [ -f "cyan.yaml" ]; then
  TEMPLATE_ROOT="$(pwd)"
elif [ -f "../cyan.yaml" ]; then
  TEMPLATE_ROOT="$(dirname "$(pwd)")"
elif [ -f "../../cyan.yaml" ]; then
  TEMPLATE_ROOT="$(dirname "$(dirname "$(pwd)")")"
else
  # Use find to search upward
  TEMPLATE_ROOT="$(dirname "$(find . -name 'cyan.yaml' -mindepth 1 -maxdepth 3 2>/dev/null | head -1)")"
fi

if [ -z "$TEMPLATE_ROOT" ] || [ ! -f "$TEMPLATE_ROOT/cyan.yaml" ]; then
  echo "ERROR: Cannot find cyan.yaml. This is not a CyanPrint template repository."
  exit 1
fi

echo "Found CyanPrint template root at: $TEMPLATE_ROOT"
```

Once the template root is found, verify the structure:

```bash
# Check cyan subdirectory (should contain package.json)
test -d "$TEMPLATE_ROOT/cyan" && test -f "$TEMPLATE_ROOT/cyan/package.json" || echo "ERROR: cyan/package.json not found."

# Check templates directory (optional, may contain nested cyan/)
test -d "$TEMPLATE_ROOT/templates" || echo "WARNING: templates/ directory not found."
```

**Important**: All subsequent commands must use absolute paths or be run from `$TEMPLATE_ROOT`.

### Step 1b: Handle Shell Environment Issues

**IMPORTANT**: If you encounter `__zoxide_z` errors or other shell configuration issues, use `/bin/sh -c` wrappers to bypass user shell configuration:

```bash
# Instead of: cd /path/to/dir && command
# Use: /bin/sh -c "cd /path/to/dir && command"
```

This avoids conflicts with zsh/zoxide and other shell customizations.

### Step 2: Run Cyan Update

Run `cyanprint update` at the repository root to update all templates. Use `/bin/sh -c` to avoid shell configuration issues:

```bash
# Use absolute path and shell wrapper to avoid shell issues
/bin/sh -c "cd $TEMPLATE_ROOT && cyanprint update"
```

**ALTERNATIVE** (if the above doesn't work):

```bash
# Try with direnv explicitly
/bin/sh -c "direnv exec $TEMPLATE_ROOT cyanprint update"
```

**IMPORTANT**: Monitor the output for ANY interactive prompts. If cyan asks for user input:

1. Immediately abort the operation (Ctrl+C if needed)
2. Record the question/prompt that was asked
3. Inform the user that the update requires manual intervention

If `cyan update` completes without prompts, proceed to Step 3.

### Step 3: Update Root Cyan Dependencies

Update dependencies in the root `cyan/` directory to latest major versions:

```bash
# Update dependencies using absolute path with shell wrapper
/bin/sh -c "cd $TEMPLATE_ROOT/cyan && bun update"

# If bun is not available, try npm
/bin/sh -c "cd $TEMPLATE_ROOT/cyan && npm update --latest"
```

Verify the updated dependencies by reading `$TEMPLATE_ROOT/cyan/package.json`:

```bash
# Read the package.json to check changes
cat "$TEMPLATE_ROOT/cyan/package.json"
```

### Step 4: Update Nested Cyan Dependencies

Update dependencies in `templates/cyan/` (if it exists):

```bash
if [ -d "$TEMPLATE_ROOT/templates/cyan" ]; then
  # Update to latest versions using absolute path with shell wrapper
  /bin/sh -c "cd $TEMPLATE_ROOT/templates/cyan && bun update"
  # or: /bin/sh -c "cd $TEMPLATE_ROOT/templates/cyan && npm update --latest"
else
  echo "No templates/cyan directory found, skipping nested cyan update."
fi
```

### Step 5: Verify the Update

Run tests, linting, and type checking to verify the update worked. Use absolute paths and shell wrappers:

```bash
# From repository root, run available verification commands
/bin/sh -c "cd $TEMPLATE_ROOT && bun run test 2>&1" || echo "No test command found"
/bin/sh -c "cd $TEMPLATE_ROOT && bun run lint 2>&1" || echo "No lint command found"
/bin/sh -c "cd $TEMPLATE_ROOT && bun run typecheck 2>&1" || echo "No typecheck command found"
```

Also verify TypeScript compilation in cyan directories:

```bash
# Check root cyan - use bunx tsc if tsc is not directly available
/bin/sh -c "cd $TEMPLATE_ROOT && direnv exec . bunx tsc --noEmit 2>&1"

# Check nested cyan (if it exists)
if [ -d "$TEMPLATE_ROOT/templates/cyan" ]; then
  /bin/sh -c "cd $TEMPLATE_ROOT && direnv exec . bunx tsc --noEmit 2>&1"
fi
```

Note: Many CyanPrint template projects don't have test/lint/typecheck scripts - this is acceptable. Focus on TypeScript compilation passing.

### Step 6: Report Summary

Provide a summary of what was updated. Check git status from the template root:

```bash
# Check git status from template root
/bin/sh -c "cd $TEMPLATE_ROOT && git status"

# Show diffs for modified files
/bin/sh -c "cd $TEMPLATE_ROOT && git diff .cyan_state.yaml"
/bin/sh -c "cd $TEMPLATE_ROOT && git diff cyan/package.json"
```

Report:

- Templates updated: (list any changes from cyan update output)
- Dependencies updated in `cyan/package.json`: (list version changes via git diff)
- Dependencies updated in `templates/cyan/package.json`: (list version changes)
- Verification status: (pass/fail with details)

**Note**: If `bun.lockb` was replaced with `bun.lock`, this is expected behavior from modern bun versions.

## Reference

For detailed CyanPrint commands and project structure, see [reference.md](reference.md).

## Troubleshooting

| Issue                                    | Solution                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| cyan.yaml not found in current directory | The template root is likely a parent directory. Use the search logic in Step 1 to find it. |
| `__zoxide_z` or other shell errors       | Use `/bin/sh -c` wrapper to bypass user shell configuration: `/bin/sh -c "command"`        |
| Working directory confusion              | Always use absolute paths (`$TEMPLATE_ROOT`) instead of relative paths (`cd cyan`).        |
| cyan update prompts for input            | Abort immediately. This indicates the template requires manual configuration.              |
| bun/npm not found                        | Use `direnv exec .` prefix to ensure the nix shell environment is loaded.                  |
| TypeScript errors after update           | Rollback the specific dependency that caused the issue and inform user.                    |
| No test/lint commands                    | This is acceptable. Report what verification was attempted.                                |
| `cd` command fails                       | You may be in a nested directory. Use `TEMPLATE_ROOT` variable with absolute paths.        |
| git diff shows unexpected files          | Check git status from `$TEMPLATE_ROOT`, not from subdirectories.                           |

## Related Skills

- [conventional-commits](../conventional-commits/SKILL.md) - For committing the upgrade changes
