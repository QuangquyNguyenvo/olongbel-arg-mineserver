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
const targetDate = new Date("2026-07-10T21:00:00+07:00").getTime();
const startDate = new Date("2026-07-01T21:00:00+07:00").getTime();
const totalDuration = targetDate - startDate;

// ARG Secret Codes
const codes = {
    days: "MINECOW_START_2026",
    hours: "NETHER_GATEWAY_88",
    minutes: "REDSTONE_LOGIC_99",
    seconds: "HEROBRINE_IS_REAL"
};

// Unlock States (loaded from localStorage)
let unlockStates = {
    days: localStorage.getItem("mc_days_unlocked") === "true",
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
        daysVal.innerText = String(days).padStart(2, '0');
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

    if (diff <= 0 && checkAllUnlocked()) {
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
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
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
function showAdvancement(descText) {
    const toast = document.getElementById("advancementToast");
    const desc = document.getElementById("toastDesc");
    
    desc.innerText = descText;
    playLevelUpSound();
    
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
function animateSegmentBreak(segment) {
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
        playSound('orb', { volume: 0.4, rateJitter: 0.15 });
        showAdvancement(`Đã Giải Mã Thành Công: ${segment.toUpperCase()}!`);
        writeToChatHistory(`[Server] Phân khúc '${segment.toUpperCase()}' đã được phá vỡ thành công!`, "success");

        unlockStates[segment] = true;
        localStorage.setItem(`mc_${segment}_unlocked`, "true");
        updateCountdown();
    }, 500);
}

// Parse secret command codes
function handleCommand(cmdStr) {
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

        case "/unlock":
            if (parts.length < 3) {
                writeToChatHistory("Cú pháp: /unlock <days|hours|minutes|seconds> <mã_arg>", "error");
                return;
            }
            const segment = parts[1].toLowerCase();
            const inputCode = parts[2];

            if (!codes[segment]) {
                writeToChatHistory(`Mục '${parts[1]}' không tồn tại! Chọn: days, hours, minutes, seconds.`, "error");
                return;
            }

            if (unlockStates[segment]) {
                writeToChatHistory(`Mục '${segment}' đã được giải mã trước đó rồi!`, "info");
                return;
            }

            if (inputCode === codes[segment]) {
                animateSegmentBreak(segment);
            } else {
                writeToChatHistory("[Server] Sai mã bảo mật! Trực giác của bạn chưa đủ nhạy bén.", "error");
            }
            break;

        default:
            writeToChatHistory(`Lệnh không hợp lệ: '${cmd}'. Gõ /help để xem hướng dẫn.`, "error");
            break;
    }
}

// Herobrine Scare Event
let isGlitched = false;
function triggerHerobrineScare() {
    if (isGlitched) return;
    isGlitched = true;

    playScarySound();
    
    document.body.classList.add("glitch-scare");
    const eyes = document.getElementById("herobrineEyes");
    eyes.classList.add("visible");
    
    const splash = document.getElementById("splashText");
    const origSplash = splash.innerText;
    splash.innerText = "H E R O B R I N E   I S   W A T C H I N G";
    splash.style.color = "#ff5555";
    splash.style.animation = "none";
    splash.style.fontSize = "1.5rem"; // Adjusted for VT323 size scaling

    writeToChatHistory("§4[Hệ thống] Herobrine đã xâm nhập vào trang web của bạn...", "error");

    setTimeout(() => {
        document.body.classList.remove("glitch-scare");
        eyes.classList.remove("visible");
        splash.innerText = origSplash;
        splash.style.color = "#ffff55";
        splash.style.animation = "splashPulse 0.5s infinite alternate ease-in-out";
        splash.style.fontSize = "1.45rem";
        isGlitched = false;
        writeToChatHistory("[Server] Herobrine đã rời đi. Hệ thống đã được khôi phục.", "system");
    }, 4500);
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
        name: "Kiếm Đồ Long (Dungeon Sword)",
        rarity: "epic",
        description: "Sức mạnh tấn công: +9999\nĐộ bền: Vô hạn\n\nClick để xem lén hệ thống Dungeon đặc biệt của server!",
        lore: "Chỉ dành cho những chiến binh dũng cảm nhất...",
        hint: "Click để mở teaser phụ bản!",
        imageHtml: `<img src="/textures/items/diamond_sword.png" alt="Sword">`,
        image: "/mc_dungeon.jpg",
        actionText: "Hệ thống Dungeon ngục tối săn Boss đa dạng với vật phẩm rớt ngẫu nhiên theo chỉ số phẩm chất, hứa hẹn mang lại trải nghiệm phiêu lưu cày cuốc RPG cực kỳ lôi cuốn!"
    },
    12: {
        id: "map",
        name: "Bản Đồ Cổ (Spawn Map)",
        rarity: "rare",
        description: "Vật phẩm định vị tuyệt mật.\nBản đồ vẽ chi tiết khu vực cổng thành của tân thủ.\n\nClick để mở bản đồ chụp lén thế giới sinh tồn!",
        lore: "Nơi bắt đầu của mọi chuyến phiêu lưu vĩ đại.",
        hint: "Click để mở ảnh thế giới Spawn!",
        imageHtml: `<img src="/textures/items/filled_map.png" alt="Map">`,
        image: "/mc_lobby.jpg",
        actionText: "Bản đồ khu vực hồi sinh (Spawn area) được thiết kế theo phong cách trung cổ châu Âu kỳ bí kết hợp với các cổng dịch chuyển không gian độc đáo!"
    },
    14: {
        id: "book",
        name: "Mật Bản Tính Năng (Ancient Scroll)",
        rarity: "epic",
        description: "Khám phá các tính năng đặc sắc:\n✦ Hệ thống Class: Chiến sĩ, Sát thủ, Pháp sư...\n✦ Kỹ năng Custom độc quyền\n✦ Kinh tế cân bằng: Trade tự do, Chợ đen\n✦ Phụ bản săn Boss kiếm đồ hiếm\n✦ Sự kiện chiếm thành hàng tuần",
        lore: "Nhấn vào để đọc nhật ký máy chủ.",
        hint: "Click để xem danh sách tính năng!",
        imageHtml: `<img src="/textures/items/enchanted_book.png" alt="Book">`,
        actionText: "HỆ THỐNG MÁY CHỦ BẠN KHÔNG THỂ BỎ LỠ\n\n1. Lớp nhân vật đa dạng có cây kỹ năng nâng cấp riêng biệt.\n2. Hệ thống kinh tế cân bằng, người chơi cày chay hoàn toàn có thể mua bán giao thương tự do.\n3. Dungeon phân loại từ F đến S với cơ chế né tránh Boss custom phức tạp.\n4. Guild War chiếm lãnh thổ định kỳ thứ Bảy hàng tuần để nhận Buff độc quyền."
    },
    16: {
        id: "cookie",
        name: "Bánh Quy Lập Trình (Dev Cookie)",
        rarity: "common",
        description: "Thơm ngon và ngọt ngào.\nĂn vào tăng 100% độ tỉnh táo để cày cuốc!\n\nClick để xem thông điệp từ Admin!",
        lore: "Chúc người chơi có những giờ phút vui vẻ!",
        hint: "Click để nhận thông điệp Admin!",
        imageHtml: `<img src="/textures/items/cookie.png" alt="Cookie">`,
        actionText: "LỜI NHẮN TỪ ADMIN\n\nChào bạn! Dự án máy chủ Minecraft này đã được đội ngũ chúng tôi ấp ủ hơn nửa năm nay. Từng chi tiết nhỏ về cân bằng trang bị, lối chơi dungeon và nhiệm vụ RPG cốt truyện đều được tối ưu tốt nhất.\n\nARG giải mật mã này là một món quà nhỏ chúng tôi gửi tới Discord server để tạo sự gắn kết. Bạn hãy chia sẻ mật mã này để cùng nhau giải khóa thời gian nhé! Hẹn gặp lại bạn tại Server vào 10/7/2026!"
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
                triggerSecretButton();
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
            unlockedAny = true;
            setTimeout(() => {
                animateSegmentBreak(segment);
            }, 100);
        }
    });
}

// Initializations
setTimeout(checkURLParams, 800);
updateCountdown();
setInterval(updateCountdown, 1000);

// Random Splash text
const splashTextEl = document.getElementById("splashText");
splashTextEl.innerText = splashTexts[Math.floor(Math.random() * splashTexts.length)];
