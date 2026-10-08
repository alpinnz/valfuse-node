# Git Workflow

Protect existing work.

## Never implicitly

- force push
- reset shared history
- delete branches
- amend shared commits
- rebase shared branches
- merge PRs
- push remote changes

## Before committing

- inspect diff
- exclude unrelated changes
- run relevant verification
- write a meaningful commit message

## Commit messages

Avoid meaningless messages such as:

- fix
- update
- changes
- resolve issue
- adjustment

Prefer domain-specific intent.

## Remote state

Remote GitHub or Bitbucket state must not be modified unless explicitly
requested. Do not touch Git repositories unless required only to inspect
context.

## Commit Rules

Commits must represent clear, intentional, and reviewable units of work.

Prefer small cohesive commits over large mixed commits.

A commit should answer clearly:

* what changed
* which area changed
* why the change exists when it is not obvious

### Commit Format

Use Conventional Commits by default:

```text
<type>(<scope>): <description>
```

The scope is optional.

Examples:

```text
feat(product): add product variant selection

fix(contact): prevent duplicate import submission

refactor(http): simplify request error handling

test(import): add validation failure scenarios

docs(api): document authentication flow

chore(deps): update development dependencies
```

For changes that do not need a scope:

```text
fix: prevent duplicate form submission

docs: update local development setup

chore: remove unused configuration
```

### Allowed Types

Prefer these commit types:

```text
feat      new user-facing or business functionality
fix       bug fix
refactor  internal code improvement without intentional behavior change
perf      measurable performance improvement
test      test additions or corrections
docs      documentation-only changes
build     build system or dependency/build configuration changes
ci        CI/CD configuration changes
chore     maintenance work that does not fit another type
revert    revert a previous commit
```

Do not invent new commit types unless the repository already defines them.

Follow repository-specific commit conventions when they exist.

### Subject Rules

Commit subjects must:

* describe the actual change
* be concise and specific
* use lowercase after the type/scope unless domain naming requires otherwise
* use an imperative/action-oriented description
* avoid unnecessary punctuation
* avoid vague wording
* normally stay within approximately 72 characters when practical

Prefer:

```text
fix(import): prevent duplicate contact submission

feat(product): add variant availability settings

refactor(auth): separate token validation from parsing

perf(report): reduce redundant database queries
```

Avoid:

```text
fix stuff

update code

changes

resolve issue

fix bug

minor changes

final fix

working now

update latest

refactor things
```

Avoid ambiguous verbs such as:

```text
resolve
handle
process
manage
update
change
```

when a more specific description is available.

For example, prefer:

```text
fix(auth): reject expired refresh tokens
```

instead of:

```text
fix(auth): resolve token issue
```

Prefer:

```text
refactor(contact): extract contact normalization
```

instead of:

```text
refactor(contact): update contact code
```

### Scope Naming

Use a scope when it makes the affected area clearer.

Prefer domain or module names:

```text
auth
contact
product
inventory
invoice
journal
report
import
export
api
database
http
ui
form
routing
deps
```

Avoid meaningless scopes:

```text
misc
common
general
utils
helper
code
stuff
temp
```

Do not add a scope merely to satisfy the format.

### Commit Cohesion

Each commit should represent one logical intent.

Do not mix unrelated changes such as:

```text
feature implementation
+
unrelated refactor
+
dependency upgrade
+
formatting unrelated files
```

into one commit.

Separate them when they can be understood, reviewed, reverted, or tested independently.

A little supporting refactoring may remain in the same commit when it is directly required for the primary change.

Do not create artificial micro-commits that provide no independent value.

### Before Committing

Before creating a commit:

1. Inspect `git status`.
2. Inspect the staged and unstaged diff.
3. Identify unrelated changes.
4. Stage only files belonging to the intended commit.
5. Check for accidental generated files, temporary files, secrets, credentials, logs, or local configuration.
6. Run relevant verification when appropriate.
7. Confirm the commit message accurately represents the staged diff.

Never commit files merely because they are currently modified.

Never silently include unrelated changes.

### Verification

Before committing implementation changes, run the relevant checks available in the repository when practical:

```text
formatter
lint
typecheck
unit tests
integration tests
build
```

Choose checks based on the risk and scope of the change.

Do not claim verification that was not actually performed.

If verification cannot be completed, make that limitation explicit.

### Commit Body

A commit body is optional.

Use it when the reason, constraint, migration impact, or non-obvious decision cannot be understood from the subject alone.

Recommended structure:

```text
type(scope): concise description

Explain why the change is necessary when the reason is not obvious.

Mention important behavioral, compatibility, migration, or operational
considerations when relevant.
```

Example:

```text
fix(import): prevent duplicate commit requests

Disable submission while the import commit request is in progress.

This prevents users from creating duplicate jobs when the submit action
is triggered repeatedly before the first request completes.
```

Do not repeat the subject in the body.

### Breaking Changes

Breaking changes must be explicit.

Use:

```text
feat(api)!: replace legacy contact response format
```

and explain the impact in the body:

```text
BREAKING CHANGE: contact responses now use the normalized contact
collection and no longer expose the legacy contact fields.
```

Only mark a change as breaking when compatibility is actually affected.

### Personal Commit Identity

Commits must use the developer identity configured in Git.

Use:

```bash
git config user.name
git config user.email
```

as the source of commit authorship.

Do not modify Git identity automatically.

Do not add additional authors, co-authors, attribution trailers, or generated attribution unless explicitly requested by the developer or required by the repository.

### No Tool Attribution

Commit messages must describe the software change only.

Never add references indicating that the change was created, generated, assisted, reviewed, or implemented by an AI system, coding assistant, automation agent, or development tool.

Do not add text such as:

```text
Generated by ...
Created with ...
Assisted by ...
AI-generated
AI-assisted
ChatGPT
Codex
agent
agentic
bot-generated
```

Do not automatically add attribution trailers such as:

```text
Co-Authored-By: ...
Generated-By: ...
Assisted-By: ...
AI-Generated-By: ...
```

Commit history should represent the developer and the engineering change, not the tooling used to produce it.

### Amend and History Safety

Do not amend an existing commit unless explicitly requested or clearly part of the current unpushed workflow.

Do not rewrite shared history without explicit authorization.

Never automatically:

```text
git commit --amend
git rebase
git reset --hard
git push --force
git push --force-with-lease
```

unless explicitly requested and the consequences are understood.

### Commit Message Selection

Derive the commit message from the actual staged diff.

Do not determine the message only from:

* task descriptions
* ticket titles
* branch names
* conversation context
* file names

The staged changes are the source of truth.

When several messages are technically possible, choose the shortest message that accurately communicates the primary engineering intent.

### Recommended Examples

Feature:

```text
feat(product): add variant availability settings
```

Bug fix:

```text
fix(import): prevent duplicate contact submissions
```

Internal refactor:

```text
refactor(http): separate response parsing from error mapping
```

Performance:

```text
perf(journal): reduce redundant account queries
```

Testing:

```text
test(contact): cover import validation failures
```

Documentation:

```text
docs(api): document contact import endpoints
```

Dependency maintenance:

```text
chore(deps): update frontend development dependencies
```

CI:

```text
ci: add typecheck to pull request validation
```

Breaking change:

```text
feat(api)!: replace legacy product response schema
```

### Final Principle

A good commit should be:

```text
focused
reversible
reviewable
traceable
understandable without external context
```

Prefer a clear engineering history over a large number of commits or excessively detailed commit messages.
