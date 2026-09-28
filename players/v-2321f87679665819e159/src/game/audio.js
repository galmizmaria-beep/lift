export function createAudio(settings){
 let context;
 function unlock(){try{context??=new(window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')return context.resume().catch(()=>{});return Promise.resolve();}catch{return Promise.resolve();}}
 async function play(kind,{force=false}={}){
  const p=settings();if((!p.sounds&&!force)||p.volume<=0||(!force&&p[kind+'Sound']===false))return false;
  await unlock();if(!context||context.state!=='running')return false;
  const at=context.currentTime,volume=p.volume*.2;
  function tone(freq,start,duration,type='sine',gain=volume){const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.001,at+start);g.gain.exponentialRampToValueAtTime(Math.max(.002,gain),at+start+.02);g.gain.exponentialRampToValueAtTime(.001,at+start+duration);o.connect(g).connect(context.destination);o.start(at+start);o.stop(at+start+duration+.01);o.onended=()=>{o.disconnect();g.disconnect();};}
  if(kind==='success'){tone(523,0,.24);tone(659,.12,.24);tone(784,.24,.4);}
  else if(kind==='error'){tone(220,0,.23,'triangle');tone(165,.18,.38,'triangle');}
  else if(kind==='arrival'){tone(880,0,.45);tone(660,.2,.6);}
  else if(kind==='travel'){tone(75,0,Math.max(.3,p.speed),'triangle',volume*.45);tone(112,0,Math.max(.3,p.speed),'sine',volume*.2);}
  else if(kind==='door'){
   const duration=Math.max(.2,p.doorSpeed),buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),channel=buffer.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/channel.length);
   const node=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain();node.buffer=buffer;filter.type='lowpass';filter.frequency.value=950;g.gain.value=volume*.25;node.connect(filter).connect(g).connect(context.destination);node.start();node.onended=()=>{node.disconnect();filter.disconnect();g.disconnect();};
  }
  return true;
 }
 return {unlock,play,destroy(){context?.close();}};
}
