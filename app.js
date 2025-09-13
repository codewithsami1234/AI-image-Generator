const themeToggle = document.querySelector(".theme-toggle");
const promptInput = document.querySelector(".prompt-input");
const promptForm = document.querySelector(".prompt-form");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid"); 
const API_KEY = "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"; 

// Example prompts
const examplePrompts = [
  "A porcelain doll with glowing crystal eyes, Victorian dress, fantasy background",
  "A futuristic robot doll made of glass and neon wires, highly detailed",
  "A magical fairy doll with butterfly wings, glowing in the forest",
  "A steampunk-style puppet doll with gears and brass ornaments",
  "A kawaii plush doll sitting on a rainbow cloud",
  "A futuristic flying car with neon lights, cyberpunk city",
  "A vintage 1960s muscle car parked on a desert road at sunset",
  "A golden luxury sports car with diamond details, cinematic lighting",
  "A concept electric car with transparent body panels",
  "A racing car speeding through a futuristic tunnel with motion blur",
  "A glass house on top of a mountain surrounded by clouds",
  "A fairytale gingerbread house glowing with candy lights",
  "A futuristic smart home with holographic walls",
  "A cozy wooden cabin beside a frozen lake at night",
  "A luxurious villa by the beach with infinity pool at sunset",
  "A cyberpunk neon motorcycle racing through a futuristic city",
  "A classic Harley Davidson with chrome details, cinematic background",
  "A golden dragon-shaped motorcycle with glowing red eyes",
  "A futuristic hoverbike floating above the ground",
  "A steampunk motorcycle made of brass pipes and gears",
  "A futuristic Mercedes-Benz concept car with neon lights in a cyberpunk city",
  "A luxury black Mercedes S-Class parked in front of a modern glass skyscraper",
  "A golden Mercedes AMG sports car on a race track at sunset, cinematic view",
  "A classic vintage Mercedes 300SL Gullwing in a retro city street",
  "A photorealistic Mercedes-Benz G-Wagon driving through snowy mountains",
  "A rugged Toyota Fortuner SUV climbing a rocky mountain trail",
  "A luxury Toyota Fortuner parked near a beach villa at sunset",
  "A Toyota Fortuner driving through the desert, dust and motion blur",
  "A futuristic Toyota Fortuner armored edition, cyberpunk style",
  "A Toyota Fortuner with glowing neon underlights in a night city street"
];

// Load theme
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

// Switch between light and dark
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

// Fixed function name & typos
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    // Ensure dimensions are multiple of 16
    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return { width: calculatedWidth, height: calculatedHeight };
};

//  FIXED function syntax + DOM API
const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if (!imgCard) return;
    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img src="${imgUrl}" class="result-img"/>
                        <div class="img-overlay">
                         <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                         <i class="fa-solid fa-download"></i>
                         </a>
                         </div>`;
};

//  Corrected image generation function
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
    const { width, height } = getImageDimensions(aspectRatio);

    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
        try {
            const response = await fetch(MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`, 
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: promptText,
                    parameters: { width, height },
                    options: { wait_for_model: true, use_cache: false },
                }),
            });

            if (!response.ok) throw new Error((await response.json())?.error);
            
            // convert response to an image
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            updateImageCard(i, url);
        } catch (error) {
            console.error("Error generating image:", error);
        }
    });

    await Promise.allSettled(imagePromises);
};

// Create placeholder cards
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";
    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += `
        <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
            <div class="status-container">
                <div class="spinner"></div>
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div class="status-text">Generating...</div>
            </div>
        </div>`;
    }
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1"; 
    const promptText = promptInput.value.trim();

    createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

// Random prompt button
promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);