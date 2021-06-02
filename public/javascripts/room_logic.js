// API url's
const PLAYER = "https://api.spotify.com/v1/me/player";
const PLAYSONG = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";

// This function is called when user first joins room
function onLoad() {
    sessionStorage.setItem('lastPlayed', 'NONE');
    sessionStorage.setItem('last image', 'NONE');
    sessionStorage.setItem('is_playing', true);
    getRoomSong()
    //setInterval(getCurrentlyPlaying, 3000);
}


/*
Check what is currently playing
*/

// Call and handle the spotify api to get data of what is playing
function callApiCurrPlaying(method, url, body) {
    return new Promise( function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('spotify_token'));
        xhr.onload = function () {
            if ( this.status == 200 ){
                var data = JSON.parse(this.responseText);
                if ( data.item != null ){
                    console.log(data)
                    resolve({
                        'track_uri': data.item.uri, 
                        'position_ms': data.progress_ms,
                        'album_img': data.item.album.images[0].url,
                        'artist_name': data.item.artists[0].name,
                        'track_title': data.item.name,
                        'is_playing': data.is_playing
                    })
                }
            }
            else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        }
        xhr.send(body);

    })
}

// Call the currently playing api and wait until information is returned
async function currentlyPlaying() {
    return await callApiCurrPlaying( "GET", PLAYER + "?market=US", null );
}

// After the "currentlyPlaying()" function returns data, determine if the client has changed songs
function getCurrentlyPlaying() {
    currentlyPlaying().then(result => {
        document.getElementById("trackTitle").innerHTML = result.track_title;
        document.getElementById("trackArtist").innerHTML = result.artist_name;
        //sessionStorage.setItem("currently playing", result.track_uri);
        sessionStorage.setItem("track position", result.position_ms);
        
        // Check if song has changed
        if (result.track_uri != sessionStorage.getItem('currently playing')) {
            sessionStorage.setItem('currently playing', result.track_uri)
            sendSong(result);
        }
        // If not, do nothing
        else {
            sessionStorage.setItem('currently playing', result.track_uri)
        }

        // If song is paused, pause song for entire room
        if (!(result.is_playing) && (sessionStorage.getItem('is_playing') == 'true')) {
            sessionStorage.setItem('is_playing', false);
            pauseSong();
            //callApiPause("PUT", PAUSE, {})
        }
        // if song is resumed, resume for entire room
        else if ((sessionStorage.getItem('is_playing') == 'false') && (result.is_playing)) {
            sessionStorage.setItem('is_playing', true);
            sendSong(result);
            //playSong(result.track_uri, result.position_ms);
        }
        
        // Handle album image changes
        if (sessionStorage.getItem('last image') != result.album_img) {
            // Function to set the album image
            changeImage(result.album_img)
            sessionStorage.setItem('last image', result.album_img)
        }
    })
}


/* 
Handle image/background change & fade in/fade out
*/

// Fade in image&background
function fadeIn(element) {
    var op = 0.1;  // initial opacity
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op; // image
        document.body.style.backgroundColor.opacity = op; // background
        op += 0.05;
    }, 50);
}

// Fade out image&background, and wait until fade out is completed
function fadeOutAndCallback(image, callback){
	var opacity = 1;
	var timer = setInterval(function(){
		if(opacity < 0.1){
			clearInterval(timer);
			callback(); // when done fading out, replace with new image
		}
		image.style.opacity = opacity; // image
        document.body.style.backgroundColor.opacity = opacity; // background
		opacity -=  0.05;
	}, 50);
}

// Wait for new color to be determined
async function getColor() {
    return await colorPalette();
}

// driver function for image&background handling
function changeImage(img) {
    // Fade out current image&background
    fadeOutAndCallback(document.getElementById("albumImage"), function() {
        // Set new image
        document.getElementById("albumImage").src = img;
        
        // When new background color is determined, then fade in the image&background
        getColor().then(result => {
            fadeIn(document.getElementById("albumImage"));
        })
    })
}


/*
Pause a song
*/

function callApiPause(method, url, body) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('spotify_token'));
    xhr.send(body);
    xhr.onload = function () {
        if ( this.status == 204){
            console.log('Song Paused');
        }
        else {
            console.log(this.responseText);
        }    
    }
}

/*
Set a new song
*/

// call spotify api to play a new song
function callApiPlay(method, url, body) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('spotify_token'));
    xhr.send(body);
    xhr.onload = function () {
        if ( this.status == 204){
            console.log(this.responseText);
            //colorPalette();
            //setTimeout(currentlyPlaying, 2000);
        }
        else {
            console.log(this.responseText);
            //alert(this.responseText);
        }    
    }
}

// set up body for spotify play song api PUT request
function playSong(track_uri, position_ms) {
    body = {}
    body.uris = [track_uri] // play this song
    body.position_ms = position_ms // start song at this position
    callApiPlay("PUT", PLAYSONG, JSON.stringify(body) )
}

//OLD
function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('spotify_token'));
    xhr.send(body);
    xhr.onload = callback;
}


function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.item != null ){
            console.log(data)
            sessionStorage.setItem("currently playing", data.item.name);
            //document.getElementById("albumImage").src = data.item.album.images[0].url;
            //document.getElementById("trackTitle").innerHTML = data.item.name;
            //document.getElementById("trackArtist").innerHTML = data.item.artists[0].name;
        }

    }
    else if ( this.status == 204 ){

    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function OLD_getCurrentlyPlaying() {
    currentlyPlaying().then(result => {
        //console.log(result);
        document.getElementById("albumImage").src = result.album_img;
        document.getElementById("trackTitle").innerHTML = result.track_title;
        document.getElementById("trackArtist").innerHTML = result.artist_name;
        sessionStorage.setItem("currently playing", result.track_uri);
        sessionStorage.setItem("track position", result.position_ms);
        if (sessionStorage.getItem('lastPlayed') == "NONE") {
            sessionStorage.setItem('lastPlayed', result.track_uri)
        }
        else if (result.track_uri != sessionStorage.getItem('lastPlayed')) {
            sessionStorage.setItem('lastPlayed', result.track_uri)
            sendSong(result);
        }

        if (sessionStorage.getItem('last image') != result.album_img) {
            colorPalette();
            sessionStorage.setItem('last image', result.album_img)
        }
    })
}