import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { C, OBJ, ACTIVITE_FACTOR, GLOBAL_CSS as CSS, INT } from "./data/constants.js";
import { FOODS } from "./data/foods.js";
import { EX } from "./data/exercises.js";
import { MOTIVATIONS } from "./data/motivations.js";

// Composants UI & Layout (chargés immédiatement car utilisés sur toutes les pages)
import { Notif } from "./components/ui/Notif.jsx";
import { Chrono } from "./components/ui/Chrono.jsx";
import { Spinner } from "./components/ui/Loader.jsx";
import { Header } from "./components/layout/Header.jsx";
import { BottomNav } from "./components/layout/BottomNav.jsx";
import { Paywall } from "./components/layout/Paywall.jsx";
import { PaywallNutrition } from "./components/layout/PaywallNutrition.jsx";
import { Screen } from "./components/layout/Screen.jsx";
import { PageContainer } from "./components/layout/PageContainer.jsx";

// Home reste chargé immédiatement (première page visible)
import Home from "./features/home/HomePage.jsx";

// Features chargées à la demande (réduit le bundle initial)
const Onboarding = lazy(() => import("./features/onboarding/OnboardingPage.jsx"));
const Nutrition  = lazy(() => import("./features/nutrition/NutritionPage.jsx"));
const Profile    = lazy(() => import("./features/profile/ProfilePage.jsx"));
const ProgramTab = lazy(() => import("./features/training/ProgramTab.jsx"));
const Recipes    = lazy(() => import("./features/recipes/RecipesPage.jsx"));

// Hooks
import { useStorage } from "./hooks/useStorage.js";
import { useNotif } from "./hooks/useNotif.js";
import { useMacros } from "./hooks/useMacros.js";
import { useCycleProgress } from "./hooks/useCycleProgress.js";
import { useStreak } from "./hooks/useStreak.js";
import { useTotalRepas } from "./hooks/useTotalRepas.js";
import { useFileReader } from "./hooks/useFileReader.js";
import { useDailyReset } from "./hooks/useDailyReset.js";

// Services
import { scanBarcode } from "./services/nutritionService.js";

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  // Navigation & UI
  const [tab, setTab] = useState("home");
  const [premium, setPremium] = useState(false);           // Coach PRO (programme IA)
  const [paywall, setPaywall] = useState(false);
  const [premiumNutrition, setPremiumNutrition] = useState(false); // Nutrition PRO
  const [paywallNutrition, setPaywallNutrition] = useState(false);
  const [showChrono, setChrono] = useState(false);
  const [chronoSec, setChronoSec] = useState(90);
  const { notif, push, dismiss } = useNotif();

  // Profil & Onboarding
  const [profil, setProfil] = useStorage("profil", {
    prenom: "", age: "", poids: "", taille: "", sexe: "",
    objectif: "hypertrophie", activite: "modere", bodyfat: "",
  });
  const [onboardingDone, setOnboardingDone] = useStorage("onboardingDone", false);
  const profilComplet = profil.poids && profil.taille && profil.age && profil.sexe;
  const showOnboarding = !onboardingDone && !profilComplet;

  // Programme & Cycles
  const [prog, setProg] = useStorage("prog", null);
  const [progs, setProgs] = useStorage("progs", []);
  const [cycles, setCycles] = useStorage("cycles", []);
  const [cycleStart, setCycleStart] = useStorage("cycleStart", null);
  const [calSess, setCalSess] = useStorage("calSess", {});
  const [seance, setSeance] = useState(null);
  const [exDetails, setExDetails] = useState({});
  const [exEdit, setExEdit] = useState({});
  const [checkedEx, setCheckedEx] = useStorage("checkedEx", {});

  // Photos & IA
  const [photos, setPhotos] = useState({ face: null, dos: null, profil: null });
  const readFile = useFileReader(setPhotos);
  const [loadIA, setLoadIA] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [corrigerFaibles, setCorrigerFaibles] = useState(true);

  // Nutrition
  const [repas, setRepas] = useStorage("repas", { matin: [], midi: [], soir: [], snack: [] });
  const [repasLog, setRepasLog] = useStorage("repasLog", {});
  const [myFoods, setMyFoods] = useStorage("myFoods", []);
  const [eau, setEau] = useStorage("eau", 0);
  const [scanRes, setScanRes] = useState(null);

  // Suivi corporel
  const [weightLog, setWeightLog] = useStorage("weightLog", []);
  const [lastWeighIn, setLastWeighIn] = useStorage("lastWeighIn", null);

  // Calculs dérivés
  const { imc, obj, calObj, pObj, lObj, gObj } = useMacros(profil, cycles);
  const totR = useTotalRepas(repas);
  const { jR, cPct, semC } = useCycleProgress(cycleStart);
  const getStreak = useStreak(prog);

  // Reset eau quotidien
  useDailyReset("eauDate", setEau, 0);

  // Migration : si prog existe mais progs est vide, initialiser la liste
  useEffect(() => {
    if (prog && progs.length === 0) {
      setProgs([{ ...prog, id: prog.id || "legacy" }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scan code-barres
  const handleScan = useCallback(async (code) => {
    const result = await scanBarcode(code);
    if (result) setScanRes(result);
  }, []);

  // Ouvrir une séance
  const openSeance = useCallback((i) => {
    setSeance(i); setExDetails({}); setExEdit({});
  }, []);

  // Notifications d'accueil
  useEffect(() => {
    const t1 = setTimeout(() => push("🏋️", "Séance du jour", "Votre programme vous attend !"), 7000);
    const t2 = setTimeout(() => push("💧", "Hydratation", "Pensez à boire de l'eau !"), 22000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Précharge les pages lazy après 2s pour navigation instantanée
  useEffect(() => {
    const t = setTimeout(() => {
      import("./features/training/ProgramTab.jsx");
      import("./features/nutrition/NutritionPage.jsx");
      import("./features/profile/ProfilePage.jsx");
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const commonProps = { C, INT, push };

  const homeProps = {
    profil, prog, cycleStart, setTab, premium, setPaywall,
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
    premium, setPremium,
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

  // Fallback affiché pendant le chargement d'une feature lazy
  const PageLoader = () => (
    <div style={{ padding: 40, textAlign: "center" }}>
      <Spinner size={32} />
    </div>
  );

  return (
    <Screen>
      <style>{CSS}</style>
      <Notif n={notif} onClose={dismiss} />
      <Header premium={premium} cycleStart={cycleStart} jR={jR} tab={tab} setTab={setTab} />

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
              {tab === "nutrition" && <Nutrition {...nutritionProps} />}
              {tab === "profile"   && <Profile   {...profileProps} />}
              {tab === "recipes"   && <Recipes   C={C} premium={premiumNutrition} setPaywall={setPaywallNutrition} push={push} />}
            </Suspense>
          )}
        </div>
      </PageContainer>

      <BottomNav tab={tab} setTab={setTab} />

      {showChrono && <Chrono onClose={() => setChrono(false)} initSec={chronoSec} />}

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
            push("🥗", "Nutrition PRO activé !", "Bilan, recettes complètes et macros personnalisés débloqués !");
          }}
          onClose={() => setPaywallNutrition(false)}
        />
      )}
    </Screen>
  );
}
