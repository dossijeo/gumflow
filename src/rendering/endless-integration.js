background=function(){if(ef)efBackground();else EF_ORIGINAL.background()};
drawHazards=function(){EF_ORIGINAL.drawHazards();if(ef)efDrawTraps()};
// Draw only near decorative layers after world effects, with the unchanged DOM
// controls and advice balloon always on top.
render=function(){EF_ORIGINAL.render();if(ef&&['playing','dying','paused'].includes(state)){efNearLayers();if(level.boss?.active)drawBossHUD()}};

// Crossfade the old/new biome arrangements using the existing sound engine.
