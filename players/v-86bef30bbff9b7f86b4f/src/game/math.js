import '../../public/vendor/katex.min.js';
// Only delimited formulas are interpreted; all other text stays escaped by the game.
export function renderMath(root){
 const pattern=/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
 for(const el of root.querySelectorAll('[data-math]')){
  const text=el.textContent,fragment=document.createDocumentFragment();let last=0;
  for(const match of text.matchAll(pattern)){
   fragment.append(document.createTextNode(text.slice(last,match.index)));
   const span=document.createElement('span'),formula=match[1]??match[2]??match[3]??match[4];
   try{span.innerHTML=globalThis.katex.renderToString(formula,{output:'mathml',displayMode:match[1]!==undefined||match[4]!==undefined,throwOnError:true,trust:false,strict:'ignore',maxExpand:500,maxSize:20});}
   catch{span.className='math-error';span.textContent=match[0];span.title='Проверьте запись LaTeX: скобки и названия команд.';}
   fragment.append(span);last=match.index+match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(last)));el.replaceChildren(fragment);
 }
}
