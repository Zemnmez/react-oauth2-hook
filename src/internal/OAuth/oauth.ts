import * as oauth from './proto/oauth';

/**
 * Options to useOauth2Token.
 */
export interface Config {
  /**
   * The OAuth authorize URL to retrieve the token from.
   */
  authorizeUrl: oauth.AuthorizeURL;

  /**
   * The OAuth scopes to request.
   */
  scope?: oauth.Scopes;

  /**
   * The OAuth `redirect_uri` callback.
   */
  redirectUri: oauth.RedirectURI;

  /**
   * The OAuth `client_id` corresponding to the requesting client.
   */
  clientID: oauth.ClientID;
}

export * from './proto/oauth';