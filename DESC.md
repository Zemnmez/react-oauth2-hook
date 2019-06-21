# Security
Security is particularly vital for the OAuth protocol, as it involves several potentially risky steps and controls user identity.

## State
In OAuth, the state token is provided to the authorizing server (e.g. Facebook), and passed back to the client with all responses.
This is to validate the user that fulfills the callback is the one that initiated the authorization process. Otherwise, an attacker
can send their callback URL to a victim to cause the victim to be logged into the attacker account.

Here, we use webcrypto to generate random bytes, store them in `localStorage`, and verify the same bytes are returned to us.
The bytes are concatenated with an identifer of the authorization including the authorize endpoint and clientID. In this way,
