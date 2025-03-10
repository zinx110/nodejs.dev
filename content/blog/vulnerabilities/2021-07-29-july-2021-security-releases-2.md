---
title: July 2021 Security Releases
blogAuthors: ['node-js-website']
category: 'vulnerabilities'
---

## Security releases available

Updates are now available for v16.x, v14.x, and v12.x Node.js release lines for
the following issue.

We normally like to give advance notice and provide releases in which the only
changes are security fixes, but since this vulnerability was already public we
felt it was more important to get this fix out fast in releases that were
already planned.

### Use after free on close http2 on stream canceling (High) (CVE-2021-22930)

Node.js is vulnerable to a use after free attack where an attacker might
be able to exploit the memory corruption, to change process behavior.

You can read more about it in
<https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-22930>

Thank you to Eran Levin (exx8) for reporting this vulnerability.

Impacts:

* All versions of the 16.x, 14.x, and 12.x releases lines

## Downloads and release details

* [Node.js v12.22.4 (LTS)](https://nodejs.org/en/blog/release/v12.22.4/)
* [Node.js v14.17.4 (LTS)](https://nodejs.org/en/blog/release/v14.17.4/)
* [Node.js v16.6.0 (Current)](https://nodejs.org/en/blog/release/v16.6.0/)
