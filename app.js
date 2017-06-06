/* シンプルなwebserver */

// サーバーがListenするIPアドレス
var LISTEN_IP = 'localhost';
// サーバがListenするポート
var LISTEN_PORT = 3030;
// ファイル名が指定されない場合に返す既定のファイル名
var DEFAULT_FILE = "mouse-console_ng2.html";
// 公開するディレクトリのルート
var DOCUMENT_ROOT = __dirname + '/public/'

var http = require('http');
var fs = require('fs');
var url = require('url');

var server = http.createServer();

// 拡張子を抽出
function getExtension(fileName) {
  var fileNameLength = fileName.length;
  var dotPoint = fileName.indexOf('.', fileNameLength - 5);
  var extn = fileName.substring(dotPoint + 1, fileNameLength);
  return extn;
}

// content-type を指定
function getContentType(fileName) {
  var extentsion = getExtension(fileName).toLowerCase();
  var contentType = {
    'html': 'text/html',
    'htm': 'text/htm',
    'css': 'text/css',
    'js': 'text/javaScript; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'xml': 'application/xml; charset=utf-8',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpg',
    'gif': 'image/gif',
    'png': 'image/png',
    'mp3': 'audio/mp3',
  };
  var contentType_value = contentType[extentsion];
  if (contentType_value === undefined) {
    contentType_value = 'text/plain';
  };

  return contentType_value;
}

// Web サーバーのロジック
server.on('request',
  function(request, response) {
    console.log('Requested Url:' + request.url);
    var requestedFile = url.parse(request.url, true).pathname;
    requestedFile = (requestedFile.substring(requestedFile.length - 1, 1) === '/') ? requestedFile + DEFAULT_FILE : requestedFile;
    console.log('Handle Url:' + requestedFile);
    console.log('File Extention:' + getExtension(requestedFile));
    console.log('Content-Type:' + getContentType(requestedFile));
    // DOCUMENT_ROOT以下のファイルにアクセス可能
    fs.readFile(DOCUMENT_ROOT + requestedFile, 'binary', function(err, data) {
      if (err) {
        response.writeHead(404, {
          'Content-Type': 'text/plain'
        });
        response.write('not found !\n');
        response.end();
      } else {

        response.writeHead(200, {
          'Content-Type': getContentType(requestedFile)
        });
        response.write(data, "binary");
        response.end();

      }
    });
  }
);

server.listen(LISTEN_PORT);
console.log('Server running at http://' + LISTEN_IP + ':' + LISTEN_PORT);

/*-----------------------------------------------------------------`*/
var io = require("socket.io").listen(server);

/*-----------------------------------------------------------------`*/
var mqtt     = require('mqtt');
var options = {
    port: 1883,
    host: 'mqtt://flandre.local:1883',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'xxxxxxxxxxxxxxxxxx',
    password: 'xxxxxxxxxxxxxxxxxx',
    keepalive: 60,
    reconnectPeriod: 1000,
    clean: false,
    protocolId: "MQTT",
    protocolVersion: 4,

};

var mqtt_client = mqtt.connect('mqtt://flandre.local:1883',options);
mqtt_client.subscribe("TEST/#");
mqtt_client.subscribe("mouse/#");
mqtt_client.subscribe("presense/#");
mqtt_client.subscribe("gamepad/#");

mqtt_client.on('connect', function () {
  mqtt_client.publish('presence', 'This is app.js Hello mqtt');
  console.log("MQTTで接続")
});

mqtt_client.on('message', function(topic, message, packet) {
    //console.log(message.toString() + " : " + topic);
    var topic_array =topic.split("/");
    var message_array = message
    console.log(topic_array);
    console.log(message);
    send_json = {topic: topic, payload: message_array};
    io.sockets.emit("mqtt_message",send_json );
});
