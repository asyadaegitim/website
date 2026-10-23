// Keep local links on the current host: on a preview build, unreleased
// editorial guides must never silently redirect to the old live website.
// Relative links also work unmodified once the site is eventually published.
const footerLinks = document.querySelector('.footer-links');
if (footerLinks && !footerLinks.querySelector('[data-guide-link]')) {
  for (const [name, href] of [
    ['Neden Asya?', '/neden-asya/'],
    ['Burslar ve Maliyetler', '/burslar-ve-maliyetler/'],
    ['Üniversite Bursları', '/universite-burslari/'],
    ['Başvuru Rehberi', '/basvuru-rehberi/'],
    ['Ülke Karşılaştırması', '/ulkeler/karsilastirma/'],
    ['Hakkımızda', '/hakkimizda/']
  ]) {
    const item = document.createElement('a');
    item.href = href;
    item.textContent = name;
    item.setAttribute('data-guide-link', '');
    footerLinks.appendChild(item);
  }
}
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
/* Preview: make catalogue guides discoverable on every existing route. */
if(nav && !nav.querySelector('.nav-guides')) {
  const countries=['cin','hong-kong','guney-kore','japonya','singapur'];
  const items=new Map([...nav.querySelectorAll('.nav-item')].map(item=>[item.querySelector('[data-country]')?.dataset.country,item]).filter(([k])=>k));
  const universityLink=nav.querySelector('a[href="/okullar/"]:not(.dropdown a)')?.closest('.nav-item');
  for(const slug of countries) {
    const item=items.get(slug);
    if(item && universityLink) nav.insertBefore(item,universityLink);
  }
  const guide=document.createElement('div');
  guide.className='nav-item nav-guides';
  guide.innerHTML='<a class="nav-trigger" href="/universite-burslari/">Üniversite Bursları</a>';
  nav.append(guide);
  for(const item of items.values()) {
    const submenu=item.querySelector('.dropdown');
    if(submenu && !submenu.querySelector('.catalog-links')) {
      const region=document.createElement('div');
      region.className='catalog-links';
      region.innerHTML='<div class="eyebrow">Rehberler</div><a href="/universite-burslari/">Üniversite Bursları</a><a href="/burslar-ve-maliyetler/">Burslar ve Maliyetler</a><a href="/basvuru-rehberi/">Başvuru Rehberi</a><a href="/ulkeler/karsilastirma/">Ülkeleri Karşılaştır</a>';
      submenu.append(region);
    }
  }
}

menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç')});
document.querySelectorAll('.nav-trigger[data-country]').forEach(trigger=>{trigger.addEventListener('click',event=>{if(matchMedia('(max-width:980px)').matches){event.preventDefault();const item=trigger.closest('.nav-item'),open=item.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open))}})});
const search=document.querySelector('#school-search'),country=document.querySelector('#country-filter'),theme=document.querySelector('#theme-filter');
if(search&&country&&theme){const params=new URLSearchParams(location.search),preset=params.get('ulke');if(preset&&[...country.options].some(o=>o.value===preset))country.value=preset;const presetTheme=params.get('alan');if(presetTheme&&[...theme.options].some(o=>o.value===presetTheme))theme.value=presetTheme;const update=()=>{const q=search.value.toLocaleLowerCase('tr').trim(),c=country.value,t=theme.value;let n=0;document.querySelectorAll('.school-row').forEach(row=>{const show=(!q||row.dataset.search.includes(q))&&(!c||row.dataset.country===c)&&(!t||row.dataset.themes.includes(t));row.hidden=!show;if(show)n++});document.querySelector('#result-count').textContent=n+' okul gösteriliyor';document.querySelector('#empty-state').style.display=n?'none':'block';const url=new URL(location.href);c?url.searchParams.set('ulke',c):url.searchParams.delete('ulke');history.replaceState(null,'',url)};[search,country,theme].forEach(x=>x.addEventListener('input',update));update()}
const pc=document.querySelector('#program-country');if(pc){const p=new URLSearchParams(location.search).get('ulke');if(p&&[...pc.options].some(o=>o.value===p))pc.value=p;pc.addEventListener('change',()=>{const url=new URL(location.href);pc.value?url.searchParams.set('ulke',pc.value):url.searchParams.delete('ulke');history.replaceState(null,'',url);document.querySelectorAll('.program-card').forEach(el=>el.hidden=!!pc.value&&!el.dataset.countries.split(',').includes(pc.value))});pc.dispatchEvent(new Event('change'))}
const track=document.querySelector('#featured-track');document.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>{if(!track)return;const card=track.querySelector('.featured-card');track.scrollBy({left:(button.dataset.slide==='next'?1:-1)*((card?.getBoundingClientRect().width||320)+(parseFloat(getComputedStyle(track).columnGap)||0)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}));
document.querySelector('#consultation-form')?.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget),subject='Asya’da Eğitim ücretsiz ön görüşme',body=`Ad Soyad: ${data.get('name')}\nE-posta: ${data.get('email')}\nİlgilendiğim ülke: ${data.get('country')}\nHedefim: ${data.get('goal')||'-'}`;location.href=`mailto:info@cinegitim.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`});
