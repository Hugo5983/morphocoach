import { useState, useCallback, useEffect, useRef, lazy, Suspense } from"react";
import { scrollTop } from"./hooks/useScrollTop.js";
import { C, DARK, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS, INT } from"./data/constants.js";
import { FOODS } from"./data/foods.js";
import { EX } from"./data/exercises.js";
import { MOTIVATIONS } from"./data/motivations.js";

import { Notif }           from"./components/ui/Notif.jsx";
import { Spinner }         from"./components/ui/Loader.jsx";
import { LevelUpModal }    from"./components/ui/LevelUpModal.jsx";
import { Header }          from"./components/layout/Header.jsx";
import { BottomNav }       from"./components/layout/BottomNav.jsx";
import { Paywall }         from"./components/layout/Paywall.jsx";
import { PaywallNutrition} from"./components/layout/PaywallNutrition.jsx";
import { Screen }          from"./components/layout/Screen.jsx";
import { PageContainer }   from"./components/layout/PageContainer.jsx";
import AppContext           from"./context/AppContext.jsx";
import Home from"./features/home/HomePage.jsx";

const CoachPage  = lazy(() => import("./features/nutrition/CoachPage.jsx"));
const Onboarding = lazy(() => import("./features/onboarding/OnboardingPage.jsx"));
const Nutrition  = lazy(() => import("./features/nutrition/NutritionPage.jsx"));
const Profile    = lazy(() => import("./features/profile/ProfilePage.jsx"));
const ProgramTab = lazy(() => import("./features/training/ProgramTab.jsx"));
const Recipes    = lazy(() => import("./features/recipes/RecipesPage.jsx"));

import { useAuth }          from"./hooks/useAuth.js";
import AuthPage             from"./features/auth/AuthPage.jsx";
import { useStorage }       from"./hooks/useStorage.js";
import { useSwipeNav }      from"./hooks/useSwipeNav.js";
import { useNotif }         from"./hooks/useNotif.js";
import { useMacros }        from"./hooks/useMacros.js";
import { useCycleProgress } from"./hooks/useCycleProgress.js";
import { useStreak }        from"./hooks/useStreak.js";
import { useTotalRepas }    from"./hooks/useTotalRepas.js";
import { useFileReader }    from"./hooks/useFileReader.js";
import { useDailyReset }    from"./hooks/useDailyReset.js";
import { scanBarcode } from"./services/nutritionService.js";

export default function App() {

  // ── Authentification Supabase — protège l'accès à toute l'app ────────────
  const { user, loading: authLoading } = useAuth();

  const [tab,              setTab]              = useState("home");
  const [subViewHome,      setSubViewHome]      = useState("today");
  const [subViewTraining,  setSubViewTraining]  = useState("today");
  const [subViewNutrition, setSubViewNutrition] = useState("journal");
  const [subViewRecipes,   setSubViewRecipes]   = useState("all");
  const [subViewProfile,   setSubViewProfile]   = useState("Profil");

  // ── Navigation gestuelle bidirectionnelle ──────────────────────────────────
  const TAB_ORDER = ["home","program","nutrition","recipes"];
  const SUB_ORDER = {
    home:      ["today","pro","coach"],
    program:   ["today","creer","calendar","analyse"],
    nutrition: ["journal","coach","dashboard","bilan"],
    recipes:   ["all","favorites","coach","liste"],
    profile:   ["Profil","Compo.","Mesures","coach"],
  };
  const SUB_SETTERS = useRef({});
  SUB_SETTERS.current = {
    home: setSubViewHome, program: setSubViewTraining,
    nutrition: setSubViewNutrition, recipes: setSubViewRecipes, profile: setSubViewProfile,
  };
  const SUBS = useRef({});
  SUBS.current = {
    home: subViewHome, program: subViewTraining,
    nutrition: subViewNutrition, recipes: subViewRecipes, profile: subViewProfile,
  };

  // Retour d'un cran : sous-vue précédente, puis tab précédent
  const prevNonCoachTab = useRef("home");
  const prevNonCoachSub = useRef("today");
  useEffect(() => {
    if (tab !== "coach") {
      prevNonCoachTab.current = tab;
      // Mémorise la sous-vue par défaut du tab (pas "coach" qui est un lien vers page)
      const subs = { home: subViewHome, program: subViewTraining, nutrition: subViewNutrition, recipes: subViewRecipes, profile: subViewProfile };
      const curSub = subs[tab];
      if (curSub && curSub !== "coach") prevNonCoachSub.current = curSub;
    }
  }, [tab, subViewHome, subViewTraining, subViewNutrition, subViewRecipes, subViewProfile]);

  const handleBack = useCallback(() => {
    if (tab ==="coach") {
      const targetTab = prevNonCoachTab.current || "home";
      const targetSub = prevNonCoachSub.current || "today";
      setTab(targetTab);
      // Resetter la sous-vue du tab précédent à sa valeur d'avant
      const setters = { home: setSubViewHome, program: setSubViewTraining, nutrition: setSubViewNutrition, recipes: setSubViewRecipes, profile: setSubViewProfile };
      setters[targetTab]?.(targetSub);
      scrollTop();
      return;
    }
    const order = SUB_ORDER[tab] || [];
    const curSub = SUBS.current[tab];
    const idx = order.indexOf(curSub);
    if (idx > 0) {
      // Sous-vue précédente
      const prev = order[idx - 1];
      if (prev ==="coach") { setTab("coach"); }
      else { SUB_SETTERS.current[tab]?.(prev); }
      scrollTop();
    } else {
      // Première sous-vue → tab précédent
      const tabIdx = TAB_ORDER.indexOf(tab);
      if (tabIdx > 0) {
        const prevTab = TAB_ORDER[tabIdx - 1];
        const prevOrder = SUB_ORDER[prevTab] || [];
        setTab(prevTab);
        const lastSub = prevOrder[prevOrder.length - 1];
        if (lastSub && lastSub !=="coach") SUB_SETTERS.current[prevTab]?.(lastSub);
        else if (prevOrder.length > 1) SUB_SETTERS.current[prevTab]?.(prevOrder[prevOrder.length - 2]);
        scrollTop();
      }
    }
  }, [tab]);

  // Avancer d'un cran : sous-vue suivante, puis tab suivant
  const handleForward = useCallback(() => {
    if (tab ==="coach") return;
    const order = SUB_ORDER[tab] || [];
    const curSub = SUBS.current[tab];
    const idx = order.indexOf(curSub);
    if (idx < order.length - 1) {
      // Sous-vue suivante
      const next = order[idx + 1];
      if (next ==="coach") { setTab("coach"); }
      else { SUB_SETTERS.current[tab]?.(next); }
      scrollTop();
    } else {
      // Dernière sous-vue → tab suivant
      const tabIdx = TAB_ORDER.indexOf(tab);
      if (tabIdx < TAB_ORDER.length - 1) {
        const nextTab = TAB_ORDER[tabIdx + 1];
        const nextOrder = SUB_ORDER[nextTab] || [];
        setTab(nextTab);
        SUB_SETTERS.current[nextTab]?.(nextOrder[0] || "today");
        scrollTop();
      }
    }
  }, [tab]);

  const { swipeStyle: globalSwipe, onTouchStart: gTS, onTouchMove: gTM, onTouchEnd: gTE } = useSwipeNav(handleBack, handleForward);

  // ── Notifications & rappel bilan morpho ────────────────────────────────────
  useEffect(() => {
    import("./services/notificationService.js").then(async ({ initNotifications, planifierRappelBilan }) => {
      const granted = await initNotifications();
      if (!granted) return;
      // Programmer le rappel 6 semaines si une fiche morpho existe
      try {
        const fiche = JSON.parse(localStorage.getItem("morpho_fiche") || "null");
        if (fiche?.date) planifierRappelBilan(fiche.date);
      } catch { /* pas de fiche */ }
    }).catch(() => { /* notifications non supportées */ });
  }, []);

  // ── Système XP Momentum ───────────────────────────────────────────────────
  const [lvlUp, setLvlUp] = useState(null); // { levelInfo, amount, reason }
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.leveledUp) {
        setLvlUp({ levelInfo: e.detail.levelInfo, amount: e.detail.amount, reason: e.detail.reason });
      }
    };
    window.addEventListener('morpho_xp_update', handler);
    return () => window.removeEventListener('morpho_xp_update', handler);
  }, []);

  // Toujours remonter en haut quand on change d'onglet/de page
  useEffect(() => {
    scrollTop();
    const r = requestAnimationFrame(() => requestAnimationFrame(scrollTop));
    return () => cancelAnimationFrame(r);
  }, [tab]);
  const [paywall,          setPaywall]          = useState(false);
  const [paywallNutrition, setPaywallNutrition] = useState(false);
  const [showChrono,       setChrono]           = useState(false);
  const [chronoSec,        setChronoSec]        = useState(90);
  const { notif, push, dismiss } = useNotif();

  const [premium,          setPremium]          = useStorage("premium", false);
  const [premiumNutrition, setPremiumNutrition] = useStorage("premiumNutrition", false);

  const [profil, setProfil] = useStorage("profil", {
    prenom:"", age:"", poids:"", taille:"", sexe:"",
    objectif:"hypertrophie", activite:"modere", bodyfat:"",
  });
  const [onboardingDone, setOnboardingDone] = useStorage("onboardingDone", false);
  const profilComplet  = profil.poids && profil.taille && profil.age && profil.sexe;
  const showOnboarding = !onboardingDone && !profilComplet;

  const [prog,       setProg]       = useStorage("prog", null);
  const [progs,      setProgs]      = useStorage("progs", []);
  const [cycles,     setCycles]     = useStorage("cycles", []);
  const [cycleStart, setCycleStart] = useStorage("cycleStart", null);
  const [calSess,    setCalSess]    = useStorage("calSess", {});
  const [seance,     setSeance]     = useState(null);
  const [exDetails,  setExDetails]  = useState({});
  const [exEdit,     setExEdit]     = useState({});
  const [checkedEx,  setCheckedEx]  = useStorage("checkedEx", {});

  const [photos,           setPhotos]           = useState({ face: null, dos: null, profil: null });
  const readFile                                = useFileReader(setPhotos);
  const [loadIA,           setLoadIA]           = useState(false);
  const [loadMsg,          setLoadMsg]          = useState("");
  const [corrigerFaibles,  setCorrigerFaibles]  = useState(true);

  const [repas,    setRepas]    = useStorage("repas", { matin: [], midi: [], soir: [], snack: [] });
  const [repasLog, setRepasLog] = useStorage("repasLog", {});
  const [myFoods,  setMyFoods]  = useStorage("myFoods", []);
  const [eau,      setEau]      = useStorage("eau", 0);

  // ── Nouvelle journée = page nutrition vierge ────────────────────────────────
  // Le contenu du jour (repas + eau) est daté : au premier réveil de l'app un
  // autre jour, il repart à zéro. Aucune perte : les totaux de la veille sont
  // déjà archivés en direct dans repasLog (l'historique du bilan).
  // Date LOCALE (pas UTC) : la remise à zéro se fait bien à minuit, heure de
  // l'utilisateur. Le listener couvre le cas d'une app restée ouverte pendant
  // le passage de minuit (retour au premier plan le lendemain).
  const [repasJour, setRepasJour] = useStorage("repasJour", null);
  useEffect(() => {
    const localISO = () => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split("T")[0];
    };
    const verifierJour = () => {
      const auj = localISO();
      setRepasJour(prev => {
        if (prev === auj) return prev;
        if (prev !== null) {              // null = première ouverture : rien à vider
          setRepas({ matin: [], midi: [], soir: [], snack: [] });
          setEau(0);
        }
        return auj;
      });
    };
    verifierJour();
    const onVisible = () => { if (!document.hidden) verifierJour(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [scanRes,  setScanRes]  = useState(null);

  const [weightLog,    setWeightLog]    = useStorage("weightLog", []);
  const [lastWeighIn,  setLastWeighIn]  = useStorage("lastWeighIn", null);

  const { imc, obj, calObj, pObj, lObj, gObj } = useMacros(profil, cycles);
  const totR      = useTotalRepas(repas);
  const { jR, cPct, semC } = useCycleProgress(cycleStart);
  const getStreak = useStreak(prog);

  useDailyReset("eauDate", setEau, 0);

  useEffect(() => {
    if (prog && progs.length === 0) {
      setProgs([{ ...prog, id: prog.id ||"legacy" }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Notifications automatiques supprimées — trop intrusives au démarrage
    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      import("./features/training/ProgramTab.jsx");
      import("./features/nutrition/NutritionPage.jsx");
      import("./features/profile/ProfilePage.jsx");
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const handleScan = useCallback(async (code) => {
    const result = await scanBarcode(code);
    if (result) setScanRes(result);
  }, []);

  const openSeance = useCallback((i) => {
    setSeance(i); setExDetails({}); setExEdit({});
  }, []);

  const contextValue = {
    tab, setTab,
    premium, setPremium, premiumNutrition, setPremiumNutrition,
    setPaywall, setPaywallNutrition,
    push,
    profil, setProfil,
    prog, setProg, progs, setProgs,
    cycles, setCycles, cycleStart, setCycleStart,
    calSess, setCalSess, checkedEx, setCheckedEx,
    repas, setRepas, repasLog, setRepasLog,
    myFoods, setMyFoods, eau, setEau,
    scanRes, setScanRes,
    weightLog, setWeightLog, lastWeighIn, setLastWeighIn,
    imc, obj, calObj, pObj, lObj, gObj, totR, jR, cPct, semC, getStreak,
    setChrono, setChronoSec,
    INT, MOTIVATIONS,
  };

  const commonProps = { INT, push };

  const homeProps = {
    profil, prog, cycleStart, setTab, premium, setPaywall, setPaywallNutrition,
    eau, setEau, weightLog, setWeightLog, lastWeighIn, setLastWeighIn,
    calSess, imc, obj, calObj, pObj, lObj, gObj, totR, jR, cPct, semC, getStreak,
    MOTIVATIONS, subView: subViewHome,
    ...commonProps,
  };

  const programProps = {
    prog, setProg, progs, setProgs, premium, setPaywall, checkedEx, setCheckedEx,
    seance, setSeance: openSeance, setChrono, setChronoSec,
    exDetails, setExDetails, exEdit, setExEdit,
    cycleStart, setCycleStart, calSess, setCalSess,
    profil, cycles, setCycles, setTab, EX,
    loadIA, setLoadIA, loadMsg, setLoadMsg,
    photos, setPhotos, readFile,
    corrigerFaibles, setCorrigerFaibles,
    jR, semC,
    subView: subViewTraining, setSubView: setSubViewTraining,
    ...commonProps,
  };

  const nutritionProps = {
    profil, prog, repas, setRepas, repasLog, setRepasLog, myFoods, setMyFoods,
    eau, setEau, scanRes, setScanRes,
    obj, calObj, pObj, lObj, gObj, totR, handleScan,
    FOODS,
    premium: premiumNutrition,
    setPaywall: setPaywallNutrition,
    subView: subViewNutrition, setSubView: setSubViewNutrition,
    ...commonProps,
  };

  const profileProps = {
    profil, setProfil, prog, setProg, cycles,
    premium, setPremium, premiumNutrition,
    weightLog, setWeightLog, lastWeighIn, setLastWeighIn,
    checkedEx, setCheckedEx, imc, obj, calObj, pObj, lObj, gObj, getStreak,
    OBJ, ACTIVITE_FACTOR, EX,
    subView: subViewProfile,
    setChrono, setChronoSec, seance, exDetails, setExDetails, exEdit, setExEdit,
    ...commonProps,
  };

  const onboardingProps = {
    profil, setProfil, setOnboardingDone,
    loadIA, setLoadIA, loadMsg, setLoadMsg,
    cycles, setCycles, setCycleStart, setProg,
    photos, setPhotos, readFile,
    corrigerFaibles, setCorrigerFaibles,
    EX, ...commonProps,
  };

  const PageLoader = () => (
    <div style={{ padding: 32, textAlign:"center" }}>
      <Spinner size={32} />
    </div>
);

  // ── Gate auth : écran de chargement pendant la vérification de session,
  //    puis écran de connexion si personne n'est connecté ────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background: C.bg }}>
        <Spinner size={32} />
      </div>
);
  }
  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Screen style={(tab === "coach" || tab === "home") ? { background:DARK.bgDeep, color:DARK.text } : undefined}>
        <div onTouchStart={gTS} onTouchMove={gTM} onTouchEnd={gTE}
          style={{ ...globalSwipe, minHeight:"100vh" }}>
        <style>{CSS}</style>
        <Notif n={notif} onClose={dismiss} />
        {(() => {
          const NAVS = {
            home:      { items:[{id:"today",label:"Aujourd'hui"},{id:"pro",label:"Offre du moment"},{id:"coach",label:"Coach"}], view:subViewHome, set:(v)=>{ if(v==="coach"){setTab("coach");} else{setSubViewHome(v);} } },
            program:   { items:[{id:"today",label:"Aujourd'hui"},{id:"creer",label:"Programme"},{id:"calendar",label:"Planning"},{id:"analyse",label:"Analyse",pro:true}], view:subViewTraining, set:setSubViewTraining },
            nutrition: { items:[{id:"journal",label:"Journal"},{id:"coach",label:"Coach"},{id:"dashboard",label:"Bilan Pro",pro:true},{id:"bilan",label:"Analyse",pro:true}], view:subViewNutrition, set:(v)=>{ if(v==="coach"){setTab("coach");} else{setSubViewNutrition(v);} } },
            recipes:   { items:[{id:"all",label:"Toutes"},{id:"favorites",label:"Favoris"},{id:"coach",label:"Coach"},{id:"liste",label:"Liste"}], view:subViewRecipes, set:(v)=>{ if(v==="coach"){setTab("coach");} else{setSubViewRecipes(v);} } },
            profile:   { items:[{id:"Profil",label:"Profil"},{id:"Compo.",label:"Compo"},{id:"Mesures",label:"Mesures"},{id:"coach",label:"Coach"}], view:subViewProfile, set:(v)=>{ if(v==="coach"){setTab("coach");} else{setSubViewProfile(v);} } },
            coach:     { items:[{id:"journal",label:"Journal"},{id:"coach",label:"Coach"},{id:"dashboard",label:"Bilan Pro",pro:true},{id:"bilan",label:"Analyse",pro:true}], view:"coach", set:(v)=>{ if(v==="coach"){} else{setTab("nutrition");setSubViewNutrition(v);} } },
          };
          const nav = NAVS[tab];
          const isPremiumOfferView = tab === "home" && subViewHome === "pro";
          const isCoachView = tab === "coach";
          const isHomeView = tab === "home";
          const layoutTheme = (isPremiumOfferView || isCoachView || isHomeView) ? "dark" : "light";
          return (
            <Header
              premium={premium} cycleStart={cycleStart} jR={jR}
              tab={tab} setTab={setTab}
              subNav={nav?.items} subView={nav?.view} setSubView={nav?.set}
              setPaywall={setPaywall}
              theme={layoutTheme}
            />
          );
        })()}

        {showOnboarding && (
          <Suspense fallback={<PageLoader />}>
            <Onboarding {...onboardingProps} />
          </Suspense>
)}

        <PageContainer style={(tab === "coach" || tab === "home") ? { background:DARK.bgDeep, color:DARK.text } : undefined}>
          <div className="page-enter">
            {tab ==="home" && <Home {...homeProps} />}
            {tab !=="home" && (
              <Suspense fallback={<PageLoader />}>
                {tab ==="program"   && <ProgramTab {...programProps} />}
                {tab ==="nutrition" && <Nutrition  {...nutritionProps} />}
                {tab ==="profile"   && <Profile    {...profileProps} />}
                {tab ==="recipes"   && <Recipes    premium={premiumNutrition} setPaywall={setPaywallNutrition} push={push} repas={repas} setRepas={setRepas} subView={subViewRecipes} />}
                {tab ==="coach"     && <CoachPage
                  onBack={handleBack}
                  profil={profil} obj={obj}
                  calObj={calObj} pObj={pObj} gObj={gObj} lObj={lObj}
                  bilan={{
                    avgKcal: totR.cal,
                    avgProt: totR.p,
                    avgGluc: totR.g,
                    avgLip:  totR.l,
                    pctKcal: calObj ? Math.round((totR.cal / calObj) * 100) : 0,
                    nbLogged: Object.values(repas).some(arr => arr.length > 0) ? 1 : 0,
                    totalDays: 14,
                    score: cPct ? (cPct / 10).toFixed(1) :"\u2014",
                  }}
                  premium={premiumNutrition}
                  setPaywall={setPaywallNutrition}
                  push={push}
                />}
              </Suspense>
)}
          </div>
        </PageContainer>

        </div>
        {/* ── Fin zone swipable ── */}

        <BottomNav tab={tab} setTab={setTab} theme={(tab === "coach" || tab === "home") ? "dark" : "light"} />

        {/* ── Modal Level-Up Momentum XP ── */}
        <LevelUpModal
          show={!!lvlUp}
          levelInfo={lvlUp?.levelInfo}
          amount={lvlUp?.amount}
          reason={lvlUp?.reason}
          onClose={() => setLvlUp(null)}
        />

        {paywall && (
          <Paywall
            onSubscribe={() => {
              setPremium(true);
              setPaywall(false);
              push("","Coach PRO activé !","Accès au programme IA débloqué !");
            }}
            onClose={() => setPaywall(false)}
          />
)}

        {paywallNutrition && (
          <PaywallNutrition
            onSubscribe={() => {
              setPremiumNutrition(true);
              setPaywallNutrition(false);
              push("","Nutrition PRO activé !","Bilan, recettes et macros personnalisés débloqués !");
            }}
            onClose={() => setPaywallNutrition(false)}
          />
)}
      </Screen>
    </AppContext.Provider>
);
}
