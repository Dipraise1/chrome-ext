// UI elements
const twiterPrompt = "open twitter with username anyusername";
const youtubePrompt = "open youtube and search youtubesearch";
const spotifyPrompt = "open spotify and play songname/artist";

const spotifyClientId = "6362a06b6de443ebb352da023ac50e87";
const spotifyClientSecret = "6b6cad4e353c42158a8954b2bcc8c9cf";
const googleKey = "AIzaSyDRiEU6-hvpWsrR1Gg0tkLtJXM-wFNyvuU";

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
// Existing functions like getTwitterUsername, getYoutubeQuery, etc.

// Updated processor function with dynamic handling for open commands and general search
function process(text) {
  let response = null;

  if (text.includes("hello") || text === "hi" || text.includes("hey")) {
    response = getRandomItemFromArray(hello);
  } else if (text.includes("your name")) {
    response = "My name's Soai.";
  } else if (text.includes("how are you") || text.includes("what's up")) {
    response = "I'm fine. How about you?";
  } else if (text.includes("what time is it")) {
    response = new Date().toLocaleTimeString();
  } else if (text.includes("joke")) {
    response = getRandomItemFromArray(joke);
  } else if (text.includes("youtube")) {
    const query = getYoutubeQuery(text);
    response = "Opening the latest video ...";
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${googleKey}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }
        return response.json();
      })
      .then((data) => {
        data.items.forEach((item) => {
          const videoId = item.id.videoId;
          const videoTitle = item.snippet.title;
          const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
        });

        window.open(
          `https://www.youtube.com/watch?v=${
            data.items[0].id.kind === "youtube#video"
              ? data.items[0].id.videoId
              : data.items[1].id.kind === "youtube#video"
              ? data.items[1].id.videoId
              : data.items[2].id.videoId
          }`,
          "_blank",
          "noopener"
        );
      })
      .catch((error) => {
        response = "No video or channel found";
        console.error("Error searching YouTube:", error);
      });
  } else if (text.includes("flip") && text.includes("coin")) {
    response = Math.random() < 0.5 ? "heads" : "tails";
  }
  // else if (text.includes("bye") || text.includes("stop")) {
  //   response = "Bye!!";
  //   toggleRecognition();
  // }
  else if (text.includes("twitter")) {
    const username = getTwitterUsername(text);
    response = "Opened Twitter in another tab";
    window.open(`https://twitter.com/${username}`, "_blank", "noopener");
  } else if (text.includes("spotify")) {
    const query = getSpotifyQuery(text);
    response = "Opening latest track in another tab ...";

    const searchQuery = encodeURIComponent(query);
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const searchUrl = `https://api.spotify.com/v1/search?q=${searchQuery}&type=track`;

    fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + btoa(spotifyClientId + ":" + spotifyClientSecret),
      },
      body: "grant_type=client_credentials",
    })
      .then((tokenResponse) => {
        if (!tokenResponse.ok) {
          throw new Error("Failed to obtain access token");
        }
        return tokenResponse.json();
      })
      .then((tokenData) => {
        const accessToken = tokenData.access_token;

        // Search for tracks
        return fetch(searchUrl, {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to search for tracks");
        }
        return response.json();
      })
      .then((data) => {
        // Extract track IDs
        const trackIds = data.tracks.items.map((item) => item.id);
        window.open(
          `https://open.spotify.com/track/${trackIds[0]}`,
          "_blank",
          "noopener"
        );
      })
      .catch((error) => {
        console.error("Error:", error);
        response = "No song or artist found";
        throw new Error("Failed to search for tracks");
      });
  } else if (text.includes("open uniswap")) {
    response = "Opening Uniswap";
    window.open("https://app.uniswap.org/#/swap", "_blank", "noopener");
  } else if (text.includes("tradingview")) {
    response = "Opened TradingView in another tab";
    window.open(
      `https://www.tradingview.com/chart/?symbol=UNISWAP%3ASOAIWETH`,
      "_blank",
      "noopener"
    );
  } else if (text.includes("dexscreener")) {
    const tokenAddress = getTokenAddress(text);
    response = "Opened token on DexScreener in another tab";
    window.open(
      `https://dexscreener.com/ethereum/${tokenAddress}`,
      "_blank",
      "noopener"
    );
  } else if (text.includes("open")) {
    // Handle dynamic open commands
    response = dynamicOpenCommand(text);
  } else {
    // General search for unrecognized commands
    const searchText = text;
    initiateGeneralSearch(searchText);
    response = `Initiating a search for: ${text}`;
  }

  return response;
}

function dynamicOpenCommand(text) {
  const url = getUrlFromText(text);
  window.open(url, "_blank", "noopener");
  return `Opened ${url} in another tab.`;
}

function getTokenAddress(text) {
  // Extract the token address from the user's input. This is a placeholder function.
  // You'll need to replace this logic with actual token address extraction based on the input format.
  const match = text.match(/address ([0-9a-zA-Z]+)/);
  return match ? match[1] : "default-token-address";
}

function getUrlFromText(text) {
  // Extract or construct the URL from the text. This is a placeholder.
  // Implement the actual logic based on expected text input.
  return "https://example.com";
}

// Dynamic handling for "open" commands
function dynamicOpenCommand(text) {
  const commandParts = text.split(" ");
  const actionIndex = commandParts.findIndex(
    (part) => part.toLowerCase() === "open"
  );

  if (actionIndex !== -1 && commandParts.length > actionIndex + 1) {
    const target = commandParts.slice(actionIndex + 1).join(" ");
    const knownSites = {
      // Existing known sites
      
      uniswap: "https://app.uniswap.org/#/swap", // Add Uniswap URL
    };

    if (knownSites[target.toLowerCase()]) {
      window.open(knownSites[target.toLowerCase()], "_blank", "noopener");
      return `Opened ${target} in another tab.`;
    } else if (target.toLowerCase().startsWith("swap")) {
      // Handle Uniswap swap command
      const tokens = commandParts.slice(actionIndex + 2);
      if (tokens.length >= 3) {
        const inputToken = tokens[0];
        const outputToken = tokens[1];
        const amount = tokens[2];

        const inputTokenAddress = getTokenAddress(inputToken);
        const outputTokenAddress = getTokenAddress(outputToken);

        if (inputTokenAddress && outputTokenAddress) {
          // Call the swapTokens function
          swapTokens(inputTokenAddress, outputTokenAddress, amount)
            .then(() => console.log('Swap successful'))
            .catch(err => console.error('Swap failed:', err));

          return `Initiated swap from ${inputToken} to ${outputToken}.`;
        } else {
          return "Invalid token addresses.";
        }
      } else {
        return "Insufficient parameters for swap command.";
      }
    } else {
      initiateGeneralSearch(target);
      return `Opened search for ${target} in another tab.`;
    }
  } else {
    return "I'm not sure how to handle that command.";
  }
}
const swapTokens = async (inputToken, outputToken, amount) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  const inputTokenContract = new web3.eth.Contract(ERC20ABI, inputToken);
  const allowance = await inputTokenContract.methods.allowance(account, uniswapAddress).call();

  if (allowance < amount) {
    await inputTokenContract.methods.approve(uniswapAddress, amount).send({ from: account });
  }

  await uniswapContract.methods.swapExactTokensForTokens(
    amount,
    0, // Min amount of output tokens (set to 0 for exact output)
    [inputToken, outputToken],
    account,
    Date.now() + 1000 * 60 * 10 // Deadline (10 minutes from now)
  ).send({ from: account });
};


  if (actionIndex !== -1 && commandParts.length > actionIndex + 1) {
    const target = commandParts.slice(actionIndex + 1).join(" ");
    const knownSites = {
      // Predefined known sites
      binance: "https://www.binance.com",
      metamask: "https://metamask.io",
      whatsapp: "https://web.whatsapp.com",
      mail: "https://mail.google.com/mail/",
      hulu:"www.hulu.com",
      netflix:"https://www.netflix.com",
      Dexscreener:"https://dexscreener.com/"
      

      // Add other known sites as needed
    };

    if (knownSites[target.toLowerCase()]) {
      window.open(knownSites[target.toLowerCase()], "_blank", "noopener");
      return `Opened ${target} in another tab.`;
    } else {
      initiateGeneralSearch(target);
      return `Opened search for ${target} in another tab.`;
    }
  } else {
    return "I'm not sure how to handle that command.";
  }
}

function dynamicOpenHuluContent(text) {
  const commandParts = text.split(" ");
  const actionIndex = commandParts.findIndex(
    (part) => part.toLowerCase() === "open"
  );

  if (actionIndex !== -1 && commandParts.length > actionIndex + 2) {
    const contentType = commandParts[actionIndex + 1].toLowerCase();
    const contentName = commandParts.slice(actionIndex + 2).join(" ");

    const huluBaseURL = "https://www.hulu.com/";
    const searchURL = `${huluBaseURL}search/`;

    if (contentType === "game" || contentType === "movie") {
      // Since direct links to games or movies might not be possible,
      // we default to searching for the content on Hulu.
      const encodedContentName = encodeURIComponent(contentName);
      const finalURL = `${searchURL}${encodedContentName}`;

      window.open(finalURL, "_blank", "noopener");
      return `Opened Hulu search for ${contentName}.`;
    } else {
      return "Unrecognized content type for Hulu.";
    }
  } else {
    return "I'm not sure how to handle that command.";
  }
}

function openDexscreenerProject(projectName) {
  window.open(
    `https://dexscreener.com/ethereum/${projectName}`,
    "_blank",
    "noopener"
  );
  return `Opened Dexscreener for project ${projectName} in another tab.`;
}
// Function to perform a general search
function initiateGeneralSearch(query) {
  window.open(`https://www.google.com/search?q=${query}`, "_blank", "noopener");
}

// Helper function to get a random item from an array
function getRandomItemFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to read out loud
function readOutLoud(message) {
  // const speech = new SpeechSynthesisUtterance();
  // speech.text = message;
  // speech.volume = 3;
  // speech.rate = 1;
  // speech.pitch = 1.8;
  // // Dynamically select a voice
  // const selectedVoice = voices.find(
  //   (voice) => voice.name === "Google US English"
  // );
  // if (selectedVoice) {
  //   speech.voice = selectedVoice;
  // }
  // window.speechSynthesis.speak(speech);
}
// $(document).ready(function () {
//   requestMic();
// });
// Ask for microphone permission when the page loads

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
