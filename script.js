// Utility Functions
const showNotification = (message, type = 'info', duration = 3000) => {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') notification.classList.add('error');
    else if (type === 'success') notification.classList.add('success');
    else if (type === 'ai') notification.classList.add('ai');
    
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), duration);
};

// Page Navigation
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', function() {
        const targetPage = this.getAttribute('data-page');
        
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');
    });
});

// PAGE 1 - CIRCLE CROP
const canvas1 = document.getElementById('mainCanvas1');
const ctx1 = canvas1.getContext('2d', { willReadFrequently: true });
let img1 = new Image(), originalImg1 = null, imgLoaded1 = false;
let sel1 = {x:0, y:0, r:0}, dragging1 = false, resizing1 = false;

function initCanvas1() {
    canvas1.width = Math.min(800, window.innerWidth - 64);
    canvas1.height = Math.min(600, window.innerHeight * 0.6);
    sel1.x = canvas1.width/2;
    sel1.y = canvas1.height/2;
    sel1.r = Math.min(canvas1.width, canvas1.height)/6;
    draw1();
}

function draw1() {
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    if (imgLoaded1) {
        ctx1.drawImage(img1, 0, 0, canvas1.width, canvas1.height);
        ctx1.fillStyle = 'rgba(0,0,0,0.5)';
        ctx1.beginPath();
        ctx1.rect(0, 0, canvas1.width, canvas1.height);
        ctx1.arc(sel1.x, sel1.y, sel1.r, 0, Math.PI*2, true);
        ctx1.fill('evenodd');
    } else {
        ctx1.fillStyle = '#111';
        ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
        ctx1.fillStyle = '#666';
        ctx1.font = '16px sans-serif';
        ctx1.textAlign = 'center';
        ctx1.fillText('เลือกรูปภาพเพื่อเริ่มต้น', canvas1.width/2, canvas1.height/2);
    }
    ctx1.strokeStyle = 'white';
    ctx1.lineWidth = 3;
    ctx1.beginPath();
    ctx1.arc(sel1.x, sel1.y, sel1.r, 0, Math.PI*2);
    ctx1.stroke();
    updatePreview1();
}

function updatePreview1() {
    const preview = document.getElementById('preview1');
    if (!imgLoaded1) {
        preview.innerHTML = '<span>ยังไม่มีรูป</span>';
        return;
    }
    
    const s = 140;
    const p = document.createElement('canvas');
    p.width = s;
    p.height = s;
    const c = p.getContext('2d', {willReadFrequently: true});
    
    c.save();
    c.beginPath();
    c.arc(s/2, s/2, s/2, 0, Math.PI*2);
    c.clip();
    
    const scaleX = originalImg1.width/canvas1.width;
    const scaleY = originalImg1.height/canvas1.height;
    const sx = (sel1.x - sel1.r) * scaleX;
    const sy = (sel1.y - sel1.r) * scaleY;
    const ss = sel1.r * 2 * scaleX;
    
    c.drawImage(originalImg1, sx, sy, ss, ss, 0, 0, s, s);
    c.restore();
    
    preview.innerHTML = '';
    preview.appendChild(p);
}

function toCanvasCoords1(x, y) {
    const rect = canvas1.getBoundingClientRect();
    return {
        x: (x - rect.left) * (canvas1.width/rect.width),
        y: (y - rect.top) * (canvas1.height/rect.height)
    };
}

canvas1.addEventListener('mousedown', e => {
    if (!imgLoaded1) return;
    
    const p = toCanvasCoords1(e.clientX, e.clientY);
    const d = Math.hypot(p.x - sel1.x, p.y - sel1.y);
    
    if (Math.abs(d - sel1.r) <= 12) resizing1 = true;
    else if (d < sel1.r) dragging1 = true;
    else {
        sel1.x = p.x;
        sel1.y = p.y;
        sel1.r = 0;
        resizing1 = true;
    }
    draw1();
});

window.addEventListener('mousemove', e => {
    if (!dragging1 && !resizing1) return;
    
    const p = toCanvasCoords1(e.clientX, e.clientY);
    if (dragging1) {
        sel1.x = p.x;
        sel1.y = p.y;
    } else if (resizing1) {
        sel1.r = Math.max(10, Math.hypot(p.x - sel1.x, p.y - sel1.y));
    }
    draw1();
});

window.addEventListener('mouseup', () => {
    dragging1 = false;
    resizing1 = false;
});

// File handling for page 1
document.getElementById('file1').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    if (img1.src && img1.src.startsWith('blob:')) {
        URL.revokeObjectURL(img1.src);
    }
    
    const url = URL.createObjectURL(file);
    img1 = new Image();
    img1.onload = () => {
        imgLoaded1 = true;
        originalImg1 = img1;
        const ratio = Math.min(1200/img1.width, 800/img1.height);
        canvas1.width = img1.width * ratio;
        canvas1.height = img1.height * ratio;
        sel1.x = canvas1.width/2;
        sel1.y = canvas1.height/2;
        sel1.r = Math.min(canvas1.width, canvas1.height)/6;
        draw1();
        URL.revokeObjectURL(url);
    };
    img1.src = url;
});

// Buttons for page 1
document.getElementById('reset1').addEventListener('click', () => {
    if (!imgLoaded1) {
        showNotification("กรุณาเลือกรูปภาพก่อน", "error");
        return;
    }
    sel1.x = canvas1.width/2;
    sel1.y = canvas1.height/2;
    sel1.r = Math.min(canvas1.width, canvas1.height)/6;
    draw1();
});

document.getElementById('export1').addEventListener('click', () => {
    if (!imgLoaded1) {
        showNotification("กรุณาเลือกรูปภาพก่อน", "error");
        return;
    }
    
    const scaleX = originalImg1.width/canvas1.width;
    const scaleY = originalImg1.height/canvas1.height;
    const originalX = sel1.x * scaleX;
    const originalY = sel1.y * scaleY;
    const originalR = sel1.r * scaleX;
    const d = Math.round(originalR * 2);
    
    const out = document.createElement('canvas');
    out.width = d;
    out.height = d;
    const o = out.getContext('2d', {willReadFrequently: true});
    
    o.beginPath();
    o.arc(d/2, d/2, d/2, 0, Math.PI*2);
    o.clip();
    o.drawImage(originalImg1, originalX - originalR, originalY - originalR, d, d, 0, 0, d, d);
    
    out.toBlob(b => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'crop-circle.png';
        a.click();
        URL.revokeObjectURL(a.href);
        showNotification("บันทึกรูปภาพเรียบร้อยแล้ว", "success");
        speak("บันทึกรูปให้แล้วครับเจ้านาย");
    }, 'image/png', 1.0);
});

document.getElementById('clear1').addEventListener('click', () => {
    imgLoaded1 = false;
    originalImg1 = null;
    document.getElementById('file1').value = '';
    draw1();
    speak("ลบแล้วครับเจ้านาย");
});

// PAGE 2 - ADVANCED EDITING
const canvas2 = document.getElementById('mainCanvas2');
const ctx2 = canvas2.getContext('2d');
let img2 = new Image();
let scale = 1, offsetX = 0, offsetY = 0;
let circles = [], arrows = [], texts = [];
let undoStack = [], redoStack = [];

function drawCanvas2() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.save();
    ctx2.translate(offsetX, offsetY);
    ctx2.scale(scale, scale);
    
    if (img2.src) {
        ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
    }
    
    // Draw circles
    circles.forEach(c => {
        ctx2.strokeStyle = `rgba(59, 130, 246, ${c.opacity || 0.7})`;
        ctx2.lineWidth = 3;
        ctx2.beginPath();
        ctx2.arc(c.x, c.y, c.radius, 0, Math.PI*2);
        ctx2.stroke();
    });
    
    // Draw arrows
    arrows.forEach(a => {
        ctx2.strokeStyle = `rgba(59, 130, 246, ${a.opacity || 0.7})`;
        ctx2.lineWidth = 3;
        ctx2.beginPath();
        ctx2.moveTo(a.x1, a.y1);
        ctx2.lineTo(a.x2, a.y2);
        ctx2.stroke();
        
        const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
        ctx2.beginPath();
        ctx2.moveTo(a.x2, a.y2);
        ctx2.lineTo(a.x2 - 10 * Math.cos(angle - Math.PI/6), a.y2 - 10 * Math.sin(angle - Math.PI/6));
        ctx2.lineTo(a.x2 - 10 * Math.cos(angle + Math.PI/6), a.y2 - 10 * Math.sin(angle + Math.PI/6));
        ctx2.closePath();
        ctx2.fillStyle = `rgba(59, 130, 246, ${a.opacity || 0.7})`;
        ctx2.fill();
    });
    
    // Draw texts
    texts.forEach(t => {
        ctx2.fillStyle = `rgba(59, 130, 246, ${t.opacity || 0.7})`;
        ctx2.font = "20px sans-serif";
        ctx2.fillText(t.text, t.x, t.y);
    });
    
    ctx2.restore();
}

// Mouse events for page 2
let isDraggingCanvas = false, dragStart = {x:0, y:0};
let isDrawingCircle = false, circleStart = {x:0, y:0};
let isDrawingArrow = false, arrowStart = {x:0, y:0};

function getMousePos(e) {
    const rect = canvas2.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left - offsetX) / scale,
        y: (e.clientY - rect.top - offsetY) / scale
    };
}

canvas2.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    
    if (e.shiftKey) {
        isDrawingCircle = true;
        circleStart = pos;
    } else if (e.altKey) {
        isDrawingArrow = true;
        arrowStart = pos;
    } else {
        isDraggingCanvas = true;
        dragStart = {x: e.clientX - offsetX, y: e.clientY - offsetY};
        canvas2.style.cursor = 'grabbing';
    }
});

canvas2.addEventListener('mousemove', e => {
    const pos = getMousePos(e);
    
    if (isDraggingCanvas) {
        offsetX = e.clientX - dragStart.x;
        offsetY = e.clientY - dragStart.y;
        drawCanvas2();
    } else if (isDrawingCircle || isDrawingArrow) {
        // Visual feedback for drawing
        drawCanvas2();
        ctx2.save();
        ctx2.translate(offsetX, offsetY);
        ctx2.scale(scale, scale);
        
        ctx2.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        ctx2.lineWidth = 3;
        ctx2.beginPath();
        
        if (isDrawingCircle) {
            const radius = Math.hypot(pos.x - circleStart.x, pos.y - circleStart.y);
            ctx2.arc(circleStart.x, circleStart.y, radius, 0, Math.PI*2);
        } else {
            ctx2.moveTo(arrowStart.x, arrowStart.y);
            ctx2.lineTo(pos.x, pos.y);
        }
        
        ctx2.stroke();
        ctx2.restore();
    }
});

canvas2.addEventListener('mouseup', e => {
    const pos = getMousePos(e);
    
    if (isDrawingCircle) {
        const radius = Math.hypot(pos.x - circleStart.x, pos.y - circleStart.y);
        if (radius > 5) {
            circles.push({x: circleStart.x, y: circleStart.y, radius, opacity: 0.7});
            undoStack.push(JSON.stringify({circles, arrows, texts}));
        }
        isDrawingCircle = false;
    } else if (isDrawingArrow) {
        const distance = Math.hypot(pos.x - arrowStart.x, pos.y - arrowStart.y);
        if (distance > 10) {
            arrows.push({x1: arrowStart.x, y1: arrowStart.y, x2: pos.x, y2: pos.y, opacity: 0.7});
            undoStack.push(JSON.stringify({circles, arrows, texts}));
        }
        isDrawingArrow = false;
    }
    
    isDraggingCanvas = false;
    canvas2.style.cursor = 'default';
    drawCanvas2();
});

// File handling for page 2
document.getElementById('file2').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    if (img2.src && img2.src.startsWith('blob:')) {
        URL.revokeObjectURL(img2.src);
    }
    
    const reader = new FileReader();
    reader.onload = ev => {
        img2.src = ev.target.result;
        img2.onload = () => {
            scale = 1;
            offsetX = 0;
            offsetY = 0;
            circles = [];
            arrows = [];
            texts = [];
            undoStack = [];
            redoStack = [];
            drawCanvas2();
        };
    };
    reader.readAsDataURL(file);
});

// Buttons for page 2
document.getElementById('zoomIn').addEventListener('click', () => {
    if (scale < 5) {
        scale *= 1.2;
        drawCanvas2();
    }
});

document.getElementById('zoomOut').addEventListener('click', () => {
    if (scale > 0.2) {
        scale /= 1.2;
        drawCanvas2();
    }
});

document.getElementById('reset2').addEventListener('click', () => {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    drawCanvas2();
});

document.getElementById('savePNG').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'advanced-edit.png';
    link.href = canvas2.toDataURL('image/png');
    link.click();
    showNotification("บันทึกรูปภาพเรียบร้อยแล้ว", "success");
    speak("บันทึกรูปให้แล้วครับเจ้านาย");
});

document.getElementById('undo').addEventListener('click', () => {
    if (undoStack.length > 0) {
        redoStack.push(JSON.stringify({circles, arrows, texts}));
        const data = JSON.parse(undoStack.pop());
        circles = data.circles;
        arrows = data.arrows;
        texts = data.texts;
        drawCanvas2();
    }
});

document.getElementById('clearAll').addEventListener('click', () => {
    if (confirm("คุณแน่ใจว่าต้องการล้างทุกอย่าง?")) {
        undoStack.push(JSON.stringify({circles, arrows, texts}));
        circles = [];
        arrows = [];
        texts = [];
        drawCanvas2();
        speak("ล้างทั้งหมดแล้วครับเจ้านาย");
        showNotification("ล้างข้อมูลทั้งหมดเรียบร้อย", "success");
    }
});

// Text input for page 2
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
        texts.push({text: 'ข้อความใหม่', x: 100, y: 100, opacity: 0.7});
        undoStack.push(JSON.stringify({circles, arrows, texts}));
        drawCanvas2();
    }
});

// PAGE 3 - AI GLARE REMOVER
const canvas3 = document.getElementById('canvas3');
const ctx3 = canvas3.getContext('2d', { willReadFrequently: true });
let img3 = new Image(), imgLoaded3 = false;

// Update slider values
function updateSliderValues() {
    document.getElementById('highlightValue').textContent = document.getElementById('highlight').value + '%';
    document.getElementById('glareValue').textContent = document.getElementById('glare').value + '%';
    document.getElementById('sharpValue').textContent = document.getElementById('sharp').value + '%';
    document.getElementById('shadowValue').textContent = document.getElementById('shadow').value + '%';
    document.getElementById('diffuseValue').textContent = document.getElementById('diffuse').value + '%';
}

// Apply filters
function applyFilters() {
    if (!imgLoaded3) return;
    
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
    
    const highlight = document.getElementById('highlight').value;
    const glare = document.getElementById('glare').value;
    const sharp = document.getElementById('sharp').value;
    
    ctx3.filter = `
        brightness(${100 - highlight/2}%)
        contrast(${100 + (sharp - 100)}%)
        blur(${glare/40}px)
    `;

    ctx3.drawImage(img3, 0, 0);

    // Shadow adjustment
    const shadow = document.getElementById('shadow').value;
    if (shadow > 50) {
        ctx3.globalAlpha = (shadow - 50)/130;
        ctx3.fillStyle = "rgba(255,255,255,1)";
        ctx3.fillRect(0, 0, canvas3.width, canvas3.height);
        ctx3.globalAlpha = 1;
    }

    // Diffuse effect
    const diffuse = document.getElementById('diffuse').value;
    if (diffuse > 5) {
        ctx3.globalAlpha = diffuse/150;
        ctx3.filter = "blur(12px)";
        ctx3.drawImage(img3, 0, 0);
        ctx3.globalAlpha = 1;
        ctx3.filter = "none";
    }
}

// File handling for page 3
document.getElementById('file3').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    if (img3.src && img3.src.startsWith('blob:')) {
        URL.revokeObjectURL(img3.src);
    }
    
    const reader = new FileReader();
    reader.onload = ev => {
        img3.src = ev.target.result;
        img3.onload = () => {
            imgLoaded3 = true;
            
            // Limit canvas size
            const maxWidth = Math.min(1000, window.innerWidth - 64);
            const maxHeight = Math.min(800, window.innerHeight * 0.6);
            
            let width = img3.width;
            let height = img3.height;
            
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }
            
            canvas3.width = width;
            canvas3.height = height;
            
            applyFilters();
            updateSliderValues();
            speak("โหลดรูปภาพสำหรับลบแสงจ้าเรียบร้อยแล้ว");
        };
    };
    reader.readAsDataURL(file);
});

// Slider events
document.querySelectorAll('#highlight, #glare, #sharp, #shadow, #diffuse').forEach(slider => {
    slider.addEventListener('input', () => {
        updateSliderValues();
        applyFilters();
    });
});

// Click on canvas to remove glare at specific point
canvas3.addEventListener('click', e => {
    if (!imgLoaded3) {
        showNotification("กรุณาเลือกรูปภาพก่อน", "error");
        return;
    }
    
    const rect = canvas3.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas3.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas3.height / rect.height);
    
    const size = canvas3.width * 0.08;
    const imgData = ctx3.getImageData(x - size/2, y - size/2, size, size);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
        let brightness = d[i] + d[i+1] + d[i+2];
        if (brightness > 600) {
            d[i] *= 0.6;
            d[i+1] *= 0.6;
            d[i+2] *= 0.6;
        }
    }

    ctx3.putImageData(imgData, x - size/2, y - size/2);
    speak("ลบแสงเฉพาะจุดเรียบร้อยแล้ว");
    showNotification("ลบแสงเฉพาะจุดเรียบร้อยแล้ว", "ai");
});

// Auto AI button
document.getElementById('autoAI').addEventListener('click', () => {
    if (!imgLoaded3) {
        showNotification("กรุณาเลือกรูปภาพก่อน", "error");
        return;
    }
    
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
    ctx3.drawImage(img3, 0, 0, canvas3.width, canvas3.height);
    
    let data = ctx3.getImageData(0, 0, canvas3.width, canvas3.height);
    let d = data.data;

    for (let i = 0; i < d.length; i += 4) {
        let brightness = d[i] + d[i+1] + d[i+2];
        if (brightness > 600) {
            d[i] *= 0.55;
            d[i+1] *= 0.55;
            d[i+2] *= 0.55;
        } else if (brightness > 500) {
            d[i] *= 0.75;
            d[i+1] *= 0.75;
            d[i+2] *= 0.75;
        }
    }

    ctx3.putImageData(data, 0, 0);
    speak("ลบแสงอัตโนมัติเรียบร้อยแล้วครับเจ้านาย");
    showNotification("✨ ลบแสงอัตโนมัติเรียบร้อย!", "ai");
});

// Reset button for page 3
document.getElementById('reset3').addEventListener('click', () => {
    if (!imgLoaded3) {
        showNotification("กรุณาเลือกรูปภาพก่อน", "error");
        return;
    }
    
    document.getElementById('highlight').value = 40;
    document.getElementById('glare').value = 30;
    document.getElementById('sharp').value = 100;
    document.getElementById('shadow').value = 60;
    document.getElementById('diffuse').value = 20;
    
    updateSliderValues();
    applyFilters();
    speak("รีเซ็ตการตั้งค่าเรียบร้อยแล้ว");
    showNotification("รีเซ็ตการตั้งค่าเรียบร้อยแล้ว", "success");
});

// Download button for page 3
document.getElementById('download3').addEventListener('click', () => {
    if (!imgLoaded3) {
        showNotification("กรุณาเลือกรูปภาพก่อน", "error");
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'glare_removed.png';
    link.href = canvas3.toDataURL('image/png');
    link.click();
    showNotification("ดาวน์โหลดรูปภาพเรียบร้อยแล้ว", "success");
    speak("ดาวน์โหลดรูปภาพเรียบร้อยแล้วครับเจ้านาย");
});

// MUSIC PLAYER SYSTEM
const audio = new Audio();
let isPlaying = false;
let currentMusicIndex = -1;
let playlistSongs = [];
let isShuffle = false;
let isRepeat = false;

// Music player functions
function updateMusicControls() {
    const hasSongs = playlistSongs.length > 0;
    const canPlay = hasSongs && !isPlaying;
    const canPause = hasSongs && isPlaying;
    
    document.getElementById('playBtn').disabled = !canPlay;
    document.getElementById('pauseBtn').disabled = !canPause;
    document.getElementById('stopBtn').disabled = !hasSongs;
    document.getElementById('prevBtn').disabled = playlistSongs.length <= 1;
    document.getElementById('nextBtn').disabled = playlistSongs.length <= 1;
}

function playSong(index) {
    if (index < 0 || index >= playlistSongs.length) return;
    
    if (isPlaying) audio.pause();
    
    currentMusicIndex = index;
    const song = playlistSongs[index];
    
    audio.src = song.url;
    audio.load();
    
    audio.onloadedmetadata = () => {
        document.getElementById('duration').textContent = formatTime(audio.duration);
        document.getElementById('musicInfo').textContent = `กำลังเล่น: ${song.name}`;
        
        audio.play();
        isPlaying = true;
        updateMusicControls();
        speak(`เล่นเพลง ${song.name} แล้วครับเจ้านาย`);
    };
    
    audio.ontimeupdate = () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            document.getElementById('progressBar').style.width = `${progressPercent}%`;
            document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
        }
    };
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Music player event listeners
document.getElementById('musicFile').addEventListener('change', function(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('audio/')) return;
        
        playlistSongs.push({
            file: file,
            name: file.name,
            url: URL.createObjectURL(file)
        });
    });
    
    if (playlistSongs.length > 0 && currentMusicIndex === -1) {
        playSong(0);
    }
    updateMusicControls();
    this.value = '';
});

document.getElementById('playBtn').addEventListener('click', () => {
    if (playlistSongs.length > 0) {
        if (currentMusicIndex === -1) {
            playSong(0);
        } else {
            audio.play();
            isPlaying = true;
            updateMusicControls();
        }
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    audio.pause();
    isPlaying = false;
    updateMusicControls();
    speak("หยุดเพลงชั่วคราวแล้วครับเจ้านาย");
});

document.getElementById('stopBtn').addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updateMusicControls();
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('currentTime').textContent = '0:00';
    speak("หยุดเพลงแล้วครับเจ้านาย");
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// MUSIC QUESTION MODAL
const musicQuestionModal = document.getElementById('musicQuestionModal');

function showMusicQuestion() {
    if (typeof localStorage !== 'undefined') {
        const hasAnswered = localStorage.getItem('musicQuestionAnswered');
        if (!hasAnswered) {
            musicQuestionModal.classList.add('show');
            setTimeout(() => speak("จะฟังเพลงขณะทำงานเพลินๆไหมครับเจ้านาย"), 500);
        } else {
            const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
            if (musicEnabled) {
                setTimeout(() => document.getElementById('musicPlayer').classList.add('show'), 500);
            }
        }
    } else {
        musicQuestionModal.classList.add('show');
    }
}

document.getElementById('yesMusicBtn').addEventListener('click', () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('musicQuestionAnswered', 'true');
        localStorage.setItem('musicEnabled', 'true');
    }
    
    speak("จัดเพลงให้แล้วครับเจ้านาย");
    musicQuestionModal.classList.remove('show');
    document.getElementById('musicPlayer').classList.add('show');
    showNotification("เปิดเครื่องเล่นเพลงแล้ว", "success");
});

document.getElementById('noMusicBtn').addEventListener('click', () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('musicQuestionAnswered', 'true');
        localStorage.setItem('musicEnabled', 'false');
    }
    
    speak("เข้าใจแล้วครับเจ้านาย ขอให้โฟกัสกับงานนะครับ");
    musicQuestionModal.classList.remove('show');
    showNotification("ปิดเครื่องเล่นเพลงแล้ว", "info");
});

// MOVE MUSIC PLAYER FUNCTION
function moveMusicPlayerToRight() {
    const musicPlayer = document.getElementById('musicPlayer');
    const activePage = document.querySelector('.page.active');
    
    if (activePage) {
        const canvasWrap = activePage.querySelector('.canvas-wrap');
        if (canvasWrap) {
            const rect = canvasWrap.getBoundingClientRect();
            const newLeft = rect.right - musicPlayer.offsetWidth - 20;
            const newTop = rect.top;
            
            musicPlayer.style.left = `${Math.max(20, newLeft)}px`;
            musicPlayer.style.top = `${Math.max(20, newTop)}px`;
            musicPlayer.style.right = 'auto';
            musicPlayer.style.bottom = 'auto';
            
            speak("ผมจัดให้เป็นระบบแล้วครับเจ้านาย");
            showNotification("ย้ายเครื่องเล่นเพลงไปด้านขวาแล้ว", "success");
        }
    }
}

// VOICE COMMAND SYSTEM
let speechRecognition = null;

function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        speechRecognition = new SpeechRecognition();
        speechRecognition.lang = 'th-TH';
        speechRecognition.continuous = true;
        speechRecognition.interimResults = false;

        speechRecognition.onresult = (e) => {
            const command = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("คำสั่งเสียง:", command);

            updateVoiceStatus('active');

            if (command.includes('ย้าย')) {
                moveMusicPlayerToRight();
            } else if (command.includes('บันทึก') || command.includes('save')) {
                const activePage = document.querySelector('.page.active').id;
                if (activePage === 'page1') document.getElementById('export1').click();
                else if (activePage === 'page2') document.getElementById('savePNG').click();
                else if (activePage === 'page3') document.getElementById('download3').click();
            } else if (command.includes('ลบแสง')) {
                if (document.getElementById('page3').classList.contains('active')) {
                    document.getElementById('autoAI').click();
                }
            } else if (command.includes('ออโต้')) {
                if (document.getElementById('page3').classList.contains('active')) {
                    document.getElementById('autoAI').click();
                }
            } else if (command.includes('ขอรูป')) {
                const activePage = document.querySelector('.page.active').id;
                if (activePage === 'page1') document.getElementById('file1').click();
                else if (activePage === 'page2') document.getElementById('file2').click();
                else if (activePage === 'page3') document.getElementById('file3').click();
                speak("กรุณาเลือกรูปภาพที่ต้องการ");
            } else if (command.includes('เปลี่ยนเพลง')) {
                document.getElementById('musicFile').click();
                speak("กรุณาเลือกไฟล์เพลงที่ต้องการ");
            } else if (command.includes('เบาเสียง')) {
                audio.volume = Math.max(audio.volume - 0.2, 0);
                document.getElementById('volumeSlider').value = audio.volume;
                speak(`เบาเสียงเป็น ${Math.round(audio.volume * 100)} เปอร์เซ็นต์`);
            } else if (command.includes('เพิ่มเสียง')) {
                audio.volume = Math.min(audio.volume + 0.2, 1);
                document.getElementById('volumeSlider').value = audio.volume;
                speak(`เพิ่มเสียงเป็น ${Math.round(audio.volume * 100)} เปอร์เซ็นต์`);
            }
        };

        speechRecognition.onend = () => {
            updateVoiceStatus('inactive');
            setTimeout(() => {
                if (speechRecognition) speechRecognition.start();
            }, 500);
        };

        try {
            speechRecognition.start();
            updateVoiceStatus('active');
        } catch (e) {
            console.error("ไม่สามารถเริ่มต้นระบบฟังเสียงได้:", e);
            updateVoiceStatus('inactive', true);
        }
    } else {
        console.warn("เบราว์เซอร์นี้ไม่รองรับ Speech Recognition");
        updateVoiceStatus('inactive', true);
    }
}

function updateVoiceStatus(status, isError = false) {
    document.querySelectorAll('.voice-status').forEach(el => {
        el.className = `voice-status ${el.classList.contains('ai') ? 'ai' : ''} ${isError ? 'error' : status}`;
        if (status === 'active') el.classList.add('pulse');
        else el.classList.remove('pulse');
    });
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "th-TH";
        speechSynthesis.speak(utterance);
    }
}

// INITIALIZE EVERYTHING
window.addEventListener('load', () => {
    initCanvas1();
    drawCanvas2();
    updateSliderValues();
    
    // Initialize music player volume
    audio.volume = document.getElementById('volumeSlider').value;
    
    // Show music question modal
    setTimeout(showMusicQuestion, 1000);
    
    // Initialize speech recognition
    try {
        initializeSpeechRecognition();
    } catch (error) {
        console.error("Speech recognition initialization error:", error);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (speechRecognition) {
        try {
            speechRecognition.stop();
        } catch (e) {}
    }
    
    // Revoke object URLs
    [img1, img2, img3].forEach(img => {
        if (img.src && img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
        }
    });
    
    playlistSongs.forEach(song => {
        if (song.url && song.url.startsWith('blob:')) {
            URL.revokeObjectURL(song.url);
        }
    });
});

// Resize handler
window.addEventListener('resize', () => {
    initCanvas1();
});
