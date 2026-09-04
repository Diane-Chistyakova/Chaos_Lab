const canvas = document.getElementById("mandelbrot-canvas");
const ctx = canvas.getContext("2d");

const zoomValue = document.getElementById("zoom-value");
const centerXLabel = document.getElementById("center-x");
const centerYLabel = document.getElementById("center-y");

const iterationsInput = document.getElementById("iterations");
const iterationsValue = document.getElementById("iterations-value");

const renderButton = document.getElementById("fractal-render");
const resetButton = document.getElementById("fractal-reset");

let centerX = -0.5;
let centerY = 0;
let scale = 3.2;
let initialScale = 3.2;

let dragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let sigmaZoomHintShown = false;

const presets = {
  main: {
    x: -0.5,
    y: 0,
    scale: 3.2
  },

  seahorse: {
    x: -0.743643887037151,
    y: 0.13182590420533,
    scale: 0.015
  },

  spiral: {
    x: -0.761574,
    y: -0.0847596,
    scale: 0.02
  },

  mini: {
    x: -1.754877666246693,
    y: 0,
    scale: 0.06
  }
};

function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();

  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  if(canvas.width !== width || canvas.height !== height){
    canvas.width = width;
    canvas.height = height;
  }
}

function getMaxIterations(){
  return Number(iterationsInput.value);
}

function screenToComplex(px, py){
  const aspect = canvas.width / canvas.height;

  const real =
    centerX +
    (px / canvas.width - 0.5) *
    scale *
    aspect;

  const imaginary =
    centerY +
    (py / canvas.height - 0.5) *
    scale;

  return {
    x: real,
    y: imaginary
  };
}

function getColor(iteration, maxIterations, zx, zy){
  if(iteration >= maxIterations){
    return [5, 14, 20];
  }

  const magnitude = Math.sqrt(zx * zx + zy * zy);

  let smooth =
    iteration +
    1 -
    Math.log2(
      Math.log2(
        Math.max(magnitude, 2)
      )
    );

  smooth = Math.max(0, smooth);

  const t = smooth / maxIterations;

  const r = Math.floor(20 + 40 * t);
  const g = Math.floor(80 + 180 * Math.sqrt(t));
  const b = Math.floor(110 + 140 * (1 - t * 0.4));

  return [r, g, b];
}

function renderMandelbrot(){
  resizeCanvas();

  const width = canvas.width;
  const height = canvas.height;

  const image = ctx.createImageData(width, height);
  const data = image.data;

  const maxIterations = getMaxIterations();
  const aspect = width / height;

  for(let py = 0; py < height; py++){

    const cy =
      centerY +
      (py / height - 0.5) *
      scale;

    for(let px = 0; px < width; px++){

      const cx =
        centerX +
        (px / width - 0.5) *
        scale *
        aspect;

      let zx = 0;
      let zy = 0;
      let iteration = 0;

      while(
        zx * zx + zy * zy <= 4 &&
        iteration < maxIterations
      ){
        const newZx =
          zx * zx -
          zy * zy +
          cx;

        zy =
          2 * zx * zy +
          cy;

        zx = newZx;
        iteration++;
      }

      const [r, g, b] =
        getColor(
          iteration,
          maxIterations,
          zx,
          zy
        );

      const index =
        (py * width + px) * 4;

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);

  updateLabels();
}

function updateLabels(){

  const zoom =
    initialScale / scale;

  zoomValue.textContent =
    `×${formatZoom(zoom)}`;

  centerXLabel.textContent =
    centerX.toFixed(6);

  centerYLabel.textContent =
    centerY.toFixed(6);
}

function formatZoom(value){

  if(value < 10){
    return value.toFixed(1);
  }

  if(value < 1000){
    return Math.round(value);
  }

  return value.toExponential(1);
}

canvas.addEventListener(
  "wheel",
  (event) => {

    event.preventDefault();

    const rect =
      canvas.getBoundingClientRect();

    const mouseX =
      event.clientX - rect.left;

    const mouseY =
      event.clientY - rect.top;

    const before =
      screenToComplex(
        mouseX,
        mouseY
      );

    const zoomFactor =
      event.deltaY < 0
        ? 0.75
        : 1.333333;

    scale *= zoomFactor;

    scale =
      Math.max(
        0.000001,
        Math.min(
          scale,
          4
        )
      );

    const after =
      screenToComplex(
        mouseX,
        mouseY
      );

    centerX +=
      before.x -
      after.x;

    centerY +=
      before.y -
      after.y;

    renderMandelbrot();
	
	if(!sigmaZoomHintShown){
  sigmaZoomHintShown = true;

  if(window.LabAssist && window.LabAssist.enabled()){
    window.LabAssist.show('zoom');
  }else{
    window.addEventListener(
      'assistant-ready',
      () => window.LabAssist?.show('zoom'),
      {once:true}
    );
  }
}
  },
  { passive:false }
);

canvas.addEventListener(
  "mousedown",
  (event) => {

    dragging = true;

    lastMouseX =
      event.clientX;

    lastMouseY =
      event.clientY;
  }
);

window.addEventListener(
  "mousemove",
  (event) => {

    if(!dragging){
      return;
    }

    const dx =
      event.clientX -
      lastMouseX;

    const dy =
      event.clientY -
      lastMouseY;

    lastMouseX =
      event.clientX;

    lastMouseY =
      event.clientY;

    const aspect =
      canvas.width /
      canvas.height;

    centerX -=
      dx /
      canvas.width *
      scale *
      aspect;

    centerY -=
      dy /
      canvas.height *
      scale;

    renderMandelbrot();
  }
);

window.addEventListener(
  "mouseup",
  () => {

    dragging = false;
  }
);

iterationsInput.addEventListener(
  "input",
  () => {

    iterationsValue.textContent =
      iterationsInput.value;
  }
);

iterationsInput.addEventListener(
  "change",
  renderMandelbrot
);

renderButton.addEventListener(
  "click",
  renderMandelbrot
);

resetButton.addEventListener(
  "click",
  () => {

    centerX = -0.5;
    centerY = 0;
    scale = initialScale;

    iterationsInput.value = 150;
    iterationsValue.textContent = "150";

    renderMandelbrot();
  }
);

document
  .querySelectorAll(".preset-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const preset =
          presets[
            button.dataset.preset
          ];

        if(!preset){
          return;
        }

        centerX =
          preset.x;

        centerY =
          preset.y;

        scale =
          preset.scale;

        renderMandelbrot();
      }
    );
  });

window.addEventListener(
  "resize",
  renderMandelbrot
);

renderMandelbrot();
function renderPreview(canvasId, centerX, centerY, scale, maxIterations = 120){

  const previewCanvas = document.getElementById(canvasId);

  if(!previewCanvas){
    return;
  }

  const previewCtx = previewCanvas.getContext("2d");

  const rect = previewCanvas.getBoundingClientRect();

  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  previewCanvas.width = width;
  previewCanvas.height = height;

  const image = previewCtx.createImageData(width, height);
  const data = image.data;

  const aspect = width / height;

  for(let py = 0; py < height; py++){

    const cy =
      centerY +
      (py / height - 0.5) *
      scale;

    for(let px = 0; px < width; px++){

      const cx =
        centerX +
        (px / width - 0.5) *
        scale *
        aspect;

      let zx = 0;
      let zy = 0;
      let iteration = 0;

      while(
        zx * zx + zy * zy <= 4 &&
        iteration < maxIterations
      ){
        const nextX =
          zx * zx -
          zy * zy +
          cx;

        zy =
          2 * zx * zy +
          cy;

        zx = nextX;

        iteration++;
      }

      const [r, g, b] =
        getColor(
          iteration,
          maxIterations,
          zx,
          zy
        );

      const index =
        (py * width + px) * 4;

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  previewCtx.putImageData(image, 0, 0);
}

function renderScalePreviews(){

  renderPreview(
    "fractal-preview-1",
    -0.5,
    0,
    3.2,
    100
  );

  renderPreview(
    "fractal-preview-50",
    -0.743643887037151,
    0.13182590420533,
    0.064,
    140
  );

  renderPreview(
    "fractal-preview-2500",
    -0.743643887037151,
    0.13182590420533,
    0.00128,
    200
  );
}

renderScalePreviews();

window.addEventListener(
  "resize",
  renderScalePreviews
);
