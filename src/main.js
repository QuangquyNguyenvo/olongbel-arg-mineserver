// Import style
import './style.css';

// Real Minecraft sound effects (vanilla .ogg assets, not synthesized)
const soundFiles = {
    click: '/sounds/click.ogg',
    hitStone: '/sounds/step_stone.ogg',
    hitWood: '/sounds/step_wood.ogg',
    breakStone: '/sounds/dig_stone.ogg',
    chestOpen: '/sounds/chest_open.ogg',
    chestClose: '/sounds/chest_close.ogg',
    levelUp: '/sounds/levelup.ogg',
    orb: '/sounds/orb.ogg',
    creeperFuse: '/sounds/fuse.ogg',
    challengeComplete: '/sounds/challenge_complete.ogg',
    dragonDeath: '/sounds/dragon_death.ogg',
    cave1: '/sounds/cave1.ogg',
    cave10: '/sounds/cave10.ogg',
};

// Web Audio API context, kept only for the custom Herobrine jumpscare rumble
// (vanilla Minecraft has no canonical "Herobrine" sound, so that one stays synthesized)
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(key, { volume = 0.5, rateJitter = 0 } = {}) {
    const src = soundFiles[key];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = volume;
    if (rateJitter) {
        audio.playbackRate = 1 + (Math.random() * 2 - 1) * rateJitter;
    }
    audio.play().catch(() => {});
}

function playClickSound() {
    playSound('click', { volume: 0.5 });
}

function playHitSound() {
    playSound('hitStone', { volume: 0.4, rateJitter: 0.12 });
}

function playBreakSound() {
    playSound('breakStone', { volume: 0.6, rateJitter: 0.08 });
}

function playChestOpenSound() {
    playSound('chestOpen', { volume: 0.55 });
}

function playChestCloseSound() {
    playSound('chestClose', { volume: 0.5 });
}

function playLevelUpSound() {
    playSound('levelUp', { volume: 0.5 });
}

function playWoodClickSound() {
    playSound('hitWood', { volume: 0.45, rateJitter: 0.1 });
}

// Synthesize Herobrine Scary Ambient Rumble Sound
function playScarySound() {
    initAudio();
    if (!audioCtx) return;

    const duration = 3.5;
    const time = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(50, time);
    osc1.frequency.linearRampToValueAtTime(45, time + duration);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(52, time);
    osc2.frequency.linearRampToValueAtTime(47, time + duration);
    
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start(time);
    osc1.stop(time + duration);
    osc2.start(time);
    osc2.stop(time + duration);

    // Wind-like noise
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(100, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + 1.5);
    filter.frequency.exponentialRampToValueAtTime(80, time + duration);
    filter.Q.value = 5.0;
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    noise.start(time);
    noise.stop(time + duration);
}

function playCreeperHiss() {
    playSound('creeperFuse', { volume: 0.3 });
}

// Splash Texts
const splashTexts = [
    "Sắp mở cửa rồi!",
    "Đừng đào thẳng xuống đất!",
    "Herobrine không có trong bản cập nhật này!",
    "Chuẩn bị cuốc kim cương đi!",
    "IP: COMING SOON!",
    "100% Organic Redstone!",
    "Ăn bánh quy lập trình đi!",
    "Ủng hộ server nhé!",
    "Đập khối Obsidian dưới kia kìa!",
    "Mở rương bí mật!",
    "Hype cực hạn GMT+7!",
    "Đập khối nhanh bằng /gamemode creative",
    "Nhập mã giải khóa thời gian!",
    "ARG đang hoạt động cực nóng!",
    "Gõ [T] để chat lệnh...",
    "Server sinh tồn cực đỉnh!"
];

// Target opening date
const targetDate = new Date("2026-07-11T20:00:00+07:00").getTime();
const startDate = new Date("2026-07-01T21:00:00+07:00").getTime();
const totalDuration = targetDate - startDate;

// Native browser async SHA-256 hashing
async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hashed ARG Secret Codes (SHA-256)
const codes = {
    days: "3e2fb24aa7cd8493f3da7a60a47498101af4384061b1c7a2e68c41d36bb7bfcd",
    hours: "b538830b4c60cab60569c5a47e6e1733e69f745d2294b45414073d4f91c053c2",
    minutes: "b1837379ef38b51bb60e44a2261965c025186b84c717fc88fa05ee22fb5ca735",
    seconds: "116f73eeef6adac652994dac9e263724caef13db12d120a0c7ada855245fb05d"
};

// Unlock States (loaded from localStorage)
let unlockStates = {
    days: true, // Always true (glitched launch day today)
    hours: localStorage.getItem("mc_hours_unlocked") === "true",
    minutes: localStorage.getItem("mc_minutes_unlocked") === "true",
    seconds: localStorage.getItem("mc_seconds_unlocked") === "true"
};

// Check if all unlocked
function checkAllUnlocked() {
    return unlockStates.days && unlockStates.hours && unlockStates.minutes && unlockStates.seconds;
}

// Countdown loop updates
function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    const daysVal = document.getElementById("days");
    const hoursVal = document.getElementById("hours");
    const minutesVal = document.getElementById("minutes");
    const secondsVal = document.getElementById("seconds");
    
    const daysSeg = document.getElementById("days-segment");
    const hoursSeg = document.getElementById("hours-segment");
    const minutesSeg = document.getElementById("minutes-segment");
    const secondsSeg = document.getElementById("seconds-segment");

    const xpFill = document.getElementById("xpFill");
    const xpLevel = document.getElementById("xpLevel");

    // Math values
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

    // Handle locked/unlocked covers
    if (unlockStates.days) {
        daysSeg.classList.remove("locked");
        daysVal.classList.add("glitch-days");
        const glitchChars = ["00", "0ø", "ø0", "0?", "?0", "Ø0", "0Ø", "0X", "X0", "§§", "??", "øø", "ØØ"];
        if (Math.random() < 0.15) {
            daysVal.innerText = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
            daysVal.innerText = "00";
        }
        const cover = document.getElementById("days-cover");
        if (cover && !cover.classList.contains("broken")) cover.classList.add("broken");
    } else {
        daysSeg.classList.add("locked");
    }

    if (unlockStates.hours) {
        hoursSeg.classList.remove("locked");
        hoursVal.innerText = String(hours).padStart(2, '0');
        const cover = document.getElementById("hours-cover");
        if (cover && !cover.classList.contains("broken")) cover.classList.add("broken");
    } else {
        hoursSeg.classList.add("locked");
    }

    if (unlockStates.minutes) {
        minutesSeg.classList.remove("locked");
        minutesVal.innerText = String(minutes).padStart(2, '0');
        const cover = document.getElementById("minutes-cover");
        if (cover && !cover.classList.contains("broken")) cover.classList.add("broken");
    } else {
        minutesSeg.classList.add("locked");
    }

    if (unlockStates.seconds) {
        secondsSeg.classList.remove("locked");
        secondsVal.innerText = String(seconds).padStart(2, '0');
        const cover = document.getElementById("seconds-cover");
        if (cover && !cover.classList.contains("broken")) cover.classList.add("broken");
    } else {
        secondsSeg.classList.add("locked");
    }

    const allSolved = unlockStates.hours && unlockStates.minutes && unlockStates.seconds;
    if (diff <= 0) {
        if (!allSolved && localStorage.getItem("mc_timeout_webhook_sent") !== "true") {
            localStorage.setItem("mc_timeout_webhook_sent", "true");
            sendDiscordWebhook(null, false, true);
        }
        document.querySelector(".panel-header").innerText = "MÁY CHỦ ĐÃ MỞ CỬA!";
        xpFill.style.width = "100%";
        xpLevel.innerText = "0";
        return;
    }

    // Update XP Level matching unlocked states or remaining days
    const elapsed = now - startDate;
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    xpFill.style.width = progress + "%";
    
    let level = 0;
    if (unlockStates.days) level += days;
    if (unlockStates.hours) level += 2;
    if (unlockStates.minutes) level += 3;
    if (unlockStates.seconds) level += 5;
    xpLevel.innerText = level;
}

// Particle System setup
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, type = 'portal', color = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 0;
        
        if (type === 'portal') {
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = -(Math.random() * 2 + 1);
            this.maxLife = Math.random() * 80 + 50;
            this.size = Math.random() * 4 + 2;
            this.color = color || `rgba(${160 + Math.random()*50}, 40, ${220 + Math.random()*35}, 0.8)`;
            this.angle = Math.random() * Math.PI * 2;
            this.va = (Math.random() - 0.5) * 0.05;
        } else if (type === 'happy') {
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = -(Math.random() * 1.5 + 0.5);
            this.maxLife = Math.random() * 60 + 30;
            this.size = Math.random() * 3 + 3;
            this.color = '#55ff55';
        } else if (type === 'crit') {
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = (Math.random() * 2 - 1);
            this.maxLife = Math.random() * 40 + 20;
            this.size = Math.random() * 2 + 2;
            this.color = '#ffff55';
            this.gravity = 0.12;
        } else if (type === 'block-break') {
            this.vx = (Math.random() - 0.5) * 5;
            this.vy = -(Math.random() * 4 + 2);
            this.maxLife = Math.random() * 30 + 15;
            this.size = Math.random() * 5 + 4;
            this.color = color || '#22143d';
            this.gravity = 0.25;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        
        if (this.gravity) {
            this.vy += this.gravity;
        }
        
        if (this.type === 'portal') {
            this.angle += this.va;
            this.size = Math.max(0.1, this.size * 0.985);
        }
    }

    draw() {
        const progress = this.life / this.maxLife;
        let alpha = 1 - progress;
        if (alpha < 0) alpha = 0;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        if (this.type === 'portal') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        } else if (this.type === 'happy') {
            ctx.fillRect(this.x - this.size/2, this.y - this.size/6, this.size, this.size/3);
            ctx.fillRect(this.x - this.size/6, this.y - this.size/2, this.size/3, this.size);
        } else if (this.type === 'crit') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size, this.y);
            ctx.lineTo(this.x, this.y + this.size);
            ctx.lineTo(this.x - this.size, this.y);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'block-break') {
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        }
        
        ctx.restore();
    }
}

function handleParticles() {
    if (Math.random() < 0.25) {
        particles.push(new Particle(Math.random() * canvas.width, canvas.height, 'portal'));
    }
    if (Math.random() < 0.05) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'happy'));
    }

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life >= particles[i].maxLife) {
            particles.splice(i, 1);
            i--;
        }
    }
}

// Floating isometric Minecraft blocks drifting through the background so the
// empty edges of the panorama feel alive instead of blank.
const BLOCK_PALETTES = [
    { top: '#7cbd57', left: '#7b5a37', right: '#5f4529' }, // grass
    { top: '#6fdbe2', left: '#3f9aa0', right: '#2f7a7f' }, // diamond
    { top: '#f9d84b', left: '#c79a2c', right: '#a67e22' }, // gold
    { top: '#d84b4b', left: '#9e2f2f', right: '#7d2323' }, // redstone
    { top: '#4fd07a', left: '#2f9e56', right: '#237a41' }, // emerald
    { top: '#9c7a4d', left: '#6f5636', right: '#574328' }, // dirt
    { top: '#a2a2a2', left: '#727272', right: '#585858' }, // stone
    { top: '#6c86ff', left: '#3d54c4', right: '#2c3f99' }, // lapis
];

class FloatingBlock {
    constructor(initial = false) {
        this.reset(initial);
    }
    reset(initial) {
        this.size = Math.random() * 20 + 16;
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height
                          : canvas.height + this.size * 3;
        this.vy = -(Math.random() * 0.25 + 0.12);
        this.swayAmp = Math.random() * 24 + 8;
        this.swayFreq = Math.random() * 0.0015 + 0.0005;
        this.phase = Math.random() * Math.PI * 2;
        this.baseX = this.x;
        this.pal = BLOCK_PALETTES[Math.floor(Math.random() * BLOCK_PALETTES.length)];
        this.alpha = Math.random() * 0.18 + 0.14;
        this.spin = 0;
    }
    update() {
        this.y += this.vy;
        this.phase += this.swayFreq * 16;
        this.x = this.baseX + Math.sin(this.phase) * this.swayAmp;
        if (this.y < -this.size * 3) this.reset(false);
    }
    draw() {
        const s = this.size;
        const w = s, th = s * 0.5, sh = s;
        const cx = this.x, cy = this.y;
        const Ttop = [cx, cy - th], R = [cx + w, cy], Bmid = [cx, cy + th], L = [cx - w, cy];
        const Lb = [cx - w, cy + sh], Cb = [cx, cy + th + sh], Rb = [cx + w, cy + sh];

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.lineJoin = 'round';
        const face = (pts, color) => {
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        };
        face([L, Bmid, Cb, Lb], this.pal.left);
        face([R, Bmid, Cb, Rb], this.pal.right);
        face([Ttop, R, Bmid, L], this.pal.top);
        // subtle edge highlight for the pixel-cube read
        ctx.globalAlpha = this.alpha * 0.7;
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}

let floatingBlocks = [];
function initFloatingBlocks() {
    const count = Math.max(7, Math.min(16, Math.round(window.innerWidth / 140)));
    floatingBlocks = [];
    for (let i = 0; i < count; i++) floatingBlocks.push(new FloatingBlock(true));
}
initFloatingBlocks();
window.addEventListener('resize', initFloatingBlocks);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of floatingBlocks) { b.update(); b.draw(); }
    handleParticles();
    requestAnimationFrame(animate);
}
animate();

// Advancement Toast Notification trigger
function showAdvancement(descText, soundKey = 'levelUp') {
    const toast = document.getElementById("advancementToast");
    const desc = document.getElementById("toastDesc");
    
    desc.innerText = descText;
    playSound(soundKey, { volume: 0.55 });
    
    toast.classList.add("active");
    
    for (let i = 0; i < 25; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'happy'));
    }

    setTimeout(() => {
        toast.classList.remove("active");
    }, 5000);
}

// Custom 16x16 Crack Overlay Generator
const crackOverlay = document.getElementById("crackOverlay");
function drawCracks(pct) {
    if (pct === 0) {
        crackOverlay.style.backgroundImage = 'none';
        return;
    }
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 16;
    tempCanvas.height = 16;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    tempCtx.lineWidth = 1;
    tempCtx.imageSmoothingEnabled = false;

    tempCtx.beginPath();
    if (pct >= 10) {
        tempCtx.moveTo(8, 2); tempCtx.lineTo(8, 6);
        tempCtx.moveTo(8, 6); tempCtx.lineTo(11, 8);
    }
    if (pct >= 30) {
        tempCtx.moveTo(11, 8); tempCtx.lineTo(14, 8);
        tempCtx.moveTo(8, 6); tempCtx.lineTo(5, 9);
    }
    if (pct >= 50) {
        tempCtx.moveTo(5, 9); tempCtx.lineTo(5, 13);
        tempCtx.moveTo(8, 10); tempCtx.lineTo(11, 12);
        tempCtx.moveTo(2, 4); tempCtx.lineTo(5, 4);
    }
    if (pct >= 70) {
        tempCtx.moveTo(5, 9); tempCtx.lineTo(2, 8);
        tempCtx.moveTo(11, 8); tempCtx.lineTo(13, 5);
        tempCtx.moveTo(10, 12); tempCtx.lineTo(10, 15);
    }
    if (pct >= 90) {
        tempCtx.moveTo(8, 2); tempCtx.lineTo(5, 1);
        tempCtx.moveTo(11, 12); tempCtx.lineTo(8, 15);
        tempCtx.moveTo(5, 13); tempCtx.lineTo(3, 14);
        tempCtx.moveTo(13, 5); tempCtx.lineTo(15, 3);
        tempCtx.moveTo(2, 4); tempCtx.lineTo(1, 6);
    }
    tempCtx.stroke();

    crackOverlay.style.backgroundImage = `url(${tempCanvas.toDataURL()})`;
}

// Mining Logic
let clicks = 0;
let maxClicks = 10;
let isBroken = false;
let gameMode = "survival";

const mineableBlock = document.getElementById("mineableBlock");
const blockFront = document.getElementById("blockFront");
const clickHint = document.getElementById("clickHint");
const blockLabel = document.getElementById("blockLabel");
const chestModal = document.getElementById("chestModal");

mineableBlock.addEventListener("click", () => {
    initAudio();
    if (isBroken) {
        playChestOpenSound();
        // Clear the inline float animation so the CSS open-pop can take over
        mineableBlock.style.animation = "none";
        mineableBlock.classList.add("open");
        setTimeout(() => {
            chestModal.classList.add("active");
        }, 300);
        return;
    }

    if (gameMode === "creative") {
        clicks = maxClicks;
    } else {
        clicks++;
    }

    mineableBlock.style.transform = "rotateX(-20deg) rotateY(35deg) scale(0.92)";
    setTimeout(() => {
        if (!isBroken) {
            mineableBlock.style.transform = "rotateX(-20deg) rotateY(35deg) scale(1.08)";
        }
    }, 80);

    const rect = mineableBlock.getBoundingClientRect();
    const blockX = rect.left + rect.width / 2;
    const blockY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(blockX, blockY, 'crit'));
    }
    
    const obsidianColors = ['#100c1e', '#2d154c', '#190e2d', '#130a24'];
    for (let i = 0; i < 6; i++) {
        const color = obsidianColors[Math.floor(Math.random() * obsidianColors.length)];
        particles.push(new Particle(blockX, blockY, 'block-break', color));
    }

    if (clicks < maxClicks) {
        playHitSound();
        const percent = Math.floor((clicks / maxClicks) * 100);
        drawCracks(percent);
        clickHint.innerText = `Mẹo: Click để đập khối! (${clicks}/${maxClicks})`;
    } else {
        isBroken = true;
        playBreakSound();
        drawCracks(0);
        
        for (let i = 0; i < 25; i++) {
            const color = obsidianColors[Math.floor(Math.random() * obsidianColors.length)];
            particles.push(new Particle(blockX, blockY, 'block-break', color));
        }
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(blockX, blockY, 'crit'));
        }

        mineableBlock.classList.add("chest-block");
        blockLabel.innerText = "CHEST OF SECRETS";
        clickHint.innerText = "Đã tìm thấy rương! Click để mở!";
        clickHint.style.color = "#55ff55";
        
        mineableBlock.style.animation = "floatBlock 2s infinite alternate ease-in-out";
        
        showAdvancement("Đã Khai Thác Rương Bí Mật!");
        writeToChatHistory("[Hệ thống] Bạn đã đập vỡ Obsidian và giải thoát Rương Bật Mí!", "success");
    }
});

// Chat Console Controller
const chatContainer = document.getElementById("chatContainer");
const chatHistory = document.getElementById("chatHistory");
const chatInput = document.getElementById("chatInput");

document.addEventListener("keydown", (e) => {
    if (e.key === 't' || e.key === 'T' || e.key === '/') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
        }
        
        e.preventDefault();
        chatContainer.classList.add("active");
        chatInput.focus();
        
        if (e.key === '/') {
            chatInput.value = "/";
        }
    } else if (e.key === 'Escape') {
        chatInput.value = "";
        chatInput.blur();
        chatContainer.classList.remove("active");
    }
});

function writeToChatHistory(text, type = "normal") {
    const line = document.createElement("div");
    line.className = `chat-line ${type}`;
    line.innerText = text;
    chatHistory.appendChild(line);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

chatInput.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
        const value = chatInput.value.trim();
        chatInput.value = "";
        
        if (value === "") return;
        
        writeToChatHistory(`> ${value}`);
        handleCommand(value);
    }
});

document.addEventListener("click", (e) => {
    if (!chatContainer.contains(e.target) && e.target !== chatInput) {
        chatContainer.classList.remove("active");
    }
});

// Perform physical mining breaking animation on segment locks
function animateSegmentBreak(segment, code = "") {
    const cover = document.getElementById(`${segment}-cover`);
    if (!cover) return;

    // Start shaking
    cover.classList.add("shaking");

    // Play hit sounds sequence
    let delay = 0;
    for (let h = 0; h < 4; h++) {
        setTimeout(playHitSound, delay);
        delay += 110;
    }

    // Complete break after 500ms
    setTimeout(() => {
        cover.classList.remove("shaking");
        cover.classList.add("broken");
        
        playBreakSound();

        const rect = cover.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Emit block break particles matching each ore's colour
        const diamondColors = ['#bff7fb', '#6fdbe2', '#3f9aa0', '#2f7a7f'];
        const goldColors = ['#ffe680', '#f9d84b', '#c79a2c', '#8a6b1f'];
        const redstoneColors = ['#ff7b7b', '#ff2222', '#b30000', '#730000'];
        const lapisColors = ['#a9b8ff', '#6c86ff', '#3d54c4', '#243a99'];

        let particleColors = lapisColors;
        if (segment === "days") particleColors = diamondColors;
        if (segment === "hours") particleColors = goldColors;
        if (segment === "minutes") particleColors = redstoneColors;

        for (let i = 0; i < 20; i++) {
            const color = particleColors[Math.floor(Math.random() * particleColors.length)];
            particles.push(new Particle(centerX, centerY, 'block-break', color));
        }

        // Show advancement toast
        unlockStates[segment] = true;
        localStorage.setItem(`mc_${segment}_unlocked`, "true");
        updateCountdown();

        // Save unlock state to database
        fetch("/api/unlock", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ segment, code })
        }).catch(err => console.error("Failed to save unlock state to database:", err));

        const allSolved = unlockStates.hours && unlockStates.minutes && unlockStates.seconds;

        if (allSolved) {
            showAdvancement("THÀNH TỰU TỐI CAO: GIẢI MÃ TOÀN BỘ THỜI GIAN!", 'dragonDeath');
            writeToChatHistory(`[Server] 🎉 TẤT CẢ CÁC MẢNH GHÉP ĐÃ ĐƯỢC GIẢI MÃ! MÁY CHỦ SẴN SÀNG KHỞI CHẠY! 🎉`, "success");
            sendDiscordWebhook(segment, true);
        } else {
            showAdvancement(`Đã Giải Mã Thành Công: ${segment.toUpperCase()}!`, 'challengeComplete');
            writeToChatHistory(`[Server] Phân khúc '${segment.toUpperCase()}' đã được phá vỡ thành công!`, "success");
            sendDiscordWebhook(segment, false);
        }
    }, 500);
}

// Function to send congratulatory message to Discord Webhook
// Function to send congratulatory message to Discord Webhook
function sendDiscordWebhook(segment, isEpic = false, isTimeout = false) {
    const webhookUrl = "https://discord.com/api/webhooks/1522847264995807305/13yUnTqoovGrNPZc3X0Efgl2tD_7LbuYXtLNm4Na_35U6nqc32UsT-fj0Fs6tErUrvxB";
    
    const segmentColors = {
        days: 4179152,      // #3fc4d0 (Cyan)
        hours: 16373835,    // #f9d84b (Gold)
        minutes: 16720418,  // #ff2222 (Redstone Red)
        seconds: 4019396    // #3d54c4 (Lapis Blue)
    };

    const titleColors = {
        days: "💎 KIM CƯƠNG (DAYS) 💎",
        hours: "👑 VÀNG (HOURS) 👑",
        minutes: "🔴 ĐÁ ĐỎ (MINUTES) 🔴",
        seconds: "🔵 LÁP LÁNH (SECONDS) 🔵"
    };

    let payload;

    if (isTimeout) {
        payload = {
            username: "OlongBell Server Announcer",
            avatar_url: "https://i.imgur.com/8Q8pY7W.png",
            embeds: [
                {
                    title: "⏰ THỜI GIAN ĐÃ ĐIỂM: TIẾT LỘ THÔNG TIN MÁY CHỦ! ⏰",
                    description: `⏳ **Thời gian đếm ngược đã kết thúc!** Mặc dù các manh mối chưa được giải mã hoàn chỉnh, máy chủ **OlongBell Server** vẫn chính thức mở cửa để đón chào tất cả mọi người!`,
                    color: 16733952, // Orange/Gold
                    fields: [
                        {
                            name: "🔓 Trạng Thế Tổng Thể",
                            value: "🔴 CHƯA HOÀN THÀNH (Hết giờ)",
                            inline: true
                        },
                        {
                            name: "🎮 Tình Trạng Máy Chủ",
                            value: "⚡ TỰ ĐỘNG KHỞI CHẠY",
                            inline: true
                        },
                        {
                            name: "🌍 Thông điệp",
                            value: "Cảm ơn các nhà thám hiểm đã tham gia cuộc truy tìm manh mối! Cho dù thử thách chưa được chinh phục hoàn toàn, cánh cổng OlongBell đã mở ra. Hãy tham gia ngay cùng cộng đồng!",
                            inline: false
                        }
                    ],
                    footer: {
                        text: "OLONGBELLSERVER",
                        icon_url: "https://i.imgur.com/8Q8pY7W.png"
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    title: "🎮 KẾT NỐI NGAY: HÀNH TRÌNH BẮT ĐẦU! 🎮",
                    description: `
🌟 **Chào mừng các nhà thám hiểm đến với OlongBell Server!** 🌟

Cánh cổng dẫn tới thế giới sinh tồn cực hạn đã chính thức khai mở. Dưới đây là thông tin chi tiết giúp bạn kết nối và tham gia cùng cộng đồng ngay hôm nay:

⚡ **ĐỊA CHỈ IP KẾT NỐI**
  ✦ Địa chỉ IP: \`onglongbel.raumasmp.online\`

🛠️ **PHIÊN BẢN HỖ TRỢ**
  ✦ Phiên bản: \`26.2 Fabric\`
  *(Khuyến khích cài đặt để trải nghiệm tính năng Voice Chat trực tiếp cực đỉnh trong game!)*

📦 **MOD**
  ✦ Đường dẫn: https://drive.google.com/file/d/1ajGOEs5I3ZGFEaI7_r9YDK0A7DqlrdTE/view?usp=sharing

🌏 **MÁY CHỦ VẬT LÝ**
  ✦ Vị trí: Hồ Chí Minh City (Băng thông cao, ping cực mượt ~5ms)

📖 **HƯỚNG DẪN THAM GIA**
  ✦ Bạn là người chơi mới? Hãy xem ngay hướng dẫn chi tiết cách cài đặt game và voice chat tại đây:
  👉 [Xem Video Hướng Dẫn Tham Gia Máy Chủ](https://www.youtube.com/watch?v=sAs28-UqE-M&t=1s)
`,
                    color: 16733952,
                    image: {
                        url: "https://cdn.discordapp.com/attachments/1517927699123933325/1525114614445117502/content.png?ex=6a52352b&is=6a50e3ab&hm=b8e6a4b8a23b152ef9816beebe5a090f5671ec2031735ffbf9582ca6478bc174&"
                    }
                }
            ]
        };
    } else if (isEpic) {
        payload = {
            username: "OlongBell Server Announcer",
            avatar_url: "https://i.imgur.com/8Q8pY7W.png",
            embeds: [
                {
                    title: "✨ 🏆 THÀNH TỰU TỐI CAO: GIẢI MÃ HOÀN TOÀN! 🏆 ✨",
                    description: `🔥 **Kỷ nguyên mới đã bắt đầu!** Toàn bộ các mảnh ghép thời gian của **OlongBell Server** đã được đồng bộ hóa thành công!`,
                    color: 11141290, // Purple
                    fields: [
                        {
                            name: "🔓 Trạng Thái Tổng Thể",
                            value: "🟢 ĐỒNG BỘ HOÀN TOÀN (100%)",
                            inline: true
                        },
                        {
                            name: "🎮 Tình Trạng Máy Chủ",
                            value: "⚡ SẴN SÀNG KHỞI CHẠY",
                            inline: true
                        },
                        {
                            name: "🌍 Lời hiệu triệu",
                            value: "Xin chúc mừng và vinh danh những nhà thám hiểm kiên trì nhất! Hãy sẵn sàng kết nối, thế giới OlongBell sinh tồn cực hạn đang chờ đón các bạn!",
                            inline: false
                        }
                    ],
                    footer: {
                        text: "OLONGBELLSERVER",
                        icon_url: "https://i.imgur.com/8Q8pY7W.png"
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    title: "🎮 KẾT NỐI NGAY: HÀNH TRÌNH BẮT ĐẦU! 🎮",
                    description: `
🌟 **Chào mừng các nhà thám hiểm đến với OlongBell Server!** 🌟

Cánh cổng dẫn tới thế giới sinh tồn cực hạn đã chính thức khai mở. Dưới đây là thông tin chi tiết giúp bạn kết nối và tham gia cùng cộng đồng ngay hôm nay:

⚡ **ĐỊA CHỈ IP KẾT NỐI**
  ✦ Địa chỉ IP: \`onglongbel.raumasmp.online\`

🛠️ **PHIÊN BẢN HỖ TRỢ**
  ✦ Phiên bản: \`26.2 Fabric\`
  *(Khuyến khích cài đặt để trải nghiệm tính năng Voice Chat trực tiếp cực đỉnh trong game!)*

📦 **MOD**
  ✦ Đường dẫn: https://drive.google.com/file/d/1ajGOEs5I3ZGFEaI7_r9YDK0A7DqlrdTE/view?usp=sharing

🌏 **MÁY CHỦ VẬT LÝ**
  ✦ Vị trí: Hồ Chí Minh City (Băng thông cao, ping cực mượt ~5ms)

📖 **HƯỚNG DẪN THAM GIA**
  ✦ Bạn là người chơi mới? Hãy xem ngay hướng dẫn chi tiết cách cài đặt game và voice chat tại đây:
  👉 [Xem Video Hướng Dẫn Tham Gia Máy Chủ](https://www.youtube.com/watch?v=sAs28-UqE-M&t=1s)
`,
                    color: 11141290, // Purple
                    image: {
                        url: "https://cdn.discordapp.com/attachments/1517927699123933325/1525114614445117502/content.png?ex=6a52352b&is=6a50e3ab&hm=b8e6a4b8a23b152ef9816beebe5a090f5671ec2031735ffbf9582ca6478bc174&"
                    }
                }
            ]
        };
    } else {
        payload = {
            username: "OlongBell ARG Announcer",
            avatar_url: "https://i.imgur.com/8Q8pY7W.png",
            embeds: [{
                title: "🎉 THÀNH TỰU ĐẠT ĐƯỢC: MANH MỐI ĐÃ ĐƯỢC GIẢI MÃ! 🎉",
                description: `Một mảnh ghép thời gian của sự kiện **OlongBell Countdown** đã được phá vỡ thành công!`,
                color: segmentColors[segment] || 65280,
                fields: [
                    {
                        name: "🧩 Phân Khúc Giải Mã",
                        value: `\`${titleColors[segment] || segment.toUpperCase()}\``,
                        inline: true
                    },
                    {
                        name: "🔓 Trạng Thái",
                        value: "🟢 Đã mở khóa",
                        inline: true
                    },
                    {
                        name: "💬 Lời chúc mừng",
                        value: "Xin chúc mừng nhà thám hiểm tài ba đã xuất sắc vượt qua thử thách này! Cánh cửa dẫn tới thế giới mới đang dần hé mở...",
                        inline: false
                    }
                ],
                footer: {
                    text: "OLONGBELLSERVER",
                    icon_url: "https://i.imgur.com/8Q8pY7W.png"
                },
                timestamp: new Date().toISOString()
            }]
        };
    }

    fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Error sending webhook:", err));
}

// Parse secret command codes
async function handleCommand(cmdStr) {
    initAudio();
    
    if (!cmdStr.startsWith("/")) {
        writeToChatHistory("[Chat] Bạn chỉ có thể nhập các lệnh bắt đầu bằng dấu gạch chéo (/)", "info");
        return;
    }

    const parts = cmdStr.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
        case "/help":
            writeToChatHistory("=== DANH SÁCH LỆNH CHAT ===", "info");
            writeToChatHistory("/help - Hiển thị hướng dẫn này", "info");
            writeToChatHistory("/unlock <days|hours|minutes|seconds> <mã> - Giải mã ARG", "info");
            writeToChatHistory("/gamemode <survival|creative> - Chế độ đập khối", "info");
            writeToChatHistory("/op herobrine - Triệu hồi Herobrine", "info");
            writeToChatHistory("/clear - Xóa sạch lịch sử chat", "info");
            break;
            
        case "/clear":
            chatHistory.innerHTML = "";
            writeToChatHistory("[Hệ Thống] Lịch sử chat đã được làm sạch.", "system");
            break;

        case "/gamemode":
            if (parts.length < 2) {
                writeToChatHistory("Cú pháp: /gamemode <survival|creative>", "error");
                return;
            }
            const mode = parts[1].toLowerCase();
            if (mode === "creative" || mode === "c") {
                gameMode = "creative";
                writeToChatHistory("[Server] Chế độ chơi đã được cập nhật thành Sáng Tạo (Creative).", "info");
                clickHint.innerText = "Chế độ Sáng Tạo: Click 1 phát vỡ luôn!";
                clickHint.style.color = "#ffff55";
            } else if (mode === "survival" || mode === "s") {
                gameMode = "survival";
                writeToChatHistory("[Server] Chế độ chơi đã được cập nhật thành Sinh Tồn (Survival).", "info");
                clickHint.innerText = `Mẹo: Click để đập khối! (${clicks}/${maxClicks})`;
                clickHint.style.color = "#ffaa00";
            } else {
                writeToChatHistory(`Chế độ '${parts[1]}' không hợp lệ!`, "error");
            }
            break;

        case "/op":
            if (parts.length < 2) {
                writeToChatHistory("Cú pháp: /op <player_name>", "error");
                return;
            }
            const name = parts[1].toLowerCase();
            if (name === "herobrine") {
                triggerHerobrineScare();
            } else {
                writeToChatHistory(`[Server] Đã cấp quyền OP cho ${parts[1]}. (Quyền lực ảo thôi!)`, "success");
            }
            break;

        case "/devreset":
            if (parts.length < 2 || (await sha256(parts[1])) !== "975515d32ebced3b6ed1cd810146fb28699690ae48d3d06c2271d779100703bb") {
                writeToChatHistory("[Server] Sai mã bảo mật nhà phát triển!", "error");
                return;
            }
            // Reset unlock states
            unlockStates.days = true; // Always stays true (glitched launch day today)
            unlockStates.hours = false;
            unlockStates.minutes = false;
            unlockStates.seconds = false;
            
            localStorage.setItem("mc_days_unlocked", "true");
            localStorage.setItem("mc_hours_unlocked", "false");
            localStorage.setItem("mc_minutes_unlocked", "false");
            localStorage.setItem("mc_seconds_unlocked", "false");
            
            // Reset database
            fetch("/api/reset", {
                method: "POST"
            }).catch(err => console.error("Failed to reset database:", err));
            
            // Reset secret section states
            isSecretUnlocked = false;
            isSecretActivated = false;
            localStorage.setItem("mc_secret_unlocked", "false");
            localStorage.setItem("mc_secret_activated", "false");
            
            // Reset the segment UI elements
            ["days", "hours", "minutes", "seconds"].forEach(seg => {
                const cover = document.getElementById(`${seg}-cover`);
                if (cover) {
                    cover.classList.remove("broken", "shaking");
                }
                const segmentElement = document.getElementById(`${seg}-segment`);
                if (segmentElement) {
                    segmentElement.classList.add("locked");
                }
            });
            
            // Reset secret pressure plate UI
            if (secretSection) {
                secretSection.style.display = "none";
                secretSection.classList.remove("active");
            }
            if (secretBtn) {
                secretBtn.classList.remove("pressed");
            }
            if (secretPlateLabel) {
                secretPlateLabel.innerText = "NÚT BÍ MẬT";
                secretPlateLabel.classList.remove("activated");
            }
            if (secretHint) {
                secretHint.innerText = "Dẫm lên đĩa áp lực...";
                secretHint.style.color = "";
            }
            
            // Reset slot 8 in chest grid
            delete items[8];
            const slot8 = chestGrid.querySelector(`[data-index="8"]`);
            if (slot8) {
                slot8.classList.remove("has-item", "enchanted-glow");
                slot8.innerHTML = "";
                const newSlot8 = slot8.cloneNode(true);
                slot8.replaceWith(newSlot8);
            }
            
            updateCountdown();
            writeToChatHistory("[Hệ thống] Đã reset toàn bộ trạng thái giải mã về mặc định!", "success");
            break;

        case "/devtime":
            if (parts.length < 2 || (await sha256(parts[1])) !== "99e476afc6494eb2fc49bcd4494d57507604ca6e9b78f1a45aec347d1ae5ccab") {
                writeToChatHistory("[Server] Sai mã bảo mật nhà phát triển!", "error");
                return;
            }
            const nowTime = new Date().getTime();
            const diffTime = targetDate - nowTime;

            const d = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            const h = Math.max(0, Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            const m = Math.max(0, Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60)));
            const s = Math.max(0, Math.floor((diffTime % (1000 * 60)) / 1000));

            writeToChatHistory(`[Server] Thời gian đếm ngược còn lại: ${d} ngày, ${h} giờ, ${m} phút, ${s} giây.`, "success");
            break;

        case "/devunlockall":
            if (parts.length < 2 || (await sha256(parts[1])) !== "99e476afc6494eb2fc49bcd4494d57507604ca6e9b78f1a45aec347d1ae5ccab") {
                writeToChatHistory("[Server] Sai mã bảo mật nhà phát triển!", "error");
                return;
            }
            
            // Unlock all segment locks sequentially to preserve dependency order
            (async () => {
                const segs = ["seconds", "minutes", "hours"];
                for (const seg of segs) {
                    unlockStates[seg] = true;
                    localStorage.setItem(`mc_${seg}_unlocked`, "true");
                    
                    const cover = document.getElementById(`${seg}-cover`);
                    if (cover) {
                        cover.classList.remove("shaking");
                        cover.classList.add("broken");
                    }
                    const segmentElement = document.getElementById(`${seg}-segment`);
                    if (segmentElement) {
                        segmentElement.classList.remove("locked");
                    }

                    try {
                        await fetch("/api/unlock", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ segment: seg })
                        });
                    } catch (err) {
                        console.error("Failed to save devunlock state:", err);
                    }
                }
                
                updateCountdown();
                
                // Show ultimate completion event
                showAdvancement("THÀNH TỰU TỐI CAO: GIẢI MÃ TOÀN BỘ THỜI GIAN!", 'dragonDeath');
                writeToChatHistory(`[Server] 🎉 ĐÃ MỞ KHÓA TOÀN BỘ CÁC MẢNH GHÉP THỜI GIAN QUA LỆNH ADMIN! 🎉`, "success");
                sendDiscordWebhook("seconds", true); // Send epic webhook
            })();
            break;

        case "/unlock":
            if (parts.length < 2) {
                writeToChatHistory("Cú pháp: /unlock <days|hours|minutes|seconds> <mã_arg>", "error");
                return;
            }
            const segment = parts[1].toLowerCase();

            if (segment === "days") {
                writeToChatHistory("[Server] Trục thời gian ghi nhận: Phân khúc 'days' đã mở khóa từ trước bởi một thế lực vô hình...", "warning");
                writeToChatHistory("[Server] Nhưng hãy tự hỏi... Liệu con số '00 ngày' đang hiển thị kia có phản ánh đúng thực tại, hay dòng thời gian đã bị bẻ cong từ lâu?", "error");
                return;
            }

            if (parts.length < 3) {
                writeToChatHistory("Cú pháp: /unlock <days|hours|minutes|seconds> <mã_arg>", "error");
                return;
            }
            const inputCode = parts[2];

            if (!codes[segment]) {
                writeToChatHistory(`Mục '${parts[1]}' không tồn tại! Chọn: days, hours, minutes, seconds.`, "error");
                return;
            }

            if (unlockStates[segment]) {
                writeToChatHistory(`Mục '${segment}' đã được giải mã trước đó rồi!`, "info");
                return;
            }

            // Enforce sequential solving: seconds -> minutes -> hours
            if (segment === "minutes" && !unlockStates.seconds) {
                writeToChatHistory("[Server] Khóa 'seconds' (giây) chưa được giải mã! Hãy giải mã 'seconds' trước.", "error");
                return;
            }
            if (segment === "hours" && !unlockStates.minutes) {
                writeToChatHistory("[Server] Khóa 'minutes' (phút) chưa được giải mã! Hãy giải mã 'minutes' trước.", "error");
                return;
            }

            if ((await sha256(inputCode)) === codes[segment]) {
                animateSegmentBreak(segment, inputCode);
            } else {
                writeToChatHistory("[Server] Sai mã bảo mật! Trực giác của bạn chưa đủ nhạy bén.", "error");
            }
            break;

        default:
            writeToChatHistory(`Lệnh không hợp lệ: '${cmd}'. Gõ /help để xem hướng dẫn.`, "error");
            break;
    }
}

// Synthesize Terrifying Herobrine Screech + Rumble
function playJumpscareSound() {
    initAudio();
    if (!audioCtx) return;

    const duration = 2.2;
    const time = audioCtx.currentTime;

    // Sub-bass heavy rumble
    const rumbleOsc = audioCtx.createOscillator();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(32, time);
    rumbleOsc.frequency.linearRampToValueAtTime(8, time + duration);

    const rumbleGain = audioCtx.createGain();
    rumbleGain.gain.setValueAtTime(1.2, time);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(audioCtx.destination);

    // High pitched screeches
    const screamOsc1 = audioCtx.createOscillator();
    screamOsc1.type = 'sawtooth';
    screamOsc1.frequency.setValueAtTime(950, time);
    screamOsc1.frequency.linearRampToValueAtTime(220, time + duration);

    const screamOsc2 = audioCtx.createOscillator();
    screamOsc2.type = 'square';
    screamOsc2.frequency.setValueAtTime(1000, time);
    screamOsc2.frequency.linearRampToValueAtTime(180, time + duration);

    // High-speed frequency modulation (Vibrato)
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 32; 
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 220; 

    lfo.connect(lfoGain);
    lfoGain.connect(screamOsc1.frequency);
    lfoGain.connect(screamOsc2.frequency);

    const screamGain = audioCtx.createGain();
    screamGain.gain.setValueAtTime(1.0, time);
    screamGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    screamOsc1.connect(screamGain);
    screamOsc2.connect(screamGain);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + duration);

    screamGain.connect(filter);
    filter.connect(audioCtx.destination);

    rumbleOsc.start(time);
    rumbleOsc.stop(time + duration);
    screamOsc1.start(time);
    screamOsc1.stop(time + duration);
    screamOsc2.start(time);
    screamOsc2.stop(time + duration);
    lfo.start(time);
    lfo.stop(time + duration);
}

// Herobrine Scare Event
let isGlitched = false;
function triggerHerobrineScare() {
    if (isGlitched) return;
    isGlitched = true;

    // Phase 1: Interception
    playSound('cave10', { volume: 1.0 });
    writeToChatHistory("§4[Hệ thống] CẢNH BÁO BẢO MẬT: Phát hiện hoạt động can thiệp trái phép từ thực thể vô danh...", "error");
    
    // Slight screen shake
    document.body.classList.add("glitch-scare-pre");
    
    // Corrupt the countdown values
    const daysVal = document.getElementById("days");
    const hoursVal = document.getElementById("hours");
    const minutesVal = document.getElementById("minutes");
    const secondsVal = document.getElementById("seconds");
    
    const origDays = daysVal ? daysVal.innerText : "00";
    const origHours = hoursVal ? hoursVal.innerText : "00";
    const origMinutes = minutesVal ? minutesVal.innerText : "00";
    const origSeconds = secondsVal ? secondsVal.innerText : "00";
    
    setTimeout(() => {
        if (daysVal) daysVal.innerText = "66";
        if (hoursVal) hoursVal.innerText = "6";
        if (minutesVal) minutesVal.innerText = "6";
        if (secondsVal) secondsVal.innerText = "6";
        playSound('cave1', { volume: 1.0 });
        
        writeToChatHistory("§4[Hệ thống] LỖI: Quyền điều khiển server đã bị tước đoạt bởi Herobrine.", "error");
    }, 1000);

    setTimeout(() => {
        writeToChatHistory("§4[Chat] Herobrine: Cảm ơn vì đã cấp quyền OP cho ta...", "error");
    }, 2200);

    setTimeout(() => {
        writeToChatHistory("§4[Server] Herobrine đã thực hiện lệnh: /gamemode survival @a", "error");
        writeToChatHistory("§4[Server] Herobrine đã thực hiện lệnh: /kill @a", "error");
    }, 3200);

    // Phase 2: Screaming Jumpscare
    setTimeout(() => {
        document.body.classList.remove("glitch-scare-pre");
        document.body.classList.add("glitch-scare");
        
        // Change document title
        const origTitle = document.title;
        document.title = "H E L P   M E";
        
        // Show fullscreen jumpscare face
        const jumpscareOverlay = document.getElementById("jumpscareOverlay");
        if (jumpscareOverlay) {
            jumpscareOverlay.classList.add("active");
        }
        
        // Play jumpscare sounds (screech + dragon death for maximum impact)
        playJumpscareSound();
        playSound('dragonDeath', { volume: 0.8 });
        
        const eyes = document.getElementById("herobrineEyes");
        if (eyes) eyes.classList.add("visible");
        
        const splash = document.getElementById("splashText");
        const origSplash = splash ? splash.innerText : "";
        if (splash) {
            splash.innerText = "H E R O B R I N E   I S   W A T C H I N G";
            splash.style.color = "#ff5555";
            splash.style.animation = "none";
            splash.style.fontSize = "1.5rem"; 
        }

        // Hide jumpscare overlay after 2 seconds, but keep screen pitch dark / eyes showing
        setTimeout(() => {
            if (jumpscareOverlay) {
                jumpscareOverlay.classList.remove("active");
            }
        }, 2000);

        // Phase 3: Recover
        setTimeout(() => {
            document.body.classList.remove("glitch-scare");
            if (eyes) eyes.classList.remove("visible");
            document.title = origTitle;
            
            if (splash) {
                splash.innerText = origSplash;
                splash.style.color = "#ffff55";
                splash.style.animation = "splashPulse 0.5s infinite alternate ease-in-out";
                splash.style.fontSize = "1.45rem";
            }
            
            // Restore timer
            if (daysVal) daysVal.innerText = origDays;
            if (hoursVal) hoursVal.innerText = origHours;
            if (minutesVal) minutesVal.innerText = origMinutes;
            if (secondsVal) secondsVal.innerText = origSeconds;
            
            playSound('levelUp', { volume: 0.5 });
            writeToChatHistory("[Server] Hệ thống được khôi phục khẩn cấp hoàn tất. Đã thu hồi quyền OP của Herobrine.", "system");
            writeToChatHistory("[Server] Lưu ý: Dấu vết của thực thể vẫn còn trong cơ sở dữ liệu.", "info");
            
            isGlitched = false;
        }, 6000); 
    }, 3800);
}

// Creeper Hiss Easter Egg hover logic
const creeperEgg = document.getElementById("creeperEgg");
creeperEgg.addEventListener("mouseenter", () => {
    playCreeperHiss();
    // Emit some happy villager green dust when hovering the hidden creeper
    const rect = creeperEgg.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
        particles.push(new Particle(
            rect.left + Math.random() * rect.width,
            rect.top + Math.random() * rect.height,
            'happy'
        ));
    }
});

// Discord button sound click
document.getElementById("discordBtn").addEventListener("click", playClickSound);

// Setup Chest GUI Items
const chestGrid = document.getElementById("chestGrid");

const items = {
    10: {
        id: "sword",
        name: "Kiếm Cổ Khắc Họa (Engraved Broadsword)",
        rarity: "rare",
        description: "Thanh gươm cổ xưa rỉ sét, trên lưỡi kiếm có khắc hướng dẫn mật thư...\n\nClick để xem nội dung gợi ý!",
        lore: "Tương truyền thanh kiếm này thuộc về Hoàng Đế Caesar vĩ đại.",
        hint: "Click để đọc văn tự trên lưỡi kiếm!",
        imageHtml: `<img src="/textures/items/diamond_sword.png" alt="Sword">`,
        actionText: "VĂN TỰ TRÊN LƯỠI KIẾM\n\nBạn lau sạch lớp bụi trên gươm và phát hiện hướng dẫn giải mật mã:\n\n'Âm thanh hỗn loạn từ đĩa nhạc 11 ẩn chứa một chuỗi ký tự vô nghĩa trong Minecraft. Phải chăng tác giả rất thích phép toán dịch chuyển Caesar Cipher? Hãy thử dùng thuật toán dịch chuyển bảng chữ cái để tìm ra mã số giải mã gồm 6 chữ số!'"
    },
    12: {
        id: "map",
        name: "Bản Đồ Thám Hiểm Mã Hóa (Encoded Navigator Map)",
        rarity: "epic",
        description: "Tấm bản đồ chỉ đường không vẽ địa hình mà chứa gợi ý về một chuỗi ký tự ma thuật...\n\nClick để xem gợi ý mật mã!",
        lore: "Chỉ có thể nhìn thấy hành trình qua các bộ giải mã cổ xưa.",
        hint: "Click để mở bản đồ định vị!",
        imageHtml: `<img src="/textures/items/filled_map.png" alt="Map">`,
        actionText: "BẢN ĐỒ ĐỊNH VỊ BÍ ẨN\n\nMật thư ghi chép hành trình:\n\n'Manh mối tiếp theo được ẩn giấu dưới một chuỗi Base64 trong Minecraft. Hãy thử giải mã chuỗi Base64 đó để tìm ra một ID trông giống hệt đường link video YouTube. Một video ẩn giấu đang đợi bạn ở phía trước!'"
    },
    14: {
        id: "book",
        name: "Mật Bản Tín Hiệu Morse (Enchanted Morse Scroll)",
        rarity: "epic",
        description: "Cuốn sách ma thuật tỏa ra ánh sáng tím, chứa các gợi ý về tín hiệu vô tuyến...\n\nClick để giải mã gợi ý!",
        lore: "Tín hiệu vô tuyến từ một chiều không gian khác.",
        hint: "Click để nghe tần số ma thuật!",
        imageHtml: `<img src="/textures/items/enchanted_book.png" alt="Book">`,
        actionText: "TÍN HIỆU MORSE KHÔNG GIAN\n\nCuốn sách ghi nhận gợi ý:\n\n'Những dấu chấm \".\" và gạch \"-\" trong Minecraft chính là chìa khóa cuối cùng. Khi bạn đã tìm được video YouTube bí ẩn ở bước trước, hãy bật phụ đề (Subtitles/CC) của video đó lên. Đối chiếu các ký tự Morse với mốc thời gian xuất hiện của chúng trong phụ đề video để nhận được chuỗi mật mã chính xác!'"
    },
    16: {
        id: "cookie",
        name: "Bánh Quy Lập Trình (Dev Cookie)",
        rarity: "common",
        description: "Thơm ngon và ngọt ngào.\nĂn vào tăng 100% độ tỉnh táo để cày cuốc!\n\nClick để xem thông điệp từ Admin!",
        lore: "Chúc người chơi có những giờ phút vui vẻ!",
        hint: "Click để nhận thông điệp Admin!",
        imageHtml: `<img src="/textures/items/cookie.png" alt="Cookie">`,
        actionText: "LỜI NHẮN TỪ ADMIN\n\nChào bạn! Dự án máy chủ Olong Bell Server này đã được đội ngũ chúng tôi ấp ủ hơn nửa năm nay. Từng chi tiết nhỏ về cân bằng trang bị, lối chơi dungeon và nhiệm vụ RPG cốt truyện đều được tối ưu tốt nhất.\n\nARG giải mật mã này là một món quà nhỏ chúng tôi gửi tới Discord server để tạo sự gắn kết. Bạn hãy chia sẻ mật mã này để cùng nhau giải khóa thời gian nhé! Hẹn gặp lại bạn tại Server nhé!"
    }
};

// Create custom tooltip
const tooltip = document.querySelector(".mc-tooltip") || document.createElement("div");
tooltip.className = "mc-tooltip";
if (!document.body.contains(tooltip)) {
    document.body.appendChild(tooltip);
}

// Generate Chest Grid slots
for (let i = 0; i < 27; i++) {
    const slot = document.createElement("div");
    slot.className = "chest-slot";
    slot.dataset.index = i;
    
    if (items[i]) {
        slot.classList.add("has-item");
        if (items[i].rarity === "epic") {
            slot.classList.add("enchanted-glow");
        }
        
        slot.innerHTML = items[i].imageHtml;
        
        slot.addEventListener("mouseenter", () => {
            const item = items[i];
            let rarityClass = "";
            if (item.rarity === "rare") rarityClass = "rare";
            if (item.rarity === "epic") rarityClass = "epic";
            
            tooltip.innerHTML = `
                <div class="tooltip-title ${rarityClass}">${item.name}</div>
                <div class="tooltip-description">${item.description.replace(/\n/g, '<br>')}</div>
                <div class="tooltip-lore">${item.lore}</div>
                <div class="tooltip-hint">${item.hint}</div>
            `;
            tooltip.style.display = "flex";
        });

        slot.addEventListener("mousemove", (e) => {
            tooltip.style.left = (e.clientX + 15) + "px";
            tooltip.style.top = (e.clientY + 15) + "px";
        });

        slot.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        slot.addEventListener("click", () => {
            tooltip.style.display = "none";
            playClickSound();
            
            const item = items[i];
            const teaserModal = document.getElementById("teaserModal");
            const teaserTitle = document.getElementById("teaserTitle");
            const teaserImage = document.getElementById("teaserImage");
            const teaserText = document.getElementById("teaserText");

            teaserTitle.innerText = item.name;
            
            if (item.image) {
                teaserImage.src = item.image;
                teaserImage.style.display = "block";
            } else {
                teaserImage.style.display = "none";
            }

            teaserText.innerHTML = item.actionText.replace(/\n/g, '<br>');
            teaserModal.classList.add("active");
        });
    }

    chestGrid.appendChild(slot);
}

// Close Chest Modal
document.getElementById("closeChestBtn").addEventListener("click", () => {
    playChestCloseSound();
    chestModal.classList.remove("active");
    mineableBlock.classList.remove("open");
    // Resume the gentle floating bob after the chest closes
    mineableBlock.style.animation = "floatBlock 2s infinite alternate ease-in-out";
});

// Close Teaser Modal
document.getElementById("closeTeaserBtn").addEventListener("click", () => {
    playClickSound();
    document.getElementById("teaserModal").classList.remove("active");
});

// Minecraft ARG Secret Sequence Trigger ("35791320242832374042475054")
const secretSequence = "35791320242832374042475054";
let typedKeys = "";

const secretSection = document.getElementById("secretSection");
const secretBtn = document.getElementById("secretBtn");
const secretPlateLabel = document.getElementById("secretPlateLabel");
const secretHint = document.getElementById("secretHint");

let isSecretUnlocked = localStorage.getItem("mc_secret_unlocked") === "true";
let isSecretActivated = localStorage.getItem("mc_secret_activated") === "true";

// Helper to register slot 8 scroll details
function unlockSecretChestItem() {
    items[8] = {
        id: "secret",
        name: "Bản Thảo Thứ V (Secret Scroll)",
        rarity: "epic",
        description: "Bản thảo tối mật của Độc Long bang.<br>Chứa thông tin về cổng Nether bí mật.<br><br>Click để mở khóa manh mối ARG tiếp theo!",
        lore: "Người ta nói rằng nó được viết bằng máu...",
        hint: "Click để đọc mật chỉ!",
        imageHtml: `<img src="/textures/items/writable_book.png" alt="Secret Scroll">`,
        image: null,
        actionText: "MANH MỐI ARG CHÍNH THỨC\n\nChúc mừng bạn đã tìm thấy nút bấm bí ẩn! Mật chỉ ghi: 'Hãy truy cập Discord và nhập lệnh !verify 35791320242832374042475054 để nhận vai trò Khai Sáng và phần thưởng độc quyền!'\n\nHãy lưu lại mã số này và chia sẻ nó với những người chơi khác!"
    };

    const slot8 = chestGrid.querySelector(`[data-index="8"]`);
    if (slot8) {
        slot8.classList.add("has-item", "enchanted-glow");
        slot8.innerHTML = items[8].imageHtml;
        
        slot8.addEventListener("mouseenter", () => {
            const item = items[8];
            tooltip.innerHTML = `
                <div class="tooltip-title epic">${item.name}</div>
                <div class="tooltip-description">${item.description}</div>
                <div class="tooltip-lore">${item.lore}</div>
                <div class="tooltip-hint">${item.hint}</div>
            `;
            tooltip.style.display = "flex";
        });

        slot8.addEventListener("mousemove", (e) => {
            tooltip.style.left = (e.clientX + 15) + "px";
            tooltip.style.top = (e.clientY + 15) + "px";
        });

        slot8.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        slot8.addEventListener("click", () => {
            tooltip.style.display = "none";
            playClickSound();
            
            const item = items[8];
            const teaserModal = document.getElementById("teaserModal");
            const teaserTitle = document.getElementById("teaserTitle");
            const teaserImage = document.getElementById("teaserImage");
            const teaserText = document.getElementById("teaserText");

            teaserTitle.innerText = item.name;
            teaserImage.style.display = "none";
            teaserText.innerHTML = item.actionText.replace(/\n/g, '<br>');
            teaserModal.classList.add("active");
        });
    }
}

// Function to trigger the button's appearance
function triggerSecretButton() {
    if (isSecretUnlocked) return;
    isSecretUnlocked = true;
    localStorage.setItem("mc_secret_unlocked", "true");
    
    // Play level up sound & show advancement toast
    playLevelUpSound();
    showAdvancement("Đã Phát Hiện Nút Bí Mật!");
    
    // Add visual classes to slide it up
    secretSection.style.display = "flex";
    setTimeout(() => {
        secretSection.classList.add("active");
    }, 50);

    writeToChatHistory("[Hệ thống] Trục địa chấn phát hiện: Nút bấm bí ẩn đã trồi lên từ lòng đất!", "success");
}

// Global keypress listener
document.addEventListener("keydown", (e) => {
    if (e.key.length === 1) {
        if (/^\d$/.test(e.key)) {
            typedKeys += e.key;
            if (typedKeys.length > secretSequence.length) {
                typedKeys = typedKeys.slice(-secretSequence.length);
            }
            if (typedKeys === secretSequence) {
                // The secret sequence is for hours. Enforce minutes must be unlocked first.
                if (!unlockStates.minutes) {
                    writeToChatHistory("[Hệ thống] Trục địa chấn phát ra tiếng động lạ... Nhưng dường như các khóa trước chưa được giải mã hoàn toàn.", "error");
                    typedKeys = "";
                    return;
                }
                triggerSecretButton();
                if (!unlockStates.hours) {
                    animateSegmentBreak("hours", secretSequence);
                }
            }
        } else {
            // Reset buffer if non-digit typed (prevents messy intermediate states)
            typedKeys = "";
        }
    }
});

// Setup click action on the 3D button
secretBtn.addEventListener("click", () => {
    initAudio();

    // 3D physical press animation
    secretBtn.classList.add("pressed");
    playWoodClickSound();
    
    setTimeout(() => {
        secretBtn.classList.remove("pressed");
    }, 150);

    if (isSecretActivated) {
        return;
    }

    // Activate the secret!
    isSecretActivated = true;
    localStorage.setItem("mc_secret_activated", "true");

    // UI Updates
    secretPlateLabel.innerText = "NÚT BÍ MẬT ĐÃ KÍCH HOẠT";
    secretPlateLabel.classList.add("activated");
    secretHint.innerText = "Kiểm tra Rương Bật Mí!";
    secretHint.style.color = "#55ff55";

    // Play chime & show advancement toast
    setTimeout(() => {
        playLevelUpSound();
        showAdvancement("Thành Tựu: Cổ Thư Mật Tịch!");
    }, 100);

    // Populate chest slot 8
    unlockSecretChestItem();

    writeToChatHistory("[Hệ thống] Kích hoạt thành công! Bản Thảo Thứ V đã được đưa vào Rương Bật Mí.", "success");
});

// Restore State on Load
if (isSecretUnlocked) {
    secretSection.style.display = "flex";
    secretSection.classList.add("active");
}
if (isSecretActivated) {
    secretPlateLabel.innerText = "NÚT BÍ MẬT ĐÃ KÍCH HOẠT";
    secretPlateLabel.classList.add("activated");
    secretHint.innerText = "Kiểm tra Rương Bật Mí!";
    secretHint.style.color = "#55ff55";
    setTimeout(unlockSecretChestItem, 200);
}

// Check URL parameters for ARG codes automatically
function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    let unlockedAny = false;

    Object.keys(codes).forEach(segment => {
        const paramVal = params.get(segment);
        if (paramVal && paramVal === codes[segment] && !unlockStates[segment]) {
            // Enforce sequential solving: seconds -> minutes -> hours
            if (segment === "minutes" && !unlockStates.seconds) {
                return;
            }
            if (segment === "hours" && !unlockStates.minutes) {
                return;
            }
            unlockedAny = true;
            setTimeout(() => {
                animateSegmentBreak(segment, paramVal);
            }, 100);
        }
    });
}

// Sync unlock states with the database
async function syncDatabaseUnlockStates() {
    try {
        const res = await fetch("/api/unlock");
        if (res.ok) {
            const data = await res.json();
            let changed = false;
            
            ["hours", "minutes", "seconds"].forEach(segment => {
                if (data[segment] === true && !unlockStates[segment]) {
                    unlockStates[segment] = true;
                    localStorage.setItem(`mc_${segment}_unlocked`, "true");
                    
                    // Update UI cover status immediately
                    const cover = document.getElementById(`${segment}-cover`);
                    if (cover) {
                        cover.classList.remove("shaking");
                        cover.classList.add("broken");
                    }
                    const segmentElement = document.getElementById(`${segment}-segment`);
                    if (segmentElement) {
                        segmentElement.classList.remove("locked");
                    }
                    
                    changed = true;
                } else if (data[segment] !== true && unlockStates[segment]) {
                    // Sync reset/relock state back to client if database has been reset
                    unlockStates[segment] = false;
                    localStorage.setItem(`mc_${segment}_unlocked`, "false");
                    
                    // Re-lock UI
                    const cover = document.getElementById(`${segment}-cover`);
                    if (cover) {
                        cover.classList.remove("broken");
                    }
                    const segmentElement = document.getElementById(`${segment}-segment`);
                    if (segmentElement) {
                        segmentElement.classList.add("locked");
                    }
                    
                    // If hours segment is relocked, also relock secret section states
                    if (segment === "hours") {
                        isSecretUnlocked = false;
                        isSecretActivated = false;
                        localStorage.setItem("mc_secret_unlocked", "false");
                        localStorage.setItem("mc_secret_activated", "false");
                        
                        const secretSection = document.getElementById("secretSection");
                        if (secretSection) {
                            secretSection.classList.remove("active");
                            secretSection.style.display = "none";
                        }
                        const secretPlateLabel = document.getElementById("secretPlateLabel");
                        if (secretPlateLabel) {
                            secretPlateLabel.innerText = "NÚT BÍ MẬT CHƯA KÍCH HOẠT";
                            secretPlateLabel.classList.remove("activated");
                        }
                        const secretHint = document.getElementById("secretHint");
                        if (secretHint) {
                            secretHint.innerText = "Nhấn nút để kích hoạt mật bản!";
                            secretHint.style.color = "";
                        }
                        const slot8 = chestGrid.querySelector(`[data-index="8"]`);
                        if (slot8) {
                            slot8.classList.remove("has-item", "enchanted-glow");
                            slot8.innerHTML = "";
                            const newSlot8 = slot8.cloneNode(true);
                            slot8.replaceWith(newSlot8);
                        }
                    }
                    
                    changed = true;
                }
            });
            
            if (changed) {
                updateCountdown();
            }
        }
    } catch (err) {
        console.error("Failed to sync unlock states from database:", err);
    }
}

// Real-time HUD Clock updater
function updateHUDClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const clockTimeEl = document.getElementById("hudClockTime");
    const clockDateEl = document.getElementById("hudClockDate");

    if (clockTimeEl) clockTimeEl.innerText = `${hours}:${minutes}:${seconds}`;
    if (clockDateEl) clockDateEl.innerText = `${day}/${month}/${year}`;
}

// Initializations
syncDatabaseUnlockStates();
setTimeout(checkURLParams, 800);
updateCountdown();
setInterval(updateCountdown, 1000);
updateHUDClock();
setInterval(updateHUDClock, 1000);
// Periodically poll for database updates every 10 seconds
setInterval(syncDatabaseUnlockStates, 10000);

// Random Splash text
const splashTextEl = document.getElementById("splashText");
splashTextEl.innerText = splashTexts[Math.floor(Math.random() * splashTexts.length)];

// Anti-cheat warning in Console
console.log(
    "%c⚠️ CẢNH BÁO BẢO MẬT!",
    "color: #ff5555; font-family: sans-serif; font-size: 2.5rem; font-weight: bold; text-shadow: 3px 3px 0px black;"
);
console.log(
    "%cMọi hành vi xâm nhập, bypass hoặc tự động gửi gói tin qua Console/DevTools đều bị chặn bởi hệ thống bảo vệ. Hãy giải mật mã một cách trung thực!",
    "color: #ffff55; font-family: sans-serif; font-size: 1.1rem; font-weight: bold; background-color: #222; padding: 6px; border: 2px solid #555;"
);

// Anti-cheat: Disable right-click context menu
document.addEventListener("contextmenu", (e) => e.preventDefault());

// Anti-cheat: Block F12 and common Inspect shortcuts
document.addEventListener("keydown", (e) => {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
    ) {
        e.preventDefault();
        writeToChatHistory("[Hệ thống] Phát hiện hành động đáng ngờ! Lớp bảo mật đã ngăn cản việc mở bảng điều khiển DevTools.", "error");
    }
});
