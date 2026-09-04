const tabs = document.querySelectorAll(".application-tab");
const panels = document.querySelectorAll(".application-lab");

function switchApplication(name) {
  tabs.forEach(tab => {
    const active = tab.dataset.application === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  panels.forEach(panel => {
    const active = panel.dataset.panel === name;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });

  if (name === "weather") {

  stopBioAnimation();
  startWeatherRendering();

} else {

  stopWeatherAnimation();
}


if (name === "bio") {

  startBioAnimation();

} else {

  stopBioAnimation();
}


/*
  В Криптографии ничего автоматически
  не генерируем.
*/

}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const name = tab.dataset.application;

    switchApplication(name);

    const panel = document.querySelector(
      `.application-lab[data-panel="${name}"]`
    );

    if (panel) {
      setTimeout(() => {
        panel.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 50);
    }
  });
});


/* =========================================================
   ОБЩИЕ CANVAS-ФУНКЦИИ
========================================================= */

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();

  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function drawGrid(ctx, canvas, alpha = 0.08) {
  ctx.save();
  ctx.strokeStyle = `rgba(110,160,180,${alpha})`;
  ctx.lineWidth = 1;

  const step = 45;

  for (let x = 0; x < canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}


/* =========================================================
   1. ПОГОДА — ТЕМПЕРАТУРНОЕ ПОЛЕ + ВЕТЕР
========================================================= */

const weatherCanvas = document.getElementById("weather-chart");
const weatherCtx = weatherCanvas.getContext("2d");

const weatherTemperature = document.getElementById("weather-temperature");
const weatherTemperatureValue = document.getElementById("weather-temperature-value");

const weatherWind = document.getElementById("weather-wind");
const weatherWindValue = document.getElementById("weather-wind-value");

const weatherPerturbation = document.getElementById("weather-perturbation");
const weatherPerturbationValue = document.getElementById("weather-perturbation-value");

const weatherRun = document.getElementById("weather-run");
const weatherPause = document.getElementById("weather-pause");
const weatherReset = document.getElementById("weather-reset");
const weatherTimeLabel = document.getElementById("weather-time");

let weatherRunning = false;
let weatherAnimationFrame = null;
let weatherTime = 0;

let particles = [];
let weatherField = null;

const PARTICLE_COUNT = 420;

function createWeatherParticles() {
  particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * weatherCanvas.width,
      y: Math.random() * weatherCanvas.height,
      age: Math.random() * 100,
      maxAge: 80 + Math.random() * 120
    });
  }
}

function temperatureAt(x, y, t) {
  const w = weatherCanvas.width;
  const h = weatherCanvas.height;

  const contrast = Number(weatherTemperature.value) / 100;
  const perturb = Number(weatherPerturbation.value) / 100;

  const nx = x / w;
  const ny = y / h;

  const wave1 =
    Math.sin(nx * Math.PI * 2.1 + t * 0.006) *
    Math.cos(ny * Math.PI * 1.8 - t * 0.004);

  const wave2 =
    Math.sin((nx + ny) * Math.PI * 3.2 + t * 0.003);

  const vortex =
    Math.sin(
      Math.sqrt(
        Math.pow(nx - 0.63, 2) +
        Math.pow(ny - 0.42, 2)
      ) * 18 - t * 0.01
    );

  return (
    0.5 +
    contrast * 0.25 * wave1 +
    contrast * 0.12 * wave2 +
    perturb * 0.18 * vortex
  );
}

function weatherVelocity(x, y, t) {
  const w = weatherCanvas.width;
  const h = weatherCanvas.height;

  const nx = x / w;
  const ny = y / h;

  const windPower = Number(weatherWind.value) / 100;
  const perturb = Number(weatherPerturbation.value) / 100;

  const cx = 0.62;
  const cy = 0.43;

  const dx = nx - cx;
  const dy = ny - cy;

  const distance2 = dx * dx + dy * dy + 0.01;

  const swirl = 0.9 / distance2;

  let vx =
    0.5 +
    Math.sin(ny * Math.PI * 3 + t * 0.004) * 0.3 -
    dy * swirl * 0.035;

  let vy =
    Math.cos(nx * Math.PI * 2.5 - t * 0.003) * 0.23 +
    dx * swirl * 0.035;

  vx += perturb * Math.sin(t * 0.02 + ny * 12) * 0.35;
  vy += perturb * Math.cos(t * 0.017 + nx * 10) * 0.35;

  return {
    vx: vx * windPower * 1.6,
    vy: vy * windPower * 1.6
  };
}

function tempColor(value) {
  value = Math.max(0, Math.min(1, value));

  if (value < 0.5) {
    const t = value / 0.5;

    const r = Math.round(25 + 25 * t);
    const g = Math.round(85 + 105 * t);
    const b = Math.round(165 + 60 * t);

    return [r, g, b];
  }

  const t = (value - 0.5) / 0.5;

  const r = Math.round(50 + 205 * t);
  const g = Math.round(190 - 110 * t);
  const b = Math.round(225 - 165 * t);

  return [r, g, b];
}

function renderTemperatureField() {
  resizeCanvas(weatherCanvas);

  const width = weatherCanvas.width;
  const height = weatherCanvas.height;

  const smallWidth = Math.max(120, Math.floor(width / 4));
  const smallHeight = Math.max(80, Math.floor(height / 4));

  const offscreen = document.createElement("canvas");
  offscreen.width = smallWidth;
  offscreen.height = smallHeight;

  const offCtx = offscreen.getContext("2d");
  const image = offCtx.createImageData(smallWidth, smallHeight);

  for (let py = 0; py < smallHeight; py++) {
    for (let px = 0; px < smallWidth; px++) {
      const x = px / smallWidth * width;
      const y = py / smallHeight * height;

      const temp = temperatureAt(x, y, weatherTime);
      const [r, g, b] = tempColor(temp);

      const index = (py * smallWidth + px) * 4;

      image.data[index] = r;
      image.data[index + 1] = g;
      image.data[index + 2] = b;
      image.data[index + 3] = 255;
    }
  }

  offCtx.putImageData(image, 0, 0);

  weatherCtx.clearRect(0, 0, width, height);
  weatherCtx.imageSmoothingEnabled = true;
  weatherCtx.drawImage(offscreen, 0, 0, width, height);

  weatherCtx.save();
  weatherCtx.fillStyle = "rgba(4,15,22,.22)";
  weatherCtx.fillRect(0, 0, width, height);
  weatherCtx.restore();
}

function renderWeatherParticles() {
  weatherCtx.save();
  weatherCtx.lineWidth = 1.15;
  weatherCtx.lineCap = "round";

  particles.forEach(particle => {
    const { vx, vy } = weatherVelocity(
      particle.x,
      particle.y,
      weatherTime
    );

    const oldX = particle.x;
    const oldY = particle.y;

    particle.x += vx;
    particle.y += vy;

    particle.age++;

    if (
      particle.x < 0 ||
      particle.x > weatherCanvas.width ||
      particle.y < 0 ||
      particle.y > weatherCanvas.height ||
      particle.age > particle.maxAge
    ) {
      particle.x = Math.random() * weatherCanvas.width;
      particle.y = Math.random() * weatherCanvas.height;
      particle.age = 0;
      particle.maxAge = 80 + Math.random() * 120;
      return;
    }

    const temp = temperatureAt(
      particle.x,
      particle.y,
      weatherTime
    );

    const opacity = 0.28 + Math.abs(temp - 0.5) * 0.65;

    weatherCtx.strokeStyle =
      `rgba(235,248,250,${opacity})`;

    weatherCtx.beginPath();
    weatherCtx.moveTo(oldX, oldY);
    weatherCtx.lineTo(particle.x, particle.y);
    weatherCtx.stroke();
  });

  weatherCtx.restore();
}

function drawWeatherFrame() {
  if (
    document.getElementById("application-weather").hidden
  ) {
    return;
  }

  renderTemperatureField();
  renderWeatherParticles();

  weatherTimeLabel.textContent =
    `t = ${Math.floor(weatherTime / 12)}`;

  if (weatherRunning) {
    weatherTime += 1;
    weatherAnimationFrame =
      requestAnimationFrame(drawWeatherFrame);
  }
}

function startWeatherRendering() {
  resizeCanvas(weatherCanvas);

  if (!particles.length) {
    createWeatherParticles();
  }

  drawWeatherFrame();
}

function startWeatherAnimation() {
  if (weatherRunning) return;

  weatherRunning = true;
  drawWeatherFrame();
}

function stopWeatherAnimation() {
  weatherRunning = false;

  if (weatherAnimationFrame) {
    cancelAnimationFrame(weatherAnimationFrame);
    weatherAnimationFrame = null;
  }
}

function resetWeather() {
  stopWeatherAnimation();

  weatherTemperature.value = 65;
  weatherWind.value = 55;
  weatherPerturbation.value = 4;

  weatherTemperatureValue.textContent = "65%";
  weatherWindValue.textContent = "55%";
  weatherPerturbationValue.textContent = "4%";

  weatherTime = 0;

  createWeatherParticles();
  drawWeatherFrame();
}

weatherTemperature.addEventListener("input", () => {
  weatherTemperatureValue.textContent =
    `${weatherTemperature.value}%`;

  if (!weatherRunning) {
    drawWeatherFrame();
  }
});

weatherWind.addEventListener("input", () => {
  weatherWindValue.textContent =
    `${weatherWind.value}%`;

  if (!weatherRunning) {
    drawWeatherFrame();
  }
});

weatherPerturbation.addEventListener("input", () => {
  weatherPerturbationValue.textContent =
    `${weatherPerturbation.value}%`;

  if (!weatherRunning) {
    drawWeatherFrame();
  }
});

weatherRun.addEventListener("click", startWeatherAnimation);
weatherPause.addEventListener("click", stopWeatherAnimation);
weatherReset.addEventListener("click", resetWeather);


/* =========================================================
   2. БИОСИГНАЛЫ
========================================================= */
/* =========================================================
   2. БИОСИГНАЛЫ — АНИМИРОВАННАЯ КАРДИОГРАММА
========================================================= */

const bioCanvas = document.getElementById("bio-chart");
const bioCtx = bioCanvas.getContext("2d");

const signalButtons = document.querySelectorAll(".signal-mode");
const bioState = document.getElementById("bio-state");
const bioDescription = document.getElementById("bio-description");

let bioMode = "regular";

let bioSignal = [];
let bioDrawIndex = 0;

let bioAnimationFrame = null;
let bioAnimationRunning = false;


/* -----------------------------------------
   СОЗДАНИЕ СИГНАЛА
----------------------------------------- */

function generateBioSignal(mode, points = 950) {

  const values = [];

  let phase = 0;

  for (let i = 0; i < points; i++) {

    let speed = 0.052;

    /*
      В вариативном режиме немного изменяем
      продолжительность циклов.
    */

    if (mode === "variable") {

      speed +=
        0.007 * Math.sin(i * 0.017) +
        0.004 * Math.sin(i * 0.043);
    }

    phase += speed;

    const cycle = phase % 1;

    let value = 0;


    /* P-wave */

    if (cycle >= 0.06 && cycle < 0.14) {

      const p =
        (cycle - 0.06) / 0.08;

      value +=
        0.12 *
        Math.sin(p * Math.PI);
    }


    /* Q */

    if (cycle >= 0.20 && cycle < 0.225) {

      const p =
        (cycle - 0.20) / 0.025;

      value -=
        0.25 *
        Math.sin(p * Math.PI);
    }


    /* R */

    if (cycle >= 0.225 && cycle < 0.255) {

      const p =
        (cycle - 0.225) / 0.030;

      value +=
        1.18 *
        Math.sin(p * Math.PI);
    }


    /* S */

    if (cycle >= 0.255 && cycle < 0.30) {

      const p =
        (cycle - 0.255) / 0.045;

      value -=
        0.36 *
        Math.sin(p * Math.PI);
    }


    /* T-wave */

    if (cycle >= 0.43 && cycle < 0.62) {

      const p =
        (cycle - 0.43) / 0.19;

      value +=
        0.24 *
        Math.sin(p * Math.PI);
    }


    /*
      Для вариативного сигнала добавляем
      небольшую изменчивость формы.
    */

    if (mode === "variable") {

      value +=
        0.018 * Math.sin(i * 0.29) +
        0.010 * Math.sin(i * 0.71);
    }

    values.push(value);
  }

  return values;
}


/* -----------------------------------------
   ФОН ЭКГ
----------------------------------------- */

function drawBioGrid() {

  const width = bioCanvas.width;
  const height = bioCanvas.height;

  bioCtx.save();


  /* маленькая сетка */

  bioCtx.strokeStyle =
    "rgba(81,209,138,.055)";

  bioCtx.lineWidth = 1;

  const smallStep = 18;

  for (
    let x = 0;
    x <= width;
    x += smallStep
  ) {

    bioCtx.beginPath();
    bioCtx.moveTo(x, 0);
    bioCtx.lineTo(x, height);
    bioCtx.stroke();
  }

  for (
    let y = 0;
    y <= height;
    y += smallStep
  ) {

    bioCtx.beginPath();
    bioCtx.moveTo(0, y);
    bioCtx.lineTo(width, y);
    bioCtx.stroke();
  }


  /* крупная сетка */

  bioCtx.strokeStyle =
    "rgba(81,209,138,.11)";

  const largeStep =
    smallStep * 5;

  for (
    let x = 0;
    x <= width;
    x += largeStep
  ) {

    bioCtx.beginPath();
    bioCtx.moveTo(x, 0);
    bioCtx.lineTo(x, height);
    bioCtx.stroke();
  }

  for (
    let y = 0;
    y <= height;
    y += largeStep
  ) {

    bioCtx.beginPath();
    bioCtx.moveTo(0, y);
    bioCtx.lineTo(width, y);
    bioCtx.stroke();
  }

  bioCtx.restore();
}


/* -----------------------------------------
   ОДИН КАДР КАРДИОГРАММЫ
----------------------------------------- */

function drawBioFrame() {

  resizeCanvas(bioCanvas);

  bioCtx.clearRect(
    0,
    0,
    bioCanvas.width,
    bioCanvas.height
  );

  drawBioGrid();


  const min = -0.48;
  const max = 1.25;


  bioCtx.save();

  bioCtx.strokeStyle =
    "#51d18a";

  bioCtx.lineWidth = 2.3;

  bioCtx.lineJoin = "round";
  bioCtx.lineCap = "round";

  bioCtx.shadowColor =
    "rgba(81,209,138,.45)";

  bioCtx.shadowBlur = 7;

  bioCtx.beginPath();


  const visibleCount =
    Math.min(
      bioDrawIndex,
      bioSignal.length
    );


  for (
    let index = 0;
    index < visibleCount;
    index++
  ) {

    const value =
      bioSignal[index];

    const x =
      20 +
      index /
      (bioSignal.length - 1) *
      (bioCanvas.width - 40);


    const normalized =
      (value - min) /
      (max - min);


    const y =
      bioCanvas.height -
      25 -
      normalized *
      (bioCanvas.height - 50);


    if (index === 0) {

      bioCtx.moveTo(x, y);

    } else {

      bioCtx.lineTo(x, y);
    }
  }

  bioCtx.stroke();
  bioCtx.restore();


  /*
    Светящаяся точка на конце текущей линии.
  */

  if (
    visibleCount > 1 &&
    visibleCount <= bioSignal.length
  ) {

    const index =
      visibleCount - 1;

    const value =
      bioSignal[index];

    const x =
      20 +
      index /
      (bioSignal.length - 1) *
      (bioCanvas.width - 40);

    const normalized =
      (value - min) /
      (max - min);

    const y =
      bioCanvas.height -
      25 -
      normalized *
      (bioCanvas.height - 50);


    bioCtx.save();

    bioCtx.fillStyle =
      "#51d18a";

    bioCtx.shadowColor =
      "#51d18a";

    bioCtx.shadowBlur = 12;

    bioCtx.beginPath();

    bioCtx.arc(
      x,
      y,
      3.5,
      0,
      Math.PI * 2
    );

    bioCtx.fill();

    bioCtx.restore();
  }
}


/* -----------------------------------------
   АНИМАЦИЯ
----------------------------------------- */

function bioAnimationLoop() {

  if (!bioAnimationRunning) {
    return;
  }

  drawBioFrame();

  /*
    Скорость рисования линии.
  */

  bioDrawIndex += 4;

  if (
    bioDrawIndex >
    bioSignal.length
  ) {

    /*
      Небольшая пауза после окончания,
      затем кардиограмма начинается снова.
    */

    bioAnimationRunning = false;

    setTimeout(() => {

      if (
        !document
          .getElementById(
            "application-bio"
          )
          .hidden
      ) {

        startBioAnimation();
      }

    }, 700);

    return;
  }

  bioAnimationFrame =
    requestAnimationFrame(
      bioAnimationLoop
    );
}


/* -----------------------------------------
   ЗАПУСК
----------------------------------------- */

function startBioAnimation() {

  stopBioAnimation();

  resizeCanvas(bioCanvas);

  bioSignal =
    generateBioSignal(
      bioMode
    );

  bioDrawIndex = 1;

  bioAnimationRunning = true;

  bioAnimationLoop();
}


/* -----------------------------------------
   ПАУЗА
----------------------------------------- */

function stopBioAnimation() {

  bioAnimationRunning = false;

  if (bioAnimationFrame) {

    cancelAnimationFrame(
      bioAnimationFrame
    );

    bioAnimationFrame = null;
  }
}


/* -----------------------------------------
   СТАТИЧЕСКИЙ ПЕРВЫЙ КАДР
----------------------------------------- */

function prepareBioPreview() {

  resizeCanvas(bioCanvas);

  bioSignal =
    generateBioSignal(
      bioMode
    );

  /*
    При загрузке уже показываем начало линии,
    чтобы canvas никогда не был пустым.
  */

  bioDrawIndex =
    Math.floor(
      bioSignal.length * 0.28
    );

  drawBioFrame();
}


/* -----------------------------------------
   ТЕКСТ
----------------------------------------- */

function updateBioExplanation() {

  if (bioMode === "regular") {

    bioState.textContent =
      "Почти регулярный сигнал";

    bioDescription.textContent =
      "Основные пики появляются через почти одинаковые интервалы.";

  } else {

    bioState.textContent =
      "Вариативный сигнал";

    bioDescription.textContent =
      "Интервалы между пиками изменяются, хотя узнаваемая структура ритма сохраняется.";
  }
}


/* -----------------------------------------
   КНОПКИ
----------------------------------------- */

signalButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      bioMode =
        button.dataset.mode;

      signalButtons.forEach(
        item => {

          item.classList.toggle(
            "active",
            item === button
          );
        }
      );

      updateBioExplanation();

      startBioAnimation();
    }
  );
});


/* первая подготовка */

updateBioExplanation();
prepareBioPreview();

/* =========================================================
   3. КРИПТОГРАФИЯ — ПОШАГОВЫЙ ЭКСПЕРИМЕНТ
========================================================= */

const cryptoKeyInput =
  document.getElementById("crypto-key");

const passwordLengthControl =
  document.getElementById("password-length-control");

const passwordLengthValue =
  document.getElementById("password-length-value");

const useUppercase =
  document.getElementById("use-uppercase");

const useLowercase =
  document.getElementById("use-lowercase");

const useNumbers =
  document.getElementById("use-numbers");

const useSymbols =
  document.getElementById("use-symbols");

const cryptoGenerateA =
  document.getElementById("crypto-generate-a");

const cryptoNudgeKey =
  document.getElementById("crypto-nudge-key");

const cryptoGenerateB =
  document.getElementById("crypto-generate-b");

const cryptoReset =
  document.getElementById("crypto-reset");

const passwordA =
  document.getElementById("password-a");

const passwordB =
  document.getElementById("password-b");

const cryptoKeyA =
  document.getElementById("crypto-key-a");

const cryptoKeyB =
  document.getElementById("crypto-key-b");

const passwordDifferenceBar =
  document.getElementById("password-difference-bar");

const passwordDifferenceValue =
  document.getElementById("password-difference-value");

const passwordLengthDisplay =
  document.getElementById("password-length");

const passwordAlphabet =
  document.getElementById("password-alphabet");

const passwordEntropy =
  document.getElementById("password-entropy");

const passwordStrength =
  document.getElementById("password-strength");

const copyPasswordA =
  document.getElementById("copy-password-a");

const copyPasswordB =
  document.getElementById("copy-password-b");

const cryptoStatus =
  document.getElementById("crypto-status");

const cryptoStatusText =
  document.getElementById("crypto-status-text");

const cryptoStep1 =
  document.getElementById("crypto-step-1");

const cryptoStep2 =
  document.getElementById("crypto-step-2");

const cryptoStep3 =
  document.getElementById("crypto-step-3");

const cryptoStep4 =
  document.getElementById("crypto-step-4");

const UPPERCASE =
  "ABCDEFGHJKLMNPQRSTUVWXYZ";

const LOWERCASE =
  "abcdefghijkmnopqrstuvwxyz";

const NUMBERS =
  "23456789";

const SYMBOLS =
  "!@#$%&*+-=?";

let passwordAValue = "";
let passwordBValue = "";

let keyAValue = null;
let keyBValue = null;

function buildAlphabet() {
  let alphabet = "";

  if (useUppercase.checked) alphabet += UPPERCASE;
  if (useLowercase.checked) alphabet += LOWERCASE;
  if (useNumbers.checked) alphabet += NUMBERS;
  if (useSymbols.checked) alphabet += SYMBOLS;

  if (!alphabet.length) {
    useLowercase.checked = true;
    alphabet = LOWERCASE;
  }

  return alphabet;
}

function normalizeSeed(value) {
  let seed = Number(value);

  if (!Number.isFinite(seed)) seed = 0.2;
  if (seed <= 0) seed = 0.2;
  if (seed >= 1) seed = 0.2;

  return seed;
}

function chaoticValues(seed, count) {
  let x = seed;
  const values = [];

  for (let i = 0; i < count + 40; i++) {
    x = 4 * x * (1 - x);

    if (i >= 40) {
      values.push(x);
    }
  }

  return values;
}

function passwordFromSeed(seed, length, alphabet) {
  const values = chaoticValues(seed, length);

  return values.map(value => {
    const index =
      Math.floor(value * alphabet.length) % alphabet.length;
    return alphabet[index];
  }).join("");
}

function hammingDifference(a, b) {
  const length = Math.max(a.length, b.length);
  if (!length) return 0;

  let different = 0;

  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) different++;
  }

  return different / length;
}

function entropyEstimate(length, alphabetSize) {
  if (length <= 0 || alphabetSize <= 1) return 0;
  return length * Math.log2(alphabetSize);
}

function strengthLabel(bits) {
  if (bits < 45) return "Низкая";
  if (bits < 65) return "Средняя";
  if (bits < 90) return "Высокая";
  return "Очень высокая";
}

function setCryptoStatus(title, text) {
  cryptoStatus.textContent = title;
  cryptoStatusText.textContent = text;
}

function updateCryptoSteps(activeStep = 1, doneSteps = []) {
  [cryptoStep1, cryptoStep2, cryptoStep3, cryptoStep4].forEach((step, index) => {
    const number = index + 1;

    step.classList.remove("active", "done");

    if (doneSteps.includes(number)) {
      step.classList.add("done");
    }

    if (number === activeStep) {
      step.classList.add("active");
    }
  });
}

function createPasswordSlots(container, length) {
  container.innerHTML = "";

  for (let i = 0; i < length; i++) {
    const slot = document.createElement("span");
    slot.className = "password-slot";
    slot.textContent = "•";
    container.appendChild(slot);
  }
}

function randomChar(alphabet) {
  const index = Math.floor(Math.random() * alphabet.length);
  return alphabet[index];
}

function animatePassword(container, finalPassword, alphabet) {
  createPasswordSlots(container, finalPassword.length);

  const slots = [...container.querySelectorAll(".password-slot")];

  return Promise.all(
    slots.map((slot, index) => {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          slot.textContent = randomChar(alphabet);
        }, 45);

        setTimeout(() => {
          clearInterval(interval);
          slot.textContent = finalPassword[index];
          slot.classList.add("locked");
          resolve();
        }, 260 + index * 95);
      });
    })
  );
}

function clearPasswordVisual(container) {
  container.innerHTML = "";
}

function updatePasswordMetrics(length, alphabetLength) {
  const entropy = entropyEstimate(length, alphabetLength);

  passwordLengthDisplay.textContent = String(length);
  passwordAlphabet.textContent = `${alphabetLength} символов`;
  passwordEntropy.textContent = `${entropy.toFixed(1)} бит`;
  passwordStrength.textContent = strengthLabel(entropy);
}

function clearCryptoExperiment() {
  passwordAValue = "";
  passwordBValue = "";

  keyAValue = null;
  keyBValue = null;

  cryptoKeyInput.value = "0.200000";

  passwordLengthControl.value = "16";
  passwordLengthValue.textContent = "16";

  useUppercase.checked = true;
  useLowercase.checked = true;
  useNumbers.checked = true;
  useSymbols.checked = true;

  cryptoKeyA.textContent = "Ключ A: —";
  cryptoKeyB.textContent = "Ключ B: —";

  clearPasswordVisual(passwordA);
  clearPasswordVisual(passwordB);

  passwordDifferenceBar.style.width = "0%";
  passwordDifferenceValue.textContent = "Сначала выполните эксперимент";

  passwordLengthDisplay.textContent = "—";
  passwordAlphabet.textContent = "—";
  passwordEntropy.textContent = "—";
  passwordStrength.textContent = "—";

  cryptoNudgeKey.disabled = true;
  cryptoGenerateB.disabled = true;

  updateCryptoSteps(1, []);
  setCryptoStatus(
    "Сначала создайте пароль A",
    "После генерации A можно будет изменить ключ и получить пароль B."
  );
}

async function generatePasswordAExperiment() {
  const seed = normalizeSeed(cryptoKeyInput.value);
  const length = Number(passwordLengthControl.value);
  const alphabet = buildAlphabet();

  passwordAValue = "";
  passwordBValue = "";
  keyAValue = seed;
  keyBValue = null;

  cryptoKeyInput.value = seed.toFixed(6);

  cryptoKeyA.textContent = `Ключ A: ${seed.toFixed(6)}`;
  cryptoKeyB.textContent = "Ключ B: —";

  clearPasswordVisual(passwordB);
  passwordDifferenceBar.style.width = "0%";
  passwordDifferenceValue.textContent = "Сначала измените ключ и создайте пароль B";

  updatePasswordMetrics(length, alphabet.length);

  setCryptoStatus(
    "Генерация пароля A...",
    "Наблюдайте, как символы постепенно фиксируются."
  );

  updateCryptoSteps(1, []);

  passwordAValue = passwordFromSeed(seed, length, alphabet);

  await animatePassword(passwordA, passwordAValue, alphabet);

  cryptoNudgeKey.disabled = false;
  cryptoGenerateB.disabled = false;

  updateCryptoSteps(2, [1]);

  setCryptoStatus(
    "Пароль A готов",
    "Теперь увеличьте ключ на 0.000001 и затем создайте пароль B."
  );
}

function nudgeKeyExperiment() {
  if (!passwordAValue || keyAValue === null) {
    setCryptoStatus(
      "Сначала создайте пароль A",
      "Только после этого имеет смысл менять ключ."
    );
    return;
  }

  let nudged = keyAValue + 0.000001;

  if (nudged >= 1) {
    nudged = keyAValue - 0.000001;
  }

  nudged = Number(nudged.toFixed(6));

  cryptoKeyInput.value = nudged.toFixed(6);

  updateCryptoSteps(3, [1, 2]);

  setCryptoStatus(
    "Ключ изменён",
    "Теперь создайте пароль B и сравните результат."
  );
}

async function generatePasswordBExperiment() {
  if (!passwordAValue) {
    setCryptoStatus(
      "Сначала создайте пароль A",
      "Нужно выполнить первый шаг эксперимента."
    );
    return;
  }

  const seed = normalizeSeed(cryptoKeyInput.value);
  const length = Number(passwordLengthControl.value);
  const alphabet = buildAlphabet();

  keyBValue = seed;
  cryptoKeyB.textContent = `Ключ B: ${seed.toFixed(6)}`;

  setCryptoStatus(
    "Генерация пароля B...",
    "Проверьте, насколько изменится результат после маленького сдвига ключа."
  );

  updatePasswordMetrics(length, alphabet.length);

  passwordBValue = passwordFromSeed(seed, length, alphabet);

  await animatePassword(passwordB, passwordBValue, alphabet);

  const difference = hammingDifference(passwordAValue, passwordBValue);
  const differencePercent = Math.round(difference * 100);

  passwordDifferenceBar.style.width = `${differencePercent}%`;
  passwordDifferenceValue.textContent =
    `${differencePercent}% символов различаются`;

  updateCryptoSteps(4, [1, 2, 3]);

  setCryptoStatus(
    "Сравнение завершено",
    "Даже очень маленькое изменение исходного ключа может привести к заметно другому паролю."
  );
}

passwordLengthControl.addEventListener("input", () => {
  passwordLengthValue.textContent = passwordLengthControl.value;
});

cryptoGenerateA.addEventListener("click", generatePasswordAExperiment);
cryptoNudgeKey.addEventListener("click", nudgeKeyExperiment);
cryptoGenerateB.addEventListener("click", generatePasswordBExperiment);

cryptoReset.addEventListener("click", () => {
  clearCryptoExperiment();
});

async function copyPasswordText(value, button) {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);

    const original = button.textContent;
    button.textContent = "Скопировано";

    setTimeout(() => {
      button.textContent = original;
    }, 1200);

  } catch {
    button.textContent = "Не удалось";

    setTimeout(() => {
      button.textContent = "Копировать";
    }, 1200);
  }
}

copyPasswordA.addEventListener("click", () => {
  copyPasswordText(passwordAValue, copyPasswordA);
});

copyPasswordB.addEventListener("click", () => {
  copyPasswordText(passwordBValue, copyPasswordB);
});

/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    const activePanel =
      document.querySelector(
        ".application-lab:not([hidden])"
      );

    if (!activePanel) {
      return;
    }

    const name =
      activePanel.dataset.panel;


    if (name === "weather") {

      createWeatherParticles();
      drawWeatherFrame();
    }


    if (name === "bio") {

      startBioAnimation();
    }
  }
);


/* =========================================================
   СТАРТ
========================================================= */

resetWeather();
prepareBioPreview();
clearCryptoExperiment();
switchApplication("weather");