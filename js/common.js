const nav=document.querySelector('.nav');const inPages=location.pathname.replace(/\\/g,'/').includes('/pages/');const rootPath=inPages?'../':'';if(nav){const prefix=inPages?'':'pages/';[['Глоссарий','glossary.html'],['Формулы','formulas.html']].forEach(([label,file])=>{if(!nav.querySelector(`[href$="${file}"]`)){const link=document.createElement('a');link.href=prefix+file;link.textContent=label;nav.append(link)}})}const menuButton=document.querySelector('.menu-toggle');if(menuButton){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))})}const current=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('.nav a').forEach(a=>{if(a.getAttribute('href').endsWith(current))a.classList.add('active')});document.querySelectorAll('.button.primary').forEach(el=>el.classList.add('btn-primary'));document.querySelectorAll('.button.secondary').forEach(el=>el.classList.add('btn-secondary'));document.querySelectorAll('.button.tertiary').forEach(el=>el.classList.add('btn-ghost'));document.querySelectorAll('.conclusion-toggle').forEach(el=>el.classList.add('btn-answer'));function loadStyle(href){if(document.querySelector(`link[href="${href}"]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link)}function loadScript(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[src="${src}"]`)){resolve();return}const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.append(script)})}loadStyle(rootPath+'css/buttons.css');loadStyle(rootPath+'css/assistants.css');loadStyle(rootPath+'css/glossarik-ai.css');loadScript(rootPath+'data/assistantCharacters.js').then(()=>loadScript(rootPath+'data/assistantDialogues.js')).then(()=>loadScript(rootPath+'data/assistantTriggers.js')).then(()=>loadScript(rootPath+'js/assistant.js')).then(()=>loadScript(rootPath+'data/glossarikContext.js')).then(()=>loadScript(rootPath+'js/glossarik-ai.js')).catch(()=>{});

const lessonSequence=[
  {file:'index.html',title:'Главная'},
  {file:'basics.html',title:'Основы'},
  {file:'logistic.html',title:'Логистика'},
  {file:'lorenz.html',title:'Лоренц'},
  {file:'fractal.html',title:'Фракталы'},
  {file:'applications.html',title:'Применения'},
  {file:'experiments.html',title:'Эксперименты'},
  {file:'quiz.html',title:'Испытание'}
];
function getLessonHref(file){
  if(file==='index.html')return inPages?'../index.html':'index.html';
  return inPages?file:`pages/${file}`;
}
function createLessonLink(item,direction,label){
  const link=document.createElement('a');
  link.className=`lesson-nav-link lesson-nav-${direction}`;
  link.href=getLessonHref(item.file);
  link.setAttribute('aria-label',`${label}: ${item.title}`);
  const caption=document.createElement('span');
  caption.textContent=label;
  const title=document.createElement('strong');
  title.textContent=item.title;
  link.append(caption,title);
  return link;
}
function renderLessonNavigation(){
  const lessonIndex=lessonSequence.findIndex(item=>item.file===current);
  const main=document.querySelector('main');
  if(lessonIndex<0||!main||document.querySelector('#lesson-navigation'))return;
  const navigation=document.createElement('nav');
  navigation.id='lesson-navigation';
  navigation.className='lesson-navigation';
  navigation.setAttribute('aria-label','Навигация по занятиям');
  if(lessonIndex>0)navigation.append(createLessonLink(lessonSequence[lessonIndex-1],'previous','← Предыдущее занятие'));
  if(lessonIndex===0){
    navigation.append(createLessonLink(lessonSequence[1],'next','Начать обучение →'));
    navigation.classList.add('lesson-navigation-start');
  }else if(lessonIndex===lessonSequence.length-1){
    navigation.append(createLessonLink(lessonSequence[0],'next','Завершить исследование →'));
  }else{
    navigation.append(createLessonLink(lessonSequence[lessonIndex+1],'next','Следующее занятие →'));
  }
  main.append(navigation);
}
renderLessonNavigation();
