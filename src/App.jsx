import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { C, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS, INT } from "./data/constants.js";
import { FOODS } from "./data/foods.js";
import { EX } from "./data/exercises.js";
import { MOTIVATIONS } from "./data/motivations.js";

import { Notif }           from "./components/ui/Notif.jsx";
import { Spinner }         from "./components/ui/Loader.jsx";
import { XPBar }           from "./components/ui/XPBar.jsx";
import { LevelUpModal }    from "./components/ui/LevelUpModal.jsx";
import { Header }          from "./components/layout/Header.jsx";
import { BottomNav }       from "./components/layout/BottomNav.jsx";
import { Paywall }         from "./components/layout/Paywall.jsx";
import { PaywallNutrition} from "./components/layout/PaywallNutrition.jsx";
import { Screen }          from "./components/layout/Screen.jsx";
import { PageContainer }   from "./components/layout/PageContainer.jsx";
import AppContext           from "./context/AppContext.jsx";
import Home from "./features/home/HomePage.jsx";
import { CoachFAB } from "./features/nutrition/CoachFAB.jsx";

const CoachPage  = lazy(() => import("./features/nutrition/CoachPage.jsx"));
const Onboarding = lazy(() => import("./features/onboarding/OnboardingPage.jsx"));
const Nutrition  = lazy(() => import("./features/nutrition/NutritionPage.jsx"));
const Profile    = lazy(() => import("./features/profile/ProfilePage.jsx"));
const ProgramTab = lazy(() => import("./features/training/ProgramTab.jsx"));
const Recipes    = lazy(() => import("./features/recipes/RecipesPage.jsx"));

import { useAuth }          from "./hooks/useAuth.js";
import AuthPage             from "./features/auth/AuthPage.jsx";
import { useStorage }       from "./hooks/useStorage.js";
import { useNotif }         from "./hooks/useNotif.js";
import { useMacros }        from "./hooks/useMacros.js";
import { useCycleProgress } from "./hooks/useCycleProgress.js";
import { useStreak }        from "./hooks/useStreak.js";
import { useTotalRepas }    from "./hooks/useTotalRepas.js";
import { useFileReader }    from "./hooks/useFileReader.js";
import { useDailyReset }    from "./hooks/useDailyReset.js";
import { scanBarcode } from "./services/nutritionService.js";

export default function App() {

  // ── Authentification Supabase — protège l'accès à toute l'app ────────────
  const { user, loading: authLoading } = useAuth();

  const [tab,              setTab]              = useState("home");

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
    window.scrollTo(0, 0);
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const sc = document.querySelector("[data-scroll-root]");
      if (sc) sc.scrollTop = 0;
    } catch {}
  }, [tab]);
  const [paywall,          setPaywall]          = useState(false);
  const [paywallNutrition, setPaywallNutrition] = useState(false);
  const [showChrono,       setChrono]           = useState(false);
  const [chronoSec,        setChronoSec]        = useState(90);
  const { notif, push, dismiss } = useNotif();

  const [premium,          setPremium]          = useStorage("premium", false);
  const [premiumNutrition, setPremiumNutrition] = useStorage("premiumNutrition", false);

  const [profil, setProfil] = useStorage("profil", {
    prenom: "", age: "", poids: "", taille: "", sexe: "",
    objectif: "hypertrophie", activite: "modere", bodyfat: "",
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
      setProgs([{ ...prog, id: prog.id || "legacy" }]);
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
    MOTIVATIONS, ...commonProps,
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
    jR, semC, ...commonProps,
  };

  const nutritionProps = {
    profil, prog, repas, setRepas, repasLog, setRepasLog, myFoods, setMyFoods,
    eau, setEau, scanRes, setScanRes,
    obj, calObj, pObj, lObj, gObj, totR, handleScan,
    FOODS,
    premium: premiumNutrition,
    setPaywall: setPaywallNutrition,
    ...commonProps,
  };

  const profileProps = {
    profil, setProfil, prog, setProg, cycles,
    premium, setPremium, premiumNutrition,
    weightLog, setWeightLog, lastWeighIn, setLastWeighIn,
    checkedEx, setCheckedEx, imc, obj, calObj, pObj, lObj, gObj, getStreak,
    OBJ, ACTIVITE_FACTOR, EX,
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
    <div style={{ padding: 32, textAlign: "center" }}>
      <Spinner size={32} />
    </div>
  );

  // ── Gate auth : écran de chargement pendant la vérification de session,
  //    puis écran de connexion si personne n'est connecté ────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.bg }}>
        <Spinner size={32} />
      </div>
    );
  }
  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Screen>
        <style>{CSS}</style>
        <Notif n={notif} onClose={dismiss} />
        <Header premium={premium} cycleStart={cycleStart} jR={jR} tab={tab} setTab={setTab} />

        {/* ── Barre XP Momentum — visible sur Entraînement + Nutrition ── */}
        <XPBar />

        {showOnboarding && (
          <Suspense fallback={<PageLoader />}>
            <Onboarding {...onboardingProps} />
          </Suspense>
        )}

        <PageContainer>
          <div className="page-enter">
            {tab === "home" && <Home {...homeProps} />}
            {tab !== "home" && (
              <Suspense fallback={<PageLoader />}>
                {tab === "program"   && <ProgramTab {...programProps} />}
                {tab === "nutrition" && <Nutrition  {...nutritionProps} />}
                {tab === "profile"   && <Profile    {...profileProps} />}
                {tab === "recipes"   && <Recipes    premium={premiumNutrition} setPaywall={setPaywallNutrition} push={push} repas={repas} setRepas={setRepas} />}
                {tab === "coach"     && (
                  <CoachPage
                    onBack={() => setTab("home")}
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
                      score: cPct ? (cPct / 10).toFixed(1) : "—",
                    }}
                    premium={premiumNutrition}
                    setPaywall={setPaywallNutrition}
                    push={push}
                  />
                )}
              </Suspense>
            )}
          </div>
        </PageContainer>

        {tab !== "coach" && <BottomNav tab={tab} setTab={setTab} />}
        <CoachFAB tab={tab} setTab={setTab} premium={premiumNutrition}/>

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
              push("🎉", "Coach PRO activé !", "Accès au programme IA débloqué !");
            }}
            onClose={() => setPaywall(false)}
          />
        )}

        {paywallNutrition && (
          <PaywallNutrition
            onSubscribe={() => {
              setPremiumNutrition(true);
              setPaywallNutrition(false);
              push("🥗", "Nutrition PRO activé !", "Bilan, recettes et macros personnalisés débloqués !");
            }}
            onClose={() => setPaywallNutrition(false)}
          />
        )}
      </Screen>
    </AppContext.Provider>
  );
}
