var WebSocketServer = require('ws').Server;
var http = require('http');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
// var wss = new WebSocketServer({ server: server });

// //Websocket接続を保存しておく
// var connections = [];

// //接続時
// wss.on('connection', function (ws) {
//     //配列にWebSocket接続を保存
//     console.log('-- websocket connected --');
//     ws.on('message', function (message) {
//         wss.clients.forEach(function each(client) {
//             if (isSame(ws, client)) {
//                 console.log('- skip sender -');
//             }
//             else {
//                 client.send(message);
//             }
//         });
//     });
// });

// function isSame(ws1, ws2) {
//     // -- compare object --
//     return (ws1 === ws2);
// }

var io = require('socket.io').listen(server);


server.listen(3000);
console.log('Server is online.');

// app.use('/', function (req, res, next) {
//     console.log('Request Type:', req.method);
//      console.log(req.body);

// });
app.use(function (req, res, next) {
   // res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    //console.log("a");
    next();
});
app.post('/', function (req, res) {
 
        // console.log(req.body);

        // res.send(res.body);


    var exec = require('child_process').exec;
    // console.log(req.body.image);
    exec('python detect_base64.py "' + req.body.image + '"',
        function (err, stdout, stderr) {
         
            if (err) {
                console.log(err);
            }
            //console.log(stdout);
            return res.status(201).json({
                "face": stdout
            });
        }
    );


});
// app.get('/users', function (req, res) {
//     console.log("get");
// });
// app.get('/', function (req, res) {
//     res.send('POST is sended.');
//     console.log("GET");
// })
// function detect(req, res) {

//     const exec = require('child_process').exec;
//     exec('python /path/to/detect_base64.py "' + req.body.image + '"',
//         function (err, stdout, stderr) {
//             if (err) { console.log(err); }
//             console.log(stdout);
//             return res.status(201).json({ "face": stdout });
//         }
//     );

// }


io.on('connection', function (socket) {
    // ---- multi room ----
    socket.on('enter', function (roomname) {
        socket.join(roomname);
        console.log('id=' + socket.id + ' enter room=' + roomname);
        setRoomname(roomname);
    });

    function setRoomname(room) {
        socket.roomname = room;
    }

    function getRoomname() {
        var room = socket.roomname;
        return room;
    }

    function emitMessage(type, message) {
        // ----- multi room ----
        var roomname = getRoomname();

        if (roomname) {
            //console.log('===== message broadcast to room -->' + roomname);
            socket.broadcast.to(roomname).emit(type, message);
        } else {
            console.log('===== message broadcast all');
            socket.broadcast.emit(type, message);
        }
    }

    // When a user send a SDP message
    // broadcast to all users in the room
    socket.on('message', function (message) {
        var date = new Date();
        message.from = socket.id;
        //console.log(date + 'id=' + socket.id + ' Received Message: ' + JSON.stringify(message));

        // get send target
        var target = message.sendto;
        if (target) {
            //console.log('===== message emit to -->' + target);
            socket.to(target).emit('message', message);
            return;
        }

        // broadcast in room
        emitMessage('message', message);
    });

    // When the user hangs up
    // broadcast bye signal to all users in the room
    socket.on('disconnect', function () {
        // close user connection
        console.log((new Date()) + ' Peer disconnected. id=' + socket.id);

        // --- emit ----
        emitMessage('user disconnected', {
            id: socket.id
        });

        // --- leave room --
        var roomname = getRoomname();
        if (roomname) {
            socket.leave(roomname);
        }
    });

});