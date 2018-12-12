"use strict";

let WebSocketServer = require('ws').Server;
let port = 3001;
let wsServer = new WebSocketServer({ port: port });
console.log('websocket server start. port=' + port);

var fs = require('fs');
var path ="base64.txt"
var exec = require('child_process').exec;
const Encoding = require('encoding-japanese');
wsServer.on('connection', function (ws) {
    console.log('-- websocket connected --');
    ws.on('message', function (message) {
        //ファイルの書き込み関数
        function writeFile(path, data) {
            fs.writeFile(path, data, function (err) {
                if (err) {
                    throw err;
                }
            });
        }
        writeFile(path, message);

        exec('python detect_base64.py "' + path + '"', { encoding: 'Shift_JIS', maxBuffer: 400 * 1024}, function (error, stdout, stderr) {
            if (stdout !== null) {
                if (ws.readyState == 1) {
                    var message = stdout.toString();
                    console.log("顔座標: " + message);
                    ws.send(message);
                }
               
            }
            if (stderr !== null) {
                //console.log('stderr: ' + stderr);
            }
            if (error !== null) {
                //console.log('Exec error: ' + error);
            }
            
        });
        wsServer.clients.forEach(function each(client) {
           //client.send(message);
        });
    });
});

