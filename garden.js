'use strict';
const $ = id => document.getElementById(id);
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let state = 'invitation', paused = false, animations = [];
let player, playerReady = false, musicOn = false, musicRequested = false;
let loadingPlayer = false, usingNativePlayer = false, playerTimeout;
const songId = 'HZX7MB_m13M';
const flowers = [
  [235,615, .78,-23,1.1],[752,615,.75,23,.7],[330,630,.9,-15,.45],
  [665,640,.91,15,1.35],[420,625,1.05,-8,.15],[576,635,1.04,8,.85],
  [297,651,.7,-26,1.65],[705,658,.69,28,1.9],[500,660,1.14,0,0]
];
// Each flower has its own growing stem, unfurling leaves, and overlapping petals.
$('flower-bed').innerHTML = flowers.map(([x,y,s,angle,delay], i) => `<g class="flower" transform="translate(${x} ${y}) rotate(${angle}) scale(${s})"><g class="flower-sway" style="--sway-time:${4+i*.31}s;--sway-delay:-${i*.7}s"><g class="flower-growth" data-delay="${delay}">
  <path d="M0 0 Q-7 -126 0 -269" fill="none" stroke="url(#stem)" stroke-width="7" stroke-linecap="round"/>
  <g class="leaf"><path d="M-2 -41C-81 -81 -62 -153 -93 -178C-36 -156 -13 -101 -2 -41Z" fill="url(#leaf)"/><path d="M-3 -44Q-42 -121 -85 -169" fill="none" stroke="#b2c68a" stroke-opacity=".2"/></g>
  <g class="leaf"><path d="M1 -98C75 -119 49 -184 82 -209C31 -190 9 -141 1 -98Z" fill="url(#leaf)"/><path d="M3 -103Q42 -156 75 -201" fill="none" stroke="#b2c68a" stroke-opacity=".18"/></g>
  <g transform="translate(0 -263)"><g class="bloom-head">
    <path class="petal center" d="M0 5C-46 -12 -43 -63 -21 -102Q-4 -92 0 -109Q17 -90 28 -100C48 -53 37 -12 0 5Z" fill="url(#petal-dark)"/>
    <path class="petal left" d="M1 5C-37 7 -70 -27 -64 -85C-37 -85 -10 -64 0 -25Z" fill="url(#petal)"/>
    <path class="petal right" d="M-1 5C37 7 70 -27 64 -85C37 -85 10 -64 0 -25Z" fill="url(#petal-light)"/>
    <path class="petal center" d="M0 7C-34 -4 -41 -38 -28 -79Q-11 -76 0 -92Q13 -75 29 -79C40 -38 31 -4 0 7Z" fill="url(#petal-light)"/>
    <path class="petal center petal-ridge" d="M-4 2Q-19 -38 -13 -69M5 1Q18 -32 14 -68M0 0V-79"/>
  </g></g></g></g></g>`).join('');
// Deterministic positions keep the garden composition stable on every visit.
const rand = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
$('stars').innerHTML = Array.from({length:65}, (_,i)=>`<i class="star ${i%7===0?'large':''}" style="left:${rand(i)*100}%;top:${rand(i+90)*75}%;--opacity:${.2+rand(i+40)*.5};--time:${2+rand(i+70)*5}s"></i>`).join('');
$('fireflies').innerHTML = Array.from({length:22},(_,i)=>`<i class="firefly" style="left:${12+rand(i+16)*76}%;top:${25+rand(i+78)*62}%;--time:${3+rand(i+2)*5}s;--delay:-${rand(i+6)*8}s"></i>`).join('');
$('grass').innerHTML = Array.from({length:36},(_,i)=>{const x=200+rand(i+16)*600;const y=640+rand(i+21)*26;return `<path d="M${x} ${y}Q${x-20} ${y-45} ${x-35+rand(i+30)*70} ${y-40-rand(i+1)*90}" stroke="#41654b" stroke-width="${1+rand(i+9)*2}" fill="none" opacity="${.12+rand(i+7)*.3}"/>`}).join('');
function addAnimation(el,frames,options){const a=el.animate(frames,{...options,fill:'both'});animations.push(a);return a;}
function setCaption(text){$('growth-caption').textContent=text;}
function revealLetter(){
  if(state!=='growing')return;
  state='bloomed';$('letter').hidden=false;$('read-letter').hidden=false;
  $('skip').hidden=true;setCaption('A little more in love. Every single day.');
  $('replay').disabled=false;$('flowers').setAttribute('data-state','bloomed');
}
function updateMusicButton(){
  $('music').setAttribute('aria-pressed',String(musicOn));
  $('music-label').textContent=musicOn?'Pause our song':'Play our song';
  $('music-icon').setAttribute('d',musicOn?'M7 5h3v14H7Zm7 0h3v14h-3Z':'m9 5 10 7-10 7Z');
}
function musicStatus(text){$('music-status').textContent=text;}
function showNativePlayer(){
  if(usingNativePlayer)return;
  usingNativePlayer=true;loadingPlayer=false;clearTimeout(playerTimeout);
  if(player?.destroy)player.destroy();
  const frame=document.createElement('iframe');frame.id='song-player';
  frame.src=`https://www.youtube-nocookie.com/embed/${songId}?playsinline=1&rel=0`;
  frame.title='I Love You So — The Walters, official music video';
  frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;
  document.querySelector('.video-shell').replaceChildren(frame);
  $('music').disabled=true;$('music').removeAttribute('aria-busy');
  $('music-label').textContent='Use the video controls';
  musicStatus('Tap play in the video. If it won’t load, listen on YouTube below.');
}
function createPlayer(){
  if(usingNativePlayer||player)return;
  player=new window.YT.Player('song-player',{
    host:'https://www.youtube-nocookie.com',videoId:songId,
    playerVars:{playsinline:1,rel:0,origin:location.origin},
    events:{
      onReady(event){
        clearTimeout(playerTimeout);playerReady=true;loadingPlayer=false;
        $('music').disabled=false;$('music').removeAttribute('aria-busy');
        const frame=event.target.getIframe();frame.title='I Love You So — The Walters, official music video';
        frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
        event.target.setVolume(65);updateMusicButton();
        musicStatus('Press play here or in the video to listen.');
        if(musicRequested)event.target.playVideo();
      },
      onStateChange(event){
        musicOn=event.data===1;updateMusicButton();
        if(event.data===1)musicStatus('Playing I Love You So · The Walters');
        else if(event.data===2)musicStatus('Paused. Your garden is still here.');
        else if(event.data===0)musicStatus('One more listen? Press play whenever you like.');
        else if(event.data===3)musicStatus('Your song is buffering…');
      },
      onAutoplayBlocked(){musicRequested=false;musicOn=false;updateMusicButton();musicStatus('Tap play in the video to start your song.');},
      onError(){clearTimeout(playerTimeout);musicRequested=false;musicOn=false;updateMusicButton();$('music').disabled=true;$('music').removeAttribute('aria-busy');$('music-label').textContent='Listen on YouTube below';musicStatus('This video can’t play here. Open the YouTube link to hear your song.');}
    }
  });
}
function toggleMusic(){
  if(usingNativePlayer)return;
  if(playerReady){
    if(musicOn){musicRequested=false;player.pauseVideo();}
    else{musicRequested=true;player.playVideo();}
    return;
  }
  if(loadingPlayer)return;
  loadingPlayer=true;musicRequested=true;$('music').disabled=true;
  $('music').setAttribute('aria-busy','true');$('music-label').textContent='Loading our song…';
  musicStatus('Getting your song ready…');
  playerTimeout=setTimeout(showNativePlayer,12000);
  if(window.YT?.Player){createPlayer();return;}
  window.onYouTubeIframeAPIReady=createPlayer;
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
  script.async=true;script.onerror=showNativePlayer;document.head.append(script);
}
function setPaused(value){paused=value;document.body.classList.toggle('paused',paused);animations.forEach(a=>{if(a.playState!=='finished')paused?a.pause():a.play();});$('pause').textContent=paused?'Resume animation':'Pause animation';$('pause').setAttribute('aria-pressed',String(paused));}
function bloom(){
  animations.forEach(a=>a.cancel());animations=[];state='growing';setPaused(false);document.body.classList.add('started');$('invitation').hidden=true;$('letter').hidden=true;$('read-letter').hidden=true;$('skip').hidden=false;$('controls').hidden=false;$('replay').disabled=true;setCaption('Like our love, something beautiful is growing…');$('flowers').setAttribute('data-state','growing');
  if(motion.matches){document.querySelectorAll('.flower-growth,.leaf,.bloom-head,.petal').forEach(el=>addAnimation(el,[{transform:'none',opacity:1},{transform:'none',opacity:1}],{duration:1}));revealLetter();return;}
  document.querySelectorAll('.flower-growth').forEach((el,i)=>{const delay=Number(el.dataset.delay)*1000;
    addAnimation(el,[{transform:'scaleY(.55)',opacity:.6},{transform:'scaleY(1)',opacity:1}],{duration:4400,delay,easing:'cubic-bezier(.22,.61,.36,1)'});
    el.querySelectorAll('.leaf').forEach((leaf,j)=>addAnimation(leaf,[{transform:'scale(.3)'},{transform:'scale(1)'}],{duration:2500,delay:delay+1700+j*650,easing:'cubic-bezier(.2,.6,.3,1)'}));
    addAnimation(el.querySelector('.bloom-head'),[{transform:'scale(.45)',opacity:1},{transform:'scale(1)',opacity:1}],{duration:2300,delay:delay+3600,easing:'ease-out'});
    el.querySelectorAll('.petal').forEach(p=>{const start=p.classList.contains('left')?'rotate(21deg) scaleX(.55)':p.classList.contains('right')?'rotate(-21deg) scaleX(.55)':'scaleX(.55)';const end=p.classList.contains('left')?'rotate(-10deg) scaleX(1)':p.classList.contains('right')?'rotate(10deg) scaleX(1)':'scaleX(1)';addAnimation(p,[{transform:start},{transform:end}],{duration:3700,delay:delay+5700,easing:'cubic-bezier(.2,.65,.3,1)'});});
  });
  const clock=addAnimation($('flowers'),[{opacity:1},{opacity:1}],{duration:12000});clock.onfinish=revealLetter;
}
$('bloom').addEventListener('click',bloom);
$('replay').addEventListener('click',()=>{bloom();window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'});});
$('pause').addEventListener('click',()=>setPaused(!paused));
$('music').addEventListener('click',toggleMusic);
const memoriesVideo=$('memories-video');
$('memories-play').addEventListener('click',async()=>{
  memoriesVideo.currentTime=0;
  try{await memoriesVideo.play();$('memories-status').textContent='Our memories are playing.';}
  catch{$('memories-status').textContent='Tap play on the video to watch our memories.';}
  if(!musicOn&&!loadingPlayer)toggleMusic();
});
memoriesVideo.addEventListener('ended',()=>{$('memories-status').textContent='One more time? Press Play our memories.';});
memoriesVideo.addEventListener('error',()=>{$('memories-status').textContent='The film could not load here. Please try refreshing the page.';});
$('skip').addEventListener('click',()=>{setPaused(false);animations.forEach(a=>a.finish());revealLetter();$('letter').focus({preventScroll:true});$('letter').scrollIntoView({behavior:motion.matches?'instant':'smooth'});});
motion.addEventListener('change',()=>{if(state==='growing'&&motion.matches){animations.forEach(a=>a.finish());revealLetter();}});
