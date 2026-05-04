// TEKSI v5.0 Enhancement Injector
// Add this script tag at the end of your TEKSI v4.3 HTML, before </body>
// <script src="teksi_v5_enhance.js"></script>

(function() {


const ALARM_MAP={"198093024":{comp:"bbu",fault:"bb03",name:"GPS Clock Lost Critical",sev:"CRITICAL"},"198093023":{comp:"clock",fault:"cl01",name:"GPS Clock Lost Major",sev:"MAJOR"},"198093814":{comp:"bbu",fault:"bb04",name:"Clock PLL Unlocked ALL Down",sev:"CRITICAL"},"198093055":{comp:"bbu",fault:"bb06",name:"DSP Hardware Failure",sev:"CRITICAL"},"198094029":{comp:"bbu",fault:"bb13",name:"Baseband Service Abnormal",sev:"CRITICAL"},"198092290":{comp:"rru",fault:"rr04",name:"CPRI Uplink Optical Interrupted",sev:"CRITICAL"},"198092431":{comp:"rru",fault:"rr06",name:"Optical RX Signal Abnormal",sev:"MAJOR"},"198092289":{comp:"rru",fault:"rr15",name:"SFP Not in Position",sev:"CRITICAL"},"198092249":{comp:"rru",fault:"rr09",name:"RF Board PLL Alarm",sev:"CRITICAL"},"198092278":{comp:"rru",fault:"rr11",name:"Abnormal TX Power",sev:"MAJOR"},"198092364":{comp:"rru",fault:"rr12",name:"DPD Calibration Failure",sev:"MAJOR"},"198092433":{comp:"rru",fault:"rr13",name:"RRU Network Interrupted",sev:"CRITICAL"},"198092558":{comp:"rru",fault:"rr10",name:"RRU High Temperature",sev:"MAJOR"},"198092240":{comp:"bbu",fault:"bb15",name:"1588 PTP Clock Fault",sev:"MAJOR"},"198093864":{comp:"bbu",fault:"bb12",name:"RTWP High Interference",sev:"MAJOR"},"198090001":{comp:"bbu",fault:"bb09",name:"BBU Warm Restart",sev:"MAJOR"},"198090002":{comp:"bbu",fault:"bb08",name:"BBU Cold Restart",sev:"CRITICAL"},"NR-IF-001":{comp:"idu",fault:"i01",name:"Radio Link Failure IF Unlocked",sev:"CRITICAL"},"NR-RSL-001":{comp:"idu",fault:"i01",name:"RSL Low Atmospheric Fading",sev:"MAJOR"},"NR-CC-001":{comp:"idu",fault:"i03",name:"CC Board Failure IDU",sev:"CRITICAL"},"NR-OPT-001":{comp:"sfp",fault:"sf02",name:"Fiber Signal Loss",sev:"CRITICAL"},"NR-CLK-001":{comp:"idu",fault:"i06",name:"Clock Module Fault IDU",sev:"CRITICAL"},"NR-ODU-001":{comp:"idu",fault:"i11",name:"ODU Mute Active",sev:"CRITICAL"},"NR-PTP-001":{comp:"idu",fault:"i09",name:"1588 PTP Failure IDU",sev:"MAJOR"},"G-EF01":{comp:"genset",fault:"g09",name:"DG Fault Deep Sea",sev:"CRITICAL"},"G-EF02":{comp:"genset",fault:"g13",name:"SNE Low Voltage",sev:"CRITICAL"},"B-EF01":{comp:"battery",fault:"b01",name:"Low Battery Deep Discharge",sev:"CRITICAL"},"RZ-EF02":{comp:"rect_zte",fault:"rz04",name:"DC Undervoltage ZTE",sev:"CRITICAL"},"SF-EF01":{comp:"sfp",fault:"sf02",name:"Fiber Cut",sev:"CRITICAL"}};

const LMT_PATHS=[{action:"BBU Warm Restart",equip:"B8200",path:"Maintenance > NE Management > Warm Restart",params:"Confirm dialog",result:"Services restore 3-5 min",mttr:"3-5 min",note:"Schedule 02:00-04:00. Notify NOC."},{action:"BBU Cold Restart",equip:"B8200",path:"Power cycle chassis (hardware)",params:"N/A",result:"Full reboot 8-12 min",mttr:"8-12 min",note:"Last resort. Prefer warm restart."},{action:"Single Board Reset",equip:"B8200",path:"Maintenance > Board Management > Reset > Slot [N]",params:"Slot 1-12",result:"Only selected slot ~2-3 min",mttr:"2-3 min",note:"Less impact than full BBU restart."},{action:"Check GPS Status",equip:"B8200",path:"Maintenance > Clock Management > GPS Source",params:"None",result:"OK: >= 4 satellites >-130 dBm",mttr:"<5 min",note:"0 satellites = check cable first."},{action:"Force Clock Source",equip:"B8200",path:"Maintenance > Clock Management > Clock Source > Force",params:"GPS / PTP / BITS",result:"Clock locked on selected source",mttr:"<5 min",note:"Use when auto-selection fails."},{action:"RRU Reset",equip:"B8200",path:"Maintenance > RRU Management > RRU Reset > RRU ID",params:"RRU ID",result:"Cells down ~1-2 min",mttr:"1-2 min",note:"Collect log before reset."},{action:"Check CPRI Optical Power",equip:"B8200",path:"Maintenance > RRU Management > Optical Module > Power Level",params:"None",result:"Tx:+2 to +6dBm. Rx:-18 to 0dBm",mttr:"<5 min",note:"Out of range = dirty connector or SFP."},{action:"Enable / Disable Cell",equip:"B8200",path:"Configuration > Cell Management > Cell Status > Activate/Deactivate",params:"Cell ID",result:"Cell enabled or disabled immediately",mttr:"<5 min",note:"Deactivate before board maintenance."},{action:"DPD Calibration",equip:"B8200",path:"Maintenance > RRU Management > Calibration > DPD > Start",params:"RRU / carrier",result:"Calibration ~10 min",mttr:"10-15 min",note:"Traffic <20%, temp 10-50C, VSWR <1.5"},{action:"Check VSWR",equip:"B8200",path:"Performance > VSWR Measurement > Select RRU > Start",params:"RRU ID",result:"OK<1.5 / Warn 1.5-3.0 / Crit>3.0",mttr:"<5 min",note:"If >3.0 PA auto-disables."},{action:"Check RTWP",equip:"B8200",path:"Performance > RTWP Measurement > Select Cell",params:"Cell ID",result:"OK<-105dBm / High>-95dBm",mttr:"<5 min",note:"High RTWP = jamming source nearby."},{action:"IDU Warm Restart",equip:"NR8250",path:"Maintenance > NE Management > Warm Restart",params:"Confirm",result:"Traffic down ~3-5 min",mttr:"3-5 min",note:"Alert NOC. Backup config before."},{action:"Board Reset NR8250",equip:"NR8250",path:"Maintenance > NE Management > Board Reset > Slot",params:"Slot number",result:"Selected board restarts",mttr:"2-5 min",note:"Use for RMU, RTU, SA, CC faults."},{action:"Check RSSI / RSL",equip:"NR8250",path:"Performance > Radio Performance > RSL Level",params:"Link name",result:"Nominal: -35 to -65 dBm",mttr:"<5 min",note:"Below -80dBm: link loss risk."},{action:"Enable ATPC",equip:"NR8250",path:"Configuration > Radio > TX Power Control > ATPC > Enable",params:"Max/Min TX",result:"ATPC active",mttr:"<5 min",note:"Essential on links > 10 km."},{action:"Disable ODU Mute",equip:"NR8250",path:"Configuration > ODU > Mute Enable > OFF",params:"Confirm",result:"TX power restored",mttr:"<5 min",note:"ALWAYS verify Mute=OFF after maintenance."},{action:"Check PTP Status",equip:"NR8250",path:"Maintenance > Clock Management > PTP > Master Status",params:"None",result:"PTP master locked",mttr:"<5 min",note:"Domain number must match both ends."},{action:"ODU Alignment Check",equip:"NR8250",path:"Performance > Radio > RSSI Real-time Monitoring",params:"None",result:"Maximize RSSI during alignment",mttr:"15-30 min",note:"Best in clear weather."},{action:"Configure Float Voltage",equip:"ZXDU68",path:"CSU > System Config > Battery > Float Voltage",params:"Nominal 53.5V",result:"CSU applies new float voltage",mttr:"<5 min",note:"Verify temp compensation sensor."},{action:"Wake SMR Modules",equip:"ZXDU68",path:"CSU > Ctrl > SMR Ctrl > Wake Up All",params:"Confirm",result:"All modules output DC",mttr:"<5 min",note:"Use when modules in sleep mode."},{action:"Check Battery SOC",equip:"ZXDU68",path:"CSU > Battery > SOC Status",params:"None",result:"SOC percentage displayed",mttr:"<2 min",note:"Below 20% = start generator NOW."},{action:"Reset LVD after Discharge",equip:"ZXDU68",path:"CSU > LVD > Reset LVD > Confirm",params:"None",result:"Loads reconnected",mttr:"<5 min",note:"Only reset after SOC > 50%."}];

const CASCADE_MAP=[{root:"Grid Power Failure (SNE)",comp:"EDC/SNE",steps:["Rectifier to Battery mode","Battery SOC drops","LVD triggers at 18%"],impact:"Complete site outage. All RAN + backhaul lost."},{root:"Generator Low Oil Pressure",comp:"Generator Deep Sea",steps:["Auto-shutdown triggered","Battery only mode","Deep discharge risk"],impact:"Same as grid failure — act immediately."},{root:"GPS Clock Lost Critical 198093024",comp:"BBU CC/UCI",steps:["Holdover mode active","Clock PLL unstable","ALL services down 198093814"],impact:"Complete RAN outage. ALL cells down. Highest priority."},{root:"CPRI Fiber Broken 198092290",comp:"RRU Optical",steps:["CPRI link interrupted","RRU disconnected","All sectors offline"],impact:"Coverage hole in all affected RRU sectors."},{root:"VSWR High > 3.0",comp:"Antenna/Coax",steps:["PA auto-disabled","TX power = 0 dBm","Coverage loss on sector"],impact:"Complete downlink loss. Re-enable PA via LMT after fix."},{root:"BBU PM Module Failure",comp:"BBU Power",steps:["+12V output lost","All boards lose power","Complete BBU shutdown"],impact:"All cells offline. Full outage if single-BBU site."},{root:"IDU CC Board Failure",comp:"IDU",steps:["IDU management lost","Auto-mode briefly","Traffic lost 3-5min on restart"],impact:"All downstream sites lose connectivity."},{root:"MW Atmospheric Fading",comp:"ODU/Dish",steps:["RSSI drops","256QAM down to 16QAM","Throughput -80%"],impact:"Partial backhaul loss. SLA monitoring required."},{root:"Rectifier Module Fault ZXD-003",comp:"Rectifier ZTE",steps:["Reduced charging capacity","Battery discharges","LVD triggers"],impact:"Site outage risk. Hot-swap urgently required."},{root:"BBU Cold Restart",comp:"BBU",steps:["All boards offline","All cells down","All RRUs disconnected"],impact:"Complete outage 8-12 min."},{root:"Lightning Strike Direct",comp:"Entire Site",steps:["Surge protectors saturated","Multiple failures simultaneously","BBU/Rect/RRU damaged"],impact:"Multiple outages. Full inspection required before restore."},{root:"Fiber Cut Vandalism/Works",comp:"Fiber Backhaul",steps:["RS-LOS alarm on IDU","No protection path","Complete backhaul loss"],impact:"All downstream sites offline. Avg MTTR 245 min Zone Sud."}];

function searchAlarm(){
  var q=(document.getElementById('alarm-input').value||'').trim().toUpperCase();
  var fb=document.getElementById('alarm-feedback');
  if(!q){fb.textContent='';fb.className='';return;}
  var hit=ALARM_MAP[q];
  if(!hit){var k=Object.keys(ALARM_MAP).find(function(x){return x.toUpperCase().includes(q)||ALARM_MAP[x].name.toUpperCase().includes(q);});if(k)hit=ALARM_MAP[k];}
  if(hit){
    fb.textContent='checkmark '+hit.name;fb.className='alarm-hit';
    document.querySelectorAll('.ti').forEach(function(ti){
      var oc=ti.getAttribute('onclick')||'';
      if(oc.includes("'"+hit.comp+"'")){
        ti.click();
        setTimeout(function(){
          curFault=hit.fault;renderFaults();
          setTimeout(function(){var el=document.getElementById('fc_'+hit.fault);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});},130);
        },200);
      }
    });
  }else{fb.textContent='x Code inconnu';fb.className='alarm-miss';}
}

var lmtFilterMode='all';
function showLMT(){renderLMT();document.getElementById('lmt-modal').style.display='flex';}
function closeLMT(){document.getElementById('lmt-modal').style.display='none';}
function filterLMT(f,btn){lmtFilterMode=f;document.querySelectorAll('.lmt-fb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');renderLMT();}
function renderLMT(){
  var list=lmtFilterMode==='all'?LMT_PATHS:LMT_PATHS.filter(function(p){return p.equip===lmtFilterMode;});
  var ec={'B8200':'lmt-b8200','NR8250':'lmt-nr8250','ZXDU68':'lmt-zxdu'};
  document.getElementById('lmt-grid').innerHTML=list.map(function(p){
    return '<div class="lmt-row"><div><span class="lmt-action">'+p.action+'</span><span class="lmt-equip '+(ec[p.equip]||'')+'">'+p.equip+'</span></div><div class="lmt-path">'+p.path+'</div><div class="lmt-result">Result: '+p.result+'</div><div style="display:flex;gap:8px;align-items:center"><span class="lmt-mttr">MTTR: '+p.mttr+'</span><span class="lmt-note">'+p.note+'</span></div></div>';
  }).join('');
}
function showCasc(){
  document.getElementById('casc-content').innerHTML=CASCADE_MAP.map(function(c){
    return '<div class="casc-chain-item"><div class="casc-root">WARNING '+c.root+'</div><div class="casc-comp-tag">Component: '+c.comp+'</div><div class="casc-steps">'+c.steps.map(function(s){return '<span class="casc-step">'+s+'</span>';}).join('<span class="casc-arr">--></span>')+'<span class="casc-arr">--></span><span class="casc-final">IMPACT</span></div><div class="casc-impact">'+c.impact+'</div></div>';
  }).join('');
  document.getElementById('casc-modal').style.display='flex';
}
function closeCasc(){document.getElementById('casc-modal').style.display='none';}

(function(){
  var m={'bb03':'198093024','bb04':'198093814','bb06':'198093055','bb08':'198090002','bb09':'198090001','bb12':'198093864','bb13':'198094029','bb15':'198092240','rr04':'198092290','rr06':'198092431','rr09':'198092249','rr10':'198092558','rr11':'198092278','rr12':'198092364','rr13':'198092433','rr15':'198092289','cl01':'198093023','cl02':'198093024','cl03':'198093814'};
  Object.keys(DB).forEach(function(ck){DB[ck].faults.forEach(function(f){if(m[f.id])f.alarmId=m[f.id];});});
})();

var _rfBase=renderFaults;
renderFaults=function(){
  _rfBase();
  if(!curComp)return;
  DB[curComp].faults.forEach(function(f){
    if(!f.alarmId)return;
    var hd=document.querySelector('#fc_'+f.id+' .fch');
    if(hd&&!hd.querySelector('.alarm-id-badge')){
      var b=document.createElement('span');
      b.className='alarm-id-badge';b.textContent=f.alarmId;
      b.title='Official ZTE Alarm ID - searchable in alarm bar above';
      var fc=hd.querySelector('.fcode');
      if(fc)fc.parentNode.insertBefore(b,fc.nextSibling);
    }
  });
};


// ── CSS Injection ──────────────────────────────────────────────────────────
var style = document.createElement('style');
style.textContent = `
.alarm-search-wrap{display:flex;align-items:center;gap:5px;margin-left:6px;}
.alarm-search{width:195px;font-size:10px;font-family:inherit;padding:4px 9px;background:rgba(245,158,11,.08);color:#e2e8f0;border:0.5px solid rgba(245,158,11,.35);border-radius:5px;outline:none;}
.alarm-search:focus{border-color:rgba(245,158,11,.7);}
.alarm-search::placeholder{color:#64748b;}
.btn-alarm{padding:4px 11px;font-size:10px;font-family:inherit;cursor:pointer;border-radius:5px;background:rgba(245,158,11,.1);color:#f59e0b;border:0.5px solid rgba(245,158,11,.3);}
.alarm-hit{font-size:9px;padding:2px 7px;border-radius:4px;background:rgba(34,197,94,.1);color:#22c55e;border:0.5px solid rgba(34,197,94,.25);}
.alarm-miss{font-size:9px;padding:2px 7px;border-radius:4px;background:rgba(239,68,68,.1);color:#ef4444;border:0.5px solid rgba(239,68,68,.25);}
.alarm-id-badge{font-size:8px;padding:1px 6px;border-radius:3px;background:rgba(245,158,11,.12);color:#f59e0b;border:0.5px solid rgba(245,158,11,.3);margin-left:6px;font-weight:500;letter-spacing:.04em;}
.lmt-mbg{position:fixed;inset:0;background:rgba(0,0,0,.82);display:none;align-items:flex-start;justify-content:center;z-index:600;overflow-y:auto;padding:20px 10px;}
.lmt-box{background:#161b22;border:1px solid rgba(255,255,255,.13);border-radius:12px;width:860px;max-width:96vw;overflow:hidden;}
.lmt-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:#1e2530;border-bottom:1px solid rgba(255,255,255,.07);}
.lmt-head h3{font-size:13px;color:#e2e8f0;font-weight:bold;font-family:'Courier New',monospace;}
.lmt-close{font-size:11px;font-family:inherit;padding:4px 10px;cursor:pointer;background:transparent;color:#94a3b8;border:0.5px solid rgba(255,255,255,.13);border-radius:5px;}
.lmt-filter-bar{display:flex;gap:5px;padding:8px 12px;background:#161b22;border-bottom:1px solid rgba(255,255,255,.07);}
.lmt-fb{font-size:9px;padding:3px 10px;border-radius:10px;border:0.5px solid rgba(255,255,255,.13);cursor:pointer;background:transparent;color:#64748b;font-family:inherit;}
.lmt-fb.on{background:rgba(59,130,246,.1);color:#3b82f6;border-color:rgba(59,130,246,.3);}
.lmt-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;}
.lmt-row{display:flex;flex-direction:column;gap:3px;padding:9px 12px;border-bottom:0.5px solid rgba(255,255,255,.07);border-right:0.5px solid rgba(255,255,255,.07);}
.lmt-row:hover{background:#1e2530;}
.lmt-action{font-size:11px;color:#e2e8f0;font-weight:600;}
.lmt-equip{font-size:8px;padding:1px 6px;border-radius:3px;margin-left:6px;}
.lmt-b8200{background:rgba(139,92,246,.1);color:#8b5cf6;}
.lmt-nr8250{background:rgba(59,130,246,.1);color:#3b82f6;}
.lmt-zxdu{background:rgba(245,158,11,.1);color:#f59e0b;}
.lmt-path{font-size:10px;color:#22c55e;font-weight:500;font-family:'Courier New',monospace;line-height:1.4;}
.lmt-result{font-size:9px;color:#94a3b8;}
.lmt-mttr{font-size:9px;color:#f59e0b;font-weight:600;}
.lmt-note{font-size:9px;color:#64748b;font-style:italic;}
.casc-mbg{position:fixed;inset:0;background:rgba(0,0,0,.82);display:none;align-items:flex-start;justify-content:center;z-index:600;overflow-y:auto;padding:20px 10px;}
.casc-box{background:#161b22;border:1px solid rgba(255,255,255,.13);border-radius:12px;width:800px;max-width:96vw;overflow:hidden;}
.casc-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:#1e2530;border-bottom:1px solid rgba(255,255,255,.13);}
.casc-chain-item{padding:11px 15px;border-bottom:0.5px solid rgba(255,255,255,.07);}
.casc-chain-item:hover{background:#1e2530;}
.casc-root{font-size:11px;color:#ef4444;font-weight:700;margin-bottom:3px;}
.casc-comp-tag{font-size:9px;color:#f59e0b;margin-bottom:5px;}
.casc-steps{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:4px;}
.casc-step{font-size:9px;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.05);color:#94a3b8;}
.casc-arr{color:#64748b;font-size:11px;}
.casc-final{font-size:9px;padding:2px 8px;border-radius:4px;background:rgba(239,68,68,.1);color:#ef4444;}
.casc-impact{font-size:9px;color:#94a3b8;}
.btn-lmt{padding:4px 12px;font-size:10px;font-family:inherit;cursor:pointer;border-radius:5px;background:rgba(34,197,94,.08);color:#22c55e;border:0.5px solid rgba(34,197,94,.3);}
.btn-casc{padding:4px 12px;font-size:10px;font-family:inherit;cursor:pointer;border-radius:5px;background:rgba(239,68,68,.08);color:#ef4444;border:0.5px solid rgba(239,68,68,.3);}
`;
document.head.appendChild(style);

// ── Inject LMT + Cascade Modals ──────────────────────────────────────────────
var modalsHTML = `
<div class="lmt-mbg" id="lmt-modal">
  <div class="lmt-box">
    <div class="lmt-head"><h3>LMT Quick Reference -- B8200 * NR8250 * ZXDU68 * Zone Sud MTN Congo</h3><button class="lmt-close" onclick="closeLMT()">X Fermer</button></div>
    <div class="lmt-filter-bar">
      <button class="lmt-fb on" id="lf-all" onclick="filterLMT('all',this)">Tout (22)</button>
      <button class="lmt-fb" onclick="filterLMT('B8200',this)">B8200 BBU</button>
      <button class="lmt-fb" onclick="filterLMT('NR8250',this)">NR8250 IDU</button>
      <button class="lmt-fb" onclick="filterLMT('ZXDU68',this)">ZXDU68 Rect.</button>
    </div>
    <div class="lmt-grid" id="lmt-grid"></div>
  </div>
</div>
<div class="casc-mbg" id="casc-modal">
  <div class="casc-box">
    <div class="casc-head"><h3 style="font-size:13px;color:#e2e8f0;font-family:'Courier New',monospace">Cascade Map -- 12 Impact Chains MTN Congo</h3><button class="lmt-close" onclick="closeCasc()">X Fermer</button></div>
    <div id="casc-content"></div>
  </div>
</div>
`;
var div = document.createElement('div');
div.innerHTML = modalsHTML;
document.body.appendChild(div);

// ── Inject Alarm Search Bar into top bar ─────────────────────────────────────
var topBar = document.querySelector('.top');
if (topBar) {
  var searchDiv = document.createElement('div');
  searchDiv.className = 'alarm-search-wrap';
  searchDiv.innerHTML = '<input class="alarm-search" id="alarm-input" placeholder="Code alarme... ex: 198093024" onkeydown="if(event.key===\'Enter\')searchAlarm()" oninput="if(!this.value){var fb=document.getElementById(\'alarm-feedback\');fb.textContent=\'\';fb.className=\'\';}"><button class="btn-alarm" onclick="searchAlarm()">GO</button><span id="alarm-feedback" style="font-size:9px"></span>';
  var apiBtn = topBar.querySelector('.btn-api');
  if (apiBtn) {
    // Insert LMT and Cascade buttons
    var lmtBtn = document.createElement('button');
    lmtBtn.className = 'btn-lmt'; lmtBtn.textContent = 'LMT Ref';
    lmtBtn.onclick = function(){showLMT();};
    var cascBtn = document.createElement('button');
    cascBtn.className = 'btn-casc'; cascBtn.textContent = 'Cascade';
    cascBtn.onclick = function(){showCasc();};
    topBar.insertBefore(searchDiv, apiBtn);
    topBar.insertBefore(lmtBtn, apiBtn);
    topBar.insertBefore(cascBtn, apiBtn);
    // Update version badge
    var logo = topBar.querySelector('.logo');
    if (logo) logo.innerHTML = logo.innerHTML.replace('v4.3', 'v5.0').replace('Component Fault Analyzer','Alarm Intelligence Engine');
  }
}

})(); // end IIFE
