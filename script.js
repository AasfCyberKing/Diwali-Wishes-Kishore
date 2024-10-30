// MongoDB Connection URL
const MONGO_URL = "mongodb+srv://Shiki:xnp9czdVYgpT4KBE@shiki.smrp72r.mongodb.net/";
const TELEGRAM_BOT_TOKEN = "6690815586:AAFh5kcrmt7Heggp-Syg66FDlGP9idUzQEI";
const TELEGRAM_CHAT_ID = "5456798232";

// Initialize state
let state = {
    isLoading: true,
    isMuted: true,
    likes: 0,
    hasLiked: false,
    userId: localStorage.getItem('user-id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
};

// Save user ID if not exists
if (!localStorage.getItem('user-id')) {
    localStorage.setItem('user-id', state.userId);
}

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const backgroundMusic = document.getElementById('background-music');
const soundToggle = document.getElementById('sound-toggle');
const likeBtn = document.getElementById('like-btn');
const likesCount = document.getElementById('likes-count');
const shareBtn = document.getElementById('share-btn');
const wishesForm = document.getElementById('wishes-form');

// Send Telegram notification
async function sendTelegramNotification(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send Telegram notification');
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}

// MongoDB Operations
async function connectToMongo() {
    try {
        const response = await fetch('/api/mongodb/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: MONGO_URL })
        });
        
        if (!response.ok) {
            throw new Error('Failed to connect to MongoDB');
        }
        
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

async function getLikes() {
    try {
        const response = await fetch('/api/mongodb/getLikes');
        if (!response.ok) throw new Error('Failed to get likes');
        const data = await response.json();
        return data.likes || 0;
    } catch (error) {
        console.error('Error getting likes:', error);
        return 0;
    }
}

async function updateLikes(increment = true) {
    try {
        const response = await fetch('/api/mongodb/updateLikes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: state.userId,
                increment
            })
        });
        
        if (!response.ok) throw new Error('Failed to update likes');
        
        const data = await response.json();
        return data.likes;
    } catch (error) {
        console.error('Error updating likes:', error);
        throw error;
    }
}

async function checkUserLiked() {
    try {
        const response = await fetch('/api/mongodb/checkUserLiked', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: state.userId
            })
        });
        
        if (!response.ok) throw new Error('Failed to check user liked status');
        
        const data = await response.json();
        return data.hasLiked;
    } catch (error) {
        console.error('Error checking user liked status:', error);
        return false;
    }
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.background = type === 'success' ? 
        'linear-gradient(to right, #FFD700, #FFA500)' : 
        'linear-gradient(to right, #FF4500, #FF6347)';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

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
            }
        });
    } catch (error) {
        console.error('Error initializing particles:', error);
    }
}

// Trigger random firework effect
function triggerRandomFirework() {
    if (state.isLoading) return;
    
    const x = Math.random();
    const y = Math.random() * 0.5;
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#FFD700', '#FFA500', '#FF4500']
    });
}

// Initialize the page
async function init() {
    try {
        // Connect to MongoDB
        await connectToMongo();
        
        // Initialize particles
        await initParticles();
        
        // Get initial likes count
        state.likes = await getLikes();
        likesCount.textContent = state.likes;
        
        // Check if user has liked
        state.hasLiked = await checkUserLiked();
        if (state.hasLiked) {
            likeBtn.classList.add('liked');
        }

        // Preload audio
        backgroundMusic.load();

        // Hide loading screen
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                state.isLoading = false;
            }, 500);
        }, 1500);

    } catch (error) {
        console.error('Error during initialization:', error);
        loadingScreen.innerHTML = "Failed to load. Please refresh the page.";
    }
}

// Event Handlers
soundToggle.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    backgroundMusic.muted = state.isMuted;
    soundToggle.innerHTML = state.isMuted ? 
        '<i class="fas fa-volume-mute"></i>' : 
        '<i class="fas fa-volume-up"></i>';

    if (!state.isMuted) {
        backgroundMusic.play().catch(console.error);
    }
});

likeBtn.addEventListener('click', async () => {
    try {
        if (!state.hasLiked) {
            // User likes
            const newLikes = await updateLikes(true);
            state.likes = newLikes;
            state.hasLiked = true;
            likeBtn.classList.add('liked');
            triggerRandomFirework();
            showToast("Thanks for spreading the Diwali joy! 🪔✨");
            
            // Send Telegram notification
            await sendTelegramNotification(`🎉 New Like!\nUser ID: ${state.userId}\nTotal Likes: ${newLikes}`);
        } else {
            // User unlikes
            const newLikes = await updateLikes(false);
            state.likes = newLikes;
            state.hasLiked = false;
            likeBtn.classList.remove('liked');
            showToast("You have removed your like 😢", "error");
            
            // Send Telegram notification
            await sendTelegramNotification(`💔 Like Removed\nUser ID: ${state.userId}\nTotal Likes: ${newLikes}`);
        }
        
        likesCount.textContent = state.likes;
    } catch (error) {
        console.error('Error updating likes:', error);
        showToast("Error updating like. Please try again.", "error");
    }
});

shareBtn.addEventListener('click', async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Celebrate Diwali with Joy!',
                text: 'Join me in celebrating the festival of lights! 🪔✨',
                url: window.location.href
            });
            showToast("Thanks for sharing the joy!");
        } else {
            await navigator.clipboard.writeText(window.location.href);
            showToast("Link copied to clipboard! Share the festivities!");
        }
        triggerRandomFirework();
    } catch (error) {
        console.error('Error sharing:', error);
        showToast("Error sharing. Please try again.", "error");
    }
});

wishesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!nameInput.value || !messageInput.value) {
        showToast("Please fill in both name and message fields.", "error");
        return;
    }
    
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: `Diwali Wishes from ${nameInput.value}:\n${messageInput.value}`
            })
        });
        
        if (response.ok) {
            nameInput.value = '';
            messageInput.value = '';
            triggerRandomFirework();
            showToast("Your Diwali wishes have been sent! 🪔✨");
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending wishes:', error);
        showToast("Error sending wishes. Please try again.", "error");
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = 'Send Diwali Wishes <i class="fas fa-paper-plane"></i>';
    }
});

// Handle page visibility change to manage audio
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        backgroundMusic.pause();
    } else if (!state.isMuted) {
        backgroundMusic.play().catch(console.error);
    }
});

// Initialize the page
init();
