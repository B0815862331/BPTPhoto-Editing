// ระบบสำหรับหน้าที่ 2 - แก้ไขรูปภาพขั้นสูง
const canvas2 = document.getElementById('mainCanvas2'), 
      ctx2 = canvas2.getContext('2d');
const fileInput2 = document.getElementById('file2');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetBtn2 = document.getElementById('reset2');
const savePNGBtn = document.getElementById('savePNG');
const undoBtn = document.getElementById('undo');
const clearAllBtn = document.getElementById('clearAll');

let img2 = new Image();
let scale = 1, offsetX = 0, offsetY = 0;
let circles = [], arrows = [], texts = [];
let isDraggingCanvas = false, dragStart = { x: 0, y: 0 };

let isDrawingCircle = false, circleStart = { x: 0, y: 0 };
let isDraggingCircle = false, selectedCircle = null, circleOffset = { x: 0, y: 0 };

let isDrawingArrow = false, arrowStart = { x: 0, y: 0 };
let isDraggingArrow = false, selectedArrow = null, arrowOffset = { x1: 0, y1: 0, x2: 0, y2: 0 };

let isDraggingText = false, selectedText = null, textOffset = { x: 0, y: 0 };
let undoStack = [], redoStack = [];
let tempCanvas = document.createElement('canvas'), 
    tempCtx = tempCanvas.getContext('2d');

// ตั้งค่าขนาด canvas ชั่วคราว
tempCanvas.width = canvas2.width;
tempCanvas.height = canvas2.height;

let animationFrameId2 = null;

// Load Image for page 2
fileInput2.addEventListener('change', e => {
    const files = e.target.files;
    if (files[0]) {
        // ตรวจสอบประเภทไฟล์
        if (!files[0].type.startsWith('image/')) {
            showNotification("กรุณาเลือกไฟล์รูปภาพเท่านั้น", "error");
            fileInput2.value = '';
            return;
        }

        // ตรวจสอบขนาดไฟล์ (จำกัดที่ 10MB)
        if (files[0].size > 10 * 1024 * 1024) {
            showNotification("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10MB", "error");
            fileInput2.value = '';
            return;
        }

        // ลบ URL ก่อนหน้าหากมี
        if (img2.src && img2.src.startsWith('blob:')) {
            URL.revokeObjectURL(img2.src);
        }

        const reader = new FileReader();
        reader.onload = ev => {
            img2.src = ev.target.result;
            img2.onload = () => {
                // รีเซ็ตการซูมและตำแหน่งเมื่อโหลดรูปใหม่
                scale = 1;
                offsetX = 0;
                offsetY = 0;
                circles = [];
                arrows = [];
                texts = [];
                undoStack = [];
                redoStack = [];
                drawCanvas2();
                updateButtonStates();
            };
            img2.onerror = () => {
                showNotification("ไม่สามารถโหลดรูปภาพได้ กรุณาลองอีกครั้ง", "error");
                fileInput2.value = '';
            };
        };
        reader.readAsDataURL(files[0]);
    }
});

// Helpers
function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

function getMousePos(evt) {
    const rect = canvas2.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left - offsetX) / scale,
        y: (evt.clientY - rect.top - offsetY) / scale
    };
}

function findCircle(pos) {
    for (let i = circles.length - 1; i >= 0; i--) {
        const c = circles[i];
        if (Math.hypot(pos.x - c.x, pos.y - c.y) <= c.radius) return c;
    }
    return null;
}

function findText(pos) {
    for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        ctx2.font = "20px sans-serif";
        const textWidth = ctx2.measureText(t.text).width;
        if (pos.x >= t.x && pos.x <= t.x + textWidth &&
            pos.y >= t.y - 20 && pos.y <= t.y) {
            return t;
        }
    }
    return null;
}

function findArrow(pos) {
    for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i];
        // ตรวจสอบทั้งจุดเริ่มต้นและจุดสิ้นสุดของลูกศร
        if (Math.hypot(pos.x - a.x1, pos.y - a.y1) < 10 ||
            Math.hypot(pos.x - a.x2, pos.y - a.y2) < 10) {
            return a;
        }
    }
    return null;
}

function saveState() {
    undoStack.push(JSON.stringify({
        circles: JSON.parse(JSON.stringify(circles)),
        arrows: JSON.parse(JSON.stringify(arrows)),
        texts: JSON.parse(JSON.stringify(texts))
    }));
    redoStack = []; // ล้าง redo stack เมื่อมีการกระทำใหม่
    updateButtonStates();
}

function drawCanvas2() {
    if (animationFrameId2) {
        cancelAnimationFrame(animationFrameId2);
    }

    animationFrameId2 = requestAnimationFrame(() => {
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        ctx2.save();
        ctx2.translate(offsetX, offsetY);
        ctx2.scale(scale, scale);

        if (img2.src) {
            ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
        }

        // วาดวงกลมทั้งหมด
        circles.forEach(c => {
            ctx2.save();
            ctx2.strokeStyle = hexToRgba(c.color, c.opacity);
            ctx2.lineWidth = 3;
            ctx2.beginPath();
            ctx2.arc(c.x, c.y, c.radius, 0, 2 * Math.PI);
            ctx2.stroke();
            ctx2.restore();
        });

        // วาดลูกศรทั้งหมด
        arrows.forEach(a => {
            ctx2.save();
            ctx2.strokeStyle = hexToRgba(a.color, a.opacity);
            ctx2.lineWidth = 3;
            ctx2.beginPath();
            ctx2.moveTo(a.x1, a.y1);
            ctx2.lineTo(a.x2, a.y2);
            ctx2.stroke();
            
            // วาดหัวลูกศร
            const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
            ctx2.beginPath();
            ctx2.moveTo(a.x2, a.y2);
            ctx2.lineTo(a.x2 - 10 * Math.cos(angle - Math.PI / 6),
                       a.y2 - 10 * Math.sin(angle - Math.PI / 6));
            ctx2.lineTo(a.x2 - 10 * Math.cos(angle + Math.PI / 6),
                       a.y2 - 10 * Math.sin(angle + Math.PI / 6));
            ctx2.closePath();
            ctx2.fillStyle = hexToRgba(a.color, a.opacity);
            ctx2.fill();
            ctx2.restore();
        });

        // วาดข้อความทั้งหมด
        texts.forEach(t => {
            ctx2.save();
            ctx2.fillStyle = hexToRgba(t.color, t.opacity);
            ctx2.font = "20px sans-serif";
            ctx2.fillText(t.text, t.x, t.y);
            ctx2.restore();
        });

        // วาด canvas ชั่วคราวสำหรับการวาดระหว่างลาก
        ctx2.drawImage(tempCanvas, 0, 0);
        ctx2.restore();

        animationFrameId2 = null;
    });
}

// Mouse Events for page 2
canvas2.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    const hitCircle = findCircle(pos);
    const hitText = findText(pos);
    const hitArrow = findArrow(pos);

    if (e.shiftKey) {
        // เริ่มวาดวงกลมเมื่อกด Shift + คลิก
        isDrawingCircle = true;
        circleStart = { x: pos.x, y: pos.y };
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    } else if (e.altKey) {
        // เริ่มวาดลูกศรเมื่อกด Alt + คลิก
        isDrawingArrow = true;
        arrowStart = { x: pos.x, y: pos.y };
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    } else if (hitCircle) {
        // เลือกวงกลมเพื่อลาก
        isDraggingCircle = true;
        selectedCircle = hitCircle;
        circleOffset = { x: pos.x - hitCircle.x, y: pos.y - hitCircle.y };
        saveState();
    } else if (hitText) {
        // เลือกข้อความเพื่อลาก
        isDraggingText = true;
        selectedText = hitText;
        textOffset = { x: pos.x - hitText.x, y: pos.y - hitText.y };
        saveState();
    } else if (hitArrow) {
        // เลือกลูกศรเพื่อลาก
        isDraggingArrow = true;
        selectedArrow = hitArrow;
        arrowOffset = {
            x1: pos.x - hitArrow.x1,
            y1: pos.y - hitArrow.y1,
            x2: pos.x - hitArrow.x2,
            y2: pos.y - hitArrow.y2
        };
        saveState();
    } else {
        // ลากเพื่อเลื่อนมุมมอง
        isDraggingCanvas = true;
        dragStart = { x: e.clientX - offsetX, y: e.clientY - offsetY };
        canvas2.style.cursor = 'grabbing';
    }
});

canvas2.addEventListener('mousemove', e => {
    const pos = getMousePos(e);
    
    if (isDraggingCanvas) {
        // ลากเพื่อเลื่อนมุมมอง
        offsetX = e.clientX - dragStart.x;
        offsetY = e.clientY - dragStart.y;
        drawCanvas2();
    } else if (isDrawingCircle) {
        // วาดวงกลมระหว่างลาก
        const radius = Math.hypot(pos.x - circleStart.x, pos.y - circleStart.y);
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.save();
        tempCtx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        tempCtx.lineWidth = 3;
        tempCtx.beginPath();
        tempCtx.arc(circleStart.x, circleStart.y, radius, 0, 2 * Math.PI);
        tempCtx.stroke();
        tempCtx.restore();
        drawCanvas2();
    } else if (isDrawingArrow) {
        // วาดลูกศรระหว่างลาก
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.save();
        tempCtx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        tempCtx.lineWidth = 3;
        tempCtx.beginPath();
        tempCtx.moveTo(arrowStart.x, arrowStart.y);
        tempCtx.lineTo(pos.x, pos.y);
        tempCtx.stroke();
        tempCtx.restore();
        drawCanvas2();
    } else if (isDraggingCircle) {
        // ลากวงกลมที่เลือก
        selectedCircle.x = pos.x - circleOffset.x;
        selectedCircle.y = pos.y - circleOffset.y;
        drawCanvas2();
    } else if (isDraggingText) {
        // ลากข้อความที่เลือก
        selectedText.x = pos.x - textOffset.x;
        selectedText.y = pos.y - textOffset.y;
        drawCanvas2();
    } else if (isDraggingArrow) {
        // ลากลูกศรที่เลือก
        selectedArrow.x1 = pos.x - arrowOffset.x1;
        selectedArrow.y1 = pos.y - arrowOffset.y1;
        selectedArrow.x2 = pos.x - arrowOffset.x2;
        selectedArrow.y2 = pos.y - arrowOffset.y2;
        drawCanvas2();
    } else {
        // เปลี่ยนเคอร์เซอร์เมื่อวางเหนือวัตถุ
        const hitCircle = findCircle(pos);
        const hitText = findText(pos);
        const hitArrow = findArrow(pos);
        
        if (hitCircle || hitText || hitArrow) {
            canvas2.style.cursor = 'move';
        } else {
            canvas2.style.cursor = 'default';
        }
    }
});

canvas2.addEventListener('mouseup', e => {
    const pos = getMousePos(e);
    
    if (isDrawingCircle) {
        // สร้างวงกลมใหม่
        const radius = Math.hypot(pos.x - circleStart.x, pos.y - circleStart.y);
        if (radius > 5) { // ตรวจสอบว่าวงกลมมีขนาดใหญ่พอ
            circles.push({
                x: circleStart.x,
                y: circleStart.y,
                radius: radius,
                color: '#3b82f6',
                opacity: 0.7
            });
            saveState();
        }
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        isDrawingCircle = false;
        drawCanvas2();
    } else if (isDrawingArrow) {
        // สร้างลูกศรใหม่
        const distance = Math.hypot(pos.x - arrowStart.x, pos.y - arrowStart.y);
        if (distance > 10) { // ตรวจสอบว่าลูกศรมีขนาดใหญ่พอ
            arrows.push({
                x1: arrowStart.x,
                y1: arrowStart.y,
                x2: pos.x,
                y2: pos.y,
                color: '#3b82f6',
                opacity: 0.7
            });
            saveState();
        }
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        isDrawingArrow = false;
        drawCanvas2();
    }
    
    // รีเซ็ตสถานะการลากทั้งหมด
    isDraggingCanvas = false;
    isDraggingCircle = false;
    isDraggingText = false;
    isDraggingArrow = false;
    selectedCircle = null;
    selectedText = null;
    selectedArrow = null;
    canvas2.style.cursor = 'default';
});

// Touch Events for mobile devices
canvas2.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas2.dispatchEvent(mouseEvent);
    }
}, { passive: false });

canvas2.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas2.dispatchEvent(mouseEvent);
    }
}, { passive: false });

canvas2.addEventListener('touchend', e => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup');
    canvas2.dispatchEvent(mouseEvent);
}, { passive: false });

// Buttons for page 2
zoomInBtn.addEventListener('click', () => {
    if (scale < 5) { // จำกัดการซูมเข้าไม่ให้เกิน 5 เท่า
        scale *= 1.2;
        drawCanvas2();
    } else {
        showNotification("ไม่สามารถซูมเข้าได้มากกว่านี้", "info");
    }
});

zoomOutBtn.addEventListener('click', () => {
    if (scale > 0.2) { // จำกัดการซูมออกไม่ให้ต่ำกว่า 0.2 เท่า
        scale /= 1.2;
        drawCanvas2();
    } else {
        showNotification("ไม่สามารถซูมออกได้มากกว่านี้", "info");
    }
});

resetBtn2.addEventListener('click', () => {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    drawCanvas2();
});

savePNGBtn.addEventListener('click', () => {
    try {
        // สร้าง canvas ชั่วคราวสำหรับการบันทึก
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas2.width;
        exportCanvas.height = canvas2.height;
        const exportCtx = exportCanvas.getContext('2d');
        
        // วาดทุกอย่างลงใน canvas ส่งออก
        exportCtx.save();
        exportCtx.translate(offsetX, offsetY);
        exportCtx.scale(scale, scale);
        
        if (img2.src) {
            exportCtx.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
        }
        
        // วาดวงกลมทั้งหมด
        circles.forEach(c => {
            exportCtx.save();
            exportCtx.strokeStyle = hexToRgba(c.color, c.opacity);
            exportCtx.lineWidth = 3;
            exportCtx.beginPath();
            exportCtx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI);
            exportCtx.stroke();
            exportCtx.restore();
        });
        
        // วาดลูกศรทั้งหมด
        arrows.forEach(a => {
            exportCtx.save();
            exportCtx.strokeStyle = hexToRgba(a.color, a.opacity);
            exportCtx.lineWidth = 3;
            exportCtx.beginPath();
            exportCtx.moveTo(a.x1, a.y1);
            exportCtx.lineTo(a.x2, a.y2);
            exportCtx.stroke();
            
            const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
            exportCtx.beginPath();
            exportCtx.moveTo(a.x2, a.y2);
            exportCtx.lineTo(a.x2 - 10 * Math.cos(angle - Math.PI / 6),
                           a.y2 - 10 * Math.sin(angle - Math.PI / 6));
            exportCtx.lineTo(a.x2 - 10 * Math.cos(angle + Math.PI / 6),
                           a.y2 - 10 * Math.sin(angle + Math.PI / 6));
            exportCtx.closePath();
            exportCtx.fillStyle = hexToRgba(a.color, a.opacity);
            exportCtx.fill();
            exportCtx.restore();
        });
        
        //
