import { useState } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { Card, Eyebrow, Btn } from "../../components/ui/index.jsx";
import SeanceDetail from "./SeanceDetail.jsx";
import { calc1RM, calcKgFor, catColor as cc, toDateKey } from "../../utils/training.js";
import { ManualRMModal, CreateSeanceModal, EditRecordModal, RMCard, OBJ_TARGET, DEFAULT_TARGET } from "./components/TodayViewModals.jsx";
import RecordDetailPage from "./components/RecordDetailPage.jsx";
import FocusMode from "./FocusMode.jsx";

const DISP = FONT;
const SERIF_F = SERIF;

export default function TodayView(props) {
  const { prog, setProg, calSess, setCalSess, checkedEx, setCheckedEx,
    seance, setSeance, setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
    profil, EX, C: _C, INT, push, setProgView, setTab, premium } = props;

  const [viewSeance,       setViewSeance]       = useState(null);
  const [showManualRM,     setShowManualRM]      = useState(false);
  const [showCreateSeance, setShowCreateSeance]  = useState(false);
  const [tipIdx,             setTipIdx]             = useState(0);
  const [editRecord,       setEditRecord]        = useState(null);
  const [focusActive,      setFocusActive]       = useState(false);

  // ── Sommeil — target + log quotidien ────────────────────────────────────
  const [sleepTarget, setSleepTarget] = useState(() =>
    parseFloat(localStorage.getItem('morpho_sleep_target') || '8')
  );
  const [sleepLog, setSleepLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('morpho_sleep_log') || '{}'); }
    catch { return {}; }
  });
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepInput, setSleepInput]   = useState(null); // valeur en cours d'édition dans la modal

  const saveSleepTarget = (v) => {
    const val = Math.round(v * 2) / 2; // arrondi 0.5
    setSleepTarget(val);
    localStorage.setItem('morpho_sleep_target', String(val));
  };
  const logSleepToday = (h) => {
    const key = new Date().toISOString().split('T')[0];
    const updated = { ...sleepLog, [key]: h };
    setSleepLog(updated);
    localStorage.setItem('morpho_sleep_log', JSON.stringify(updated));
  };
  const todaySleepLogged = sleepLog[new Date().toISOString().split('T')[0]] ?? null;

  // ── Mobilité — done/not-done par jour ───────────────────────────────────
  const [mobiliteLog, setMobiliteLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('morpho_mobilite_log') || '{}'); }
    catch { return {}; }
  });
  const [mobiliteFlash, setMobiliteFlash] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMobilite = mobiliteLog[todayStr] ?? false;

  const toggleMobilite = () => {
    const newVal = !todayMobilite;
    const updated = { ...mobiliteLog, [todayStr]: newVal };
    setMobiliteLog(updated);
    localStorage.setItem('morpho_mobilite_log', JSON.stringify(updated));
    if (newVal) { setMobiliteFlash(true); setTimeout(() => setMobiliteFlash(false), 600); }
  };

  // ── Séance du jour ──────────────────────────────────────────────────────
  const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const today     = new Date();
  const todayKey  = toDateKey(today);
  const todayName = dayNames[today.getDay()];
  const calSeance = calSess?.[todayKey];

  const getTodaySeance = () => {
    if (!prog?.jours) return null;
    if (calSeance?.seanceId) {
      const found = prog.jours.find(j => j.id === calSeance.seanceId);
      if (found) return { ...found, _calKey: todayKey };
    }
    const found = prog.jours.find(j =>
      j.nom?.toLowerCase().includes(todayName.toLowerCase()) ||
      j.focus?.toLowerCase().includes(todayName.toLowerCase())
    );
    return found ? { ...found, _calKey: todayKey } : null;
  };

  // ── Records RM ──────────────────────────────────────────────────────────
  const getRM = () => {
    if (!prog?.jours) return [];
    const map = {};
    const objectif = profil?.objectif || "hypertrophie";
    const target   = OBJ_TARGET[objectif] || DEFAULT_TARGET;

    prog.jours.forEach(j => {
      (j.exercices || []).forEach(ex => {
        if (!ex.historique?.length) return;
        const nom = ex.nom;
        const best = ex.historique.reduce((a, b) =>
          calc1RM(parseFloat(a.poids), parseInt(a.reps)) >=
          calc1RM(parseFloat(b.poids), parseInt(b.reps)) ? a : b
        );
        const rm1    = calc1RM(parseFloat(best.poids), parseInt(best.reps));
        const cible  = calcKgFor(rm1, target.reps);
        const dbEx   = EX ? Object.values(EX).flat().find(e => e.n === nom) : null;
        if (!map[nom] || map[nom].rm1 < rm1) {
          map[nom] = { nom, rm1, cible, best, dbEx, target, historique: ex.historique };
        }
      });
    });

    if (prog.records) {
      Object.entries(prog.records).forEach(([nom, history]) => {
        if (!history?.length) return;
        const best = history.reduce((a, b) =>
          calc1RM(parseFloat(a.poids), parseInt(a.reps)) >=
          calc1RM(parseFloat(b.poids), parseInt(b.reps)) ? a : b
        );
        const rm1   = calc1RM(parseFloat(best.poids), parseInt(best.reps));
        const objectif = profil?.objectif || "hypertrophie";
        const target   = OBJ_TARGET[objectif] || DEFAULT_TARGET;
        const cible = calcKgFor(rm1, target.reps);
        if (!map[nom] || map[nom].rm1 < rm1) {
          map[nom] = { nom, rm1, cible, best, target, historique: history };
        }
      });
    }
    return Object.values(map);
  };

  const toggleCheck = (seanceId, exIdx, repos, calKey) => {
    const key = `${seanceId}-${exIdx}`;
    setCheckedEx(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const REST_TIPS = [
    { icon: "💧", title: "Hydrate-toi bien", desc: "La récupération musculaire dépend de ton hydratation. Vise 2,5L aujourd'hui." },
    { icon: "🥩", title: "Protéines++", desc: "Un apport élevé en protéines aujourd'hui accélère la reconstruction musculaire." },
    { icon: "😴", title: "8h de sommeil", desc: "80% des gains se font la nuit. Dors tôt, ton corps travaille pour toi." },
  ];

  const rmData       = prog ? getRM() : [];

  // Streak d'entraînements consécutifs depuis le log localStorage
  const streak = (() => {
    try {
      const log = JSON.parse(localStorage.getItem('morpho_workout_log') || '{}');
      let count = 0;
      const d = new Date();
      while (count < 365) {
        const key = d.toISOString().split('T')[0];
        if (log[key]) { count++; d.setDate(d.getDate() - 1); }
        else if (count === 0) { d.setDate(d.getDate() - 1); if (count < 1) break; }
        else break;
      }
      return count;
    } catch { return 0; }
  })();
  const objectif     = profil?.objectif || "hypertrophie";
  const currentTarget = OBJ_TARGET[objectif] || DEFAULT_TARGET;

  if (viewSeance) {
    return (
      <SeanceDetail
        seance={viewSeance} onBack={() => setViewSeance(null)}
        prog={prog} setProg={setProg}
        checkedEx={checkedEx} toggleCheck={toggleCheck}
        setChrono={setChrono} setChronoSec={setChronoSec}
        exDetails={exDetails} setExDetails={setExDetails}
        exEdit={exEdit} setExEdit={setExEdit}
        EX={EX} C={C} INT={INT}
        push={push}
      />
    );
  }

  const todaySeance = getTodaySeance();

  // ── Focus Mode (overlay inline, remplace viewSeance) ──────────────────────
  if (focusActive && todaySeance) {
    return (
      <FocusMode
        seance      = {todaySeance}
        checkedEx   = {checkedEx}
        toggleCheck = {toggleCheck}
        prog        = {prog}
        setProg     = {setProg}
        push        = {push}
        C           = {C}
        INT         = {INT}
        EX          = {EX}
        todayKey    = {todayKey}
        premium     = {premium}
        onClose     = {() => setFocusActive(false)}
      />
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 6, marginBottom: 14 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily: SERIF_F, fontSize: 28, color: C.text, lineHeight: 1.1, letterSpacing: -1 }}>
              Séance du <span style={{ fontStyle: "italic", color: C.blue }}>jour</span>
            </div>
            {todaySeance && (
              <div style={{ fontSize:12, color:"#6B7280", fontFamily:DISP, marginTop:4 }}>
                Continue ta progression 💪
              </div>
            )}
          </div>
          {streak > 0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
              background:"rgba(245,158,11,0.10)", border:"1px solid rgba(245,158,11,0.22)",
              borderRadius:14, padding:"8px 12px", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:16 }}>🔥</span>
                <span style={{ fontSize:20, fontWeight:800, color:"#D97706", fontFamily:DISP, lineHeight:1 }}>{streak}</span>
              </div>
              <div style={{ fontSize:9, fontWeight:600, color:"#92400E", fontFamily:DISP,
                letterSpacing:"0.5px", marginTop:2, textAlign:"center" }}>
                série actuelle
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Séance du jour ───────────────────────────────────────── */}
      {todaySeance ? (() => {
        const intData = INT[todaySeance.intensite || "modere"] || INT.modere;
        const total   = todaySeance.exercices?.length || 0;
        const done    = todaySeance.exercices?.filter((_, i) => checkedEx[`${todaySeance.id}-${i}`]).length || 0;
        const pct     = total > 0 ? Math.round(done / total * 100) : 0;

        return (
          <>
            {/* Hero card v3 — mannequin MorphoCoach */}
            {(() => {
              const MANNEQUINS = {
                blue_front: 'data:image/webp;base64,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',
                blue_back:  'data:image/webp;base64,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',
                purple:     'data:image/webp;base64,UklGRowzAABXRUJQVlA4IIAzAADQnwCdASrDAPoAPmEokEUkIqGXy0XoQAYEtAN8DewtYBPI2496/vjH37zf9V3Z3ljvt/9b1if2b1HP650af+R6IPNx/7PrK/vXqI/2r/Letv/4fZu/xv/f9g39wPWj/+ns9/4b/zdQB//8zVan6mfpfzc/xfuW5B+zP6f9Rv5x+E/3X+I9rP+H4I/N/UR9v71bOb6hd9P9v5v/ZT/te4H/M/7X/xPXH/w+JL+X/7XsBf0P/Bf9b/E/md8w+gb9g/3/7Y/Ah+xfWm9F5vVBzQRADLkwRQOIErJJHgSEIqlekS+g/4dvkdlpFS8oy0qVn4R48Ln6EVGxXykWCmVeOW5TEkZZtiJFz7Cra7b+CKhEm7pb44VBsIewIynTbsbXXT/Nf7LWHtW9YdBeKvQz1PjBFCjif0segIXcW8J+/TZJliNHRaLgnV1wAd5nrJhZvtwxAhYxBkxZneT3nqUABP9LXlEBe6AsrDW3MXd5f2c+W9F1hAD5SEa/pBr0sTVFjIPDlGn8STLE4SEWp2FTpCLLgAXLwR0pLv2VRcel8n40xZOTvAOkXXFxSOjsDAf9zSsLTP/abcJ5Ni6Pr6dG2a8F35gUa/UkFgyCdQX7UgDBA7DgLnTrena99U6Rq3TKLyI9XZB8dfkdb1VErW8+HXMM5aYjzxjuZc0hM58V2rakeDId4MvC86rzPjsZnfQEKhSXioxKjJk8Xd1RtNebYNjSCx4iapo9BmrWmT524UqPqKkA4qe7+Kvcs5YXLxlmpqorm6AcuaJA1brR81ZEfXzqcTrtmD6MPyrWkeJLalYVfs9MZFNQP2guAB2jAqg0fiFe1PrqchsghnjoRq6xqAv21ubL23SGxID3MUYZrW3ZpDwqEz6gVbVtmg1EFif4yj40bdl1xSvrrDNDHSmBCqOeb07TH8FdtX/DqOa+E8pPQZVjhFlT0KwQhKdbTKkZyHF+IPGM8a/5u2p3RDAJrH3JiLawxexcrQ3wpb9n4yYz2opb4VZ0T/7+srlTrpbVYyUppUMesoZMW18hUJDUYf3sGeZT7p54edQxH9Hm2BYFLN6CvAOJ/yQQO++YUo1gOd5LaofHFh1IaghtPtQUk80yzzPz7wyVbG/GEMqMQWA2RpDpaKz6htUoOYhNYW1g3P1Yimmqa+5T1uEP8JAhETScJ7Ybon4Fl7TKBAgFA8ZfXv+IjukdOOiKY+kRFP7+a6b9OsOVdmUEn8YNldjYKyOzW6TJRN0amQUMQeFyzh/UVSYeHesmsTmORr72vaSsvDe6IyhViX1KcuG6P2i/FshB9G1VQqHY3McUO3JAc/bgaaZK44mso0fa68nCjYrauGZ4MNxKo5C7q+tHZga0UtHWNFcByHYTrbyx72+YO2343JkD2PnFp/qIu2YoczHIYsyj0HiFobOsne2bY2B3bwSY3Y0xywVV4fVH6fbgXJdTXJZ8fFEvn2O3THi99DiRIU6QEB8vHtRNxIprb7O8Lm4Z9NwoUp3NM5azzgIgb1CLPDYuFBsoEPprllKkKTOUgeNiuaB0j8FYGa3IamlmNt0rqHUqUesk6iMrm+AVE25GsEN4rrOxgXgErgi15a6kUt8ULWIkqgByBxVPGRsSYbxYeRhQFWVZ5E0gFa04K7C38DIIg6XqMI1UuzidiALwQ1hoHOZQKNWxMoIAGkc+6TqB3wwC94SCl8hBEVQsTt6QX3UppxU/gAAA/v7MlkZYjXnVwmsRAd0Py0vBV1IIZ9S4+dhtjtMBfsPGpq1FC1/ylXYnaqZsS52gnm8X/mk5zWLlnKAZp0DdhoFj/y1lR5Mh/aqPmSUg/bx2u30vydwrxZe13VQqLurMA7SMlfwbpOFB/Q6bfeznXW/EoBzrECvvac0JTqWMGIFNJC7sUYFb++NpUFgcs+0VrpFYEeMmgfSwMqs2QxSPXHhfPC9t9u/rNXQGo+BHuicusv+yPuEpIXh81YNGhuN9iCqWC6EG2D40b425sG8/lfI2a/jpgq3/mv42veWxJ7wvb9wg0koY26Crs3pkYKf4Awq75LxiTJ6wZA30qBJ1DaGY7NH5iL1IE/sq5lDK0TAbxXwHNYhd6kMyNGOwWjOom7717zJoBkVDqn+sHaklhHrrKhw04haDSlq8cZIYQYdnIZV+HUjkYW8fssSaGBayk0fN0wfJZp1uZCAb8gG+BDc1TEzEXQuBOySUNxCE0CQg0d7K6WqjaYzir2375sdPS4LhNFWfcaNkUVELx/iJYKec478PavvEVL/8PMxDkgAsMshAKOet6meAFY57dF3hp+QSMVnalBQL78iVpCNDebI3ZT8HtPWPcSk+CoD0nWsLqBjJUDLBcWr1C5hMOTjJ2Zgx2cPIOUDI8E9AKHWihvMFi579pkva7quOwSyQBehhutgyBn0C6/MCM3qyDCR/faaHbnDylkhJuKvN/e/QzqSk3FpRFaDK/fDgtwIh1fuPRTLm9GcJwe8yo6TkVrFIZQmD93eyz/mLFJGf1YuWluHlD2T7NRxI/5oq0T27/fLlGGQ/7K+FbgFPzp2QfHh3oJ0mTST03US7gWoSpyh80g/fGVCx/El1s6pBTfmmxwog91M2wMrc63Wmt6JsAaiWOdCYjANymC3y4OUWxple1Uwmea6KE/L4DVkiaNAoavFSpOK/PP7O8wCXyBV9/PKWJIL5qvKewzjAa7nDNO4JAyT94uAifzhu7O3axp9jdylxzEZXkcVO11Ish9dZRHLdsEMDv9RuDEbO0lSA+U2yYmq1AtPTe/C9yXLszqrsCYEIve8r5SQVQ1kMw9l5Q43/nKWudj16FfxZD3Yb1ckOtW6+Kx/vetgIZFmpe7zAsMl3jMU9e3SNcDoV+S/008orwZSKQrQgyiHvcre6UxhurpHRN/vagukDcVnrunKCxrb8oNIhfuptc2YL7MN1hrjyGN34Z++NgwbvN65wLZfkLFyUSIwm39WlsDiJgA27njr7F0Wdp/W4eOoG3uQHIrnothztEBN3+KihsaX0dBOuTKaCEbdn92XclAHAKEDOn23WvksrWaieiQ+LCp0LQDV9ZRosy6UgKonCqFCD0Op44HG/QSfjmL38eyDO7Snr5B3r2g598ISQlRh46/OjBV96By2uGjrx1QYCjaBBBU3FB6GWcnGeIIRss0ufvuTLI9ftjR8hhpZa1fnVp1sqM1+BGrc3Sm5Xc4GRiHOHFLlLm6dtGmpfgWgH2kfjxdbOWB9KEzPdTzLpi7LDtWRnrszYOKN4fMqf0CaoDbsZP8QaUdmbtrDpANcwvKA1ENJXif4sRM3nCzcyY8WFwf/F9LCTLNiytfCOggnX0Y5G9pnbhM8+ciYbvAvR2UgY3DlQ+RNBCaZU4WoWYB3T/+H4e1VD9R8Iqd4M5+CJ6+xW4PpFhK5K/VDYH+Yx5Kehdt7ffsKHgXNkON0sTFtoq3r4qtv/0aggBEq/jEpgZnUjt+l7ij43lg1Vz1zhiy3Oj0D3fQCTlfXgNMcF5VL3S12+ydlxB3V8D9WdJiYrFXDG/eoXo/V0BjLhrcXc5nVs/fQpvEfoktqUgzzV7BH26nbzDTL8WYCIFD9iLmC0RHV1D3p2ezpYmQiH8fZ/Zr+donfxiQx9Assvy0YZ0XK/O9fhW+8jsJCmM19o418SYHitqYu3wkdFkcrVrxD6xw4g17aRfO7ahSxp80Vc5gJY+xZs3hVJCZOki/6qdR+RBFO3LpHlq/n1ePackD+ugnZu0VJ4IinOMHd3dXMG6/JPKzQMk97m0R0HFHGX2fHDm4Cvs6ZDR0BUclWI46l3zBnjnu8DNSvfN5fXtZstH3nnsby2l8e9yTfdHUeKwD2IgEZQ6pCT0wuT2A+EzPHD3WUBA1DE7Ddes9OtbF+kDHcKChVG7rgKZz+/3FZDrv1fB6eQ8NwODZiRF018RphbSx+4seaRUSvrr4bcSVTJdLDmmvuCl5qx7hT+XZx/boOtxMFi4XvC808VXVier7ZSywDTVzxMQyfzpacNNHmRY8F+8g2ygbspqRH26PtrfwuWL2iD0iA0Nox+dKlxRipQYMJNnfiLlZ6dKL9RkWjy+KSkWK79jV5VTLf7On/aw42cr9IAnfGPpHt1sZWdUdmavhjod/IaaXhy3dlJRRj4XV37jbAULuP7UCCx8OXjtBqDn0fIpMgyDzOCU63oSroNYezA837ZKFhhhlxnIujw3AVneYJRz5jPPaX5r2pMMi1rHIzWMA07zaW4jrgGEd1YUPzy5eHY+GhkQIYdKy+cXIQguGQPYhEzurng3baFwDJHhXwSLMcjiZvlxxU6AHLkk7QKqI/wMtdg5jotJKqWtJQ0hdCEntJlHzOesQj7b0zL6xtF2ZqKgGf4Pfgq7lxLcrYoq1hoNZrNdpE/XNRc9wEJdW7xAsZC3J1zcajbRSB60DOD3nxA27kVHOHaNaVvPmTJPdorz0ih2JcvNPhJVmw4rDvTwH+XqoaqOV039ubEZub3HFM2n1R3CQ/125Kk9r27VGuAqNUMvp4u8kNY1RBvxpX/iAbC8ASOIWBPDK5s8Tev1BXj/w3Hwg8l+n6AkWiXqdLtCZCd6Fb1JHGR/hJcgJmqzkwKegPfT/8RiYGjeNfRxvRCbcMfMdUW5OtPDBwBh8GNfymiJqiZBTmy5kebKrfNqLLh5YaPUgSrulv2ptu+eG9Y/EPj+V4HRB0nJD72kTb+ZxMqvdogm/OXfzfees3cT3P3QwYzlDqM2b8wxfrHqE/FHqbHraF4EdI9RdMwOBNTCcYiUqCJb7zA36cRfnAU3exLR8C5ucSLIZ0UgGuCdqzJQBOde27/a0Im8GHqihKxUNuv8sByzRIUCv8QSIEF2wSpglfg7qLEIldbzbFTjajxw72MX3P3KVVIWxxn43OY0x4u285GRNFsp5w9zFZxok1Qek1ko4q7pTeOyD6sJ3NCAdJ3D+BOEMQ0jCARmO0ScqduCTtoI+dI2NTi2Y6w8ffVsDmFGdTwJGy+U+SnTuJD9w1wlzmFkldCx4jUmr/gK9S2KeKL/mH+CDNkMjlKBCbc2Xk/2GlVg3Sa5pZI/36AMD/a+tgG0VbIm7dFKDmf25e77BAIXsg8q7Vh9Kk+dw63H/lQn/K+8TKOD1p5X4QgBrqCGxkvmZd7PezXgh3qJQaaP4hm9v+HvzL9tLPzPGfRZPUhjFqrqF53NHVnEBCaZxMmU+kpJJLBgt7OVy5nO6pWCOx0FKBu/2iG4LWGD4rxorSPXjawJhyd57c5zxPne3N5VsdN79rMdR16/Ic77+aZfjomwBdTfItfZDQ3Y964UOPgoOj3mAhYPeLY+NsbKC+ldjErfIXB+UqQNCs9w+itFXtu525VkqK0XZgP4xdXkx5iErqJYz/Qzv8cnomkYgoGPs1YE1jvjZcbrlC/KN0PWhUBLNmLBIBG04bn3q4NT3CLpPjlb9hHalXCQMoNMlPlRHG3ulQfGZrJmGEqqxTnTNqrFzprVsyT7SYr3HLaVLOlesqPTgXkocegf6122RaoGm3GwDBhxiPS9JKFI10yFgmkYz37bf/GstQylEPbHbxq3JwxQQQkwHaQp+wwNJgd9O3sPe5oz9WDCjQH9mCDeQsWiCnhCAfIzdnn2NO8OVfrcyG+Qge6pmSoY38INGuRFNFrYVzWOlmkiRKXn5Wa4EaMr36vD1xe0PydH47oE+9lkAiNFAY+cZ+oq170tIsz8R7/uUTT5h6bBwCGHrk1UGzZ0CEGiuq0hHosouBSA6nnfpu372c27+eAvlccdrU+XkIPzMRcrhAEUHmGRdquzgtclbMtpAg9cs8rl4pbbM7ejqP8byODM4oQv0gExiVBwuF7/TIzKFiFCXcekmTTfQKC8DGOYHA8M1KQctmED6uww6NvsZ1ZUcQy4dyx/4x3rW4NT8Ept/Or9bpFnUvRrRG1COmHZ8Nt0L2/IOCUs5hwtUuv8nhmEq3bdmehx7mCZKmACYolytYF2jtFaMLum5jmJR6Yk374I3jRVkRz/ETxxgK1EmdczGOlFZiCLUuToBQeG3rwRZo3bpfwDJx/doCPOZaNPEaEX1IwxcILjGHForARZ7WP4Oli5FWiDpbhLmjYGAVRAKmB6A7mTl7LnVnSOPNwHami338D+yJVoAH+9LF4DvWqinRCMZf/eysKxGE9bv5sK0pTpnmxH1EY9p+m7y0n8I6fG9gA+KNRhLE/oIpJTsksos8sUO++pojuAz7AhIO5yRUuSFhnCjxbaj4M2leFP6TU6kBlrHuMhpWtt1dRuGRmXTcnYFf73s3u7StH7iG35le/lwz6UthNXKZFesIxJcsObELAZcdVx4d68ereE9SB24VpAFDxvcoJftPHYPoAoy64d1jMMs0X5GX0obEODjvDOiUEY/003xRwUqqBrmXM42Ea7MqvJd4J/4XMDY2tXvKT2NsKstTnoAoVue7PAWUVEFOCGCO5ZRV4y9Mnh3gT7QBy6SRWJBp8BH0O3L/IswCdkYDiX4kKiKleNu15VmIBB+7cThqohDjCufiy6gXBEa2zAK2Jas2GWfxLQVyOQt1A69WrzfE94s9yffLoWxagd1Xo+dO/ulucwuKtfkL0sDEA53AQpYVal8J7YiplUvTW1XdBi8s1oK/gjx+cLg42t5MILVopRTlM9EJo/HfNWWX2RaPjOuNmBm0U9t+WKojl06hHtnj5UhD3KH92FMuP3nWO05/WRz5QGeJDjhwaHz9tOf+9R+WGnDLO9NNYJTVHeOC/mMOzeLKq7Weq8DJXPWM6qe6JFwv0+IMrX4ei0Rv+XzzRH/1v/uKrD7HVAq16qv6qkqrpy1M3r1+aslfeTAnRWUeO9XKq59UA68sXi62bf09zzip8GhR50mN4nWppLSzrlwEZayJdtCTP41/bjI6fkzxyOuwKnjWMgbA5lNcRM+cT/b/MOKwGskQKTvnUJ+GANihG3NQBwvIWHS621Mm4KrA5chFVNd7EUIkSvDPPg/grp4txgYqABtCf7UnFQKFPnOvTKjkKLNL1xNjmGAMmqPtfsKcZOLqkET7TWH7GM0/V1BEWBPCuwcxeDlj1m6LUb8WEQ5CDkXVOWf9CJNbhO6CLRtYeyW6xq/Q788RO+ligi4ltXUdQRlkhWzRhkZdjPXR3LBvN11V6Pf6sw2cEQ/jH/bqMrw7rSpnbaPwWQZXsU80PLouSIfG0b3NHCEsD7qJFgBtAPLJ8RvH2MWF9qnRldKG3HrWQuzSQuBTmPfvp/aEIq4TDQhRRnH8V5SNpaCUZkaNPtAVrNffn15i6qPMy5rgaOb7FPn2mcAt7dbES20se04kQQRrdgHeEkpa3+8GcReM7DGK/Nn/B98Hbw2jVp/OugLK0Jk53EC2cNUMDeFCqYCaVNsvsMJoZKumVhGLbxRYq3k/Wsq2S5hejbZO4mHlvBnjVdIO+jaL84x7fSmm1pmW+Oil/jNmov4PN7QT9hvZ702zpZs+uxd9dOYNPPwu6AmatzIGv4vev8qDnhjD0fD2E6Ak1LvDHSPA7oVECXID48BYEeXKEKTZ9bCH0O75wD51Y8OgX9vRA08a1gQd7xfms8DJ39YMPlExc4HZhwpilEUZv+k7ZJpS3wryEIF01YUbRLgZCaeo7SnTtCOyNMl9v6f1+nu6QPtZDFjxNw4wqKdQ6xKIEpelvP5L41O7cexvIyc2BQ6HPcAoyFgelp18AWqxs27k/Yw6r8PYyOSh1ZbpUTQ0wsPhmiKREcFutorfcx2Uh1ivNzirwUkokIPawHpPAcQeIhNExi1VeHENc5RLCOZNMSL1YHb0IRonigVCe1bUeRmIu0eaDQHa4lQA+1ENqgnI7ngztnA0Snw3hZNPsUCQF5NkPxpHw8R5CKNaAMHve4LHXBBVj6QH+didOIEAeyOI5WwHEaBaODnvg6cARkVwpzW9kx7Z1R3FQ5dl7ZWPM8V4yEGruMrjbaNzWLyjxZxxaPH9K2XWi1q5MeNroCg9LrVA5d+eRG8EOu3vUMeU9vPYehvJk8Ltx4jTF8LOjxOEOpXtGDttp+ntRGmdFfk4Q/dnd7AVaduMhPWrQdz1mvCsj/fSkyHjR+lRmo1wHqYjEMIG215F8W8ze2Z1UOVf4vt1442cRJl5z2Dcietfqr5ZR101WwhfsucVdXZM+dzrNFW7KbJam7sERB/UP2fY5i4eZWe2kICfwW9dd/37rCLwXjb9z7NO7VkbHBkxcR32Cs8bdNDne4n+hiy7aCI0xVDuGwhtW/znFWKwReoVckzTT5mhstBr8+qbMa/q6vAMzSw/FJ+X8WGLpqOMx5BN2nEk/J5BYFTFNx3mKDzSx9H9CgYMLQ1JuqdyG2cz87jiXJZAUaa2wzK5eZ95vbjLMd7ciG8vJuU8qpREOEi7gv0Y/bK3Jk/H5eacuJolIdRLO3tP+i4hoaP3R8OFR65FI00Ed/YWiWdFuHFEfT+5gpBHMK4pVvi/Pa3ecvyceGqem+efjqc7yZrWSSuUbqZhmCzl6krSI7drhyq4V1YsSsuhjJHaVebQbbhQ/btaG3zhsPeP+SD3Zv4r6ZT1vq2YKeEhnf74qpmFRn/+sghi/qu6wCu1ETJknTbWXou1xikLZi0OVF1Vrw/tSDggcbnxPYKPr5MBh4IbsTIElgoYC7+FBlmkN84Jzr75O8eMzGPUKkcFcYB0Hc/oZrtZQ9MMQ6Wpop1ChiAZdmuAfpI+3e845ZhqO06/PKoJUBkglV0dqtKn5VrlD+u1d3TtVouvZh/oAU5l1Dn+PJHAzF2iNaIqYFnerdkJsGXkktQWRxgQzmNMsiXFX9Hb5shp0aqtIPgeuBr73Y5ee0WO4YkOxOGh7Cx3PM1rXXj12LLH+7BQCjl41GeaSlcOJswjSI+7YiAOkMsTHtxvLH9jM3Cf0wcvImLIqoEd8BoUsgIbdzC4MJk8oGn/yuy3n8hlZrTgyy14hk8dii/E92n5iB2tJq+4bSPa4rROoC/ugDTAkMtpYJOo2lPiUDacuVRl/p/U70pCT+J2hBdPgMt9cy5Z8nMgu0MmTmDmbnzuBCVLQTJRGEXNh7ro8+Ouz22rg/zv+/NXZmJMJ8W49No2On/Nwm+DOtJOwqod+kwYn4iP0QYBxlp6mJHHtWW3lzZFirk3/dYz82jXPPtaSgo2RSloHb9mzHwwy6QOCUJSWhvzvnTWlJErnXlxdfRBcYVTxJ2efvvdx/SGWHStxaEsNwXPeUAIB6zPtyFShLpGJZTYTEm0jEFs+yocqc5S/bhGomg0m/O/dgqda4MYeNMux+WorPh3spmG5ETv2etFN2tQ6K8kVBC1l+XKfXMg/DITOLLB6rQHt2IqnJ0qy5sPMok4XdsFkb5N/v2Qq2RMlnVOo2J1Pbyoz04MxawcBqoKVROI0oYe1zVgc5cSo2M5osHMwtLnDbztMRYbU9P4lNVKKzWVctvclmKIxqQJiLFz2ZkmTbtrzGxuI0xZ3AQo0Hr1MSxTkWahLXq7Pou0pYElpLfgMNSU9XQehC+xYqE/9BOXyRHqDYVyyVBQhRBddZVjR/rot+wO8OxlWsFcyHgrr956mGF3KKFdVRhSIwvtop0r7vNz6k4o6llRAJN71fF1xZac+oAx6kso5vE//1JCA6hKVXoAUw2h//DWsh47A86MfcfOWS+phCCD8pvOAUHuWYv1leqdPNuKH5C8QCUpcsWvQdSEwynUBoP3lwwgmZ8ZtnmvdA+4qQ5pPyK0DccAlTeatCq89x7EnMiPkuf2RFsajixgFuUSxe0TC9sVkKvNfXqOPdXloVZ3zGKHRLocAZZKWyN43aeBmKt8dOGF7VVfhIykfcscnCQd7VDV0pM4CNyzn3Pxmo5WfESsonOADvUUnh46z1+DzUsLlSVxs3aFzRGjcFNRQx4H/wa2EoxMaaGhWseMkSlzgejcSZlXMjuH1WrDRSAOAPFCgw8vLyLMeKck6egD5/9n7mYVyZGv9hYqV2QF7CjH+/RFE0gGynpij6Ocaz4W1CPvUH77lgqgxV2yBz1/llpKLlr01rkzLUjiGuVJQseWi6Js00HzKDWtmxDnWLSUXJeK9dT74luSbic+4/PRYb1pNgBC84DfueLlXGX6YQKKMIZHuug3QddVwieuiz5Z4wC1H/jOKcXsIqii7YKlTIGpPhEBKay//SqAmsKX9kq/oElo+Zs+XLSjnS5s8wejgLztc9f20Wyz1fWT295MYcSP7N0w8ku3C5sB6a/d+Z71S8+gcaZUBgl7gWyuuGCCM1xScMlw5j5vw1h/r7ufAuD2ynRnGJtTS4OHgfnjSSK3DObx0SaaTkeNZHWH1W5tXKWMqQhQ+qUhKymNJpH7j7Z+cNRyFZXBkJ2Ls4Iqe5D3PnEFgtzRWEm1V9VVf2dP3ReeGjTyo8rumKoyaSuYw9aGZBBIzttb+VIivG0L3AT7gQeeC4fFdRzyPPoaoco3viW5kPgS3kSlXCtGZDmASBGR4ljsA5sz1zMW8G6IeG0XAQkWrn6nUBkQi41ha1DYxb3K4eJlcyafTk7JXV5SpkfYYn9FDJ9/LmnSfH9N8uZgTNlea9hieScVYXri45bpbreKW1zcIPh1b7H9Ic+ZxInstnvUwrT1nf+kOx3Z4BOCUSi395okEAmXzmeWYa4DlQaT6vzKVc2JnIIn7euA76xhVSbIgcHBJizQB5Onwm4faLle3aQADvKYKYJQ8IYKBqXcKg/s0ZTlJLS09MbJiFbqdhZ4gMgAUPv7iUg4vceOqJnxvp3tRYAK2/6UzS1tVuUlv4HjeroGssi5zkJPwsFDLpv+uoqi79vEqR1eSOwFigXbDDN6ZD9MLqe1BaYKrAQVFdh6SjrhhebbK80mdESebP6nu4nKNAKLX0WViV/Sn4DgDbWLsgQRTXOOMijUPL4G/iI0yh8B/9lm1Zvkweyb428xbSearr6wqJzXbMljZh7l5y10kktbl5V+u8wwTFN527HkLBliTXfiYqEWDVGzuLnzChvPFlcRqhumGgSP3mKmO2lACNAukeStj3V+LS2Kne3Km8AbzjwMsmkiuEQoJyDe7GCnB86gvwAB2yxNT2Ym66GA6l9FJ+bS1C5d/QADi1Tt68zNLaX61AoVHJghikbXqo8m6kz+Z8sq6FRmBTP05S4ne+YWxbox10YCEwOk1VU6E4QWzqvGEWokKKybvIso50YJsUrZNhpzgEz1IUkNd6lxHBoCPehQ+cO4NdCVM5XaS5itHVACaR0Tk78AB861p3YgeYGkqBzZ57ePacnkaP3KwZDovfzdJuhvzv5Wl2Hxqy8EUQKNlZdk9+Yyd2zW1pj9hK7uRnA5HX3pD8PBqwQeLnKsF0xxSFX7I6mgc4pyQYOGQchXBlZ1Lh3kYW/9rLanEevMltcyZD3yJ94hlfJCpS5Tz5XMNkaFC91WdDzf2Tc9winr8YOeqcU4aouJWQBdp26qAOZ0ojjxptFdOUnfoioN/9pItWmSG6l8y49pTddZn/fz718jTaxnUeRQyqyzm6X6J57ufXI/TITfqGzpGpMy0iJIuXMLMk1yChnESXCgQ8OgT2Iv/tTeOBs25c2CREx+FHuMJYcWBwNt5F4J8xn3Vih+K7RmXO79AqgSybRIs1FBLm5rJkuyYsw7Xp4C7PxxTKQMh/Xj0sMru8vtqEYhW735/mOHpbW/5e2MI8tvkK+yxP1c6FkwYp1oyxu9eo7nMYUz2jN/8hzk6GJuMDBlGpwDgCGagdbEvC0edutv50G2JS48lgLa53+4c4FdlY8eAyKjSD9ujnIVgMMCcjoXo423QqJuVoqtv6hbkw2KGQpm2l6iyYtUHczsz9gnCwR87XLVOJvs5/B5H/1Wgkr0InnaBrMbuRMK3Ix6wGMrUw5+xiBniK2YwlVvQG9vdLJslopeeLuQRqifXoD8N2CPx0qhSJ1ctOqsL4d0LOuEK+6Nkd6R3N4pR6bYuXDQZOR0VPQ1w9Zs99feWKlztLUAIEt+fQ7Z3it80f7erR5U4Ch+fd93tMP30S7P19rYwZnoyAj8Lt2PE6nKvXT+NpoZ2+3hrsUlqz+vCLc35m6rRfHjWt8e8f1aEqsIGziVagGG4NDOQJhYpfhqeX1qUTsPH8/eItaRSNayxLig5x/PZd5p53QinCY41kOPtD/HDw5XGSUhrrCDtgyNHT6jw4JTPJ6oMEdypLbOIpBMRqoIjOxhPXeK1F7N+m2jucesOh4Pl+oRZwVuJP/4ylCmaQgZ0Gfc4zxp3hAoWoofob0hOw0vexqStz6QB8P+1PuvNFbHRfq/moKU3EhHGdDwapRIpcyaY4ufrzsBdoy8I86UIwg8IuOC33ORndwm6xs8ZgzgmFuXaf+SxS8timsNU9s3h6XrZ7gqqcm+5ydP3qBf/aZCEIFptVKVnT9/HVpNznUDRstIqgwRanzzNusasU+YqxHpXWTpOUyFOK/jmcyQSpXWYOmahyiqf7oHUDhoKxhMHYi6YTK/J/bvEblD+MduE9LfZwH8WkGXfRFUppiA5sK8q3n6TMYga/OqVyMAR+pPIrs3F8ELhsy7Gwb4mopPI1e3HCVCy1shSU2MLWQHa+zKyIrT6WMpDqvX3eVZ9sqbwyKglooqwY5iHgaLjyJfuESmspv2qlQy+fYQMmUufmMieZMXrsRjU4PEJRwObp5EvNOkbpckjhGpMVcFyQ3E2TDAc1EETLyHwSFkvAbKS+9YK50Z/WpLP+hb2sd1KNyMgFXybAJU0lkcLT2sni4J/x8mfdDaH+cZ5DGjRIhQ+sueb4fVWO2NVyMTLEJolyjpnNg3yY6bs2HC6a08TJUdO8kLl7tz+EmIRMONtpkh6MtaZUZouVbAR4plYF1PxnBqCKIloqim75JfvKmqY+nRSsx1JT5PMwosw7cWV019uh7NoW6WWU6LKgvqmlDAdiUlDbUc0qPOZHdBtN79kpIocHbfZ9/Yj5OUcFn+GJ9wRw2Haf+81AOXnx1zhZ9pqGNCXvnNkRRKaHUXSHsStgV7HRoXVJwvt1lAkFjmzjWzKY+02gV6yj6QcHwZTZbEE/Q0BCHDJlryAsov+rIFLmojdejndoXyCS4fw7GrIG4rSIulbYeQjjQB67PB+k2HkLWo7h7xUynhEMs1gpjnLGa2PHx4hs74lXji2/37Zi9+o8d/LcnLbKE2y5ILvQiweoxnCPAqyfepMcKyHVWnjOQm3+GZLEG6pDTYAvIeMz2kVHaf1ZU/B4Jpn/RBw+xprbk8S5AK9PBAtnbjsgmN9sOM3k6C0AoBG9dTDeG7OWM4AMYqtlNtCdCqp1imAY59K3kYycuNlvn5zdykiZs70O47HcIkBNv0HGG2TRFSSWji7jrgxpSDssnQHAI2GUcyor1iHa07kXrT6RH1R2/S2AIa5J7jaovkwqLLGS9H9uOeIbgvJY6NKkH7X8tv9FUu9jPOwMy3VA/AmLtdJIm66xcJIr6juxwLft6ZEucRvhhtTkFSLH0KsI6LG3BrmBOPRl3jzF2He6ZtGCPR7AGQpLPafGYTOv7mV5/rY4V/JElfLKGTRGALd+1BjiJfm3mReaaS/Vuv/MO9iA9IH0UVmYM2KmQexud4ZbvSBKTWWGHAGeBfQiyn+pWN+3iHHi/CJEo4EU/GOwKatPL2pnrH+H93sa4bxVKvARuy4o0olKhRHZ7TrNjysfGMvg4sCf35gMiw/djYMmHHXL+/9MFaOr503vY07GDRC+FXz2bJi9ATMpszMD6hek7FGO/dk5s2eEZ/nocPUzW/HcUVEcx6sWOQUALfB5XKxAd3g7GF1bzdHGJMgNAEtI0Sly20c9Wr0xYVZDm818bGjXCF+4GjdNwm3OOLaMLVc/EbhsfzJ1VmmS9FaMVGR62dFH82sFBWiGhmtV5vr5RdWqsFRYuZ2iBPsqWtxh19UweUSQfhZh8mTQzgsq4AP4VIP+D8FmeGoqE/o4a8VN1876bdQ1GwCC/BqClOuFgLXaMvlzNfgzjKxhqy6ArkR9Y3MvfiYyJ33mHBOwsvhuLcEShTs1iMMBkt6WDHeTOLR3ZGy3YjLcrX1tgh9yQHKyIYpclDcsDXVf3OwDeSfsjvD3NTwu3VQeI/OwEo0+n4QehKjg306FoB+yHkpc9TLMBv7XrCEykm6WYPR8hdGQeri0PId6EoVqWaYPksVWaOlbUoMq+NFuQpMdTn8LIOmv8x/nwmaAX3nVyaUnWatDF87AtXpUxnRuJpYKQoDg0dzqWjVcckw6a2+40r7JfzqjF3y9xzW7CRcZZbdfGyBfvycJ4oDFUkxJ/T8tn2U/JbRea+9/hfJuyx5HPzY5tR8C+H4+jOBAvTGvJIK5/65xYM4pee4tSRmVTbDK3v82TO48J97pvcjBR8dz6rSFxDFB59IdlD9FHgn2xsCTlu/ojHDmpsptJbv3I5IZeJShjwNU1SabbwKpt7ONUb1j0tF9JOvvbtkj9vAT0z9pRb6aDbVtcy3DUETj8JCk4XKhHxjJvITUmVG8SrlXW1SxGErG7/dgweGI9UKJgPozUcU8G95ojBSs+AwyAVlyPcHmIqei2NBL2TwCqLVVeFRivSkprQCSwxYAR3p6Dbl+5RaDEAZcn02jgg3jxSh76YdXimOMM/1mIC3nl6hWWcsyuD/bsXBQn4b/P+MqxpwJPucYXyJrPazbZ+gBQgIrm6G1Fdx1Aoi9BiA7ufqXgdSLakd7FoPPTfdVSekGPj3cJ8poJlN5e17U45IgHQ8fmOqnVqIEEqX+N4mL2cNd2BCWPlqqJIET1kRvxfoEeLKa84akXoiOz4VXLDEQj59Z5YSvDczg6TJVWYMDgYBeIJI/mtTic7wSp0siqxgXHvSvkqxzpPtr0GaHM9NKhHZBIuOAZ9fhzCVhyaPTe5Pgd26bReCR2o2Qs4/KAo1rbGtSxRLX01lgwRKAxpj4mPc4lFiW+vLuX18nFZLWa6mvcayM6nZSkXNzgk0+rcrnGtmcCMN0aDHD2/JVXb+q42ALfVz2KTmJrH7HpyaBlTJNQDzjAOIegMSoOkOL1E8eYtOa8qpj0/azo4Lvj3lnqfr4rlT5jUnp6l+ANIpt1GwsK5594PfECsZyZSJn1QpRvNWaEefmfzHphgiEFPMQkyQIy2qEv2HlyblMObi7LygUVirLfxqujCpPa1k16VypEql1Iogjqji3CIbOjNO90kRqCEGWscbDBDJ6ps55pFerpUbAEgtgIqRuukaaDRLJwWFGvVnhZEudZm3qZFcbVo02r/iEOK9k0Bu9oK/MSO2WQVQp5CaPTepEJe9Pv04kRo2tZgoz+vgnivYz0HI9d8jzB/GAkpuy0QgLcLA0mIZrH9fbjWHY5WI2iAuKtb1XBkA8ZYbq1n9XllJqLc2fg7WQVzZYTaidSAjyvcTiMbW1ShfaKmmwDBvVQGJ0yHwkJ8B+iOscSxq0r2Yfg6jDmyNxFU4Ne9Tamp9iJbbv0ifBoWXpuzjJ/J8Nj7CeEwcxpeXeajjDjbpfzPzlCmOJF7h6d58k0qNynhdv1razbKQxXQtKpLnoP5QZpgn4EQSedGAWhQX/EV6mIW+ty0BxJx/b+s3XnECg0ZD1pL+lcTXvmsiZaowAlMi+wn6rspEMX3uv4BY06m0Yf86IMgJTBpFW6P6LZazDPkuBazbb7QHKNKgnjgkJWsHuGKbCBr0muuVjK5C1O9adD6I07yDfGY79rlecRWRd2bwQFLEzeT8liBCcCN3SShBXU4E7OXo0nltwOYPkXcNPA2BHJiwgG131vlAXEC1rENQfmWBZNAVIWiACGpIyUZOcNUTSXzZaMg6esBIiIdjaEWbo8TEFeR6sMrUUQVunEos4qmXnpqt0WBRmAjv+CL6pFNhn/qjZ8mpOjqI+PMFr1JozFZAXc1+vIFbHoIR2HZePRvYL9XKw5OQ+Flwu2DJ4w3SueoeH94r67ESue6EwBGB10BaemHU+3ax7lu4pMvZ1bm5VkAmEFiz1+e/+C2zH8l0aMn1xHwxyu5kQhiaLuEgxdW0+5o/7W53yNH+41qVzLJOMbS5hmJ29V6GyWFIEavag6iQEJgqhaaSAiabAi1vb9s5Fh6oyOZev2UJVqAGNwbpK5fedQiGf5XEBwgtQWPT5D7IHJzNEdes9sKbETzavrs07wuLz0NTmVCK9rCYTHCco3uuh0k4PVgiwPlvleDKNBzsW6ku7E0krEFdqeENGta+IqV4ON1cSLxjr+RF/HdkgPaHKNoOtdc7SWCGwxx5DwxX/n+EEhbHNuWE9Iw9jLniVpCZkM3xSLQbJBe6/byRV4GR50KHD00C+L0YDf8fSl6568LjMqjLL6nAPsTlDbzHUiEj0MAbWeYKUoa7wpdn6yDbmj+YtLuA/KBb/1mG2XMXL89e4sL84B100jv8ThMvzdIJCzS4NmyeOV9mGrpc2YY60F4Lzs/VapBRn5j1netOzX2Sg7h4eirjcTDNA2K0dfdwgDES37NwFC+JZPWJVzGD9Y/e4mS0wfzmlAQBCvDfR3MyB2fjQ6BN3LenmZDDKoocOIp+MiBzVokXSTxE7+K6XxVuHQ8gnbCH2KxyqxT97P4a9nwSwjIn46u/sCYnUGoBn9mzXguIPIeXIom1mlL3fdkYnbC5aeVS69ziORegH58qjGhfPJS0zYzJQwrvXfa4qwOIAcKNGzQr9bHdBBT2qdrnHKAbMlOs5dAU5iaxbl6RD3k4BuXAe/x8yhUj5QchRoMje87TPppdhuEXTFkwDiBgnoviESQTWnSjSbw+5CiuSC3abg2JiSZPfj2B0bWdOMahtKGcbfz7NAeGA0vGoU9t2wuMn0maAUyQ7LWpXN4WR+sTUe74CfgkMMlUGAWXWKySU/+qxVb4kGx3mJOmTrqACUngjTI6KGlQTPFflHVQWONVK35K0MQDZKuSY1RKYkVmx/vt1CkhibbT7Xalt2YMyxMb4YHC47BG4WVsNkDu8FTVpSgI7FUpxoRpMO/11Bgx+qi/1LZIi2hUTc9Kiq9B0vlOX51BZeka6uVswuszQnBJJaiYSJ5Kp/Z5gsTdFvj7vwI4umF3ku2YyPweGJ7f66QzkOqxGrryBhq/l1cUyTjoF9CSfR+1rF77AZit/fe/3pNmXEzWBpy0y5V9GqTHf9f6HHQaC40CJ9iFzS0VeNInnzXvsmJZPjAVcFpfMWqq9jPvgj2YIzZxP8GM+pndsmJD23MvVo1eIz3MmV+GLx/i6VQJ5IMGpHoUjOSGJWu797xn/nzHlhGlv0uft7lDG56cwc/rzoIPBbinvW6Xp35usbF1crxm8OxOD5Xcns9eCTV/MjTJZVE9VPRD/vlbDHGAGv+wRf3ZxFdvmA+sTBHG4cWpWJrpxYyVRaXLQPeMypKBnDl2vXaN7zsogHKAfFvWGzWlDeGmXcp4ncJsEqkbAYSOaJK8UDqa26RjwYeOAhw8cEPlYJKI+q5n0V79+2I3MSpA+v4u/QAV0LTc4mXE/PQC7v+C8pfPhb8fbUSA2NLJsXAfoV6U+L97r2S4ZxKnV/KbbhKJMI5nIhildCYaQdDW5wux0vbzF4AYDcg31VibDKRElnGBaayIrdi+l/ZZIdsCXSU4AA==',
                red:        'data:image/webp;base64,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',
              };
              const _mc = ((todaySeance.nom || '') + ' ' + (todaySeance.focus || '')).toLowerCase();
              const mannequinSrc =
                (_mc.includes('dos') || _mc.includes('back') || _mc.includes('pull') || _mc.includes('tirage')) ? MANNEQUINS.blue_back :
                (_mc.includes('jambe') || _mc.includes('legs') || _mc.includes('squat')) ? MANNEQUINS.purple :
                (_mc.includes('push') || _mc.includes('pec') || _mc.includes('poitrine') || _mc.includes('force')) ? MANNEQUINS.red :
                MANNEQUINS.blue_front;
              const bg = '#060b1f';
              return (
                <div style={{
                  borderRadius: 20, background: bg,
                  position: 'relative', overflow: 'hidden',
                  height: 210, marginBottom: 12, flexShrink: 0,
                }}>
                  {/* Mannequin */}
                  <img src={mannequinSrc} alt="" aria-hidden="true" style={{
                    position: 'absolute', right: -8, top: -10,
                    height: '118%', width: 'auto',
                    objectFit: 'contain', objectPosition: 'top center',
                    mixBlendMode: 'lighten', pointerEvents: 'none', zIndex: 0,
                  }} />
                  {/* Fondu gauche */}
                  <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                    background: `linear-gradient(to right, ${bg} 0%, ${bg} 32%, ${bg}eb 46%, ${bg}66 62%, transparent 100%)`,
                  }} />
                  {/* Fondu haut */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '22%', zIndex: 0, pointerEvents: 'none',
                    background: `linear-gradient(to bottom, ${bg}8c 0%, transparent 100%)`,
                  }} />

                  {/* Haut gauche : eyebrow + nom */}
                  <div style={{ position: 'absolute', top: 14, left: 15, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: DISP,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      Séance du jour
                    </div>
                    <div style={{ fontFamily: SERIF_F, fontSize: 34, color: '#fff', lineHeight: 0.95, letterSpacing: -1.2, maxWidth: '58%' }}>
                      {todaySeance.nom}
                    </div>
                  </div>

                  {/* Bas gauche : meta + bouton Démarrer */}
                  <div style={{ position: 'absolute', bottom: 14, left: 15, right: 15, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontFamily: DISP }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
                        </svg>
                        {intData.l} · {todaySeance.duree || '45-60 min'}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>·</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontFamily: DISP }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" strokeLinecap="round">
                          <line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="16" x2="20" y2="16"/>
                        </svg>
                        {total} exercice{total !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {!todaySeance.complete ? (
                        <button onClick={() => setFocusActive(true)} style={{
                          background: '#22c55e', border: 'none', borderRadius: 22,
                          padding: '9px 20px', color: '#fff', fontSize: 12.5, fontWeight: 800,
                          display: 'flex', alignItems: 'center', gap: 6,
                          cursor: 'pointer', fontFamily: DISP, letterSpacing: '0.01em',
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                          Démarrer
                        </button>
                      ) : (
                        <div style={{ fontSize: 12, color: '#5FE0A5', fontWeight: 700, fontFamily: DISP }}>✓ Séance complétée</div>
                      )}
                      <button onClick={() => setViewSeance(todaySeance)} style={{
                        fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: DISP,
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        Détails
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Exercices */}
            {!todaySeance.complete && (
              <>
                {/* Header section */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginBottom:10, marginTop:4 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:DISP,
                    letterSpacing:-0.3 }}>Exercices</div>
                  <button onClick={() => setViewSeance(todaySeance)}
                    style={{ fontSize:12, fontWeight:600, color:"#374151", background:"#F0F2F7",
                      border:"none", borderRadius:10, padding:"5px 11px", cursor:"pointer",
                      fontFamily:DISP }}>
                    Voir tout
                  </button>
                </div>

                {/* Cards */}
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
                  {(todaySeance.exercices || []).map((ex, idx) => {
                    const isChecked = !!checkedEx[`${todaySeance.id}-${idx}`];
                    const exColor   = cc(ex.cat);
                    const lastEntry = ex.historique?.[ex.historique.length - 1];
                    // Palette thumbnails par catégorie
                    const thumbColors = {
                      push:["#EAF1FF","#3B82F6"], pull:["#E8FAF1","#10B981"],
                      legs:["#FEF6E7","#F59E0B"], core:["#F3F0FF","#6366F1"],
                    };
                    const tc = thumbColors[ex.cat] || ["#F0F2F7","#6B7280"];
                    return (
                      <div key={idx} style={{
                        background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                        padding:"12px 14px",
                        boxShadow:"0 1px 2px rgba(15,23,42,0.03),0 2px 6px rgba(15,23,42,0.04)",
                        display:"flex", alignItems:"center", gap:12,
                      }}>
                        {/* Thumbnail coloré */}
                        <div style={{
                          width:52, height:52, borderRadius:13, flexShrink:0,
                          background:`linear-gradient(135deg, ${tc[0]}, ${tc[1]}22)`,
                          border:`1px solid ${tc[1]}30`,
                          display:"grid", placeItems:"center",
                        }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke={tc[1]} strokeWidth="1.8" strokeLinecap="round">
                            <path d="M6.5 6.5h11M6.5 6.5A2.5 2.5 0 014 4M17.5 6.5A2.5 2.5 0 0120 4M6.5 17.5h11M6.5 17.5A2.5 2.5 0 014 20M17.5 17.5A2.5 2.5 0 0120 20M12 6.5v11"/>
                          </svg>
                        </div>

                        {/* Numéro badge */}
                        <div onClick={() => toggleCheck(todaySeance.id, idx, ex.repos, todaySeance._calKey)}
                          style={{
                            width:28, height:28, borderRadius:9, flexShrink:0,
                            display:"grid", placeItems:"center", cursor:"pointer",
                            background: isChecked ? "linear-gradient(145deg,#5FE0A5,#2DA67D)" : "rgba(59,130,246,0.10)",
                            border: isChecked ? "none" : "1px solid rgba(59,130,246,0.20)",
                            color: isChecked ? "#0B1F18" : "#3B82F6",
                            fontSize: 12, fontWeight:800, fontFamily:DISP,
                            boxShadow: isChecked ? "0 3px 8px rgba(95,224,165,0.35)" : "none",
                            transition:"all .15s",
                          }}>
                          {isChecked ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          ) : idx + 1}
                        </div>

                        {/* Infos */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{
                            fontSize:13.5, fontWeight:700, color: isChecked ? "#9CA3AF" : C.text,
                            fontFamily:DISP, letterSpacing:-0.2,
                            textDecoration: isChecked ? "line-through" : "none",
                          }}>{ex.nom}</div>
                          <div style={{ fontSize:10.5, color:"#6B7280", fontFamily:DISP, marginTop:2 }}>
                            {ex.series}×{ex.reps} · {ex.repos}s{ex.methode && ex.methode !== "Classique" ? ` · ${ex.methode}` : ""}
                          </div>
                        </div>

                        {/* Poids / check */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end",
                          gap:3, flexShrink:0 }}>
                          {isChecked && (
                            <div style={{
                              width:28, height:28, borderRadius:9,
                              background:"linear-gradient(145deg,#5FE0A5,#2DA67D)",
                              display:"grid", placeItems:"center",
                              boxShadow:"0 3px 8px rgba(95,224,165,0.35)",
                            }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="#0B1F18" strokeWidth="2.8" strokeLinecap="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
                          )}
                          {lastEntry && (
                            <div style={{ fontSize:10.5, fontWeight:700, color:exColor,
                              fontFamily:DISP, ...NUM }}>
                              {lastEntry.poids}kg
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}


          </>
        );
      })() : (
        /* Jour de repos — design récupération LIGHT */
        <div style={{
          background: "#FFFFFF",
          border: "1px solid rgba(59,130,246,0.18)",
          borderRadius: 22, padding: "22px 20px 18px",
          marginBottom: 14, position: "relative", overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ position:"absolute",top:-30,right:-30,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,0.08),transparent 68%)",pointerEvents:"none" }}/>

          {/* Badge + date */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"6px 13px",borderRadius:99,background:"rgba(52,211,153,0.10)",border:"1px solid rgba(52,211,153,0.30)" }}>
              <span style={{ fontSize:13 }}>🌿</span>
              <span style={{ fontSize:10,fontWeight:700,color:"#34D399",letterSpacing:"0.8px",fontFamily:DISP }}>JOUR DE RÉCUPÉRATION</span>
            </div>
            <div style={{ fontSize:11,color:"${C.dim}",fontWeight:600,fontFamily:DISP }}>
              {today.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}
            </div>
          </div>

          {/* Titre */}
          <div style={{ fontFamily:SERIF_F,fontSize:30,color:"${C.text}",lineHeight:1.08,letterSpacing:-1,marginBottom:10 }}>
            Aujourd'hui, on<br/><span style={{ color:"#60A5FA",fontStyle:"italic" }}>récupère.</span>
          </div>
          <div style={{ fontSize:12.5,color:"#374151",lineHeight:1.6,fontFamily:DISP,marginBottom:18 }}>
            La récup fait partie du programme. Voici 3 gestes qui comptent vraiment.
          </div>

          {/* Gestes récup */}
          {[
            {
              ic: "💧",
              bg: "rgba(52,211,153,0.12)", bd: "rgba(52,211,153,0.25)",
              t:  "Hydratation · 2,5 L",
              s:  "Tap pour tracker ton eau →",
              tap: () => setTab?.("nutrition"),
              arrow: true,
            },
            {
              ic: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "✅" : todaySleepLogged >= sleepTarget - 1.5 ? "🟡" : "🔴"
                : "😴",
              bg: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "rgba(52,211,153,0.12)" : todaySleepLogged >= sleepTarget-1.5 ? "rgba(251,146,60,0.14)" : "rgba(248,113,113,0.12)"
                : "rgba(129,140,248,0.14)",
              bd: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "rgba(52,211,153,0.30)" : todaySleepLogged >= sleepTarget-1.5 ? "rgba(251,146,60,0.30)" : "rgba(248,113,113,0.30)"
                : "rgba(129,140,248,0.28)",
              t: todaySleepLogged !== null
                ? `Sommeil · ${todaySleepLogged}h dormies`
                : `Sommeil · cible ${sleepTarget}h`,
              s: todaySleepLogged !== null
                ? todaySleepLogged >= sleepTarget ? "✓ Objectif atteint — super récup" : `${(sleepTarget - todaySleepLogged).toFixed(1)}h sous la cible`
                : "Tap pour logger · 80% des gains la nuit",
              tap: () => { setSleepInput(todaySleepLogged ?? sleepTarget); setShowSleepModal(true); },
              arrow: true,
            },
            {
              ic: todayMobilite ? "✅" : "🧘",
              bg: todayMobilite ? "rgba(52,211,153,0.14)" : "rgba(59,130,246,0.14)",
              bd: todayMobilite ? "rgba(52,211,153,0.32)" : "rgba(59,130,246,0.28)",
              t:  todayMobilite ? "Mobilité · Fait ✓" : "Mobilité · 10 min",
              s:  todayMobilite ? "Hanches & thoracique — bien joué !" : "Tap pour marquer comme fait",
              tap: toggleMobilite,
              flash: mobiliteFlash,
              arrow: false,
              badge: true,
            },
          ].map((g,i) => (
            <div key={i} onClick={g.tap||undefined} style={{
              display:"flex", alignItems:"center", gap:13, padding:"11px 0",
              borderTop:"1px solid rgba(0,0,0,0.05)",
              cursor: g.tap ? "pointer" : "default",
              transition: "opacity .15s",
            }}>
              <div style={{
                width:42, height:42, borderRadius:13,
                background: g.flash ? "rgba(52,211,153,0.30)" : g.bg,
                border:`1px solid ${g.flash ? "rgba(52,211,153,0.60)" : g.bd}`,
                display:"grid", placeItems:"center", flexShrink:0, fontSize:20,
                transition:"background .3s, border .3s",
                boxShadow: g.flash ? "0 0 16px rgba(52,211,153,0.40)" : "none",
              }}>{g.ic}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14.5, fontWeight:700, color:"${C.text}", fontFamily:DISP, letterSpacing:-0.2 }}>{g.t}</div>
                <div style={{ fontSize:11.5, color:"#374151", fontFamily:DISP, marginTop:1 }}>{g.s}</div>
              </div>
              {/* Indicateur interactif */}
              {g.badge && (
                <div style={{
                  width:28, height:28, borderRadius:9, flexShrink:0,
                  background: todayMobilite ? "rgba(52,211,153,0.18)" : "rgba(0,0,0,0.04)",
                  border: `1.5px solid ${todayMobilite ? "rgba(52,211,153,0.50)" : "rgba(0,0,0,0.08)"}`,
                  display:"grid", placeItems:"center",
                  transition:"all .2s",
                }}>
                  {todayMobilite
                    ? <span style={{ color:"#34D399", fontSize:13 }}>✓</span>
                    : <span style={{ color:"rgba(0,0,0,0.10)", fontSize:11 }}>○</span>}
                </div>
              )}
              {g.arrow && <div style={{ fontSize:14, color:"#6B7280", flexShrink:0 }}>›</div>}
            </div>
          ))}

          {/* CTA — créer une séance malgré tout */}
          <button onClick={() => setShowCreateSeance(true)} style={{
            width:"100%",marginTop:16,padding:"13px",borderRadius:14,
            background:"rgba(59,130,246,0.10)",border:"1px solid rgba(59,130,246,0.25)",
            color:"#60A5FA",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DISP,
          }}>
            + Créer une séance aujourd'hui
          </button>
        </div>
      )}

      {/* ── Records ─────────────────────────────────────────────── */}
      {prog && (() => {
        const REC_PALETTE = ["#60A5FA","#34D399","#FBBF24","#F87171","#B69DFF","#3B82F6"];
        const trendOf = (hist) => {
          if (!hist || hist.length < 2) return null;
          const rms = hist.map(h => calc1RM(parseFloat(h.poids), parseInt(h.reps)));
          const last = rms[rms.length - 1];
          const prevBest = Math.max(...rms.slice(0, -1));
          const d = Math.round(last - prevBest);
          return d > 0 ? d : null;
        };
        const recBtn = {
          width:"100%", padding:"15px", borderRadius:16,
          background:"linear-gradient(180deg,#3B82F6,#2563EB)", border:"none",
          color:"#fff", fontFamily:DISP, fontSize:14, fontWeight:700, letterSpacing:-0.2,
          cursor:"pointer", boxShadow:"0 8px 24px rgba(59,130,246,0.32)",
        };
        return (
        <div style={{ marginBottom: 20 }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13 }}>
            <div style={{ fontFamily:SERIF_F, fontSize:21, fontWeight:400, color:C.text, letterSpacing:-0.4 }}>
              Records & Objectifs
            </div>
            <button onClick={() => setShowManualRM(true)}
              style={{ fontSize:11.5, fontWeight:600, color:"#374151",
                background:"#F0F2F7", border:"none", borderRadius:10,
                padding:"5px 11px", cursor:"pointer", fontFamily:DISP,
                display:"flex", alignItems:"center", gap:4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/>
              </svg>
              Historique
            </button>
          </div>

          {rmData.length === 0 ? (
            <div style={{ background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 18, overflow:"hidden" }}>
              {/* Empty state avec CTA visible */}
              <div style={{ padding:"22px 18px 18px", textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:9 }}>📊</div>
                <div style={{ fontFamily:DISP,fontSize:15,fontWeight:700,color:"${C.text}",marginBottom:6 }}>Pas encore de données</div>
                <div style={{ fontSize:11.5,color:"#374151",lineHeight:1.6,marginBottom:16,fontFamily:DISP }}>
                  Enregistre tes charges pendant les séances pour voir tes records et tes 1RM estimés.
                </div>
                <button onClick={() => setShowManualRM(true)} style={recBtn}>
                  Saisir un record
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                {rmData.map((ex, i) => {
                  const col  = REC_PALETTE[i % REC_PALETTE.length];
                  const tr   = trendOf(ex.historique);
                  const iconBg = [
                    ["#EAF1FF","#3B82F6"],["#E8FAF1","#10B981"],
                    ["#FEF6E7","#F59E0B"],["#F3F0FF","#6366F1"],
                    ["#FEE8E8","#F87171"],["#E8FAF1","#34D399"],
                  ][i % 6];
                  return (
                    <div key={i} onClick={() => setEditRecord(ex)} style={{
                      background:C.s1, border:`1px solid ${C.bd}`, borderRadius:16,
                      padding:"14px 14px 12px", cursor:"pointer",
                      boxShadow:"0 1px 2px rgba(15,23,42,0.03),0 2px 6px rgba(15,23,42,0.04)",
                    }}>
                      {/* Icône */}
                      <div style={{ width:36, height:36, borderRadius:11,
                        background:`linear-gradient(135deg, ${iconBg[0]}, ${iconBg[1]}33)`,
                        border:`1px solid ${iconBg[1]}30`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        marginBottom:8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke={iconBg[1]} strokeWidth="1.8" strokeLinecap="round">
                          <path d="M6.5 6.5h11M6.5 6.5A2.5 2.5 0 014 4M17.5 6.5A2.5 2.5 0 0120 4M6.5 17.5h11M6.5 17.5A2.5 2.5 0 014 20M17.5 17.5A2.5 2.5 0 0120 20M12 6.5v11"/>
                        </svg>
                      </div>
                      <div style={{ fontFamily:DISP, fontSize:26, fontWeight:800, color:col,
                        letterSpacing:-1, lineHeight:1, ...NUM }}>{ex.rm1}</div>
                      <div style={{ fontSize:10, color:"#9CA3AF", fontWeight:600,
                        marginTop:1, fontFamily:DISP }}>kg · 1RM</div>
                      <div style={{ fontSize:12, color:C.text, fontWeight:600, marginTop:8,
                        fontFamily:DISP, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis",
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {ex.nom}
                      </div>
                      {tr && (
                        <div style={{ fontSize:10, color:"#10B981", fontWeight:700,
                          marginTop:4, fontFamily:DISP }}>▲ +{tr} kg</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Saisie rapide banner */}
              <div onClick={() => setShowManualRM(true)} style={{
                background:"linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                borderRadius:16, padding:"14px 16px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                cursor:"pointer", boxShadow:"0 8px 24px rgba(59,130,246,0.32)",
              }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:DISP }}>
                    Saisie rapide
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", fontFamily:DISP, marginTop:2 }}>
                    Ajoute un nouveau record
                  </div>
                </div>
                <div style={{ width:40, height:40, borderRadius:"50%",
                  background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                  display:"grid", placeItems:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* Pas de programme */}
      {!prog && (
        <Card style={{ textAlign: "center", padding: "20px 16px", marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#374151", marginBottom: 12 }}>Aucun programme actif</div>
          <Btn onClick={() => setProgView("analyse")}>✨ Générer mon programme</Btn>
          <Btn v="out" onClick={() => setProgView("creer")}>Créer manuellement</Btn>
        </Card>
      )}

      {/* Modals */}
      {showManualRM && (
        <ManualRMModal
          onClose={() => setShowManualRM(false)}
          prog={prog} setProg={setProg} push={push} C={C} EX={EX}
          onSelectExercise={(ex) => {
            setShowManualRM(false);
            // Construire exData pour RecordDetailPage
            const nom = ex.nom;
            let historique = [];
            (prog?.jours || []).forEach(j =>
              (j.exercices || []).forEach(e => {
                if (e.nom === nom) historique = [...historique, ...(e.historique || [])];
              })
            );
            const recRaw = prog?.records?.[nom];
            const recHist = Array.isArray(recRaw) ? recRaw : (recRaw?.historique || []);
            historique = [...historique, ...recHist];
            const rm1 = historique.reduce((best, h) => {
              const rm = Math.round(parseFloat(h.poids) * (1 + parseInt(h.reps)/30) * 10) / 10;
              return rm > best ? rm : best;
            }, 0);
            setEditRecord({ nom, rm1, historique });
          }}
        />
      )}
      {showCreateSeance && <CreateSeanceModal onClose={() => setShowCreateSeance(false)} prog={prog} setProg={setProg} calSess={calSess} setCalSess={setCalSess} push={push} C={C} INT={INT} EX={EX} todayKey={todayKey}/>}
      {editRecord && <RecordDetailPage exData={editRecord} onClose={() => setEditRecord(null)} prog={prog} setProg={setProg} push={push}/>}

      {/* ── Modal Sommeil ─────────────────────────────────────────── */}
      {showSleepModal && (() => {
        const F = DISP;
        const inputVal = sleepInput ?? sleepTarget;
        const step  = v => Math.min(12, Math.round((v + 0.5) * 2) / 2);
        const stepD = v => Math.max(4, Math.round((v - 0.5) * 2) / 2);
        const qualColor = (h) => h >= sleepTarget ? "#34D399" : h >= sleepTarget-1.5 ? "#FB923C" : "#F87171";
        const qualLabel = (h) => h >= sleepTarget ? "Optimal 🌟" : h >= sleepTarget-1.5 ? "Acceptable" : "Insuffisant";
        return (
          <div onClick={()=>setShowSleepModal(false)} style={{
            position:"fixed",inset:0,zIndex:700,
            background:"rgba(4,7,15,0.75)",backdropFilter:"blur(4px)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",
          }}>
            <div onClick={e=>e.stopPropagation()} style={{
              width:"100%",maxWidth:480,
              background:"#FFFFFF",border:"1px solid rgba(0,0,0,0.06)",
              borderRadius:"22px 22px 0 0",padding:"0 0 40px",
              boxShadow:"0 -20px 60px rgba(0,0,0,0.55)",
            }}>
              {/* Handle */}
              <div style={{ width:38,height:4,borderRadius:2,background:"rgba(0,0,0,0.08)",margin:"14px auto 0" }}/>

              {/* Header */}
              <div style={{ padding:"18px 22px 0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:F,fontSize:18,fontWeight:700,color:"${C.text}",letterSpacing:-0.4 }}>😴 Sommeil</div>
                  <div style={{ fontSize:11,color:"${C.dim}",marginTop:3,fontFamily:F }}>Cible & log quotidien</div>
                </div>
                <button onClick={()=>setShowSleepModal(false)} style={{
                  width:36,height:36,borderRadius:10,background:"rgba(0,0,0,0.05)",
                  border:"1px solid rgba(0,0,0,0.06)",color:"#374151",
                  fontSize:16,cursor:"pointer",display:"grid",placeItems:"center",
                }}>×</button>
              </div>

              {/* Séparateur */}
              <div style={{ height:1,background:"rgba(0,0,0,0.05)",margin:"16px 0" }}/>

              <div style={{ padding:"0 22px" }}>

                {/* ── Section 1 : Cible ─────────────────────────── */}
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"1.6px",textTransform:"uppercase",
                              color:"${C.dim}",marginBottom:14,fontFamily:F }}>
                  OBJECTIF NUIT
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                              background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.06)",
                              borderRadius:16,padding:"14px 16px",marginBottom:20 }}>
                  <button onClick={()=>saveSleepTarget(stepD(sleepTarget))} style={{
                    width:44,height:44,borderRadius:13,background:"rgba(0,0,0,0.05)",
                    border:"none",color:"#374151",fontSize:18,cursor:"pointer",
                    display:"grid",placeItems:"center",
                  }}>−</button>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:36,fontWeight:700,color:"${C.text}",letterSpacing:-1,fontFamily:F }}>
                      {sleepTarget}<span style={{ fontSize:16,color:"#374151",marginLeft:3 }}>h</span>
                    </div>
                    <div style={{ fontSize:10,color:"${C.dim}",fontFamily:F,marginTop:2 }}>cible par nuit</div>
                  </div>
                  <button onClick={()=>saveSleepTarget(step(sleepTarget))} style={{
                    width:44,height:44,borderRadius:13,
                    background:"rgba(91,141,239,0.14)",border:"1px solid rgba(91,141,239,0.32)",
                    color:"#9CB9F5",fontSize:18,cursor:"pointer",display:"grid",placeItems:"center",
                  }}>+</button>
                </div>

                {/* ── Section 2 : Log aujourd'hui ───────────────── */}
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"1.6px",textTransform:"uppercase",
                              color:"${C.dim}",marginBottom:14,fontFamily:F }}>
                  CETTE NUIT
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                              background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.06)",
                              borderRadius:16,padding:"14px 16px",marginBottom:16 }}>
                  <button onClick={()=>setSleepInput(stepD(inputVal))} style={{
                    width:44,height:44,borderRadius:13,background:"rgba(0,0,0,0.05)",
                    border:"none",color:"#374151",fontSize:18,cursor:"pointer",
                    display:"grid",placeItems:"center",
                  }}>−</button>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:36,fontWeight:700,color:"${C.text}",letterSpacing:-1,fontFamily:F }}>
                      {inputVal}<span style={{ fontSize:16,color:"#374151",marginLeft:3 }}>h</span>
                    </div>
                    <div style={{ fontSize:11,fontWeight:600,color:qualColor(inputVal),fontFamily:F,marginTop:2 }}>
                      {qualLabel(inputVal)}
                    </div>
                  </div>
                  <button onClick={()=>setSleepInput(step(inputVal))} style={{
                    width:44,height:44,borderRadius:13,
                    background:"rgba(91,141,239,0.14)",border:"1px solid rgba(91,141,239,0.32)",
                    color:"#9CB9F5",fontSize:18,cursor:"pointer",display:"grid",placeItems:"center",
                  }}>+</button>
                </div>

                {/* Barre de comparaison */}
                <div style={{ marginBottom:22 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <span style={{ fontSize:11,color:"${C.dim}",fontFamily:F }}>0h</span>
                    <span style={{ fontSize:11,color:"rgba(91,141,239,0.7)",fontFamily:F }}>cible {sleepTarget}h</span>
                    <span style={{ fontSize:11,color:"${C.dim}",fontFamily:F }}>12h</span>
                  </div>
                  <div style={{ height:6,borderRadius:3,background:"rgba(0,0,0,0.05)",position:"relative" }}>
                    {/* Cible */}
                    <div style={{ position:"absolute",top:-2,bottom:-2,width:2,borderRadius:1,
                      background:"rgba(91,141,239,0.5)",left:`${(sleepTarget/12)*100}%` }}/>
                    {/* Valeur saisie */}
                    <div style={{ height:"100%",borderRadius:3,
                      background:`linear-gradient(90deg,${qualColor(inputVal)}99,${qualColor(inputVal)})`,
                      width:`${Math.min(100,(inputVal/12)*100)}%`,transition:"width .2s" }}/>
                  </div>
                </div>

                {/* Bouton valider */}
                <button onClick={()=>{ logSleepToday(inputVal); setShowSleepModal(false); }} style={{
                  width:"100%",padding:"15px",borderRadius:14,
                  background:"linear-gradient(180deg,#9CB9F5 0%,#5B8DEF 50%,#2D5DC9 100%)",
                  color:"#fff",border:"1px solid rgba(156,185,245,0.4)",
                  fontFamily:F,fontSize:14,fontWeight:700,cursor:"pointer",
                  boxShadow:"inset 0 1px 0 rgba(0,0,0,0.14), 0 8px 22px rgba(45,93,201,0.42)",
                }}>
                  ✓ Enregistrer {inputVal}h de sommeil
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
