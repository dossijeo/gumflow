function startRun(index=0,immediate=false){
 clearInput();run={lives:3,sugar:0,score:0,totalSugar:0,totalDeaths:0,totalTime:0,results:[],practice:index!==0,stars:0};
 loadLevel(index);audioStart();sound('start');if(immediate){hideOverlay();state='playing'}else story(index);saveSession();
}

function loadLevel(index){
 levelIndex=index;level=makeLevel(index);levelTime=0;levelCollected=0;levelDeaths=0;peakSpeed=0;checkpoint=0;particles=[];floaters=[];trails=[];
 resetPlayer(level.spawn,1.7);initPlayerExtras();camX=-80;camY=player.y-worldH*.65;zoom=1;bannerTime=3.4;tipTime=0;toastTime=0;deathTimer=0;transitionTimer=0;dialogueTime=0;chapter=-1;
 stageBase={score:run.score,sugar:run.sugar,totalSugar:run.totalSugar,totalDeaths:run.totalDeaths,stars:run.stars};
 $('levelName').textContent=level.name;$('levelCounter').textContent=`0${index+1} / 07`;$('dialogue').classList.remove('show');$('tip').classList.remove('show');$('toast').classList.remove('show');refreshHUD();
}

