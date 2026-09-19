const $=id=>document.getElementById(id);
const palettes=[['#ba6048','#879579','#e6cfab','#414d42'],['#465e72','#8fa8ad','#e6dfcd','#faf4e6'],['#b57987','#d4a390','#f0ddc5','#697d61']];
const names=['Terrakotta','Salbei','Sand','Wald'];
let state={count:16,colors:[],palette:[...palettes[0]],customColors:['#ba6048'],selected:'#ba6048',preset:0,name:'Terrakotta & Salbei'},history=[];
function presetColors(n,p){return Array.from({length:n},(_,i)=>state.palette[p===0?Math.floor(i/2)%4:p===1?i%2:(i%4===0?0:2)]);}
state.colors=presetColors(16,0);
const isColor=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
try{
 const saved=JSON.parse(localStorage.getItem('kumi-studio'));
 if(saved&&[8,12,16,20,24,28,32].includes(saved.count)&&Array.isArray(saved.colors)&&saved.colors.length===saved.count&&saved.colors.every(isColor)&&Array.isArray(saved.palette)&&saved.palette.length===4&&saved.palette.every(isColor)){
  state={customColors:Array.isArray(saved.customColors)&&saved.customColors.length>=1&&saved.customColors.length<=4&&saved.customColors.every(isColor)?[...saved.customColors]:['#ba6048'],count:saved.count,colors:[...saved.colors],palette:[...saved.palette],
   selected:isColor(saved.selected)?saved.selected:saved.palette[0],
   preset:[-1,0,1,2].includes(saved.preset)?saved.preset:0,
   name:typeof saved.name==='string'?saved.name.slice(0,70):state.name};
 }
}catch{}
// Evenly spaced pairs need an integer number of slots per group.
function slotCount(){return state.count===8?32:state.count*2;}
function positions(){const total=slotCount();return Array.from({length:state.count},(_,i)=>(Math.floor(i/2)*(total/(state.count/2))+(i%2?0:total-1))%total);}
function save(){try{localStorage.setItem('kumi-studio',JSON.stringify(state));}catch{}}
function commit(fn){history.push(JSON.stringify(state));if(history.length>60)history.shift();fn();render();}
function point(r,a){return [250+r*Math.sin(a),250-r*Math.cos(a)];}
function diskSVG(){let total=slotCount(),out='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><filter id="shadow"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#414c32" flood-opacity=".07"/></filter></defs><circle cx="250" cy="250" r="184" fill="#faf9f2" stroke="#e5e5da" filter="url(#shadow)"/><circle cx="250" cy="250" r="172" fill="none" stroke="#edede3"/>';
for(let i=0;i<total;i++){let a=(i+.5)*Math.PI*2/total,p=point(168,a),q=point(184,a),t=point(151,a);out+=`<path d="M${p} L${q}" stroke="#c7cbbd" stroke-width="1.2"/><text x="${t[0]}" y="${t[1]+3}" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#929986">${i+1}</text>`;}
positions().forEach((s,i)=>{let a=(s+.5)*Math.PI*2/total,p=point(207,a),q=point(48,a);out+=`<g class="strand" role="button" tabindex="0" data-index="${i}" aria-label="Faden ${i+1}, Schlitz ${s+1}, Farbe ${state.colors[i]} ändern"><title>Faden ${i+1} · Schlitz ${s+1}</title><path d="M${q} L${p}" stroke="${state.colors[i]}" stroke-width="4.5" stroke-linecap="round"/><circle cx="${p[0]}" cy="${p[1]}" r="12" fill="${state.colors[i]}" stroke="#fffefa" stroke-width="3"/></g>`;});
out+='<circle cx="250" cy="250" r="43" fill="#eeeee3" stroke="#e0e2d6"/><circle cx="250" cy="250" r="34" fill="#f8f8f2"/><text x="250" y="246" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="#929b85">kumi</text><text x="250" y="260" text-anchor="middle" font-family="sans-serif" font-size="5" letter-spacing="1" fill="#a6ac9a">MANUFAKTUR</text></svg>';return out;}
function braidSVG(){let out='<defs><linearGradient id="fiber"><stop stop-color="#fff" stop-opacity=".24"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#17231b" stop-opacity=".25"/></linearGradient><filter id="bs"><feDropShadow dx="3" dy="4" stdDeviation="4" flood-opacity=".13"/></filter></defs>';const scale=Number($('zoom').value)/100;out+=`<g transform="translate(120 250) scale(${scale}) translate(-120 -250)" filter="url(#bs)">`;
// Elongated diamonds with softly rounded corners overlap into a continuous band.
// Each preview row shows half the threads; fixed scale size preserves proportional width.
const columns=state.count/2,segmentWidth=8.5,segmentHeight=18,rows=52;
const columnStep=6.375,rowStep=8;
const strandGrid=Kumihimo.strandRows(state.count,rows);
for(let row=0;row<rows;row++){for(let col=0;col<columns;col++){
const x=120+(col-(columns-1)/2)*columnStep+(.5-row%2)*columnStep/2;
const y=36+row*rowStep;
const idx=strandGrid[row][col];
const rx=segmentWidth/2,ry=segmentHeight/2;
const d=`M${x-.7} ${y+1.1} Q${x} ${y-.2} ${x+.7} ${y+1.1} L${x+rx-.55} ${y+ry-1} Q${x+rx+.15} ${y+ry} ${x+rx-.55} ${y+ry+1} L${x+.7} ${y+segmentHeight-1.1} Q${x} ${y+segmentHeight+.2} ${x-.7} ${y+segmentHeight-1.1} L${x-rx+.55} ${y+ry+1} Q${x-rx-.15} ${y+ry} ${x-rx+.55} ${y+ry-1} Z`;
out+=`<path data-scale-row="${row}" data-strand="${idx}" d="${d}" fill="${state.colors[idx]}" stroke="#35412d" stroke-opacity=".4" stroke-width=".3" stroke-linejoin="round"><title>Faden ${idx+1} · Schlitz ${positions()[idx]+1}</title></path><path d="${d}" fill="url(#fiber)" pointer-events="none"/>`;
}}
return out+'</g>';}
function renderCustomColors(){
 $('custom').value=state.customColors[0];
 $('select-custom').setAttribute('aria-pressed',String(state.selected===state.customColors[0]));
 $('add-custom').disabled=state.customColors.length===4;
 $('add-custom').title=state.customColors.length===4?'Alle vier eigenen Farben sind angelegt':'Weitere eigene Farbe hinzufügen';
 $('extra-colors').innerHTML=state.customColors.slice(1).map((c,i)=>`<div class="custom-color extra-color"><input type="color" value="${c}" data-custom-index="${i+1}" aria-label="Eigene Farbe ${i+2} ändern"><button type="button" data-select-custom="${i+1}" aria-pressed="${state.selected===c}">Eigene Farbe ${i+2} auswählen</button></div>`).join('');
}
function render(){renderCustomColors(); $('name').value=state.name;$('count').value=state.count;$('disk').innerHTML=diskSVG();document.querySelector('.pill').textContent=slotCount()+' Schlitze';$('braid').innerHTML=braidSVG();$('strand-label').textContent=state.count+' Fäden';$('active-dot').style.background=state.selected;$('active-label').textContent=(names[state.palette.indexOf(state.selected)]||state.selected)+' ausgewählt';$('color-count').textContent=new Set(state.colors).size+' Farben';$('undo').disabled=!history.length;
$('palette').innerHTML=state.palette.map((c,i)=>`<button class="swatch ${state.selected===c?'selected':''}" style="background:${c}" data-color="${c}" aria-label="${names[i]} auswählen" aria-pressed="${state.selected===c}"></button>`).join('');$('presets').innerHTML=['Spirale','Streifen','Akzent'].map((n,i)=>`<button class="preset ${state.preset===i?'active':''}" data-preset="${i}"><div class="preset-art" style="background-image:repeating-linear-gradient(${i===1?0:135}deg,${state.palette[i===2?2:0]} 0 5px,${state.palette[1]} 5px 9px,${state.palette[2]} 9px 14px)"></div>${n}</button>`).join('');save();}
$('palette').onclick=e=>{const b=e.target.closest('[data-color]');if(b){state.selected=b.dataset.color;render();}};
function paint(e){const b=e.target.closest('[data-index]');if(b)commit(()=>{state.colors[Number(b.dataset.index)]=state.selected;state.preset=-1;});}
$('disk').onclick=paint;$('disk').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();paint(e);}};
$('custom').onchange=e=>{if(isColor(e.target.value))commit(()=>{state.customColors[0]=e.target.value;state.selected=e.target.value;});};
$('select-custom').onclick=()=>{state.selected=state.customColors[0];render();};
$('add-custom').onclick=()=>{
 if(state.customColors.length>=4)return;
 commit(()=>{const color=palettes[0][state.customColors.length];state.customColors.push(color);state.selected=color;});
 $('extra-colors').querySelector('.extra-color:last-child input')?.focus();
};
$('extra-colors').onchange=e=>{
 const i=Number(e.target.dataset.customIndex);
 if(Number.isInteger(i)&&i>0&&i<state.customColors.length&&isColor(e.target.value))commit(()=>{state.customColors[i]=e.target.value;state.selected=e.target.value;});
};
$('extra-colors').onclick=e=>{
 const b=e.target.closest('[data-select-custom]');
 if(b){state.selected=state.customColors[Number(b.dataset.selectCustom)];render();}
};
$('presets').onclick=e=>{const b=e.target.closest('[data-preset]');if(b)commit(()=>{state.preset=Number(b.dataset.preset);state.colors=presetColors(state.count,state.preset);});};
$('count').onchange=e=>commit(()=>{state.count=Number(e.target.value);state.colors=presetColors(state.count,Math.max(0,state.preset));});
$('name').oninput=e=>{state.name=e.target.value;save();};
$('shuffle').onclick=()=>commit(()=>{state.palette=[...palettes[Math.floor(Math.random()*palettes.length)]];state.colors=Array.from({length:state.count},()=>state.palette[Math.floor(Math.random()*4)]);state.selected=state.palette[0];state.preset=-1;});
$('rotate').onclick=()=>commit(()=>{state.colors.unshift(state.colors.pop());state.preset=-1;});
$('undo').onclick=()=>{if(history.length){state=JSON.parse(history.pop());render();}};
$('reset').onclick=()=>commit(()=>{state.palette=[...palettes[0]];state.selected=state.palette[0];state.preset=0;state.colors=presetColors(state.count,0);state.name='Terrakotta & Salbei';});
$('zoom').oninput=()=>{$('zoom-value').textContent=$('zoom').value+' %';$('braid').innerHTML=braidSVG();};
['help','guide'].forEach(id=>$(id).onclick=()=>$('instructions').showModal());$('close-dialog').onclick=()=>$('instructions').close();$('instructions').onclick=e=>{if(e.target===$('instructions')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};$('studio').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
const escapeXML=s=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
$('export').onclick=()=>{const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="760" viewBox="0 0 900 760"><rect width="900" height="760" fill="#f8f8f2"/><text x="45" y="55" font-family="Georgia" font-size="28" fill="#333a32">${escapeXML(state.name||'Mein Kumihimo-Design')}</text><text x="45" y="82" font-family="sans-serif" font-size="12" fill="#7a886b">Kumi Manufaktur · ${state.count} Fäden · Startbelegung</text><g transform="translate(10 90)">${diskSVG().replace('<svg ','<svg width="520" height="520" ')}</g><svg x="575" y="100" width="220" height="480" viewBox="0 0 240 500">${braidSVG()}</svg><text x="560" y="610" font-family="sans-serif" font-size="10" fill="#7a886b">Schematische Farbvorschau</text>${positions().map((s,i)=>`<circle cx="${50+Math.floor(i/8)*210}" cy="${630+i%8*14}" r="4" fill="${state.colors[i]}"/><text x="${62+Math.floor(i/8)*210}" y="${634+i%8*14}" font-family="sans-serif" font-size="10" fill="#333a32">Schlitz ${s+1}: ${state.colors[i]}</text>`).join('')}</svg>`;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download=(state.name||'kumihimo').replace(/[^a-z0-9äöüß -]/gi,'')+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);$('toast').textContent='Dein Design wurde als SVG exportiert.';$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000);};render();


