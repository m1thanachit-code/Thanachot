// ====== Configuration ======
const MODEL_URL = "./my_model/"; // Make sure this matches your folder

let model, webcam, maxPredictions;
let isRunning = false;

// ====== Load Model ======
async function loadModel() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";
  try {
    document.getElementById("status").textContent = "กำลังโหลดโมเดล...";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    document.getElementById("status").textContent = "โหลดโมเดลสำเร็จ ✅";
    buildLabelUI();
  } catch (err) {
    console.error("Model load error:", err);
    document.getElementById("status").textContent = "❌ โหลดโมเดลไม่สำเร็จ — ตรวจสอบโฟลเดอร์ my_model";
  }
}

// ====== Build progress bar UI ======
function buildLabelUI() {
  const container = document.getElementById("labelContainer");
  container.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-left" id="label-name-${i}">Class ${i}</div>
      <div class="progress-wrap">
        <div class="progress-fill" id="bar-${i}" style="width:0%"></div>
      </div>
      <div class="percent" id="pct-${i}">0%</div>
    `;
    container.appendChild(row);
  }
}

// ====== Start Camera ======
async function startCamera() {
  if (!model) {
    alert("กรุณาโหลดโมเดลก่อน");
    return;
  }
  const flip = true;
  webcam = new tmImage.Webcam(320, 240, flip);
  await webcam.setup();
  await webcam.play();
  document.getElementById("webcam").innerHTML = "";
  document.getElementById("webcam").appendChild(webcam.canvas);
  isRunning = true;
  window.requestAnimationFrame(loop);
}

// ====== Prediction Loop ======
async function loop() {
  if (!isRunning) return;
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

// ====== Prediction Function ======
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  const sorted = prediction.sort((a, b) => b.probability - a.probability);
  const top = sorted[0];

  document.getElementById("topLabel").textContent = top.className;
  document.getElementById("topDesc").textContent = (top.probability * 100).toFixed(1) + "%";

  for (let i = 0; i < prediction.length; i++) {
    const p = prediction[i].probability;
    document.getElementById("bar-" + i).style.width = (p * 100) + "%";
    document.getElementById("pct-" + i).textContent = (p * 100).toFixed(1) + "%";
    document.getElementById("label-name-" + i).textContent = prediction[i].className;
  }
}

// ====== Stop Camera ======
function stopCamera() {
  isRunning = false;
  if (webcam) webcam.stop();
  document.getElementById("status").textContent = "กล้องหยุดแล้ว";
}

// ====== Event Listeners ======
document.getElementById("loadModelBtn").addEventListener("click", loadModel);
document.getElementById("startBtn").addEventListener("click", startCamera);
document.getElementById("stopBtn").addEventListener("click", stopCamera);
