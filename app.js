
function addSheetSwipe(element, previous, next) {
  let start = null, suppressClickUntil = 0;
  element.style.touchAction = 'pan-y pinch-zoom';
  element.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) { start = null; return; }
    const touch = event.touches[0];
    start = {x: touch.clientX, y: touch.clientY, moved: false};
  }, {passive: true});
  element.addEventListener('touchmove', event => {
    if (!start || event.touches.length !== 1) { start = null; return; }
    const dx = event.touches[0].clientX - start.x;
    const dy = event.touches[0].clientY - start.y;
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) start.moved = true;
    if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx)) start = null;
  }, {passive: true});
  element.addEventListener('touchend', event => {
    if (!start) return;
    const gesture = start; start = null;
    if (gesture.moved) suppressClickUntil = Date.now() + 500;
    if (!event.changedTouches.length || event.touches.length) return;
    const dx = event.changedTouches[0].clientX - gesture.x;
    const dy = event.changedTouches[0].clientY - gesture.y;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClickUntil = Date.now() + 500;
    if (dx < 0) next(); else previous();
  }, {passive: true});
  element.addEventListener('touchcancel', () => { start = null; }, {passive: true});
  element.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
}
const gallery=document.getElementById('gallery'),viewer=document.getElementById('viewer');
const shuffled=artworks.flatMap(a=>a.images).map(src=>({src,sort:Math.random()})).sort((a,b)=>a.sort-b.sort);
for(let rowIndex=0;rowIndex<3;rowIndex++){const row=document.createElement('div');row.className='collage-row';const track=document.createElement('div');track.className='collage-track';const sources=shuffled.slice(rowIndex*5,rowIndex*5+5);for(let copy=0;copy<2;copy++){const group=document.createElement('div');group.className='collage-group';sources.forEach(({src})=>{const img=document.createElement('img');img.src=src;img.alt='';img.draggable=false;group.append(img)});track.append(group)}row.append(track);document.getElementById('collage').append(row)}
const revealObserver=('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}})},{threshold:0,rootMargin:'0px 0px -35px 0px'}):null;
let selected=null,sheet=0;
function updateViewer(){document.getElementById('viewer-title').textContent=selected.title;document.getElementById('viewer-sub').textContent=selected.sub;const img=document.getElementById('viewer-image');img.src=selected.images[sheet];img.alt=selected.title+' — sheet '+(sheet+1);document.getElementById('viewer-count').textContent=(sheet+1)+' / '+selected.images.length;document.getElementById('viewer-prev').disabled=sheet===0;document.getElementById('viewer-next').disabled=sheet===selected.images.length-1}
function openArt(a,index){selected=a;sheet=index;updateViewer();viewer.showModal();document.body.style.overflow='hidden'}
viewer.addEventListener('close',()=>document.body.style.overflow='');document.getElementById('close').onclick=()=>viewer.close();document.getElementById('viewer-prev').onclick=()=>{if(sheet>0){sheet--;updateViewer()}};document.getElementById('viewer-next').onclick=()=>{if(sheet<selected.images.length-1){sheet++;updateViewer()}};viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();document.getElementById('viewer-prev').click()}if(e.key==='ArrowRight'){e.preventDefault();document.getElementById('viewer-next').click()}});
function render(filter){if(revealObserver)revealObserver.disconnect();gallery.replaceChildren();artworks.filter(a=>filter==='all'||a.category===filter).forEach(a=>{let index=0;const section=document.createElement('section');section.className='project';section.dataset.category=a.category;section.innerHTML=`<div class="project-heading"><div><h2>${a.title}</h2><p>${a.sub}</p></div>${a.images.length>1?'<div class="sheet-controls"><button class="prev" aria-label="Previous sheet of '+a.title+'">←</button><span aria-live="polite"></span><button class="next" aria-label="Next sheet of '+a.title+'">→</button></div>':''}</div><button class="art-button" aria-label="Enlarge ${a.title}"><img loading="lazy" alt="${a.title}"></button>`;const img=section.querySelector('img');function update(){img.src=a.images[index];img.alt=a.title+' — sheet '+(index+1);if(a.images.length>1){section.querySelector('.sheet-controls span').textContent=(index+1)+' / '+a.images.length;section.querySelector('.prev').disabled=index===0;section.querySelector('.next').disabled=index===a.images.length-1}}if(a.images.length>1){section.querySelector('.prev').onclick=()=>{if(index>0){index--;update()}};section.querySelector('.next').onclick=()=>{if(index<a.images.length-1){index++;update()}}}section.querySelector('.art-button').onclick=()=>openArt(a,index);if(a.images.length>1)addSheetSwipe(section.querySelector('.art-button'),()=>section.querySelector('.prev').click(),()=>section.querySelector('.next').click());update();gallery.append(section);if(revealObserver){section.classList.add('reveal');revealObserver.observe(section)}})}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});render(b.dataset.filter)});render('all');

addSheetSwipe(document.querySelector('.viewer-stage'),()=>document.getElementById('viewer-prev').click(),()=>document.getElementById('viewer-next').click());
