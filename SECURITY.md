## Plural Security

We take security very seriously at Plural, we welcome any review of our open source code to ensure no application or infrastructure deployed by Plural is compromised.

### Where should I report security issues?

In order to give the community time to respond and upgrade we strongly urge you report all security issues privately. Please use our [vulnerability disclosure program at Hacker One](https://hackerone.com/plural) to provide details and repro steps and we will respond ASAP. If you prefer not to use Hacker One, email us directly at `support@plural.sh` with details and repro steps. Security issues *always* take precedence over bug fixes and feature work. We can and do mark releases as "urgent" if they contain serious security fixes.

### Password Storage

Plural uses Argon2 for password hashing.  This has been proven to be the most robust hashing algorithm.  

### Secret Storage

Plural stores some user provided secrets in postgres.  These are symetrically encrypted using AES-256

### Authentication

Plural's frontend communicates with its server-side exclusively using a gql api, with authentication managed by a hmac signed jwt.  Details on how that works can be found in the guardian configuration in `apps/core`