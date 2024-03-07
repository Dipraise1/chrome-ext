// UI elements
const startBtn = document.getElementById("startBtn");
const result = document.getElementById("result");
const processing = document.getElementById("processing");

// Speech recognition initialization
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (typeof SpeechRecognition === "undefined") {
  startBtn.remove();
  result.innerHTML = "<strong>Your browser does not support Speech API. Please download latest Chrome version.</strong>";
} else {
  let recognition = new SpeechRecognition();
  let voices = [];

  // Wait for voices to be loaded before fetching list
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
  };

  // Toggle speech recognition
  let listening = false;
  const toggleRecognition = () => {
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
  recognition.onresult = event => {
    const current = event.resultIndex;
    const recognitionResult = event.results[current];
    const recognitionText = recognitionResult[0].transcript.trim().toLowerCase();

    if (recognitionResult.isFinal) {
      processing.textContent = "Processing ...";

      const response = process(recognitionText);
      const p = document.createElement("p");
      p.innerHTML = `<strong>You said:</strong> ${recognitionText} <br><strong>Sonya said:</strong> ${response}`;
      processing.textContent = "";
      result.appendChild(p);

      readOutLoud(response);
    } else {
      processing.textContent = `Listening: ${recognitionText}`;
    }
  };
}

// Processor function
function process(text) {
  let response = null;

  if (text.includes("hello") || text === "hi" || text.includes("hey")) {
    response = getRandomItemFromArray(hello);
  } else if (text.includes("yourname")) {
    response = "My name's Sonya.";
  } else if (text.includes("howareyou") || text.includes("whatsup")) {
    response = "I'm fine. How about you?";
  } else if (text.includes("whattimeisit")) {
    response = new Date().toLocaleTimeString();
  } else if (text.includes("joke")) {
    response = getRandomItemFromArray(joke);
  } else if (text.includes("play") && text.includes("despacito")) {
    response = "Opened it in another tab";
    window.open("https://www.youtube.com/watch?v=kJQP7kiw5Fk", "_blank", "noopener");
  } else if (text.includes("flip") && text.includes("coin")) {
    response = Math.random() < 0.5 ? "heads" : "tails";
  } else if (text.includes("bye") || text.includes("stop")) {
    response = "Bye!!";
    toggleRecognition();
  }

  if (!response) {
    window.open(`http://google.com/search?q=${encodeURIComponent(text.replace("search", ""))}`, "_blank", "noopener");
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
  const selectedVoice = voices.find(voice => voice.name === "Google US English");
  if (selectedVoice) {
    speech.voice = selectedVoice;
  }

  window.speechSynthesis.speak(speech);
}

// Arrays for greetings and jokes
const hello = ["Hello human! What's up?", "Hi, how are you doing?", "What's up?", "Ahoy matey! How are ye?", "What's shaking?"];
const joke = ["How many programmers does it take to change a light bulb? None, it's a hardware problem...", "Why do mummies have trouble keeping friends? Because they're so wrapped up in themselves.", "What did one ocean say to the other ocean? Nothing, they just waved.", "Two goldfish are in a tank. One turns to the other and says, 'Do you know how to drive this thing?'", "Why did the pirate buy an eye patch? Because he couldn't afford an iPad!", "What did the pirate say on his 80th birthday? Aye Matey!", "Why don't scientists trust atoms? Because they make up everything."];
