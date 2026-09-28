import {execFileSync} from 'node:child_process';
const base=process.env.PLAYER_BASE_SHA;
if(!base||/^0+$/.test(base))process.exit(0);
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const exists=path=>{try{git('cat-file','-e',base+':'+path);return true;}catch{return false;}};
const locked=exists('players/legacy.json');
for(const line of git('diff','--name-only',base,'--','players','play.html').trim().split('\n').filter(Boolean)){
 const release=line.match(/^players\/(v-[a-f0-9]{20})\//)?.[1];
 if((locked&&['play.html','players/legacy.json'].includes(line))||(release&&exists('players/'+release+'/manifest.json')))throw Error('Published games are immutable; create a new player version instead: '+line);
}
console.log('Published player history is preserved.');
