// Configuration
const CONFIG = {
    mongodb: {
        appId: 'diwali-wishes-kishore',
        uri: 'mongodb+srv://Deepavali:007407@diwali-web.thvyg.mongodb.net/?retryWrites=true&w=majority&appName=diwali-web"
        databaseName: 'diwali',
        likesCollection: 'likes',
        wishesCollection: 'wishes'
    },
    telegram: {
        botToken: '6690815586:AAFh5kcrmt7Heggp-Syg66FDlGP9idUzQEI',
        chatId: '5456798232'
    }
};

// Initialize state
let state = {
    isLoading: true,
    isMuted: true,
    likes: 0,
    hasLiked: false,
    userId: localStorage.getItem('user-id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mongoApp: null,
    mongoClient: null,
    mongoDb: null
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

// MongoDB Operations
async function initializeMongoDB() {
    try {
        // Initialize the MongoDB Realm SDK
        state.mongoApp = new Realm.App({ id: CONFIG.mongodb.appId });
        
        // Log in anonymously
        const credentials = Realm.Credentials.anonymous();
        state.mongoClient = await state.mongoApp.logIn(credentials);
        
        // Get database reference
        state.mongoDb = state.mongoClient.mongoClient("mongodb-atlas").db(CONFIG.mongodb.databaseName);
        
        // Initialize likes collection if empty
        const likesCollection = state.mongoDb.collection(CONFIG.mongodb.likesCollection);
        const likesDoc = await likesCollection.findOne({});
        if (!likesDoc) {
            await likesCollection.insertOne({ count: 0, users: [] });
        }

        console.log('MongoDB initialized successfully');
        return true;
    } catch (error) {
        console.error('MongoDB initialization error:', error);
        throw error;
    }
}

async function getLikes() {
    try {
        const collection = state.mongoDb.collection(CONFIG.mongodb.likesCollection);
        const doc = await collection.findOne({});
        return doc?.count || 0;
    } catch (error) {
        console.error('Error getting likes:', error);
        return 0;
    }
}

async function updateLikes(increment = true) {
    try {
        const collection = state.mongoDb.collection(CONFIG.mongodb.likesCollection);
        const update = increment
            ? { 
                $inc: { count: 1 },
                $addToSet: { users: state.userId }
              }
            : { 
                $inc: { count: -1 },
                $pull: { users: state.userId }
              };

        const result = await collection.findOneAndUpdate(
            {},
            update,
            { returnDocument: 'after', upsert: true }
        );

        return result?.count || 0;
    } catch (error) {
        console.error('Error updating likes:', error);
        throw error;
    }
}

async function checkUserLiked() {
    try {
        const collection = state.mongoDb.collection(CONFIG.mongodb.likesCollection);
        const doc = await collection.findOne({ users: state.userId });
        return !!doc;
    } catch (error) {
        console.error('Error checking user liked status:', error);
        return false;
    }
}

async function saveWish(name, message) {
    try {
        const collection = state.mongoDb.collection(CONFIG.mongodb.wishesCollection);
        await collection.insertOne({
            userId: state.userId,
            name,
            message,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error saving wish:', error);
        throw error;
    }
}

// Load MongoDB Realm SDK
function loadMongoDBRealm() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/realm-web@1.7.1/dist/bundle.iife.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load MongoDB Realm'));
        document.head.appendChild(script);
    });
}

// Telegram Notifications
async function sendTelegramNotification(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CONFIG.telegram.chatId,
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

// UI Functions
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

// Particle Effects
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
        // Load MongoDB Realm SDK
        await loadMongoDBRealm();
        
        // Initialize MongoDB
        await initializeMongoDB();
        
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

        // Pre load audio
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
        loadingScreen.innerHTML = `
            <div class="error-message">
                Failed to load. Please refresh the page.<br>
                <small>${error.message}</small>
                <button onclick="window.location.reload()" class="retry-button">
                    Retry
                </button>
            </div>
        `;
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
        // Save wish to MongoDB
        await saveWish(nameInput.value, messageInput.value);
        
        // Send to Telegram
        await sendTelegramNotification(
            `🪔 New Diwali Wish!\n\n` +
            `From: ${nameInput.value}\n` +
            `Message: ${messageInput.value}\n` +
            `User ID: ${state.userId}`
        );
        
        nameInput.value = '';
        messageInput.value = '';
        triggerRandomFirework();
        showToast("Your Diwali wishes have been sent! 🪔✨");
    } catch (error) {
        console.error('Error sending wishes:', error);
        showToast("Error sending wishes. Please try again.", "error");
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = 'Send Diwali Wishes <i class="fas fa-paper-plane"></i>';
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        backgroundMusic.pause();
    } else if (!state.isMuted) {
        backgroundMusic.play().catch(console.error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (state.mongoClient) {
        state.mongoClient.close();
    }
});

// Initialize the page
init();
