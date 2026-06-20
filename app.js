/* ARMY Cultivation Quiz — versão reescrita em HTML + CSS + JavaScript */

const MATERIAS = [
  {id:"port",l:"Língua Portuguesa",hot:true},
  {id:"racioc",l:"Raciocínio Lógico",hot:true},
  {id:"dadmin",l:"Direito Administrativo",hot:true},
  {id:"dconst",l:"Direito Constitucional",hot:true},
  {id:"admgov",l:"Administração e Gov. Pública",hot:true},
  {id:"finpub",l:"Finanças Públicas / AFO",hot:true},
  {id:"polpub",l:"Políticas Públicas",hot:true},
  {id:"econ",l:"Economia",hot:false},
  {id:"ciepol",l:"Ciência Política",hot:false},
  {id:"realrj",l:"Realidade Brasileira e do RJ",hot:true},
  {id:"gestpess",l:"Gestão de Pessoas",hot:false},
  {id:"tic",l:"Tecnologia da Informação",hot:false},
  {id:"etica",l:"Ética e Legislação",hot:false},
  {id:"legserv",l:"Estatuto dos Servidores RJ",hot:true},
];
const MATMAP = Object.fromEntries(MATERIAS.map(m=>[m.id,m.l]));
const DIFS = ["Todas","Fácil","Médio","Difícil"];
const ESTILOS = [["todos","Todas"],["fgv","📋 Só estilo FGV"],["diretas","Diretas rápidas"]];
const QTDS = [5,10,15,20];
const PRESETS = [
  {id:"gerais", l:"Conhecimentos Gerais", q:40, min:270, desc:"40 questões · 4h30"},
  {id:"espec",  l:"Conhecimentos Específicos", q:60, min:240, desc:"60 questões · 4h"},
  {id:"rapido", l:"Treino rápido", q:20, min:60, desc:"20 questões · 1h"},
  {id:"custom", l:"Personalizado", q:null, min:null, desc:"Você escolhe"},
];
const CUSTOM_QT = [{q:10,min:20},{q:20,min:40},{q:30,min:75},{q:40,min:120},{q:60,min:180}];

const SUPABASE_URL  = "https://zgcniuxjksxtesbdnzuj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIiLCJyZWYiOiJ6Z2NuaXV4amtzeHRlc2Jkbnp1aiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgxNzQ0MDY5LCJleHAiOjIwOTczMjAwNjl9.d4qpK3bf-xNB7SSnxNv2T9qMRLfMiKS9j_PxAiZ1Nxw";

const LS = {
  get(k,def){try{return JSON.parse(localStorage.getItem("seplag_v3_"+k)) ?? def;}catch(e){return def;}},
  set(k,v){try{localStorage.setItem("seplag_v3_"+k,JSON.stringify(v));}catch(e){}},
};

let sb=null, usuario=null, convidado=false, authMode="signin", saveTimer=null;
try{ if(window.supabase) sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON); }catch(e){ sb=null; }

let historico = LS.get("hist",{});
let revisar = LS.get("rev",[]);
let conquistas = LS.get("badges",[]);
let cfg = {mat:"todas",dif:"Todas",hot:false,estilo:"todos",qtd:10,preset:"rapido",qt:{q:20,min:40}};
let modo="estudo", quiz=[], pos=0, acertos=0, sel=null, respondida=false, respostas=[], flags=[], timerId=null, segRestantes=0;
let currentView="home";

const $ = (id)=>document.getElementById(id);
const fmt = (txt)=>String(txt).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>");
const pct = (a,b)=>b?Math.round((a/b)*100):0;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function embaralharAlternativas(q){const ordem=shuffle(q.alt.map((_,i)=>i));return {...q,alt:ordem.map(i=>q.alt[i]),cor:ordem.indexOf(q.cor)};}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast._id);toast._id=setTimeout(()=>t.classList.remove("show"),2500);}
function confetti(){for(let i=0;i<36;i++){const el=document.createElement("i");el.className="confetti";el.style.left=Math.random()*100+"vw";el.style.background=["#8e5cff","#52b788","#ffd166","#ff5d8f","#75d5ff"][i%5];el.style.animationDelay=(Math.random()*0.25)+"s";document.body.appendChild(el);setTimeout(()=>el.remove(),1600);}}

const ASSETS = {
  intro:["assets/gifs/01_acenando.gif","assets/gifs/03_finger_heart.gif","assets/gifs/06_respirando_foco.gif","assets/stickers/m_fantasy_rabbits.png"],
  question:["assets/gifs/04_apontando_questao.gif","assets/gifs/06_respirando_foco.gif","assets/gifs/07_cansado_mas_vai.gif","assets/stickers/d_point_light.png","assets/stickers/g_thumbsup.png","assets/stickers/m_trio_study.png"],
  correct:["assets/gifs/02_comemorando_pulo.gif","assets/gifs/03_finger_heart.gif","assets/gifs/09_highfive.gif","assets/gifs/10_vitoria_trofeu.gif","assets/stickers/g_cheer_jump.png"],
  wrong:["assets/gifs/05_surpreso_erro.gif","assets/gifs/07_cansado_mas_vai.gif","assets/gifs/06_respirando_foco.gif","assets/stickers/d_surprise_duo.png"],
  result:["assets/gifs/08_final_boss.gif","assets/gifs/10_vitoria_trofeu.gif","assets/gifs/09_highfive.gif","assets/stickers/m_victory_group.png"],
};
const LINES = {
  intro:["Aymara’s show era is loading — and your approval arc too.","Magic Shop open: bring doubts, leave with progress.","The rabbits are guarding your focus today.","Brazil countdown: one question closer to the front row."],
  question:["Read like a detective, answer like a main dancer.","Black Swan focus: ignore the noise and find the core.","FGV may bring drama. You bring strategy.","Spring Day patience: the answer may appear on the second read.","Run BTS stamina: steady pace, no panic."],
  correct:["Dynamite energy! That answer landed.","Mic Drop moment. Keep the combo going.","Euphoria unlocked: the concept clicked.","Mikrokosmos point of light added to your score."],
  wrong:["Not this time — review fuel acquired.","Magic Shop reset: breathe, learn, continue.","FGV placed a trap; now you mapped it.","Yet To Come: the better answer is coming after revision."],
  result:["This score is data, not destiny.","Save the lessons, then run it back.","Concert energy + concurso discipline: powerful combo.","Aymara’s future self says thank you for not stopping."],
};
const REFS=["Dynamite","Mic Drop","Magic Shop","Mikrokosmos","Spring Day","Black Swan","Run BTS","Euphoria","Yet To Come","Love Yourself","Map of the Soul","Permission to Dance","Proof","BE","Wings"];
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function character(type="question"){
  const src=pick(ASSETS[type]||ASSETS.question);
  const gif=src.includes(".gif");
  return `<div class="character-deck glass-card">
    <img class="character-img ${gif?'gif':''}" src="${src}" alt="Personagem da jornada" loading="lazy" decoding="async">
    <div class="speech-bubble"><div class="who">${type} · BTS mood</div><div class="line">${pick(LINES[type]||LINES.question)}</div><div class="ref">Track/era: ${pick(REFS)}</div></div>
  </div>`;
}

function stats(){
  let total=0, ac=0; Object.values(historico).forEach(h=>{total+=h.total||0;ac+=h.acertos||0;});
  const xp = ac*12 + Math.max(0,total-ac)*3 + revisar.length*2;
  return {total,ac,rate:pct(ac,total),xp};
}
function setSync(msg,cls=""){const el=$("syncStatus"); if(!el)return; el.textContent=msg; el.className="sync-pill "+cls;}
function refreshTop(){const s=stats();$("totalQuestions").textContent=BANCO.length;$("xpValue").textContent=s.xp;}
function saveProgress(){
  const payload={historico,revisar,conquistas};
  LS.set("hist",historico); LS.set("rev",revisar); LS.set("badges",conquistas);
  if(usuario && sb){clearTimeout(saveTimer);setSync("sincronizando…");saveTimer=setTimeout(async()=>{try{const {error}=await sb.from("progresso").upsert({user_id:usuario.id,historico,revisar,atualizado_em:new Date().toISOString()}); if(error)throw error; setSync("salvo na nuvem","ok");}catch(e){setSync("erro ao salvar","err");}},700);} else setSync("modo visitante · salvo neste aparelho");
  refreshTop();
}
async function loadCloud(){
  if(!usuario||!sb)return;
  try{const {data,error}=await sb.from("progresso").select("historico,revisar").eq("user_id",usuario.id).maybeSingle(); if(error)throw error; if(data){historico=data.historico||{};revisar=data.revisar||[];} else await sb.from("progresso").insert({user_id:usuario.id,historico,revisar}); setSync("salvo na nuvem","ok");}
  catch(e){setSync("erro ao carregar","err");}
}

function showAuth(){ $("authScreen").classList.remove("hidden"); $("mainScreen").classList.add("hidden"); }
function showMain(){ $("authScreen").classList.add("hidden"); $("mainScreen").classList.remove("hidden"); refreshTop(); renderShell(); navigate("home"); }
function renderShell(){ setSync(usuario?`salvo na nuvem · ${usuario.email}`:"modo visitante · progresso local", usuario?"ok":""); }

function navigate(view){
  currentView=view; document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
  const map={home:"homeView",practice:"practiceView",review:"reviewView",analytics:"analyticsView"};
  $(map[view]||"homeView").classList.add("active-view");
  $("screenTitle").textContent={home:"Portal da Jornada",practice:"Central de Prática",review:"Revisão Inteligente",analytics:"Desempenho"}[view]||"Portal";
  if(view==="home")renderHome(); if(view==="practice")renderPractice(); if(view==="review")renderReview(); if(view==="analytics")renderAnalytics();
}

function renderHome(){
  const s=stats(); const weak=weakest();
  $("homeView").innerHTML=`<div class="hero-grid">
    <article class="hero-card glass-card"><p class="eyebrow">Portal interativo</p><h2>Estudo com boss fight, XP e revisão.</h2><p>O banco de <b>${BANCO.length}</b> questões foi preservado. A interface agora funciona como uma jornada: escolha missão, responda, ganhe XP, revise erros e acompanhe matéria por matéria.</p><div class="cta-row"><button class="pill-btn" onclick="navigate('practice')">Começar missão</button><button class="pill-btn alt" onclick="navigate('review')">Revisar erros</button></div></article>
    <aside class="panel-card glass-card rank-card"><div class="rank-orb">${rank(s.rate)}</div><h2>Rank atual: ${rankName(s.rate)}</h2><p class="mini-note">${s.total?`Você respondeu ${s.total} questões, com ${s.rate}% de acerto.`:'Responda a primeira missão para liberar seu rank.'}</p></aside>
  </div>
  <div class="dashboard-grid">
    <div class="metric"><b>${s.total}</b><span>respondidas</span></div><div class="metric"><b>${s.ac}</b><span>acertos</span></div><div class="metric"><b>${s.rate}%</b><span>aproveitamento</span></div><div class="metric"><b>${revisar.length}</b><span>revisão</span></div>
  </div>
  <div class="panel-card glass-card" style="margin-top:16px"><h2>Próxima recomendação</h2><p class="mini-note">${weak?`Seu ponto mais sensível agora parece ser <b>${MATMAP[weak]||weak}</b>. Faça uma sessão curta focada nessa matéria.`:'Ainda não há dados suficientes. Faça uma sessão de 10 questões para o sistema aprender seu padrão.'}</p></div>`;
}
function rank(rate){return rate>=85?'S':rate>=70?'A':rate>=55?'B':rate>=40?'C':'D'}
function rankName(rate){return ({S:'Idol da aprovação',A:'Cultivadora avançada',B:'Em ascensão',C:'Treino ativo',D:'Arco inicial'})[rank(rate)]}
function weakest(){let arr=Object.entries(historico).filter(([k,h])=>h.total>=2).sort((a,b)=>(a[1].acertos/a[1].total)-(b[1].acertos/b[1].total));return arr[0]?.[0];}

function renderPractice(){
  $("practiceView").innerHTML=`<div class="panel-card glass-card">
    <div class="mode-cards"><button class="mode-card ${modo==='estudo'?'active':''}" onclick="setMode('estudo')"><strong>📖 Modo Estudo</strong><span>Gabarito imediato, comentário e reação visual a cada questão.</span></button><button class="mode-card ${modo==='prova'?'active':''}" onclick="setMode('prova')"><strong>⏱ Simulado de Prova</strong><span>Cronômetro, navegação por questões e correção só no fim.</span></button></div>
    <div class="config-grid">
      ${configCard('Matéria','mat',[['todas','Todas as matérias'],...MATERIAS.filter(m=>BANCO.some(q=>q.mat===m.id)).map(m=>[m.id,m.l+(m.hot?' 🔥':'')])])}
      ${configCard('Dificuldade','dif',DIFS.map(d=>[d,d]))}
      ${configCard('Estilo','estilo',ESTILOS)}
      ${modo==='estudo'?configCard('Quantidade','qtd',QTDS.map(n=>[n,String(n)])):configCard('Formato da prova','preset',PRESETS.map(p=>[p.id,p.l]))}
      ${modo==='prova'&&cfg.preset==='custom'?configCard('Questões e tempo','qt',CUSTOM_QT.map(o=>[`${o.q}:${o.min}`,`${o.q} q · ${o.min}min`])):''}
      ${configCard('Filtro quente','hot',[[false,'Qualquer questão'],[true,'Só alta incidência 🔥']])}
    </div>
    <div class="start-panel"><div><h2>${modo==='prova'?'Simulado cronometrado':'Sessão de estudo'}</h2><p class="mini-note">${previewCount()} questões disponíveis com os filtros atuais. A lógica do banco e comentários foi mantida.</p></div><button class="primary-btn" onclick="startQuiz()">Iniciar missão ✦</button></div>
  </div>`;
}
function configCard(title,key,items){return `<div class="config-card"><h3>${title}</h3><div class="chips">${items.map(([v,l])=>`<button class="chip ${activeCfg(key,v)?'active':''}" onclick="setCfg('${key}','${String(v).replace(/'/g,"\\'")}')">${l}</button>`).join('')}</div></div>`}
function activeCfg(key,v){ if(key==='qt') return `${cfg.qt.q}:${cfg.qt.min}`===String(v); return String(cfg[key])===String(v); }
function setCfg(key,val){ if(key==='hot') cfg.hot=val==='true'; else if(key==='qtd') cfg.qtd=Number(val); else if(key==='qt'){const [q,min]=val.split(':').map(Number);cfg.qt={q,min};} else cfg[key]=val; renderPractice(); }
function setMode(m){modo=m;renderPractice();}
function filtra(q){return !(cfg.mat!=="todas"&&q.mat!==cfg.mat) && !(cfg.dif!=="Todas"&&q.dif!==cfg.dif) && !(cfg.hot&&!q.hot) && !(cfg.estilo==="fgv"&&!q.fgv) && !(cfg.estilo==="diretas"&&q.fgv);}
function previewCount(){return BANCO.filter(filtra).length;}

function startQuiz(){
  let pool=BANCO.filter(filtra); if(!pool.length){toast("Nenhuma questão com esses filtros.");return;}
  let qtd,min=0;if(modo==='prova'){if(cfg.preset==='custom'){qtd=cfg.qt.q;min=cfg.qt.min}else{const p=PRESETS.find(x=>x.id===cfg.preset);qtd=p.q;min=p.min}qtd=Math.min(qtd,pool.length)} else qtd=Math.min(cfg.qtd,pool.length);
  quiz=shuffle(pool).slice(0,qtd).map(embaralharAlternativas); pos=0; acertos=0; sel=null; respondida=false; respostas=Array(quiz.length).fill(null); flags=Array(quiz.length).fill(false);
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view")); $("quizView").classList.add("active-view"); $("screenTitle").textContent=modo==='prova'?"Simulado em andamento":"Missão de estudo";
  if(modo==='prova'){segRestantes=min*60; startTimer(); renderProva();} else renderEstudo();
}
function progress(){return Math.round((pos/quiz.length)*100)}
function renderEstudo(){
  respondida=false; sel=null; const q=quiz[pos];
  $("quizView").innerHTML=`<div class="quiz-layout"><article class="quiz-card glass-card"><div class="question-head"><span>Questão ${pos+1} de ${quiz.length}</span><span>${MATMAP[q.mat]} · ${q.dif}${q.hot?' · 🔥':''}</span></div><div class="progress-line"><div class="progress-fill" style="width:${progress()}%"></div></div><div class="q-text">${fmt(q.q)}</div><div class="answers">${q.alt.map((a,i)=>answerHTML(a,i)).join('')}</div><div id="feedback"></div><div class="quiz-actions"><button id="confirmBtn" class="primary-btn" style="width:auto;margin:0" onclick="confirmStudy()" disabled>Confirmar</button><button id="nextBtn" class="secondary-btn hidden" onclick="nextStudy()">${pos+1<quiz.length?'Próxima questão':'Ver resultado'}</button><button class="secondary-btn" onclick="navigate('practice')">Sair</button></div></article>${character('question')}</div>`;
}
function answerHTML(a,i,chosen=null,correct=null){let cls='answer'; if(chosen===i)cls+=' selected'; if(correct!==null){if(i===correct)cls+=' correct'; else if(i===chosen)cls+=' wrong'}return `<button class="${cls}" data-i="${i}" onclick="chooseStudy(${i})"><span class="letter">${'ABCDE'[i]}</span><span>${fmt(a)}</span></button>`}
function chooseStudy(i){if(respondida)return;sel=i;document.querySelectorAll('.answer').forEach(el=>el.classList.toggle('selected',+el.dataset.i===i));$('confirmBtn').disabled=false;}
function confirmStudy(){if(sel===null||respondida)return;respondida=true;const q=quiz[pos];const ok=sel===q.cor;if(ok){acertos++;confetti()}document.querySelector('.answers').innerHTML=q.alt.map((a,i)=>answerHTML(a,i,sel,q.cor)).join('');$('feedback').innerHTML=`<div class="feedback"><b>${ok?'Correto!':'Resposta correta: '+('ABCDE'[q.cor])+'.'}</b><br>${q.com}</div>`;registrar(q,ok,sel);document.querySelector('.quiz-layout').children[1].outerHTML=character(ok?'correct':'wrong');$('confirmBtn').classList.add('hidden');$('nextBtn').classList.remove('hidden');}
function nextStudy(){pos++; if(pos<quiz.length)renderEstudo(); else renderResult(false)}

function startTimer(){clearInterval(timerId);timerId=setInterval(()=>{segRestantes--;updateClock();if(segRestantes<=0){clearInterval(timerId);finishProva(true)}},1000)}
function fmtTempo(s){s=Math.max(0,s);const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=s%60;return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0')}
function updateClock(){const el=$("clock"); if(el){el.textContent=fmtTempo(segRestantes); el.classList.toggle('warn',segRestantes<=60)}}
function renderProva(){const q=quiz[pos], resp=respostas.filter(x=>x!==null).length;$("quizView").innerHTML=`<div class="quiz-layout"><article class="quiz-card glass-card"><div class="timer-card"><div><small>Tempo restante</small><div id="clock" class="clock">${fmtTempo(segRestantes)}</div></div><div><small>Respondidas</small><b>${resp}/${quiz.length}</b></div></div><div class="question-head"><span>Questão ${pos+1} de ${quiz.length}</span><span>${MATMAP[q.mat]} · ${q.dif}</span></div><div class="q-text">${fmt(q.q)}</div><div class="answers">${q.alt.map((a,i)=>`<button class="answer ${respostas[pos]===i?'selected':''}" onclick="chooseProva(${i})"><span class="letter">${'ABCDE'[i]}</span><span>${fmt(a)}</span></button>`).join('')}</div><div class="quiz-actions"><button class="secondary-btn" onclick="toggleFlag()">${flags[pos]?'★ Marcada':'☆ Marcar'}</button><button class="secondary-btn" ${pos===0?'disabled':''} onclick="goQuestion(${pos-1})">← Anterior</button><button class="primary-btn" style="width:auto;margin:0" onclick="${pos+1<quiz.length?'goQuestion('+(pos+1)+')':'reviewBeforeFinish()'}">${pos+1<quiz.length?'Próxima':'Revisar entrega'}</button></div><div class="nav-dots">${quiz.map((_,i)=>`<button class="dot ${respostas[i]!==null?'done':''} ${flags[i]?'flag':''} ${i===pos?'current':''}" onclick="goQuestion(${i})">${i+1}</button>`).join('')}</div></article>${character('question')}</div>`;updateClock()}
function chooseProva(i){respostas[pos]=i;renderProva()}
function goQuestion(i){pos=i;renderProva()}
function toggleFlag(){flags[pos]=!flags[pos];renderProva()}
function reviewBeforeFinish(){const resp=respostas.filter(x=>x!==null).length;$("quizView").innerHTML=`<div class="panel-card glass-card"><h2>Antes de entregar</h2><p class="mini-note">Respondidas: ${resp}/${quiz.length} · Em branco: ${quiz.length-resp} · Marcadas: ${flags.filter(Boolean).length}</p><div class="nav-dots">${quiz.map((_,i)=>`<button class="dot ${respostas[i]!==null?'done':''} ${flags[i]?'flag':''}" onclick="goQuestion(${i})">${i+1}</button>`).join('')}</div><div class="quiz-actions"><button class="secondary-btn" onclick="renderProva()">Continuar revisando</button><button class="primary-btn" style="width:auto;margin:0" onclick="finishProva(false)">Entregar prova</button></div></div>`}
function finishProva(timeout){clearInterval(timerId);acertos=0;quiz.forEach((q,i)=>{const ok=respostas[i]===q.cor;if(ok)acertos++;registrar(q,ok,respostas[i],true)});renderResult(timeout)}

function renderResult(timeout){const p=pct(acertos,quiz.length); if(p>=70)confetti(); $("quizView").innerHTML=`<div class="result-hero glass-card">${timeout?'<p class="eyebrow" style="color:var(--danger)">Tempo esgotado</p>':''}<div class="score">${p}%</div><h2>${p>=70?'Domínio de cultivadora!':p>=50?'Arco promissor':'Hora de reforçar o cultivo'}</h2><p class="mini-note">${acertos} de ${quiz.length} questões corretas. XP e revisão foram atualizados.</p><div class="result-grid"><div class="metric"><b>${acertos}</b><span>acertos</span></div><div class="metric"><b>${quiz.length-acertos}</b><span>erros</span></div><div class="metric"><b>${revisar.length}</b><span>na revisão</span></div></div><div style="margin-top:18px">${character('result')}</div><div class="quiz-actions" style="justify-content:center"><button class="primary-btn" style="width:auto;margin:0" onclick="navigate('practice')">Nova missão</button><button class="secondary-btn" onclick="navigate('review')">Revisar erros</button><button class="secondary-btn" onclick="navigate('analytics')">Ver desempenho</button></div></div>`;}

function registrar(q,ok,escolha,silent=false){if(!historico[q.mat])historico[q.mat]={total:0,acertos:0};historico[q.mat].total++; if(ok)historico[q.mat].acertos++; if(!ok && escolha!==null && escolha!==undefined && !revisar.some(r=>r.q===q.q))revisar.push({...q,marcada:escolha}); saveProgress(); if(!silent)checkBadges();}
function checkBadges(){const s=stats(); const add=[]; if(s.total>=10&&!conquistas.includes('first10'))add.push(['first10','Primeiras 10 questões']); if(s.rate>=80&&s.total>=20&&!conquistas.includes('sharp'))add.push(['sharp','Aproveitamento Idol']); add.forEach(([id,name])=>{conquistas.push(id);toast('Conquista: '+name);}); if(add.length)saveProgress();}

function renderReview(){if(!revisar.length){$("reviewView").innerHTML=`<div class="panel-card glass-card empty"><h2>Nenhuma questão em revisão</h2><p>Erros do modo estudo e prova aparecem aqui automaticamente.</p></div>`;return}$("reviewView").innerHTML=`<div class="panel-card glass-card"><h2>Fila de revisão</h2><p class="mini-note">${revisar.length} questões para transformar erro em acerto.</p><div class="review-list">${revisar.map((q,i)=>`<div class="review-item"><div><strong>${MATMAP[q.mat]} · ${q.dif}</strong><p>${fmt(q.q).slice(0,180)}...</p></div><div><button class="mini-btn" onclick="openReview(${i})">Ver</button><button class="mini-btn" onclick="removeReview(${i})">Remover</button></div></div>`).join('')}</div></div>`}
function openReview(i){const q=revisar[i];$("reviewView").innerHTML=`<div class="quiz-card glass-card"><button class="mini-btn" onclick="renderReview()">← Voltar</button><p class="eyebrow">${MATMAP[q.mat]} · ${q.dif}</p><div class="q-text">${fmt(q.q)}</div><div class="answers">${q.alt.map((a,k)=>answerHTML(a,k,q.marcada,q.cor)).join('')}</div><div class="feedback"><b>Comentário</b><br>${q.com}</div><div class="quiz-actions"><button class="primary-btn" style="width:auto;margin:0" onclick="removeReview(${i})">Marcar como revisada</button></div></div>`}
function removeReview(i){revisar.splice(i,1);saveProgress();renderReview()}

function renderAnalytics(){const entries=Object.entries(historico); if(!entries.length){$("analyticsView").innerHTML=`<div class="panel-card glass-card empty"><h2>Sem histórico ainda</h2><p>Comece uma missão para liberar gráficos.</p></div>`;return}$("analyticsView").innerHTML=`<div class="panel-card glass-card"><h2>Mapa de desempenho</h2><div class="analytics-list">${entries.sort((a,b)=>(a[1].acertos/a[1].total)-(b[1].acertos/b[1].total)).map(([k,h])=>{const p=pct(h.acertos,h.total);return `<div class="bar-row"><strong>${MATMAP[k]||k}</strong><div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div><span>${p}%</span></div>`}).join('')}</div><div class="quiz-actions"><button class="secondary-btn" onclick="clearHistory()">Limpar histórico</button></div></div>`}
function clearHistory(){if(confirm('Apagar histórico de desempenho?')){historico={};saveProgress();renderAnalytics();}}

async function doAuth(){const email=$("authEmail").value.trim(), pass=$("authPass").value; const msg=$("authMsg"); msg.textContent=''; msg.className='auth-msg'; if(!email||pass.length<6){msg.textContent='Informe e-mail e senha com pelo menos 6 caracteres.';msg.classList.add('err');return} if(!sb){msg.textContent='Supabase não carregou. Use modo visitante.';msg.classList.add('err');return} const btn=$("authSubmit"); btn.disabled=true; btn.textContent=authMode==='signup'?'Criando...':'Entrando...'; try{let res;if(authMode==='signup'){res=await sb.auth.signUp({email,password:pass}); if(res.error)throw res.error; if(!res.data.session){msg.textContent='Conta criada! Confirme seu e-mail e depois entre.';msg.classList.add('ok');btn.disabled=false;btn.textContent='Criar conta';return}}else{res=await sb.auth.signInWithPassword({email,password:pass}); if(res.error)throw res.error} usuario=res.data.user; convidado=false; await loadCloud(); showMain();}catch(e){msg.textContent=(e.message||'Erro ao autenticar').replace('Invalid login credentials','E-mail ou senha incorretos.');msg.classList.add('err')} btn.disabled=false; btn.textContent=authMode==='signup'?'Criar conta':'Entrar na jornada'}
function guest(){convidado=true;usuario=null;historico=LS.get('hist',{});revisar=LS.get('rev',[]);showMain()}
async function logout(){clearInterval(timerId);if(sb&&usuario)try{await sb.auth.signOut()}catch(e){} usuario=null;convidado=false;showAuth()}

function bind(){
  $("authSubmit").onclick=doAuth; $("guestBtn").onclick=guest; $("logoutBtn").onclick=logout; $("focusModeBtn").onclick=()=>document.body.classList.toggle('focus'); $("themeBtn").onclick=()=>document.body.classList.toggle('light');
  document.querySelectorAll('.auth-tab').forEach(b=>b.onclick=()=>{authMode=b.dataset.authMode;document.querySelectorAll('.auth-tab').forEach(x=>x.classList.toggle('active',x===b));$('authSubmit').textContent=authMode==='signup'?'Criar conta':'Entrar na jornada'});
  document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
}
(async function init(){bind();refreshTop(); if(sb){try{const {data}=await sb.auth.getSession(); if(data?.session){usuario=data.session.user; await loadCloud(); showMain(); return}}catch(e){}} showAuth();})();
