# Security

Treat security as part of correctness.

## Always consider

- authentication
- authorization
- input validation
- output encoding
- SQL injection
- command injection
- XSS
- CSRF
- SSRF
- path traversal
- insecure deserialization
- privilege escalation
- secrets exposure
- sensitive-data exposure
- unsafe file handling
- dependency vulnerabilities

## Principles

- Authentication does not imply authorization.
- Important business validation must exist at the authoritative
  backend/domain boundary.
- Treat external input as untrusted.
- Never commit secrets, log passwords, log access tokens, log authorization
  headers, expose private keys, or put secrets in frontend bundles.

## Tooling roles

- Security Guidance is preventive.
- Semgrep is detective/static analysis.
- They are complementary.
- A clean Semgrep result does not prove correctness or security.