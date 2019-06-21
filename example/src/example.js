import React from 'react'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import { useOAuth2Token, OAuthCallback } from 'react-oauth2-hook'

// in this example, we get a Spotify OAuth
// token and use it to show a user's saved
// tracks.

export default () => <Router>
  <Switch>
    <Route path="/callback" component={OAuthCallback}/>
    <Route component={SavedTracks}/>
  </Switch>
</Router>

const SavedTracks = () => {
  const [token, getToken] = useOAuth2Token({
    authorizeUrl: "https://accounts.spotify.com/authorize",
    scope: ["user-library-read"],
    clientID: "bd9844d654f242f782509461bdba068c",
    redirectUri: document.location.href+"/callback"
  })

  const [tracks, setTracks] = React.useState();
  const [error, setError] = React.useState();

  // query spotify when we get a token
  React.useEffect(() => {
    fetch(
      'https://api.spotify.com/v1/me/tracks?limit=50'
    ).then(response => response.json()).then(
      data => setTracks(data)
    ).catch(error => setError(error))
  }, [token])

  return <div>
    {error && `Error occurred: ${error}`}
    {(!token || !savedTracks) && <div
      onClick={getToken}>
        login with Spotify
    </div>}
    {savedTracks && `
      Your Saved Tracks: ${JSON.stringify(savedTracks)}
    `}
  </div>
}
