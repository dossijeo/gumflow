// GUMFLOW 3 — additive expansion built on V2.
// Original 32-bar chiptune arrangements. No samples, downloaded songs, or external audio files.
const SCORE_TRACKS=[
 {title:'Piernas fuera de catálogo',bpm:164,key:52,mode:'minor',pattern:0,lead:'square',bass:'sawtooth',drum:'break'},
 {title:'No agitar / se ha agitado',bpm:172,key:50,mode:'dorian',pattern:1,lead:'triangle',bass:'square',drum:'break'},
 {title:'Azúcar en hora punta',bpm:158,key:55,mode:'major',pattern:2,lead:'square',bass:'triangle',drum:'four'},
 {title:'Cadena de frío, bajo caliente',bpm:162,key:54,mode:'minor',pattern:3,lead:'triangle',bass:'sawtooth',drum:'break'},
 {title:'Cacao de alto voltaje',bpm:150,key:45,mode:'minor',pattern:4,lead:'sawtooth',bass:'sawtooth',drum:'four'},
 {title:'Abrefácil / dificultad extrema',bpm:176,key:49,mode:'minor',pattern:5,lead:'square',bass:'square',drum:'break'},
 {title:'No masticar: persona',bpm:168,key:52,mode:'major',pattern:6,lead:'square',bass:'triangle',drum:'break'}
];
const CHIP_RIFFS=[
 [0,-1,2,4,-1,2,1,-1,0,2,4,-1,6,4,2,-1],
 [0,2,-1,4,5,-1,4,2,-1,0,1,-1,2,4,2,-1],
 [4,-1,4,5,4,2,-1,1,0,-1,2,4,5,4,2,-1],
 [0,-1,4,-1,6,5,4,-1,2,1,0,-1,1,2,4,-1],
 [0,0,-1,2,0,4,-1,2,0,0,2,4,-1,6,4,-1],
 [0,-1,2,0,4,-1,2,5,4,-1,2,0,1,2,4,-1],
 [0,-1,2,4,6,4,2,-1,1,2,4,-1,5,4,2,0]
];
