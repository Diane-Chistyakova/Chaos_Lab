/* =========================================================
   ПЕРЕКЛЮЧЕНИЕ ТРЁХ ЭКСПЕРИМЕНТОВ
========================================================= */

const experimentTabs = document.querySelectorAll(".experiment-tab");
const experimentPanels = document.querySelectorAll(".experiment-panel");

experimentTabs.forEach(tab => {
  tab.addEventListener("click", () => {

    const name = tab.dataset.experiment;

    experimentTabs.forEach(item => {
      const active = item === tab;

      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });

    experimentPanels.forEach(panel => {
      panel.hidden = panel.dataset.panel !== name;
    });

    const panel = document.querySelector(
      `.experiment-panel[data-panel="${name}"]`
    );

    if(panel){
      setTimeout(() => {
        panel.scrollIntoView({
          behavior:"smooth",
          block:"start"
        });

        if(name === "feigenbaum"){
          drawFeigenbaumChart();
        }

        if(name === "lorenz-map"){
          drawLorenzMap();
          analyseLorenz();
        }

        if(name === "window"){
          drawWindowBifurcation();
          analyseWindow();
        }

      },50);
    }
  });
});


/* =========================================================
   ОБЩИЕ ФУНКЦИИ CANVAS
========================================================= */

function setupCanvas(canvas,ctx){

  const box = canvas.getBoundingClientRect();

  const ratio = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  canvas.width = Math.max(
    1,
    Math.round(box.width * ratio)
  );

  canvas.height = Math.max(
    1,
    Math.round(box.height * ratio)
  );

  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );

  return {
    width:box.width,
    height:box.height
  };
}


function logistic(x,r){
  return r * x * (1 - x);
}


function lyapunov(r,start=0.2){

  let x = start;
  let sum = 0;

  const discard = 1500;
  const count = 6000;

  for(let i=0;i<discard+count;i++){

    x = logistic(x,r);

    if(i >= discard){

      const derivative =
        Math.abs(r * (1 - 2*x));

      sum += Math.log(
        Math.max(derivative,1e-14)
      );
    }
  }

  return sum / count;
}


function findPeriod(r,start=0.2){

  let x = start;

  for(let i=0;i<4000;i++){
    x = logistic(x,r);
  }

  const tail = [];

  for(let i=0;i<180;i++){
    x = logistic(x,r);
    tail.push(x);
  }

  for(let period=1;period<=24;period++){

    let ok = true;

    for(let i=period;i<tail.length;i++){

      if(
        Math.abs(
          tail[i] -
          tail[i-period]
        ) > 1e-7
      ){
        ok = false;
        break;
      }
    }

    if(ok){
      return period;
    }
  }

  return null;
}


/* =========================================================
   01 — ЧИСЛО ФЕЙГЕНБАУМА
========================================================= */

const feigenbaumCanvas =
  document.getElementById("feigenbaum-chart");

const feigenbaumCtx =
  feigenbaumCanvas.getContext("2d");

const feigenbaumPoints = [];

const feigenbaumLabels = [
  document.getElementById("feigenbaum-r1"),
  document.getElementById("feigenbaum-r2"),
  document.getElementById("feigenbaum-r3"),
  document.getElementById("feigenbaum-r4")
];

const feigenbaumValue =
  document.getElementById("feigenbaum-value");

const feigenbaumDescription =
  document.getElementById("feigenbaum-description");

const journalFeigenbaum =
  document.getElementById("journal-feigenbaum");

const feigenbaumFullRange = {
  min:2.5,
  max:4.0
};

let feigenbaumRange = {
  ...feigenbaumFullRange
};


/*
  Участки, которые будем последовательно увеличивать.

  Они соответствуют областям,
  где находятся следующие бифуркации.
*/

const feigenbaumZoomRanges = [

  {
    min:2.90,
    max:3.10,
    label:"Поиск r₁ · переход 1 → 2"
  },

  {
    min:3.38,
    max:3.50,
    label:"Поиск r₂ · переход 2 → 4"
  },

  {
    min:3.515,
    max:3.558,
    label:"Поиск r₃ · переход 4 → 8"
  },

  {
    min:3.548,
    max:3.570,
    label:"Поиск r₄ · переход 8 → 16"
  }

];


const feigenbaumRangeLabel =
  document.getElementById(
    "feigenbaum-range-label"
  );

const feigenbaumZoomNext =
  document.getElementById(
    "feigenbaum-zoom-next"
  );

const feigenbaumFullView =
  document.getElementById(
    "feigenbaum-full-view"
  );


function drawFeigenbaumChart(){

  const {width,height} =
    setupCanvas(
      feigenbaumCanvas,
      feigenbaumCtx
    );


  const p = {
    left:52,
    right:18,
    top:20,
    bottom:44
  };


  const plotWidth =
    width -
    p.left -
    p.right;


  const plotHeight =
    height -
    p.top -
    p.bottom;


  const X = r =>
    p.left +
    plotWidth *
    (
      r -
      feigenbaumRange.min
    ) /
    (
      feigenbaumRange.max -
      feigenbaumRange.min
    );


  const Y = value =>
    p.top +
    plotHeight *
    (1-value);


  feigenbaumCtx.clearRect(
    0,
    0,
    width,
    height
  );


  /* =====================================
     ГОРИЗОНТАЛЬНАЯ СЕТКА
  ===================================== */

  feigenbaumCtx.strokeStyle =
    "#203746";

  feigenbaumCtx.lineWidth = 1;

  feigenbaumCtx.font =
    "11px Segoe UI, sans-serif";


  for(let i=0;i<=4;i++){

    const value =
      1-i/4;

    const y =
      Y(value);


    feigenbaumCtx.beginPath();

    feigenbaumCtx.moveTo(
      p.left,
      y
    );

    feigenbaumCtx.lineTo(
      width-p.right,
      y
    );

    feigenbaumCtx.stroke();


    feigenbaumCtx.fillStyle =
      "#78909d";

    feigenbaumCtx.fillText(
      value.toFixed(2),
      7,
      y+4
    );

  }


  /* =====================================
     ВЕРТИКАЛЬНАЯ СЕТКА И ШКАЛА r
  ===================================== */

  const tickCount = 6;


  for(let i=0;i<=tickCount;i++){

    const r =
      feigenbaumRange.min +
      (
        feigenbaumRange.max -
        feigenbaumRange.min
      ) *
      i /
      tickCount;


    const x =
      X(r);


    feigenbaumCtx.strokeStyle =
      "rgba(32,55,70,.45)";


    feigenbaumCtx.beginPath();

    feigenbaumCtx.moveTo(
      x,
      p.top
    );

    feigenbaumCtx.lineTo(
      x,
      height-p.bottom
    );

    feigenbaumCtx.stroke();


    feigenbaumCtx.fillStyle =
      "#78909d";


    /*
      При сильном увеличении показываем
      больше знаков после запятой.
    */

    const rangeSize =
      feigenbaumRange.max -
      feigenbaumRange.min;


    const digits =
      rangeSize < 0.05
        ? 4
        : rangeSize < 0.3
          ? 3
          : 2;


    feigenbaumCtx.fillText(
      r.toFixed(digits),
      x-15,
      height-15
    );

  }


  /* =====================================
     БИФУРКАЦИОННАЯ ДИАГРАММА
  ===================================== */

  const columns =
    Math.max(
      1000,
      Math.floor(
        plotWidth * 2
      )
    );


  feigenbaumCtx.fillStyle =
    "rgba(66,213,208,.72)";


  for(
    let column=0;
    column<columns;
    column++
  ){

    const r =
      feigenbaumRange.min +
      (
        feigenbaumRange.max -
        feigenbaumRange.min
      ) *
      column /
      (columns-1);


    let value = 0.5;


    /*
      Сначала пропускаем переходный участок.
    */

    for(let i=0;i<800;i++){

      value =
        logistic(
          value,
          r
        );

    }


    /*
      Потом наносим установившиеся значения.
    */

    for(let i=0;i<110;i++){

      value =
        logistic(
          value,
          r
        );


      feigenbaumCtx.fillRect(
        X(r),
        Y(value),
        .75,
        .75
      );

    }

  }


  /* =====================================
     ВЫБРАННЫЕ ПОЛЬЗОВАТЕЛЕМ r₁-r₄
  ===================================== */

  feigenbaumPoints.forEach(
    (r,index) => {


      /*
        Если ранее выбранная точка
        находится за пределами текущего зума,
        её сейчас не рисуем.
      */

      if(
        r < feigenbaumRange.min ||
        r > feigenbaumRange.max
      ){
        return;
      }


      const x =
        X(r);


      feigenbaumCtx.strokeStyle =
        "#ff735d";

      feigenbaumCtx.lineWidth =
        1.8;


      feigenbaumCtx.beginPath();

      feigenbaumCtx.moveTo(
        x,
        p.top
      );

      feigenbaumCtx.lineTo(
        x,
        height-p.bottom
      );

      feigenbaumCtx.stroke();


      feigenbaumCtx.fillStyle =
        "#ff735d";

      feigenbaumCtx.font =
        "700 12px Segoe UI, sans-serif";


      feigenbaumCtx.fillText(
        `r${index+1}`,
        x+5,
        p.top+16
      );

    }
  );


  /* =====================================
     ПОДПИСИ ОСЕЙ
  ===================================== */

  feigenbaumCtx.fillStyle =
    "#91a8b6";

  feigenbaumCtx.font =
    "12px Segoe UI, sans-serif";


  feigenbaumCtx.fillText(
    "x",
    12,
    17
  );


  feigenbaumCtx.fillText(
    "r",
    width-20,
    height-10
  );

}


function updateFeigenbaumResult(){

  feigenbaumLabels.forEach(
    (label,index) => {

      label.textContent =
        feigenbaumPoints[index] !== undefined
          ? feigenbaumPoints[index].toFixed(6)
          : "—";
    }
  );


  if(feigenbaumPoints.length < 4){

    feigenbaumValue.textContent =
      "—";

    feigenbaumDescription.textContent =
      `Отмечено точек: ${feigenbaumPoints.length} из 4.`;

    return;
  }


  const [r1,r2,r3,r4] =
    feigenbaumPoints;


  const delta1 =
    (r2-r1)/(r3-r2);

  const delta2 =
    (r3-r2)/(r4-r3);


  const result =
    (delta1+delta2)/2;


  feigenbaumValue.textContent =
    result.toFixed(3);


  const error =
    Math.abs(
      result-4.669201609
    ) /
    4.669201609 *
    100;


  feigenbaumDescription.textContent =
    `δ₁ = ${delta1.toFixed(3)}, δ₂ = ${delta2.toFixed(3)} · ошибка около ${error.toFixed(1)}%.`;


  journalFeigenbaum.textContent =
  `δ ≈ ${result.toFixed(3)} · ошибка ${error.toFixed(1)}% · теоретическое значение 4,669.`;
}


feigenbaumCanvas.addEventListener(
  "click",
  event => {

    if(feigenbaumPoints.length >= 4){

      feigenbaumDescription.textContent =
        "Все четыре точки уже отмечены. Можно отменить последнюю или начать заново.";

      return;
    }


    const rect =
      feigenbaumCanvas.getBoundingClientRect();


    const paddingLeft = 52;
    const paddingRight = 18;


    const usableWidth =
      rect.width -
      paddingLeft -
      paddingRight;


    let mouseX =
      event.clientX -
      rect.left -
      paddingLeft;


    /*
      Не даём клику выйти за область графика.
    */

    mouseX =
      Math.max(
        0,
        Math.min(
          usableWidth,
          mouseX
        )
      );


    /*
      Переводим координату мыши
      в значение параметра r
      текущего масштаба.
    */

    const r =
      feigenbaumRange.min +
      mouseX /
      usableWidth *
      (
        feigenbaumRange.max -
        feigenbaumRange.min
      );


    /*
      Точки должны идти слева направо.
    */

    if(
      feigenbaumPoints.length > 0 &&
      r <=
      feigenbaumPoints[
        feigenbaumPoints.length-1
      ]
    ){

      feigenbaumDescription.textContent =
        "Следующая бифуркация должна находиться правее предыдущей.";

      return;
    }


    feigenbaumPoints.push(r);


    updateFeigenbaumResult();

    drawFeigenbaumChart();


    /*
      После выбора точки подготавливаем
      кнопку к поиску следующей.
    */

    if(feigenbaumPoints.length < 4){

      feigenbaumZoomNext.textContent =
        "Увеличить следующий участок";

    }else{

      feigenbaumZoomNext.textContent =
        "Все точки отмечены ✓";

    }

  }
);

/* =========================================================
   ЗУМ ДЛЯ ПОИСКА БИФУРКАЦИЙ
========================================================= */

function zoomToNextBifurcation(){

  const index =
    Math.min(
      feigenbaumPoints.length,
      feigenbaumZoomRanges.length-1
    );


  /*
    Если уже выбраны все четыре точки,
    возвращаем общий вид.
  */

  if(feigenbaumPoints.length >= 4){

    feigenbaumRange = {
      ...feigenbaumFullRange
    };


    feigenbaumRangeLabel.textContent =
      "Общий вид · r = 2.50–4.00";


    feigenbaumZoomNext.textContent =
      "Увеличить следующий участок";


    drawFeigenbaumChart();

    return;
  }


  const zoom =
    feigenbaumZoomRanges[index];


  feigenbaumRange = {
    min:zoom.min,
    max:zoom.max
  };


  feigenbaumRangeLabel.textContent =
    `${zoom.label} · r = ${zoom.min}–${zoom.max}`;


  drawFeigenbaumChart();

}


/*
  Возврат к полной диаграмме.
*/

function showFullFeigenbaumView(){

  feigenbaumRange = {
    ...feigenbaumFullRange
  };


  feigenbaumRangeLabel.textContent =
    "Общий вид · r = 2.50–4.00";


  drawFeigenbaumChart();

}


feigenbaumZoomNext.addEventListener(
  "click",
  zoomToNextBifurcation
);


feigenbaumFullView.addEventListener(
  "click",
  showFullFeigenbaumView
);

document
  .getElementById("feigenbaum-undo")
  .addEventListener(
    "click",
    () => {

      feigenbaumPoints.pop();

      updateFeigenbaumResult();
      drawFeigenbaumChart();
    }
  );


document
  .getElementById("feigenbaum-reset")
  .addEventListener(
    "click",
    () => {

      feigenbaumPoints.length = 0;


      feigenbaumRange = {
        ...feigenbaumFullRange
      };


      feigenbaumRangeLabel.textContent =
        "Общий вид · r = 2.50–4.00";


      feigenbaumZoomNext.textContent =
        "Увеличить следующий участок";


      journalFeigenbaum.textContent =
        "Измерение ещё не выполнено.";


      updateFeigenbaumResult();

      drawFeigenbaumChart();

    }
  );


/* =========================================================
   02 — КАРТА РЕЖИМОВ ЛОРЕНЦА
========================================================= */

const lorenzMap =
  document.getElementById(
    "lorenz-map-chart"
  );

const lorenzMapCtx =
  lorenzMap.getContext("2d");


const lorenzPreview =
  document.getElementById(
    "lorenz-preview"
  );

const lorenzPreviewCtx =
  lorenzPreview.getContext("2d");


const rhoInput =
  document.getElementById(
    "lorenz-rho"
  );

const rhoValue =
  document.getElementById(
    "lorenz-rho-value"
  );


const lorenzMode =
  document.getElementById(
    "lorenz-mode"
  );

const lorenzDescription =
  document.getElementById(
    "lorenz-mode-description"
  );


const lorenzDivergence =
  document.getElementById(
    "lorenz-divergence"
  );

const lorenzSensitivity =
  document.getElementById(
    "lorenz-sensitivity"
  );


const journalLorenz =
  document.getElementById(
    "journal-lorenz"
  );

const lorenzSaveA =
  document.getElementById(
    "lorenz-save-a"
  );

const lorenzSaveB =
  document.getElementById(
    "lorenz-save-b"
  );

const lorenzSaveNote =
  document.getElementById(
    "lorenz-save-note"
  );

const lorenzComparison =
  document.getElementById(
    "lorenz-comparison"
  );

const lorenzComparisonConclusion =
  document.getElementById(
    "lorenz-comparison-conclusion"
  );


let lastLorenzAnalysis = null;

let lorenzStateA = null;
let lorenzStateB = null;

/* ---------------------------------------------------------
   УРАВНЕНИЯ ЛОРЕНЦА
--------------------------------------------------------- */

function lorenzDerivative(
  point,
  rho
){

  const sigma = 10;
  const beta = 8 / 3;


  const [
    x,
    y,
    z
  ] = point;


  return [

    sigma * (y - x),

    x * (rho - z) - y,

    x * y - beta * z

  ];

}


/* ---------------------------------------------------------
   ОДИН ШАГ МЕТОДА РУНГЕ — КУТТЫ
--------------------------------------------------------- */

function lorenzStep(
  point,
  dt,
  rho
){

  const k1 =
    lorenzDerivative(
      point,
      rho
    );


  const p2 =
    point.map(
      (value,index) =>
        value +
        k1[index] *
        dt / 2
    );


  const k2 =
    lorenzDerivative(
      p2,
      rho
    );


  const p3 =
    point.map(
      (value,index) =>
        value +
        k2[index] *
        dt / 2
    );


  const k3 =
    lorenzDerivative(
      p3,
      rho
    );


  const p4 =
    point.map(
      (value,index) =>
        value +
        k3[index] *
        dt
    );


  const k4 =
    lorenzDerivative(
      p4,
      rho
    );


  return point.map(
    (value,index) =>

      value +

      dt *

      (
        k1[index] +
        2 * k2[index] +
        2 * k3[index] +
        k4[index]
      ) / 6

  );

}


/* ---------------------------------------------------------
   СОЗДАНИЕ ТРАЕКТОРИИ
--------------------------------------------------------- */

function createLorenzTrajectory(
  rho,
  count = 7000
){

  let point = [
    0.1,
    0,
    0
  ];


  const trajectory = [];


  for(
    let i=0;
    i<count;
    i++
  ){

    point =
      lorenzStep(
        point,
        0.006,
        rho
      );


    /*
      Первые точки не сохраняем:
      это переходный участок.
    */

    if(i > 900){

      trajectory.push(
        [...point]
      );

    }

  }


  return trajectory;

}


/* ---------------------------------------------------------
   РАСХОЖДЕНИЕ ДВУХ БЛИЗКИХ ТРАЕКТОРИЙ
--------------------------------------------------------- */

function measureLorenzSensitivity(
  rho
){

  let A = [
    0.1,
    0,
    0
  ];


  let B = [
    0.100001,
    0,
    0
  ];


  const initialDistance =
    Math.hypot(
      A[0]-B[0],
      A[1]-B[1],
      A[2]-B[2]
    );


  let maximumDistance =
    initialDistance;


  let firstLargeDifference =
    null;


  const dt = 0.006;


  for(
    let i=0;
    i<6500;
    i++
  ){

    A =
      lorenzStep(
        A,
        dt,
        rho
      );


    B =
      lorenzStep(
        B,
        dt,
        rho
      );


    const distance =
      Math.hypot(

        A[0]-B[0],

        A[1]-B[1],

        A[2]-B[2]

      );


    maximumDistance =
      Math.max(
        maximumDistance,
        distance
      );


    /*
      Фиксируем момент,
      когда различие стало заметным.
    */

    if(
      firstLargeDifference === null &&
      distance > 0.1
    ){

      firstLargeDifference =
        i * dt;

    }

  }


  const growth =
    maximumDistance /
    initialDistance;


  return {

    growth,

    maximumDistance,

    firstLargeDifference

  };

}


/* ---------------------------------------------------------
   ОПРЕДЕЛЕНИЕ РЕЖИМА
--------------------------------------------------------- */

function classifyLorenz(
  rho,
  sensitivity
){

  /*
    При rho < 1 начало координат
    является устойчивым состоянием.
  */

  if(rho < 1){

    return {

      kind:"stable",

      title:"Устойчивое состояние",

      description:
        "Траектория постепенно приближается к началу координат. Малое различие между двумя системами не усиливается."

    };

  }


  /*
    Для 1 < rho система обычно приходит
    к одному из ненулевых устойчивых состояний
    до потери их устойчивости.
  */

  if(
    rho < 24 &&
    sensitivity.growth < 1000
  ){

    return {

      kind:"ordered",

      title:"Упорядоченный режим",

      description:
        "После переходного процесса траектория приближается к одному из устойчивых состояний."

    };

  }


  /*
    Очень сильное расхождение двух
    близких траекторий является признаком
    чувствительности.
  */

  if(
    sensitivity.growth > 100000
  ){

    return {

      kind:"chaotic",

      title:"Высокая чувствительность",

      description:
        "Две почти одинаковые траектории заметно расходятся. Такое поведение характерно для хаотического режима системы Лоренца."

    };

  }


  return {

    kind:"transition",

    title:"Переходный или сложный режим",

    description:
      "Поведение системы уже не похоже на простое устойчивое состояние, но чувствительность выражена слабее."

  };

}


/* ---------------------------------------------------------
   РИСУЕМ КАРТУ ПО rho
--------------------------------------------------------- */

function drawLorenzMap(){

  const {
    width,
    height
  } =
    setupCanvas(
      lorenzMap,
      lorenzMapCtx
    );


  lorenzMapCtx.clearRect(
    0,
    0,
    width,
    height
  );


  const padding = {

    left:50,
    right:22,
    top:42,
    bottom:48

  };


  const plotWidth =
    width -
    padding.left -
    padding.right;


  const plotHeight =
    height -
    padding.top -
    padding.bottom;


  /* фон */

  lorenzMapCtx.fillStyle =
    "#071018";


  lorenzMapCtx.fillRect(
    padding.left,
    padding.top,
    plotWidth,
    plotHeight
  );


  /*
    Исследуем rho с шагом 1.

    Для каждого значения измеряем,
    насколько сильно расходятся
    близкие траектории.
  */

  for(
    let rho=0;
    rho<50;
    rho+=1
  ){

    const sensitivity =
      measureLorenzSensitivity(
        rho
      );


    const regime =
      classifyLorenz(
        rho,
        sensitivity
      );


    let color;


    if(regime.kind === "stable"){

      color =
        "rgba(81,209,138,.78)";

    }else if(
      regime.kind === "ordered"
    ){

      color =
        "rgba(77,163,255,.75)";

    }else if(
      regime.kind === "transition"
    ){

      color =
        "rgba(232,179,79,.78)";

    }else{

      color =
        "rgba(255,115,93,.82)";

    }


    const x1 =
      padding.left +
      plotWidth *
      rho / 50;


    const x2 =
      padding.left +
      plotWidth *
      (rho+1) / 50;


    lorenzMapCtx.fillStyle =
      color;


    lorenzMapCtx.fillRect(
      x1,
      padding.top,
      x2-x1+1,
      plotHeight
    );

  }


  /* вертикальная сетка */

  lorenzMapCtx.font =
    "11px Segoe UI, sans-serif";


  for(
    let rho=0;
    rho<=50;
    rho+=10
  ){

    const x =
      padding.left +
      plotWidth *
      rho / 50;


    lorenzMapCtx.strokeStyle =
      "rgba(32,55,70,.7)";


    lorenzMapCtx.beginPath();

    lorenzMapCtx.moveTo(
      x,
      padding.top
    );

    lorenzMapCtx.lineTo(
      x,
      padding.top +
      plotHeight
    );

    lorenzMapCtx.stroke();


    lorenzMapCtx.fillStyle =
      "#91a8b6";


    lorenzMapCtx.fillText(
      String(rho),
      x-7,
      height-18
    );

  }


  /* выбранное rho */

  const selectedRho =
    Number(
      rhoInput.value
    );


  const markerX =
    padding.left +
    plotWidth *
    selectedRho / 50;


  lorenzMapCtx.strokeStyle =
    "#eef5f7";

  lorenzMapCtx.lineWidth =
    2;


  lorenzMapCtx.beginPath();


  lorenzMapCtx.moveTo(
    markerX,
    padding.top-8
  );


  lorenzMapCtx.lineTo(
    markerX,
    padding.top +
    plotHeight +
    8
  );


  lorenzMapCtx.stroke();


  /* подпись выбранного значения */

  lorenzMapCtx.fillStyle =
    "#eef5f7";


  lorenzMapCtx.font =
    "700 12px Segoe UI";


  lorenzMapCtx.fillText(

    `ρ = ${selectedRho.toFixed(1)}`,

    Math.min(
      markerX+6,
      width-75
    ),

    padding.top-13

  );


  lorenzMapCtx.fillStyle =
    "#91a8b6";


  lorenzMapCtx.font =
    "12px Segoe UI";


  lorenzMapCtx.fillText(
    "параметр ρ",
    width-78,
    height-7
  );

}


/* ---------------------------------------------------------
   МИНИ-АТТРАКТОР
--------------------------------------------------------- */

function drawLorenzPreview(
  rho
){

  const points =
    createLorenzTrajectory(
      rho,
      7500
    );


  const {
    width,
    height
  } =
    setupCanvas(
      lorenzPreview,
      lorenzPreviewCtx
    );


  lorenzPreviewCtx.clearRect(
    0,
    0,
    width,
    height
  );


  lorenzPreviewCtx.fillStyle =
    "#071018";


  lorenzPreviewCtx.fillRect(
    0,
    0,
    width,
    height
  );


  if(!points.length){
    return;
  }


  const xs =
    points.map(
      point => point[0]
    );


  const zs =
    points.map(
      point => point[2]
    );


  let minX =
    Math.min(...xs);

  let maxX =
    Math.max(...xs);

  let minZ =
    Math.min(...zs);

  let maxZ =
    Math.max(...zs);


  /*
    Защита от деления на ноль
    для почти неподвижной системы.
  */

  if(
    Math.abs(maxX-minX) <
    0.000001
  ){

    minX -= 1;
    maxX += 1;

  }


  if(
    Math.abs(maxZ-minZ) <
    0.000001
  ){

    minZ -= 1;
    maxZ += 1;

  }


  const padding = 14;


  lorenzPreviewCtx.strokeStyle =
    "#42d5d0";


  lorenzPreviewCtx.lineWidth =
    1.15;


  lorenzPreviewCtx.lineJoin =
    "round";


  lorenzPreviewCtx.beginPath();


  points.forEach(
    (point,index) => {

      const x =
        padding +

        (
          width -
          2*padding
        ) *

        (
          point[0] -
          minX
        ) /

        (
          maxX -
          minX
        );


      const y =
        height -
        padding -

        (
          height -
          2*padding
        ) *

        (
          point[2] -
          minZ
        ) /

        (
          maxZ -
          minZ
        );


      if(index === 0){

        lorenzPreviewCtx.moveTo(
          x,
          y
        );

      }else{

        lorenzPreviewCtx.lineTo(
          x,
          y
        );

      }

    }
  );


  lorenzPreviewCtx.stroke();

}


/* ---------------------------------------------------------
   АНАЛИЗ ВЫБРАННОГО rho
--------------------------------------------------------- */

function analyseLorenz(){

  const rho =
    Number(
      rhoInput.value
    );


  rhoValue.textContent =
    rho.toFixed(1);


  const sensitivity =
    measureLorenzSensitivity(
      rho
    );


  const regime =
    classifyLorenz(
      rho,
      sensitivity
    );


  /* рост расхождения */

  if(
    sensitivity.growth >
    1000000
  ){

    lorenzDivergence.textContent =
      sensitivity.growth.toExponential(2);

  }else{

    lorenzDivergence.textContent =
      Math.round(
        sensitivity.growth
      ).toLocaleString("ru-RU");

  }


  /*
    Более понятная словесная
    характеристика чувствительности.
  */

  if(
    sensitivity.growth <
    10
  ){

    lorenzSensitivity.textContent =
      "низкая";

  }else if(
    sensitivity.growth <
    10000
  ){

    lorenzSensitivity.textContent =
      "средняя";

  }else{

    lorenzSensitivity.textContent =
      "высокая";

  }


  lorenzMode.textContent =
    regime.title;


  lorenzDescription.textContent =
    regime.description;


  journalLorenz.textContent =
  `ρ = ${rho.toFixed(1)} · режим: ${regime.title} · рост расхождения: ${lorenzDivergence.textContent}.`;


  drawLorenzMap();

  drawLorenzPreview(
    rho
  );
  
  lastLorenzAnalysis = {

  rho:rho,

  mode:regime.title,

  sensitivity:
    lorenzSensitivity.textContent,

  growth:
    lorenzDivergence.textContent

};


lorenzSaveNote.textContent =
  `Состояние при ρ = ${rho.toFixed(1)} готово к сохранению.`;

}

function fillLorenzComparisonCard(
  prefix,
  state
){

  document
    .getElementById(
      `lorenz-${prefix}-rho`
    )
    .textContent =
      `ρ = ${state.rho.toFixed(1)}`;


  document
    .getElementById(
      `lorenz-${prefix}-mode`
    )
    .textContent =
      state.mode;


  document
    .getElementById(
      `lorenz-${prefix}-sensitivity`
    )
    .textContent =
      state.sensitivity;


  document
    .getElementById(
      `lorenz-${prefix}-growth`
    )
    .textContent =
      state.growth;

}


function updateLorenzComparison(){

  lorenzComparison.hidden =
    false;


  if(lorenzStateA){

    fillLorenzComparisonCard(
      "a",
      lorenzStateA
    );

  }


  if(lorenzStateB){

    fillLorenzComparisonCard(
      "b",
      lorenzStateB
    );

  }


  if(
    !lorenzStateA ||
    !lorenzStateB
  ){

    lorenzComparisonConclusion.textContent =
      "Сохраните второе состояние, чтобы выполнить сравнение.";

    return;

  }


  const rhoA =
    lorenzStateA.rho;

  const rhoB =
    lorenzStateB.rho;


  if(
    Math.abs(rhoA-rhoB) <
    0.0001
  ){

    lorenzComparisonConclusion.innerHTML =
      "<strong>Вы выбрали одинаковые значения ρ.</strong> Для сравнения исследуйте два разных состояния.";

    return;

  }


  if(
    lorenzStateA.mode !==
    lorenzStateB.mode
  ){

    lorenzComparisonConclusion.innerHTML =
      `<strong>Режим системы изменился.</strong>
       При изменении ρ с ${rhoA.toFixed(1)}
       до ${rhoB.toFixed(1)}
       система перешла от режима
       «${lorenzStateA.mode}»
       к режиму
       «${lorenzStateB.mode}».
       При этом сами уравнения Лоренца
       и параметры σ, β не изменялись.`;

  }else{

    lorenzComparisonConclusion.innerHTML =
      `<strong>Режим сохранился, но состояние изменилось.</strong>
       При ρ = ${rhoA.toFixed(1)}
       и ρ = ${rhoB.toFixed(1)}
       система относится к режиму
       «${lorenzStateA.mode}»,
       однако величина расхождения
       и чувствительность могут различаться.`;

  }

}

lorenzSaveA.addEventListener(
  "click",
  () => {

    if(!lastLorenzAnalysis){

      lorenzSaveNote.textContent =
        "Сначала нажмите «Исследовать состояние».";

      return;

    }


    lorenzStateA = {
      ...lastLorenzAnalysis
    };


    lorenzSaveNote.textContent =
      `Состояние A сохранено: ρ = ${lorenzStateA.rho.toFixed(1)}.`;


    updateLorenzComparison();

  }
);


lorenzSaveB.addEventListener(
  "click",
  () => {

    if(!lastLorenzAnalysis){

      lorenzSaveNote.textContent =
        "Сначала нажмите «Исследовать состояние».";

      return;

    }


    lorenzStateB = {
      ...lastLorenzAnalysis
    };


    lorenzSaveNote.textContent =
      `Состояние B сохранено: ρ = ${lorenzStateB.rho.toFixed(1)}.`;


    updateLorenzComparison();


    if(lorenzStateA){

      setTimeout(
        () => {

          lorenzComparison.scrollIntoView({
            behavior:"smooth",
            block:"center"
          });

        },
        100
      );

    }

  }
);

document
  .getElementById(
    "lorenz-comparison-reset"
  )
  .addEventListener(
    "click",
    () => {

      lorenzStateA = null;
      lorenzStateB = null;


      lorenzComparison.hidden =
        true;


      lorenzSaveNote.textContent =
        "Исследуйте состояние и сохраните его для нового сравнения.";


      [
        "lorenz-a-rho",
        "lorenz-a-mode",
        "lorenz-a-sensitivity",
        "lorenz-a-growth",
        "lorenz-b-rho",
        "lorenz-b-mode",
        "lorenz-b-sensitivity",
        "lorenz-b-growth"
      ].forEach(
        id => {

          document
            .getElementById(id)
            .textContent = "—";

        }
      );

    }
  );

/* ---------------------------------------------------------
   ПОЛЗУНОК
--------------------------------------------------------- */

rhoInput.addEventListener(
  "input",
  () => {
	  lastLorenzAnalysis =
  null;

lorenzSaveNote.textContent =
  "Параметр изменён. Сначала исследуйте новое состояние.";

    rhoValue.textContent =
      Number(
        rhoInput.value
      ).toFixed(1);


    /*
      Во время движения ползунка
      перемещаем только маркер.

      Полный анализ запускается кнопкой,
      чтобы эксперимент оставался осмысленным.
    */

    drawLorenzMap();

  }
);


/* ---------------------------------------------------------
   КНОПКА
--------------------------------------------------------- */

document
  .getElementById(
    "lorenz-analyse"
  )
  .addEventListener(
    "click",
    analyseLorenz
  );


/* ---------------------------------------------------------
   МОЖНО ВЫБИРАТЬ rho ПРЯМО НА КАРТЕ
--------------------------------------------------------- */

lorenzMap.addEventListener(
  "click",
  event => {

    const rect =
      lorenzMap.getBoundingClientRect();


    const left = 50;
    const right = 22;


    const usableWidth =
      rect.width -
      left -
      right;


    let mouseX =
      event.clientX -
      rect.left -
      left;


    mouseX =
      Math.max(
        0,
        Math.min(
          usableWidth,
          mouseX
        )
      );


    const rho =
      mouseX /
      usableWidth *
      50;


    rhoInput.value =
  rho.toFixed(1);

rhoValue.textContent =
  rho.toFixed(1);


/*
  Клик по карте только выбирает значение ρ.
  Сам анализ запускается кнопкой.
*/

lorenzMode.textContent =
  "Состояние ещё не исследовано";

lorenzDescription.textContent =
  "Нажмите «Исследовать состояние», чтобы рассчитать траекторию и чувствительность.";

lorenzDivergence.textContent =
  "—";

lorenzSensitivity.textContent =
  "—";


drawLorenzMap();

  }
);


/* =========================================================
   03 — ОСТРОВ ПОРЯДКА
========================================================= */

const windowChart =
  document.getElementById(
    "window-bifurcation"
  );

const windowCtx =
  windowChart.getContext("2d");

const windowSequence =
  document.getElementById(
    "window-sequence"
  );

const windowSequenceCtx =
  windowSequence.getContext("2d");

const windowR =
  document.getElementById(
    "window-r"
  );

const windowRValue =
  document.getElementById(
    "window-r-value"
  );

const windowLambda =
  document.getElementById(
    "window-lambda"
  );

const windowPeriod =
  document.getElementById(
    "window-period"
  );

const windowResult =
  document.getElementById(
    "window-result"
  );

const windowDescription =
  document.getElementById(
    "window-description"
  );

const searchStatus =
  document.getElementById(
    "window-search-status"
  );

const journalWindow =
  document.getElementById(
    "journal-window"
  );
  const windowBoundaryStudy =
  document.getElementById(
    "window-boundary-study"
  );




let foundWindowR = null;
const boundaryZoomCanvas =
  document.getElementById(
    "window-zoom-chart"
  );

const boundaryZoomCtx =
  boundaryZoomCanvas.getContext("2d");


const boundaryR =
  document.getElementById(
    "boundary-r"
  );

const boundaryRValue =
  document.getElementById(
    "boundary-r-value"
  );


const boundaryCenterValue =
  document.getElementById(
    "boundary-center-value"
  );

const boundaryRangeLabel =
  document.getElementById(
    "boundary-range-label"
  );


const boundaryCurrentMode =
  document.getElementById(
    "boundary-current-mode"
  );

const boundaryCurrentDetail =
  document.getElementById(
    "boundary-current-detail"
  );


const boundaryLeftValue =
  document.getElementById(
    "boundary-left-value"
  );

const boundaryRightValue =
  document.getElementById(
    "boundary-right-value"
  );

const boundaryWidthValue =
  document.getElementById(
    "boundary-width-value"
  );


let boundaryLeft = null;
let boundaryRight = null;

let boundaryMin = 3.57;
let boundaryMax = 4;

const boundaryFeedback =
  document.getElementById(
    "boundary-feedback"
  );

const boundaryResetButton =
  document.getElementById(
    "boundary-reset"
  );

const boundaryBackButton =
  document.getElementById(
    "boundary-back"
  );


let realBoundaryLeft = null;
let realBoundaryRight = null;

function drawWindowBifurcation(){

  const {width,height} =
    setupCanvas(
      windowChart,
      windowCtx
    );


  const p = {
    left:45,
    right:16,
    top:16,
    bottom:35
  };


  const X = r =>
    p.left +
    (
      width-p.left-p.right
    ) *
    (
      r-3.57
    ) /
    (
      4-3.57
    );


  const Y = x =>
    p.top +
    (
      height-p.top-p.bottom
    ) *
    (1-x);


  windowCtx.clearRect(
    0,
    0,
    width,
    height
  );


  windowCtx.fillStyle =
    "#42d5d08b";


  const columns =
    Math.max(
      550,
      Math.floor(width)
    );


  for(let col=0;col<columns;col++){

    const r =
      3.57 +
      .43 *
      col /
      (columns-1);


    let x = .5;


    for(let i=0;i<600;i++){
      x = logistic(x,r);
    }


    for(let i=0;i<90;i++){

      x = logistic(x,r);

      windowCtx.fillRect(
        X(r),
        Y(x),
        .7,
        .7
      );
    }
  }


  const selected =
    Number(windowR.value);


  windowCtx.strokeStyle =
    "#ff735d";

  windowCtx.lineWidth =
    2;


  windowCtx.beginPath();

  windowCtx.moveTo(
    X(selected),
    p.top
  );

  windowCtx.lineTo(
    X(selected),
    height-p.bottom
  );

  windowCtx.stroke();


  windowCtx.fillStyle =
    "#91a8b6";

  windowCtx.font =
    "11px Segoe UI";

  windowCtx.fillText(
    "3.57",
    p.left,
    height-10
  );

  windowCtx.fillText(
    "4.00",
    width-40,
    height-10
  );
}


function drawWindowSequence(r){

  const {width,height} =
    setupCanvas(
      windowSequence,
      windowSequenceCtx
    );


  let x = .2;


  for(let i=0;i<2500;i++){
    x = logistic(x,r);
  }


  const values = [];


  for(let i=0;i<80;i++){

    x = logistic(x,r);
    values.push(x);
  }


  windowSequenceCtx.clearRect(
    0,
    0,
    width,
    height
  );


  const pad = {
    left:10,
    right:10,
    top:12,
    bottom:12
  };


  windowSequenceCtx.strokeStyle =
    "#42d5d0";

  windowSequenceCtx.lineWidth =
    1.6;

  windowSequenceCtx.beginPath();


  values.forEach(
    (value,index) => {

      const px =
        pad.left +
        (
          width -
          pad.left -
          pad.right
        ) *
        index /
        (values.length-1);


      const py =
        pad.top +
        (
          height -
          pad.top -
          pad.bottom
        ) *
        (1-value);


      if(index === 0){
        windowSequenceCtx.moveTo(px,py);
      }else{
        windowSequenceCtx.lineTo(px,py);
      }
    }
  );


  windowSequenceCtx.stroke();
}


function findNearbyPeriodicWindow(r){

  const radius = 0.012;
  const step = 0.001;

  let nearest = null;

  for(
    let testR = Math.max(3.57, r-radius);
    testR <= Math.min(4, r+radius);
    testR += step
  ){

    if(Math.abs(testR-r) < 0.0005){
      continue;
    }

    const testLambda =
      lyapunov(testR,.2);

    const testPeriod =
      findPeriod(testR,.2);

    const periodic =
      testLambda < 0 &&
      testPeriod !== null &&
      testPeriod > 1;

    if(periodic){

      const distance =
        Math.abs(testR-r);

      if(
        nearest === null ||
        distance < nearest.distance
      ){

        nearest = {
          r:testR,
          period:testPeriod,
          distance
        };
      }
    }
  }

  return nearest;
}


function analyseWindow(){

  const r =
    Number(windowR.value);


  windowRValue.textContent =
    r.toFixed(3);


  const lambda =
    lyapunov(r,.2);

  const period =
    findPeriod(r,.2);


  windowLambda.textContent =
    (
      lambda >= 0
        ? "+"
        : ""
    ) +
    lambda.toFixed(4);


  windowPeriod.textContent =
    period
      ? period
      : "не найден";


  const found =
    lambda < 0 &&
    period !== null &&
    period > 1;


  /*
    РЕЗУЛЬТАТ 1:
    ОСТРОВ ПОРЯДКА НАЙДЕН
  */

  if(found){

    searchStatus.textContent =
      "✓ Остров порядка найден";

    searchStatus.classList.remove(
      "near",
      "chaotic"
    );

    searchStatus.classList.add(
      "found"
    );


    windowResult.textContent =
      `Остров порядка найден · период ${period}`;


    windowDescription.textContent =
      `При r = ${r.toFixed(3)} показатель Ляпунова отрицателен, а последовательность повторяется через ${period} состояний.`;


    journalWindow.textContent =
  `Найден остров при r ≈ ${r.toFixed(3)}, период ${period}.`;

foundWindowR = r;

windowBoundaryStudy.hidden = false;

prepareBoundaryStudy(r);

/*
  Плавно переносим пользователя
  к следующему этапу исследования.
*/

setTimeout(() => {

  windowBoundaryStudy.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}, 150);

  }else{


    /*
      Если сама точка хаотическая,
      проверяем небольшую область вокруг неё.
    */

    const nearby =
      findNearbyPeriodicWindow(r);


    /*
      РЕЗУЛЬТАТ 2:
      БЛИЗКО К ОСТРОВУ
    */

    if(nearby){

      searchStatus.textContent =
        "≈ Вы близко к острову порядка";

      searchStatus.classList.remove(
        "found",
        "chaotic"
      );

      searchStatus.classList.add(
        "near"
      );


      windowResult.textContent =
        "Рядом обнаружена область регулярности";


      windowDescription.textContent =
        "Текущая точка ещё не является периодической, но поблизости существует регулярный режим. Исследуйте соседние значения r.";


    /*
      РЕЗУЛЬТАТ 3:
      ХАОС
    */

    }else{

      searchStatus.textContent =
        "Хаотическая область";

      searchStatus.classList.remove(
        "found",
        "near"
      );

      searchStatus.classList.add(
        "chaotic"
      );


      windowResult.textContent =
        "Здесь сохраняется хаос";


      windowDescription.textContent =
        lambda > 0
          ? "Показатель Ляпунова положителен, а устойчивый период не найден. Попробуйте другую область диаграммы."
          : "Устойчивый период здесь не обнаружен. Продолжайте исследование.";
		  foundWindowR = null;

windowBoundaryStudy.hidden = true;

    }
  }


  drawWindowBifurcation();
  drawWindowSequence(r);
}

function isPeriodicWindowPoint(r){

  const lambda =
    lyapunov(r,.2);

  const period =
    findPeriod(r,.2);

  return (
    lambda < 0 &&
    period !== null &&
    period > 1
  );

}


function findRealWindowBoundaries(centerR){

  const step = 0.0001;

  let left = centerR;
  let right = centerR;


  /*
    Идём влево от найденного центра,
    пока периодический режим сохраняется.
  */

  while(
    left-step >= 3.57 &&
    isPeriodicWindowPoint(left-step)
  ){

    left -= step;

  }


  /*
    Идём вправо.
  */

  while(
    right+step <= 4 &&
    isPeriodicWindowPoint(right+step)
  ){

    right += step;

  }


  return {

    left,
    right

  };

}

function prepareBoundaryStudy(centerR){

  /*
    Увеличиваем небольшой участок
    вокруг найденного режима.
  */

  const radius = 0.025;


  boundaryMin =
    Math.max(
      3.57,
      centerR-radius
    );


  boundaryMax =
    Math.min(
      4,
      centerR+radius
    );


  boundaryR.min =
    boundaryMin.toFixed(4);

  boundaryR.max =
    boundaryMax.toFixed(4);

  boundaryR.step =
    "0.0001";

  boundaryR.value =
    centerR.toFixed(4);


  boundaryRValue.textContent =
    centerR.toFixed(4);


  boundaryCenterValue.textContent =
    `r = ${centerR.toFixed(4)}`;


  boundaryRangeLabel.textContent =
    `${boundaryMin.toFixed(4)} ≤ r ≤ ${boundaryMax.toFixed(4)}`;


  boundaryLeft = null;
  boundaryRight = null;

const realBoundaries =
  findRealWindowBoundaries(
    centerR
  );

realBoundaryLeft =
  realBoundaries.left;

realBoundaryRight =
  realBoundaries.right;

  boundaryLeftValue.textContent =
    "—";

  boundaryRightValue.textContent =
    "—";

  boundaryWidthValue.textContent =
    "—";
	
	boundaryFeedback.hidden =
  true;

boundaryFeedback.className =
  "boundary-feedback";

document
  .querySelector(
    ".boundary-width-card"
  )
  .classList.remove(
    "complete"
  );


  boundaryCurrentMode.textContent =
    "Начните исследование";


  boundaryCurrentDetail.textContent =
    "Перемещайте ползунок в увеличенной области.";


  drawBoundaryZoom();

}

function drawBoundaryZoom(){

  const {width,height} =
    setupCanvas(
      boundaryZoomCanvas,
      boundaryZoomCtx
    );


  const p = {
    left:42,
    right:15,
    top:15,
    bottom:34
  };


  const plotWidth =
    width-p.left-p.right;

  const plotHeight =
    height-p.top-p.bottom;


  const X = r =>
    p.left +
    plotWidth *
    (r-boundaryMin) /
    (boundaryMax-boundaryMin);


  const Y = x =>
    p.top +
    plotHeight *
    (1-x);


  boundaryZoomCtx.clearRect(
    0,
    0,
    width,
    height
  );


  boundaryZoomCtx.fillStyle =
    "rgba(66,213,208,.72)";


  const columns =
    Math.max(
      700,
      Math.floor(width*1.8)
    );


  for(let col=0;col<columns;col++){

    const r =
      boundaryMin +
      (
        boundaryMax-boundaryMin
      ) *
      col/(columns-1);


    let x = .5;


    for(let i=0;i<900;i++){

      x =
        logistic(x,r);

    }


    for(let i=0;i<100;i++){

      x =
        logistic(x,r);


      boundaryZoomCtx.fillRect(
        X(r),
        Y(x),
        .7,
        .7
      );

    }

  }


  /*
    Текущая исследуемая точка.
  */

  const selected =
    Number(boundaryR.value);


  boundaryZoomCtx.strokeStyle =
    "#ff735d";

  boundaryZoomCtx.lineWidth =
    1.8;


  boundaryZoomCtx.beginPath();

  boundaryZoomCtx.moveTo(
    X(selected),
    p.top
  );

  boundaryZoomCtx.lineTo(
    X(selected),
    height-p.bottom
  );

  boundaryZoomCtx.stroke();


  /*
    Сохранённые границы.
  */

  function drawSavedBoundary(
    r,
    color
  ){

    if(r === null){
      return;
    }


    boundaryZoomCtx.strokeStyle =
      color;

    boundaryZoomCtx.lineWidth =
      2.2;


    boundaryZoomCtx.beginPath();

    boundaryZoomCtx.moveTo(
      X(r),
      p.top
    );

    boundaryZoomCtx.lineTo(
      X(r),
      height-p.bottom
    );

    boundaryZoomCtx.stroke();

  }


  drawSavedBoundary(
    boundaryLeft,
    "#e8b34f"
  );

  drawSavedBoundary(
    boundaryRight,
    "#e8b34f"
  );


  boundaryZoomCtx.fillStyle =
    "#91a8b6";

  boundaryZoomCtx.font =
    "11px Segoe UI";


  boundaryZoomCtx.fillText(
    boundaryMin.toFixed(4),
    p.left,
    height-10
  );


  boundaryZoomCtx.fillText(
    boundaryMax.toFixed(4),
    width-55,
    height-10
  );

}

function checkBoundaryState(){

const r =
    Number(boundaryR.value);


  const lambda =
    lyapunov(r,.2);


  const period =
    findPeriod(r,.2);


  const periodic =
    lambda < 0 &&
    period !== null &&
    period > 1;


  if(periodic){

    boundaryCurrentMode.textContent =
      `Периодический режим · период ${period}`;


    boundaryCurrentDetail.textContent =
      `λ = ${lambda.toFixed(4)} · точка находится внутри области порядка.`;

  }else{

    boundaryCurrentMode.textContent =
      "Хаотический режим";


    boundaryCurrentDetail.textContent =
      `λ = ${
        lambda >= 0
          ? "+"
          : ""
      }${lambda.toFixed(4)} · устойчивый период не найден.`;

  }


  drawBoundaryZoom();

}



boundaryR.addEventListener(
  "input",
  () => {

    boundaryRValue.textContent =
      Number(
        boundaryR.value
      ).toFixed(4);


    boundaryCurrentMode.textContent =
      "Точка ещё не проверена";


    boundaryCurrentDetail.textContent =
      "Нажмите «Проверить состояние».";


    drawBoundaryZoom();

  }
);
document
  .getElementById(
    "boundary-check"
  )
  .addEventListener(
    "click",
    checkBoundaryState
  );
  
  
  
  boundaryZoomCanvas.addEventListener(
  "click",
  event => {

    const rect =
      boundaryZoomCanvas.getBoundingClientRect();


    const left = 42;
    const right = 15;


    const usable =
      rect.width-left-right;


    let x =
      event.clientX -
      rect.left -
      left;


    x =
      Math.max(
        0,
        Math.min(
          usable,
          x
        )
      );


    const r =
      boundaryMin +
      x/usable *
      (
        boundaryMax-boundaryMin
      );


    boundaryR.value =
      r.toFixed(4);


    boundaryRValue.textContent =
      r.toFixed(4);


    boundaryCurrentMode.textContent =
      "Точка ещё не проверена";


    boundaryCurrentDetail.textContent =
      "Нажмите «Проверить состояние».";


    drawBoundaryZoom();

  }
);
  

function updateBoundaryWidth(){

  if(
    boundaryLeft === null ||
    boundaryRight === null
  ){

    boundaryWidthValue.textContent =
      "—";

    return;
  }


  const left =
    Math.min(
      boundaryLeft,
      boundaryRight
    );

  const right =
    Math.max(
      boundaryLeft,
      boundaryRight
    );

if(left >= right){

  boundaryFeedback.hidden =
    false;

  boundaryFeedback.className =
    "boundary-feedback error";

  boundaryFeedback.textContent =
    "Левая граница должна быть меньше правой.";

  boundaryWidthValue.textContent =
    "—";

  return;

}

  boundaryLeft =
    left;

  boundaryRight =
    right;


  boundaryLeftValue.textContent =
    left.toFixed(4);


  boundaryRightValue.textContent =
    right.toFixed(4);


  boundaryWidthValue.textContent =
    (right-left).toFixed(4);


  document
    .querySelector(
      ".boundary-width-card"
    )
    .classList.add(
      "complete"
    );


  const finalPeriod =
  findPeriod(
    foundWindowR,
    .2
  );

journalWindow.textContent =
  `r ≈ ${foundWindowR.toFixed(3)} · период ${finalPeriod ?? "—"} · границы ${left.toFixed(4)}–${right.toFixed(4)} · ширина Δr ≈ ${(right-left).toFixed(4)}.`;

}


document
  .getElementById(
    "boundary-save-left"
  )
  .addEventListener(
    "click",
    () => {

      const candidate =
        Number(
          boundaryR.value
        );


      /*
        Левая граница обязана находиться
        левее найденного центра.
      */

      if(candidate >= foundWindowR){

        boundaryFeedback.hidden =
          false;

        boundaryFeedback.className =
          "boundary-feedback error";

        boundaryFeedback.textContent =
          "Это значение находится не слева от найденного центра. Выберите точку левее.";

        return;

      }


      const error =
        Math.abs(
          candidate -
          realBoundaryLeft
        );


      /*
        Допускаем небольшую погрешность
        исследовательского выбора.
      */

      if(error > 0.0015){

        boundaryFeedback.hidden =
          false;

        boundaryFeedback.className =
          "boundary-feedback error";

        boundaryFeedback.textContent =
          "Эта точка слишком далеко от левой границы периодического окна. Продолжайте поиск ближе к переходу между порядком и хаосом.";

        return;

      }


      boundaryLeft =
        candidate;


      boundaryLeftValue.textContent =
        boundaryLeft.toFixed(4);


      boundaryFeedback.hidden =
        false;

      boundaryFeedback.className =
        "boundary-feedback success";

      boundaryFeedback.textContent =
        "✓ Левая граница определена достаточно точно.";


      updateBoundaryWidth();

      drawBoundaryZoom();

    }
  );

document
  .getElementById(
    "boundary-save-right"
  )
  .addEventListener(
    "click",
    () => {

      const candidate =
        Number(
          boundaryR.value
        );


      /*
        Правая граница должна быть
        правее найденного центра.
      */

      if(candidate <= foundWindowR){

        boundaryFeedback.hidden =
          false;

        boundaryFeedback.className =
          "boundary-feedback error";

        boundaryFeedback.textContent =
          "Это значение находится не справа от найденного центра. Выберите точку правее.";

        return;

      }


      const error =
        Math.abs(
          candidate -
          realBoundaryRight
        );


      if(error > 0.0015){

        boundaryFeedback.hidden =
          false;

        boundaryFeedback.className =
          "boundary-feedback error";

        boundaryFeedback.textContent =
          "Эта точка слишком далеко от правой границы периодического окна. Ищите место, где периодический режим снова сменяется хаотическим.";

        return;

      }


      boundaryRight =
        candidate;


      boundaryRightValue.textContent =
        boundaryRight.toFixed(4);


      boundaryFeedback.hidden =
        false;

      boundaryFeedback.className =
        "boundary-feedback success";

      boundaryFeedback.textContent =
        "✓ Правая граница определена достаточно точно.";


      updateBoundaryWidth();

      drawBoundaryZoom();

    }
  );


boundaryResetButton.addEventListener(
  "click",
  () => {

    boundaryLeft = null;
    boundaryRight = null;


    boundaryLeftValue.textContent =
      "—";

    boundaryRightValue.textContent =
      "—";

    boundaryWidthValue.textContent =
      "—";


    boundaryFeedback.hidden =
      true;

    boundaryFeedback.className =
      "boundary-feedback";


    document
      .querySelector(
        ".boundary-width-card"
      )
      .classList.remove(
        "complete"
      );


    if(foundWindowR !== null){

      boundaryR.value =
        foundWindowR.toFixed(4);

      boundaryRValue.textContent =
        foundWindowR.toFixed(4);

    }


    boundaryCurrentMode.textContent =
      "Начните исследование";


    boundaryCurrentDetail.textContent =
      "Перемещайте ползунок в увеличенной области.";


    drawBoundaryZoom();

  }
);

boundaryBackButton.addEventListener(
  "click",
  () => {

    /*
      Закрываем второй этап.
    */

    windowBoundaryStudy.hidden =
      true;


    foundWindowR =
      null;

    boundaryLeft =
      null;

    boundaryRight =
      null;

    realBoundaryLeft =
      null;

    realBoundaryRight =
      null;


    /*
      Сбрасываем главный эксперимент.
    */

    searchStatus.textContent =
      "Остров ещё не найден";


    searchStatus.classList.remove(
      "found",
      "near",
      "chaotic"
    );


    windowLambda.textContent =
      "—";

    windowPeriod.textContent =
      "—";


    windowResult.textContent =
      "Продолжайте исследование";


    windowDescription.textContent =
      "Найдите значение, для которого хаотическое поведение снова становится периодическим.";


    /*
      Возвращаемся к большой диаграмме.
    */

    drawWindowBifurcation();


    document
      .getElementById(
        "window-bifurcation"
      )
      .scrollIntoView({
        behavior:"smooth",
        block:"center"
      });

  }
);

windowR.addEventListener(
  "input",
  () => {

    const r =
      Number(windowR.value);


    windowRValue.textContent =
      r.toFixed(3);


    /*
      Пользователь пока только выбирает точку.
      Результат ещё не проверяем.
    */

    searchStatus.textContent =
      "Точка выбрана · проверьте её";

    searchStatus.classList.remove(
      "found",
      "near",
      "chaotic"
    );


    windowLambda.textContent =
      "—";

    windowPeriod.textContent =
      "—";


    windowResult.textContent =
      "Точка ещё не проверена";


    windowDescription.textContent =
      "Нажмите «Проверить точку», чтобы определить режим системы.";


    drawWindowBifurcation();

  }
);


document
  .getElementById("window-check")
  .addEventListener(
    "click",
    analyseWindow
  );


windowChart.addEventListener(
  "click",
  event => {

    const rect =
      windowChart.getBoundingClientRect();

    const left = 45;
    const right = 16;

    const usable =
      rect.width-left-right;


    let x =
      event.clientX -
      rect.left -
      left;


    x =
      Math.max(
        0,
        Math.min(
          usable,
          x
        )
      );


    const r =
      3.57 +
      x/usable *
      .43;


    windowR.value =
      r.toFixed(3);


    windowRValue.textContent =
      r.toFixed(3);


    /*
      Клик только выбирает точку.
      Никакой автоматической проверки.
    */

    searchStatus.textContent =
      "Точка выбрана · проверьте её";

    searchStatus.classList.remove(
      "found",
      "near",
      "chaotic"
    );


    windowLambda.textContent =
      "—";

    windowPeriod.textContent =
      "—";


    windowResult.textContent =
      "Точка ещё не проверена";


    windowDescription.textContent =
      "Нажмите «Проверить точку», чтобы определить режим системы.";


    drawWindowBifurcation();

  }
);

/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    const active =
      document.querySelector(
        ".experiment-panel:not([hidden])"
      );


    if(!active){
      return;
    }


    if(
      active.dataset.panel ===
      "feigenbaum"
    ){
      drawFeigenbaumChart();
    }


    if(
      active.dataset.panel ===
      "lorenz-map"
    ){
      drawLorenzMap();

      drawLorenzPreview(
        Number(
          rhoInput.value
        )
      );
    }


    if(
      active.dataset.panel ===
      "window"
    ){
      drawWindowBifurcation();

      drawWindowSequence(
        Number(
          windowR.value
        )
      );
    }
  }
);


/* =========================================================
   ПЕРВЫЙ ЗАПУСК
========================================================= */

drawFeigenbaumChart();
updateFeigenbaumResult();