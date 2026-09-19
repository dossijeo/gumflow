/** Pure standard-layout adapter, shared by browser Gamepad and gilrs snapshots.
 * No physics changes: horizontal stick input has a dead zone, then uses the same
 * left/right actions as keyboard/touch. Unknown browser mappings fail closed.
 */
const GFPadCore = (() => {
  const empty = () => ({left:false,right:false,up:false,down:false,jump:false,
    elastic:false,accept:false,back:false,pause:false,fullscreen:false,previous:false,next:false});
  const finite = n => Number.isFinite(n) ? n : 0;
  const limit = (n, min, max) => Math.max(min, Math.min(max, finite(n)));
  function button(pad, index) {
    const b = pad?.buttons?.[index];
    return typeof b === 'number' ? b > .5 : !!b?.pressed || finite(b?.value) > .5;
  }
  function read(pad, deadzone = .24, previous = empty()) {
    if (!pad || pad.connected === false || pad.mapping !== 'standard') return empty();
    const threshold = limit(deadzone, .12, .45), release = threshold * .72;
    const x = limit(pad.axes?.[0], -1, 1), y = limit(pad.axes?.[1], -1, 1);
    const held = (negative, positive, axis, oldNegative, oldPositive) => {
      let a = negative || axis < -(oldNegative ? release : threshold);
      let b = positive || axis > (oldPositive ? release : threshold);
      if (a && b) { a = false; b = false; }
      return [a,b];
    };
    const [left,right] = held(button(pad,14),button(pad,15),x,previous.left,previous.right);
    const [up,down] = held(button(pad,12),button(pad,13),y,previous.up,previous.down);
    return {left,right,up,down,jump:button(pad,0),accept:button(pad,0),
      elastic:button(pad,1)||button(pad,2)||button(pad,5)||button(pad,7),
      back:button(pad,1),pause:button(pad,9),fullscreen:button(pad,3),
      previous:button(pad,4),next:button(pad,5)};
  }
  function merge(base, pad) {
    const out = {...base, left:!!(base.left||pad.left),right:!!(base.right||pad.right),
      jump:!!(base.jump||pad.jump),elastic:!!(base.elastic||pad.elastic)};
    if (out.left && out.right) { out.left=false; out.right=false; }
    return out;
  }
  function active(s) { return Object.values(s).some(Boolean); }
  function choose(pads, currentKey, prefix) {
    const valid = Array.from(pads||[]).filter(p=>p&&p.connected!==false&&p.mapping==='standard');
    return valid.find(p=>`${prefix}:${p.index}`===currentKey) || valid.find(p=>active(read(p))) || valid[0] || null;
  }
  // Menu navigation chooses the nearest selectable control in the requested
  // direction. If there is none, wrap in DOM order. Invisible items are omitted.
  function neighbor(items, current, direction) {
    if (!items.length) return -1;
    if (current < 0 || current >= items.length) return 0;
    const a=items[current], horizontal=direction==='left'||direction==='right';
    const sign=direction==='left'||direction==='up'?-1:1;
    const ax=a.x+a.width/2, ay=a.y+a.height/2;
    let best=-1, score=Infinity;
    items.forEach((b,i)=>{
      if (i===current) return;
      const dx=b.x+b.width/2-ax,dy=b.y+b.height/2-ay;
      const forward=(horizontal?dx:dy)*sign,side=Math.abs(horizontal?dy:dx);
      if (forward<=2) return;
      const candidate=forward+side*3;
      if (candidate<score) {score=candidate;best=i;}
    });
    return best>=0?best:(current+sign+items.length)%items.length;
  }
  return Object.freeze({empty,read,merge,button,active,choose,neighbor});
})();
