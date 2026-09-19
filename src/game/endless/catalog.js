const EF_METRES=.22/3.6,EF_BIOME_METRES=1500;
const EF_BIOMES=[
 {name:'GUM WORKS',sky:'#5589c5',bottom:'#efbccb',glow:'#ffe6a7'},
 {name:'SODA SEWERS',sky:'#153c57',bottom:'#408c83',glow:'#acffe8'},
 {name:'CANDY CITY',sky:'#715293',bottom:'#f4bba6',glow:'#ffddab'},
 {name:'FREEZER DISTRICT',sky:'#284c75',bottom:'#a2e7ed',glow:'#d9fbff'},
 {name:'CHOCOLATE FOUNDRY',sky:'#432b4e',bottom:'#c47955',glow:'#ffcb88'},
 {name:'THE WRAPPER',sky:'#413166',bottom:'#a598cc',glow:'#f1baff'},
 {name:'THE MOUTH',sky:'#582b4b',bottom:'#c484a0',glow:'#ffcbd9'}
];
const EF_GAGS=['El departamento de finales ha cerrado.','Tu contrato no especificaba kilómetros.','La meta está en otra fábrica.','Sigue recto. Para siempre es bastante recto.','Esto cuenta como cardio corporativo.','Mismo chicle. Nuevas malas decisiones.','¿Cuántas calorías tiene el infinito?','La gravedad ha renovado su suscripción.','La garantía acaba antes que el nivel.','Aquí tampoco hay un botón de salir del trabajo.'];
const EF_COFFEE=['He pedido un traslado. El nivel también.','Mi café tiene más kilómetros que yo.','Ahora lo llevo en termo. No mires así.','Hoy pesco. No pienso trabajar.','No hay descansos en un nivel infinito, ¿verdad?','A este paso me jubilo en el fondo.'];
const EF_ARCHETYPES=[
 ['wave',1,'Pendiente de aprobación','Montaña rusa de azúcar'],['loop',1,'Bucle de prueba','Órbita de chicle'],
 ['doubleloop',2,'Doble vuelta al contrato','Dos loops y un destino'],['loopgap',4,'Salida por arriba','Órbita con salto de fe'],
 ['leap',1,'Muelle opcional','Salto sin conservantes'],['islands',3,'Archipiélago dulce','Islas de bolsillo'],
 ['springs',2,'Cadena de gelatina','Rebotes en serie'],['sling',3,'Tirachinas con sentimientos','Catapulta de autor'],
 ['sticky',4,'Paredes cariñosas','Abrazo con devolución'],['tower',3,'Ruta de las azoteas','Ático sin ascensor'],
 ['bubble',2,'Ascensor efervescente','Doble burbuja'],['soda',1,'Refresco en tránsito','Espuma ascendente'],
 ['fan',2,'Viento a favor','Turbina de bolsillo'],['ice',2,'Hockey involuntario','Media luna helada'],
 ['hot',3,'De frío a picante','Templado a la carrera'],['acid',3,'Acidez administrativa','La barrera es comestible'],
 ['heavy',3,'Peso neto','Galleta estructural'],['wrap',4,'Vacío de embalaje','Devolución sin caja'],
 ['roller',1,'Formato familiar','Reunión de cubitos'],['slalom',2,'Dientes de azúcar','Salto con letra pequeña'],
 ['press',4,'Prensa con preaviso','Dos sellos obligatorios'],['tube',1,'Pajita panorámica','Tubo de contrabando'],
 ['tongue',2,'Lengua de gelatina','Conversación elástica'],['vacuum',5,'Vacío existencial','Corriente cruzada']
];
const EF_MODULES=EF_ARCHETYPES.flatMap(([kind,min,a,b])=>[a,b].map((name,variant)=>({
 id:kind+'-'+variant,kind,min,name,variant,length:3400+variant*650,
 entry:{height:560,type:'ground',minSpeed:0,maxSpeed:1550},exit:{height:560,type:'ground',minSpeed:0,maxSpeed:1550},
 tags:[kind,['sling','sticky','tower','bubble'].includes(kind)?'aerial':'ground'],
 difficulty:min+variant*.4
})));
