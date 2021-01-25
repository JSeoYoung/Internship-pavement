// need to change to websocket server's address
var wsUri = "ws://34.64.223.191:9999";
var output;
var guardian_addr = new Array();
var institution_addr = new Array();
var statusArr = new Array();

function init()
{
  output = document.getElementById("output");
  setWebSocket();
  setInterval(request_status,10000);
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
  request_all_status();
}

function onClose(evt)
{
  writeToScreen("DISCONNECTED");
}

function onMessage(evt)
{
  writeToScreen("onMessage");
  var message = JSON.parse(evt.data);

  if(message.sheet_type == 'sheet1'){
  	writeToScreen('<span style="color: green;">Response: ' + message.Date + '	' + message.Time + '	' + message.Temperature + '	' + message.HeartRate + '	' + message.Latitude + '	' + message.Longitude + '	' + message.Note +'</span>');
  	statusArr.push(message);
	check_status(message)
  }
  else if(message.sheet_type == 'sheet2'){
  	writeToScreen('<span style="color: green;">Response: ' + message.id + '	' + message.name + '	' + message.ip + '	' + message.port +'</span>');
	guardian_addr.push(message);
  }
  else if(message.sheet_type == 'sheet3'){
  	writeToScreen('<span style="color: green;">Response: ' + message.id + '	' + message.name + '	' + message.address + '	' + message.Tel + '	' + message.link + '	' + message.Latitude + '	' + message.Longitude + '	' + message.ip + '	' + message.port + '	' + message.note + '	' +'</span>');
	institution_addr.push(message);
  }
  //showNotification(message);
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

function request_all_status()
{
  var message = {
	"range" : "all",
	"sheet_type" : "sheet1",
  };
  
  writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function request_status()
{
  var message = {
      "range": "latest",
      "sheet_type" : "sheet1",
  };

  writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function check_status(message)
{
  var temperature = Number(message.Temperature);
  var heartrate = Number(message.HeartRate);
  var temperature_check = "Green";
  var heartrate_check = "Green";
  var notify_msg;

  //check temperature
  if(temperature < 35 || temperature >38)
	temperature_check = "Red";
  else if(temperature >= 35 && temperature <=35.9)
	temperature_check = "Yellow";
  else if(temperature >= 37.6 && temperature <= 38)
	temperature_check = "Yellow";

  //check heartrate
  if(heartrate < 65 || heartrate > 80)
	heartrate_check = "Red";
  else if(heartrate >=65 && heartrate <=70)
	heartrate_check = "Yellow";
  else if(heartrate >= 75 && heartrate <= 80)
	heartrate_check = "Yellow";

  //notification
  if(temperature_check == "Red" && heartrate_check == "Red")
	notify_msg = "Warning!!\n\nThere is a problem with body temperature and heart rate.";
	//showNotification(notify_msg);
  else if(temperature_check == "Red")
	notify_msg = "Warning!!\n\nThere is a problem with body temperature.";
	//showNotification(notify_msg);
  else if(heartrate_check == "Red")
	notify_msg = "Warning!!\n\nThere is a problem with heart rate.";
	//showNotification(notify_msg);
  writeToScreen(notify_msg);

  writeToScreen('+++++++'+temperature_check+'  '+heartrate_check);
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
              "message" : message
          },
          onSuccess: function (args) {

          },
          onFailure: function (args) {
          }
      });
}

window.addEventListener("load", init, false);
