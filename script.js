// script.js - interactive behaviour

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const confettiCanvas = document.getElementById('confettiCanvas');

// Current visual offset applied via CSS transform (does NOT affect layout)
let noOffsetX = 0;
let noOffsetY = 0;

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

// Pick a random on-screen target and move NO there WITHOUT changing layout.
// We do this by computing the needed translate() delta from the button's current screen rect.
function moveNoButton() {
  const rect = noBtn.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const margin = 12; // keep away from viewport edges
  const maxX = Math.max(margin, vw - rect.width - margin);
  const maxY = Math.max(margin, vh - rect.height - margin);

  // Random target anywhere on screen
  const targetX = Math.floor(Math.random() * (maxX - margin + 1)) + margin;
  const targetY = Math.floor(Math.random() * (maxY - margin + 1)) + margin;

  // Compute how much we need to move from the CURRENT visual position
  const dx = targetX - rect.left;
  const dy = targetY - rect.top;

  // Update stored offsets
  noOffsetX += dx;
  noOffsetY += dy;

  // Safety clamp: if a browser rounding weirdness happens, prevent extreme runaway.
  // (Still allows full-screen travel.)
  const safeLimitX = vw * 2;
  const safeLimitY = vh * 2;
  noOffsetX = clamp(noOffsetX, -safeLimitX, safeLimitX);
  noOffsetY = clamp(noOffsetY, -safeLimitY, safeLimitY);

  noBtn.style.transform = `translate3d(${noOffsetX}px, ${noOffsetY}px, 0)`;
}

// Make it hard to click: move on hover and also on mousedown/touchstart
noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('mousedown', (e) => { e.preventDefault(); moveNoButton(); });
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); }, { passive: false });

// If user clicks YES
yesBtn.addEventListener('click', () => {
  showModal();
  startConfetti();
});

// Show modal
function showModal(){
  modal.classList.remove('hidden');
}

// Close modal
closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// If user resizes, reset NO button so it doesn't get stuck off-screen
window.addEventListener('resize', () => {
  noOffsetX = 0;
  noOffsetY = 0;
  noBtn.style.transform = '';
});

// -----------------------------
// Simple confetti implementation
// -----------------------------
function startConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const pieces = [];
  const colors = [
    '#ff4d7e','#ffb3c7','#ffd6e0','#ffd27a','#ffc17a','#a6ffcb'
  ];

  function random(min, max) { return Math.random() * (max - min) + min; }

  for (let i=0;i<120;i++){
    pieces.push({
      x: random(0, confettiCanvas.width),
      y: random(-confettiCanvas.height, 0),
      w: random(6, 12),
      h: random(8, 16),
      color: colors[Math.floor(Math.random() * colors.length)],
      r: random(0, Math.PI*2),
      s: random(1, 3),
      a: random(0, Math.PI*2),
    });
  }

  let frame = 0;
  function draw(){
    frame++;
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);

    for (const p of pieces){
      p.y += p.s * 2;
      p.x += Math.sin(p.a + frame*0.02) * 0.8;
      p.r += 0.06;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();

      // recycle
      if (p.y > confettiCanvas.height + 40){
        p.y = random(-200, -40);
        p.x = random(0, confettiCanvas.width);
      }
    }

    // stop after ~5 seconds
    if (frame < 300){
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    }
  }

  draw();
}
