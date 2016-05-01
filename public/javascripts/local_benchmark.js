"use strict";

var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;



var connection1 = new RTCPeerConnection(peerConnectionConfig);

var channel1 = connection1.createDataChannel('sendDataChannel', {});
channel1.onmessage = gotData.bind(undefined, '1');
channel1.onopen = sendData;

connection1.createOffer(gotDescription, failure);


var connection2 = new RTCPeerConnection(peerConnectionConfig);

connection2.ondatachannel = gotChannel;

connection1.onicecandidate = gotIceCandidate1;
connection2.onicecandidate = gotIceCandidate2;


var g_offer;
function gotDescription(offer) {
  connection1.setLocalDescription(offer, function() {
    connection2.setRemoteDescription(offer, remoteDescriptionSet, failure);
  }, failure);
}

function remoteDescriptionSet() {

  connection2.createAnswer(gotAnswer, failure);
}

function gotIceCandidate1(event) {
  if (event.candidate != null) {
    console.log('got ice candidate for 1');
    console.log(event);
    connection2.addIceCandidate(event.candidate);
  }
}

function gotIceCandidate2(event) {
  if (event.candidate != null) {
    console.log('got ice candidate for 2');
    console.log(event);
    connection1.addIceCandidate(event.candidate);
  }
}

function gotAnswer(answer) {
  connection2.setLocalDescription(answer);
  connection1.setRemoteDescription(answer);
}

var channel2;
function gotChannel(event) {
  channel2 = event.channel;
  channel2.onmessage = gotData.bind(undefined, '2');
}

function sendData() {
  channel1.send('test test test');
}

function gotData(id, message) {
  console.log(id + ' received data: ' + message.data);
}

function failure(err) {
  console.log(err);
}

function messages(channel1, channel2) {
  channel1.send('test1');
  channel2.send('test2');
}