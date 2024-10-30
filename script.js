// Configuration
const CONFIG = {
    apiUrl: 'https://kishoredxd.vercel.app/api',
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

// API Functions
async function getLikes() {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/likes`);
        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error('Error getting likes:', error);
        return 0;
    }
}

async function updateLikes(increment = true) {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                increment
            }),
        });
        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error('Error updating likes:', error);
        throw error;
    }
}

async function saveWish(name, message) {
    try {
        await fetch(`${CONFIG.apiUrl}/wishes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: state.userId,
                name,
                message
            }),
        });
    } catch (error) {
        console.error('Error saving wish:', error);
        throw error;
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

// Initialize the page
async function init() {
    try {
        // Get initial likes count
        state.likes = await getLikes();
        likesCount.textContent = state.likes;

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
            likesCount.textContent = state.likes;
            state.hasLiked = true;
            likeBtn.disabled = true;
            showToast('Thank you for liking!');
        }
    } catch (error) {
        console.error('Error liking:', error);
        showToast(`Failed to like. Please try again. ${error}`);
    }
});

shareBtn.addEventListener('click', () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Happy%20Diwali!`;
    window.open(telegramUrl, '_blank');
});

wishesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (name && message) {
        try {
            await saveWish(name, message);
            nameInput.value = '';
            messageInput.value = '';
            showToast('Wish saved successfully!');
        } catch (error) {
            console.error('Error saving wish:', error);
            showToast('Failed to save wish. Please try again.', 'error');
        }
    } else {
        showToast('Please fill in both name and message fields.', 'error');
    }
});

// Initialize the page
init();
