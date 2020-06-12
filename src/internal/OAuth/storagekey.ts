import * as oauth from './oauth';
export const stateChallenge = 'react-oauth2-hook.state-token-challenge' as const;
const oauth2TokenPrefix = 'react-auth2-hook.oauth-token' as const;

/**
 * The group of OAuth config options used to match
 * tokens to each other
 */
interface Key extends Omit<oauth.AuthorizationRequestParams, 'scope'>{ }

const ConfigToKey:
  (c: oauth.Config) => Key
=
  ({ scope, redirectUri, clientID, ...etc }) => ({
    response_type: "code",
    ...scope?{scope: oauth.ScopesString(scope)}:{},
    redirect_uri: oauth.RedirectURIString(redirectUri),
    client_id: clientID,
    ...etc
  })
;

const KeyString:
  (k: Key) => string
=
  k => {
    const v: Key & {
      [key: string]: any
    } = k;
    const params = new URLSearchParams(v);
    params.sort()
    return params.toString()
  }
;

export const OAuth2Token:
  (o: oauth.Config) => string
=
  o => `${oauth2TokenPrefix}::${KeyString(ConfigToKey(o))}`
;