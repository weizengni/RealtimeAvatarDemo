"use strict";

import heygen_API from "./api.json" assert { type: "json" };

const statusElement = document.querySelector("#status");
const apiKey = heygen_API.apiKey;
const SERVER_URL = heygen_API.serverUrl;

if (apiKey === "YourApiKey" || SERVER_URL === "") {
  alert("Please enter your API key and server URL in the api.json file");
}

let sessionInfo = null;
let peerConnection = null;

function updateStatus(statusElement, message) {
  statusElement.innerHTML += message + "<br>";
  statusElement.scrollTop = statusElement.scrollHeight;
}

updateStatus(
  statusElement,
  "Please click the new button to create the stream first."
);

// Create a new WebRTC session when clicking the "New" button
async function createNewSession() {
  updateStatus(statusElement, "Creating new session... please wait");

  // call the new interface to get the server's offer SDP and ICE server to create a new RTCPeerConnection
  sessionInfo = await newSession("high");
  const { sdp: serverSdp, ice_servers: iceServers } = sessionInfo;

  // Create a new RTCPeerConnection
  peerConnection = new RTCPeerConnection({ iceServers: [] });
  let formattedIceServers = iceServers.map((server) => ({ urls: server }));
  peerConnection.setConfiguration({ iceServers: formattedIceServers });

  // When ICE candidate is available, send to the server
  peerConnection.onicecandidate = ({ candidate }) => {
    console.log("Received ICE candidate:", candidate);
    if (candidate) {
      handleICE(sessionInfo.session_id, candidate.toJSON());
    }
  };

  // When ICE connection state changes, display the new state
  peerConnection.oniceconnectionstatechange = (event) => {
    updateStatus(
      statusElement,
      `ICE connection state changed to: ${peerConnection.iceConnectionState}`
    );
  };

  // When audio and video streams are received, display them in the video element
  const mediaElement = document.querySelector("#mediaElement");
  peerConnection.ontrack = (event) => {
    console.log("Received the track");
    if (event.track.kind === "audio" || event.track.kind === "video") {
      mediaElement.srcObject = event.streams[0];
    }
  };

  // Set server's SDP as remote description
  const remoteDescription = new RTCSessionDescription(serverSdp);
  await peerConnection.setRemoteDescription(remoteDescription);

  updateStatus(statusElement, "Session creation completed");
  updateStatus(
    statusElement,
    "Now.You can click the start button to start the stream"
  );
}

// Start session and display audio and video when clicking the "Start" button
async function startAndDisplaySession() {
  if (!sessionInfo) {
    updateStatus(statusElement, "Please create a connection first");
    return;
  }

  updateStatus(statusElement, "Starting session... please wait");

  // Create and set local SDP description
  const localDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(localDescription);

  // Start session
  await startSession(sessionInfo.session_id, localDescription);
  updateStatus(statusElement, "Session started successfully");
}

const taskInput = document.querySelector("#taskInput");

// When clicking the "Send Task" button, get the content from the input field, then send the tas
async function sendTaskHandler() {
  if (!sessionInfo) {
    updateStatus(statusElement, "Please create a connection first");

    return;
  }
  updateStatus(statusElement, "Sending task... please wait");
  const text = taskInput.value;
  if (text.trim() === "") {
    alert("Please enter a task");
    return;
  }

  const resp = await sendTask(sessionInfo.session_id, text);

  updateStatus(statusElement, "Task sent successfully");
}

// when clicking the "Close" button, close the connection
async function closeConnectionHandler() {
  if (!sessionInfo) {
    updateStatus(statusElement, "Please create a connection first");
    return;
  }
  updateStatus(statusElement, "Closing connection... please wait");
  try {
    // Close local connection
    peerConnection.close();
    // Call the close interface
    const resp = await stopSession(sessionInfo.session_id);

    console.log(resp);
  } catch (err) {
    console.error("Failed to close the connection:", err);
  }
  updateStatus(statusElement, "Connection closed successfully");
}

document.querySelector("#newBtn").addEventListener("click", createNewSession);
document
  .querySelector("#startBtn")
  .addEventListener("click", startAndDisplaySession);
document
  .querySelector("#sendTaskBtn")
  .addEventListener("click", sendTaskHandler);
document
  .querySelector("#closeBtn")
  .addEventListener("click", closeConnectionHandler);

// new session
async function newSession(quality) {
  const response = await fetch(`${SERVER_URL}/v1/realtime.new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ quality }),
  });
  if (response.status === 500) {
    console.error("Server error");
    updateStatus(
      statusElement,
      "Server Error. Please ask the staff if the service has been turned on"
    );

    throw new Error("Server error");
  } else {
    const data = await response.json();
    console.log(data.data);
    return data.data;
  }
}

// start the session
async function startSession(session_id, sdp) {
  const response = await fetch(`${SERVER_URL}/v1/realtime.start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ session_id, sdp }),
  });
  if (response.status === 500) {
    console.error("Server error");
    updateStatus(
      statusElement,
      "Server Error. Please ask the staff if the service has been turned on"
    );
    throw new Error("Server error");
  } else {
    const data = await response.json();
    return data.data;
  }
}

// submit the ICE candidate
async function handleICE(session_id, candidate) {
  const response = await fetch(`${SERVER_URL}/v1/realtime.ice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ session_id, candidate }),
  });
  if (response.status === 500) {
    console.error("Server error");
    updateStatus(
      statusElement,
      "Server Error. Please ask the staff if the service has been turned on"
    );
    throw new Error("Server error");
  } else {
    const data = await response.json();
    return data;
  }
}

// repeat the text
async function sendTask(session_id, text) {
  const response = await fetch(`${SERVER_URL}/v1/realtime.task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ session_id, text }),
  });
  if (response.status === 500) {
    console.error("Server error");
    updateStatus(
      statusElement,
      "Server Error. Please ask the staff if the service has been turned on"
    );
    throw new Error("Server error");
  } else {
    const data = await response.json();
    return data.data;
  }
}

// stop session
async function stopSession(session_id) {
  const response = await fetch(`${SERVER_URL}/v1/realtime.stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ session_id }),
  });
  if (response.status === 500) {
    console.error("Server error");
    updateStatus(statusElement, "Server Error. Please ask the staff for help");
    throw new Error("Server error");
  } else {
    const data = await response.json();
    return data.data;
  }
}
