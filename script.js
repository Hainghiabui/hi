let highestZ = 1;
class Paper {
  holdingPaper = false;
  mouseTouchX = 0;
  mouseTouchY = 0;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;
  startX = 0;
  startY = 0;
  startTime = 0;
  
  init(paper, index) {
    // Hàm xử lý di chuyển chung cho cả mouse và touch
    const handleMove = (clientX, clientY) => {
      if(!this.rotating) {
        this.mouseX = clientX;
        this.mouseY = clientY;
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }
      const dirX = clientX - this.mouseTouchX;
      const dirY = clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;
      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if(this.rotating) {
        this.rotation = degrees;
      }
      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    };
    
    // Mouse events
    document.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });
    
    paper.addEventListener('mousedown', (e) => {
      if(this.holdingPaper) return;
      this.holdingPaper = true;
      paper.style.zIndex = highestZ;
      highestZ += 1;
      if(e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if(e.button === 2) {
        this.rotating = true;
      }
    });
    
    window.addEventListener('mouseup', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });
    
    // Touch events cho mobile - xử lý trong main loop
    document.addEventListener('touchmove', (e) => {
      if(this.holdingPaper) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    }, { passive: false });
    
    paper.addEventListener('touchstart', (e) => {
      if(this.holdingPaper) return;
      
      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.startTime = Date.now();
      
      // Đợi một chút để xem user có ý định drag không
      this.touchTimeout = setTimeout(() => {
        this.holdingPaper = true;
        paper.style.zIndex = highestZ;
        highestZ += 1;
        this.mouseTouchX = touch.clientX;
        this.mouseTouchY = touch.clientY;
        this.mouseX = touch.clientX;
        this.mouseY = touch.clientY;
        this.prevMouseX = touch.clientX;
        this.prevMouseY = touch.clientY;
        
        // Hiệu ứng haptic feedback nếu có
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }, 150); // Delay 150ms để phân biệt tap vs drag
    });
    
    paper.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const moveX = Math.abs(touch.clientX - this.startX);
      const moveY = Math.abs(touch.clientY - this.startY);
      
      // Nếu di chuyển > 10px thì coi như drag ngay
      if (moveX > 10 || moveY > 10) {
        clearTimeout(this.touchTimeout);
        if (!this.holdingPaper) {
          this.holdingPaper = true;
          paper.style.zIndex = highestZ;
          highestZ += 1;
          this.mouseTouchX = this.startX;
          this.mouseTouchY = this.startY;
          this.mouseX = this.startX;
          this.mouseY = this.startY;
          this.prevMouseX = this.startX;
          this.prevMouseY = this.startY;
        }
      }
    });
    
    window.addEventListener('touchend', () => {
      clearTimeout(this.touchTimeout);
      this.holdingPaper = false;
      this.rotating = false;
    });
  }
}
const papers = Array.from(document.querySelectorAll('.paper'));

// Lưu trữ Paper instances
const paperInstances = [];
const isMobile = () => window.innerWidth <= 430;

// Biến lưu trạng thái paper đã được reveal
const revealedPapers = new Set();

// Hàm xử lý tap để reveal paper trên mobile
function handlePaperReveal(paper, index) {
  if (!isMobile()) return;
  
  // Nếu đã reveal rồi thì không làm gì
  if (revealedPapers.has(index)) return;
  
  // Tính toán vị trí bay ra cho paper này
  const side = index % 2 === 0 ? -1 : 1; // Bay ra trái hoặc phải xen kẽ
  const offsetX = side * (250 + Math.random() * 100); // 250-350px
  const offsetY = (Math.random() - 0.5) * 200; // Random lên xuống một chút
  const rotation = side * (20 + Math.random() * 15); // 20-35 độ
  
  // Lấy vị trí hiện tại
  const currentX = paperInstances[index].currentPaperX || 0;
  const currentY = paperInstances[index].currentPaperY || 0;
  
  // Tính vị trí mới
  const newX = currentX + offsetX;
  const newY = currentY + offsetY;
  
  // Animation bay ra
  paper.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
  paper.style.transform = `translateX(${newX}px) translateY(${newY}px) rotateZ(${rotation}deg)`;
  
  // Cập nhật vị trí trong instance
  paperInstances[index].currentPaperX = newX;
  paperInstances[index].currentPaperY = newY;
  paperInstances[index].rotation = rotation;
  
  // Đánh dấu đã reveal
  revealedPapers.add(index);
  
  // Thêm class để styling
  paper.classList.add('revealed');
  
  // Reset transition sau khi animation xong
  setTimeout(() => {
    paper.style.transition = 'transform 0.3s ease';
  }, 600);
}

// Thêm event listener cho tap/click reveal
papers.forEach((paper, index) => {
  const p = new Paper();
  p.init(paper, index);
  paperInstances.push(p);
  
  // Thêm z-index ban đầu (paper cuối cùng trong HTML ở trên cùng)
  paper.style.zIndex = index + 1;
  
  // Tap để reveal (chỉ trên mobile)
  let tapStartX = 0;
  let tapStartY = 0;
  let tapStartTime = 0;
  let hasMoved = false;
  
  paper.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    tapStartX = touch.clientX;
    tapStartY = touch.clientY;
    tapStartTime = Date.now();
    hasMoved = false;
  });
  
  paper.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const moveX = Math.abs(touch.clientX - tapStartX);
    const moveY = Math.abs(touch.clientY - tapStartY);
    
    // Nếu di chuyển > 10px thì coi như đã move
    if (moveX > 10 || moveY > 10) {
      hasMoved = true;
    }
  });
  
  paper.addEventListener('touchend', (e) => {
    const tapDuration = Date.now() - tapStartTime;
    // Nếu tap nhanh (< 300ms) và không di chuyển thì reveal
    if (isMobile() && !hasMoved && tapDuration < 300 && !revealedPapers.has(index)) {
      handlePaperReveal(paper, index);
    }
  });
  
  // Double tap để reveal trên desktop (cho testing)
  let lastTap = 0;
  paper.addEventListener('click', (e) => {
    const now = Date.now();
    if (isMobile() && !revealedPapers.has(index) && now - lastTap < 300) {
      handlePaperReveal(paper, index);
    }
    lastTap = now;
  });
});