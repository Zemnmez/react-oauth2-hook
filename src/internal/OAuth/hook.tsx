import * as React from 'react'
import * as oauth from './proto/oauth';
import * as statetoken from './statetoken';
import * as storagekey from './storagekey';
import { useStorage } from 'react-storage-hook';

/**
 * useOAuth2Token is a React hook providing an OAuth2 implicit grant token.
 */
export const useOAuth2Token = (config: Config): [
  OAuthToken | undefined,
  getToken,
  setToken
] => {
  // storage for an OAuth token
  const [token, setToken] = useStorage<string>(
    storagekey.
  );

  const keyString = storagekey.OAuth2Token(config);

  // storage for state callbacks
  const [/* state */, setStateChallenge] = useStorage<string>(
    keyString
  )

  const getToken = React.useCallback(() => {
    const { token: stateToken, key: challenge } =
      statetoken.Pack(keyString);
      
    setStateChallenge(challenge);

    const target = new URL(config.authorizeUrl.toString());
    const params: oauth.ImplicitRequestParams = {
      response_type: "token",
      client_id: config.clientID,
      redirect_uri: config.redirectUri.toString(),
      ...config.scope?{scope: oauth.ScopesString(config.scope)}:{},
      state: stateToken,
    };

    const p_assert: typeof params & {
      [key: string]: any
    } = params

    target.search = new URLSearchParams(p_assert).toString()

    window.open(target.toString())
  }, [ setStateChallenge ])

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

/**
 * useOAuthCallback is a React hook used
 * to handle an OAuth2 callback. It should
 * be rendered on the application's redirect_uri.
 */
const useOAuthCallback = () => {
  const [challenge = "" as statetoken.Key] = useStorage<statetoken.Key>(storageprefix.stateChallenge);

  const requestParams = React.useMemo(() =>
    oauth.ParseRequestParams(new URL(location.href).searchParams)
  , [location.href]);

  const { scope = "" } = requestParams;

  const rsp = statetoken.Unpack(scope as statetoken.Token, challenge)
  const error = rsp instanceof Error? rsp: undefined;

  const [ /* */, setToken ] = useStorage(
    storageprefix.oauth2Token + '-' + scope
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