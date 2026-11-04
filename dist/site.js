const english=document.documentElement.lang==='en';
const LANG_COUNTRIES={cin:'china',japonya:'japan','guney-kore':'south-korea',singapur:'singapore','hong-kong':'hong-kong'};
const LANG_FIELDS={'Bilgisayar ve teknoloji':'computing-technology',Bilim:'science','Dil ve kültür':'language-culture',Ekonomi:'economics','Mühendislik':'engineering',Sağlık:'health','Sosyal bilimler':'social-sciences',Tasarım:'design',Teknoloji:'technology',Yönetim:'management',İşletme:'business'};
const reverseMap=map=>Object.fromEntries(Object.entries(map).map(([a,b])=>[b,a]));
const LANG_BACK_COUNTRIES=reverseMap(LANG_COUNTRIES),LANG_BACK_FIELDS=reverseMap(LANG_FIELDS);
document.querySelectorAll('.lang-switch a').forEach(a=>a.addEventListener('click',()=>{
 const u=new URL(a.href),source=new URLSearchParams(location.search),targetEnglish=a.lang==='en'||u.hostname==='educationinasia.com';
 const country=source.get('ulke')||source.get('country'),field=source.get('alan')||source.get('field');
 const mapped=new URLSearchParams();
 if(country){
   const value=targetEnglish?(LANG_COUNTRIES[country]||(Object.hasOwn(LANG_BACK_COUNTRIES,country)?country:null)):(LANG_BACK_COUNTRIES[country]||(Object.hasOwn(LANG_COUNTRIES,country)?country:null));
   if(value)mapped.set(targetEnglish?'country':'ulke',value);
 }
 if(field){
   const value=targetEnglish?(LANG_FIELDS[field]||(Object.hasOwn(LANG_BACK_FIELDS,field)?field:null)):(LANG_BACK_FIELDS[field]||(Object.hasOwn(LANG_FIELDS,field)?field:null));
   if(value)mapped.set(targetEnglish?'field':'alan',value);
 }
 for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid']){
  const value=source.get(key);if(value&&value.length<=150&&/^[\w\- .]+$/.test(value))mapped.set(key,value);
 }
 u.search=mapped.toString();u.hash='';a.href=u.href;
}));
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
// A country name is a real page link; a separate, accessible button expands its submenu.
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
const mobileNavigation=typeof matchMedia==='function'?matchMedia('(max-width: 1140px)'):{matches:false},countryMenus=[];
document.querySelectorAll('.nav-trigger[data-country]').forEach(trigger=>{
 const item=trigger.closest('.nav-item');
 const dropdown=item&&Array.from(item.children).find(child=>child.classList.contains('dropdown'));
 if(!item||!dropdown)return;
 const name=trigger.querySelector('span:not(.flag)')?.textContent.trim()||trigger.dataset.country;
 dropdown.id='country-menu-'+trigger.dataset.country;
 trigger.removeAttribute('aria-expanded');
 trigger.removeAttribute('aria-haspopup');
 const button=document.createElement('button');
 button.type='button';button.className='nav-expand';button.textContent='⌄';
 button.setAttribute('aria-controls',dropdown.id);
 const setOpen=open=>{
  item.classList.toggle('open',open);
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',english?(open?'Close ':'Open ')+name+' submenu':name+(open?' alt menüsünü kapat':' alt menüsünü aç'));
 };
 setOpen(false);
 item.insertBefore(button,dropdown);
 countryMenus.push({item,button,setOpen});
 button.addEventListener('click',()=>{
  const open=!item.classList.contains('open');
  countryMenus.forEach(entry=>entry.setOpen(false));
  setOpen(open);
 });
});
const closeCountryMenus=()=>countryMenus.forEach(entry=>entry.setOpen(false));
const setMenuOpen=(open,restoreFocus=false)=>{
 nav?.classList.toggle('open',open);
 menu?.setAttribute('aria-expanded',String(open));
 menu?.setAttribute('aria-label',open?(english?'Close menu':'Menüyü kapat'):(english?'Open menu':'Menüyü aç'));
 if(!open)closeCountryMenus();
 if(restoreFocus)menu?.focus();
};
menu?.addEventListener('click',()=>setMenuOpen(!nav.classList.contains('open')));
document.addEventListener?.('keydown',event=>{
 if(event.key==='Escape'&&nav?.classList.contains('open'))setMenuOpen(false,true);
});
document.addEventListener?.('click',event=>{
 if(nav?.classList.contains('open')&&!event.target.closest?.('header'))setMenuOpen(false);
});
mobileNavigation.addEventListener?.('change',event=>{
 if(!event.matches)setMenuOpen(false);
});

// URL state stores only the chosen country and field; free-text search never enters the URL.
const search=document.querySelector('#school-search'),country=document.querySelector('#country-filter'),theme=document.querySelector('#theme-filter');
if(search&&country&&theme){
 const rows=[...document.querySelectorAll('.school-row')];
 if(english){
  const synonyms={'çin':'china','pekin':'beijing','şanghay':'shanghai','japonya':'japan','güney kore':'south korea','singapur':'singapore'};
  rows.forEach(row=>{const raw=row.dataset.search||'';row.dataset.search=raw+' '+Object.entries(synonyms).filter(([tr])=>raw.includes(tr)).map(([,en])=>en).join(' ')});
 }
 const count=document.querySelector('#result-count'),empty=document.querySelector('#empty-state');
 const controls=document.querySelector('.list-controls');
 const toolbar=document.createElement('div');toolbar.className='filter-toolbar';
 const chips=document.createElement('div');chips.className='active-filters';
 chips.setAttribute('role','group');
 chips.setAttribute('aria-label',english?'Active filters':'Aktif filtreler');
 const actions=document.createElement('div');actions.className='filter-quick-actions';
 const searchClear=document.createElement('button');
 searchClear.type='button';searchClear.className='search-clear';
 searchClear.textContent=english?'Clear search':'Aramayı temizle';
 const reset=document.createElement('button');
 reset.type='button';reset.className='filters-reset';
 reset.textContent=english?'Clear all filters':'Tüm filtreleri temizle';
 actions.append(searchClear,reset);toolbar.append(chips,actions);controls?.after(toolbar);
 count?.setAttribute('aria-live','polite');count?.setAttribute('aria-atomic','true');
 const readFilters=()=>{
  const params=new URLSearchParams(location.search);
  const rawCountry=english?(LANG_BACK_COUNTRIES[params.get('country')]||params.get('ulke')):(params.get('ulke')||LANG_BACK_COUNTRIES[params.get('country')]);
  const rawField=english?(LANG_BACK_FIELDS[params.get('field')]||params.get('alan')):(params.get('alan')||LANG_BACK_FIELDS[params.get('field')]);
  country.value=[...country.options].some(o=>o.value===rawCountry)?rawCountry:'';
  theme.value=[...theme.options].some(o=>o.value===rawField)?rawField:'';
 };
 const writeFilters=()=>{
  const url=new URL(location.href);
  for(const key of ['ulke','country','alan','field'])url.searchParams.delete(key);
  if(country.value)url.searchParams.set(english?'country':'ulke',english?LANG_COUNTRIES[country.value]:country.value);
  if(theme.value)url.searchParams.set(english?'field':'alan',english?LANG_FIELDS[theme.value]:theme.value);
  if(url.href!==location.href)history.pushState(null,'',url.href);
 };
 const render=()=>{
  const q=search.value.toLocaleLowerCase(english?'en':'tr').trim(),c=country.value,t=theme.value;
  let shown=0;
  rows.forEach(row=>{
   const words=(row.dataset.search||'').toLocaleLowerCase(english?'en':'tr');
   const fields=(row.dataset.themes||'').split('|');
   const visible=(!q||words.includes(q))&&(!c||row.dataset.country===c)&&(!t||fields.includes(t));
   row.hidden=!visible;if(visible)shown++;
  });
  if(count)count.textContent=shown+(english?' universities shown':' okul gösteriliyor');
  if(empty)empty.style.display=shown?'none':'block';
  chips.replaceChildren();
  const chip=(key,text,clear)=>{
   const button=document.createElement('button');
   button.type='button';button.className='filter-chip';button.dataset.filter=key;
   button.textContent=text+' ×';
   button.setAttribute('aria-label',(english?'Remove filter: ':'Filtreyi kaldır: ')+text);
   button.addEventListener('click',clear);
   chips.append(button);
  };
  if(c)chip('country',country.options[country.selectedIndex]?.text||c,()=>{country.value='';commit()});
  if(t)chip('field',theme.options[theme.selectedIndex]?.text||t,()=>{theme.value='';commit()});
  if(q)chip('search',english?'Search: '+search.value:'Arama: '+search.value,()=>{search.value='';render()});
  searchClear.hidden=!search.value;
  reset.hidden=!(c||t||search.value.trim());
  toolbar.hidden=!(c||t||search.value.trim());
 };
 const commit=()=>{writeFilters();render()};
 for(const control of [country,theme]){control.addEventListener('change',commit)}
 search.addEventListener('input',render);
 searchClear.addEventListener('click',()=>{search.value='';render();search.focus()});
 reset.addEventListener('click',()=>{search.value='';country.value='';theme.value='';commit()});
 globalThis.addEventListener?.('popstate',()=>{search.value='';readFilters();render()});
 readFilters();render();
}
const pc=document.querySelector('#program-country');if(pc){const p=new URLSearchParams(location.search).get('ulke');if(p&&[...pc.options].some(o=>o.value===p))pc.value=p;pc.addEventListener('change',()=>{const url=new URL(location.href);pc.value?url.searchParams.set('ulke',pc.value):url.searchParams.delete('ulke');history.replaceState(null,'',url);document.querySelectorAll('.program-card').forEach(el=>el.hidden=!!pc.value&&!el.dataset.countries.split(',').includes(pc.value))});pc.dispatchEvent(new Event('change'))}
// Keep the static program discovery grid consistent with the existing destination selector.
const programDiscoveryCards=[...document.querySelectorAll('.discovery-program-card')];
if(pc&&programDiscoveryCards.length){
 const syncRelatedPrograms=()=>{
  const selected=pc.value;
  for(const card of programDiscoveryCards){
   const countries=card.dataset.countries?.split(',')||[];
   card.hidden=!!selected&&!countries.includes(selected);
   card.querySelectorAll('.discovery-program-school').forEach(link=>{
    link.hidden=selected?link.dataset.country!==selected:link.dataset.featured==='false';
   });
   const all=card.querySelector('a.discovery-all-field');
   if(!all)continue;
   if(!all.dataset.baseHref)all.dataset.baseHref=all.getAttribute('href');
   const url=new URL(all.dataset.baseHref,location.href);
   url.searchParams.delete('ulke');
   url.searchParams.delete('country');
   if(selected)url.searchParams.set(english?'country':'ulke',english?LANG_COUNTRIES[selected]:selected);
   all.href=url.pathname+url.search;
  }
 };
 pc.addEventListener('change',syncRelatedPrograms);
 syncRelatedPrograms();
}
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
  // Never forward arbitrary query parameters (which may contain personal information).
  const sourceUrl=new URL(location.href);
  fields._url=sourceUrl.origin+sourceUrl.pathname;
  fields['Site language']=english?'en':'tr';
  const allowedCampaignFields={
    utm_source:'Campaign source',
    utm_medium:'Campaign medium',
    utm_campaign:'Campaign name',
    utm_content:'Campaign content'
  };
  for(const [key,label] of Object.entries(allowedCampaignFields)){
    const value=sourceUrl.searchParams.get(key);
    if(value&&value.length<=100&&/^[A-Za-z0-9 _.-]+$/.test(value))fields[label]=value;
  }
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
