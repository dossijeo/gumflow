function say(who,text,d=4.5){$('speaker').textContent=who;$('speech').textContent=text;$('dialogue').classList.add('show');dialogueTime=d}
function award(id){if(profile.achievements.includes(id))return;profile.achievements.push(id);persist();toast('✓ '+ACHIEVEMENTS[id]);sound('check')}
