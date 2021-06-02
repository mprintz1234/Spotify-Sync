// This function is called when user first loads site or returns from spotify redirect
function onLoad() {
    // on page load, store access token in browser if not stored already
    if ((window.location.hash).includes("#access_token") && sessionStorage.getItem('spotify_token') == null) {
        console.log('Setting token')
        extractToken()
    }
}

// Join room when button is pressed
function joinRoom(){
    const room_id = document.getElementById('room_id').value;
    //sessionStorage.setItem("room_id", room_id);

    window.location = `/rooms/${room_id}`
}

// Redirect client to spotify login
function loginSpotify(){
    const CLIENT_ID = "d5882b504574449fad55021a563ef4c5";
    const SPOTIFY_AUTHORIZATION = "https://accounts.spotify.com/authorize";
    const REDIRECT = "http://localhost:3000/";
    //const REDIRECT = "https://nasty-insect-59.loca.lt";
    console.log(REDIRECT);
    const SPACE_DELIMITER = "%20";
    const SCOPES = ["streaming", "user-read-playback-state", "user-modify-playback-state", "user-read-email", "user-read-private"];
    const SCOPES_PARAM = SCOPES.join(SPACE_DELIMITER);

    url = `${SPOTIFY_AUTHORIZATION}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT}&scope=${SCOPES_PARAM}&response_type=token&show_dialogue=true`
    console.log(url)
    window.location = url
}

// When the user returns from spotify, extract the spotify token and store on browser
function extractToken(){
    hash = window.location.hash
    const stringAfterHashing = hash.substring(1)
    const paramsInUrl = stringAfterHashing.split("&")
    //console.log(paramsInUrl)
    var d = [];
    paramsInUrl.forEach((x, i) => {
        const [key, value] = x.split("=")
        d[key] = value
    })
    console.log(d)
    sessionStorage.setItem("spotify_token", d['access_token']);
}