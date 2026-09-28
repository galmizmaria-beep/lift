import {defaults,TYPES,FONT_OPTIONS,BUTTON_EFFECTS} from '../game/model.js';
const bad=k=>['__proto__','constructor','prototype'].includes(k);
function merge(base,raw){if(Array.isArray(base))return Array.isArray(raw)?raw:base;if(base&&typeof base==='object'){const out={};for(const k of Object.keys(base))out[k]=merge(base[k],raw?.[k]);return out;}return typeof base===typeof raw?raw:base;}
function walk(x,depth=0){if(depth>25)throw Error('Слишком сложная структура проекта');if(typeof x==='string'&&x.length>50_000_000)throw Error('Слишком большое поле');if(x&&typeof x==='object')for(const k of Object.keys(x)){if(bad(k))throw Error('Недопустимое поле');walk(x[k],depth+1);}}
export function migrate(raw){walk(raw);if(!raw||raw.version!==1)throw Error('Эта версия проекта не поддерживается. Нужен формат версии 1.');if(!Array.isArray(raw.tasks)||raw.tasks.length>100)throw Error('Проект должен содержать не более 100 заданий');const p=merge(defaults(),raw);if(!raw.layout){p.elevator.sounds=true;if(p.project.title==='Лифт знаний')p.project.title='Моя игра';p.floors.mode='free';p.theme.gradient=false;p.elevator.lines=false;p.layout.player.x=Math.min(90,p.player.x+5);p.layout.player.y=Math.max(10,100-p.player.y-13);}const taskBase=defaults().tasks[0];p.tasks=raw.tasks.map((t,i)=>{if(!t||!TYPES[t.type])throw Error('Неизвестный тип задания');const out=merge(taskBase,t);out.id='task-'+i;if(!out.answers.every(a=>typeof a==='string')||!out.accepted.every(a=>typeof a==='string')||!out.correct.every(Number.isInteger)||out.answers.length>10)throw Error('Повреждённые ответы');return out;});
 const ranges=[['rules.lives',1,10],['rules.timer.seconds',1,86400],['rules.timer.warning',0,86400],['project.quality',.1,1],['theme.radius',0,60],['theme.fontSize',12,60],['theme.answerFontSize',12,48],['theme.taskWidth',40,95],['theme.padding',0,60],['theme.opacity',10,100],['theme.shadow',0,80],['theme.imageOpacity',0,100],['theme.buttonRadius',0,50],['theme.lineHeight',1,2.5],['player.scale',.2,3],['player.x',0,90],['player.y',0,70],['elevator.speed',.2,5],['elevator.doorSpeed',.1,3],['elevator.volume',0,1],['floors.columns',1,5],['floors.size',32,72],['floors.start',0,1],['floors.target',0,100],['project.gifLossy',0,100]];
 for(const [path,min,max]of ranges){const keys=path.split('.'),k=keys.pop(),o=keys.reduce((a,b)=>a[b],p);if(!Number.isFinite(o[k])||o[k]<min||o[k]>max)throw Error('Некорректное значение: '+path);}
 for(const t of p.tasks)if(!Number.isFinite(t.points)||t.points<0||t.points>100||!Number.isFinite(t.tolerance)||t.tolerance<0)throw Error('Некорректные баллы или допуск');
 for(const [o,keys]of [[p.theme,['accent','background','text','panel','door','frame','border','buttonColor','buttonText','questionColor','answerColor','answerBackground']],[p.screens.title,['background','color']],[p.screens.win,['background']],[p.screens.lose,['background']]])for(const k of keys)if(!/^#[0-9a-f]{6}$/i.test(o[k]))throw Error('Некорректный цвет');
 if(!Object.hasOwn(FONT_OPTIONS,p.theme.font))p.theme.font='system-ui';if(!['left','center','right'].includes(p.theme.align))p.theme.align='center';if(!['off','game','task'].includes(p.rules.timer.mode))throw Error('Некорректный таймер');if(!['fixed','free'].includes(p.floors.mode))throw Error('Некорректный режим этажей');
 if(!Array.isArray(raw.assets)||raw.assets.length>300)throw Error('Некорректный список медиа');p.assets=raw.assets.map(a=>{if(!a||typeof a.id!=='string'||!/^[-\w]+$/.test(a.id)||typeof a.data!=='string'||!/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(a.data))throw Error('Недопустимое медиа');return {id:a.id,name:String(a.name||'Медиа').slice(0,200),data:a.data,type:a.data.slice(5,a.data.indexOf(';')),original:Number(a.original)||0,size:Number(a.size)||0};});
 for(const n of [p.rules.lives,p.rules.timer.seconds,p.rules.timer.warning,p.floors.start,p.floors.columns,p.floors.target])if(!Number.isInteger(n))throw Error('Ожидается целое число');for(const n of Object.values(p.rules.bonus).filter(x=>typeof x==='number'))if(!Number.isFinite(n)||n<0||n>3600)throw Error('Некорректное правило бонусов');if(new Set(p.assets.map(a=>a.id)).size!==p.assets.length)throw Error('Повторяющиеся идентификаторы медиа');
 if(![1200,1600,1920].includes(p.project.width)||p.project.height!==p.project.width*9/16)throw Error('Некорректное разрешение');
 if(!['skyline','aurora','orbit'].includes(p.elevator.design))p.elevator.design='skyline';for(const item of Object.values(p.layout)){if(!Number.isFinite(item.x)||item.x<0||item.x>100||!Number.isFinite(item.y)||item.y<0||item.y>100||!Number.isFinite(item.scale)||item.scale<.3||item.scale>2)throw Error('Некорректное расположение объекта');}
 if(!raw.theme?.questionColor)p.theme.questionColor=p.theme.text;
 if(!raw.theme?.answerColor)p.theme.answerColor=p.theme.text;
 for(const b of Object.values(p.buttons))if(!Number.isFinite(b.scale)||b.scale<.5||b.scale>2||!Object.hasOwn(BUTTON_EFFECTS,b.effect))throw Error('Некорректный размер или эффект кнопки');
 // Preserve existing button colours when opening projects made before per-button settings.
 if(!raw.buttons)for(const b of Object.values(p.buttons)){b.background=p.theme.buttonColor;b.color=p.theme.buttonText;}
 const reflection=p.tasks.findIndex(t=>t.type==='oral'&&t.prompt==='Что нового ты узнал сегодня?'&&t.sample==='Расскажи о том, что получилось, и о том, что хотелось бы повторить.');
 if(reflection===p.tasks.length-1&&reflection>=0){p.tasks.splice(reflection,1);p.floors.target=Math.min(p.floors.target,p.tasks.length);}
 for(const b of [...Object.values(p.buttons),p.displayStyle]){
  for(const k of ['background','color','glowColor'])if(!/^#[0-9a-f]{6}$/i.test(b[k]))throw Error('Некорректный цвет кнопки или табло');
  if(!Number.isFinite(b.glow)||b.glow<0||b.glow>60)throw Error('Некорректное свечение');
 }
 if(!['classic','neon','segments'].includes(p.displayStyle.digits))throw Error('Некорректный дизайн цифр');
 if(p.screens.win.description==='Все этажи позади. Отличная работа!')p.screens.win.description='Ты добрался до выбранного этажа. Отличная работа!';
 p.elevator.studentChoice=false;
 const f=p.sceneFrame;if(!['none','solid','dashed','dotted','double'].includes(f.style)||!/^#[0-9a-f]{6}$/i.test(f.color)||!/^#[0-9a-f]{6}$/i.test(f.glowColor))throw Error('Некорректная рамка сцены');
 for(const [k,max] of [['width',20],['glow',60],['radius',60]])if(!Number.isFinite(f[k])||f[k]<0||f[k]>max)throw Error('Некорректная рамка сцены');
 for(const z of Object.values(p.layers))if(!Number.isInteger(z)||z<1||z>8)throw Error('Некорректный слой');
 return p;
}
