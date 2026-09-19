function efHash(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function efRandom(){let a=ef.rng=(ef.rng+0x6D2B79F5)|0;a=Math.imul(a^a>>>15,a|1);a^=a+Math.imul(a^a>>>7,a|61);return ((a^a>>>14)>>>0)/4294967296}
function efNoise(n,salt=0){let a=(n^salt^0x9E3779B9)>>>0;a=Math.imul(a^(a>>>16),0x21f0aaad);a=Math.imul(a^(a>>>15),0x735a2d97);return ((a^(a>>>15))>>>0)/4294967296}
function efNewSeed(){const v=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(v);else v[0]=Date.now();return 'GUM-'+v[0].toString(36).toUpperCase()}
function efEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function efNumber(n){return Math.floor(n||0).toLocaleString(document.documentElement.lang==='en'?'en-US':'es-ES')}
function efDistance(m){return m>=10000?(m/1000).toLocaleString('es-ES',{maximumFractionDigits:2})+' km':efNumber(m)+' m'}
function efDuration(s){return s>=3600?Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'m':formatTime(s||0)}
function efGetDistance(){return ef?Math.max(0,(ef.maxGlobal-150)*EF_METRES):0}
