/**
 * @module react-oauth2-hook
 */

/**
 *
 */

import * as React from 'react'

// react-storage-hook.d.ts
import { useStorage } from 'react-storage-hook'

import { Map } from 'immutable'
import * as PropTypes from 'prop-types'

/**
 * @hidden
 */
const storagePrefix = 'react-oauth2-hook'

/**
 * @hidden
 */
const oauthStateName = storagePrefix + '-state-token-challenge'

/**
 * useOAuth2Token is a React hook providing an OAuth2 implicit grant token.
 *
 * When useToken is called, it will attempt to retrieve an existing
 * token by the criteria of `{ authorizeUrl, scopes, clientID }`.
 * If a token by these specifications does not exist, the first
 * item in the returned array will be `undefined`.
 *
 * If the user wishes to retrieve a new token, they can call `getToken()`,
 * a function returned by the second parameter. When called, the function
 * will open a window for the user to confirm the OAuth grant, and
 * pass it back as expected via the hook.
 *
 * The OAuth token must be passed to a static endpoint. As
 * such, the `callbackUrl` must be passed with this endpoint.
 * The `callbackUrl` should render the [[OAuthCallback]] component,
 * which will securely verify the token and pass it back,
 * before closing the window.
 *
 * All instances of this hook requesting the same token and scopes
 * from the same place are synchronised. In concrete terms,
 * if you have many components waiting for a Facebook OAuth token
 * to make a call, they will all immediately update when any component
 * gets a token.
 *
 * Finally, in advanced cases the user can manually overwrite any
 * stored token by capturing and calling the third item in
 * the reponse array with the new value.
 *
 * @param authorizeUrl The OAuth authorize URL to retrieve the token from.
 * @param scope The OAuth scopes to request.
 * @param redirectUri The OAuth redirect_uri callback URL.
 * @param clientID The OAuth client_id corresponding to the requesting client.
 * @example
 *const SpotifyTracks = () => {
 * const [token, getToken] = useOAuth2Token({
 *     authorizeUrl: "https://accounts.spotify.com/authorize",
 *     scope: ["user-library-read"],
 *     clientID: "abcdefg",
 *     redirectUri: document.location.origin + "/callback"
 * })
 *
 * const [response, setResponse] = React.useState()
 * const [error, setError] = React.useState()
 *
 * // when we get a token, query spotify
 * React.useEffect(() => {
 *     if (token == undefined) {return}
 *     fetch('https://api.spotify.com/v1/me/tracks', {
 *         headers: {
 *             Authorization: `Bearer ${token}`
 *         }
 *     }).then(
 *         json => response.json()
 *     ).then(
 *         data => setResponse(data)
 *     ).catch(
 *         error => setError(error)
 *     )
 * }, [token])
 *
 * if (!token || error) return <div onClick={getToken}> login with Spotify </div>
 *
 *return <div>
 * Your saved tracks on Spotify: {JSON.stringify(response)}
 *</div>
 *}
 */
export const useOAuth2Token = ({
  /**
   * The OAuth authorize URL to retrieve the token
   * from.
   */
  authorizeUrl,
  /**
   * The OAuth scopes to request.
   */
  scope = [],
  /**
   * The OAuth `redirect_uri` callback.
   */
  redirectUri,
  /**
   * The OAuth `client_id` corresponding to the
   * requesting client.
   */
  clientID
}: {
  authorizeUrl: string
  scope: string[],
  redirectUri: string,
  clientID: string
}): [
  OAuthToken | undefined,
  getToken,
  setToken
] => {
  const target = {
    authorizeUrl, scope, clientID
  }

  const [token, setToken]: [OAuthToken | undefined, (newValue: string) => void] = useStorage(
    storagePrefix + '-' + JSON.stringify(target)
  )

  let [state, setState] = useStorage(
    oauthStateName
  )

  const getToken = () => {
    setState(state = JSON.stringify({
      nonce: cryptoRandomString(),
      target
    }))

    window.open(OAuth2AuthorizeURL({
      scope,
      clientID,
      authorizeUrl,
      state,
      redirectUri
    }))
  }

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

/**
 * @hidden
 */
const cryptoRandomString = () => {
  const entropy = new Uint32Array(10)
  window.crypto.getRandomValues(entropy)

  return window.btoa([...entropy].join(','))
}

/**
 * @hidden
 */
const OAuth2AuthorizeURL = ({
  scope,
  clientID,
  state,
  authorizeUrl,
  redirectUri
}: {
  scope: string[],
  clientID: string,
  state: string,
  authorizeUrl: string,
  redirectUri: string
}) => `${authorizeUrl}?${Object.entries({
  scope: scope.join(','),
  client_id: clientID,
  state,
  redirect_uri: redirectUri,
  response_type: 'token'
}).map(([k, v]) => [k, v].map(encodeURIComponent).join('=')).join('&')}`

/**
 * This error is thrown by the [[OAuthCallback]]
 * when the state token recieved is incorrect or does not exist.
 */
export const ErrIncorrectStateToken = new Error('incorrect state token')

/**
 * This error is thrown by the [[OAuthCallback]]
 * if no access_token is recieved.
 */
export const ErrNoAccessToken = new Error('no access_token')


/**
 * @hidden
 */
const urlDecode = (urlString: string): Map<string,string> => Map(urlString.split('&').map<[string,string]>(
  (param: string): [string,string] => {
    const [k, v] = param.split('=').map(decodeURIComponent)
    return [k, v]
  }))

/**
 * @hidden
 */
const OAuthCallbackHandler: React.FunctionComponent<{}> = () => {
  const [state] = useStorage(oauthStateName)
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

  return <React.Fragment>'please wait...'</React.Fragment>
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
  errorBoundary = true
}) => {
  if (errorBoundary === false) return <OAuthCallbackHandler />
  return <ClosingErrorBoundary>
    <OAuthCallbackHandler />
  </ClosingErrorBoundary>
}

OAuthCallback.propTypes = {
  errorBoundary: PropTypes.bool
}

/**
 * @hidden
 */
class ClosingErrorBoundary extends React.PureComponent {
  static getDerivedStateFromError(error: string) {
    console.log(error)
    // window.close()
  }


  static propTypes = {
    children: PropTypes.func.isRequired
  }

  render() { return this.props.children }
}


export default "this module has no default export.";
