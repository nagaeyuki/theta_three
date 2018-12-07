"use strict";

let WebSocketServer = require('ws').Server;
let port = 3001;
let wsServer = new WebSocketServer({ port: port });
console.log('websocket server start. port=' + port);

var exec = require('child_process').exec;

wsServer.on('connection', function (ws) {
    console.log('-- websocket connected --');
    ws.on('message', function (message) {
        
        exec('python detect_base64.py "' + message + '"',
            function (err, stdout, stderr) {
                if (err) {
                    console.log(err);
                }
                
                console.log(stdout);
                return stdout;

            }
        );
        wsServer.clients.forEach(function each(client) {
            client.send(message);
        });
    });
});

