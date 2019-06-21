> ## [react-oauth2-hook](README.md)

[react-oauth2-hook](README.md) /

> Retrieve OAuth2 implicit grant tokens purely on the client without destroying application state.

## Installation

```bash
yarn add react-oauth2-hook
```

abc

**`example`** 

```javascript
import React from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import levenshtein from 'fast-levenshtein'
import twitchSingsSongs from './TwitchSings_SongList.json'
import { Map } from 'immutable'

import { useOAuth2Token, OAuthCallback }  from 'react-oauth2-hook'

export default class App extends React.Component {
render () {
return (
<div>
<BrowserRouter>
<Switch>
<Route path={"//callback"} component={OAuthCallback}/>
<Route path={"/callback"} component={OAuthCallback}/>
<Route path={"react-oauth2-hook/callback"} component={OAuthCallback}/>
<Route path={"react-oauth2-hook//callback"} component={OAuthCallback}/>
<Route component={SavedTracks} />
</Switch>
</BrowserRouter>
</div>
)
}
}
const SavedTracks = () => {
const [token, getToken] = useOAuth2Token({
authorizeUrl: "https://accounts.spotify.com/authorize",
scope: ["user-library-read"],
clientID: "bd9844d654f242f782509461bdba068c",
redirectUri: document.location.href+"/callback"
})

const [savedTracks, setSavedTracks] = React.useState([])
const [error, setError] = React.useState()

// when we get a token, query Spotify
React.useEffect(() => {
if (token === undefined) return;
let tracks = []
setSavedTracks([])
const getTracks = (url) => fetch(url, {
headers: {
Authorization: `Bearer ${token}`
}
}).then(
response => response.json()
).then(
data => {
if(data.error) throw data.error;
return data;
}
).then(
data => {
tracks = tracks.concat(data.items)
setSavedTracks(tracks)
if (data.next) getTracks(data.next);
}
).catch(
error => setError(error)
);

getTracks('https://api.spotify.com/v1/me/tracks?limit=50')
}, [token] )

return <div>
{!(token || error || !savedTracks) && <div onClick={getToken}>login with Spotify</div>}
{error && <div> Error {error.message} </div>}
You might like to try these songs on Twitch Sings:
<TwitchSingsSongs {...{
spotifyTracks: savedTracks
}}/>
</div>
}

const TwitchSingsSongs = ({ spotifyTracks }) => {
console.log(spotifyTracks)
const artists = [...spotifyTracks.reduce(
(set, {track: { artists }}) => {
artists.forEach(({ name }) => set.add(name))
return set
}, new Set())];

console.log(artists)

const songs = twitchSingsSongs.songs.filter(
({ made_famous_by }) => artists.some(
artist => levenshtein.get(made_famous_by.toLowerCase(), artist.toLowerCase()) < 4
)
)

return <table>
<thead>
<tr>{
["title", "made famous by"].map(v => <td key={v}>{v}</td>)
}</tr>
</thead>
<tbody>
{songs.map(
({title, made_famous_by: artist }, i) => <tr key={i}>
<td>{title}</td>
<td>{artist}</td>
</tr>
)}
</tbody>
</table>
}
```

**`requires`** prop-types

**`requires`** react

**`requires`** react-dom

**`summary`** Retrieve OAuth2 implicit grant tokens purely on the client without destroying application state.

**`version`** 1.0.3

**`license`** MIT

**`author`** zemnmez

**`copyright`** zemnmez 2019

**`copyright`** zemnmez 2019

**`license`** MIT

### Index

#### Variables

* [ErrIncorrectStateToken](README.md#const-errincorrectstatetoken)
* [ErrNoAccessToken](README.md#const-errnoaccesstoken)

#### Functions

* [OAuthCallback](README.md#const-oauthcallback)
* [useOAuth2Token](README.md#const-useoauth2token)

## Variables

### `Const` ErrIncorrectStateToken

● **ErrIncorrectStateToken**: *`Error`* =  new Error('incorrect state token')

*Defined in [index.tsx:173](https://github.com/Zemnmez/react-oauth2-hook/blob/9aad1a9/src/index.tsx#L173)*

This error is thrown by the [OAuthCallback](README.md#const-oauthcallback)
when the state token recieved is incorrect or does not exist.

___

### `Const` ErrNoAccessToken

● **ErrNoAccessToken**: *`Error`* =  new Error('no access_token')

*Defined in [index.tsx:179](https://github.com/Zemnmez/react-oauth2-hook/blob/9aad1a9/src/index.tsx#L179)*

This error is thrown by the [OAuthCallback](README.md#const-oauthcallback)
if no access_token is recieved.

___

## Functions

### `Const` OAuthCallback

▸ **OAuthCallback**(`__namedParameters`: object): *`Element`*

*Defined in [index.tsx:237](https://github.com/Zemnmez/react-oauth2-hook/blob/9aad1a9/src/index.tsx#L237)*

OAuthCallback is a React component that handles the callback
step of the OAuth2 protocol.

OAuth2Callback is expected to be rendered on the url corresponding
to your redirect_uri.

By default, this component will deal with errors by closing the window,
via its own React error boundary. Pass `{ errorBoundary: false }`
to handle this functionality yourself.

**Parameters:**

■` __namedParameters`: *object*

Name | Type | Default |
------ | ------ | ------ |
`errorBoundary` | boolean | true |

**Returns:** *`Element`*

___

### `Const` useOAuth2Token

▸ **useOAuth2Token**(`__namedParameters`: object): *string | function[]*

*Defined in [index.tsx:95](https://github.com/Zemnmez/react-oauth2-hook/blob/9aad1a9/src/index.tsx#L95)*

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

**Parameters:**

■` __namedParameters`: *object*

Name | Type | Default |
------ | ------ | ------ |
`authorizeUrl` | string | - |
`clientID` | string | - |
`redirectUri` | string | - |
`scope` | string[] |  [] |

**Returns:** *string | function[]*

___