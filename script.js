const { MongoClient } = require('mongodb');
const MONGO_URL = "mongodb+srv://Shiki:xnp9czdVYgpT4KBE@shiki.smrp72r.mongodb.net/"; // Replace with your credentials

let db;

async function connectToMongo() {
    let client;
    try {
        client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db('yourDatabaseName'); // Replace with your database name
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Database connection failed');
    } finally {
        if (client) {
        }
    }
}

// Initialize state
let isLoading = false;
let isMuted = true;
let likes = 0; // Initialize likes count
let hasLiked = false; // Track if the user has liked

// Global object to simulate server-side storage (for demonstration purposes)
const globalLikes = {
    count: 0
};

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const backgroundMusic = document.getElementById('background-music');
const soundToggle = document.getElementById('sound-toggle');
const likeBtn = document.getElementById('like-btn');
const likesCount = document.getElementById('likes-count');
const shareBtn = document.getElementById('share-btn');
const wishesForm = document.getElementById('wishes-form');

// Initialize particles
async function initParticles() {
    try {
        await tsParticles.load("fireworks", {
            fullScreen: { enable: false, zIndex: 1 },
            particles: {
                number: { value: 0 },
                color: { value: ["#FF4500", "#FFD700", "#FFA500", "#FF6347"] },
                shape: { type: "circle" },
                opacity: {
                    value: 1,
                    animation: { enable: true, minimumValue: 0, speed: 2, startValue: "max", destroy: "min" }
                },
                size: {
                    value: { min: 2, max: 4 },
                    animation: { enable: true, speed: 5, minimumValue: 0.1, sync: true, startValue: "min", destroy: "max" }
                },
                life: { count: 1 },
                move: {
                    enable: true,
                    gravity: { enable: true, acceleration: 10 },
                    speed: { min: 10, max: 20 },
                    decay: 0.1,
                    direction: "none",
                    straight: false,
                    outModes: { default: "destroy", top: "none" }
                }
            },
            emitters: {
                direction: "top",
                rate: { delay: 0.1, quantity: 1 },
                position: { x: 50, y: 100 }
            }
        });

        await tsParticles.load("sparkles", {
            fullScreen: { enable: false, zIndex: 1 },
            particles: {
                number: { value: 30, density: { enable: true, value_area: 800 } },
                color: { value: "#FFD700" },
                shape: { type: "star" },
                opacity: {
                    value: 0.8,
                    random: true,
                    animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
                },
                size: {
                    value: 3,
                    random: true,
                    animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false }
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    outModes: "out"
                }
            },
            interactivity: {
                detectsOn: "canvas",
                events: {
                    onHover: { enable: true, mode: "repulse" },
                    onClick: { enable: true, mode: "push" }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing particles:', error);
    }
}

async function loadLikes() {
    try {
        const likesDoc = await db.collection('likes').findOne({});
        if (likesDoc) {
            globalLikes.count = likesDoc.count;
            likesCount.textContent = globalLikes.count;
        } else {
            console.warn('No likes document found, initializing to 0.');
            globalLikes.count = 0; // Initialize to 0 if no document found
            likesCount.textContent = globalLikes.count;
            await db.collection('likes').insertOne({ count: 0 }); // Create initial document
        }
    } catch (error) {
        console.error('Error loading likes:', error);
    }
}

// Initialize the page
async function init() {
    try {
        await connectToMongo();
        await loadLikes(); // Load initial likes count
        await initParticles();

        // Update UI
        if (hasLiked) {
            likeBtn.classList.add('liked');
        }

        // Hide loading screen
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                isLoading = false;

                // Play background music after loading
                backgroundMusic.muted = true; // Start muted
                backgroundMusic.play().then(() => {
                    console.log('Audio is playing');
                }).catch(error => {
                    console.error('Error playing audio:', error);
                });
            }, 500);
        }, 2000);
    } catch (error) {
        console.error('Error during initialization:', error);
        loadingScreen.innerHTML = "Failed to load. Please refresh the page.";
    }
}

// Increment likes in MongoDB
async function incrementLikes() {
    try {
        const result = await db.collection('likes').findOneAndUpdate(
            {},
            { $inc: { count: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        return result.value.count;
    } catch (error) {
        console.error('Error incrementing likes:', error);
        throw new Error('Failed to increment likes');
    }
}

// Decrement likes in MongoDB
async function decrementLikes() {
    try {
        const result = await db.collection('likes').findOneAndUpdate(
            { count: { $gt: 0 } },
            { $inc: { count: -1 } },
            { returnDocument: 'after', upsert: true }
        );
        return result.value.count;
    } catch (error) {
        console.error('Error decrementing likes:', error);
        throw new Error('Failed to decrement likes');
    }
}

// Utility Functions
function triggerRandomFirework() {
    if (isLoading) return;
    
    const x = Math.random();
    const y = Math.random() * 0.5;
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#FFD700', '#FFA500', '#FF4500']
    });
}

// Event Handlers
soundToggle.addEventListener('click', async () => {
    try {
        isMuted = !isMuted;
        backgroundMusic.muted = isMuted;
        soundToggle.innerHTML = isMuted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';

        // Play audio if unmuted
        if (!isMuted) {
            backgroundMusic.play().then(() => {
                console.log('Audio is playing after unmuting');
            }).catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    } catch (error) {
        console.error('Error toggling sound:', error);
    }
});

// Like button event handler
likeBtn.addEventListener('click', async () => {
    try {
        if (!hasLiked) {
            // User likes the post
            globalLikes.count = await incrementLikes();
            hasLiked = true;
            likesCount.textContent = globalLikes.count; // Update UI
            likeBtn.classList.add('liked');
            triggerRandomFirework();

            Toastify({
                text: "Thanks for spreading the Diwali joy! 🪔✨",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #FFD700, #FFA500)",
                }
            }).showToast();
        } else {
            // User unlikes the post
            if (globalLikes.count > 0) {
                globalLikes.count = await decrementLikes();
                hasLiked = false;
                likesCount.textContent = globalLikes.count; // Update UI
                likeBtn.classList.remove('liked');

                Toastify({
                    text: "You have removed your like. 😢",
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    style: {
                        background: "linear-gradient(to right, #FF4500, #FF6347)",
                    }
                }).showToast();
            }
        }
    } catch (error) {
        console.error('Error updating likes:', error);
    }
});

// Share button event handler
shareBtn.addEventListener('click', async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Celebrate Diwali with Joy!',
                text: 'Join me in celebrating the festival of lights! 🪔✨',
                url: window.location.href
            });
            
            Toastify({
                text: "Thanks for sharing the joy!",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #FFD700, #FFA500)",
                }
            }).showToast();
        } else {
            await navigator.clipboard.writeText(window.location.href);
            
            Toastify({
                text: "Link copied to clipboard! Share the festivities!",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #FFD700, #FFA500)",
                }
            }).showToast();
        }
        triggerRandomFirework();
    } catch (error) {
        console.error('Error sharing:', error);
        
        Toastify({
            text: "Error sharing. Please try again.",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #FF4500, #FF6347)",
            }
        }).showToast();
    }
});

// Wishes form submission event handler
wishesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!nameInput.value || !messageInput.value) {
        Toastify({
            text: "Please fill in both name and message fields.",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #FF4500, #FF6347)",
            }
        }).showToast();
        return;
    }
    
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('https://api.telegram.org/bot6690815586:AAFh5kcrmt7Heggp-Syg66FDlGP9idUzQEI/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: '5456798232',
                text: `Diwali Wishes from ${nameInput.value}:\n${messageInput.value}`
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            nameInput.value = '';
            messageInput.value = '';
            triggerRandomFirework();
            Toastify({
                text: "Your Diwali wishes have been sent! 🪔✨",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #FFD700, #FFA500)",
                }
            }).showToast();
        } else {
            Toastify({
                text: "Error sending wishes. Please try again.",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #FF4500, #FF6347)",
                }
            }).showToast();
        }
    } catch (error) {
        console.error('Error sending wishes:', error);
        
        Toastify({
            text: "Error sending wishes. Please try again.",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #FF4500, #FF6347)",
            }
        }).showToast();
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Diwali Wishes';
    }
});

init();
