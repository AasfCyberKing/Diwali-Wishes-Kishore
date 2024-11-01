let isLoading = true;
let isMuted = true;

const loadingScreen = document.getElementById('loading-screen');
const backgroundMusic = document.getElementById('background-music');
const soundToggle = document.getElementById('sound-toggle');
const shareBtn = document.getElementById('share-btn');
const wishesForm = document.getElementById('wishes-form');

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
                    startValue: "min",
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

async function init() {
    await initParticles();

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
}


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

soundToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    backgroundMusic.muted = isMuted;
    soundToggle.innerHTML = isMuted ? 
        '<i class="fas fa-volume-mute"></i>' : 
        '<i class="fas fa-volume-up"></i>';

    if (!isMuted) {
        backgroundMusic.play().then(() => {
            console.log('Audio is playing after unmuting');
        }).catch(error => {
            console.error('Error playing audio:', error);
        });
    }
});

// Share button event handler
shareBtn.addEventListener('click', async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Celebrate Diwali with Joy!',
                text: 'Happy Diwali! 🪔✨ Checkout This Link:-',
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
                chat_id: '5456798232',
                text: `**🪔 Diwali Wishes from ${nameInput.value}:**\n\n**${messageInput.value}**`
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
