function ambient61Pattern(ac,bus,noise,world,beat,at,beatSec,energy,pc,mood){
 const k=beat%8,flowEnergy=clamp(energy/100,0,1),e=(.8+flowEnergy*.25)*[3.4,3.1,3.6,5.2,4.5,5.5,3.0][world],boost=mood==='epic'?1.16:mood==='tension'?.67:1;
 const tone=(n,d,v,type='sine',cut=4200,slide=0,pan=0,delay=0)=>ambient61Tone(ac,bus,n,at+delay,d,v*e*boost,type,cut,slide,pan);
 const hiss=(d,v,f,q=.8,pan=0,delay=0)=>ambient61Noise(ac,bus,noise,at+delay,d,v*e*boost,f,q,pan);
 // A sparse layer should be recognizable, not louder than the supplied arrangements.
 switch(world){
  case 0: // Gum Works: alternating machine taps + a short pneumatic breath.
   if(k%2===0){tone(48+pc,.12,.052,'triangle',1700,0,-.27);tone(67+pc,.065,.023,'sine',3800,0,.24,.018)}
   if(k===2||k===6)hiss(.075,.072,2300,1,.2);
   if(k===0)hiss(.43,.065,800,.7,-.24);
   if(flowEnergy>.7&&k===7)hiss(.04,.045,3700,1.1,.3,beatSec*.5);
   break;
  case 1: // Soda Sewers: rounded drops, fizz and stereo bubbles.
   if(k%2===0)tone(76+pc,.15,.061,'sine',4200,-12,k%4===0?-.45:.45);
   if(k===1||k===5)tone(88+pc,.085,.032,'sine',6500,-7,.22,beatSec*.5);
   if(k===0||k===4)hiss(.6,.048,4600,.65,-.24);
   break;
  case 2: // Candy City: restrained bell/pluck colors on the current harmony.
   if(k%2===0){tone(72+pc,.26,.047,'sine',7200,0,k%4===0?-.3:.3);tone(84+pc,.13,.012,'triangle',5400,0,.24,.004)}
   if(k===7&&flowEnergy>.6)tone(84+pc,.18,.024,'sine',8000,0,-.2,beatSec*.5);
   if(k===4)hiss(.05,.025,7100,.8,.2);
   break;
  case 3: // Freezer: filtered wind, one crystalline accent, no new melody.
   if(k===0||k===4){hiss(.95,.073,1450,.5,-.3);hiss(.68,.024,5700,.7,.36,beatSec*.5)}
   if(k===2) {tone(84+pc,.72,.032,'sine',9300,0,.25);tone(72+pc,.68,.016,'triangle',3000,0,-.22,.015)}
   break;
  case 4: // Foundry: furnace breath, low unpitched/brief impacts, not another bass line.
   if(k===0||k===4){hiss(.8,.20,145,.65,-.15);tone(36+pc,.14,.055,'triangle',680,-12,0)}
   if(k===2||k===6){hiss(.13,.10,590,1.2,.3);tone(60+pc,.12,.025,'sine',1400,0,-.25)}
   if(mood==='epic'&&k===7)hiss(.055,.055,1700,1,.2,beatSec*.5);
   break;
  case 5: // Wrapper: dry clicks, paper friction, occasional half-beat mechanism.
   hiss(.027,.052,k%2?4700:3300,1,k%2?.33:-.33);
   if(k%4===0)hiss(.24,.088,2350,.6,-.2);
   if(k===2||k===6)tone(84+pc,.032,.020,'square',5200,0,.22);
   if(flowEnergy>.6||mood==='epic')hiss(.023,.027,6200,.8,-.15,beatSec*.5);
   break;
  case 6: // Mouth: deliberately cartoonish pops and small, soft organic drums.
   if(k%2===0){tone(55+pc,.12,.065,'sine',1700,-12,k%4===0?-.25:.25);hiss(.085,.040,950,1.2,.2)}
   if(k===1||k===5)tone(81+pc,.075,.033,'triangle',3600,-10,-.3,beatSec*.48);
   if(k===4)hiss(.33,.035,3100,.65,.2);
   break;
 }
}
