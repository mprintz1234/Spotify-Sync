const io = require( "socket.io" )();
const socketapi = {
    io: io
};

var rooms_playing = {}

// Periodically check all rooms to update
setInterval(() => {
    for (const r_id in rooms_playing){
        io.sockets.to(r_id).emit('update song', '');
    }
}, 3000);

io.on( "connection", function( socket ) {
    // Have the user only broadcast and receive from the room they are currently in
    // Socket room id's are equivalent to the user's room id
    var r_id = socket.request._query['r_id'];
    console.log('user connected to room ' + r_id)
    socket.join(r_id);

    // Keep track of currently playing song
    // If you are the first user, initialize room's current song
    if (!(r_id in rooms_playing)) {
        rooms_playing[r_id] = {'track_uri': '', 'position_ms': ''};
    }

    // Get the current song and current position in the song when first joining the room
    socket.on('get currently playing', (msg) => {
        socket.broadcast.to(r_id).emit('get position', msg)
        socket.on('get position', (result) => {
            rooms_playing[r_id].position_ms = result.position_ms
            rooms_playing[r_id].track_uri = result.track_uri
            console.log(rooms_playing[r_id])
            io.to(r_id).emit('currently playing', rooms_playing[r_id])
        })
    })

    // Tell all others in room to pause song
    socket.on('pause song', (msg) => {
        console.log('recieved pause song')
        socket.broadcast.to(r_id).emit('pause song', '');
    })

    // Emit what is currently playing to all room members
    socket.on('currently playing', (msg) => {
        rooms_playing[r_id] = msg
        console.log(rooms_playing)
        console.log(r_id + ' currently playing: ' + msg.track_uri);
        io.to(r_id).emit('currently playing', msg)
        //socket.broadcast.to(r_id).emit('currently playing', msg)
    });

});

module.exports = socketapi;