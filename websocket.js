// need to change to websocket server's address
var wsUri = "ws://34.64.223.191:9999";
var output;

function init()
{
  output = document.getElementById("output");
  setWebSocket();
  setInterval(request_status,5000);
}

function setWebSocket()
{
  websocket = new WebSocket(wsUri);
  websocket.onopen = function(evt) { onOpen(evt) };
  websocket.onclose = function(evt) { onClose(evt) };
  websocket.onmessage = function(evt) { onMessage(evt) };
  websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt)
{
  writeToScreen("Google Server CONNECTED");
  request_address();
  request_institution();
}

function onClose(evt)
{
  writeToScreen("DISCONNECTED");
}

function onMessage(evt)
{
  writeToScreen("omMessage");
  var message = JSON.parse(evt.data);
  if(message.sheet_type == 'sheet1'){
        writeToScreen('<span style="color: green;">Response: ' + message.Date + ' ' + message.Time + ' ' + message.Temperature + ' ' + message.HeartRate + ' ' + message.Latitude + ' ' + message.Longitude + ' ' + message.Note +'</span>');
  }
//  showNotification(message);
  //websocket.close();
}

function onError(evt)
{
  writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function request_address()
{
  var message = {
      "sheet_type" : "sheet2",
  };

  writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function request_institution()
{
  var message = {
      "sheet_type" : "sheet3",
  };

  writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function request_status()
{
  var message = {
      "sheet_type" : "sheet1",
  };

  writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function writeToScreen(message)
{
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  output.appendChild(pre);
}

function showNotification(message)
{
  var lunaReq= webOS.service.request("luna://com.webos.notification",
      {
          method:"createToast",
          parameters:{
              "sourceId" : "com.sample.websocket",
              "message" : "sample test"
          },
          onSuccess: function (args) {

          },
          onFailure: function (args) {
          }
      });
}

window.addEventListener("load", init, false);
