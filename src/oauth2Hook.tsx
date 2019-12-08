import * as React from 'react'
import { useStorage } from 'react-storage-hook'
import { Map } from 'immutable'

/**
 * storagePrefix is prepended to all localStorage
 * keys used by react-oauth2-hook
 */
export const storagePrefix = 'react-oauth2-hook'

/**
 * oauthStateName is the key name prepended to all
 * OAuth states stored by react-oauth2-hook
 */
export const oauthStateName = storagePrefix + '-state-token-challenge'


/**
 * Options to useOauth2Token.
 */
export interface Config {
  /**
   * The OAuth authorize URL to retrieve the token from.
   */
  authorizeUrl: string;

  /**
   * The OAuth scopes to request.
   */
  scope?: string[];

  /**
   * The OAuth `redirect_uri` callback.
   */
  redirectUri: string;

  /**
   * The OAuth `client_id` corresponding to the requesting client.
   */
  clientID: string;
}

type AuthorizeUrlConfig = Config & {
  state: string
}

const authorizeUrl = ({
  authorizeUrl,
  scope,
  redirectUri,
  clientID,
  state
}: AuthorizeUrlConfig): string =>
  `${authorizeUrl}?${urlEncode({
    scope: scope?.join(","),
    redirectUri,
    clientID,
    state
  })}`;

const urlEncode = (o: Record<string,string | undefined>): string =>
  Object.entries(o)
    .filter((val): val is [string, string] =>
      val.every(v=> v !== undefined))

    .map(([k, v]) =>
      [k, v].map(encodeURIComponent).join("=")).join("&");

/**
 * useOAuth2Token is a React hook providing an OAuth2 implicit grant token.
 */
export const useOAuth2Token = ({
  authorizeUrl,
  scope = [],
  redirectUri,
  clientID
}: Config): [
  OAuthToken | undefined,
  getToken,
  setToken
] => {
  const target = {
    authorizeUrl, scope, clientID
  }

  // storage for an OAuth token
  const [token, setToken] = useStorage<string>(
    storagePrefix + '-' + JSON.stringify(target)
  )

  // storage for state callbacks
  const [/* state */, setState] = useStorage<string>(
    oauthStateName
  )

  const getToken = React.useCallback(() => {
    const state = JSON.stringify({
      nonce: cryptoRandomString(),
      target
    })

    setState(state);

    window.open(OAuth2AuthorizeURL({
      scope,
      clientID,
      authorizeUrl,
      state,
      redirectUri
    }))
  }, [setState])

  return [token, getToken, setToken]
}

/**
 * OAuthToken represents an OAuth2 implicit grant token.
 */
export type OAuthToken = string

/**
 * getToken is returned by [[useOAuth2Token]].
 * When called, it prompts the user to authorize.
 */
export type getToken = () => void

/**
 * setToken is returned by [[useOAuth2Token]].
 * When called, it overwrites any stored OAuth token.
 * `setToken(undefined)` can be used to synchronously
 * invalidate all instances of this OAuth token.
 */
export type setToken = (newValue: OAuthToken | undefined) => void


const cryptoRandomString = () => {
  const entropy = new Uint32Array(10)
  window.crypto.getRandomValues(entropy)

  return window.btoa([...entropy].join(','))
}




/**
 * This error is thrown by the OAuthCallback
 * when the state token recieved is incorrect or does not exist.
 */
export const ErrIncorrectStateToken = new Error('incorrect state token')

/**
 * This error is thrown by the OAuthCallback
 * if no access_token is recieved.
 */
export const ErrNoAccessToken = new Error('no access_token')

export type State = {
  nonce: string,
  target: Config
}

const wrapState = (s: State): string => JSON.stringify(s);
const unwrapState = (s: string): State => JSON.parse(s);

const urlDecode = (urlString: string): Map<string,string> => Map(urlString.split('&').map<[string,string]>(
  (param: string): [string,string] => {
    const sepIndex = param.indexOf("=")
    const k = decodeURIComponent(param.slice(0, sepIndex))
    const v = decodeURIComponent(param.slice(sepIndex + 1))
    return [k, v]
  }))

  /**
   * useOAuthCallback is a React hook used
   * to handle an OAuth2 callback. It should
   * be rendered on the application's redirect_uri.
   */
const useOAuthCallback = () => {
  const [state] = useStorage<string>(oauthStateName);

  const { target } = JSON.parse(state)
  const [ /* token */, setToken ] = useStorage(
    storagePrefix + '-' + JSON.stringify(target)
  )

  console.log('rendering OAuthCallbackHandler')

  React.useEffect(() => {
    const params: Map<string,string> = Map([
      ...urlDecode(window.location.search.slice(1)),
      ...urlDecode(window.location.hash.slice(1))
    ])

    if (state !== params.get('state')) throw ErrIncorrectStateToken

    const token: string | undefined = params.get('access_token')
    if (token == undefined) throw ErrNoAccessToken

    setToken(token)
    window.close()
  }, [])
}

/**
 * OAuthCallback is a React component that handles the callback
 * step of the OAuth2 protocol.
 *
 * OAuth2Callback is expected to be rendered on the url corresponding
 * to your redirect_uri.
 *
 * By default, this component will deal with errors by closing the window,
 * via its own React error boundary. Pass `{ errorBoundary: false }`
 * to handle this functionality yourself.
 *
 * @example
 * <Route exact path="/callback" component={OAuthCallback} />} />
 */
export const OAuthCallback: React.FunctionComponent<{
  errorBoundary?: boolean
}> = ({
  /**
   * When set to true, errors are thrown
   * instead of just closing the window.
   */
  errorBoundary = true,
  children
}) => {
  if (errorBoundary === false) return <OAuthCallbackHandler>{children}</OAuthCallbackHandler>
  return <ClosingErrorBoundary>
    <OAuthCallbackHandler>{children}</OAuthCallbackHandler>
  </ClosingErrorBoundary>
}


class ClosingErrorBoundary extends React.PureComponent {
  state = { errored: false }

  static getDerivedStateFromError(error: string) {
    console.log(error)
    // window.close()
    return { errored: true }
  }

  render() { return this.state.errored ? null : this.props.children }
}