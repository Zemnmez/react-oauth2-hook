import React from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'

import { useOAuth2Token, OAuthCallback }  from 'react-oauth2-hook'

export default class App extends React.Component {
  render () {
    return (
      <div>
        <BrowserRouter>
        <Switch>
          <Route exact path="/callback" component={OAuthCallback}/>
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
    redirectUri: document.location.origin + "/callback"
  })

  const [savedTracks, setSavedTracks] = React.useState()
  const [error, setError] = React.useState()

  // when we get a token, query Spotify
  React.useEffect(() => {token != undefined && fetch(
    'https://api.spotify.com/v1/me/tracks', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(
      response => response.json()
    ).then(
      data => setSavedTracks(data)
    ).catch(
      error => setError(error)
    )
  }, [token] )

  if (!token || error || !savedTracks) return <div onClick={getToken}>login with Spotify</div>

  return <div>
    Your tracks on Spotify:
    {JSON.stringify(savedTracks)}
  </div>
}
