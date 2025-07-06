const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const outputDiv = document.getElementById("output");
const inputText = document.getElementById("inputText");

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;  
recognition.maxAlternatives = 1;

let isRecognizing = false; // track recognition state
let speechSynthesisInProgress = false; 

recognition.onstart = () => {
    console.log("Voice recognition started");
    isRecognizing = true;
};

recognition.onend = () => {
    console.log("Voice recognition ended");
    isRecognizing = false;
};

recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript;
    inputText.value = transcript;
    handleCommand(transcript.toLowerCase()); 
};

// Battery
let batteryPromise = navigator.getBattery();
batteryPromise.then(batteryCallback);

function batteryCallback(batteryObject) {
    printBatteryStatus(batteryObject);
    setInterval(() => {
        printBatteryStatus(batteryObject);
    }, 5000);
}

function printBatteryStatus(batteryObject) {
    document.querySelector("#battery").textContent = `${(batteryObject.level * 100).toFixed(2)}%`;
    charge = batteryObject.level * 100;
    if (batteryObject.charging === true) {
        document.querySelector(".battery").style.width = "200px";
        document.querySelector("#battery").textContent = `${(batteryObject.level * 100).toFixed(2)}% Charging`;
        chargeStatus = "plugged in";
    }
}

startBtn.addEventListener("click", () => {
    if (!isRecognizing) {
        recognition.start();
    }
});

stopBtn.addEventListener("click", () => {
    if (isRecognizing) {
        recognition.stop();
        speak("Voice recognition stopped.");
    }
    if (speechSynthesisInProgress) {
        window.speechSynthesis.cancel();  
        speechSynthesisInProgress = false; 
        speak("Speech stopped.");
    }
});

function handleCommand(command) {
    if (!command) return;
 

    if (command.includes("find location")) {
        findLocation(command);
    } else if (command.includes("hello")) {
        greetUser();
    } else if (command.includes("your name")) {
        speak("I am your voice assistant jarvis  created by abuzar ahmad.");
    } else if (command.includes("my name is")) {
        saveName(command);
    } else if (command.includes("what is my name")) {
        tellName();
    } else if (command.includes("open calendar")) {
        openCalendar();
    } else if (command.includes("tell the time")) {
        tellTime();
    } else if (command.includes("set reminder")) {
        setReminder();
    } else if (command.includes("open games")) {
        openGames();
    } else if (command.includes("search wikipedia")) {
        searchWikipedia(command);
    } else if (command.includes("weather in")) {
        let city = command.replace("weather in", "").trim(); 
        fetchWeather(city);
    } else if (command.includes("tell me a joke")) {
        tellJoke();
    } else if (command.includes("tell me news")) {  
        tellNews();
    } else if (command.includes("play random music")) {
        playRandomMusic();
    } else if (command.includes("open whatsapp")) {
        window.open("https://web.whatsapp.com/");
    } else if (command.includes("open google")) {
        window.open("https://www.google.com");
    } else if (command.includes("open youtube")) {
        window.open("https://www.youtube.com");
    } else if (command.includes("open LinkedIn")) {
        openSocialMedia("https://www.linkedin.com/");
    } else if (command.includes("search music")) {
        let query = command.replace("search music", "").trim();
        window.open("https://www.youtube.com/results?search_query=" + query);
    } else if (command.includes("battery")) {
        tellBatteryPercentage();
    } else {
        speak("Sorry, I didn't understand that.");
    }
}

function speak(text) {
    speechSynthesisInProgress = true;
    let speech = new SpeechSynthesisUtterance(text);
    speech.onend = () => {
        speechSynthesisInProgress = false;
    };
    speechSynthesis.speak(speech);
}

function saveName(command) {
    savedName = command.replace("my name is", "").trim(); 
    localStorage.setItem("userName", savedName); 
    speak(`Got it! I will remember your name as ${savedName}.`);
}

function tellName() {
    const name = localStorage.getItem("userName");
    if (name) {
        speak(`Your name is ${name}.`);
    } else {
        speak("I don't know your name yet. Please tell me by saying, my name is, followed by your name.");
    }
}


function findLocation(command) {
    let location = command.replace("find location", "").trim();
    if (location) {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        window.open(mapUrl, "_blank");
        speak(`Finding location: ${location}`);
    } else {
        speak("Please specify the location you want to find.");
    }
}


function greetUser() {
    const userName = localStorage.getItem("userName");
    const hour = new Date().getHours();
    let timeOfDay = "";

    if (hour < 12) {
        timeOfDay = "morning";
    } else if (hour < 18) {
        timeOfDay = "afternoon";
    } else {
        timeOfDay = "evening";
    }

    if (userName) {
        speak(`Good ${timeOfDay}, ${userName}! How can I assist you today?`);
    } else {
        speak(`Good ${timeOfDay}! How can I assist you today?`);
    }
}

function openCalendar() {
    window.open("https://www.google.com/calendar", "_blank");
    speak("Opening your calendar.");
}

function tellTime() {
    let time = new Date().toLocaleTimeString();
    speak(`The current time is ${time}`);
}

let isSettingReminder = false;

async function setReminder() {
    speak("What would you like the reminder to be?");
    isSettingReminder = true; 
    if (!isRecognizing) {
        recognition.start();
    }
}

recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript;
    inputText.value = transcript;

    if (isSettingReminder) {
        speak(`Reminder set: ${transcript}. I will notify you in 10 seconds.`);
        setTimeout(() => {
            speak(`Reminder: ${transcript}`);
        }, 10000);
        isSettingReminder = false;
    } else {
        handleCommand(transcript.toLowerCase());
    }
};

function openGames() {
    speak("Opening a game for you.");
    const gameUrls = [
        "https://www.google.com/search?q=snake+game",
        "https://www.google.com/search?q=tic+tac+toe",
        "https://www.google.com/search?q=Pac-Man+game",
    ];
    
    const randomIndex = Math.floor(Math.random() * gameUrls.length);
    const randomGameUrl = gameUrls[randomIndex];
    window.open(randomGameUrl, "_blank");
    speak("Game opened.");
}

async function searchWikipedia(command) {
    let query = command.replace("search wikipedia", "").trim();
    let response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    let data = await response.json();
    if (data.extract) {
        speak(data.extract); 
    } else {
        speak("Sorry, I couldn't find any information on that topic.");
    }
}

async function fetchWeather(city) {
    const apiKey = "YOUR_API_KEY_HERE";  // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        if (data.weather && data.main) {
            const description = data.weather[0].description;
            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            speak(`The weather in ${city} is currently ${description} with a temperature of ${temperature}°C and humidity of ${humidity}%.`);
        } else {
            speak("Sorry, I couldn't fetch the weather information.");
        }
    } catch (error) {
        speak("Sorry, there was an error fetching the weather data.");
        console.error("Weather fetch error:", error);
    }
}

async function tellJoke() {
    const url = "https://official-joke-api.appspot.com/jokes/random";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch joke");
        }

        const data = await response.json();
        const joke = `${data.setup} ... ${data.punchline}`;
        speak(joke); // Speak the joke
    } catch (error) {
        speak("Sorry, I couldn't fetch a joke at the moment.");
        console.error("Joke fetch error:", error);
    }
}

async function tellNews() {
    const apiKey = "YOUR_API_KEY_HERE"; 
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.articles;

        if (articles.length > 0) {
            speak("Here are the top headlines:");
            for (let i = 0; i < Math.min(articles.length, 5); i++) {
                if (!speechSynthesisInProgress) break; 
                speak(`Headline ${i + 1}: ${articles[i].title}`);
            }
        } else {
            speak("Sorry, I couldn't fetch the news at the moment.");
        }
    } catch (error) {
        speak("Sorry, there was an error fetching the news.");
        console.error("News fetch error:", error);
    }
}


async function tellBatteryPercentage() {
    try {
        const battery = await navigator.getBattery();
        const batteryLevel = (battery.level * 100).toFixed(0);
        const chargingStatus = battery.charging ? "charging" : "not charging";
        speak(`The battery is at ${batteryLevel}% and it is currently ${chargingStatus}.`);
    } catch (error) {
        speak("Sorry, I couldn't retrieve the battery status.");
        console.error("Battery status error:", error);
    }
}

function playRandomMusic() {
    const musicUrls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
        "https://www.youtube.com/watch?v=3JZ_D3ELwOQ", 
        "https://www.youtube.com/watch?v=9bZkp7q19f0",
        "https://www.youtube.com/watch?v=nlAbx1Tplao"
    ];
    const randomIndex = Math.floor(Math.random() * musicUrls.length);
    const randomMusicUrl = musicUrls[randomIndex];
    window.open(randomMusicUrl);
    speak("Now playing random music.");
}

