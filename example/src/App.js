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
