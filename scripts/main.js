// ระบบแจ้งเตือน
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') {
        notification.classList.add('error');
    } else if (type === 'success') {
        notification.classList.add('success');
    } else if (type === 'ai') {
        notification.classList.add('ai');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// ระบบสลับหน้า
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', function() {
        const targetPage = this.getAttribute('data-page');
        
        // อัพเดตปุ่มนำทาง
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // ซ่อนทุกหน้า
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // แสดงหน้าที่เลือก
        document.getElementById(targetPage).classList.add('active');
        
        // อัพเดตสถานะปุ่มตามหน้าที่เลือก
        updateButtonStates();
    });
});

// ฟังก์ชันอัพเดตสถานะปุ่ม
function updateButtonStates() {
    // หน้า 1
    const hasImage1 = window.imgLoaded1;
    document.getElementById('reset1').disabled = !hasImage1;
    document.getElementById('export1').disabled = !hasImage1;
    document.getElementById('clear1').disabled = !hasImage1;
    
    // หน้า 2
    const hasImage2 = window.img2 && window.img2.src && window.img2.complete && window.img2.naturalWidth !== 0;
    const hasElements = window.circles && (window.circles.length > 0 || window.arrows.length > 0 || window.texts.length > 0);
    const canUndo = window.undoStack && window.undoStack.length > 0;
    
    document.getElementById('zoomIn').disabled = !hasImage2;
    document.getElementById('zoomOut').disabled = !hasImage2;
    document.getElementById('reset2').disabled = !hasImage2;
    document.getElementById('savePNG').disabled = !hasImage2 && !hasElements;
    document.getElementById('undo').disabled = !canUndo;
    document.getElementById('clearAll').disabled = !hasElements;
}

// ฟังก์ชันย้ายเครื่องเล่นเพลงไปด้านขวา
function moveMusicPlayerToRight() {
    try {
        // ตรวจสอบว่าอยู่ในหน้า Advanced Editing หรือไม่
        const isPage2Active = document.getElementById('page2').classList.contains('active');
        const isPage3Active = document.getElementById('page3').classList.contains('active');
        
        if (isPage2Active || isPage3Active) {
            // หาตำแหน่งของแอปพลิเคชัน
            const appContainer = document.querySelector('.app-container');
            const activePage = isPage2Active ? document.getElementById('page2') : document.getElementById('page3');
            const canvasWrap = activePage.querySelector('.canvas-wrap');
            
            // ตั้งค่าตำแหน่งเครื่องเล่นเพลงให้อยู่ด้านขวาของแอปพลิเคชัน
            const appRect = appContainer.getBoundingClientRect();
            const canvasRect = canvasWrap.getBoundingClientRect();
            
            // คำนวณตำแหน่งใหม่
            const newLeft = appRect.right - window.musicPlayer.offsetWidth - 20;
            const newTop = canvasRect.top;
            
            // จำกัดตำแหน่งไม่ให้หลุดออกจากหน้าจอ
            const maxLeft = window.innerWidth - window.musicPlayer.offsetWidth;
            const maxTop = window.innerHeight - window.musicPlayer.offsetHeight;
            
            const finalLeft = Math.max(20, Math.min(newLeft, maxLeft));
            const finalTop = Math.max(20, Math.min(newTop, maxTop));
            
            // ย้ายเครื่องเล่นเพลง
            window.musicPlayer.style.left = `${finalLeft}px`;
            window.musicPlayer.style.right = 'auto';
            window.musicPlayer.style.top = `${finalTop}px`;
            window.musicPlayer.style.bottom = 'auto';
            
            // แสดงแอนิเมชัน
            window.musicPlayer.classList.add('moving');
            setTimeout(() => {
                window.musicPlayer.classList.remove('moving');
            }, 1000);
            
            // บันทึกตำแหน่งใน localStorage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('musicPlayerPosition', JSON.stringify({
                    left: finalLeft,
                    top: finalTop
                }));
            }
        } else {
            // ถ้าไม่อยู่ในหน้า Advanced Editing หรือ AI ให้แจ้งเตือน
            const tts = new SpeechSynthesisUtterance("กรุณาเปลี่ยนไปหน้าการแก้ไขรูปภาพขั้นสูงหรือ AI ลบแสงจ้าก่อนครับเจ้านาย");
            tts.lang = "th-TH";
            speechSynthesis.speak(tts);
            
            showNotification("กรุณาเปลี่ยนไปหน้า 'แก้ไขรูปภาพขั้นสูง' หรือ 'AI ลบแสงจ้า' ก่อน", "info");
        }
    } catch (error) {
        console.error("Error moving music player:", error);
        showNotification("เกิดข้อผิดพลาดในการย้ายเครื่องเล่นเพลง", "error");
    }
}

// Initialize everything when page loads
window.addEventListener('load', () => {
    // ตั้งค่าระดับเสียงเริ่มต้น
    if (window.audio && window.volumeSlider) {
        window.audio.volume = window.volumeSlider.value;
    }
    
    // โหลดตำแหน่งเครื่องเล่นเพลงจาก localStorage (ถ้ามี)
    try {
        if (typeof localStorage !== 'undefined') {
            const savedPosition = localStorage.getItem('musicPlayerPosition');
            if (savedPosition && window.musicPlayer) {
                const position = JSON.parse(savedPosition);
                window.musicPlayer.style.left = `${position.left}px`;
                window.musicPlayer.style.top = `${position.top}px`;
                window.musicPlayer.style.right = 'auto';
                window.musicPlayer.style.bottom = 'auto';
            }
        }
    } catch (e) {
        console.error("Error loading music player position:", e);
    }
    
    // แสดงหน้าต่างถามเล่นเพลง (ถ้ายังไม่เคยตอบ)
    setTimeout(() => {
        if (window.showMusicQuestion) {
            window.showMusicQuestion();
        }
    }, 1000);
});

// ปรับขนาด canvas เมื่อหน้าต่างถูกปรับขนาด
window.addEventListener('resize', () => {
    if (window.initCanvas1) {
        window.initCanvas1();
    }
    if (window.imgLoaded3 && window.originalImg3) {
        // ปรับขนาด canvas 3 ใหม่ตามหน้าต่าง
        const canvas3 = document.getElementById('canvas3');
        const maxWidth = Math.min(1000, window.innerWidth - 64);
        const maxHeight = Math.min(800, window.innerHeight * 0.6);
        
        let width = window.originalImg3.width;
        let height = window.originalImg3.height;
        
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
        if (window.applyFilters) {
            window.applyFilters();
        }
    }
});
