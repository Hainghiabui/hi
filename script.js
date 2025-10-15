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
  
  init(paper) {
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
    
    // Touch events cho mobile
    document.addEventListener('touchmove', (e) => {
      if(this.holdingPaper) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    }, { passive: false });
    
    paper.addEventListener('touchstart', (e) => {
      if(this.holdingPaper) return;
      this.holdingPaper = true;
      paper.style.zIndex = highestZ;
      highestZ += 1;
      const touch = e.touches[0];
      this.mouseTouchX = touch.clientX;
      this.mouseTouchY = touch.clientY;
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
      this.prevMouseX = touch.clientX;
      this.prevMouseY = touch.clientY;
    });
    
    window.addEventListener('touchend', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });
  }
}
const papers = Array.from(document.querySelectorAll('.paper'));

// Lưu trữ Paper instances
const paperInstances = [];

// Hàm tự động spread papers trên mobile
function spreadPapersOnMobile() {
  const isMobile = window.innerWidth <= 430;
  
  if (isMobile) {
    // Tính toán vị trí cho mỗi paper trên mobile
    papers.forEach((paper, index) => {
      const totalPapers = papers.length;
      
      // Tạo pattern spread theo dạng spiral/fan
      const angle = (index / totalPapers) * 180 - 90; // từ -90 đến 90 độ
      const radius = 150; // khoảng cách từ center
      
      // Random thêm một chút để tự nhiên hơn
      const randomX = (Math.random() - 0.5) * 100;
      const randomY = index * 400 - 200; // Spread theo chiều dọc
      
      const x = Math.sin(angle * Math.PI / 180) * radius + randomX;
      const y = randomY;
      const rotation = Math.random() * 20 - 10;
      
      // Set vị trí ban đầu
      setTimeout(() => {
        paper.style.transform = `translateX(${x}px) translateY(${y}px) rotateZ(${rotation}deg)`;
        paper.style.transition = 'transform 0.8s ease-out';
        
        // Cập nhật vị trí trong Paper instance
        if (paperInstances[index]) {
          paperInstances[index].currentPaperX = x;
          paperInstances[index].currentPaperY = y;
          paperInstances[index].rotation = rotation;
        }
        
        // Tắt transition sau khi animation xong để drag mượt
        setTimeout(() => {
          paper.style.transition = 'transform 0.3s ease';
        }, 800);
      }, index * 100); // Delay để tạo hiệu ứng bay ra lần lượt
    });
  }
}

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
  paperInstances.push(p);
});

// Chạy spread animation khi load trang
window.addEventListener('load', spreadPapersOnMobile);
window.addEventListener('resize', spreadPapersOnMobile);