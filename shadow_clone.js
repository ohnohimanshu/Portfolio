const video = document.getElementById("clone-video");
const canvas = document.getElementById("clone-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const startBtn = document.getElementById('start-clone-btn');
const cloneOverlay = document.getElementById('clone-start-overlay');
const confidenceContainer = document.getElementById('clone-confidence-container');

let clonesTriggered = false;
let cloneStartTime = null;
let mask = null;
let gestureModel = null;
let modelsLoaded = false;
let isCameraRunning = false;
let selfie, holistic, camera;

async function loadGestureModel(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      gestureModel = await tf.loadLayersModel(
        "https://raw.githubusercontent.com/ohnohimanshu/Portfolio/main/gesture-model.json"
      );
      console.log("Gesture model loaded successfully");
      return true;
    } catch (e) {
      console.error(`Failed to load gesture model (attempt ${i + 1}/${retries}):`, e);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }
  }
  return false;
}

function normalizeHand(lm) {
  const w = lm[0];
  const mcp = lm[9];
  const scale =
    Math.sqrt(
      (mcp.x - w.x) ** 2 + (mcp.y - w.y) ** 2 + (mcp.z - w.z) ** 2
    ) || 1;

  const out = [];
  for (let i = 0; i < 21; i++) {
    out.push((lm[i].x - w.x) / scale);
    out.push((lm[i].y - w.y) / scale);
    out.push((lm[i].z - w.z) / scale);
  }
  return out;
}

function predictGesture(right, left, threshold = 0.999) {
  if (!gestureModel || !right || !left) return false;

  const input = tf.tensor2d([
    [...normalizeHand(right), ...normalizeHand(left)],
  ]);
  const probs = gestureModel.predict(input).dataSync();
  input.dispose();

  const cloneProb = probs[0];
  const releaseProb = probs[1];
  const confidenceEl = document.getElementById("clone-confidence");
  
  const maxProb = Math.max(cloneProb, releaseProb);
  if (confidenceEl) confidenceEl.textContent = (maxProb * 100).toFixed(1) + "%";

  return cloneProb > threshold;
}

function predictRelease(right, left, threshold = 0.999) {
  if (!gestureModel || !right || !left) return false;

  const input = tf.tensor2d([
    [...normalizeHand(right), ...normalizeHand(left)],
  ]);
  const probs = gestureModel.predict(input).dataSync();
  input.dispose();

  const releaseProb = probs[1];
  return releaseProb > threshold;
}

const customClones = [
  { x: -100, y: 100, scale: 0.9,  delay: 1000, smokeSpawned: false },
  { x:  120, y: 100, scale: 0.85, delay: 1150, smokeSpawned: false },
  { x: -180, y: 140, scale: 0.8,  delay: 1300, smokeSpawned: false },
  { x: -140, y: 140, scale: 0.45, delay: 1320, smokeSpawned: false },
  { x:  180, y: 160, scale: 0.7,  delay: 1450, smokeSpawned: false },
  { x:  140, y: 160, scale: 0.4,  delay: 1470, smokeSpawned: false },
  { x: -250, y: 140, scale: 0.7,  delay: 1600, smokeSpawned: false },
  { x: -220, y: 140, scale: 0.35, delay: 1620, smokeSpawned: false },
  { x:  260, y: 160, scale: 0.65, delay: 1750, smokeSpawned: false },
  { x: -100, y: 150, scale: 0.6,  delay: 2500, smokeSpawned: false },
  { x:  100, y: 150, scale: 0.6,  delay: 2650, smokeSpawned: false },
  { x: -120, y:  70, scale: 0.55, delay: 2800, smokeSpawned: false },
  { x:  100, y:  70, scale: 0.5,  delay: 2950, smokeSpawned: false },
  { x: -200, y:  85, scale: 0.55, delay: 3100, smokeSpawned: false },
  { x:  230, y:  85, scale: 0.5,  delay: 3250, smokeSpawned: false },
  { x: -280, y: 100, scale: 0.4,  delay: 3400, smokeSpawned: false },
];

const SMOKE_FOLDERS = ["smoke_1", "smoke_2", "smoke_3"];
const SMOKE_FRAME_COUNT = 5;
const SMOKE_DURATION = 600;
const activeSmokes = [];

function spawnSmoke(x, y, scale) {
  scale *= 1.2;
  const folder = SMOKE_FOLDERS[Math.floor(Math.random() * SMOKE_FOLDERS.length)];

  const frames = [];
  const currentPath = window.location.pathname;
  const baseDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  for (let i = 1; i <= SMOKE_FRAME_COUNT; i++) {
    const img = new Image();
    const fullUrl = window.location.origin + baseDir + `assets/${folder}/${i}.png`;
    img.src = fullUrl;
    frames.push(img);
  }

  activeSmokes.push({ x, y, scale, start: performance.now(), frames });
}

function drawSmokes() {
  const now = performance.now();
  for (let i = activeSmokes.length - 1; i >= 0; i--) {
    const s = activeSmokes[i];
    const elapsed = now - s.start;
    const frameDuration = SMOKE_DURATION / SMOKE_FRAME_COUNT;
    const frameIndex = Math.floor(elapsed / frameDuration);

    if (frameIndex >= s.frames.length) {
      activeSmokes.splice(i, 1);
      continue;
    }

    const img = s.frames[frameIndex];
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(s.scale, s.scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }
}

function drawClones(person) {
  const now = performance.now();
  const sorted = [...customClones].sort((a, b) => b.delay - a.delay);

  sorted.forEach((cl) => {
    if (now - cloneStartTime >= cl.delay) {
      ctx.save();
      ctx.translate(cl.x + canvas.width * (1 - cl.scale) / 2, cl.y);
      ctx.scale(cl.scale, cl.scale);
      ctx.drawImage(person, 0, 0);
      ctx.restore();
    }
  });

  ctx.drawImage(person, 0, 0); 
}

function grabPerson() {
  const offscreen = document.createElement("canvas");
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const tempCtx = offscreen.getContext("2d");

  tempCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  tempCtx.globalCompositeOperation = "source-in";
  tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
  tempCtx.globalCompositeOperation = "source-over";

  return offscreen;
}

const FINGER_INDICES = {
  thumb:  [0, 1, 2, 3, 4],
  index:  [0, 5, 6, 7, 8],
  middle: [0, 9, 10, 11, 12],
  ring:   [0, 13, 14, 15, 16],
  pinky:  [0, 17, 18, 19, 20],
};

function drawFingerSkeleton(lm) {
  ctx.strokeStyle = "#B8312F";
  ctx.lineWidth = 2;

  for (const indices of Object.values(FINGER_INDICES)) {
    ctx.beginPath();
    indices.forEach((i, idx) => {
      const x = lm[i].x * canvas.width;
      const y = lm[i].y * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  lm.forEach((point) => {
    ctx.beginPath();
    ctx.arc(
      point.x * canvas.width,
      point.y * canvas.height,
      3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();
  });
}

function toggleImage() {
  const img = document.getElementById("clone-overlay-img");
  const btn = document.getElementById("clone-overlay-btn");
  if (!img || !btn) return;

  if (img.dataset.state === "2") return;

  img.src = "assets/state-2.png";
  img.dataset.state = "2";

  btn.classList.add("scale-125");
  setTimeout(() => btn.classList.remove("scale-125"), 200);
}

function processResults(res) {
  if (!mask) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const person = grabPerson();
  const instructEl = document.getElementById("jutsu-instruction");

  if (clonesTriggered && gestureModel) {
    if (predictRelease(res.rightHandLandmarks, res.leftHandLandmarks)) {
      // spawn smoke for each currently active clone on release!
      customClones.forEach((cl) => {
        if (cl.smokeSpawned) {
          const centerX = cl.x + canvas.width / 2;
          const centerY = cl.y + canvas.height / 2 - 40;
          spawnSmoke(centerX - 15, centerY, cl.scale);
          spawnSmoke(centerX + 15, centerY, cl.scale);
        }
      });

      clonesTriggered = false;
      cloneStartTime = null;
      customClones.forEach(cl => cl.smokeSpawned = false);
      const img = document.getElementById("clone-overlay-img");
      if (img) {
          img.src = "assets/state-1.png";
          img.dataset.state = "1";
      }
      if (instructEl) instructEl.textContent = "Perform the clone hand sign";
    }
  }

  if (!clonesTriggered && gestureModel) {
    if (predictGesture(res.rightHandLandmarks, res.leftHandLandmarks)) {
      clonesTriggered = true;
      cloneStartTime = performance.now();
      if (instructEl) instructEl.textContent = "Perform the release sign (Ram) to dispel";
    }
  }

  if (clonesTriggered) {
    const now = performance.now();
    customClones.forEach((cl) => {
      if (!cl.smokeSpawned && now - cloneStartTime >= cl.delay) {
        cl.smokeSpawned = true;
        const centerX = cl.x + canvas.width / 2;
        const centerY = cl.y + canvas.height / 2 - 40;
        spawnSmoke(centerX - 15, centerY, cl.scale);
        spawnSmoke(centerX + 15, centerY, cl.scale);
      }
    });

    toggleImage();
    drawClones(person);
  } else {
    ctx.drawImage(person, 0, 0);
  }

  // Draw smokes globally so release smokes are rendered
  drawSmokes();

  if (res.rightHandLandmarks) drawFingerSkeleton(res.rightHandLandmarks);
  if (res.leftHandLandmarks) drawFingerSkeleton(res.leftHandLandmarks);
}

async function initializeAI() {
  if (modelsLoaded) return;
  startBtn.querySelector('span').textContent = "Loading Chakra...";
  
  selfie = new SelfieSegmentation({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`,
  });
  selfie.setOptions({ modelSelection: 1 });
  selfie.onResults((r) => (mask = r.segmentationMask));

  holistic = new Holistic({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${f}`,
  });
  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
  });
  holistic.onResults(processResults);

  await loadGestureModel();
  
  camera = new Camera(video, {
    width: 640,
    height: 480,
    onFrame: async () => {
      if(!isCameraRunning) return;
      await selfie.send({ image: video });
      await holistic.send({ image: video });
    },
  });
  
  modelsLoaded = true;
}

if(startBtn) {
    startBtn.addEventListener('click', async () => {
        if (!modelsLoaded) {
           await initializeAI();
        }
        
        isCameraRunning = true;
        await camera.start();
        
        cloneOverlay.style.pointerEvents = 'none';
        cloneOverlay.style.opacity = '0';
        canvas.classList.remove('hidden');
        document.getElementById('clone-overlay-btn').classList.remove('hidden');
        confidenceContainer.classList.remove('hidden');
        
        if (!ScrollTrigger.getAll().some(t => t.vars.trigger === "#shadow_clone")) {
          ScrollTrigger.create({
            trigger: "#shadow_clone",
            start: "top bottom",
            end: "bottom top",
            onToggle: self => {
              if (!self.isActive && isCameraRunning) {
                isCameraRunning = false;
                camera.stop();
                
                cloneOverlay.style.pointerEvents = 'auto';
                cloneOverlay.style.opacity = '1';
                canvas.classList.add('hidden');
                document.getElementById('clone-overlay-btn').classList.add('hidden');
                confidenceContainer.classList.add('hidden');
                
                startBtn.querySelector('span').textContent = "Resume Training";
              }
            }
          });
        }
    });
}

