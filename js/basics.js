(()=>{const c=document.querySelector('#sensitivity-chart');if(!c)return;const x=c.getContext('2d'),start=document.querySelector('#start-experiment'),resetBtn=document.querySelector('#reset-experiment'),radios=[...document.querySelectorAll('input[name="delta"]')],aText=document.querySelector('#value-a'),bText=document.querySelector('#value-b'),stepText=document.querySelector('#step-value'),deltaText=document.querySelector('#delta-value'),empty=document.querySelector('#chart-empty'),observation=document.querySelector('#observation-text'),max=60,x0=.2;let d0=1e-6,n=0,timer=null,running=false,A=[x0],B=[x0+d0];const horizonValue=document.querySelector('#horizon-value');
const horizonText=document.querySelector('#horizon-text');
const horizonDelta=document.querySelector('#horizon-delta');

let horizonStep=null;

function formatDelta(value){
  const labels={
    '0.1':'10⁻¹',
    '0.001':'10⁻³',
    '0.000001':'10⁻⁶',
    '1e-9':'10⁻⁹'
  };
  return labels[String(value)] || value.toExponential(0);
}

function updateHorizon(){
  horizonDelta.textContent=formatDelta(d0);

  if(horizonStep!==null){
    horizonValue.textContent=`≈ ${horizonStep} шаг.`;
    horizonText.textContent=
      `До этого момента траектории A и B остаются близкими. После него расхождение превышает 0,1 и близкий прогноз теряет надёжность.`;
    return;
  }

  if(n===0){
    horizonValue.textContent='—';
    horizonText.textContent=
      'Запустите эксперимент, чтобы определить, сколько шагов траектории остаются близкими.';
    return;
  }

  horizonValue.textContent='ищем…';
  horizonText.textContent=
    'Траектории пока остаются достаточно близкими. Наблюдаем за ростом расхождения.';
}const next=v=>4*v*(1-v);function labels(){aText.textContent=x0.toFixed(9);bText.textContent=(x0+d0).toFixed(9);stepText.textContent=n;const d=Math.abs(A[n]-B[n]);deltaText.textContent=d>0&&d<.001?d.toExponential(2):d.toFixed(6);observation.textContent=d0===1e-1?'При большой начальной разнице расхождение заметно уже на первых шагах. Следите за тем, как синяя и красная траектории продолжают развиваться по одному правилу.':'Первые несколько шагов линии A и B почти неразличимы. Следите за моментом, когда синяя и красная траектории начинают двигаться независимо.'}function grid(w,h,p){x.strokeStyle='#203746';x.lineWidth=1;x.fillStyle='#78909d';x.font='12px Segoe UI, sans-serif';for(let i=0;i<=4;i++){const y=p.t+(h-p.t-p.b)*i/4;x.beginPath();x.moveTo(p.l,y);x.lineTo(w-p.r,y);x.stroke();x.fillText((1-i/4).toFixed(2),5,y+4)}for(let i=0;i<=6;i++){const q=p.l+(w-p.l-p.r)*i/6;x.beginPath();x.moveTo(q,p.t);x.lineTo(q,h-p.b);x.stroke();x.fillText(String(i*10),q-7,h-8)}x.fillStyle='#91a8b6';x.fillText('xₙ',7,14);x.fillText('шаг n',w-48,h-8)}function line(values,color,w,h,p){if(values.length<2)return;x.beginPath();values.forEach((v,i)=>{const q=p.l+(w-p.l-p.r)*i/max,y=p.t+(h-p.t-p.b)*(1-v);i?x.lineTo(q,y):x.moveTo(q,y)});x.strokeStyle=color;x.lineWidth=2.2;x.lineJoin='round';x.stroke()}function draw(){const ratio=Math.min(devicePixelRatio||1,2),w=c.width/ratio,h=c.height/ratio,p={t:18,r:16,b:34,l:40};x.clearRect(0,0,w,h);grid(w,h,p);line(A,'#4da3ff',w,h,p);line(B,'#ff735d',w,h,p)}function size(){const r=c.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);c.width=Math.round(r.width*ratio);c.height=Math.round(r.height*ratio);x.setTransform(ratio,0,0,ratio,0,0);draw()}function stop(){clearInterval(timer);timer=null;running=false;start.textContent=n>=max?'Запустить снова':'Продолжить'}function tick(){if(n>=max){stop();return}A.push(next(A[n]));B.push(next(B[n]));n++;

const currentDelta=Math.abs(A[n]-B[n]);

if(horizonStep===null && currentDelta>0.1){
  horizonStep=n;
}

labels();
updateHorizon();
draw()}function reset(){clearInterval(timer);timer=null;running=false;n=0;A=[x0];B=[x0+d0];horizonStep=null;
updateHorizon();empty.hidden=false;start.textContent='Запустить';labels();draw()}function run(){if(n>=max)reset();empty.hidden=true;if(running){stop();return}running=true;start.textContent='Пауза';timer=setInterval(tick,115)}radios.forEach(r=>r.addEventListener('change',()=>{d0=Number(r.value);reset()}));start.addEventListener('click',run);resetBtn.addEventListener('click',reset);window.addEventListener('resize',size);size();
labels();
updateHorizon();
})();
