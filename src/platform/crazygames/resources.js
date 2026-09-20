/* Lazy visual assets: preserve the original Image objects used by the renderer.
 * No fetches in image(): merely declaring seven worlds must not load them all. */
(function(root){
  'use strict';
  function createResources(){
    const sources=new Map(), jobs=new WeakMap(), completed=new Set();
    function image(src){const img=new Image();sources.set(img,src);return img;}
    function ensure(img){
      if(img.naturalWidth>0)return Promise.resolve(img);
      if(jobs.has(img))return jobs.get(img);
      const src=sources.get(img);if(!src)return Promise.reject(new Error('Unregistered image'));
      const job=new Promise((resolve,reject)=>{
        const done=(err)=>{clearTimeout(timer);img.onload=img.onerror=null;if(err){jobs.delete(img);reject(err)}else{completed.add(src);resolve(img)}};
        const timer=setTimeout(()=>done(new Error('Image timeout: '+src)),20000);
        img.onload=()=>done();img.onerror=()=>done(new Error('Image missing or unreadable: '+src+'. Upload ALL files from the CrazyGames ZIP.'));
        img.src=src;
      });
      jobs.set(img,job);return job;
    }
    async function group(images){await Promise.all(images.map(ensure));}
    // One file at a time, after real gameplay. A missing later world cannot
    // prevent the current world from running; entering it retries explicitly.
    async function warm(images){for(const img of images){try{await ensure(img);}catch(e){console.warn('GUMFLOW optional preload:',e.message);}await new Promise(r=>setTimeout(r,80));}}
    return {image,ensure,group,warm,info:()=>({declared:sources.size,loaded:[...completed]})};
  }
  root.GumflowCGResources={createResources};
})(globalThis);
