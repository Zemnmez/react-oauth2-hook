> ## [react-oauth2-hook](README.md)

[react-oauth2-hook](README.md) /

> Retrieve OAuth2 implicit grant tokens purely on the client without destroying application state.

**`license`** MIT

**`example`** 
fuck

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

*Defined in [index.tsx:177](https://github.com/Zemnmez/react-oauth2-hook/blob/443d1a0/src/index.tsx#L177)*

This error is thrown by the [OAuthCallback](README.md#const-oauthcallback)
when the state token recieved is incorrect or does not exist.

___

### `Const` ErrNoAccessToken

● **ErrNoAccessToken**: *`Error`* =  new Error('no access_token')

*Defined in [index.tsx:183](https://github.com/Zemnmez/react-oauth2-hook/blob/443d1a0/src/index.tsx#L183)*

This error is thrown by the [OAuthCallback](README.md#const-oauthcallback)
if no access_token is recieved.

___

## Functions

### `Const` OAuthCallback

▸ **OAuthCallback**(`__namedParameters`: object): *`Element`*

*Defined in [index.tsx:241](https://github.com/Zemnmez/react-oauth2-hook/blob/443d1a0/src/index.tsx#L241)*

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

*Defined in [index.tsx:99](https://github.com/Zemnmez/react-oauth2-hook/blob/443d1a0/src/index.tsx#L99)*

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