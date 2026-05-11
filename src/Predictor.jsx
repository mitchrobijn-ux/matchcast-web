import { useState, useMemo, useEffect } from "react";
import { useAuth, AuthModal, ProModal, supabase } from "./Auth.jsx";

const BACKEND_URL = "https://matchcast-backend-production.up.railway.app";

const shortName = (t) => {
  if(!t) return "";
  if(t.length <= 12) return t;
  const words = t.split(" ");
  if(words.length >= 2) return words[0] + " " + words[1].slice(0,3) + ".";
  return t.slice(0,12);
};

// ── Data ──────────────────────────────────────────────────────────────────────
const ELO = {"Spain":2105,"Argentina":2061,"France":2026,"England":1966,"Portugal":1941,"Brazil":1936,"Ecuador":1931,"Colombia":1928,"Netherlands":1925,"Germany":1920,"Japan":1916,"Morocco":1913,"Turkey":1901,"Croatia":1899,"Uruguay":1878,"Mexico":1869,"Senegal":1867,"Norway":1862,"Switzerland":1861,"Italy":1860,"Paraguay":1850,"Australia":1845,"Belgium":1835,"Denmark":1834,"South Korea":1822,"Canada":1819,"Iran":1819,"Austria":1808,"Nigeria":1803,"Algeria":1796,"Russia":1786,"Uzbekistan":1784,"Panama":1783,"Ukraine":1776,"United States":1772,"Scotland":1766,"Egypt":1761,"Venezuela":1759,"Serbia":1757,"Ivory Coast":1752,"Greece":1747,"Poland":1739,"Hungary":1732,"Sweden":1732,"Kosovo":1730,"Chile":1725,"DR Congo":1725,"Iraq":1724,"Czech Republic":1723,"Jordan":1719,"Wales":1713,"Slovenia":1721,"Slovakia":1680,"Republic of Ireland":1704,"Romania":1639,"Georgia":1637,"Israel":1637,"Bosnia and Herzegovina":1632,"North Macedonia":1623,"Albania":1654,"Cape Verde":1652,"Mali":1653,"Burkina Faso":1642,"Saudi Arabia":1665,"United Arab Emirates":1628,"South Africa":1621,"Cameroon":1688,"Tunisia":1699,"Ghana":1598,"Iceland":1592,"Qatar":1578,"Montenegro":1494,"Bolivia":1689,"Peru":1692,"Honduras":1653,"Jamaica":1644,"Haiti":1653,"Costa Rica":1694,"El Salvador":1482,"Guatemala":1618,"Nicaragua":1491,"Trinidad and Tobago":1527,"Curacao":1569,"Kenya":1470,"Uganda":1506,"Zambia":1510,"Angola":1545,"Mozambique":1495,"Namibia":1431,"Zimbabwe":1432,"Gambia":1507,"Libya":1534,"Sudan":1471,"Ethiopia":1400,"Togo":1469,"Benin":1553,"Guinea":1540,"Mauritania":1430,"Malawi":1424,"Rwanda":1444,"Comoros":1460,"Sierra Leone":1472,"Guinea-Bissau":1365,"Congo":1352,"Equatorial Guinea":1451,"Madagascar":1505,"Botswana":1397,"Eswatini":1330,"Lesotho":1421,"Faroe Islands":1442,"Malta":1360,"Cyprus":1386,"Andorra":1168,"Luxembourg":1424,"Liechtenstein":1064,"San Marino":977,"Gibraltar":1143,"China PR":1539,"Thailand":1526,"Malaysia":1498,"Singapore":1336,"Myanmar":1206,"Hong Kong":1346,"Taiwan":1138,"Cambodia":1116,"Philippines":1345,"India":1292,"Pakistan":1096,"Bangladesh":1194,"Nepal":1180,"Sri Lanka":1095,"Afghanistan":1278,"Tajikistan":1442,"Turkmenistan":1396,"Palestine":1565,"Syria":1567,"Lebanon":1448,"Yemen":1331,"New Caledonia":1551,"Fiji":1457,"Vanuatu":1447,"Papua New Guinea":1467,"Solomon Islands":1400,"Tahiti":1502,"Samoa":1309,"Tonga":1174,"Maldives":1124,"Bhutan":995,"Mongolia":1092,"Guam":1087,"American Samoa":1120,"Moldova":1339,"Estonia":1401,"Latvia":1351,"Lithuania":1338,"Finland":1561,"Northern Ireland":1594,"Oman":1590,"Bahrain":1520,"Kuwait":1473,"Azerbaijan":1411,"Armenia":1439,"Kazakhstan":1500,"Kyrgyzstan":1460,"New Zealand":1682};
const ATTACK = {"Spain":1.831,"Argentina":1.497,"France":1.58,"England":1.526,"Portugal":1.739,"Brazil":1.413,"Netherlands":1.673,"Germany":1.628,"Belgium":1.756,"Japan":1.805,"Norway":1.537,"Denmark":1.384,"Italy":1.404,"Canada":1.333,"Iran":1.535,"Senegal":1.312,"Morocco":1.354,"Switzerland":1.32,"South Korea":1.275,"Austria":1.34,"New Zealand":1.307,"Turkey":1.242,"Poland":1.208,"Czech Republic":1.244,"Sweden":1.244,"Serbia":1.091,"Nigeria":1.156,"Mexico":1.115,"Israel":1.105,"Jordan":1.161,"Colombia":1.167,"Uruguay":1.03,"Mali":1.074,"Jamaica":1.02,"Slovakia":1.022,"Panama":1.056,"Kyrgyzstan":1.001,"Tunisia":1.045,"United Arab Emirates":1.077,"Georgia":1.149,"Uzbekistan":1.111,"Algeria":1.6,"United States":1.384,"Australia":1.375,"Russia":1.459,"Qatar":1.136,"Ivory Coast":1.23,"Burkina Faso":1.059,"Saudi Arabia":0.916,"Ecuador":0.885,"Wales":0.973,"Chile":0.928,"Romania":1.129,"Greece":1.071,"Iceland":1.04,"Kosovo":1.041,"North Macedonia":1.008,"South Africa":1.049,"Egypt":1.097,"Cameroon":0.927,"Ghana":0.953,"DR Congo":0.919,"Iraq":0.967,"Angola":0.749,"Bosnia and Herzegovina":0.931,"Slovenia":0.918,"Zambia":0.897,"Albania":0.817,"Kenya":0.826,"Peru":0.718,"Republic of Ireland":0.791,"Croatia":1.302,"Paraguay":0.655,"Bolivia":0.658,"Honduras":0.922,"Costa Rica":1.061,"El Salvador":0.728,"Venezuela":0.817,"Haiti":1.538,"Trinidad and Tobago":1.067,"Curacao":1.313,"Cape Verde":0.853,"Scotland":1.017,"Senegal":1.312,"Morocco":1.354};
const DEFENSE = {"Spain":0.562,"Argentina":0.481,"France":0.619,"England":0.503,"Portugal":0.557,"Brazil":0.449,"Netherlands":0.712,"Germany":0.793,"Belgium":0.648,"Japan":0.608,"Norway":0.762,"Denmark":0.591,"Italy":0.638,"Canada":0.706,"Iran":0.462,"Senegal":0.435,"Morocco":0.367,"Switzerland":0.761,"South Korea":0.693,"Austria":0.745,"New Zealand":0.708,"Turkey":0.908,"Poland":0.831,"Czech Republic":0.887,"Sweden":0.805,"Serbia":0.804,"Nigeria":0.682,"Mexico":0.703,"Israel":1.241,"Jordan":0.745,"Colombia":0.635,"Uruguay":0.669,"Mali":0.489,"Jamaica":0.875,"Slovakia":0.791,"Panama":0.954,"Kyrgyzstan":1.055,"Tunisia":0.558,"United Arab Emirates":0.752,"Georgia":0.912,"Uzbekistan":0.596,"Algeria":0.599,"United States":0.677,"Australia":0.62,"Russia":0.745,"Qatar":0.933,"Ivory Coast":0.571,"Burkina Faso":0.699,"Saudi Arabia":0.766,"Ecuador":0.744,"Wales":0.758,"Chile":0.88,"Romania":0.799,"Greece":0.682,"Iceland":1.142,"Kosovo":0.945,"North Macedonia":0.918,"South Africa":0.599,"Egypt":0.484,"Cameroon":0.623,"Ghana":0.731,"DR Congo":0.638,"Iraq":0.652,"Angola":0.687,"Bosnia and Herzegovina":0.981,"Slovenia":0.681,"Zambia":0.968,"Albania":0.835,"Kenya":0.792,"Peru":0.785,"Republic of Ireland":0.779,"Croatia":0.757,"Paraguay":0.942,"Bolivia":1.397,"Honduras":0.951,"Costa Rica":0.895,"El Salvador":0.926,"Venezuela":0.965,"Haiti":1.007,"Trinidad and Tobago":1.171,"Curacao":0.864,"Cape Verde":0.734,"Scotland":0.939};
const AVG = 1.365;
const HOME_ADV = 60;
const TOURNAMENT_WEIGHTS = {"FIFA World Cup":2.0,"UEFA Euro":1.8,"Copa América":1.7,"African Cup of Nations":1.6,"FIFA World Cup qualification":1.5,"UEFA Euro qualification":1.4,"UEFA Nations League":1.3,"CONCACAF Nations League":1.2,"Friendly":0.7};
const TOURNAMENTS = Object.keys(TOURNAMENT_WEIGHTS);
const FLAGS = {"Spain":"🇪🇸","Argentina":"🇦🇷","France":"🇫🇷","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Portugal":"🇵🇹","Brazil":"🇧🇷","Netherlands":"🇳🇱","Germany":"🇩🇪","Morocco":"🇲🇦","Japan":"🇯🇵","Turkey":"🇹🇷","Croatia":"🇭🇷","Colombia":"🇨🇴","Ecuador":"🇪🇨","Senegal":"🇸🇳","Norway":"🇳🇴","Belgium":"🇧🇪","Italy":"🇮🇹","Uruguay":"🇺🇾","Mexico":"🇲🇽","Switzerland":"🇨🇭","Denmark":"🇩🇰","Poland":"🇵🇱","Australia":"🇦🇺","Iran":"🇮🇷","South Korea":"🇰🇷","Canada":"🇨🇦","United States":"🇺🇸","Nigeria":"🇳🇬","Algeria":"🇩🇿","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Wales":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","Republic of Ireland":"🇮🇪","Ukraine":"🇺🇦","Sweden":"🇸🇪","Greece":"🇬🇷","Ivory Coast":"🇨🇮","Ghana":"🇬🇭","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Qatar":"🇶🇦","Serbia":"🇷🇸","Czech Republic":"🇨🇿","Austria":"🇦🇹","Hungary":"🇭🇺","Romania":"🇷🇴","Slovakia":"🇸🇰","Albania":"🇦🇱","Georgia":"🇬🇪","Slovenia":"🇸🇮","Bolivia":"🇧🇴","Peru":"🇵🇪","Chile":"🇨🇱","Paraguay":"🇵🇾","Venezuela":"🇻🇪","Costa Rica":"🇨🇷","Panama":"🇵🇦","Honduras":"🇭🇳","El Salvador":"🇸🇻","Jamaica":"🇯🇲","Tunisia":"🇹🇳","Cameroon":"🇨🇲","Mali":"🇲🇱","South Africa":"🇿🇦","DR Congo":"🇨🇩","Iraq":"🇮🇶","Jordan":"🇯🇴","China PR":"🇨🇳","Indonesia":"🇮🇩","Vietnam":"🇻🇳","Thailand":"🇹🇭","India":"🇮🇳","New Zealand":"🇳🇿","Finland":"🇫🇮","Iceland":"🇮🇸","Israel":"🇮🇱","Kosovo":"🇽🇰","North Macedonia":"🇲🇰","Montenegro":"🇲🇪","Bosnia and Herzegovina":"🇧🇦","Uzbekistan":"🇺🇿","Kazakhstan":"🇰🇿","Russia":"🇷🇺","Cape Verde":"🇨🇻","Haiti":"🇭🇹","Curacao":"🇨🇼","Congo":"🇨🇬","Burkina Faso":"🇧🇫","Uganda":"🇺🇬","Zambia":"🇿🇲","Angola":"🇦🇴","Kenya":"🇰🇪","Senegal":"🇸🇳"};
const f = t => FLAGS[t] || "🏳️";
const ALL_TEAMS = [...new Set(Object.keys(ELO))].sort();
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

// ── Math ──────────────────────────────────────────────────────────────────────
function poissonPMF(k,l){if(l<=0)return k===0?1:0;let log=k*Math.log(l)-l;for(let i=2;i<=k;i++)log-=Math.log(i);return Math.exp(log);}

function calcMatch(home, away, neutral=false, tournament="Friendly"){
  const he=(ELO[home]||1500)+(neutral?0:HOME_ADV), ae=ELO[away]||1500, diff=he-ae;
  const expH = 1/(1+Math.pow(10,-diff/250));
  const lh_elo = AVG*(0.5+expH), la_elo = AVG*(1.5-expH);
  const atkH=Math.min(1.25,Math.max(0.75,ATTACK[home]||1));
  const atkA=Math.min(1.25,Math.max(0.75,ATTACK[away]||1));
  const defH=Math.min(1.25,Math.max(0.75,DEFENSE[home]||1));
  const defA=Math.min(1.25,Math.max(0.75,DEFENSE[away]||1));
  const lh=Math.min(3.5,Math.max(0.3,lh_elo*Math.sqrt(atkH/defA)));
  const la=Math.min(3.5,Math.max(0.3,la_elo*Math.sqrt(atkA/defH)));
  let hw=0,d=0,aw=0,maxP=0,lsH=1,lsA=0;
  for(let i=0;i<9;i++) for(let j=0;j<9;j++){
    const p=poissonPMF(i,lh)*poissonPMF(j,la);
    if(i>j)hw+=p; else if(i===j)d+=p; else aw+=p;
    if(p>maxP){maxP=p;lsH=i;lsA=j;}
  }
  const t=hw+d+aw;
  const OU_SCALE=0.80, lhOU=lh*OU_SCALE, laOU=la*OU_SCALE;
  const ou15=1-poissonPMF(0,lhOU)*poissonPMF(0,laOU)-poissonPMF(1,lhOU)*poissonPMF(0,laOU)-poissonPMF(0,lhOU)*poissonPMF(1,laOU);
  let ou25=0,ou35=0,btts=0;
  for(let i=0;i<9;i++) for(let j=0;j<9;j++){
    const p=poissonPMF(i,lhOU)*poissonPMF(j,laOU);
    if(i+j>2)ou25+=p; if(i+j>3)ou35+=p; if(i>0&&j>0)btts+=p;
  }
  return {hw:hw/t,d:d/t,aw:aw/t,lh,la,lsH,lsA,
    homeElo:ELO[home]||1500,awayElo:ELO[away]||1500,
    ou15,ou25,ou35,btts,totalGoals:lhOU+laOU,lhDisplay:lhOU,laDisplay:laOU};
}

function fuseOdds(m,oH,oD,oA){
  const pH=1/oH,pD=1/oD,pA=1/oA,vig=pH+pD+pA;
  const bH=pH/vig,bD=pD/vig,bA=pA/vig;
  const fH=0.4*m.hw+0.6*bH,fD=0.4*m.d+0.6*bD,fA=0.4*m.aw+0.6*bA;
  const t2=fH+fD+fA;
  return {...m,hw:fH/t2,d:fD/t2,aw:fA/t2,oddsApplied:true,bH,bD,bA,vig:((vig-1)*100).toFixed(1)};
}

function getEdge(modelP,oH,oD,oA,which){
  const h=parseFloat(oH),d=parseFloat(oD),a=parseFloat(oA);
  if(!h||!d||!a||h<=1.01||d<=1.01||a<=1.01)return null;
  const vig=(1/h)+(1/d)+(1/a);
  if(vig<0.85||vig>1.4)return null;
  const fair=which==="h"?(1/h)/vig:which==="d"?(1/d)/vig:(1/a)/vig;
  return (modelP-fair)*100;
}

// ── ProGate ───────────────────────────────────────────────────────────────────
function ProGate({onUpgrade, feature}) {
  return (
    <div style={{padding:"1rem",background:"linear-gradient(135deg,rgba(0,232,122,0.05),rgba(0,196,255,0.05))",border:"1px solid rgba(0,232,122,0.15)",borderRadius:"12px",textAlign:"center"}}>
      <div style={{fontSize:"1.1rem",marginBottom:"0.35rem"}}>🔒</div>
      <div style={{fontSize:"0.75rem",fontWeight:700,marginBottom:"0.25rem"}}>{feature}</div>
      <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.4)",marginBottom:"0.75rem"}}>Beschikbaar in NeurBet Pro</div>
      <button onClick={onUpgrade} style={{padding:"0.55rem 1.25rem",background:"linear-gradient(135deg,#00e87a,#00c4ff)",border:"none",borderRadius:"8px",color:"#000",fontWeight:700,fontSize:"0.75rem",cursor:"pointer"}}>
        ⚡ Upgrade naar Pro — €9.99/mnd
      </button>
    </div>
  );
}

// ── GroupSimulator ────────────────────────────────────────────────────────────
function GroupSimulator({isPro, onShowPro}) {
  const [selGroup, setSelGroup] = useState("A");
  const simulate = (teams) => {
    const s = {};
    teams.forEach(t => s[t]={pts:0,gf:0,ga:0,played:0});
    const matches = [];
    for(let i=0;i<teams.length;i++) for(let j=i+1;j<teams.length;j++){
      const h=teams[i],a=teams[j];
      const r=calcMatch(h,a,true,"FIFA World Cup");
      s[h].pts+=r.hw*3+r.d; s[a].pts+=r.aw*3+r.d;
      s[h].gf+=r.lh; s[h].ga+=r.la; s[h].played++;
      s[a].gf+=r.la; s[a].ga+=r.lh; s[a].played++;
      matches.push({h,a,hw:r.hw,d:r.d,aw:r.aw,expH:r.lh,expA:r.la});
    }
    const sorted=Object.entries(s).sort((x,y)=>{
      const diff=y[1].pts-x[1].pts;
      if(Math.abs(diff)>0.01) return diff;
      return (y[1].gf-y[1].ga)-(x[1].gf-x[1].ga);
    });
    return {standings:sorted,matches};
  };
  const teams = WC_GROUPS[selGroup];
  const {standings,matches} = simulate(teams);
  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>🔮 Groepsfase</div>
      <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"0.75rem"}}>Verwachte eindstand · AI model</div>
      <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>
        {Object.keys(WC_GROUPS).map(g=>(
          <button key={g} onClick={()=>setSelGroup(g)} style={{padding:"0.3rem 0.6rem",background:selGroup===g?"rgba(168,85,247,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${selGroup===g?"rgba(168,85,247,0.4)":"rgba(255,255,255,0.07)"}`,borderRadius:"7px",color:selGroup===g?"#a855f7":"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:"0.7rem",fontWeight:700}}>{g}</button>
        ))}
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"14px",overflow:"hidden",marginBottom:"0.75rem",border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{padding:"0.6rem 0.9rem",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:"0.6rem",fontWeight:700,color:"rgba(255,255,255,0.3)"}}>GROEP {selGroup}</span>
          <span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)"}}>Punten · Voor · Tegen · Saldo</span>
        </div>
        {standings.map(([team,s],i)=>{
          const gd=s.gf-s.ga, through=i<2;
          return (
            <div key={team} style={{display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.65rem 0.9rem",background:through?"rgba(34,197,94,0.04)":"transparent",borderLeft:`3px solid ${through?"rgba(34,197,94,0.4)":"transparent"}`,borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}>
              <span style={{fontSize:"0.7rem",color:through?"#22c55e":"rgba(255,255,255,0.25)",fontWeight:700,width:16}}>{i+1}</span>
              <span style={{fontSize:"1.1rem"}}>{f(team)}</span>
              <span style={{flex:1,fontSize:"0.78rem",fontWeight:through?700:400,color:through?"#fff":"rgba(255,255,255,0.55)"}}>{team}</span>
              <div style={{display:"flex",gap:"0.5rem",fontSize:"0.68rem",fontFamily:"monospace",color:"rgba(255,255,255,0.4)"}}>
                <span style={{color:through?"#22c55e":"rgba(255,255,255,0.6)",fontWeight:700}}>{s.pts.toFixed(1)}</span>
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
    </div>
  );
}

// ── DailyPicks ────────────────────────────────────────────────────────────────
function DailyPicks({isPro, onShowPro}) {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(()=>{
    if(!isPro){setLoading(false);return;}
    fetch(`${BACKEND_URL}/daily-picks`)
      .then(r=>r.json())
      .then(d=>{setPicks(d.picks||[]);setTotal(d.total_analyzed||0);})
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[isPro]);
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
        {loading?"Analyseren...":`${total} wedstrijden geanalyseerd · Top picks`}
      </div>
      {loading?(
        <div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.3)"}}>⏳ Analyseren...</div>
      ):picks.length===0?(
        <div style={{textAlign:"center",padding:"2rem",background:"rgba(255,255,255,0.03)",borderRadius:"14px",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>📭</div>
          <div style={{fontSize:"0.82rem",fontWeight:700,marginBottom:"0.3rem"}}>Geen picks vandaag</div>
          <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}>Geen wedstrijden met duidelijke value gevonden</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {picks.map((pick,i)=>(
            <div key={i} style={{padding:"1rem",background:pick.edge>=8?"linear-gradient(135deg,rgba(255,100,0,0.08),rgba(255,50,0,0.04))":pick.edge>=5?"linear-gradient(135deg,rgba(250,204,21,0.08),rgba(250,204,21,0.03))":"rgba(255,255,255,0.03)",border:`1px solid ${pick.edge>=8?"rgba(255,100,0,0.2)":pick.edge>=5?"rgba(250,204,21,0.2)":"rgba(255,255,255,0.07)"}`,borderRadius:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.6rem"}}>
                <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)"}}>{pick.sport}</span>
                <span style={{fontSize:"0.7rem",fontWeight:700,color:pick.edge>=8?"#ff6400":pick.edge>=5?"#fbbf24":"#22c55e"}}>{pick.confidence}</span>
              </div>
              <div style={{fontSize:"0.85rem",fontWeight:700,marginBottom:"0.5rem"}}>{pick.home} vs {pick.away}</div>
              <div style={{padding:"0.5rem 0.75rem",background:"rgba(0,232,122,0.08)",border:"1px solid rgba(0,232,122,0.15)",borderRadius:"10px",marginBottom:"0.5rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.4)"}}>AANBEVOLEN BET</div>
                  <div style={{fontSize:"0.82rem",fontWeight:700}}>{pick.betLabel}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"1.1rem",fontWeight:800,color:"#00e87a"}}>@ {pick.betOdds}</div>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)"}}>{pick.bookmaker}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"0.5rem",fontSize:"0.65rem"}}>
                {[{l:"Model kans",v:`${pick.betProb}%`},{l:"Edge",v:`+${pick.edge}%`,c:"#00e87a"},{l:"Bankroll",v:pick.edge>=8?"3-4%":pick.edge>=5?"2-3%":"1-2%"}].map(s=>(
                  <div key={s.l} style={{flex:1,textAlign:"center",padding:"0.3rem",background:`rgba(255,255,255,${s.c?"0.06":"0.04"})`,borderRadius:"7px"}}>
                    <div style={{fontWeight:700,color:s.c||"#fff"}}>{s.v}</div>
                    <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.3)",marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{padding:"0.5rem",fontSize:"0.62rem",color:"rgba(255,255,255,0.25)",textAlign:"center"}}>
            ⚠️ Picks zijn indicatief — geen garantie. Gok verantwoord.
          </div>
        </div>
      )}
    </div>
  );
}

// ── TrackRecord ───────────────────────────────────────────────────────────────
function TrackRecord({user, isPro, onShowPro}) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    if(!user){setLoading(false);return;}
    supabase.from('predictions').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50)
      .then(({data})=>setPredictions(data||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[user]);
  const completed=predictions.filter(p=>p.correct!==null);
  const correct=completed.filter(p=>p.correct).length;
  const accuracy=completed.length>0?(correct/completed.length*100).toFixed(0):null;
  if(!user) return (
    <div style={{textAlign:"center",padding:"2rem 1rem"}}>
      <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>📈</div>
      <div style={{fontWeight:700,marginBottom:"0.5rem"}}>Track Record</div>
      <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.4)",marginBottom:"1.5rem"}}>Log in om voorspellingen bij te houden</div>
    </div>
  );
  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>📈 Track Record</div>
      <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"1rem"}}>Jouw voorspellingen · WK 2026</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"1rem"}}>
        {[{l:"Voorspellingen",v:predictions.length},{l:"Correct",v:completed.length>0?correct:"—"},{l:"Accuraatheid",v:accuracy?`${accuracy}%`:"—"}].map(s=>(
          <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"0.7rem 0.5rem",textAlign:"center"}}>
            <div style={{fontSize:"1.2rem",fontWeight:800,color:"#22c55e"}}>{s.v}</div>
            <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.3)",marginTop:"0.2rem"}}>{s.l}</div>
          </div>
        ))}
      </div>
      {loading?(<div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.3)"}}>Laden...</div>)
      :predictions.length===0?(<div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.3)"}}>⚽ Doe je eerste voorspelling!</div>)
      :(
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function NeurBetPredictor() {
  const {user, isPro} = useAuth();
  const [tab, setTab] = useState("predict");
  const [home, setHome] = useState("Netherlands");
  const [away, setAway] = useState("Japan");
  const [tournament, setTournament] = useState("FIFA World Cup");
  const [neutral, setNeutral] = useState(true);
  const [result, setResult] = useState(null);
  const [oddsResult, setOddsResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveOddsSource, setLiveOddsSource] = useState("");
  const [oH, setOH] = useState(""); const [oD, setOD] = useState(""); const [oA, setOA] = useState("");
  const [ouOdds, setOuOdds] = useState({ou15:"",ou25:"",ou35:"",btts:""});
  const [showOdds, setShowOdds] = useState(false);
  const [showIntel, setShowIntel] = useState(false);
  const [intel, setIntel] = useState("");
  const [intelLoading, setIntelLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [savedId, setSavedId] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [picking, setPicking] = useState(null); // "home" | "away"
  const [pickSearch, setPickSearch] = useState("");

  const filteredTeams = useMemo(()=>
    ALL_TEAMS.filter(t=>t!==(picking==="home"?away:home)&&t.toLowerCase().includes(pickSearch.toLowerCase())).slice(0,80),
    [pickSearch, picking, home, away]
  );

  const active = oddsResult || result;
  const maxProb = active ? Math.max(active.hw, active.d, active.aw) : 0;
  const winner = active ? (active.hw===maxProb?home:active.aw===maxProb?away:"Gelijkspel") : null;
  const edgeH = active && showOdds ? getEdge(active.hw, oH, oD, oA, "h") : null;
  const edgeD = active && showOdds ? getEdge(active.d, oH, oD, oA, "d") : null;
  const edgeA = active && showOdds ? getEdge(active.aw, oH, oD, oA, "a") : null;

  const runPredict = async () => {
    setLoading(true); setResult(null); setOddsResult(null);
    setOH(""); setOD(""); setOA(""); setOuOdds({ou15:"",ou25:"",ou35:"",btts:""});
    setShowOdds(false); setShowIntel(false); setIntel(""); setSavedId(null);
    try {
      const res = await fetch(`${BACKEND_URL}/predict?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}&neutral=${neutral}&tournament=${encodeURIComponent(tournament)}`);
      if(res.ok) {
        const data = await res.json();
        const r = {
          hw:data.homeWin, d:data.draw, aw:data.awayWin,
          lh:data.lambdaHome, la:data.lambdaAway,
          lsH:data.likelyHome??Math.round(data.lambdaHome),
          lsA:data.likelyAway??Math.round(data.lambdaAway),
          homeElo:data.homeElo, awayElo:data.awayElo,
          ou15:data.ou15, ou25:data.ou25, ou35:data.ou35, btts:data.btts,
          totalGoals:data.totalGoals,
        };
        setResult(r);
        setHistory(prev=>[{home,away,tournament,neutral,result:r,id:Date.now()},...prev.slice(0,9)]);
        if(data.liveOdds?.homeOdds) {
          const lo = data.liveOdds;
          setOH(lo.homeOdds.toFixed(2));
          setOD(lo.drawOdds?lo.drawOdds.toFixed(2):"");
          setOA(lo.awayOdds.toFixed(2));
          setOuOdds({
            ou15:lo.ou15Odds?lo.ou15Odds.toFixed(2):"",
            ou25:lo.ou25Odds?lo.ou25Odds.toFixed(2):"",
            ou35:lo.ou35Odds?lo.ou35Odds.toFixed(2):"",
            btts:lo.bttsOdds?lo.bttsOdds.toFixed(2):"",
          });
          setShowOdds(true);
          setLiveOddsSource(lo.bookmaker||"Bookmaker");
        }
      } else {
        const r = calcMatch(home,away,neutral,tournament);
        setResult(r);
        setHistory(prev=>[{home,away,tournament,neutral,result:r,id:Date.now()},...prev.slice(0,9)]);
      }
    } catch {
      const r = calcMatch(home,away,neutral,tournament);
      setResult(r);
      setHistory(prev=>[{home,away,tournament,neutral,result:r,id:Date.now()},...prev.slice(0,9)]);
    }
    setLoading(false);
  };

  const runOdds = () => {
    const h=parseFloat(oH),d=parseFloat(oD),a=parseFloat(oA);
    if(!h||!d||!a||h<=1||d<=1||a<=1)return;
    if(result) setOddsResult(fuseOdds(result,h,d,a));
  };

  const runIntel = async () => {
    setIntelLoading(true); setShowIntel(true);
    try {
      const res = await fetch(`${BACKEND_URL}/intel?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}&tournament=${encodeURIComponent(tournament)}`);
      if(res.ok){const d=await res.json();setIntel(d.analysis||"Geen analyse beschikbaar.");}
      else setIntel("Analyse tijdelijk niet beschikbaar.");
    } catch {setIntel("Analyse tijdelijk niet beschikbaar.");}
    setIntelLoading(false);
  };

  const savePrediction = async (r) => {
    if(!user||!r)return;
    try {
      const {data,error}=await supabase.from('predictions').insert({
        user_id:user.id,home,away,tournament,
        predicted_home_win:r.hw,predicted_draw:r.d,predicted_away_win:r.aw,
        predicted_score_home:r.lsH,predicted_score_away:r.lsA,
        match_date:new Date().toISOString().split('T')[0],
      }).select();
      if(!error&&data)setSavedId(data[0]?.id);
    } catch(e){console.log('Save fout:',e);}
  };

  const C = {green:"#00e87a",border:"rgba(255,255,255,0.08)"};

  return (
    <div style={{minHeight:"100vh",background:"#080811",color:"#fff",fontFamily:"'DM Sans','Segoe UI',sans-serif",paddingBottom:"2rem"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        html,body{max-width:100vw;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
        button,input,select{font-family:inherit;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
      `}</style>

      {/* ── TEAM PICKER OVERLAY ── */}
      {picking && (
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(8,8,17,0.97)",backdropFilter:"blur(16px)",display:"flex",flexDirection:"column",padding:"0"}}>
          {/* Header */}
          <div style={{padding:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <div>
              <div style={{fontFamily:"'Syne'",fontSize:"1rem",fontWeight:800}}>{picking==="home"?"🏠 Thuisploeg":"✈️ Uitploeg"} kiezen</div>
              <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.3)",marginTop:"0.15rem"}}>WK 2026 · {ALL_TEAMS.length} landen beschikbaar</div>
            </div>
            <button onClick={()=>{setPicking(null);setPickSearch("");}} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"0.5rem 0.75rem",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:"0.8rem"}}>✕ Sluiten</button>
          </div>
          {/* Search */}
          <div style={{padding:"0.75rem 1rem"}}>
            <input autoFocus placeholder="🔍 Zoek land..." value={pickSearch} onChange={e=>setPickSearch(e.target.value)}
              style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"#fff",fontSize:"0.9rem",outline:"none"}}/>
          </div>
          {/* Team grid */}
          <div style={{flex:1,overflowY:"auto",padding:"0 1rem 1rem"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem"}}>
              {filteredTeams.map(t=>{
                const selected=picking==="home"?home===t:away===t;
                return (
                  <button key={t} onClick={()=>{if(picking==="home")setHome(t);else setAway(t);setPicking(null);setPickSearch("");setResult(null);setOddsResult(null);setSavedId(null);}}
                    style={{background:selected?"linear-gradient(135deg,rgba(0,232,122,0.15),rgba(0,180,100,0.08))":"rgba(255,255,255,0.03)",border:`1.5px solid ${selected?"rgba(0,232,122,0.4)":"rgba(255,255,255,0.07)"}`,borderRadius:14,padding:"0.85rem 0.4rem",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",transition:"all 0.15s"}}>
                    <span style={{fontSize:"1.8rem",lineHeight:1}}>{f(t)}</span>
                    <span style={{fontSize:"0.62rem",fontWeight:selected?700:500,color:selected?"#00e87a":"rgba(255,255,255,0.65)",textAlign:"center",lineHeight:1.2}}>{t}</span>
                    <span style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.2)"}}>ELO {ELO[t]||"?"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── AUTH MODAL ── */}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} />}
      {showPro && <ProModal onClose={()=>setShowPro(false)} />}

      {/* ── HEADER ── */}
      <div style={{padding:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#00e87a",boxShadow:"0 0 10px #00e87a"}}/>
          <span style={{fontFamily:"'Syne'",fontSize:"1.05rem",fontWeight:800,letterSpacing:"-0.02em"}}>
            NEUR<span style={{color:"#00e87a"}}>BET</span>
          </span>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          {/* User menu */}
          {!user?(
            <button onClick={()=>setShowAuth(true)} style={{padding:"0.35rem 0.75rem",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:"0.72rem",fontWeight:600,cursor:"pointer"}}>
              Inloggen
            </button>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:"0.35rem"}}>
              {isPro&&<span style={{padding:"0.25rem 0.5rem",background:"rgba(0,232,122,0.12)",border:"1px solid rgba(0,232,122,0.25)",borderRadius:6,fontSize:"0.62rem",fontWeight:700,color:"#00e87a"}}>⚡ PRO</span>}
              {!isPro&&<button onClick={()=>setShowPro(true)} style={{padding:"0.25rem 0.5rem",background:"rgba(0,232,122,0.08)",border:"1px solid rgba(0,232,122,0.15)",borderRadius:6,fontSize:"0.62rem",fontWeight:700,color:"#00e87a",cursor:"pointer"}}>⚡ Upgrade</button>}
              <button onClick={()=>supabase.auth.signOut()} style={{padding:"0.25rem 0.5rem",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:6,fontSize:"0.62rem",fontWeight:600,color:"#f87171",cursor:"pointer"}}>Uit</button>
            </div>
          )}

          {/* Tabs */}
          <div style={{display:"flex",gap:"2px",background:"rgba(255,255,255,0.04)",borderRadius:9,padding:2}}>
            {[["predict","⚽"],["sim","🔮"],["picks","🎯"],["rankings","📊"],["track","📈"]].map(([t,ic])=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"0.35rem 0.55rem",background:tab===t?"rgba(255,255,255,0.1)":"transparent",border:"none",borderRadius:7,color:tab===t?"#fff":"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"0.72rem",transition:"all 0.15s"}}>{ic}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:"1rem",maxWidth:480,margin:"0 auto"}}>

        {/* ── PREDICT TAB ── */}
        {tab==="predict"&&<>
          {/* Team pickers */}
          <div style={{display:"flex",gap:"0.5rem",alignItems:"stretch",marginBottom:"0.75rem"}}>
            <button onClick={()=>setPicking("home")} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"0.85rem 0.5rem",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",transition:"all 0.15s"}}>
              <span style={{fontSize:"2rem",lineHeight:1}}>{f(home)}</span>
              <span style={{fontSize:"0.72rem",fontWeight:700,color:"#fff",textAlign:"center"}}>{home}</span>
              <span style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.25)"}}>ELO {ELO[home]||"?"}</span>
              <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.3)",marginTop:"0.1rem"}}>✏️ Wijzigen</span>
            </button>

            <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",fontWeight:700}}>VS</div>
            </div>

            <button onClick={()=>setPicking("away")} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"0.85rem 0.5rem",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",transition:"all 0.15s"}}>
              <span style={{fontSize:"2rem",lineHeight:1}}>{f(away)}</span>
              <span style={{fontSize:"0.72rem",fontWeight:700,color:"#fff",textAlign:"center"}}>{away}</span>
              <span style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.25)"}}>ELO {ELO[away]||"?"}</span>
              <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.3)",marginTop:"0.1rem"}}>✏️ Wijzigen</span>
            </button>
          </div>

          {/* Tournament + neutral */}
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.75rem"}}>
            <select value={tournament} onChange={e=>setTournament(e.target.value)} style={{flex:1,padding:"0.5rem 0.75rem",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"rgba(255,255,255,0.7)",fontSize:"0.72rem",outline:"none"}}>
              {TOURNAMENTS.map(t=><option key={t} value={t} style={{background:"#111"}}>{t}</option>)}
            </select>
            <button onClick={()=>setNeutral(!neutral)} style={{padding:"0.5rem 0.75rem",background:neutral?"rgba(59,130,246,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${neutral?"rgba(59,130,246,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:10,color:neutral?"#60a5fa":"rgba(255,255,255,0.4)",fontSize:"0.72rem",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
              {neutral?"⚖️ Neutraal":"🏠 Thuis voordeel"}
            </button>
          </div>

          {/* Predict button */}
          <button onClick={runPredict} disabled={loading} style={{width:"100%",padding:"0.9rem",background:loading?"rgba(0,232,122,0.3)":"linear-gradient(135deg,#00e87a,#00c4ff)",border:"none",borderRadius:14,color:"#000",fontWeight:800,fontSize:"0.92rem",cursor:"pointer",marginBottom:"1rem",transition:"all 0.2s",transform:loading?"scale(0.99)":"scale(1)"}}>
            {loading?"⏳ Berekenen...":"⚽ Bereken Voorspelling"}
          </button>

          {/* Result card */}
          {active&&(
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,overflow:"hidden",marginBottom:"1rem"}}>

              {/* Score */}
              <div style={{padding:"1.25rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                  <span style={{fontSize:"1.8rem"}}>{f(home)}</span>
                  <span style={{fontSize:"0.65rem",fontWeight:700,marginTop:"0.25rem",color:"rgba(255,255,255,0.7)",textAlign:"center"}}>{shortName(home)}</span>
                  <span style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.25)",marginTop:"0.1rem"}}>ELO {active.homeElo}</span>
                </div>
                <div style={{textAlign:"center",padding:"0 0.5rem"}}>
                  <div style={{fontSize:"2.5rem",fontWeight:800,letterSpacing:"0.05em",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
                    {active.lsH}<span style={{color:"rgba(255,255,255,0.2)",margin:"0 4px",fontSize:"1.5rem"}}>:</span>{active.lsA}
                  </div>
                  <div style={{fontSize:"0.48rem",color:"rgba(255,255,255,0.2)",letterSpacing:"0.08em",marginTop:4}}>VERWACHTE UITSLAG</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                  <span style={{fontSize:"1.8rem"}}>{f(away)}</span>
                  <span style={{fontSize:"0.65rem",fontWeight:700,marginTop:"0.25rem",color:"rgba(255,255,255,0.7)",textAlign:"center"}}>{shortName(away)}</span>
                  <span style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.25)",marginTop:"0.1rem"}}>ELO {active.awayElo}</span>
                </div>
              </div>

              {/* Probability bar */}
              <div style={{padding:"0 1rem 0.75rem"}}>
                <div style={{display:"flex",borderRadius:8,overflow:"hidden",height:28,gap:2}}>
                  {[{p:active.hw,c:"#22c55e"},{p:active.d,c:"#eab308"},{p:active.aw,c:"#ef4444"}].map(({p,c},i)=>(
                    <div key={i} style={{flex:p,background:`${c}${p===maxProb?"cc":"33"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"flex 0.5s ease"}}>
                      {p===maxProb&&<span style={{fontSize:"0.65rem",fontWeight:800,color:"#000"}}>{(p*100).toFixed(0)}%</span>}
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.3rem",fontSize:"0.55rem",color:"rgba(255,255,255,0.3)"}}>
                  <span>{shortName(home)}</span><span>Gelijkspel</span><span>{shortName(away)}</span>
                </div>
              </div>

              {/* Winner + confidence */}
              <div style={{padding:"0 1rem 0.75rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.35rem"}}>
                {liveOddsSource&&(
                  <div style={{fontSize:"0.58rem",color:"rgba(0,232,122,0.7)",marginBottom:"0.1rem"}}>⚡ Live odds: {liveOddsSource}</div>
                )}
                <span style={{display:"inline-flex",alignItems:"center",gap:"0.35rem",padding:"0.25rem 0.75rem",background:winner===home?"rgba(34,197,94,0.1)":winner===away?"rgba(239,68,68,0.08)":"rgba(234,179,8,0.08)",border:`1px solid ${winner===home?"rgba(34,197,94,0.2)":winner===away?"rgba(239,68,68,0.15)":"rgba(234,179,8,0.15)"}`,borderRadius:20,fontSize:"0.68rem",fontWeight:700,color:winner===home?"#4ade80":winner===away?"#f87171":"#fbbf24"}}>
                  {winner==="Gelijkspel"?`🤝 Gelijkspel — ${(active.d*100).toFixed(0)}%`:`${f(winner)} ${winner} wint — ${(maxProb*100).toFixed(0)}%`}
                </span>
                {(()=>{
                  const pct=maxProb*100;
                  if(pct>=65) return <span style={{padding:"0.15rem 0.6rem",background:"rgba(255,100,0,0.1)",border:"1px solid rgba(255,100,0,0.2)",borderRadius:20,fontSize:"0.6rem",fontWeight:700,color:"#ff6400"}}>🔥 STERKE FAVORIET</span>;
                  if(pct>=55) return <span style={{padding:"0.15rem 0.6rem",background:"rgba(250,204,21,0.08)",border:"1px solid rgba(250,204,21,0.15)",borderRadius:20,fontSize:"0.6rem",fontWeight:700,color:"#fbbf24"}}>⚡ LICHTE FAVORIET</span>;
                  return <span style={{padding:"0.15rem 0.6rem",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,fontSize:"0.6rem",fontWeight:700,color:"rgba(255,255,255,0.3)"}}>⚖️ EVENWICHTIG</span>;
                })()}
              </div>

              {/* Stats row */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:1,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                {[{l:"λ Thuis",v:active.lh?.toFixed(2)},{l:"λ Uit",v:active.la?.toFixed(2)},{l:"Totaal",v:active.totalGoals?.toFixed(2)},{l:"BTTS",v:active.btts?`${(active.btts*100).toFixed(0)}%`:"—"}].map(s=>(
                  <div key={s.l} style={{padding:"0.6rem 0.4rem",textAlign:"center",background:"rgba(255,255,255,0.02)"}}>
                    <div style={{fontSize:"0.9rem",fontWeight:700}}>{s.v}</div>
                    <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.3)",marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* O/U markten */}
              <div style={{padding:"0.75rem 1rem 0"}}>
                <div style={{fontSize:"0.55rem",fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",marginBottom:"0.4rem"}}>OVER/UNDER MARKTEN</div>
                {isPro?(
                  <>
                    {[{l:"Over 1.5 goals",p:active.ou15},{l:"Over 2.5 goals",p:active.ou25},{l:"Over 3.5 goals",p:active.ou35},{l:"Beide teams scoren",p:active.btts}].map(item=>(
                      <div key={item.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.6)"}}>{item.l}</span>
                        <span style={{fontSize:"0.72rem",fontWeight:700,color:item.p>=0.6?"#22c55e":"rgba(255,255,255,0.7)"}}>
                          {item.p?(item.p*100).toFixed(0)+"%":"—"}
                          {item.p&&item.p<0.35?" laag conf.":""}
                        </span>
                      </div>
                    ))}
                    {/* O/U odds inputs */}
                    {isPro&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0.35rem",marginTop:"0.5rem",marginBottom:"0.5rem"}}>
                      {[["ou15","O1.5"],["ou25","O2.5"],["ou35","O3.5"],["btts","BTTS"]].map(([k,l])=>(
                        <div key={k}>
                          <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.2)",marginBottom:"0.2rem",textAlign:"center"}}>{l}</div>
                          <input type="number" step="0.01" min="1.01" placeholder="odds" value={ouOdds[k]} onChange={e=>setOuOdds(p=>({...p,[k]:e.target.value}))} style={{width:"100%",padding:"0.4rem 0.3rem",textAlign:"center",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",color:"#fff",fontSize:"0.78rem",fontFamily:"monospace",outline:"none"}}/>
                        </div>
                      ))}
                    </div>}
                  </>
                ):(
                  <ProGate onUpgrade={()=>setShowPro(true)} feature="O/U markten + BTTS kansen" />
                )}
              </div>

              {/* Bookmaker odds */}
              <div style={{padding:"0 1rem 0.75rem"}}>
                {isPro?(
                  <>
                    {!showOdds?(
                      <button onClick={()=>setShowOdds(true)} style={{width:"100%",padding:"0.65rem",background:"rgba(168,85,247,0.07)",border:"1px solid rgba(168,85,247,0.18)",borderRadius:"10px",color:"#a855f7",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",marginTop:"0.5rem"}}>
                        📈 Voeg 1X2 odds toe → ontdek value bets
                      </button>
                    ):(
                      <div style={{marginTop:"0.5rem"}}>
                        <div style={{fontSize:"0.55rem",fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",marginBottom:"0.4rem"}}>
                          📊 BOOKMAKER ODDS (decimaal)
                          {liveOddsSource&&<span style={{color:"rgba(0,232,122,0.6)",marginLeft:"0.5rem"}}>⚡ {liveOddsSource}</span>}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.35rem",marginBottom:"0.5rem"}}>
                          {[{label:shortName(home),val:oH,set:setOH},{label:"Gelijk",val:oD,set:setOD},{label:shortName(away),val:oA,set:setOA}].map(({label,val,set})=>(
                            <div key={label}>
                              <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.2)",marginBottom:"0.2rem",textAlign:"center"}}>{label}</div>
                              <input type="number" step="0.01" min="1.01" placeholder="odds" value={val} onChange={e=>{set(e.target.value);setOddsResult(null);}} style={{width:"100%",padding:"0.4rem 0.3rem",textAlign:"center",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",color:"#fff",fontSize:"0.78rem",fontFamily:"monospace",outline:"none"}}/>
                            </div>
                          ))}
                        </div>
                        <button onClick={runOdds} disabled={!oH||!oD||!oA} style={{width:"100%",padding:"0.6rem",background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.25)",borderRadius:"10px",color:"#a855f7",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",marginBottom:"0.5rem"}}>
                          🔍 Bereken value & fusie
                        </button>
                        {/* Edge indicators */}
                        {active.oddsApplied&&(
                          <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",marginBottom:"0.5rem"}}>
                            {[{l:`${shortName(home)} wint`,e:edgeH,o:oH},{l:"Gelijkspel",e:edgeD,o:oD},{l:`${shortName(away)} wint`,e:edgeA,o:oA}].map(({l,e,o})=>e!==null&&(
                              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0.6rem",background:e>3?"rgba(0,232,122,0.06)":e<-3?"rgba(239,68,68,0.04)":"rgba(255,255,255,0.03)",borderRadius:8,border:`1px solid ${e>3?"rgba(0,232,122,0.15)":e<-3?"rgba(239,68,68,0.1)":"rgba(255,255,255,0.06)"}`}}>
                                <span style={{fontSize:"0.72rem"}}>{l} <span style={{color:"rgba(255,255,255,0.3)",fontSize:"0.65rem"}}>@ {parseFloat(o).toFixed(2)}</span></span>
                                <span style={{fontSize:"0.72rem",fontWeight:700,color:e>3?"#22c55e":e<-3?"#f87171":"rgba(255,255,255,0.4)"}}>{e>0?"+":""}{e.toFixed(1)}%</span>
                              </div>
                            ))}
                            {/* Best bet */}
                            {(()=>{
                              const edges=[{e:edgeH,l:`${shortName(home)} wint`,o:parseFloat(oH)},{e:edgeD,l:"Gelijkspel",o:parseFloat(oD)},{e:edgeA,l:`${shortName(away)} wint`,o:parseFloat(oA)}].filter(x=>x.e!==null);
                              const best=edges.reduce((b,x)=>x.e>b.e?x:b,{e:-999});
                              if(best.e<3) return <div style={{padding:"0.35rem 0.6rem",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:"0.65rem",color:"rgba(255,255,255,0.3)",textAlign:"center"}}>✓ Geen duidelijke value gevonden</div>;
                              return (
                                <div style={{padding:"0.6rem 0.75rem",background:"rgba(0,232,122,0.06)",border:"1px solid rgba(0,232,122,0.15)",borderRadius:10}}>
                                  <div style={{fontSize:"0.62rem",fontWeight:700,color:"#00e87a",marginBottom:"0.3rem"}}>🎯 BESTE BET</div>
                                  <div style={{fontSize:"0.78rem",fontWeight:700}}>{best.l} @ {best.o.toFixed(2)}</div>
                                  <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.5)",marginTop:"0.2rem"}}>Edge: +{best.e.toFixed(1)}% · {best.e>=8?"🔥 Sterke value":best.e>=5?"⚡ Goede value":"📈 Kleine value"}</div>
                                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"0.25rem"}}>💡 Bankroll: max {best.e>=8?"3-4%":best.e>=5?"2-3%":"1-2%"}</div>
                                </div>
                              );
                            })()}
                            <div style={{padding:"0.3rem",fontSize:"0.58rem",color:"rgba(250,204,21,0.5)",textAlign:"center"}}>⚠️ Indicatief — geen garantie. Model: ~62%.</div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ):(
                  <ProGate onUpgrade={()=>setShowPro(true)} feature="Value bet detectie + automatische odds" />
                )}
              </div>

              {/* AI analyse */}
              <div style={{padding:"0 1rem 0.75rem"}}>
                {isPro?(
                  !showIntel?(
                    <button onClick={runIntel} style={{width:"100%",padding:"0.65rem",background:"rgba(34,211,238,0.05)",border:"1px solid rgba(34,211,238,0.12)",borderRadius:"10px",color:"#22d3ee",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
                      🧠 AI wedstrijd analyse
                    </button>
                  ):(
                    <div style={{padding:"0.75rem",background:"rgba(34,211,238,0.04)",border:"1px solid rgba(34,211,238,0.1)",borderRadius:"10px",fontSize:"0.72rem",lineHeight:1.6,color:"rgba(255,255,255,0.7)"}}>
                      {intelLoading?"🧠 Analyseren...":<span style={{whiteSpace:"pre-line"}}>{intel}</span>}
                    </div>
                  )
                ):(
                  <ProGate onUpgrade={()=>setShowPro(true)} feature="AI wedstrijd analyse" />
                )}
              </div>

              {/* Save button */}
              {user&&(
                <div style={{padding:"0 1rem 0.75rem"}}>
                  <button onClick={()=>savePrediction(active)} style={{width:"100%",padding:"0.6rem",background:savedId?"rgba(34,197,94,0.15)":"rgba(34,197,94,0.08)",border:`1px solid ${savedId?"rgba(34,197,94,0.4)":"rgba(34,197,94,0.2)"}`,borderRadius:"10px",color:"#22c55e",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
                    {savedId?"✅ Opgeslagen in track record":"💾 Sla op in track record"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recente analyses */}
          {history.length>0&&(
            <div style={{marginTop:"0.75rem"}}>
              <div style={{fontSize:"0.55rem",fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",marginBottom:"0.4rem"}}>RECENTE ANALYSES</div>
              {history.slice(0,5).map(h=>(
                <div key={h.id} onClick={()=>{setHome(h.home);setAway(h.away);setTournament(h.tournament);setNeutral(h.neutral);setResult(h.result);setOddsResult(null);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.5rem 0.75rem",background:"rgba(255,255,255,0.02)",borderRadius:10,marginBottom:"0.3rem",cursor:"pointer",border:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)"}}>{f(h.home)} {h.home} vs {h.away} {f(h.away)}</span>
                  <span style={{fontSize:"0.68rem",fontWeight:700,color:"#00e87a"}}>{shortName(winner||h.home)} {(Math.max(h.result.hw,h.result.d,h.result.aw)*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </>}

        {/* ── ELO RANKINGS TAB ── */}
        {tab==="rankings"&&(
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.15rem",fontWeight:800,marginBottom:"0.2rem"}}>📊 ELO Rankings</div>
            <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.2)",marginBottom:"1rem"}}>Gebaseerd op historische resultaten · {ALL_TEAMS.length} landen</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>
              {Object.entries(ELO).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([team,elo],i)=>(
                <div key={team} style={{display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.55rem 0.75rem",background:"rgba(255,255,255,0.02)",borderRadius:10,border:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.3)",width:20,textAlign:"right",fontFamily:"monospace"}}>{i+1}</span>
                  <span style={{fontSize:"1.1rem"}}>{f(team)}</span>
                  <span style={{flex:1,fontSize:"0.78rem",fontWeight:500}}>{team}</span>
                  <div style={{width:80,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",background:"linear-gradient(90deg,#00e87a,#00c4ff)",borderRadius:2,width:`${((elo-1400)/(2200-1400)*100).toFixed(0)}%`}}/>
                  </div>
                  <span style={{fontSize:"0.7rem",fontWeight:700,color:"rgba(255,255,255,0.5)",fontFamily:"monospace",width:40,textAlign:"right"}}>{elo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SIM TAB ── */}
        {tab==="sim"&&<GroupSimulator isPro={isPro} onShowPro={()=>setShowPro(true)} />}

        {/* ── PICKS TAB ── */}
        {tab==="picks"&&<DailyPicks isPro={isPro} onShowPro={()=>setShowPro(true)} />}

        {/* ── TRACK TAB ── */}
        {tab==="track"&&<TrackRecord user={user} isPro={isPro} onShowPro={()=>setShowPro(true)} />}
      </div>
    </div>
  );
}
