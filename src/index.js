import React from 'react'
import { useStorage } from 'react-storage-hook'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
const storagePrefix = 'react-oauth2-hook'
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
 * The `callbackUrl` should render the `Callback` component,
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
 * @param {string} {authorizeUrl} The OAuth2 authorize endpoint
 * @param {string[]} {scope} The scopes to request
 * @param {string} {redirectUri} The endpoint that recieves the OAuth2 callback
 * @param {string} {clientID} The OAuth2 client client_id
 * @example
 * const SpotifyTracks = () => {
 *  const [token, getToken] = useOAuth2Token({
 *      authorizeUrl: "https://accounts.spotify.com/authorize",
 *      scope: ["user-library-read"],
 *      clientID: "abcdefg",
 *      redirectUri: document.location.origin + "/callback"
 *  })
 *
 *  const [response, setResponse] = React.useState()
 *  const [error, setError] = React.useState()
 *
 *  // when we get a token, query spotify
 *  React.useEffect(() => {
 *      if (token == undefined) {return}
 *      fetch('https://api.spotify.com/v1/me/tracks', {
 *          headers: {
 *              Authorization: `Bearer ${token}`
 *          }
 *      }).then(
 *          json => response.json()
 *      ).then(
 *          data => setResponse(data)
 *      ).catch(
 *          error => setError(error)
 *      )
 *  }, [token])
 *
 *  if (!token || error) return <div onClick={getToken}> login with Spotify </div>
 *
 * return <div>
 *  Your saved tracks on Spotify: {JSON.stringify(response)}
 * </div>
 * }
 */
export const useOAuth2Token = ({
  authorizeUrl,
  scope = [],
  redirectUri,
  clientID
}) => {
  const target = {
    authorizeUrl, scope, clientID
  }

  const [token, setToken] = useStorage(
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

const cryptoRandomString = () => {
  const entropy = new Uint32Array(10)
  window.crypto.getRandomValues(entropy)

  return window.btoa([...entropy].join(','))
}

const OAuth2AuthorizeURL = ({
  scope,
  clientID,
  state,
  authorizeUrl,
  redirectUri
}) => `${authorizeUrl}?${Object.entries({
  scope: scope.join(','),
  client_id: clientID,
  state,
  redirect_uri: redirectUri,
  response_type: 'token'
}).map(([k, v]) => [k, v].map(encodeURIComponent).join('=')).join('&')}`

export const ErrIncorrectStateToken = new Error('incorrect state token')

const urlDecode = str => new Map(str.split('&').map(
  param => param.split('=').map(decodeURIComponent)))

const OAuthCallbackHandler = () => {
  const [state] = useStorage(oauthStateName)
  const { target } = JSON.parse(state)
  const [ /* token */, setToken ] = useStorage(
    storagePrefix + '-' + JSON.stringify(target)
  )

  console.log('rendering OAuthCallbackHandler')

  React.useEffect(() => {
    const params = new Map([
      ...urlDecode(window.location.search.slice(1)),
      ...urlDecode(window.location.hash.slice(1))
    ])

    if (state !== params.get('state')) throw ErrIncorrectStateToken

    setToken(params.get('access_token'))
    window.close()
  }, [])

  return 'please wait...'
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
export const OAuthCallback = ({
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

class ClosingErrorBoundary extends React.PureComponent {
  static getDerivedStateFromError(error) {
    console.log(error)
    // window.close()
  }

  render() { return this.props.children }
}

ClosingErrorBoundary.propTypes = {
  children: PropTypes.isRequired
}
