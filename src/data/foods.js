// ─── BASE ALIMENTAIRE ─────────────────────────────────────────────────────────
// Champs : c=calories, p=protéines, g=glucides, l=lipides
//          fi=fibres(g), na=sodium(mg), su=sucres(g), sa=graisses saturées(g)
//          omega3=bool (source d'oméga-3), qualProt=bool (protéine de qualité)
// ─────────────────────────────────────────────────────────────────────────────
export const FOODS = [
  // ── Protéines ──────────────────────────────────────────────────────────────
  { id:1,  n:"Poulet blanc (100g)",   c:165, p:31, g:0,  l:4,  fi:0,  na:74,  su:0,  sa:1.1, cat:"Protéines", qualProt:true  },
  { id:2,  n:"Œuf entier",           c:78,  p:6,  g:0,  l:5,  fi:0,  na:62,  su:0,  sa:1.6, cat:"Protéines", qualProt:true, omega3:true },
  { id:3,  n:"Thon boîte (100g)",    c:116, p:26, g:0,  l:1,  fi:0,  na:320, su:0,  sa:0.3, cat:"Protéines", qualProt:true, omega3:true },
  { id:4,  n:"Steak 5% (100g)",      c:135, p:21, g:0,  l:5,  fi:0,  na:65,  su:0,  sa:2.0, cat:"Protéines", qualProt:true  },
  { id:5,  n:"Saumon (100g)",        c:208, p:20, g:0,  l:13, fi:0,  na:59,  su:0,  sa:3.1, cat:"Protéines", qualProt:true, omega3:true },
  { id:6,  n:"Fromage blanc 0%",     c:57,  p:8,  g:4,  l:0,  fi:0,  na:43,  su:4,  sa:0.1, cat:"Protéines", qualProt:true  },
  { id:7,  n:"Whey (30g)",           c:120, p:24, g:3,  l:2,  fi:0,  na:80,  su:2,  sa:0.8, cat:"Protéines", qualProt:true  },
  // ── Glucides ───────────────────────────────────────────────────────────────
  { id:8,  n:"Riz cuit (100g)",      c:130, p:3,  g:28, l:0,  fi:0.4,na:1,   su:0,  sa:0,   cat:"Glucides"  },
  { id:9,  n:"Flocons avoine (50g)", c:189, p:7,  g:32, l:4,  fi:5,  na:3,   su:1,  sa:0.7, cat:"Glucides"  },
  { id:10, n:"Patate douce (100g)",  c:86,  p:2,  g:20, l:0,  fi:3,  na:55,  su:4,  sa:0,   cat:"Glucides"  },
  { id:11, n:"Banane",               c:89,  p:1,  g:23, l:0,  fi:2.6,na:1,   su:12, sa:0,   cat:"Glucides"  },
  { id:12, n:"Pain complet (1 tr.)", c:69,  p:4,  g:12, l:1,  fi:2,  na:152, su:1,  sa:0.2, cat:"Glucides"  },
  // ── Lipides de qualité ─────────────────────────────────────────────────────
  { id:13, n:"Avocat (1/2)",         c:120, p:1,  g:6,  l:11, fi:5,  na:7,   su:0,  sa:1.5, cat:"Lipides",  omega3:true },
  { id:14, n:"Amandes (30g)",        c:174, p:6,  g:6,  l:15, fi:3.5,na:1,   su:1,  sa:1.1, cat:"Lipides",  omega3:true },
  { id:15, n:"Huile olive (1 c.s.)", c:119, p:0,  g:0,  l:14, fi:0,  na:0,   su:0,  sa:1.9, cat:"Lipides",  omega3:true },
  // ── Légumes ────────────────────────────────────────────────────────────────
  { id:16, n:"Brocoli (100g)",       c:34,  p:3,  g:7,  l:0,  fi:2.6,na:33,  su:2,  sa:0,   cat:"Légumes"  },
  { id:17, n:"Épinards (100g)",      c:23,  p:3,  g:4,  l:0,  fi:2.2,na:79,  su:0,  sa:0,   cat:"Légumes"  },
  // ── Laitiers ───────────────────────────────────────────────────────────────
  { id:18, n:"Yaourt grec 0%",       c:86,  p:15, g:6,  l:0,  fi:0,  na:46,  su:5,  sa:0.1, cat:"Laitiers", qualProt:true },
  // ── Fruits ─────────────────────────────────────────────────────────────────
  { id:19, n:"Banane",               c:89,  p:1,  g:23, l:0,  fi:2.6,na:1,   su:12, sa:0,   cat:"Fruits"   },
  { id:20, n:"Pomme",                c:52,  p:0,  g:14, l:0,  fi:2.4,na:1,   su:10, sa:0,   cat:"Fruits"   },
];
