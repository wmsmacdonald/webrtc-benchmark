"use strict";

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function messages(channel1, channel2) {
  /*channel1.send('test1');
  channel2.send('test2');*/
}

var pairs = [];
for (var i = 0; i < 500; i++) {
  pairs.push(PeerPair(messages));
}

/**
 *
 * @param messages  function that takes in two connected channels (use this to simulate sending data)
 */
function PeerPair(messages) {
  var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

  var connection1 = new RTCPeerConnection(peerConnectionConfig);
  var channel1 = connection1.createDataChannel('sendDataChannel', {});

  var connection2 = new RTCPeerConnection(peerConnectionConfig);
  connection2.ondatachannel = function(event) {
    messages(channel1, event.channel);
  };

  connection1.onicecandidate = function(event) {

    if (event.candidate != null) {
      connection2.addIceCandidate(event.candidate);
    }
  };
  connection2.onicecandidate = function(event) {
    if (event.candidate != null) {
      connection1.addIceCandidate(event.candidate);
    }
  };

  // start negotiation
  connection1.createOffer(function(offer) {
    connection1.setLocalDescription(offer, function() {messages
      connection2.setRemoteDescription(offer, function() {
        connection2.createAnswer(function(answer) {
          connection2.setLocalDescription(answer);
          connection1.setRemoteDescription(answer);
        }, failure);
      }, failure);
    }, failure);
  }, failure);

  return [connection1, connection2];
}

function failure(err) {
  console.log(err);
}
