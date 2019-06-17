
# react-oauth2-hook

> Retrieve OAuth2 implicit grant tokens purely on the client without destroying application state.

Licence: MIT

![NPM](https://img.shields.io/npm/v/react-oauth2-hook.svg)](https://www.npmjs.com/package/react-oauth2-hook) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
yarn add react-oauth2-hook
```

## Constants

<dl>
<dt><a href="#useOAuth2Token">useOAuth2Token</a></dt>
<dd><p>useOAuth2Token is a React hook providing an OAuth2 implicit grant token.</p>
<p>When useToken is called, it will attempt to retrieve an existing
token by the criteria of <code>{ authorizeUrl, scopes, clientID }</code>.
If a token by these specifications does not exist, the first
item in the returned array will be <code>undefined</code>.</p>
<p>If the user wishes to retrieve a new token, they can call <code>getToken()</code>,
a function returned by the second parameter. When called, the function
will open a window for the user to confirm the OAuth grant, and
pass it back as expected via the hook.</p>
<p>The OAuth token must be passed to a static endpoint. As
such, the <code>callbackUrl</code> must be passed with this endpoint.
The <code>callbackUrl</code> should render the <code>Callback</code> component,
which will securely verify the token and pass it back,
before closing the window.</p>
<p>All instances of this hook requesting the same token and scopes
from the same place are synchronised. In concrete terms,
if you have many components waiting for a Facebook OAuth token
to make a call, they will all immediately update when any component
gets a token.</p>
<p>Finally, in advanced cases the user can manually overwrite any
stored token by capturing and calling the third item in
the reponse array with the new value.</p>
</dd>
<dt><a href="#OAuthCallback">OAuthCallback</a></dt>
<dd><p>OAuthCallback is a React component that handles the callback
step of the OAuth2 protocol.</p>
<p>OAuth2Callback is expected to be rendered on the url corresponding
to your redirect_uri.</p>
<p>By default, this component will deal with errors by closing the window,
via its own React error boundary. Pass <code>{ errorBoundary: false }</code>
to handle this functionality yourself.</p>
</dd>
</dl>

<a name="useOAuth2Token"></a>

## useOAuth2Token
useOAuth2Token is a React hook providing an OAuth2 implicit grant token.

When useToken is called, it will attempt to retrieve an existing
token by the criteria of `{ authorizeUrl, scopes, clientID }`.
If a token by these specifications does not exist, the first
item in the returned array will be `undefined`.

If the user wishes to retrieve a new token, they can call `getToken()`,
a function returned by the second parameter. When called, the function
will open a window for the user to confirm the OAuth grant, and
pass it back as expected via the hook.

The OAuth token must be passed to a static endpoint. As
such, the `callbackUrl` must be passed with this endpoint.
The `callbackUrl` should render the `Callback` component,
which will securely verify the token and pass it back,
before closing the window.

All instances of this hook requesting the same token and scopes
from the same place are synchronised. In concrete terms,
if you have many components waiting for a Facebook OAuth token
to make a call, they will all immediately update when any component
gets a token.

Finally, in advanced cases the user can manually overwrite any
stored token by capturing and calling the third item in
the reponse array with the new value.

**Kind**: global constant  
**Example**  
```js
const SpotifyTracks = () => {
 const [token, getToken] = useOAuth2Token({
     authorizeUrl: "https://accounts.spotify.com/authorize",
     scope: ["user-library-read"],
     clientID: "abcdefg",
     redirectUri: document.location.origin + "/callback"
 })

 const [response, setResponse] = React.useState()
 const [error, setError] = React.useState()

 // when we get a token, query spotify
 React.useEffect(() => {
     if (token == undefined) {return}
     fetch('https://api.spotify.com/v1/me/tracks', {
         headers: {
             Authorization: `Bearer ${token}`
         }
     }).then(
         json => response.json()
     ).then(
         data => setResponse(data)
     ).catch(
         error => setError(error)
     )
 }, [token])

 if (!token || error) return <div onClick={getToken}> login with Spotify </div>

return <div>
 Your saved tracks on Spotify: {JSON.stringify(response)}
</div>
}
```
<a name="OAuthCallback"></a>

## OAuthCallback
OAuthCallback is a React component that handles the callback
step of the OAuth2 protocol.

OAuth2Callback is expected to be rendered on the url corresponding
to your redirect_uri.

By default, this component will deal with errors by closing the window,
via its own React error boundary. Pass `{ errorBoundary: false }`
to handle this functionality yourself.

**Kind**: global constant  
**Example**  
```js
<Route exact path="/callback" component={OAuthCallback} />} />
```
