const english=document.documentElement.lang==='en';
document.querySelectorAll('.lang-switch a').forEach(a=>a.addEventListener('click',()=>{const u=new URL(a.href);u.search=location.search;u.hash=location.hash;a.href=u.href;}));
// Keep footer navigation on the canonical site, including when served from preview workers.dev hosts.
document.querySelectorAll('footer a[href]').forEach(link => {
  const raw = link.getAttribute('href');
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
    link.href = new URL(raw, 'https://asyadaegitim.com').href;
  } else if (raw && /^https:\/\/asyadaegitim-preview\.[^/]+\.workers\.dev(?=\/|$)/i.test(raw)) {
    const preview = new URL(raw);
    link.href = 'https://asyadaegitim.com' + preview.pathname + preview.search + preview.hash;
  }
});
// Keep all China Education links on the official domain.
document.querySelectorAll('a[href="https://cinegitim-kesfet.adnanakfirat.chatgpt.site/"]').forEach(link => { link.href = 'https://cinegitim.com/'; });
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?(english?'Close menu':'Menüyü kapat'):(english?'Open menu':'Menüyü aç'))});
document.querySelectorAll('.nav-trigger[data-country]').forEach(trigger=>{trigger.addEventListener('click',event=>{if(matchMedia('(max-width:980px)').matches){event.preventDefault();const item=trigger.closest('.nav-item'),open=item.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open))}})});
const search=document.querySelector('#school-search'),country=document.querySelector('#country-filter'),theme=document.querySelector('#theme-filter');
if(search&&country&&theme){if(english){const synonyms={'çin':'china','pekin':'beijing','şanghay':'shanghai','japonya':'japan','güney kore':'south korea','singapur':'singapore'};document.querySelectorAll('.school-row').forEach(row=>{const raw=row.dataset.search||'';row.dataset.search=raw+' '+Object.entries(synonyms).filter(([tr])=>raw.includes(tr)).map(([,en])=>en).join(' ');});}const params=new URLSearchParams(location.search),preset=params.get('ulke');if(preset&&[...country.options].some(o=>o.value===preset))country.value=preset;const presetTheme=params.get('alan');if(presetTheme&&[...theme.options].some(o=>o.value===presetTheme))theme.value=presetTheme;const update=()=>{const q=search.value.toLocaleLowerCase(english?'en':'tr').trim(),c=country.value,t=theme.value;let n=0;document.querySelectorAll('.school-row').forEach(row=>{const show=(!q||row.dataset.search.includes(q))&&(!c||row.dataset.country===c)&&(!t||row.dataset.themes.includes(t));row.hidden=!show;if(show)n++});document.querySelector('#result-count').textContent=n+(english?' universities shown':' okul gösteriliyor');document.querySelector('#empty-state').style.display=n?'none':'block';const url=new URL(location.href);c?url.searchParams.set('ulke',c):url.searchParams.delete('ulke');history.replaceState(null,'',url)};[search,country,theme].forEach(x=>x.addEventListener('input',update));update()}
const pc=document.querySelector('#program-country');if(pc){const p=new URLSearchParams(location.search).get('ulke');if(p&&[...pc.options].some(o=>o.value===p))pc.value=p;pc.addEventListener('change',()=>{const url=new URL(location.href);pc.value?url.searchParams.set('ulke',pc.value):url.searchParams.delete('ulke');history.replaceState(null,'',url);document.querySelectorAll('.program-card').forEach(el=>el.hidden=!!pc.value&&!el.dataset.countries.split(',').includes(pc.value))});pc.dispatchEvent(new Event('change'))}
const track=document.querySelector('#featured-track');document.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>{if(!track)return;const card=track.querySelector('.featured-card');track.scrollBy({left:(button.dataset.slide==='next'?1:-1)*((card?.getBoundingClientRect().width||320)+(parseFloat(getComputedStyle(track).columnGap)||0)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}));

const consultationForm=document.querySelector('#consultation-form');
consultationForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!consultationForm.reportValidity())return;
  const button=consultationForm.querySelector('button[type="submit"]');
  const status=consultationForm.querySelector('#form-status');
  const original=button.textContent;
  const fields=Object.fromEntries(new FormData(consultationForm).entries());
  fields._subject=english?'Asya’da Eğitim — Free Pre-Consultation Request':'Asya’da Eğitim — Ücretsiz Ön Görüşme Talebi';
  fields._url=location.href;
  button.disabled=true;
  button.textContent=english?'Sending…':'Gönderiliyor…';
  status.hidden=true;
  try{
    const response=await fetch('https://formsubmit.co/ajax/info@asyadaegitim.com',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(fields)
    });
    const result=await response.json();
    if(!response.ok||result.success===false||result.success==='false')throw new Error('Submission rejected');
    consultationForm.reset();
    status.textContent=english?'Your request has been submitted. We will get back to you as soon as possible.':'Talebiniz gönderildi. En kısa sürede sizinle iletişime geçeceğiz.';
    status.hidden=false;
    status.dataset.state='success';
  }catch(error){
    status.textContent=english?'We could not send your request. Please try again or email info@asyadaegitim.com directly.':'Talebiniz gönderilemedi. Lütfen yeniden deneyin veya info@asyadaegitim.com adresine doğrudan yazın.';
    status.hidden=false;
    status.dataset.state='error';
  }finally{
    button.disabled=false;
    button.textContent=original;
  }
});
