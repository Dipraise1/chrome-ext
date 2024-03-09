// // background.js
// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//   navigator.mediaDevices
//     .getUserMedia({ audio: true })
//     .then(function (stream) {
//       console.log("Microphone access granted");
//       // You can now use the stream for audio processing or recording
//     })
//     .catch(function (err) {
//       console.error("Error accessing microphone:", err);
//     });
// } else {
//   console.error("getUserMedia is not supported in this browser");
// }

// background.js

chrome.runtime.onInstalled.addListener(() => {
  // Request microphone permissions when the extension is installed or updated
  chrome.permissions.request({ permissions: ["audioCapture"] }, (granted) => {
    if (granted) {
      console.log("Microphone access granted");
    } else {
      console.error("Microphone access denied");
    }
  });
});
