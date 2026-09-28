export const TYPES = {single:'Один вариант',multiple:'Несколько вариантов',oral:'Устный ответ',order:'По порядку',text:'Ввод ответа'};
export const FONT_OPTIONS=Object.fromEntries(['system-ui','Arial','Arial Black','Verdana','Tahoma','Trebuchet MS','Helvetica','Helvetica Neue','Segoe UI','Calibri','Candara','Optima','Gill Sans','Georgia','Times New Roman','Palatino','Palatino Linotype','Book Antiqua','Baskerville','Cambria','Constantia','Didot','Garamond','Courier New','Consolas','Menlo','Monaco','Lucida Console','Comic Sans MS','Chalkboard','Impact','serif','sans-serif','monospace','cursive'].map(x=>[x,x==='system-ui'?'Системный':x]));
export const BUTTON_EFFECTS={none:'Без эффекта',lift:'Подъём',grow:'Увеличение',pulse:'Пульсация',tilt:'Наклон',wobble:'Покачивание',glow:'Усиление свечения'};
export const BUTTON_LABELS={begin:'Начать',enter:'Войти в лифт',ready:'Старт',check:'Проверить'};
export const clone = x => structuredClone(x);
export const uid = () => 'id-'+crypto.randomUUID();
export function newTask(type='single') {
 return {id:uid(),type,prompt:'Новое задание',answers:['Вариант 1','Вариант 2','Вариант 3'],correct:[0],accepted:['ответ'],sample:'Образец ответа',oralMode:'self',shuffle:true,partial:false,ignoreCase:true,ignoreSpaces:true,yo:true,numeric:false,tolerance:0,points:1,media:'',onCorrect:'',onWrong:''};
}
export function defaults(){
 const tasks=[{...newTask(),prompt:'Сколько будет 7 + 5?',answers:['10','12','14'],correct:[1]}, {...newTask('multiple'),prompt:'Выбери все чётные числа',answers:['2','5','8','9'],correct:[0,2]}, {...newTask('order'),prompt:'Расставь числа от меньшего к большему',answers:['3','7','12','20']}, {...newTask('text'),prompt:'Как называется наша планета?',accepted:['Земля','планета Земля']}];
 return {version:1,buttons:Object.fromEntries(Object.keys(BUTTON_LABELS).map(k=>[k,{background:'#2c6956',color:'#ffffff',glowColor:'#79dcb6',glow:0,scale:1,effect:'lift'}])),displayStyle:{background:'#172832',color:'#e1f7fc',glowColor:'#79dcb6',glow:12,digits:'classic'},sceneFrame:{style:'solid',width:2,color:'#9badb7',glow:0,glowColor:'#79dcb6',radius:16},layers:{enter:8,elevator:1,player:5,floors:4,start:6,goal:3,display:2,hud:7},layout:{enter:{x:50,y:89,scale:1},elevator:{x:50,y:50,scale:1},player:{x:23,y:77,scale:1},floors:{x:83,y:52,scale:1},start:{x:50,y:50,scale:1},goal:{x:50,y:15,scale:1},display:{x:50,y:28,scale:1},hud:{x:50,y:6,scale:1}},project:{title:'Моя игра',author:'',locale:'ru',fallback:'ru',autosave:true,width:1200,height:675,url:'',quality:.82,gifLossy:0},theme:{accent:'#d49a35',background:'#edf2f5',text:'#253d36',panel:'#fffdf7',door:'#b9cbd5',frame:'#344957',radius:20,font:'system-ui',fontSize:24,answerFontSize:18,questionColor:'#253d36',answerColor:'#253d36',answerBackground:'#fffdf7',bold:false,lineHeight:1.4,align:'center',border:'#d5dfd6',shadow:24,opacity:96,taskWidth:76,padding:24,buttonRadius:14,buttonColor:'#2c6956',buttonText:'#ffffff',backgroundImage:'',fit:'cover',imageOpacity:100,gradient:false},elevator:{design:'skyline',studentChoice:false,speed:1,doorSpeed:.8,sounds:true,volume:.4,successSound:true,errorSound:true,arrivalSound:true,doorSound:true,travelSound:true,motion:true,lines:false,direction:'up',display:'digital'},player:{media:'',scale:1,x:24,y:12,flip:false,animate:true,idle:true},floors:{goalText:'',start:1,target:0,mode:'free',columns:3,size:48,round:true},rules:{lives:3,lifeIcon:'♥',lifeMedia:'',bonusLife:false,timer:{mode:'off',seconds:120,mandatory:true,warning:10},bonus:{enabled:true,label:'',base:1,streak:3,streakPoints:2,fast:10,fastPoints:1,perfect:1},correct:'',wrong:''},screens:{title:{enabled:true,title:'Знания поднимают выше',description:'Каждый правильный ответ — новый этаж. Готов отправиться наверх?',button:'',media:'',background:'#e8eee9',color:'#253d36',size:42},win:{title:'Ты на высоте!',description:'Ты добрался до выбранного этажа. Отличная работа!',media:'',background:'#e8eee9',glow:true,stats:true},lose:{title:'Попробуем ещё раз?',description:'Каждая попытка приближает к вершине.',media:'',background:'#f3e9e0',glow:false,stats:true}},tasks,assets:[]};
}
export function normalize(text,t){let s=String(text).trim();if(t.ignoreCase)s=s.toLocaleLowerCase();if(t.ignoreSpaces)s=s.replace(/\s+/g,'');if(t.yo)s=s.replace(/ё/g,'е').replace(/Ё/g,'Е');return s;}
export function checkAnswer(t,answer){
 if(t.type==='oral')return answer===true;
 if(t.type==='text')return t.accepted.some(a=>t.numeric ? String(answer).trim()!=='' && Number.isFinite(Number(String(answer).replace(',','.'))) && Math.abs(Number(String(answer).replace(',','.'))-Number(a.replace(',','.')))<=t.tolerance : normalize(a,t)===normalize(answer,t));
 if(t.type==='order')return answer.length===t.answers.length && answer.every((x,i)=>x===i);
 return Array.isArray(answer)&&answer.length===t.correct.length && answer.every(x=>t.correct.includes(x));
}
export function partialCredit(t,answer){if(t.type!=='multiple'||!t.partial)return 0;return Math.max(0,(answer.filter(i=>t.correct.includes(i)).length-answer.filter(i=>!t.correct.includes(i)).length)/t.correct.length);}
export function validate(p){
 const e=[];if(!p.tasks.length)e.push('Добавьте хотя бы одно задание.');
 p.tasks.forEach((t,i)=>{const prefix=`Этаж ${i+p.floors.start}: `;if(!t.prompt.trim())e.push(prefix+'напишите вопрос.');if(['single','multiple','order'].includes(t.type)){const max=t.type==='single'?8:10;if(t.answers.length<2||t.answers.length>max||t.answers.some(a=>!a.trim()))e.push(prefix+`заполните от 2 до ${max} вариантов.`);}
 if(['single','multiple'].includes(t.type)&&(!t.correct.length||new Set(t.correct).size!==t.correct.length||t.correct.some(n=>n<0||n>=t.answers.length)||(t.type==='single'&&t.correct.length!==1)))e.push(prefix+'выберите правильный ответ.');
 if(t.type==='text'&&(!t.accepted.length||t.accepted.some(a=>!a.trim())||(t.numeric&&t.accepted.some(a=>!Number.isFinite(Number(a.replace(',','.')))))))e.push(prefix+'укажите допустимые ответы.');if(t.type==='oral'&&!t.sample.trim())e.push(prefix+'добавьте образец ответа.');});return e;
}
export function initialGame(p){return {phase:p.screens.title.enabled?'title':'lobby',floor:0,lives:p.rules.lives,bonus:0,streak:0,errors:0,taskErrors:0,partialAwarded:0,elapsed:0,taskElapsed:0,remaining:p.rules.timer.seconds,target:Math.min(p.tasks.length,p.floors.target||p.tasks.length),targetSelected:false,design:p.elevator.design||'skyline',answers:0,earned:[],partialByFloor:{},errorsByFloor:{},direction:'up'};}
export function submit(p,s,answer){
 if(s.phase!=='task')return s;
 const t=p.tasks[s.floor],next={...s,earned:[...(s.earned||[])],partialByFloor:{...(s.partialByFloor||{})},errorsByFloor:{...(s.errorsByFloor||{})}};
 if(checkAnswer(t,answer)){
  next.streak++;next.answers++;
  if(!next.earned.includes(s.floor)){
   if(p.rules.bonus.enabled){const b=p.rules.bonus;next.bonus+=t.points*b.base+(!s.taskErrors?b.perfect:0)+(b.fast>0&&s.taskElapsed<=b.fast?b.fastPoints:0)+(b.streak>0&&next.streak%b.streak===0?b.streakPoints:0);}
   if(p.rules.bonusLife)next.lives=Math.min(p.rules.lives,next.lives+1);
   next.earned.push(s.floor);
  }
  next.floor++;next.direction='up';next.phase='moving';next.arrival=next.floor>=next.target?'win':'task';next.taskErrors=0;
 }else{
  next.lives--;next.errors++;next.taskErrors++;next.errorsByFloor[s.floor]=(next.errorsByFloor[s.floor]||0)+1;next.streak=0;
  next.direction='up';next.answers++;if(next.lives<=0){next.phase='lose';}else{next.floor++;next.phase='moving';next.arrival=next.floor>=next.target?'win':'task';next.taskErrors=0;}
 }
 return next;
}
export function tick(p,s){
 if(!['task','moving','descending'].includes(s.phase))return s;
 const n={...s,elapsed:s.elapsed+1,taskElapsed:s.taskElapsed+(s.phase==='task'?1:0)};
 if(p.rules.timer.mode==='off'||(p.rules.timer.mode==='task'&&s.phase!=='task'))return n;
 n.remaining=Math.max(0,s.remaining-1);if(n.remaining===0&&p.rules.timer.mandatory)n.phase='lose';return n;
}
