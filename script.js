// Initialize state
let isLoading = true;
let isMuted = false;
let likes = parseInt(localStorage.getItem('diwalilikes')) || 0;
let hasLiked = localStorage.getItem('hasLikedDiwali') === 'true';

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
    await tsParticles.load("fireworks", {
        fullScreen: {
            enable: false,
            zIndex: 1
        },
        particles: {
            number: {
                value: 0
            },
            color: {
                value: ["#FF4500", "#FFD700", "#FFA500", "#FF6347"]
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: 1,
                animation: {
                    enable: true,
                    minimumValue: 0,
                    speed: 2,
                    startValue: "max",
                    destroy: "min"
                }
            },
            size: {
                value: { min: 2, max: 4 },
                animation: {
                    enable: true,
                    speed: 5,
                    minimumValue: 0.1,
                    sync: true,
                    startValue:  "min",
                    destroy: "max"
                }
            },
            life: {
                count: 1
            },
            move: {
                enable: true,
                gravity: {
                    enable: true,
                    acceleration: 10
                },
                speed: { min: 10, max: 20 },
                decay: 0.1,
                direction: "none",
                straight: false,
                outModes: {
                    default: "destroy",
                    top: "none"
                }
            }
        },
        emitters: {
            direction: "top",
            rate: {
                delay: 0.1,
                quantity: 1
            },
            position: {
                x: 50,
                y: 100
            }
        }
    });

    await tsParticles.load("sparkles", {
        fullScreen: {
            enable: false,
            zIndex: 1
        },
        particles: {
            number: {
                value: 30,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#FFD700"
            },
            shape: {
                type: "star"
            },
            opacity: {
                value: 0.8,
                random: true,
                animation: {
                    enable: true,
                    speed: 1,
                    minimumValue: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                animation: {
                    enable: true,
                    speed: 2,
                    minimumValue: 0.1,
                    sync: false
                }
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
                onHover: {
                    enable: true,
                    mode: "repulse"
                },
                onClick: {
                    enable: true,
                    mode: "push"
                }
            }
        }
    });
}

// Initialize the page
async function init() {
    await initParticles();
    
    // Update UI
    likesCount.textContent = likes;
    if (hasLiked) {
        likeBtn.classList.add('liked');
    }

    // Hide loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            isLoading = false;
        }, 500);
    }, 2000);

    // Start random fireworks
    setInterval(triggerRandomFirework, 3000);
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
soundToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    backgroundMusic.muted = isMuted;
    soundToggle.innerHTML = isMuted ? 
        '<i class="fas fa-volume-mute"></i>' : 
        '<i class="fas fa-volume-up"></i>';
});

// Event Handlers
likeBtn.addEventListener('click', () => {
    // Toggle the like state
    if (!hasLiked) {
        // User likes the post
        likes++;
        hasLiked = true;
        localStorage.setItem('diwalilikes', likes);
        localStorage.setItem('hasLikedDiwali', 'true');
        likesCount.textContent = likes;
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
        likes--;
        hasLiked = false;
        localStorage.setItem('diwalilikes', likes);
        localStorage.setItem('hasLikedDiwali', 'false');
        likesCount.textContent = likes;
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
});

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

wishesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!nameInput.value || !messageInput.value) return;
    
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('https://api.telegram.org/bot6690815586:AAFh5kcrmt7Heggp-Syg66FDlGP9idUzQEI/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: '1247502',
                text: `New Diwali Wish!\nFrom: ${nameInput.value}\nMessage: ${messageInput.value}`
            }),
        });

        if (response.ok) {
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
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        
        Toastify({
            text: "Failed to send your wish. Please try again.",
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

// Initialize the page
init();
