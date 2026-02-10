---
name: upgrade-cyan
description: Upgrade cyan framework and update npm packages. Use when the user asks to upgrade cyan, update cyan packages, or run cyan update.
---

# Upgrade Cyan

Upgrades the cyan framework and updates npm packages across the project.

## When to Use

- User asks to "upgrade cyan" or "update cyan"
- User mentions updating cyan packages
- User wants to run cyan update commands

## Instructions

### Step 1: Run Cyan Update at Repo Root

First, run `cyan update` at the repository root. The command may have interactive prompts.

1. Run: `direnv exec . cyan update`
2. If there are any interactive questions or prompts, collect them and ask the user for input
3. Wait for user responses before proceeding

### Step 2: Run Cyan Update in Templates Directory

After the repo root update completes, run the same command in the templates directory.

1. Run: `cd templates && direnv exec . cyan update`
2. Again, collect any interactive questions and ask the user for input

### Step 2.5: Handle Cyanprint Merge Conflicts

**IMPORTANT**: When cyanprint updates templates and encounters conflicts, it presents them using standard merge conflict syntax (`<<<<<<<`, `=======`, `>>>>>>>`). These are **NOT git conflicts** - they are cyanprint's way of materializing update conflicts.

**DO NOT**:

- Use `git merge` or `git merge-tool` to resolve these
- Automatically resolve conflicts yourself

**DO**:

- Identify files with merge conflict markers
- Read each conflicted file
- Present the conflicts clearly to the user
- Show what the "current" version (HEAD) contains
- Show what the "incoming" version contains
- Ask the user how they want to resolve each conflict
- Apply the user's chosen resolution using the Edit tool

### Step 3: Update Packages

Update npm packages in both locations:

1. **cyan/package.json**: Run `direnv exec . npm update` in the cyan directory
2. **templates/cyan/package.json**: Run `direnv exec . npm update` in the templates/cyan directory

### Step 4: Verify Changes

Show the user a summary of what was updated:

- Cyan version changes
- Package version changes
- Any warnings or issues

## Reference

The cyan framework has two main locations in this project:

- **Repo root**: `/` - Main cyan installation
- **Templates**: `/templates/` - Template cyan installation

Both locations have their own cyan configuration and package.json files that need to be kept in sync.
