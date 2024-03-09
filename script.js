// UI elements
const twiterPrompt = "open twitter with username anyusername";
const youtubePrompt = "open youtube and search youtubesearch";
const spotifyPrompt = "open spotify and play songname/artist";

const getTwitterUsername = (str) => {
  const usernameRegex = /username\s+(\w+)/i;
  const match = str.match(usernameRegex);

  if (match) {
    const username = match[1]; // Extracted username
    return username; // Output: anyusername
  } else {
    return null;
  }
};

const getYoutubeQuery = (str) => {
  const searchText = str.replace(/^.*\bsearch\s*/, "");
  return searchText;
};

const getSpotifyQuery = (str) => {
  const searchText = str.replace(/^.*\play\s*/, "");
  return searchText;
};

const requestMic = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        console.log("Microphone access granted");
        // You can now use the stream for audio processing or recording
      })
      .catch(function (err) {
        console.error("Error accessing microphone:", err);
      });
  } else {
    console.error("getUserMedia is not supported in this browser");
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const requestMicBtn = document.getElementById("requestMicBtn");

  requestMicBtn.addEventListener("click", () => {
    // Request microphone permissions when the button is clicked
    console.log("clicked");
    chrome.permissions.request({ permissions: ["audioCapture"] }, (granted) => {
      if (granted) {
        console.log("Microphone access granted");
      } else {
        console.error("Microphone access denied");
      }
    });
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        console.log("Microphone access granted");
        // You can now use the stream for audio processing or recording
      })
      .catch(function (err) {
        console.error("Error accessing microphone:", err);
      });
  });
});

const startBtn = document.getElementById("startBtn");
const openChartBtn = document.getElementById("openChartBtn");
const manualInput = document.getElementById("manualInput");
const submitManualBtn = document.getElementById("submitManualBtn");
const result = document.getElementById("result");
const processing = document.getElementById("processing");

// Speech recognition initialization
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
if (typeof SpeechRecognition === "undefined") {
  startBtn.remove();
  result.innerHTML =
    "<strong>Your browser does not support Speech API. Please download latest Chrome version.</strong>";
} else {
  let recognition = new SpeechRecognition();
  let voices = [];

  openChartBtn.addEventListener("click", () => {
    window.open(
      "https://dexscreener.com/ethereum/0x88a3a913626803261de234c23c76523699caed8d",
      "_blank",
      "noopener"
    );
  });

  // Wait for voices to be loaded before fetching list
  window.speechSynthesis.onvoiceschanged = () => {
    voices.push(window.speechSynthesis.getVoices());
  };

  // Toggle speech recognition
  let listening = false;
  const toggleRecognition = () => {
    requestMic();
    if (listening) {
      recognition.stop();
      startBtn.textContent = "Start listening";
    } else {
      recognition.start();
      startBtn.textContent = "Stop listening";
    }
    listening = !listening;
  };
  startBtn.addEventListener("click", toggleRecognition);

  // Event handler for speech recognition
  recognition.onresult = (event) => {
    const current = event.resultIndex;
    const recognitionResult = event.results[current];
    const recognitionText = recognitionResult[0].transcript
      .trim()
      .toLowerCase();

    if (recognitionResult.isFinal) {
      processing.textContent = "Processing ...";

      const response = process(recognitionText);
      const p = document.createElement("p");
      p.innerHTML = `<strong>You said:</strong> ${recognitionText} <br><strong>Soai :</strong> ${response}`;
      processing.textContent = "";
      result.appendChild(p);

      readOutLoud(response);
    } else {
      processing.textContent = `Listening: ${recognitionText}`;
    }
  };
}
// Manual input submit button click event
submitManualBtn.addEventListener("click", () => {
  const manualCommand = manualInput.value.trim().toLowerCase();
  if (manualCommand) {
    const response = process(manualCommand);
    const p = document.createElement("p");
    p.innerHTML = `<strong>Manual Input:</strong> ${manualCommand} <br><strong>Soai :</strong> ${response}`;
    result.appendChild(p);
    manualInput.value = "";
    readOutLoud(response);
  }
});
// Processor function
function process(text) {
  let response = null;

  if (text.includes("hello") || text === "hi" || text.includes("hey")) {
    response = getRandomItemFromArray(hello);
  } else if (text.includes("yourname")) {
    response = "My name's Soai.";
  } else if (text.includes("howareyou") || text.includes("whatsup")) {
    response = "I'm fine. How about you?";
  } else if (text.includes("whattimeisit")) {
    response = new Date().toLocaleTimeString();
  } else if (text.includes("joke")) {
    response = getRandomItemFromArray(joke);
  } else if (text.includes("youtube")) {
    const query = getYoutubeQuery(text);
    response = "Opened it in another tab";
    if (query) {
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank",
        "noopener"
      );
    } else {
      window.open(`https://www.youtube.com/`, "_blank", "noopener");
    }
  } else if (text.includes("flip") && text.includes("coin")) {
    response = Math.random() < 0.5 ? "heads" : "tails";
  } else if (text.includes("bye") || text.includes("stop")) {
    response = "Bye!!";
    toggleRecognition();
  } else if (
    text.includes("twitter") ||
    (text.includes("twitter") && text.includes("post")) ||
    text.includes("tweet")
  ) {
    const username = getTwitterUsername(text);
    response = "Opened it in another tab";
    if (username) {
      window.open(
        `https://twitter.com/search?q=${username}&src=typed_query&f=top`,
        "_blank",
        "noopener"
      );
    } else {
      window.open(`https://twitter.com/`, "_blank", "noopener");
    }
  } else if (
    text.includes("spotify") ||
    text.includes("music") ||
    text.includes("play")
  ) {
    const query = getSpotifyQuery(text);
    response = "Opened it in another tab";
    if (query) {
      window.open(
        `https://open.spotify.com/search/${query}`,
        "_blank",
        "noopener"
      );
    } else {
      window.open("https://open.spotify.com/", "_blank", "noopener");
    }
  } else if (text.includes("open soai on dexscreener")) {
    response = "Opening SOAI on Dexscreener";
    window.open(
      "https://dexscreener.com/ethereum/0x88a3a913626803261de234c23c76523699caed8d",
      "_blank",
      "noopener"
    );
  }

  if (!response) {
    window.open(
      `http://google.com/search?q=${encodeURIComponent(
        text.replace("search", "")
      )}`,
      "_blank",
      "noopener"
    );
    return `I found some information for ${text}`;
  }

  return response;
}

// Helper function to get a random item from an array
function getRandomItemFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to read out loud
function readOutLoud(message) {
  const speech = new SpeechSynthesisUtterance();

  speech.text = message;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1.8;

  // Dynamically select a voice
  const selectedVoice = voices.find(
    (voice) => voice.name === "Google US English"
  );
  if (selectedVoice) {
    speech.voice = selectedVoice;
  }

  window.speechSynthesis.speak(speech);
}
// $(document).ready(function () {
//   requestMic();
// });
// Ask for microphone permission when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // background.js
  requestMic();
});

// Arrays for greetings and jokes
const hello = [
  "Hello human! What's up?",
  "Hi, how are you doing?",
  "What's up?",
  "Ahoy matey! How are ye?",
  "What's shaking?",
];
const joke = [
  "How many programmers does it take to change a light bulb? None, it's a hardware problem...",
  "Why do mummies have trouble keeping friends? Because they're so wrapped up in themselves.",
  "What did one ocean say to the other ocean? Nothing, they just waved.",
  "Two goldfish are in a tank. One turns to the other and says, 'Do you know how to drive this thing?'",
  "Why did the pirate buy an eye patch? Because he couldn't afford an iPad!",
  "What did the pirate say on his 80th birthday? Aye Matey!",
  "Why don't scientists trust atoms? Because they make up everything.",
];
