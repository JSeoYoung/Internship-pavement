// need to change to websocket server's address
var wsUri = "ws://34.64.223.191:9999";
var output;
var guardian_addr = new Array();
var institution_addr = new Array();
var statusArr = new Array();
var flag = 0;

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
  //writeToScreen("Google Server CONNECTED");
  request_address();
  request_institution();
  request_all_status();
}

function onClose(evt)
{
  //writeToScreen("DISCONNECTED");
}

function onMessage(evt)
{
  //writeToScreen("onMessage");
  var message = JSON.parse(evt.data);

  if(message.sheet_type == 'sheet1'){
  	//writeToScreen('<span style="color: green;">Response: ' + message.Date + '	' + message.Time + '	' + message.Temperature + '	' + message.HeartRate + '	' + message.Latitude + '	' + message.Longitude + '	' + message.Note +'</span>');
    statusArr.push(message);
    if(statusArr.length == 10){  
	statusArr.shift();
	if(flag == 0){
	    //writeToScreen('draw graph');
	    flag = 1;
	    drawChart_Temperature();
	    drawChart_HeartRate();
	}
    }
    check_status(message);
    if(flag == 1){
	  //writeToScreen(flag);
	  drawChart_Temperature();
	  drawChart_HeartRate();
    }
    document.getElementById("temp_digit").innerHTML='<h1>'+(Math.floor(parseFloat(message.Temperature)))+'.</h1>'+'<h3>'+(parseInt((parseFloat(message.Temperature)-Math.floor(parseFloat(message.Temperature)))*10))+'</h3>'+'<h5> °C</h5>';
    document.getElementById("heart_digit").innerHTML='<h1>'+(Math.floor(parseFloat(message.HeartRate)))+'.</h1>'+'<h3>'+(parseInt((parseFloat(message.HeartRate)-Math.floor(parseFloat(message.HeartRate)))*10))+'</h3>'+'<h5> bpm</h5>';
    
      
  }
  else if(message.sheet_type == 'sheet2'){
    //writeToScreen('<span style="color: green;">Response: ' + message.id_number + '	' + message.name + '	' + message.age + '	' + message.address +'</span>');
    var pre1 = document.createElement("p");
    var pre2 = document.createElement("p");
    var pre3 = document.createElement("p");
    var pre4 = document.createElement("p");
    var pre5 = document.createElement("p");
    var pre6 = document.createElement("p");
    var pre7 = document.createElement("p");
    var pre8 = document.createElement("p");
    pre1.innerHTML = message.id_number;
    document.getElementById("id_num").appendChild(pre1);
    pre2.innerHTML = message.name;
    document.getElementById("name_info").appendChild(pre2);
    pre3.innerHTML = message.age;
    document.getElementById("age").appendChild(pre3);
    pre4.innerHTML = message.address;
    document.getElementById("add").appendChild(pre4);
    pre5.innerHTML = message.guardian1;
    document.getElementById("gd1").appendChild(pre5);
    pre6.innerHTML = message.tel1;
    document.getElementById("gda1").appendChild(pre6);
    pre7.innerHTML = message.guardian2;
    document.getElementById("gd2").appendChild(pre7);
    pre8.innerHTML = message.tel2;
    document.getElementById("gda2").appendChild(pre8);
	  guardian_addr.push(message);

    document.getElementById("status").innerHTML='<h1>'+message.name+'</h1>';
  }
  else if(message.sheet_type == 'sheet3'){
  	//writeToScreen('<span style="color: green;">Response: ' + message.id + '	' + message.name + '	' + message.address + '	' + message.Tel + '	' + message.link + '	' + message.Latitude + '	' + message.Longitude + '	' + message.ip + '	' + message.port + '	' + message.note + '	' +'</span>');
	institution_addr.push(message);
  }
  //showNotification(message);
  //websocket.close();
}

function onError(evt)
{
 // writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function request_address()
{
  var message = {
      "sheet_type" : "sheet2",
  };

  //writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function request_institution()
{
  var message = {
      "sheet_type" : "sheet3",
  };
     
  //writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function request_all_status()
{
  var message = {
	"range" : "all",
	"sheet_type" : "sheet1",
  };
  
 // writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function request_status()
{
  var message = {
      "range": "latest",
      "sheet_type" : "sheet1",
  };

 // writeToScreen("SENT: " + JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function check_status(message)
{
  var temperature = Number(message.Temperature);
  var heartrate = Number(message.HeartRate);
  var temperature_check = "LimeGreen";
  var heartrate_check = "LimeGreen";
  var notify_msg;

  //check temperature
  if(temperature < 35 || temperature >38)
	temperature_check = "Red";
  else if(temperature >= 35 && temperature <=35.9)
	temperature_check = "Gold";
  else if(temperature >= 37.6 && temperature <= 38)
	temperature_check = "Gold";

  //check heartrate
  if(heartrate < 65 || heartrate > 80)
	heartrate_check = "Red";
  else if(heartrate >=65 && heartrate <=70)
	heartrate_check = "Gold";
  else if(heartrate >= 75 && heartrate <= 80)
	heartrate_check = "Gold";

  //status indication
  if(temperature_check == "Red" || heartrate_check == "Red")
        document.getElementById("status").style.backgroundColor=temperature_check;
  else if(temperature_check == "Gold" || heartrate_check == "Gold")
        document.getElementById("status").style.backgroundColor=temperature_check;
  else
        document.getElementById("status").style.backgroundColor=temperature_check;

  document.getElementById("temperature").style.backgroundColor=temperature_check;
  document.getElementById("heartRate").style.backgroundColor=heartrate_check;

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
 // writeToScreen(notify_msg);

 // writeToScreen('+++++++'+temperature_check+'  '+heartrate_check);
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

google.charts.load('current', {packages : ['corechart', 'line']});
window.addEventListener("load", init, false);

// graph
function drawChart_Temperature() {
    //writeToScreen('drawChart_Temperature');
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Time');
    data.addColumn('number', '');
    data.addRows([
	[statusArr[0].Time, Number(statusArr[0].Temperature)],
	[statusArr[1].Time, Number(statusArr[1].Temperature)],
	[statusArr[2].Time, Number(statusArr[2].Temperature)],
	[statusArr[3].Time, Number(statusArr[3].Temperature)],
 	[statusArr[4].Time, Number(statusArr[4].Temperature)],
	[statusArr[5].Time, Number(statusArr[5].Temperature)],
	[statusArr[6].Time, Number(statusArr[6].Temperature)],
	[statusArr[7].Time, Number(statusArr[7].Temperature)],
	[statusArr[8].Time, Number(statusArr[8].Temperature)]
    ]);
    var options = {
	title: 'Temperature',
        titleTextStyle: {fontSize: 30, color: '#ff6600'},
	legend: {position: 'none'},
	hAxis: {
	    title: 'Time'
	},
	vAxis: {
	    title: 'Temperature'
	},
        colors: ['#ff6600']
    };
    var chart = new google.visualization.LineChart(document.getElementById('chart_t'));
    chart.draw(data, options);
}

function drawChart_HeartRate() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Time');
    data.addColumn('number', '');
    data.addRows([
	[statusArr[0].Time, Number(statusArr[0].HeartRate)],
	[statusArr[1].Time, Number(statusArr[1].HeartRate)],
	[statusArr[2].Time, Number(statusArr[2].HeartRate)],
	[statusArr[3].Time, Number(statusArr[3].HeartRate)],
	[statusArr[4].Time, Number(statusArr[4].HeartRate)],
 	[statusArr[5].Time, Number(statusArr[5].HeartRate)],
	[statusArr[6].Time, Number(statusArr[6].HeartRate)],
	[statusArr[7].Time, Number(statusArr[7].HeartRate)],
	[statusArr[8].Time, Number(statusArr[8].HeartRate)]
    ]);
    
    var options = {
	title: 'Heart Rate',
        titleTextStyle: {fontSize: 30, color: '#0033cc'},
        legend: {position: 'none'},
	hAxis: {
	    title: 'Time'
	},
	vAxis: {
	    title: 'Heart Rate'
	},
	colors: ['#0033cc']
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_h'));
    chart.draw(data, options);
}
