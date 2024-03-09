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
