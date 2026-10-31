'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Shield, HeartPulse, Star, Stethoscope, Siren, Languages, CheckCircle2, AlertTriangle, Copy, Printer, Save, Calculator, ClipboardList, Zap } from 'lucide-react';

/* ---------- DATA ---------- */
const COS = [
  { id: 'hdfc', name: 'HDFC ERGO', Icon: Shield, g: 'from-rose-500 to-red-700' },
  { id: 'niva', name: 'Niva Bupa', Icon: HeartPulse, g: 'from-sky-500 to-blue-700' },
  { id: 'star', name: 'Star Health', Icon: Star, g: 'from-amber-400 to-orange-600' },
  { id: 'care', name: 'Care Health', Icon: Stethoscope, g: 'from-emerald-500 to-teal-700' },
];
const r = (id, label, en, hi, fx = {}) => ({ id, label, en, hi, fx });
// cap: null = no cap | number = Rs/day | 'pct' = 1% of SI | 'pct10k' = 1% of SI max 10,000
const PLANS = [
  { id: 'h1', co: 'hdfc', name: 'Optima Secure / Secure+', cap: null, pd: false, cons: true, copay: [0, 0], sub: {}, riders: [
    r('ded25', 'Aggregate Deductible ₹25,000', 'You pay the first ₹25,000 of every year\'s claims.', 'हर साल के पहले ₹25,000 आपको देने होंगे।', { ded: 25000 }),
    r('ded50', 'Aggregate Deductible ₹50,000', 'You pay the first ₹50,000 of every year\'s claims.', 'हर साल के पहले ₹50,000 आपको देने होंगे।', { ded: 50000 }),
    r('abcd', 'ABCD Chronic Care Rider', 'Asthma/BP/Cholesterol/Diabetes covered after 30 days.', 'अस्थमा/BP/कोलेस्ट्रॉल/शुगर 30 दिन बाद कवर।'),
  ] },
  { id: 'h2', co: 'hdfc', name: 'Optima Restore', cap: null, pd: false, cons: false, copay: [0, 0], sub: {}, riders: [
    r('prot', 'Optima Plus / Protect Rider', 'Pays the 12% consumables (gloves, PPE, syringes).', '12% consumables (दस्ताने, PPE, सिरिंज) का पैसा देता है।', { cons: true }),
  ] },
  { id: 'h3', co: 'hdfc', name: 'my:health Suraksha', cap: null, pd: false, cons: false, copay: [0, 0], sub: {}, riders: [
    r('nmc', 'Non-Medical Consumables Waiver', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
    r('cap1', '1% Room Rent Cap (discount taken)', 'Room limited to 1% of Sum Insured/day. Proportionate Deduction ON!', 'Room सिर्फ़ Sum Insured का 1%/दिन। ज़्यादा महँगा room = पूरे बिल में कटौती!', { cap: 'pct' }),
  ] },
  { id: 'n1', co: 'niva', name: 'ReAssure 2.0 / 3.0', cap: null, pd: false, cons: false, copay: [0, 0], sub: {}, riders: [
    r('safe', 'Safeguard / Safeguard+ Rider', 'Pays 100% non-payable consumables.', '100% consumables का पैसा देता है।', { cons: true }),
    r('rmod', 'Room Type Modification (Single/Shared discount)', 'Room capped at ₹5,000/day. Proportionate Deduction ON!', 'Room ₹5,000/दिन तक। ज़्यादा = पूरे बिल में कटौती!', { cap: 5000 }),
    r('dis', 'Disease Management Rider', 'Day-1 cover for Diabetes & Hypertension.', 'शुगर और BP पहले दिन से कवर।'),
  ] },
  { id: 'n2', co: 'niva', name: 'Aspire', cap: null, pd: false, cons: false, copay: [0, 0], sub: {}, riders: [
    r('safep', 'Safeguard+ Rider', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
  ] },
  { id: 'n3', co: 'niva', name: 'Senior First — Gold (20% co-pay)', cap: 5000, pd: true, cons: false, copay: [20, 20], sub: {}, riders: [
    r('cpw', 'Co-Pay Waiver Rider', 'Co-pay drops to 0%.', 'Co-pay 0% हो जाता है।', { copay0: true }),
    r('safe', 'Safeguard Rider', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
  ] },
  { id: 'n4', co: 'niva', name: 'Senior First — Platinum (30% co-pay)', cap: 5000, pd: true, cons: false, copay: [30, 30], sub: {}, riders: [
    r('cpw', 'Co-Pay Waiver Rider', 'Co-pay drops to 0%.', 'Co-pay 0% हो जाता है।', { copay0: true }),
    r('safe', 'Safeguard Rider', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
  ] },
  { id: 's1', co: 'star', name: 'Star Comprehensive', cap: 5000, pd: true, cons: false, copay: [0, 10], sub: { cataract: 40000 }, riders: [
    r('xp', 'Star Extra Protect Add-on', 'Pays consumables (Lists I–IV) + raises modern-treatment limits.', 'Consumables देता है + modern treatment limit बढ़ाता है।', { cons: true, sub: { cataract: 100000 } }),
  ] },
  { id: 's2', co: 'star', name: 'Family Health Optima (FHO)', cap: 5000, pd: true, cons: false, copay: [0, 20], sub: { cataract: 30000 }, riders: [
    r('xp', 'Star Extra Protect Add-on', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
  ] },
  { id: 's3', co: 'star', name: 'Star Health Assure', cap: 'pct', pd: true, cons: true, copay: [0, 10], sub: {}, riders: [] },
  { id: 's4', co: 'star', name: 'Senior Citizens Red Carpet', cap: 'pct10k', pd: true, cons: false, copay: [30, 30], sub: { cataract: 25000, knee: 120000, heart: 200000 }, alert: true, riders: [] },
  { id: 'c1', co: 'care', name: 'Care Supreme', cap: null, pd: false, cons: false, copay: [0, 0], sub: {}, riders: [
    r('cs', 'Claim Shield Rider', 'Pays 68+ non-payable consumables.', '68+ consumables का पैसा देता है।', { cons: true }),
    r('rmod', 'Room Rent Modification Rider', 'Room capped (Single Private/Twin Sharing ~₹5,000/day). Proportionate Deduction ON!', 'Room ~₹5,000/दिन तक। ज़्यादा = पूरे बिल में कटौती!', { cap: 5000 }),
    r('inst', 'Instant Cover Rider', '30-day wait for BP/Diabetes/Asthma.', 'BP/शुगर/अस्थमा के लिए 30 दिन इंतज़ार।'),
  ] },
  { id: 'c2', co: 'care', name: 'Care Classic (Zonal)', cap: null, pd: false, cons: false, copay: [0, 0], sub: {}, riders: [
    r('cs', 'Claim Shield Rider', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
    r('zone', 'Admitted in Zone 1 Metro on Zone 2 Policy', '20% zonal co-pay (e.g. Bhopal policy, Delhi/Mumbai/Bangalore hospital).', '20% zonal कटौती (जैसे भोपाल की पॉलिसी, दिल्ली/मुंबई/बेंगलुरु का अस्पताल)।', { pen: 0.2 }),
  ] },
  { id: 'c3', co: 'care', name: 'Care Senior', cap: 5000, pd: true, cons: false, copay: [20, 20], sub: {}, riders: [
    r('cpw', 'Co-Payment Waiver Rider', 'Co-pay drops from 20% to 0%.', 'Co-pay 20% से 0%।', { copay0: true }),
    r('cs', 'Claim Shield / Care Shield', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
    r('smart', 'Smart Select Network Penalty', '20% cut if hospital is NOT in the Smart Select network.', 'अस्पताल Smart Select नेटवर्क में नहीं तो 20% कटौती।', { pen: 0.2 }),
  ] },
  { id: 'c4', co: 'care', name: 'Care Advantage', cap: null, pd: false, cons: false, copay: [0, 0], sub: {}, riders: [
    r('cs', 'Claim Shield / Care Shield', 'Pays the 12% consumables.', '12% consumables का पैसा देता है।', { cons: true }),
    r('smart', 'Smart Select Network Penalty', '20% cut if hospital is NOT in the Smart Select network.', 'अस्पताल Smart Select नेटवर्क में नहीं तो 20% कटौती।', { pen: 0.2 }),
  ] },
];
const SIS = [[500000, '₹5 Lakh'], [1000000, '₹10 Lakh'], [1500000, '₹15 Lakh+']];
const TR = [
  { id: 'general', l: ['Fever / Dengue', 'बुखार / डेंगू'], bill: 60000, room: 4000 },
  { id: 'cataract', l: ['Cataract Surgery', 'मोतियाबिंद'], bill: 60000, room: 5000 },
  { id: 'knee', l: ['Knee Replacement', 'घुटना बदलना'], bill: 300000, room: 7500 },
  { id: 'heart', l: ['Heart Surgery / Angioplasty', 'हार्ट सर्जरी'], bill: 450000, room: 7500 },
  { id: 'icu', l: ['ICU / Emergency', 'ICU / इमरजेंसी'], bill: 350000, room: 9000 },
];

/* ---------- LOGIC ---------- */
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const capOf = (c, si) => (c == null ? Infinity : c === 'pct' ? si * 0.01 : c === 'pct10k' ? Math.min(si * 0.01, 10000) : c);

function derive(p, on, si, senior) {
  const fx = p.riders.filter((x) => on[x.id]);
  let cap = capOf(p.cap, si), pd = p.pd;
  fx.forEach((x) => { if (x.fx.cap != null) { cap = capOf(x.fx.cap, si); pd = true; } });
  const sub = { ...p.sub };
  fx.forEach((x) => Object.assign(sub, x.fx.sub));
  return {
    cap, pd, sub,
    cons: p.cons || fx.some((x) => x.fx.cons),
    cp: fx.some((x) => x.fx.copay0) ? 0 : p.copay[senior ? 1 : 0],
    ded: Math.max(0, ...fx.map((x) => x.fx.ded || 0)),
    pen: fx.reduce((a, x) => a + (x.fx.pen || 0), 0),
  };
}

function calc(p, on, si, senior, bill, room, tr) {
  const d = derive(p, on, si, senior);
  let P = bill;
  const consLoss = d.cons ? 0 : bill * 0.12;
  P -= consLoss;
  const eligible = Math.min(bill * 0.7, P); // room-linked charges (meds/consumables excluded per IRDAI)
  const propPen = d.pd && room > d.cap ? ((room - d.cap) / room) * eligible : 0;
  P -= propPen;
  const lim = d.sub[tr];
  const subCut = lim != null && P > lim ? P - lim : 0;
  P -= subCut;
  const ded = Math.min(P, d.ded);
  P -= ded;
  const cpAmt = P * (d.cp / 100);
  P -= cpAmt;
  const penAmt = P * d.pen;
  P -= penAmt;
  const siCut = P > si ? P - si : 0;
  P -= siCut;
  const pays = Math.max(0, P);
  return { d, consLoss, propPen, subCut, ded, cpAmt, penAmt, siCut, pays, oop: bill - pays };
}

function advice(p, d, L) {
  const T = (e, h) => (L === 'en' ? e : h);
  const a = [];
  if (p.alert) a.push(['r', T('🚨 HIGH ALERT: This plan has a MANDATORY 30% co-pay on ALL claims, strict package caps (Cataract ₹25,000 | Knee ₹1,20,000 | Heart/CABG ₹2,00,000) and NO rider can remove them. Ask the hospital for the package price BEFORE admission.', '🚨 बड़ा ख़तरा: इस प्लान में हर क्लेम पर 30% co-pay देना ही पड़ेगा, और सीमाएँ हैं (मोतियाबिंद ₹25,000 | घुटना ₹1,20,000 | हार्ट ₹2,00,000)। कोई rider इन्हें नहीं हटा सकता। भर्ती से पहले अस्पताल से पैकेज का रेट पूछो।')]);
  if (d.cap === Infinity) a.push(['g', T('✅ Any room type is covered. Still ask the desk for a written estimate.', '✅ कोई भी room चलेगा। फिर भी desk से लिखित estimate माँगो।')]);
  else a.push(['r', T(`🛑 STOP! Tell the desk: "Give us ONLY a Single Private A/C Room under ${inr(d.cap)}/day. Do NOT put us in a Deluxe Room or Suite!" If the room costs more than your limit, the company cuts your ENTIRE surgery payout!`, `🛑 रुको! Desk पर बोलो: "हमें सिर्फ़ Single Private A/C Room दीजिए, ${inr(d.cap)}/दिन से कम। Deluxe या Suite बिल्कुल नहीं!" Room limit से महँगा हुआ तो कंपनी पूरे operation का पैसा काट देगी!`)]);
  if (!d.cons) a.push(['a', T('🟡 About 12% of the bill (gloves, masks, syringes) will NOT be paid. Keep that cash ready.', '🟡 बिल का करीब 12% (दस्ताने, मास्क, सिरिंज) कंपनी नहीं देगी। इतना कैश तैयार रखो।')]);
  else a.push(['g', T('✅ Consumables (gloves, PPE, syringes) are covered.', '✅ Consumables (दस्ताने, PPE, सिरिंज) कवर हैं।')]);
  if (d.cp > 0) a.push([d.cp >= 20 ? 'r' : 'a', T(`${d.cp >= 20 ? '🔴' : '🟡'} You pay ${d.cp}% of every claim yourself (co-pay).`, `${d.cp >= 20 ? '🔴' : '🟡'} हर क्लेम का ${d.cp}% आपको ख़ुद देना होगा (co-pay)।`)]);
  if (d.ded > 0) a.push(['a', T(`🟡 You pay the first ${inr(d.ded)} yourself (deductible).`, `🟡 पहले ${inr(d.ded)} आपको ख़ुद देने होंगे (deductible)।`)]);
  if (d.pen > 0) a.push(['r', T('🔴 20% of your payout is cut if the hospital is outside your allowed zone/network. Ask the desk: "Is this hospital in my zone / network?"', '🔴 अस्पताल आपके zone/network के बाहर हुआ तो 20% कटेगा। Desk से पूछो: "क्या यह अस्पताल मेरे zone/network में है?"')]);
  const sl = Object.entries(d.sub);
  if (sl.length) a.push(['a', T('🟡 Treatment caps: ' + sl.map(([k, v]) => `${k} ${inr(v)}`).join(' | '), '🟡 इलाज की सीमा: ' + sl.map(([k, v]) => `${k} ${inr(v)}`).join(' | '))]);
  a.push(['g', T('👉 Show your insurance card and ask for CASHLESS pre-authorisation at the TPA/insurance desk.', '👉 बीमा कार्ड दिखाओ और TPA/insurance desk पर CASHLESS pre-authorisation माँगो।')]);
  return a;
}

const tone = { g: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50', a: 'border-amber-400/60 bg-amber-500/15 text-amber-50', r: 'border-red-400/70 bg-red-600/25 text-red-50' };

/* ---------- UI ---------- */
function Switch({ on, onClick }) {
  return (
    <button role="switch" aria-checked={on} onClick={onClick} className={`relative h-9 w-16 shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-600'}`}>
      <span className={`absolute top-1 h-7 w-7 rounded-full bg-white transition-all ${on ? 'left-8' : 'left-1'}`} />
    </button>
  );
}
const Glass = ({ children, className = '' }) => <div className={`rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl ${className}`}>{children}</div>;
const Pick = ({ on, onClick, children, className = '' }) => (
  <button onClick={onClick} className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition active:scale-95 ${on ? 'border-emerald-400 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'} ${className}`}>{children}</button>
);

export default function App() {
  const [L, setL] = useState('en');
  const [mode, setMode] = useState(0);
  const [co, setCo] = useState('hdfc');
  const [pid, setPid] = useState('h1');
  const [si, setSi] = useState(1000000);
  const [senior, setSenior] = useState(false);
  const [on, setOn] = useState({});
  const [tr, setTr] = useState('knee');
  const [bill, setBill] = useState(300000);
  const [room, setRoom] = useState(7500);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const T = (e, h) => (L === 'en' ? e : h);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('claimshield:v1') || 'null');
      if (s && PLANS.some((p) => p.id === s.pid)) { setCo(s.co); setPid(s.pid); setSi(s.si); setSenior(s.senior); setOn(s.on || {}); setSaved(true); }
    } catch (e) { /* storage unavailable */ }
  }, []);

  const plan = PLANS.find((p) => p.id === pid);
  const d = useMemo(() => derive(plan, on, si, senior), [plan, on, si, senior]);
  const adv = useMemo(() => advice(plan, d, L), [plan, d, L]);
  const res = useMemo(() => calc(plan, on, si, senior, bill, room, tr), [plan, on, si, senior, bill, room, tr]);
  const light = plan.alert || d.pd || d.cp >= 20 || d.pen > 0 ? 'r' : !d.cons || d.cp > 0 || d.ded > 0 || Object.keys(d.sub).length ? 'a' : 'g';
  const lightTxt = { g: T('LOOKS SAFE', 'सुरक्षित'), a: T('CHECK WITH TPA DESK', 'TPA desk से पूछो'), r: T('DANGER — TRAPS AHEAD', 'ख़तरा — नुकसान हो सकता है') };
  const lightCls = { g: 'bg-emerald-500', a: 'bg-amber-500 text-slate-900', r: 'bg-red-600 animate-pulse' };

  const pickCo = (id) => { setCo(id); setPid(PLANS.find((p) => p.co === id).id); setOn({}); };
  const pickPlan = (id) => { setPid(id); setOn({}); };
  const pickTr = (t) => { setTr(t.id); setBill(t.bill); setRoom(t.room); };

  const activeRiders = plan.riders.filter((x) => on[x.id]).map((x) => x.label);
  const roomTxt = d.cap === Infinity ? T('Any room', 'कोई भी room') : T(`Single Private A/C, max ${inr(d.cap)}/day`, `Single Private A/C, ज़्यादा से ज़्यादा ${inr(d.cap)}/दिन`);
  const wa = [
    '🛡️ *FAMILY INSURANCE SOS* (ClaimShield)',
    `🏢 ${COS.find((c) => c.id === co).name} — ${plan.name}`,
    `💰 Sum Insured: ${inr(si)} | Age: ${senior ? '61+' : 'Under 60'}`,
    `🛏️ ${T('Max room', 'Room सीमा')}: ${roomTxt}`,
    `➕ ${T('Riders', 'Riders')}: ${activeRiders.join(', ') || T('None', 'कोई नहीं')}`,
    `🧾 Co-pay: ${d.cp}% | ${T('Consumables', 'Consumables')}: ${d.cons ? T('covered', 'कवर') : T('NOT covered (~12%)', 'कवर नहीं (~12%)')}`,
    d.pen > 0 ? `⚠️ ${T('20% penalty outside zone/network', 'zone/network के बाहर 20% कटौती')}` : '',
    `✅ ${T('DO: ask for CASHLESS pre-auth, written estimate, room within limit', 'करो: CASHLESS pre-auth, लिखित estimate, limit के अंदर room')}`,
    `🚫 ${T("DON'T: accept Deluxe/Suite or sign blank forms", 'मत करो: Deluxe/Suite या ख़ाली form पर sign')}`,
  ].filter(Boolean).join('\n');

  const save = () => { try { localStorage.setItem('claimshield:v1', JSON.stringify({ co, pid, si, senior, on })); setSaved(true); } catch (e) { setSaved(false); } };
  const copy = async () => {
    try { await navigator.clipboard.writeText(wa); }
    catch (e) { const t = document.createElement('textarea'); t.value = wa; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (_) {} document.body.removeChild(t); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  /* simulator breakdown */
  const saving = res.propPen > 0 ? calc(plan, on, si, senior, bill, d.cap, tr).pays - res.pays : 0;
  const addCons = plan.riders.find((x) => x.fx.cons && !on[x.id]);
  const steps = [
    res.consLoss > 0 && { a: res.consLoss, w: T('Consumables not covered (12%)', 'Consumables कवर नहीं (12%)'), t: addCons ? T(`Add the "${addCons.label}" rider to save ${inr(res.consLoss)}.`, `"${addCons.label}" rider लगाने से ${inr(res.consLoss)} बचते।`) : T('Ask the desk for the non-payable items list and avoid optional items.', 'Desk से non-payable items की list लो, ग़ैर-ज़रूरी चीज़ें मत लो।') },
    res.propPen > 0 && { a: res.propPen, w: T(`Room ${inr(room)}/day is above your ${inr(d.cap)} limit → Proportionate Deduction`, `Room ${inr(room)}/दिन आपकी ${inr(d.cap)} सीमा से ऊपर → Proportionate Deduction`), t: T(`Downgrade room by ${inr(room - d.cap)}/day to instantly save ${inr(saving)} on this bill!`, `Room ${inr(room - d.cap)}/दिन सस्ता लो और इस बिल पर तुरंत ${inr(saving)} बचाओ!`) },
    res.subCut > 0 && { a: res.subCut, w: T(`Treatment cap of ${inr(d.sub[tr])} applied`, `इलाज की सीमा ${inr(d.sub[tr])} लगी`), t: T('Ask for a package price within the cap or compare hospitals.', 'सीमा के अंदर का package rate माँगो या दूसरे अस्पताल से तुलना करो।') },
    res.ded > 0 && { a: res.ded, w: T('Deductible you pay first', 'Deductible जो पहले आप देंगे'), t: T('Fixed by your plan — plan for it.', 'प्लान से तय है — इसकी तैयारी रखो।') },
    res.cpAmt > 0 && { a: res.cpAmt, w: T(`Co-pay ${d.cp}%`, `Co-pay ${d.cp}%`), t: plan.riders.some((x) => x.fx.copay0 && !on[x.id]) ? T('A Co-pay Waiver rider would remove this.', 'Co-pay Waiver rider से यह ख़त्म हो जाता।') : T('Mandatory on this plan.', 'इस प्लान में ज़रूरी है।') },
    res.penAmt > 0 && { a: res.penAmt, w: T('Zonal / network penalty (20%)', 'Zonal / network कटौती (20%)'), t: T('Move to an in-zone / in-network hospital if the patient is stable.', 'मरीज़ stable हो तो zone/network वाले अस्पताल में जाओ।') },
    res.siCut > 0 && { a: res.siCut, w: T('Bill is above Sum Insured', 'बिल Sum Insured से ज़्यादा'), t: T('Ask about super top-up / corporate cover.', 'Super top-up / कंपनी कवर के बारे में पूछो।') },
  ].filter(Boolean);
  const paysPct = bill ? (res.pays / bill) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15),_transparent_60%)] pb-24 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* header */}
        <header className="flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-emerald-500 p-2"><Shield className="h-6 w-6 text-slate-950" /></div>
            <div><h1 className="text-xl font-black leading-none">ClaimShield</h1><p className="text-xs text-slate-400">{T('Hospital insurance trap-decoder', 'अस्पताल बीमा जाल-डिकोडर')}</p></div>
          </div>
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold">
            <button onClick={() => setL('en')} className={`rounded-full px-3 py-2 ${L === 'en' ? 'bg-white text-slate-900' : ''}`}>🇬🇧 English</button>
            <button onClick={() => setL('hi')} className={`rounded-full px-3 py-2 ${L === 'hi' ? 'bg-white text-slate-900' : ''}`}>🇮🇳 सरल हिंदी</button>
          </div>
        </header>

        <nav className="grid grid-cols-3 gap-2 print:hidden">
          {[[Zap, T('3-Tap Check', '3-Tap जाँच')], [Calculator, T('Bill Simulator', 'बिल सिमुलेटर')], [ClipboardList, T('SOS Card', 'SOS कार्ड')]].map(([Ic, t], i) => (
            <button key={i} onClick={() => setMode(i)} className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-sm font-bold transition ${mode === i ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-300'}`}><Ic className="h-5 w-5" />{t}</button>
          ))}
        </nav>

        {/* shared selectors for modes 0 and 1 */}
        {mode < 2 && (
          <div className="space-y-4 print:hidden">
            <Glass>
              <h2 className="mb-3 text-lg font-bold">1. {T('Tap your insurance company', 'अपनी बीमा कंपनी चुनो')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {COS.map(({ id, name, Icon, g }) => (
                  <button key={id} onClick={() => pickCo(id)} className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-gradient-to-br p-3 font-bold transition active:scale-95 ${g} ${co === id ? 'border-white ring-4 ring-white/30' : 'border-transparent opacity-60'}`}>
                    <Icon className="h-8 w-8" />{name}
                  </button>
                ))}
              </div>
            </Glass>
            <Glass>
              <h2 className="mb-3 text-lg font-bold">2. {T('Plan, Sum Insured & Age', 'प्लान, Sum Insured और उम्र')}</h2>
              <div className="grid gap-2">
                {PLANS.filter((p) => p.co === co).map((p) => <Pick key={p.id} on={pid === p.id} onClick={() => pickPlan(p.id)}>{p.name}</Pick>)}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">{SIS.map(([v, l]) => <Pick key={v} on={si === v} onClick={() => setSi(v)} className="text-center">{l}</Pick>)}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Pick on={!senior} onClick={() => setSenior(false)} className="text-center">{T('Under 60', '60 से कम')}</Pick>
                <Pick on={senior} onClick={() => setSenior(true)} className="text-center">{T('61+ Senior', '61+ सीनियर')}</Pick>
              </div>
            </Glass>
            {plan.riders.length > 0 && (
              <Glass>
                <h2 className="mb-1 text-lg font-bold">3. {T('Add-on Riders you have', 'आपके पास कौन से Add-on हैं')}</h2>
                <p className="mb-3 text-sm text-amber-300">{T('Not sure? Leave OFF for the safest worst-case estimate.', 'पक्का नहीं पता? OFF रखो — सबसे सुरक्षित अंदाज़ा मिलेगा।')}</p>
                <div className="space-y-2">
                  {plan.riders.map((x) => (
                    <div key={x.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3">
                      <div><p className="font-semibold">{x.label}</p><p className="text-sm text-slate-400">{T(x.en, x.hi)}</p></div>
                      <Switch on={!!on[x.id]} onClick={() => setOn({ ...on, [x.id]: !on[x.id] })} />
                    </div>
                  ))}
                </div>
              </Glass>
            )}
          </div>
        )}

        {/* MODE 0 */}
        {mode === 0 && (
          <Glass className="space-y-3 print:hidden">
            <div className={`rounded-2xl px-4 py-3 text-center text-lg font-black ${lightCls[light]}`}>{lightTxt[light]}</div>
            <h2 className="text-xl font-black">{T('What to tell the hospital desk RIGHT NOW', 'अस्पताल desk पर अभी यह बोलो')}</h2>
            {adv.map(([t, s], i) => <p key={i} className={`rounded-2xl border-2 p-4 text-lg font-semibold leading-snug ${tone[t]}`}>{s}</p>)}
          </Glass>
        )}

        {/* MODE 1 */}
        {mode === 1 && (
          <div className="space-y-4 print:hidden">
            <Glass>
              <h2 className="mb-3 text-lg font-bold">{T('Treatment & Bill', 'इलाज और बिल')}</h2>
              <div className="grid grid-cols-2 gap-2">{TR.map((t) => <Pick key={t.id} on={tr === t.id} onClick={() => pickTr(t)} className="text-sm">{T(...t.l)}</Pick>)}</div>
              <label className="mt-4 block font-semibold">{T('Estimated total bill', 'कुल अनुमानित बिल')}: <span className="text-emerald-300">{inr(bill)}</span></label>
              <input type="range" min={50000} max={1000000} step={5000} value={bill} onChange={(e) => setBill(+e.target.value)} className="h-10 w-full accent-emerald-400" />
              <label className="mt-2 block font-semibold">{T('Hospital room rent / day', 'अस्पताल का room किराया / दिन')}: <span className="text-emerald-300">{inr(room)}</span></label>
              <input type="range" min={3000} max={15000} step={500} value={room} onChange={(e) => setRoom(+e.target.value)} className="h-10 w-full accent-emerald-400" />
            </Glass>
            <Glass>
              <div className="mb-2 flex justify-between text-sm font-bold"><span className="text-emerald-300">{T('Insurance pays', 'बीमा देगा')}: {inr(res.pays)}</span><span className="text-red-300">{T('You pay', 'आप दोगे')}: {inr(res.oop)}</span></div>
              <div className="flex h-8 overflow-hidden rounded-full bg-red-600">
                <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${paysPct}%` }} />
              </div>
              <p className="mt-2 text-center text-sm text-slate-400">{T('Total bill', 'कुल बिल')} {inr(bill)} • {Math.round(paysPct)}% {T('covered', 'कवर')}</p>
            </Glass>
            <Glass className="space-y-2">
              <h2 className="text-lg font-bold">{T('Why each rupee was cut', 'हर रुपया क्यों कटा')}</h2>
              {steps.length === 0 && <p className="rounded-2xl border-2 border-emerald-400/60 bg-emerald-500/15 p-4 font-semibold">{T('✅ No cuts. Insurance pays the full bill.', '✅ कोई कटौती नहीं। बीमा पूरा बिल देगा।')}</p>}
              {steps.map((s, i) => (
                <div key={i} className="rounded-2xl border border-red-400/40 bg-red-600/15 p-3">
                  <div className="flex justify-between gap-2 font-bold"><span>{s.w}</span><span className="shrink-0 text-red-300">−{inr(s.a)}</span></div>
                  <p className="mt-1 text-sm text-emerald-300">💡 {s.t}</p>
                </div>
              ))}
              <p className="pt-1 text-xs text-slate-500">{T('Estimate only. Consumables ≈12% of bill; proportionate deduction applied to ≈70% of bill. Final settlement depends on insurer and policy wording.', 'सिर्फ़ अंदाज़ा। Consumables ≈12%; proportionate deduction बिल के ≈70% पर। अंतिम क्लेम बीमा कंपनी और पॉलिसी पर निर्भर।')}</p>
            </Glass>
          </div>
        )}

        {/* MODE 2 */}
        {mode === 2 && (
          <div className="space-y-4">
            <div className="rounded-3xl border-4 border-emerald-400 bg-slate-900 p-5 print:border-black print:bg-white print:text-black">
              <div className="mb-3 flex items-center gap-2 text-2xl font-black text-red-400 print:text-black"><Siren className="h-7 w-7" />{T('FAMILY INSURANCE SOS', 'फैमिली बीमा SOS')}</div>
              <dl className="space-y-2 text-lg">
                <div><dt className="text-sm text-slate-400">{T('Company / Plan', 'कंपनी / प्लान')}</dt><dd className="font-bold">{COS.find((c) => c.id === co).name} — {plan.name}</dd></div>
                <div><dt className="text-sm text-slate-400">{T('Sum Insured / Age', 'Sum Insured / उम्र')}</dt><dd className="font-bold">{inr(si)} • {senior ? '61+' : T('Under 60', '60 से कम')}</dd></div>
                <div><dt className="text-sm text-slate-400">{T('Max allowed room', 'अधिकतम room')}</dt><dd className={`font-bold ${d.cap === Infinity ? 'text-emerald-300' : 'text-red-300'}`}>{roomTxt}</dd></div>
                <div><dt className="text-sm text-slate-400">{T('Active riders', 'चालू riders')}</dt><dd className="font-bold">{activeRiders.join(', ') || T('None', 'कोई नहीं')}</dd></div>
                <div><dt className="text-sm text-slate-400">Co-pay / {T('Consumables', 'Consumables')}</dt><dd className="font-bold">{d.cp}% • {d.cons ? T('Covered', 'कवर') : T('NOT covered (~12%)', 'कवर नहीं (~12%)')}</dd></div>
              </dl>
              <div className="mt-4 grid gap-2 text-base">
                <p className="rounded-xl bg-emerald-500/20 p-3 font-semibold">✅ {T('DO: Ask for CASHLESS pre-authorisation • Get a written estimate • Take a room within your limit • Keep ID + insurance card ready', 'करो: CASHLESS pre-authorisation माँगो • लिखित estimate लो • limit के अंदर का room लो • ID + बीमा कार्ड तैयार रखो')}</p>
                <p className="rounded-xl bg-red-600/25 p-3 font-semibold">🚫 {T("DON'T: Accept Deluxe/Suite rooms • Sign blank forms • Pay a big deposit before checking pre-auth", 'मत करो: Deluxe/Suite room • ख़ाली form पर sign • pre-auth देखे बिना बड़ा deposit')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 print:hidden">
              <button onClick={save} className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-slate-950"><Save className="h-5 w-5" />{saved ? T('Saved ✓', 'सेव ✓') : T('Save', 'सेव करो')}</button>
              <button onClick={copy} className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-sky-500 text-sm font-bold text-slate-950"><Copy className="h-5 w-5" />{copied ? T('Copied ✓', 'कॉपी ✓') : 'WhatsApp'}</button>
              <button onClick={() => window.print()} className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-white/10 text-sm font-bold"><Printer className="h-5 w-5" />{T('Print', 'प्रिंट')}</button>
            </div>
            <Glass className="print:hidden"><pre className="whitespace-pre-wrap text-sm text-slate-300">{wa}</pre></Glass>
            <p className="flex items-start gap-2 text-xs text-slate-500 print:hidden"><AlertTriangle className="h-4 w-4 shrink-0" />{T('Guidance only, based on typical plan terms. Always confirm exact limits with your policy wording and the TPA desk.', 'सिर्फ़ मार्गदर्शन, सामान्य शर्तों पर आधारित। सही सीमाएँ अपनी पॉलिसी और TPA desk से पक्की करो।')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
