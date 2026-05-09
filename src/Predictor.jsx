import { useState, useMemo, useEffect } from "react";
import { useAuth, AuthModal, ProModal, UserMenu, supabase } from "./Auth.jsx";

const BACKEND_URL = "https://matchcast-backend-production.up.railway.app";

const shortName = (t) => {
  if(!t) return "";
  if(t.length <= 12) return t;
  const words = t.split(" ");
  if(words.length >= 2) return words[0] + " " + words[1].slice(0,3) + ".";
  return t.slice(0,12);
};

// ── WK Data ──────────────────────────────────────────────
const ELO = {"Spain":2105,"Argentina":2061,"France":2026,"England":1966,"Portugal":1941,"Brazil":1936,"Ecuador":1931,"Colombia":1928,"Netherlands":1925,"Germany":1920,"Japan":1916,"Morocco":1913,"Turkey":1901,"Croatia":1899,"Uruguay":1878,"Mexico":1869,"Senegal":1867,"Norway":1862,"Switzerland":1861,"Italy":1860,"Paraguay":1850,"Australia":1845,"Belgium":1835,"Denmark":1834,"South Korea":1822,"Canada":1819,"Iran":1819,"Austria":1808,"Nigeria":1803,"Algeria":1796,"Russia":1786,"Uzbekistan":1784,"Panama":1783,"Ukraine":1776,"United States":1772,"Scotland":1766,"Egypt":1761,"Venezuela":1759,"Serbia":1757,"Ivory Coast":1752,"Greece":1747,"Poland":1739,"Hungary":1732,"Sweden":1732,"Kosovo":1730,"Chile":1725,"DR Congo":1725,"Iraq":1724,"Czech Republic":1723,"Jordan":1719,"Wales":1713,"Slovenia":1721,"Slovakia":1680,"Republic of Ireland":1704,"Romania":1639,"Georgia":1637,"Israel":1637,"Bosnia and Herzegovina":1632,"North Macedonia":1623,"Albania":1654,"Cape Verde":1652,"Mali":1653,"Burkina Faso":1642,"Saudi Arabia":1665,"United Arab Emirates":1628,"South Africa":1621,"Cameroon":1688,"Tunisia":1699,"Ghana":1598,"Iceland":1592,"Qatar":1578,"Montenegro":1494,"Bolivia":1689,"Peru":1692,"Honduras":1653,"Jamaica":1644,"Haiti":1653,"Costa Rica":1694,"El Salvador":1482,"Guatemala":1618,"Nicaragua":1491,"Trinidad and Tobago":1527,"Curacao":1569,"Kenya":1470,"Uganda":1506,"Zambia":1510,"Angola":1545,"Mozambique":1495,"Namibia":1431,"Zimbabwe":1432,"Gambia":1507,"Libya":1534,"Sudan":1471,"Ethiopia":1400,"Togo":1469,"Benin":1553,"Guinea":1540,"Mauritania":1430,"Malawi":1424,"Rwanda":1444,"Comoros":1460,"Sierra Leone":1472,"Guinea-Bissau":1365,"Congo":1352,"Equatorial Guinea":1451,"Madagascar":1505,"Botswana":1397,"Eswatini":1330,"Lesotho":1421,"Faroe Islands":1442,"Malta":1360,"Cyprus":1386,"Andorra":1168,"Luxembourg":1424,"Liechtenstein":1064,"San Marino":977,"Gibraltar":1143,"China PR":1539,"Thailand":1526,"Malaysia":1498,"Singapore":1336,"Myanmar":1206,"Hong Kong":1346,"Taiwan":1138,"Cambodia":1116,"Philippines":1345,"India":1292,"Pakistan":1096,"Bangladesh":1194,"Nepal":1180,"Sri Lanka":1095,"Afghanistan":1278,"Tajikistan":1442,"Turkmenistan":1396,"Palestine":1565,"Syria":1567,"Lebanon":1448,"Yemen":1331,"New Caledonia":1551,"Fiji":1457,"Vanuatu":1447,"Papua New Guinea":1467,"Solomon Islands":1400,"Tahiti":1502,"Samoa":1309,"Tonga":1174,"Maldives":1124,"Bhutan":995,"Mongolia":1092,"Guam":1087,"American Samoa":1120,"Moldova":1339,"Estonia":1401,"Latvia":1351,"Lithuania":1338,"Finland":1561,"Northern Ireland":1594,"Oman":1590,"Bahrain":1520,"Kuwait":1473,"Azerbaijan":1411,"Armenia":1439,"Kazakhstan":1500,"Kyrgyzstan":1460,"New Zealand":1682,"Curacao":1569,"Curaçao":1569};
const ATTACK = {"Spain":1.831,"Argentina":1.497,"France":1.58,"England":1.526,"Portugal":1.739,"Brazil":1.413,"Netherlands":1.673,"Germany":1.628,"Belgium":1.756,"Japan":1.805,"Norway":1.537,"Denmark":1.384,"Italy":1.404,"Canada":1.333,"Iran":1.535,"Senegal":1.312,"Morocco":1.354,"Switzerland":1.32,"South Korea":1.275,"Austria":1.34,"New Zealand":1.307,"Turkey":1.242,"Poland":1.208,"Czech Republic":1.244,"Sweden":1.244,"Serbia":1.091,"Nigeria":1.156,"Mexico":1.115,"Israel":1.105,"Jordan":1.161,"Colombia":1.167,"Uruguay":1.03,"Mali":1.074,"Jamaica":1.02,"Slovakia":1.022,"Panama":1.056,"Kyrgyzstan":1.001,"Tunisia":1.045,"United Arab Emirates":1.077,"Georgia":1.149,"Uzbekistan":1.111,"Algeria":1.6,"United States":1.384,"Australia":1.375,"Russia":1.459,"Qatar":1.136,"Ivory Coast":1.23,"Burkina Faso":1.059,"Saudi Arabia":0.916,"Ecuador":0.885,"Wales":0.973,"Chile":0.928,"Romania":1.129,"Greece":1.071,"Iceland":1.04,"Kosovo":1.041,"North Macedonia":1.008,"South Africa":1.049,"Egypt":1.097,"Cameroon":0.927,"Ghana":0.953,"DR Congo":0.919,"Iraq":0.967,"Angola":0.749,"Bosnia and Herzegovina":0.931,"Slovenia":0.918,"Zambia":0.897,"Albania":0.817,"Kenya":0.826,"Peru":0.718,"Republic of Ireland":0.791,"Croatia":1.302,"Paraguay":0.655,"Bolivia":0.658,"Honduras":0.922,"Costa Rica":1.061,"El Salvador":0.728,"Venezuela":0.817,"Haiti":1.538,"Trinidad and Tobago":1.067,"Curacao":1.313,"Uganda":0.653,"Tanzania":0.586,"Zimbabwe":0.842,"Ethiopia":0.724,"Libya":0.805,"Togo":0.761,"Benin":0.778,"Guinea":0.929,"Sierra Leone":0.769,"Gambia":1.002,"Guinea-Bissau":0.632,"Congo":0.622,"Niger":0.834,"Mauritania":0.548,"Equatorial Guinea":0.752,"Comoros":0.827,"Madagascar":0.897,"Cape Verde":0.853,"Malawi":0.602,"Syria":0.947,"Lebanon":0.798,"Palestine":0.886,"Yemen":0.884,"Kuwait":0.873,"Bahrain":0.966,"China PR":0.929,"North Korea":0.967,"Vietnam":1.192,"Thailand":1.271,"Malaysia":1.303,"Indonesia":1.133,"Philippines":0.952,"Cambodia":0.873,"Myanmar":0.707,"Singapore":0.91,"India":0.87,"Pakistan":0.239,"Bangladesh":0.606,"Nepal":0.549,"Sri Lanka":0.54,"Afghanistan":0.547,"Maldives":0.822,"Kazakhstan":0.761,"Tajikistan":0.975,"Turkmenistan":0.8,"Azerbaijan":0.676,"Armenia":0.894,"Moldova":0.532,"Belarus":0.678,"Ukraine":1.053,"Estonia":0.637,"Latvia":0.626,"Lithuania":0.501,"Finland":0.839,"Faroe Islands":0.618,"Gibraltar":0.267,"Malta":0.516,"Cyprus":0.698,"Andorra":0.26,"Liechtenstein":0.246,"San Marino":0.212,"Luxembourg":0.595,"Scotland":1.017,"Northern Ireland":0.804,"Fiji":1.32,"New Caledonia":1.544,"Papua New Guinea":1.153,"Tahiti":1.479,"Samoa":1.163,"New Zealand":1.307,"Oman":0.916,"South Africa":1.049,"Haiti":1.538,"Bosnia and Herzegovina":0.931,"Curacao":1.313,"Curaçao":1.313};
const DEFENSE = {"Spain":0.562,"Argentina":0.481,"France":0.619,"England":0.503,"Portugal":0.557,"Brazil":0.449,"Netherlands":0.712,"Germany":0.793,"Belgium":0.648,"Japan":0.608,"Norway":0.762,"Denmark":0.591,"Italy":0.638,"Canada":0.706,"Iran":0.462,"Senegal":0.435,"Morocco":0.367,"Switzerland":0.761,"South Korea":0.693,"Austria":0.745,"New Zealand":0.708,"Turkey":0.908,"Poland":0.831,"Czech Republic":0.887,"Sweden":0.805,"Serbia":0.804,"Nigeria":0.682,"Mexico":0.703,"Israel":1.241,"Jordan":0.745,"Colombia":0.635,"Uruguay":0.669,"Mali":0.489,"Jamaica":0.875,"Slovakia":0.791,"Panama":0.954,"Kyrgyzstan":1.055,"Tunisia":0.558,"United Arab Emirates":0.752,"Georgia":0.912,"Uzbekistan":0.596,"Algeria":0.599,"United States":0.677,"Australia":0.62,"Russia":0.745,"Qatar":0.933,"Ivory Coast":0.571,"Burkina Faso":0.699,"Saudi Arabia":0.766,"Ecuador":0.744,"Wales":0.758,"Chile":0.88,"Romania":0.799,"Greece":0.682,"Iceland":1.142,"Kosovo":0.945,"North Macedonia":0.918,"South Africa":0.599,"Egypt":0.484,"Cameroon":0.623,"Ghana":0.731,"DR Congo":0.638,"Iraq":0.652,"Angola":0.687,"Bosnia and Herzegovina":0.981,"Slovenia":0.681,"Zambia":0.968,"Albania":0.835,"Kenya":0.792,"Peru":0.785,"Republic of Ireland":0.779,"Croatia":0.757,"Paraguay":0.942,"Bolivia":1.397,"Honduras":0.951,"Costa Rica":0.895,"El Salvador":0.926,"Venezuela":0.965,"Haiti":1.007,"Trinidad and Tobago":1.171,"Curacao":0.834,"Uganda":0.691,"Tanzania":0.803,"Zimbabwe":0.782,"Ethiopia":1.061,"Libya":0.832,"Togo":0.838,"Benin":0.814,"Guinea":0.851,"Sierra Leone":1.018,"Gambia":0.859,"Guinea-Bissau":0.973,"Congo":1.234,"Niger":1.149,"Mauritania":0.897,"Equatorial Guinea":0.838,"Comoros":0.948,"Madagascar":0.935,"Cape Verde":0.734,"Malawi":0.764,"Syria":0.88,"Lebanon":0.741,"Palestine":0.836,"Yemen":1.232,"Kuwait":0.982,"Bahrain":0.722,"China PR":0.904,"North Korea":1.195,"Vietnam":0.758,"Thailand":0.829,"Malaysia":0.872,"Indonesia":1.129,"Philippines":1.169,"Cambodia":1.645,"Myanmar":1.637,"Singapore":1.224,"India":0.807,"Pakistan":1.633,"Bangladesh":1.171,"Nepal":1.165,"Sri Lanka":1.368,"Afghanistan":1.256,"Maldives":1.423,"Kazakhstan":1.208,"Tajikistan":0.849,"Turkmenistan":1.185,"Azerbaijan":1.179,"Armenia":1.465,"Moldova":1.413,"Belarus":1.101,"Ukraine":0.888,"Estonia":1.248,"Latvia":1.157,"Lithuania":1.349,"Finland":0.918,"Faroe Islands":1.206,"Gibraltar":2.143,"Malta":1.457,"Cyprus":1.412,"Andorra":1.275,"Liechtenstein":1.981,"San Marino":2.531,"Luxembourg":1.244,"Scotland":0.939,"Northern Ireland":0.817,"Fiji":1.025,"New Caledonia":0.863,"Papua New Guinea":1.244,"Tahiti":0.861,"Samoa":2.473,"Oman":0.664,"Curacao":0.864,"Curaçao":0.864};

const AVG = 1.365;
const HOME_ADV = 60;
const TOURNAMENT_WEIGHTS = {"FIFA World Cup":2.0,"UEFA Euro":1.8,"Copa América":1.7,"African Cup of Nations":1.6,"FIFA World Cup qualification":1.5,"UEFA Euro qualification":1.4,"UEFA Nations League":1.3,"CONCACAF Nations League":1.2,"Friendly":0.7};
const TOURNAMENTS = Object.keys(TOURNAMENT_WEIGHTS);
const FLAGS = {"Spain":"🇪🇸","Argentina":"🇦🇷","France":"🇫🇷","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Portugal":"🇵🇹","Brazil":"🇧🇷","Netherlands":"🇳🇱","Germany":"🇩🇪","Morocco":"🇲🇦","Japan":"🇯🇵","Turkey":"🇹🇷","Croatia":"🇭🇷","Colombia":"🇨🇴","Ecuador":"🇪🇨","Senegal":"🇸🇳","Norway":"🇳🇴","Belgium":"🇧🇪","Italy":"🇮🇹","Uruguay":"🇺🇾","Mexico":"🇲🇽","Switzerland":"🇨🇭","Denmark":"🇩🇰","Poland":"🇵🇱","Australia":"🇦🇺","Iran":"🇮🇷","South Korea":"🇰🇷","Canada":"🇨🇦","United States":"🇺🇸","Nigeria":"🇳🇬","Algeria":"🇩🇿","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Wales":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","Republic of Ireland":"🇮🇪","Ukraine":"🇺🇦","Sweden":"🇸🇪","Greece":"🇬🇷","Ivory Coast":"🇨🇮","Ghana":"🇬🇭","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Qatar":"🇶🇦","Serbia":"🇷🇸","Czech Republic":"🇨🇿","Austria":"🇦🇹","Hungary":"🇭🇺","Romania":"🇷🇴","Slovakia":"🇸🇰","Albania":"🇦🇱","Georgia":"🇬🇪","Slovenia":"🇸🇮","Bolivia":"🇧🇴","Peru":"🇵🇪","Chile":"🇨🇱","Paraguay":"🇵🇾","Venezuela":"🇻🇪","Costa Rica":"🇨🇷","Panama":"🇵🇦","Honduras":"🇭🇳","El Salvador":"🇸🇻","Jamaica":"🇯🇲","Tunisia":"🇹🇳","Cameroon":"🇨🇲","Mali":"🇲🇱","South Africa":"🇿🇦","DR Congo":"🇨🇩","Iraq":"🇮🇶","Jordan":"🇯🇴","China PR":"🇨🇳","Indonesia":"🇮🇩","Vietnam":"🇻🇳","Thailand":"🇹🇭","India":"🇮🇳","New Zealand":"🇳🇿","Finland":"🇫🇮","Iceland":"🇮🇸","Israel":"🇮🇱","Kosovo":"🇽🇰","North Macedonia":"🇲🇰","Montenegro":"🇲🇪","Bosnia and Herzegovina":"🇧🇦","Uzbekistan":"🇺🇿","Kazakhstan":"🇰🇿","Russia":"🇷🇺","Cape Verde":"🇨🇻","Haiti":"🇭🇹","Curacao":"🇨🇼","Congo":"🇨🇬"};
const f = t => FLAGS[t] || "🏳️";
const ALL_TEAMS = [...new Set(Object.keys(ELO))].sort();

// ── Correct WK 2026 groepsfase ────────────────────────────────────────────────
const WC_GROUPS = {
  A: ["Mexico","South Africa","South Korea","Czech Republic"],
  B: ["Canada","Bosnia and Herzegovina","Qatar","Switzerland"],
  C: ["Brazil","Morocco","Haiti","Scotland"],
  D: ["United States","Paraguay","Australia","Turkey"],
  E: ["Germany","Curacao","Ivory Coast","Ecuador"],
  F: ["Netherlands","Japan","Sweden","Tunisia"],
  G: ["Belgium","Egypt","Iran","New Zealand"],
  H: ["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I: ["France","Senegal","Iraq","Norway"],
  J: ["Argentina","Algeria","Austria","Jordan"],
  K: ["Portugal","Uzbekistan","DR Congo","Colombia"],
  L: ["England","Croatia","Ghana","Panama"],
};

const WC_MATCHES = [
  // ── RONDE 1 ──────────────────────────────────────────────
  {home:"Mexico",away:"South Africa",date:"Jun 11",group:"A",venue:"Mexico City",round:1},
  {home:"South Korea",away:"Czech Republic",date:"Jun 11",group:"A",venue:"Guadalajara",round:1},
  {home:"Canada",away:"Bosnia and Herzegovina",date:"Jun 12",group:"B",venue:"Toronto",round:1},
  {home:"United States",away:"Paraguay",date:"Jun 12",group:"D",venue:"Los Angeles",round:1},
  {home:"Qatar",away:"Switzerland",date:"Jun 13",group:"B",venue:"Santa Clara",round:1},
  {home:"Brazil",away:"Morocco",date:"Jun 13",group:"C",venue:"New Jersey",round:1},
  {home:"Haiti",away:"Scotland",date:"Jun 13",group:"C",venue:"Massachusetts",round:1},
  {home:"Australia",away:"Turkey",date:"Jun 13",group:"D",venue:"Vancouver",round:1},
  {home:"Germany",away:"Curacao",date:"Jun 14",group:"E",venue:"Houston",round:1},
  {home:"Netherlands",away:"Japan",date:"Jun 14",group:"F",venue:"Arlington",round:1},
  {home:"Ivory Coast",away:"Ecuador",date:"Jun 14",group:"E",venue:"Philadelphia",round:1},
  {home:"Sweden",away:"Tunisia",date:"Jun 14",group:"F",venue:"Guadalupe",round:1},
  {home:"Spain",away:"Cape Verde",date:"Jun 15",group:"H",venue:"Atlanta",round:1},
  {home:"Belgium",away:"Egypt",date:"Jun 15",group:"G",venue:"Seattle",round:1},
  {home:"Saudi Arabia",away:"Uruguay",date:"Jun 15",group:"H",venue:"Miami",round:1},
  {home:"Iran",away:"New Zealand",date:"Jun 15",group:"G",venue:"Los Angeles",round:1},
  {home:"France",away:"Senegal",date:"Jun 16",group:"I",venue:"New Jersey",round:1},
  {home:"Iraq",away:"Norway",date:"Jun 16",group:"I",venue:"Massachusetts",round:1},
  {home:"Argentina",away:"Algeria",date:"Jun 16",group:"J",venue:"Kansas City",round:1},
  {home:"Austria",away:"Jordan",date:"Jun 16",group:"J",venue:"Santa Clara",round:1},
  {home:"Portugal",away:"DR Congo",date:"Jun 17",group:"K",venue:"Houston",round:1},
  {home:"England",away:"Croatia",date:"Jun 17",group:"L",venue:"Arlington",round:1},
  {home:"Ghana",away:"Panama",date:"Jun 17",group:"L",venue:"Toronto",round:1},
  {home:"Uzbekistan",away:"Colombia",date:"Jun 17",group:"K",venue:"Mexico City",round:1},
  // ── RONDE 2 ──────────────────────────────────────────────
  {home:"South Africa",away:"Czech Republic",date:"Jun 15",group:"A",venue:"Guadalajara",round:2},
  {home:"Mexico",away:"South Korea",date:"Jun 15",group:"A",venue:"Kansas City",round:2},
  {home:"Bosnia and Herzegovina",away:"Switzerland",date:"Jun 16",group:"B",venue:"Seattle",round:2},
  {home:"Canada",away:"Qatar",date:"Jun 16",group:"B",venue:"Vancouver",round:2},
  {home:"Morocco",away:"Scotland",date:"Jun 17",group:"C",venue:"Atlanta",round:2},
  {home:"Brazil",away:"Haiti",date:"Jun 17",group:"C",venue:"Miami",round:2},
  {home:"Paraguay",away:"Turkey",date:"Jun 18",group:"D",venue:"Los Angeles",round:2},
  {home:"United States",away:"Australia",date:"Jun 18",group:"D",venue:"Santa Clara",round:2},
  {home:"Curacao",away:"Ecuador",date:"Jun 18",group:"E",venue:"Philadelphia",round:2},
  {home:"Germany",away:"Ivory Coast",date:"Jun 18",group:"E",venue:"Dallas",round:2},
  {home:"Japan",away:"Tunisia",date:"Jun 19",group:"F",venue:"Houston",round:2},
  {home:"Netherlands",away:"Sweden",date:"Jun 19",group:"F",venue:"New York",round:2},
  {home:"Egypt",away:"New Zealand",date:"Jun 19",group:"G",venue:"Boston",round:2},
  {home:"Belgium",away:"Iran",date:"Jun 19",group:"G",venue:"Washington",round:2},
  {home:"Cape Verde",away:"Uruguay",date:"Jun 20",group:"H",venue:"Miami",round:2},
  {home:"Spain",away:"Saudi Arabia",date:"Jun 20",group:"H",venue:"Atlanta",round:2},
  {home:"Senegal",away:"Norway",date:"Jun 20",group:"I",venue:"Kansas City",round:2},
  {home:"France",away:"Iraq",date:"Jun 20",group:"I",venue:"Chicago",round:2},
  {home:"Algeria",away:"Jordan",date:"Jun 21",group:"J",venue:"Seattle",round:2},
  {home:"Argentina",away:"Austria",date:"Jun 21",group:"J",venue:"Los Angeles",round:2},
  {home:"DR Congo",away:"Colombia",date:"Jun 21",group:"K",venue:"Dallas",round:2},
  {home:"Portugal",away:"Uzbekistan",date:"Jun 21",group:"K",venue:"San Francisco",round:2},
  {home:"Croatia",away:"Panama",date:"Jun 22",group:"L",venue:"New York",round:2},
  {home:"England",away:"Ghana",date:"Jun 22",group:"L",venue:"Boston",round:2},
  // ── RONDE 3 ──────────────────────────────────────────────
  {home:"Czech Republic",away:"South Africa",date:"Jun 19",group:"A",venue:"Monterrey",round:3},
  {home:"South Korea",away:"Mexico",date:"Jun 19",group:"A",venue:"Guadalajara",round:3},
  {home:"Switzerland",away:"Canada",date:"Jun 20",group:"B",venue:"Toronto",round:3},
  {home:"Qatar",away:"Bosnia and Herzegovina",date:"Jun 20",group:"B",venue:"Houston",round:3},
  {home:"Scotland",away:"Brazil",date:"Jun 21",group:"C",venue:"Dallas",round:3},
  {home:"Haiti",away:"Morocco",date:"Jun 21",group:"C",venue:"Atlanta",round:3},
  {home:"Turkey",away:"United States",date:"Jun 22",group:"D",venue:"Los Angeles",round:3},
  {home:"Australia",away:"Paraguay",date:"Jun 22",group:"D",venue:"Kansas City",round:3},
  {home:"Ecuador",away:"Germany",date:"Jun 22",group:"E",venue:"Miami",round:3},
  {home:"Ivory Coast",away:"Curacao",date:"Jun 22",group:"E",venue:"Seattle",round:3},
  {home:"Tunisia",away:"Netherlands",date:"Jun 23",group:"F",venue:"Chicago",round:3},
  {home:"Sweden",away:"Japan",date:"Jun 23",group:"F",venue:"Boston",round:3},
  {home:"New Zealand",away:"Belgium",date:"Jun 23",group:"G",venue:"Washington",round:3},
  {home:"Iran",away:"Egypt",date:"Jun 23",group:"G",venue:"San Francisco",round:3},
  {home:"Uruguay",away:"Spain",date:"Jun 24",group:"H",venue:"Dallas",round:3},
  {home:"Saudi Arabia",away:"Cape Verde",date:"Jun 24",group:"H",venue:"Houston",round:3},
  {home:"Norway",away:"France",date:"Jun 24",group:"I",venue:"New York",round:3},
  {home:"Iraq",away:"Senegal",date:"Jun 24",group:"I",venue:"Los Angeles",round:3},
  {home:"Jordan",away:"Argentina",date:"Jun 25",group:"J",venue:"Seattle",round:3},
  {home:"Austria",away:"Algeria",date:"Jun 25",group:"J",venue:"Miami",round:3},
  {home:"Colombia",away:"Portugal",date:"Jun 25",group:"K",venue:"Chicago",round:3},
  {home:"Uzbekistan",away:"DR Congo",date:"Jun 25",group:"K",venue:"Boston",round:3},
  {home:"Ghana",away:"England",date:"Jun 25",group:"L",venue:"Atlanta",round:3},
  {home:"Panama",away:"Croatia",date:"Jun 25",group:"L",venue:"Kansas City",round:3},
];


function poissonPMF(k,l){if(l<=0)return k===0?1:0;let log=k*Math.log(l)-l;for(let i=2;i<=k;i++)log-=Math.log(i);return Math.exp(log);}

function calcMatch(home, away, neutral=false, tournament="Friendly"){
  const tw = TOURNAMENT_WEIGHTS[tournament] || 1.0;
  const he=(ELO[home]||1500)+(neutral?0:HOME_ADV), ae=ELO[away]||1500, diff=he-ae;

  // Stap 1: Elo win-kans (scherpere schaal: 250 ipv 400)
  // Gevalideerd tegen bookmaker kansen — gemiddelde fout 0.185
  const expH = 1 / (1 + Math.pow(10, -diff/250));

  // Stap 2: Verwachte goals vanuit win-kans
  const lh_elo = AVG * (0.5 + expH);   // favoriet scoort meer
  const la_elo = AVG * (1.5 - expH);   // underdog scoort minder

  // Stap 3: Attack/defense als gecorrigeerde factor (max ±25%)
  // Clip extreme waarden (outliers zoals Monaco defense=0, Elba attack=3.66)
  const atkH = Math.min(1.25, Math.max(0.75, ATTACK[home]||1));
  const atkA = Math.min(1.25, Math.max(0.75, ATTACK[away]||1));
  const defH = Math.min(1.25, Math.max(0.75, DEFENSE[home]||1));
  const defA = Math.min(1.25, Math.max(0.75, DEFENSE[away]||1));

  // Meetkundig gemiddelde voor attack/defense (zwakt extremen verder af)
  const lh = Math.min(3.5, Math.max(0.3, lh_elo * Math.sqrt(atkH/defA)));
  const la = Math.min(3.5, Math.max(0.3, la_elo * Math.sqrt(atkA/defH)));
  let hw=0,d=0,aw=0,maxP=0,lsH=1,lsA=0;
  for(let i=0;i<9;i++) for(let j=0;j<9;j++){
    const p=poissonPMF(i,lh)*poissonPMF(j,la);
    if(i>j)hw+=p; else if(i===j)d+=p; else aw+=p;
    if(p>maxP){maxP=p;lsH=i;lsA=j;}
  }
  const t=hw+d+aw;
  // Over/under markets — gebruik gekalibreerde lambda's (factor 0.80)
  // Het basismodel heeft een upward bias in goals door attack/defense extremen
  // O/U kalibratiefactor gevalideerd tegen bookmaker odds voor interlands
  const OU_SCALE = 0.80;
  const lhOU = lh * OU_SCALE;
  const laOU = la * OU_SCALE;
  const ou15 = 1 - poissonPMF(0,lhOU)*poissonPMF(0,laOU) - poissonPMF(1,lhOU)*poissonPMF(0,laOU) - poissonPMF(0,lhOU)*poissonPMF(1,laOU);
  let ou25=0, ou35=0;
  for(let i=0;i<9;i++) for(let j=0;j<9;j++){
    const p=poissonPMF(i,lhOU)*poissonPMF(j,laOU);
    if(i+j>2) ou25+=p;
    if(i+j>3) ou35+=p;
  }
  // BTTS
  let btts=0;
  for(let i=1;i<9;i++) for(let j=1;j<9;j++) btts+=poissonPMF(i,lhOU)*poissonPMF(j,laOU);
  // Meest waarschijnlijke WINNENDE score apart berekenen
  let winH=0,winA=0,winP=0,loseH=0,loseA=0,loseP=0;
  for(let i=0;i<9;i++) for(let j=0;j<9;j++){
    const p=poissonPMF(i,lh)*poissonPMF(j,la);
    if(i>j&&p>winP){winP=p;winH=i;winA=j;}   // thuis wint
    if(j>i&&p>loseP){loseP=p;loseH=i;loseA=j;} // uit wint
  }
  return {hw:hw/t,d:d/t,aw:aw/t,lh,la,lsH,lsA,
    winningH:winH,winningA:winA,  // meest waarschijnlijke thuiswinst score
    losingH:loseH,losingA:loseA,  // meest waarschijnlijke uitwinst score
    homeElo:ELO[home]||1500,awayElo:ELO[away]||1500,
    ou15,ou25,ou35,btts,
    totalGoals:lhOU+laOU,
    lhDisplay:lhOU,laDisplay:laOU};
}

function fuseOdds(m,oH,oD,oA){
  const pH=1/oH,pD=1/oD,pA=1/oA;
  const vig=pH+pD+pA;
  const bH=pH/vig,bD=pD/vig,bA=pA/vig;
  const fH=0.4*m.hw+0.6*bH,fD=0.4*m.d+0.6*bD,fA=0.4*m.aw+0.6*bA;
  const t=fH+fD+fA;
  return {...m,hw:fH/t,d:fD/t,aw:fA/t,oddsApplied:true,bH,bD,bA,vig:((vig-1)*100).toFixed(1)};
}

function getEdge(modelP,oH,oD,oA,which){
  const h=parseFloat(oH),d=parseFloat(oD),a=parseFloat(oA);
  if(!h||!d||!a||h<=1.01||d<=1.01||a<=1.01)return null;
  const vig=(1/h)+(1/d)+(1/a);
  if(vig<0.85||vig>1.4)return null;
  const fair = which==="h"?(1/h)/vig:which==="d"?(1/d)/vig:(1/a)/vig;
  return (modelP - fair)*100;
}


// ── Components ────────────────────────────────────────────────────────────────
function TeamPicker({value, onChange, side, exclude}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const opts = useMemo(() => 
    ALL_TEAMS.filter(t => t !== exclude && t.toLowerCase().includes(q.toLowerCase())).slice(0, 60),
    [q, exclude]
  );
  const flag = t => FLAGS[t] || "🏳️";

  return (
    <div style={{flex:1, position:"relative", zIndex: open ? 999 : 1}}>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => { setOpen(false); setQ(""); }}
          style={{position:"fixed", inset:0, zIndex:998}}
        />
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:"100%", padding:"0.85rem 0.5rem",
          background: value ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
          border: `1.5px solid ${open ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
          borderRadius:"14px", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", gap:"0.3rem",
        }}
      >
        <span style={{fontSize:"1.8rem"}}>{value ? flag(value) : (side === "home" ? "🏠" : "✈️")}</span>
        <span style={{fontSize:"0.65rem", color: value ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: value ? 600 : 400, textAlign:"center", lineHeight:1.2}}>
          {value || (side === "home" ? "Thuis" : "Uit")}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0,
          zIndex:999, background:"#111120",
          border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:"12px", boxShadow:"0 20px 60px rgba(0,0,0,0.95)",
          overflow:"hidden",
        }}>
          <div style={{padding:"0.5rem"}}>
            <input
              autoFocus
              placeholder="Zoek land..."
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{
                width:"100%", padding:"0.5rem 0.75rem",
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"8px", color:"#fff", fontSize:"0.8rem", outline:"none",
              }}
            />
          </div>
          <div style={{maxHeight:"220px", overflowY:"auto"}}>
            {opts.map(t => (
              <div
                key={t}
                onClick={() => { onChange(t); setOpen(false); setQ(""); }}
                style={{
                  padding:"0.5rem 0.75rem", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:"0.5rem",
                  background: t === value ? "rgba(255,255,255,0.08)" : "transparent",
                  fontSize:"0.8rem",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = t === value ? "rgba(255,255,255,0.08)" : "transparent"}
              >
                <span style={{fontSize:"1.1rem"}}>{flag(t)}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function ProbBar({hw,d,aw,home,away}){
  const max=Math.max(hw,d,aw);
  return(
    <div>
      <div style={{display:"flex",borderRadius:"10px",overflow:"hidden",height:"40px",gap:"2px"}}>
        {[{p:hw,c:"#22c55e",n:home},{p:d,c:"#eab308",n:"Gelijk"},{p:aw,c:"#ef4444",n:away}].map(({p,c,n})=>(
          <div key={n} style={{flex:p,background:p===max?c:`${c}44`,display:"flex",alignItems:"center",justifyContent:"center",transition:"flex 0.5s ease",minWidth:0}}>
            <span style={{fontSize:"0.78rem",fontWeight:800,color:p===max?"#000":"rgba(0,0,0,0.5)"}}>{(p*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"0.25rem 2px 0"}}>
        {[shortName(home),"Gelijkspel",shortName(away)].map((l,i)=>(
          <span key={i} style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)"}}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function ValueBadge({edge,label,eloDiff}){
  if(edge===null||edge===undefined)return null;
  const abs=Math.abs(edge);
  if(abs<3)return null;
  const pos=edge>0;
  const isSmallEloBigEdge = eloDiff!==undefined && Math.abs(eloDiff)<100 && abs>12;
  return(
    <div style={{marginBottom:"0.15rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.4rem 0.7rem",background:pos?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.06)",border:`1px solid ${pos?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.2)"}`,borderRadius:isSmallEloBigEdge?"8px 8px 0 0":"8px"}}>
        <span style={{fontSize:"0.8rem"}}>{abs>=8?"🔥":abs>=5?"⚡":"📈"}</span>
        <span style={{fontSize:"0.7rem",fontWeight:700,color:pos?"#4ade80":"#f87171",fontFamily:"monospace"}}>{pos?"+":""}{edge.toFixed(1)}%</span>
        <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.4)",flex:1}}>{label}</span>
        <span style={{fontSize:"0.65rem",fontWeight:700,color:pos?"#4ade80":"#f87171"}}>{pos?"VALUE":"OVERPRICED"}</span>
      </div>
      {isSmallEloBigEdge&&<div style={{fontSize:"0.58rem",color:"rgba(250,204,21,0.55)",padding:"0.25rem 0.7rem 0.3rem",background:"rgba(250,204,21,0.04)",border:"1px solid rgba(250,204,21,0.1)",borderTop:"none",borderRadius:"0 0 8px 8px"}}>
        ⚠️ Kleine Elo-gap — controleer met live data voor gebruik
      </div>}
    </div>
  );
}

function OURow({label,prob,odds}){
  // Gevalideerd: O/U model is alleen betrouwbaar bij hoge confidence (>62% of <38%)
  // Bij lage confidence (45-55%) is accuraatheid ~50% — niet beter dan gokken
  const rawOdds = odds&&parseFloat(odds)>1 ? parseFloat(odds) : null;
  const estVig = rawOdds ? Math.max(0.02, Math.min(0.12, 0.1 / rawOdds)) : 0;
  const fairImpl = rawOdds ? (1/rawOdds) / (1 + estVig) : null;
  const edge = fairImpl!==null ? ((prob - fairImpl)*100) : null;
  const hasEdge = edge!==null&&Math.abs(edge)>=3;
  const abs = edge!==null?Math.abs(edge):0;
  const pos = edge!==null&&edge>0;
  // Confidence indicator: alleen tonen als model hoge confidence heeft
  const highConf = prob > 0.62 || prob < 0.38;
  const confColor = highConf ? "#fff" : "rgba(255,255,255,0.35)";
  return(
    <div style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.4rem 0.5rem",marginBottom:"0.25rem",background:hasEdge&&highConf?(pos?"rgba(34,197,94,0.07)":"rgba(239,68,68,0.05)"):"rgba(255,255,255,0.02)",borderRadius:"8px",border:hasEdge&&highConf?`1px solid ${pos?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.15)"}`:"1px solid transparent",transition:"all 0.2s",opacity:highConf?1:0.6}}>
      <span style={{flex:1,fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>{label}</span>
      <span style={{fontSize:"0.75rem",fontWeight:700,color:confColor,fontFamily:"monospace",width:"36px",textAlign:"right"}}>{(prob*100).toFixed(0)}%</span>
      {rawOdds&&<span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.2)",fontFamily:"monospace",width:"32px",textAlign:"right"}}>{rawOdds.toFixed(2)}</span>}
      {hasEdge&&highConf?(
        <div style={{display:"flex",alignItems:"center",gap:"0.25rem",flexShrink:0}}>
          <span style={{fontSize:"0.7rem"}}>{abs>=8?"🔥":abs>=5?"⚡":"📈"}</span>
          <span style={{fontSize:"0.65rem",fontWeight:800,color:pos?"#4ade80":"#f87171",fontFamily:"monospace"}}>{pos?"+":""}{edge.toFixed(1)}%</span>
          <span style={{fontSize:"0.58rem",fontWeight:700,color:pos?"#4ade80":"#f87171",opacity:0.8}}>{pos?"VALUE":"OVER"}</span>
        </div>
      ):(!highConf?<span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.15)",flexShrink:0}}>laag conf.</span>
      :(rawOdds&&<span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.15)",flexShrink:0}}>~fair</span>))}
    </div>
  );
}


function DailyPicks({ isPro, onShowPro }) {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/daily-picks`);
        if(res.ok) {
          const data = await res.json();
          setPicks(data.picks || []);
          setTotalAnalyzed(data.total_analyzed || 0);
        }
      } catch(e) { console.log("Picks fout:", e); }
      setLoading(false);
    };
    fetchPicks();
  }, []);

  if(!isPro) return (
    <div style={{paddingTop:"1rem"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>🎯 Dagelijkse Picks</div>
      <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"1.5rem"}}>Beste value bets van vandaag · AI geselecteerd</div>
      <ProGate onUpgrade={onShowPro} feature="Dagelijkse picks — beste value bets automatisch geselecteerd" />
    </div>
  );

  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>🎯 Dagelijkse Picks</div>
      <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"0.75rem"}}>
        {loading ? "Analyseren..." : `${totalAnalyzed} wedstrijden geanalyseerd · Top picks van vandaag`}
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.3)"}}>
          <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>⏳</div>
          <div style={{fontSize:"0.78rem"}}>Wedstrijden analyseren...</div>
        </div>
      ) : picks.length === 0 ? (
        <div style={{textAlign:"center",padding:"2rem",background:"rgba(255,255,255,0.03)",borderRadius:"14px",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>📭</div>
          <div style={{fontSize:"0.82rem",fontWeight:700,marginBottom:"0.3rem"}}>Geen picks vandaag</div>
          <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}>Er zijn momenteel geen wedstrijden met duidelijke value</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {picks.map((pick, i) => (
            <div key={i} style={{
              padding:"1rem",
              background:pick.edge>=8?"linear-gradient(135deg,rgba(255,100,0,0.08),rgba(255,50,0,0.04))":pick.edge>=5?"linear-gradient(135deg,rgba(250,204,21,0.08),rgba(250,204,21,0.03))":"rgba(255,255,255,0.03)",
              border:`1px solid ${pick.edge>=8?"rgba(255,100,0,0.2)":pick.edge>=5?"rgba(250,204,21,0.2)":"rgba(255,255,255,0.07)"}`,
              borderRadius:"16px",
            }}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>{pick.sport}</span>
                <span style={{fontSize:"0.7rem",fontWeight:700,color:pick.edge>=8?"#ff6400":pick.edge>=5?"#fbbf24":"#22c55e"}}>{pick.confidence}</span>
              </div>
              {/* Teams */}
              <div style={{fontSize:"0.85rem",fontWeight:700,marginBottom:"0.5rem"}}>
                {pick.home} vs {pick.away}
              </div>
              {/* Bet */}
              <div style={{padding:"0.5rem 0.75rem",background:"rgba(0,232,122,0.08)",border:"1px solid rgba(0,232,122,0.15)",borderRadius:"10px",marginBottom:"0.5rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",marginBottom:"0.15rem"}}>AANBEVOLEN BET</div>
                    <div style={{fontSize:"0.82rem",fontWeight:700,color:"#fff"}}>{pick.betLabel}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"1.1rem",fontWeight:800,color:"#00e87a"}}>@ {pick.betOdds}</div>
                    <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)"}}>{pick.bookmaker}</div>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div style={{display:"flex",gap:"0.5rem",fontSize:"0.65rem"}}>
                <div style={{flex:1,textAlign:"center",padding:"0.3rem",background:"rgba(255,255,255,0.04)",borderRadius:"7px"}}>
                  <div style={{color:"rgba(255,255,255,0.3)"}}>Model kans</div>
                  <div style={{fontWeight:700,color:"#fff"}}>{pick.betProb}%</div>
                </div>
                <div style={{flex:1,textAlign:"center",padding:"0.3rem",background:"rgba(0,232,122,0.06)",borderRadius:"7px"}}>
                  <div style={{color:"rgba(255,255,255,0.3)"}}>Edge</div>
                  <div style={{fontWeight:700,color:"#00e87a"}}>+{pick.edge}%</div>
                </div>
                <div style={{flex:1,textAlign:"center",padding:"0.3rem",background:"rgba(255,255,255,0.04)",borderRadius:"7px"}}>
                  <div style={{color:"rgba(255,255,255,0.3)"}}>Bankroll</div>
                  <div style={{fontWeight:700,color:"#fff"}}>{pick.edge>=8?"3-4%":pick.edge>=5?"2-3%":"1-2%"}</div>
                </div>
              </div>
              {/* Kansen */}
              <div style={{marginTop:"0.5rem",display:"flex",borderRadius:"6px",overflow:"hidden",height:"18px",gap:"1px"}}>
                {[{p:pick.homeWin,c:"#22c55e",l:pick.home.split(" ")[0]},{p:pick.draw,c:"#eab308",l:"X"},{p:pick.awayWin,c:"#ef4444",l:pick.away.split(" ")[0]}].map(({p,c,l},idx)=>(
                  <div key={idx} style={{flex:p,background:`${c}${p===Math.max(pick.homeWin,pick.draw,pick.awayWin)?"bb":"33"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {p===Math.max(pick.homeWin,pick.draw,pick.awayWin)&&<span style={{fontSize:"0.55rem",fontWeight:800,color:"#000"}}>{p}%</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{padding:"0.5rem",fontSize:"0.62rem",color:"rgba(255,255,255,0.25)",textAlign:"center"}}>
            ⚠️ Picks zijn indicatief — geen garantie op winst. Gok verantwoord.
          </div>
        </div>
      )}
    </div>
  );
}

function GroupSimulator({ calcMatch, isPro, onShowPro }) {
  const [selGroup, setSelGroup] = useState("A");

  const WC_GROUPS = {
    A:["Mexico","South Africa","South Korea","Czech Republic"],
    B:["Canada","Bosnia and Herzegovina","Qatar","Switzerland"],
    C:["Brazil","Morocco","Haiti","Scotland"],
    D:["United States","Paraguay","Australia","Turkey"],
    E:["Germany","Curacao","Ivory Coast","Ecuador"],
    F:["Netherlands","Japan","Sweden","Tunisia"],
    G:["Belgium","Egypt","Iran","New Zealand"],
    H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
    I:["France","Senegal","Iraq","Norway"],
    J:["Argentina","Algeria","Austria","Jordan"],
    K:["Portugal","Uzbekistan","DR Congo","Colombia"],
    L:["England","Croatia","Ghana","Panama"],
  };

  const FLAGS = {"Spain":"🇪🇸","Argentina":"🇦🇷","France":"🇫🇷","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Portugal":"🇵🇹","Brazil":"🇧🇷","Netherlands":"🇳🇱","Germany":"🇩🇪","Morocco":"🇲🇦","Japan":"🇯🇵","Turkey":"🇹🇷","Croatia":"🇭🇷","Colombia":"🇨🇴","Ecuador":"🇪🇨","Senegal":"🇸🇳","Norway":"🇳🇴","Belgium":"🇧🇪","Uruguay":"🇺🇾","Mexico":"🇲🇽","Switzerland":"🇨🇭","Denmark":"🇩🇰","Poland":"🇵🇱","Australia":"🇦🇺","Iran":"🇮🇷","South Korea":"🇰🇷","Canada":"🇨🇦","United States":"🇺🇸","Ghana":"🇬🇭","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Qatar":"🇶🇦","Serbia":"🇷🇸","Czech Republic":"🇨🇿","Austria":"🇦🇹","Sweden":"🇸🇪","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Tunisia":"🇹🇳","Ivory Coast":"🇨🇮","DR Congo":"🇨🇩","Iraq":"🇮🇶","Jordan":"🇯🇴","New Zealand":"🇳🇿","Cape Verde":"🇨🇻","Haiti":"🇭🇹","Curacao":"🇨🇼","South Africa":"🇿🇦","Panama":"🇵🇦","Paraguay":"🇵🇾","Algeria":"🇩🇿","Uzbekistan":"🇺🇿","Bosnia and Herzegovina":"🇧🇦"};
  const f = t => FLAGS[t] || "🏳️";

  const simulate = (teams) => {
    const s = {};
    teams.forEach(t => s[t] = {pts:0,gf:0,ga:0,played:0});
    const matches = [];
    for(let i=0;i<teams.length;i++) for(let j=i+1;j<teams.length;j++) {
      const h=teams[i], a=teams[j];
      const r=calcMatch(h,a,true,"FIFA World Cup");
      s[h].pts += r.hw*3 + r.d*1;
      s[a].pts += r.aw*3 + r.d*1;
      const expH=r.lh, expA=r.la;
      s[h].gf+=expH; s[h].ga+=expA; s[h].played++;
      s[a].gf+=expA; s[a].ga+=expH; s[a].played++;
      matches.push({h,a,hw:r.hw,d:r.d,aw:r.aw,expH,expA});
    }
    const sorted = Object.entries(s).sort((x,y)=>{
      const ptsDiff = y[1].pts - x[1].pts;
      if(Math.abs(ptsDiff)>0.01) return ptsDiff;
      return (y[1].gf-y[1].ga) - (x[1].gf-x[1].ga);
    });
    return {standings:sorted, matches};
  };

  const teams = WC_GROUPS[selGroup];
  const {standings, matches} = simulate(teams);

  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>🔮 Groepsfase Simulator</div>
      <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"0.75rem"}}>Verwachte eindstand per groep · op basis van AI model</div>

      {/* Group selector */}
      <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"1rem"}}>
        {Object.keys(WC_GROUPS).map(g=>(
          <button key={g} onClick={()=>setSelGroup(g)} style={{
            padding:"0.3rem 0.6rem",
            background:selGroup===g?"rgba(168,85,247,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${selGroup===g?"rgba(168,85,247,0.4)":"rgba(255,255,255,0.07)"}`,
            borderRadius:"7px",color:selGroup===g?"#a855f7":"rgba(255,255,255,0.35)",
            cursor:"pointer",fontSize:"0.7rem",fontWeight:700,transition:"all 0.15s"
          }}>{g}</button>
        ))}
      </div>

      {/* Standings */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"14px",overflow:"hidden",marginBottom:"0.75rem",border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{padding:"0.6rem 0.9rem",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:"0.6rem",fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em"}}>GROEP {selGroup} — VERWACHTE EINDSTAND</span>
          <span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)"}}>Punten · Voor · Tegen · Saldo</span>
        </div>
        {standings.map(([team, s], i) => {
          const gd = s.gf - s.ga;
          const isThrough = i < 2;
          return (
            <div key={team} style={{
              display:"flex",alignItems:"center",gap:"0.6rem",
              padding:"0.65rem 0.9rem",
              background:isThrough?"rgba(34,197,94,0.04)":"transparent",
              borderLeft:isThrough?"3px solid rgba(34,197,94,0.4)":"3px solid transparent",
              borderBottom:i<standings.length-1?"1px solid rgba(255,255,255,0.04)":"none",
            }}>
              <span style={{fontSize:"0.7rem",color:isThrough?"#22c55e":"rgba(255,255,255,0.25)",fontWeight:700,width:16}}>{i+1}</span>
              <span style={{fontSize:"1.1rem"}}>{f(team)}</span>
              <span style={{flex:1,fontSize:"0.78rem",fontWeight:isThrough?700:400,color:isThrough?"#fff":"rgba(255,255,255,0.55)"}}>{team}</span>
              <div style={{display:"flex",gap:"0.5rem",fontSize:"0.68rem",fontFamily:"monospace",color:"rgba(255,255,255,0.4)"}}>
                <span style={{color:isThrough?"#22c55e":"rgba(255,255,255,0.6)",fontWeight:700}}>{s.pts.toFixed(1)}</span>
                <span>{s.gf.toFixed(1)}</span>
                <span>{s.ga.toFixed(1)}</span>
                <span style={{color:gd>0?"#22c55e":gd<0?"#f87171":"rgba(255,255,255,0.4)"}}>{gd>0?"+":""}{gd.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
        <div style={{padding:"0.4rem 0.9rem",background:"rgba(34,197,94,0.04)",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
          <span style={{fontSize:"0.55rem",color:"rgba(34,197,94,0.6)"}}>✅ Top 2 gaat door naar de knock-out fase</span>
        </div>
      </div>

      {/* Matches */}
      <div style={{fontSize:"0.58rem",fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>WEDSTRIJDEN GROEP {selGroup}</div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
        {matches.map((m,i)=>(
          <div key={i} style={{padding:"0.6rem 0.75rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.35rem"}}>
              <span style={{fontSize:"1rem"}}>{f(m.h)}</span>
              <span style={{fontSize:"0.75rem",fontWeight:600,flex:1}}>{m.h}</span>
              <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.25)",fontFamily:"monospace"}}>{m.expH.toFixed(1)}–{m.expA.toFixed(1)}</span>
              <span style={{fontSize:"0.75rem",fontWeight:600,flex:1,textAlign:"right"}}>{m.a}</span>
              <span style={{fontSize:"1rem"}}>{f(m.a)}</span>
            </div>
            <div style={{display:"flex",borderRadius:"5px",overflow:"hidden",height:"18px",gap:"1px"}}>
              {[{p:m.hw,c:"#22c55e"},{p:m.d,c:"#eab308"},{p:m.aw,c:"#ef4444"}].map(({p,c},idx)=>(
                <div key={idx} style={{flex:p,background:`${c}${p===Math.max(m.hw,m.d,m.aw)?"bb":"33"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {p===Math.max(m.hw,m.d,m.aw)&&<span style={{fontSize:"0.55rem",fontWeight:800,color:"#000"}}>{(p*100).toFixed(0)}%</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Doorstoom kansen alle groepen */}
      <div style={{marginTop:"1rem",padding:"0.75rem",background:"rgba(168,85,247,0.05)",border:"1px solid rgba(168,85,247,0.12)",borderRadius:"12px"}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:"#a855f7",marginBottom:"0.5rem",letterSpacing:"0.08em"}}>🏆 KANSEN OP DOORSTOOT — ALLE GROEPEN</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem"}}>
          {Object.entries(WC_GROUPS).map(([g,teams])=>{
            const {standings:st} = simulate(teams);
            return (
              <div key={g} style={{background:"rgba(255,255,255,0.03)",borderRadius:"8px",padding:"0.5rem 0.6rem"}}>
                <div style={{fontSize:"0.58rem",fontWeight:700,color:"rgba(255,255,255,0.3)",marginBottom:"0.3rem"}}>Groep {g}</div>
                {st.slice(0,2).map(([team],i)=>(
                  <div key={team} style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.15rem"}}>
                    <span style={{fontSize:"0.75rem"}}>{f(team)}</span>
                    <span style={{fontSize:"0.62rem",color:"#22c55e",fontWeight:600}}>{team.length>12?team.slice(0,11)+"…":team}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TrackRecord({ user, isPro, onShowPro }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!user) { setLoading(false); return; }
    const loadPredictions = async () => {
      try {
        const { data } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setPredictions(data || []);
      } catch(e) { console.log('Load predictions fout:', e); }
      setLoading(false);
    };
    loadPredictions();
  }, [user]);

  const completed = predictions.filter(p => p.correct !== null);
  const correct = completed.filter(p => p.correct).length;
  const accuracy = completed.length > 0 ? (correct/completed.length*100).toFixed(0) : null;

  if(!user) return (
    <div style={{textAlign:"center",padding:"2rem 1rem"}}>
      <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>📈</div>
      <div style={{fontWeight:700,marginBottom:"0.5rem"}}>Track Record</div>
      <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.4)",marginBottom:"1.5rem"}}>Log in om je voorspellingen bij te houden</div>
    </div>
  );

  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>Track Record</div>
      <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"1rem"}}>Jouw voorspellingen · WK 2026</div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"1rem"}}>
        {[
          {l:"Voorspellingen",v:predictions.length},
          {l:"Correct",v:completed.length>0?correct:"—"},
          {l:"Accuraatheid",v:accuracy?`${accuracy}%`:"—"},
        ].map(s=>(
          <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"0.7rem 0.5rem",textAlign:"center"}}>
            <div style={{fontSize:"1.2rem",fontWeight:800,color:"#22c55e"}}>{s.v}</div>
            <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.3)",marginTop:"0.2rem"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Predictions list */}
      {loading ? (
        <div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.3)"}}>Laden...</div>
      ) : predictions.length === 0 ? (
        <div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.3)"}}>
          <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>⚽</div>
          <div style={{fontSize:"0.78rem"}}>Nog geen voorspellingen — doe je eerste!</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
          {predictions.map(p=>(
            <div key={p.id} style={{padding:"0.7rem 0.8rem",background:"rgba(255,255,255,0.03)",border:`1px solid ${p.correct===true?"rgba(34,197,94,0.2)":p.correct===false?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.05)"}`,borderRadius:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.3rem"}}>
                <span style={{fontSize:"0.78rem",fontWeight:600}}>{p.home} vs {p.away}</span>
                {p.correct===true&&<span style={{fontSize:"0.65rem",color:"#22c55e",fontWeight:700}}>✅ Correct</span>}
                {p.correct===false&&<span style={{fontSize:"0.65rem",color:"#f87171",fontWeight:700}}>❌ Fout</span>}
                {p.correct===null&&<span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>⏳ Wacht op uitslag</span>}
              </div>
              <div style={{display:"flex",gap:"0.5rem",fontSize:"0.65rem",color:"rgba(255,255,255,0.4)"}}>
                <span>Verwacht: {p.predicted_score_home}–{p.predicted_score_away}</span>
                {p.actual_score_home!==null&&<span>Uitslag: {p.actual_score_home}–{p.actual_score_away}</span>}
                <span style={{marginLeft:"auto"}}>{p.match_date}</span>
              </div>
              <div style={{display:"flex",gap:"0.4rem",marginTop:"0.3rem"}}>
                {[
                  {l:p.home,v:(p.predicted_home_win*100).toFixed(0)+"%",c:"#22c55e"},
                  {l:"X",v:(p.predicted_draw*100).toFixed(0)+"%",c:"#eab308"},
                  {l:p.away,v:(p.predicted_away_win*100).toFixed(0)+"%",c:"#ef4444"},
                ].map(x=>(
                  <div key={x.l} style={{flex:1,textAlign:"center",padding:"0.2rem",background:"rgba(255,255,255,0.03)",borderRadius:"5px"}}>
                    <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.3)"}}>{x.l.length>8?x.l.slice(0,8)+"...":x.l}</div>
                    <div style={{fontSize:"0.68rem",fontWeight:700,color:x.c}}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProGate({ onUpgrade, feature }) {
  return (
    <div style={{
      padding:"1rem", background:"linear-gradient(135deg,rgba(0,232,122,0.05),rgba(0,196,255,0.05))",
      border:"1px solid rgba(0,232,122,0.15)", borderRadius:"12px",
      textAlign:"center",
    }}>
      <div style={{fontSize:"1.1rem",marginBottom:"0.35rem"}}>🔒</div>
      <div style={{fontSize:"0.75rem",fontWeight:700,marginBottom:"0.25rem"}}>{feature}</div>
      <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.4)",marginBottom:"0.75rem"}}>
        Beschikbaar in Matchcast Pro
      </div>
      <button onClick={onUpgrade} style={{
        padding:"0.55rem 1.25rem",
        background:"linear-gradient(135deg,#00e87a,#00c4ff)",
        border:"none", borderRadius:"8px",
        color:"#000", fontWeight:700, fontSize:"0.75rem", cursor:"pointer",
      }}>
        ⚡ Upgrade naar Pro — €9.99/mnd
      </button>
    </div>
  );
}

export default function MatchcastPredictor(){
  const [home,setHome]=useState("Netherlands");
  const [away,setAway]=useState("Germany");
  const [neutral,setNeutral]=useState(true);
  const [tournament,setTournament]=useState("FIFA World Cup");
  const [result,setResult]=useState(null);
  const [oddsResult,setOddsResult]=useState(null);
  const [tab,setTab]=useState("predict");
  const [wcGroup,setWcGroup]=useState("all");
  const [wcRound,setWcRound]=useState("all");
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(false);
  const [liveOddsSource,setLiveOddsSource]=useState("");
  const [showAuth,setShowAuth]=useState(false);
  const [showPro,setShowPro]=useState(false);
  const { user, isPro } = useAuth();
  // Odds state
  const [oH,setOH]=useState(""); const [oD,setOD]=useState(""); const [oA,setOA]=useState("");
  const [ouOdds,setOuOdds]=useState({ou15:"",ou25:"",ou35:"",btts:""});
  const [showOdds,setShowOdds]=useState(false);
  const [showIntel,setShowIntel]=useState(false);
  const [intelLines,setIntelLines]=useState([]);

  const runPredict=async()=>{
    if(!home||!away||home===away)return;
    setLoading(true);
    setOddsResult(null);
    setShowOdds(false); setShowIntel(false); setIntelLines([]);
    setOH(""); setOD(""); setOA(""); setOuOdds({ou15:"",ou25:"",ou35:"",btts:""});
    setSavedId(null);

    try {
      // Probeer backend eerst
      const res = await fetch(`${BACKEND_URL}/predict?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}&neutral=${neutral}&tournament=${encodeURIComponent(tournament)}`);
      if(res.ok){
        const data = await res.json();
        // Converteer backend response naar app formaat
        // Meest waarschijnlijke uitslag berekenen
        const lsH = data.likelyHome !== undefined ? data.likelyHome : Math.round(data.lambdaHome);
        const lsA = data.likelyAway !== undefined ? data.likelyAway : Math.round(data.lambdaAway);
        // Bereken winnende scores lokaal op basis van backend lambdas
        let winH=0,winA=0,winP=0,loseH=0,loseA=0,loseP=0;
        const lh_b=data.lambdaHome||1.2, la_b=data.lambdaAway||1.0;
        for(let i=0;i<9;i++) for(let j=0;j<9;j++){
          const p=poissonPMF(i,lh_b)*poissonPMF(j,la_b);
          if(i>j&&p>winP){winP=p;winH=i;winA=j;}
          if(j>i&&p>loseP){loseP=p;loseH=i;loseA=j;}
        }
        const r = {
          hw: data.homeWin,
          d: data.draw,
          aw: data.awayWin,
          lh: data.lambdaHome,
          la: data.lambdaAway,
          lsH, lsA,
          winningH:winH, winningA:winA,
          losingH:loseH, losingA:loseA,
          homeElo: data.homeElo,
          awayElo: data.awayElo,
          ou15: data.ou15 || 0,
          ou25: data.ou25 || 0,
          ou35: data.ou35 || 0,
          btts: data.btts || 0,
          totalGoals: data.totalGoals || (data.lambdaHome + data.lambdaAway),
          lhDisplay: data.lambdaHome,
          laDisplay: data.lambdaAway,
          liveData: data.liveData,
          fromBackend: true,
          modelUsed: data.model || 'backend',
        };
        setResult(r);
        setHistory(prev=>[{home,away,tournament,neutral,result:r,id:Date.now()},...prev.slice(0,9)]);

        // Auto-vul odds als backend live odds heeft gevonden
        if(data.liveOdds && data.liveOdds.homeOdds) {
          const lo = data.liveOdds;
          setOH(lo.homeOdds.toFixed(2));
          setOD(lo.drawOdds ? lo.drawOdds.toFixed(2) : "");
          setOA(lo.awayOdds.toFixed(2));
          setOuOdds({
            ou15: lo.ou15Odds ? lo.ou15Odds.toFixed(2) : "",
            ou25: lo.ou25Odds ? lo.ou25Odds.toFixed(2) : "",
            ou35: lo.ou35Odds ? lo.ou35Odds.toFixed(2) : "",
            btts: lo.bttsOdds ? lo.bttsOdds.toFixed(2) : "",
          });
          setShowOdds(true);
          setLiveOddsSource(lo.bookmaker || "Bookmaker");
        }
      } else {
        throw new Error("Backend niet bereikbaar");
      }
    } catch(e) {
      console.log("Backend fout:", e.message, "— gebruik lokaal model");
      const r=calcMatch(home,away,neutral,tournament);
      setResult(r);
      setHistory(prev=>[{home,away,tournament,neutral,result:r,id:Date.now()},...prev.slice(0,9)]);
      savePrediction(r);
    }
    setLoading(false);
  };

  const runOdds=()=>{
    const h=parseFloat(oH),d=parseFloat(oD),a=parseFloat(oA);
    if(!h||!d||!a||h<=1||d<=1||a<=1)return;
    const base=result||calcMatch(home,away,neutral,tournament);
    setOddsResult(fuseOdds(base,h,d,a));
  };

  const runIntel=()=>{
    if(!result) return;
    const he=ELO[home]||1500,ae=ELO[away]||1500,diff=he-ae;
    const ha=Math.min(1.25,Math.max(0.75,ATTACK[home]||1));
    const aa=Math.min(1.25,Math.max(0.75,ATTACK[away]||1));
    const hd=Math.min(1.25,Math.max(0.75,DEFENSE[home]||1));
    const ad=Math.min(1.25,Math.max(0.75,DEFENSE[away]||1));
    const r=result;
    const lines=[];
    if(diff>300)lines.push({icon:"⚡",c:"home",t:`${home} grote favoriet — ${diff} Elo punten verschil`});
    else if(diff>150)lines.push({icon:"📈",c:"home",t:`${home} lichte favoriet — ${diff} Elo voorsprong`});
    else if(diff<-300)lines.push({icon:"⚡",c:"away",t:`${away} grote favoriet — ${Math.abs(diff)} Elo punten verschil`});
    else if(diff<-150)lines.push({icon:"📈",c:"away",t:`${away} lichte favoriet — ${Math.abs(diff)} Elo voorsprong`});
    else lines.push({icon:"⚖️",c:null,t:`Evenwichtige wedstrijd — slechts ${Math.abs(diff)} Elo verschil`});
    if(ha>1.15&&ad>1.10)lines.push({icon:"🎯",c:"home",t:`${home} aanvallend sterk tegenover kwetsbare defensie ${away}`});
    if(aa>1.15&&hd>1.10)lines.push({icon:"🎯",c:"away",t:`${away} aanvallend sterk tegenover kwetsbare defensie ${home}`});
    if(hd<0.85&&ad<0.85)lines.push({icon:"🛡️",c:null,t:"Beide teams defensief sterk — minder goals verwacht"});
    else if(hd<0.85)lines.push({icon:"🛡️",c:"home",t:`${home} defensief sterk — laat weinig weg`});
    else if(ad<0.85)lines.push({icon:"🛡️",c:"away",t:`${away} defensief sterk — laat weinig weg`});
    const ou25val=r.ou25;
    if(ou25val>0.62)lines.push({icon:"⚽",c:null,t:`Scorend duel — ${(ou25val*100).toFixed(0)}% kans op meer dan 2 goals`});
    else if(ou25val<0.42)lines.push({icon:"🔒",c:null,t:`Weinig goals verwacht — ${(ou25val*100).toFixed(0)}% kans op meer dan 2 goals`});
    else lines.push({icon:"⚽",c:null,t:`Gemiddeld scorend duel — ${(ou25val*100).toFixed(0)}% kans op meer dan 2 goals`});
    if(r.btts>0.60&&ou25val>0.50)lines.push({icon:"🔄",c:null,t:`Beide teams scoren waarschijnlijk — BTTS ${(r.btts*100).toFixed(0)}%`});
    else if(r.btts<0.35)lines.push({icon:"🔒",c:null,t:`Één team scoort waarschijnlijk niet — BTTS ${(r.btts*100).toFixed(0)}%`});
    if(neutral)lines.push({icon:"🌍",c:null,t:"Neutraal veld — geen thuisvoordeel meegenomen"});
    else lines.push({icon:"🏠",c:"home",t:`${home} speelt thuis — voordeel verwerkt`});
    const tw=TOURNAMENT_WEIGHTS[tournament]||1;
    if(tw>=1.7)lines.push({icon:"🏆",c:null,t:`${tournament} — toptoernooi, hogere inzet beïnvloedt spelpatronen`});
    setIntelLines(lines); setShowIntel(true);
  };

  // Sla voorspelling op in Supabase
  const [savedId, setSavedId] = useState(null);

  const savePrediction = async (r) => {
    if(!user || !r) return;
    try {
      const { data, error } = await supabase.from('predictions').insert({
        user_id: user.id,
        home, away, tournament,
        predicted_home_win: r.hw,
        predicted_draw: r.d,
        predicted_away_win: r.aw,
        predicted_score_home: r.lsH,
        predicted_score_away: r.lsA,
        match_date: new Date().toISOString().split('T')[0],
      }).select();
      if(!error && data) setSavedId(data[0]?.id);
    } catch(e) { console.log('Save prediction fout:', e); }
  };

  const active=oddsResult||result;
  const maxProb=active?Math.max(active.hw,active.d,active.aw):0;
  const winner=active?(active.hw===maxProb?home:active.aw===maxProb?away:"Gelijkspel"):null;
  const allOddsValid=oH&&oD&&oA&&parseFloat(oH)>1.01&&parseFloat(oD)>1.01&&parseFloat(oA)>1.01;
  const edgeH=allOddsValid&&result?getEdge(result.hw,oH,oD,oA,"h"):null;
  const edgeD=allOddsValid&&result?getEdge(result.d,oH,oD,oA,"d"):null;
  const edgeA=allOddsValid&&result?getEdge(result.aw,oH,oD,oA,"a"):null;
  const vigPct=allOddsValid?((1/parseFloat(oH)+1/parseFloat(oD)+1/parseFloat(oA)-1)*100).toFixed(1):null;

  const wcFiltered = WC_MATCHES.filter(m=>
    (wcGroup==="all" || m.group===wcGroup) &&
    (wcRound==="all" || String(m.round||1)===wcRound)
  );

  return(
    <div style={{minHeight:"100vh",background:"#0b0b17",color:"#fff",fontFamily:"'DM Sans','Segoe UI',sans-serif",paddingBottom:"2rem",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  html,body{max-width:100vw;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);}
        @keyframes pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pop{animation:pop 0.3s cubic-bezier(0.16,1,0.3,1) forwards;}
        input::placeholder{color:rgba(255,255,255,0.2);}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        select option{background:#12121f;}
        button:active{opacity:0.8;}
      `}</style>

      {/* Header */}
      <div style={{padding:"1rem 1rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.05)",overflow:"visible",position:"relative",zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span style={{fontSize:"1.3rem"}}>⚽</span>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,letterSpacing:"-0.02em",lineHeight:1}}>Match<span style={{color:"#22c55e"}}>cast</span></div>
            <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.18)",letterSpacing:"0.08em"}}>WK 2026 · AI VOORSPELMODEL · 52.8%</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <UserMenu onShowAuth={()=>setShowAuth(true)} onShowPro={()=>setShowPro(true)} />
          <div style={{display:"flex",gap:"2px",background:"rgba(255,255,255,0.04)",borderRadius:"9px",padding:"2px"}}>
            {[["predict","⚽"],["wk","🏆"],["sim","🔮"],["picks","🎯"],["rankings","📊"],["track","📈"]].map(([t,ic])=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"0.35rem 0.6rem",background:tab===t?"rgba(255,255,255,0.1)":"transparent",border:"none",borderRadius:"7px",color:tab===t?"#fff":"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"0.75rem",transition:"all 0.15s"}}>{ic}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"1rem",maxWidth:"480px",margin:"0 auto"}}>

        {/* ── PREDICT ── */}
        {tab==="predict"&&<>
          <div style={{display:"flex",gap:"0.5rem",alignItems:"center",marginBottom:"0.65rem"}}>
            <TeamPicker value={home} onChange={v=>{setHome(v);setResult(null);setOddsResult(null);}} side="home" exclude={away}/>
            <div style={{flexShrink:0,width:"30px",height:"30px",borderRadius:"50%",background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",color:"rgba(255,255,255,0.2)",fontWeight:700}}>VS</div>
            <TeamPicker value={away} onChange={v=>{setAway(v);setResult(null);setOddsResult(null);}} side="away" exclude={home}/>
          </div>

          <div style={{display:"flex",gap:"0.45rem",marginBottom:"0.65rem"}}>
            <select value={tournament} onChange={e=>setTournament(e.target.value)} style={{flex:1,padding:"0.55rem 0.6rem",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",color:"rgba(255,255,255,0.65)",fontSize:"0.7rem",cursor:"pointer",outline:"none"}}>
              {TOURNAMENTS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={()=>setNeutral(!neutral)} style={{padding:"0.55rem 0.7rem",flexShrink:0,background:neutral?"rgba(34,197,94,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${neutral?"rgba(34,197,94,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:"10px",color:neutral?"#22c55e":"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"0.65rem",fontWeight:600,transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {neutral?"⚖️ Neutraal":"🏠 Thuis/Uit"}
            </button>
            {result&&<button onClick={()=>{setResult(null);setOddsResult(null);setShowOdds(false);setShowIntel(false);setIntelLines([]);setOH("");setOD("");setOA("");}} style={{padding:"0.55rem 0.65rem",flexShrink:0,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:"10px",color:"#f87171",cursor:"pointer",fontSize:"0.7rem",fontWeight:700}}>✕</button>}
          </div>

          <button onClick={runPredict} disabled={!home||!away||home===away||loading} style={{width:"100%",padding:"0.85rem",marginBottom:"0.65rem",background:(!home||!away||home===away)?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:"12px",color:(!home||!away||home===away)?"rgba(255,255,255,0.2)":"#fff",fontSize:"0.85rem",fontWeight:800,cursor:(!home||!away||home===away)?"not-allowed":"pointer",transition:"all 0.2s",boxShadow:(!home||!away||home===away)?"none":"0 4px 20px rgba(22,163,74,0.3)"}}>
            {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem"}}><span style={{animation:"spin 0.7s linear infinite",display:"inline-block"}}>⟳</span>Berekenen...</span>:"⚽ Bereken Voorspelling"}
          </button>

          {active&&<div className="pop" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"16px",overflow:"hidden",marginBottom:"0.65rem"}}>

            {/* Score header — clean professional design */}
            <div style={{padding:"1.25rem 1rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>

              {/* Teams row */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
                {/* Home team */}
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",flex:1}}>
                  <span style={{fontSize:"2rem"}}>{f(home)}</span>
                  <div>
                    <div style={{fontSize:"0.82rem",fontWeight:700,lineHeight:1.2}}>{home}</div>
                    <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)",marginTop:"2px"}}>ELO {active.homeElo}</div>
                  </div>
                </div>

                {/* Score */}
                <div style={{textAlign:"center",flexShrink:0,padding:"0 0.75rem"}}>
                  <div style={{
                    fontSize:"2rem",fontWeight:700,lineHeight:1,
                    letterSpacing:"0.05em",color:"#fff",
                    fontVariantNumeric:"tabular-nums",
                  }}>
                    <span>{active.lsH}</span>
                    <span style={{color:"rgba(255,255,255,0.2)",margin:"0 6px",fontSize:"1.4rem"}}>:</span>
                    <span>{active.lsA}</span>
                  </div>
                  <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.2)",letterSpacing:"0.08em",marginTop:"4px"}}>VERWACHTE UITSLAG</div>
                  
                </div>

                {/* Away team */}
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",flex:1,justifyContent:"flex-end",textAlign:"right"}}>
                  <div>
                    <div style={{fontSize:"0.82rem",fontWeight:700,lineHeight:1.2}}>{away}</div>
                    <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)",marginTop:"2px"}}>ELO {active.awayElo}</div>
                  </div>
                  <span style={{fontSize:"2rem"}}>{f(away)}</span>
                </div>
              </div>

              {/* Win probability bar */}
              <ProbBar hw={active.hw} d={active.d} aw={active.aw} home={home} away={away}/>

              {/* Winner badge + model badge */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"0.65rem",flexWrap:"wrap",gap:"0.35rem"}}>
                {winner&&<span style={{
                  display:"inline-flex",alignItems:"center",gap:"0.35rem",
                  padding:"0.2rem 0.65rem",
                  background:winner===home?"rgba(34,197,94,0.1)":winner===away?"rgba(239,68,68,0.08)":"rgba(234,179,8,0.08)",
                  border:`1px solid ${winner===home?"rgba(34,197,94,0.2)":winner===away?"rgba(239,68,68,0.15)":"rgba(234,179,8,0.15)"}`,
                  borderRadius:"20px",fontSize:"0.65rem",fontWeight:600,
                  color:winner===home?"#4ade80":winner===away?"#f87171":"#fbbf24",
                }}>
                  {winner==="Gelijkspel"?"🤝 Gelijkspel waarschijnlijkst":`${f(winner)} ${winner} wint — ${(maxProb*100).toFixed(0)}%`}
                </span>}
                <span style={{
                  fontSize:"0.55rem",fontWeight:600,
                  color:active.fromBackend?"#22d3ee":"#facc15",
                  opacity:0.8,
                }}>
                  {active.fromBackend?"🔗 Live backend":"📱 Lokaal model"}
                  {active.oddsApplied&&<span style={{color:"#a855f7",marginLeft:"0.4rem"}}>· odds verwerkt</span>}
                  {active.liveData&&active.liveData.used&&<span style={{color:"#4ade80",marginLeft:"0.4rem"}}>· live data</span>}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.35rem",padding:"0.7rem 0.9rem"}}>
              {[
                {l:"λ Thuis",v:(active.lhDisplay||active.lh).toFixed(2)},
                {l:"λ Uit",v:(active.laDisplay||active.la).toFixed(2)},
                {l:"Totaal goals",v:(active.totalGoals).toFixed(2)},
                {l:"BTTS",v:`${(active.btts*100).toFixed(0)}%`},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:"8px",padding:"0.45rem 0.5rem",textAlign:"center"}}>
                  <div style={{fontSize:"0.48rem",color:"rgba(255,255,255,0.25)",marginBottom:"0.15rem"}}>{s.l}</div>
                  <div style={{fontSize:"0.8rem",fontWeight:700}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Over/Under markten */}
            <div style={{padding:"0 0.9rem 0.7rem"}}>
              <div style={{fontSize:"0.55rem",fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",marginBottom:"0.35rem"}}>OVER/UNDER MARKTEN</div>
              {isPro ? (
                <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"10px",padding:"0.5rem 0.7rem"}}>
                  <OURow label="Over 1.5 goals" prob={active.ou15} odds={ouOdds.ou15}/>
                  <OURow label="Over 2.5 goals" prob={active.ou25} odds={ouOdds.ou25}/>
                  <OURow label="Over 3.5 goals" prob={active.ou35} odds={ouOdds.ou35}/>
                  <OURow label="Beide teams scoren (BTTS)" prob={active.btts} odds={ouOdds.btts}/>
                </div>
              ) : (
                <ProGate onUpgrade={()=>setShowPro(true)} feature="O/U markten + BTTS kansen" />
              )}
              {isPro && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0.35rem",marginTop:"0.35rem"}}>
                {[["ou15","O1.5"],["ou25","O2.5"],["ou35","O3.5"],["btts","BTTS"]].map(([k,l])=>(
                  <div key={k}>
                    <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.2)",marginBottom:"0.2rem",textAlign:"center"}}>{l}</div>
                    <input type="number" step="0.01" min="1.01" placeholder="odds" value={ouOdds[k]} onChange={e=>setOuOdds(p=>({...p,[k]:e.target.value}))} style={{width:"100%",padding:"0.4rem 0.3rem",textAlign:"center",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",color:"#fff",fontSize:"0.78rem",fontFamily:"monospace",outline:"none"}}/>
                  </div>
                ))}
              </div>}
            </div>

            {/* Bookmaker odds */}
            <div style={{padding:"0 0.9rem 0.7rem"}}>
              {!showOdds?(
                isPro ? (
                <button onClick={()=>setShowOdds(true)} style={{width:"100%",padding:"0.65rem",background:"rgba(168,85,247,0.07)",border:"1px solid rgba(168,85,247,0.18)",borderRadius:"10px",color:"#a855f7",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
                  📈 Voeg 1X2 odds toe → ontdek value bets
                </button>
                ) : (
                <ProGate onUpgrade={()=>setShowPro(true)} feature="Value bet detectie + automatische odds" />
                )
              ):(
                <div style={{background:"rgba(168,85,247,0.05)",border:"1px solid rgba(168,85,247,0.12)",borderRadius:"12px",padding:"0.75rem"}}>
                  <div style={{fontSize:"0.58rem",fontWeight:700,color:"#a855f7",marginBottom:"0.5rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>📈 BOOKMAKER ODDS (decimaal){liveOddsSource&&<span style={{color:"#4ade80",marginLeft:"0.4rem"}}>· {liveOddsSource} ⚡</span>}</span>
                    {vigPct&&<span style={{color:parseFloat(vigPct)>8?"#f87171":parseFloat(vigPct)>5?"#fbbf24":"#4ade80"}}>Vig: {vigPct}%</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.4rem",marginBottom:"0.5rem"}}>
                    {[{l:shortName(home),v:oH,s:setOH,c:"#22c55e"},{l:"X",v:oD,s:setOD,c:"#eab308"},{l:shortName(away),v:oA,s:setOA,c:"#ef4444"}].map(({l,v,s,c})=>(
                      <div key={l}>
                        <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)",marginBottom:"0.2rem",textAlign:"center"}}>{l}</div>
                        <input type="number" step="0.01" min="1.01" placeholder="2.10" value={v} onChange={e=>s(e.target.value)} style={{width:"100%",padding:"0.45rem 0.35rem",textAlign:"center",background:"rgba(255,255,255,0.05)",border:`1.5px solid ${v&&parseFloat(v)>1?c+"66":"rgba(255,255,255,0.08)"}`,borderRadius:"8px",color:"#fff",fontSize:"0.88rem",fontFamily:"monospace",fontWeight:700,outline:"none"}}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={runOdds} disabled={!allOddsValid} style={{width:"100%",padding:"0.6rem",background:allOddsValid?"linear-gradient(135deg,#7c3aed,#6d28d9)":"rgba(255,255,255,0.04)",border:"none",borderRadius:"8px",color:allOddsValid?"#fff":"rgba(255,255,255,0.2)",fontSize:"0.72rem",fontWeight:700,cursor:allOddsValid?"pointer":"not-allowed",transition:"all 0.2s",marginBottom:"0.5rem"}}>
                    Combineer model + odds →
                  </button>

                  {/* Value badges */}
                  {oddsResult&&allOddsValid&&(
                    <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",marginBottom:"0.5rem"}}>
                      <ValueBadge edge={edgeH} label={`${shortName(home)} wint`} eloDiff={(ELO[home]||1500)-(ELO[away]||1500)}/>
                      <ValueBadge edge={edgeD} label="Gelijkspel" eloDiff={(ELO[home]||1500)-(ELO[away]||1500)}/>
                      <ValueBadge edge={edgeA} label={`${shortName(away)} wint`} eloDiff={(ELO[home]||1500)-(ELO[away]||1500)}/>
                      {[edgeH,edgeD,edgeA].every(e=>e!==null&&Math.abs(e)<3)&&(
                        <div style={{padding:"0.35rem 0.6rem",background:"rgba(255,255,255,0.03)",borderRadius:"8px",fontSize:"0.65rem",color:"rgba(255,255,255,0.3)",textAlign:"center"}}>
                          ✓ Model en bookmaker zijn het eens — geen duidelijke value
                        </div>
                      )}
                      <div style={{padding:"0.3rem 0.5rem",background:"rgba(250,204,21,0.04)",borderRadius:"7px",fontSize:"0.58rem",color:"rgba(250,204,21,0.5)",marginTop:"0.3rem"}}>
                        ⚠️ Value bets zijn indicatief — geen garantie op winst. Model accuraatheid: ~62%.
                      </div>
                    </div>
                  )}

                  {/* Odds vergelijking tabel */}
                  {oddsResult&&(
                    <div style={{background:"rgba(0,0,0,0.2)",borderRadius:"8px",overflow:"hidden"}}>
                      <div style={{display:"grid",gridTemplateColumns:"70px 1fr 1fr 1fr",fontSize:"0.58rem"}}>
                        {["","1","X","2"].map(h=><div key={h} style={{padding:"0.3rem 0.4rem",textAlign:"center",color:"rgba(255,255,255,0.2)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{h}</div>)}
                        {[
                          {l:"Model",hw:result.hw,d:result.d,aw:result.aw,c:"rgba(255,255,255,0.45)"},
                          {l:"Boekmaker",hw:oddsResult.bH,d:oddsResult.bD,aw:oddsResult.bA,c:"#a855f7"},
                          {l:"Fusie",hw:oddsResult.hw,d:oddsResult.d,aw:oddsResult.aw,c:"#22c55e"},
                        ].flatMap(row=>[
                          <div key={row.l} style={{padding:"0.3rem 0.4rem",color:row.c,fontWeight:600,fontSize:"0.6rem"}}>{row.l}</div>,
                          ...[row.hw,row.d,row.aw].map((p,i)=>(
                            <div key={i} style={{padding:"0.3rem 0.4rem",textAlign:"center",color:row.c,fontFamily:"monospace",fontWeight:700}}>{(p*100).toFixed(0)}%</div>
                          ))
                        ])}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wedstrijd analyse */}
            <div style={{padding:"0 0.9rem 0.9rem"}}>
              {!showIntel?(
                isPro ? (
                <button onClick={runIntel} style={{width:"100%",padding:"0.65rem",background:"rgba(34,211,238,0.05)",border:"1px solid rgba(34,211,238,0.12)",borderRadius:"10px",color:"#22d3ee",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
                  🧠 Wedstrijd analyse
                </button>
                ) : (
                <ProGate onUpgrade={()=>setShowPro(true)} feature="AI wedstrijd analyse" />
                )
              ):(
                <div style={{background:"rgba(34,211,238,0.04)",border:"1px solid rgba(34,211,238,0.1)",borderRadius:"12px",padding:"0.75rem"}}>
                  <div style={{fontSize:"0.55rem",fontWeight:700,color:"#22d3ee",marginBottom:"0.45rem",letterSpacing:"0.1em"}}>🧠 WEDSTRIJD ANALYSE</div>
                  <div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>
                    {intelLines.map((l,i)=>(
                      <div key={i} style={{display:"flex",gap:"0.4rem",alignItems:"flex-start",padding:"0.35rem 0.45rem",background:l.c==="home"?"rgba(34,197,94,0.06)":l.c==="away"?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.03)",borderRadius:"7px",borderLeft:`2px solid ${l.c==="home"?"#22c55e":l.c==="away"?"#ef4444":"rgba(255,255,255,0.1)"}`}}>
                        <span style={{fontSize:"0.82rem",flexShrink:0,lineHeight:1.5}}>{l.icon}</span>
                        <span style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{l.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>}

          {/* Sla op knop */}
          {active&&user&&(
            <button onClick={()=>{savePrediction(oddsResult||result);}} style={{
              width:"100%",padding:"0.6rem",marginBottom:"0.65rem",
              background:savedId?"rgba(34,197,94,0.15)":"rgba(34,197,94,0.08)",
              border:`1px solid ${savedId?"rgba(34,197,94,0.4)":"rgba(34,197,94,0.2)"}`,
              borderRadius:"10px",color:"#22c55e",
              fontSize:"0.72rem",fontWeight:700,cursor:"pointer",
            }}>
              {savedId?"✅ Opgeslagen in track record":"💾 Sla voorspelling op in track record"}
            </button>
          )}

          {/* History */}
          {history.length>0&&<div>
            <div style={{fontSize:"0.55rem",fontWeight:700,color:"rgba(255,255,255,0.18)",letterSpacing:"0.08em",marginBottom:"0.4rem"}}>RECENTE ANALYSES</div>
            {history.slice(0,5).map(h=>{
              const r=h.result;
              const best=r.hw>r.aw&&r.hw>r.d?h.home:r.aw>r.d?h.away:"Gelijk";
              const prob=Math.max(r.hw,r.d,r.aw);
              return(
                <button key={h.id} onClick={()=>{setHome(h.home);setAway(h.away);setTournament(h.tournament);setNeutral(h.neutral);setResult(h.result);setOddsResult(null);setShowOdds(false);setShowIntel(false);setIntelLines([]);setOH("");setOD("");setOA("");}}
                  style={{width:"100%",padding:"0.5rem 0.7rem",marginBottom:"0.3rem",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"9px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
                  <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.35)"}}>{f(h.home)} {h.home} vs {h.away} {f(h.away)}</span>
                  <span style={{fontSize:"0.68rem",fontWeight:700,color:best===h.home?"#22c55e":best===h.away?"#ef4444":"#fbbf24",flexShrink:0,marginLeft:"0.5rem"}}>{best} {(prob*100).toFixed(0)}%</span>
                </button>
              );
            })}
          </div>}
        </>}

        {/* ── WK 2026 ── */}
        {tab==="wk"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"0.75rem"}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800}}>WK 2026 Groepsfase</div>
              <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)"}}>11 juni – 27 juni · 48 teams · Klik om te voorspellen</div>
            </div>
          </div>
          {/* Round + Group filter */}
          <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.4rem"}}>
            {["all","1","2","3"].map(r=>(
              <button key={r} onClick={()=>setWcRound(r)} style={{padding:"0.3rem 0.55rem",background:wcRound===r?"rgba(168,85,247,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${wcRound===r?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.07)"}`,borderRadius:"7px",color:wcRound===r?"#a855f7":"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:"0.65rem",fontWeight:600,transition:"all 0.15s"}}>
                {r==="all"?"Alle rondes":`Ronde ${r}`}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>
            {["all",...Object.keys(WC_GROUPS)].map(g=>(
              <button key={g} onClick={()=>setWcGroup(g)} style={{padding:"0.3rem 0.55rem",background:wcGroup===g?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${wcGroup===g?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.07)"}`,borderRadius:"7px",color:wcGroup===g?"#22c55e":"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:"0.65rem",fontWeight:600,transition:"all 0.15s"}}>
                {g==="all"?"Alle":g}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
            {wcFiltered.map((m,i)=>{
              const r=calcMatch(m.home,m.away,true,"FIFA World Cup");
              const best=r.hw>r.aw&&r.hw>r.d?m.home:r.aw>r.d?m.away:"Gelijk";
              const prob=Math.max(r.hw,r.d,r.aw);
              return(
                <button key={i} onClick={()=>{setHome(m.home);setAway(m.away);setTournament("FIFA World Cup");setNeutral(true);setResult(r);setOddsResult(null);setShowOdds(false);setShowIntel(false);setIntelLines([]);setOH("");setOD("");setOA("");setTab("predict");}}
                  style={{width:"100%",padding:"0.65rem 0.75rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"11px",cursor:"pointer",textAlign:"left",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.35rem"}}>
                    <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.18)",fontFamily:"monospace"}}>Groep {m.group} · {m.date} · {m.venue}</span>
                    {prob>0.65&&<span style={{fontSize:"0.55rem",color:"#fbbf24",fontWeight:700}}>🔥 Grote favoriet</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem"}}>
                    <span style={{fontSize:"1.2rem"}}>{f(m.home)}</span>
                    <span style={{fontSize:"0.75rem",fontWeight:600,flex:1}}>{m.home}</span>
                    <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.2)"}}>vs</span>
                    <span style={{fontSize:"0.75rem",fontWeight:600,flex:1,textAlign:"right"}}>{m.away}</span>
                    <span style={{fontSize:"1.2rem"}}>{f(m.away)}</span>
                  </div>
                  <div style={{display:"flex",borderRadius:"6px",overflow:"hidden",height:"20px",gap:"1px"}}>
                    {[{p:r.hw,c:"#22c55e"},{p:r.d,c:"#eab308"},{p:r.aw,c:"#ef4444"}].map(({p,c},i)=>(
                      <div key={i} style={{flex:p,background:`${c}${p===Math.max(r.hw,r.d,r.aw)?"bb":"2a"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {p===Math.max(r.hw,r.d,r.aw)&&<span style={{fontSize:"0.58rem",fontWeight:800,color:"#000"}}>{(p*100).toFixed(0)}%</span>}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          {/* Group standings preview */}
          <div style={{marginTop:"1rem"}}>
            <div style={{fontSize:"0.55rem",fontWeight:700,color:"rgba(255,255,255,0.18)",letterSpacing:"0.08em",marginBottom:"0.5rem"}}>GROEPSINDELING</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem"}}>
              {Object.entries(WC_GROUPS).map(([g,teams])=>(
                <div key={g} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"10px",padding:"0.6rem 0.7rem"}}>
                  <div style={{fontSize:"0.62rem",fontWeight:700,color:"rgba(255,255,255,0.3)",marginBottom:"0.35rem"}}>Groep {g}</div>
                  {teams.map(t=>(
                    <div key={t} style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.2rem"}}>
                      <span style={{fontSize:"0.85rem"}}>{f(t)}</span>
                      <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)"}}>{t}</span>
                      <span style={{marginLeft:"auto",fontSize:"0.55rem",color:"rgba(255,255,255,0.2)",fontFamily:"monospace"}}>{ELO[t]||"?"}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ── RANKINGS ── */}
        {tab==="rankings"&&<>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>ELO Rankings</div>
          <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"0.9rem"}}>49.256 wedstrijden · 1872–2026 · Klik = thuisploeg</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>
            {Object.entries(ELO).sort((a,b)=>b[1]-a[1]).filter((v,i,a)=>a.findIndex(x=>x[0]===v[0])===i).slice(0,50).map(([team,elo],i)=>{
              const pct=Math.max(0,(elo-1500)/(2110-1500));
              return(
                <button key={team} onClick={()=>{setHome(team);setTab("predict");setResult(null);setOddsResult(null);setShowOdds(false);setShowIntel(false);}}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:"0.55rem",padding:"0.45rem 0.65rem",background:i<3?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)",border:i<3?"1px solid rgba(255,255,255,0.07)":"1px solid transparent",borderRadius:"9px",cursor:"pointer",textAlign:"left",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                  onMouseLeave={e=>e.currentTarget.style.background=i<3?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)"}>
                  <span style={{width:"20px",textAlign:"center",fontSize:i<3?"0.9rem":"0.6rem",color:"rgba(255,255,255,0.2)",fontFamily:"monospace"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</span>
                  <span style={{fontSize:"1rem"}}>{f(team)}</span>
                  <span style={{flex:1,fontSize:"0.75rem",fontWeight:i<3?700:400,color:i<3?"#fff":"rgba(255,255,255,0.5)"}}>{team}</span>
                  <div style={{width:"45px",height:"3px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct*100}%`,background:i<3?"#22c55e":"rgba(255,255,255,0.12)",borderRadius:"2px"}}/>
                  </div>
                  <span style={{width:"32px",textAlign:"right",fontSize:"0.68rem",fontWeight:700,color:i<3?"#22c55e":"rgba(255,255,255,0.25)",fontFamily:"monospace"}}>{elo}</span>
                </button>
              );
            })}
          </div>
        </>}
      </div>
        {tab==="sim"&&<GroupSimulator calcMatch={calcMatch} isPro={isPro} onShowPro={()=>setShowPro(true)} />}
        {tab==="picks"&&<DailyPicks isPro={isPro} onShowPro={()=>setShowPro(true)} />}
        {tab==="track"&&<TrackRecord user={user} isPro={isPro} onShowPro={()=>setShowPro(true)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showPro && <ProModal onClose={() => setShowPro(false)} />}
    </div>
  );
}
