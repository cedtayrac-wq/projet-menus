// Base de données complète de recettes :
// 3 Types de repas (Semaine & Week-end) :
// - 🥗 Équilibré : menus sains, simples et rapides à réaliser
// - 🌟 Plaisir : menus gourmands pour se faire plaisir (même si moins équilibrés), simples et rapides à réaliser
// - 🍷 Gourmet : menus avec des ingrédients plus nobles et délicats, recettes simples à réaliser + suggestion de vin
// Toutes les quantités d'ingrédients sont calibrées pour baseServings: 2 (2 adultes par défaut).

window.RECIPES_DB = {
  categories: {
    "Fruits & Légumes": { icon: "🥦", order: 1 },
    "Viandes, Poissons & Œufs": { icon: "🍗", order: 2 },
    "Crèmerie & Frais": { icon: "🧀", order: 3 },
    "Épicerie salée": { icon: "🍝", order: 4 },
    "Épicerie sucrée & Pâtisserie": { icon: "🍫", order: 5 },
    "Boulangerie & Divers": { icon: "🥖", order: 6 },
    "Cave & Accords Vins": { icon: "🍷", order: 7 }
  },

  // =========================================================================
  // 1. DÎNERS DE SEMAINE : Healthy, équilibrés, ingrédients simples & bon marché, rapides (15-25 min)
  // =========================================================================
  weekdayDinners: [
    {
      id: "wd-1",
      title: "Poêlée de pois chiches, épinards et œufs mollets",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "10 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "410 kcal / part",
      tags: ["Healthy", "Végétarien", "Rapide", "Économique"],
      baseServings: 2,
      description: "Un dîner complet riche en protéines végétales et en fer, relevé d'une pointe de cumin.",
      ingredients: [
        { name: "Pois chiches cuits (égouttés)", qty: 250, unit: "g", aisle: "Épicerie salée" },
        { name: "Épinards frais (ou surgelés)", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 4, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Ail", qty: 1, unit: "gousse", aisle: "Fruits & Légumes" },
        { name: "Cumin moulu", qty: 1, unit: "c. à café", aisle: "Épicerie salée" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire bouillir une casserole d'eau et y plonger les œufs pendant 6 minutes exactement pour obtenir des œufs mollets, puis les passer sous l'eau froide avant de les écaler.",
        "Émincer la gousse d'ail et la faire revenir 1 minute dans une poêle avec l'huile d'olive et le cumin.",
        "Ajouter les pois chiches égouttés et les épinards. Laisser fondre les épinards à feu moyen pendant 4 à 5 minutes en remuant.",
        "Saler, poivrer, dresser dans les assiettes et déposer 2 œufs mollets coupés en deux par personne."
      ]
    },
    {
      id: "wd-2",
      title: "Wok de poulet aux courgettes, carottes et sauce soja",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "440 kcal / part",
      tags: ["Healthy", "Rapide", "Riche en protéines"],
      baseServings: 2,
      description: "Des aiguillettes de poulet sautées avec des légumes croquants et du riz basmati.",
      ingredients: [
        { name: "Blanc de poulet", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Carottes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Riz basmati", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Sauce soja", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Huile de sésame ou olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Lancer la cuisson du riz basmati dans une casserole d'eau bouillante salée (environ 10 minutes).",
        "Couper le blanc de poulet en lamelles fines, et tailler la courgette et les carottes en bâtonnets.",
        "Dans une grande poêle ou un wok chaud avec l'huile, saisir le poulet 4 minutes jusqu'à ce qu'il soit doré.",
        "Ajouter les bâtonnets de carottes et courgettes, arroser de sauce soja et faire sauter 6 à 7 minutes à feu vif pour garder les légumes légèrement croquants. Servir avec le riz."
      ]
    },
    {
      id: "wd-3",
      title: "Dahl express de lentilles corail au lait de coco et tomates",
      type: "weekday",
      prepTime: "5 min",
      cookTime: "15 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique", "Sans gluten"],
      baseServings: 2,
      description: "Un plat complet réconfortant, ultra-économique et digeste prêt en 20 minutes chrono.",
      ingredients: [
        { name: "Lentilles corail sèches", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Tomates concassées (conserve)", qty: 200, unit: "g", aisle: "Épicerie salée" },
        { name: "Lait de coco léger", qty: 150, unit: "ml", aisle: "Épicerie salée" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Curry en poudre", qty: 1.5, unit: "c. à café", aisle: "Épicerie salée" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Émincer finement l'oignon et le faire revenir dans une casserole avec l'huile d'olive et le curry pendant 2 minutes.",
        "Rincer les lentilles corail à l'eau froide puis les verser dans la casserole avec les tomates concassées, le lait de coco et 150 ml d'eau.",
        "Couvrir et laisser mijoter à feu doux pendant 13 à 15 minutes en remuant régulièrement jusqu'à ce que les lentilles soient fondantes.",
        "Rectifier l'assaisonnement en sel et poivre et servir bien chaud."
      ]
    },
    {
      id: "wd-4",
      title: "Omelette roulée aux fines herbes, champignons et salade verte",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "8 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "360 kcal / part",
      tags: ["Healthy", "Léger", "Rapide", "Économique"],
      baseServings: 2,
      description: "Une omelette moelleuse garnie de champignons poêlés, accompagnée d'une salade croquante et de pain complet.",
      ingredients: [
        { name: "Œufs", qty: 5, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Champignons de Paris", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Salade verte (mâche ou laitue)", qty: 100, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Fromage râpé ou frais", qty: 30, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Pain complet", qty: 2, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Nettoyer et émincer les champignons de Paris. Les faire dorer 5 minutes à feu vif dans une poêle avec un filet d'huile d'olive.",
        "Battre les œufs dans un bol avec du sel, du poivre et des herbes de Provence ou ciboulette.",
        "Verser les œufs battus sur les champignons, parsemer de fromage et cuire 3 minutes à feu moyen. Rouler l'omelette.",
        "Servir immédiatement avec la salade verte assaisonnée et une tranche de pain complet."
      ]
    },
    {
      id: "wd-5",
      title: "Filet de cabillaud en papillote au citron et julienne de légumes",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "380 kcal / part",
      tags: ["Healthy", "Poisson", "Léger"],
      baseServings: 2,
      description: "Une cuisson saine sans matière grisse superflue qui préserve toute la tendreté du poisson et le fondant des légumes.",
      ingredients: [
        { name: "Filets de cabillaud (ou colin)", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Carotte", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Citron", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Semoule ou quinoa", qty: 100, unit: "g", aisle: "Épicerie salée" }
      ],
      steps: [
        "Préchauffer le four à 190°C. Laver et râper ou couper en fins bâtonnets la courgette et la carotte, et couper la tomate en petits dés.",
        "Au centre de deux feuilles de papier cuisson, répartir les légumes puis déposer les filets de poisson par-dessus.",
        "Arroser de jus de citron, saler, poivrer, fermer hermétiquement les papillotes et enfourner 15 minutes.",
        "Pendant ce temps, préparer la semoule ou le quinoa et servir avec les papillotes ouvertes à table."
      ]
    },
    {
      id: "wd-6",
      title: "Pâtes complètes au thon, tomates cerises, câpres et basilic",
      type: "weekday",
      prepTime: "5 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "460 kcal / part",
      tags: ["Healthy", "Rapide", "Placard", "Économique"],
      baseServings: 2,
      description: "L'alliance méditerranéenne express avec des ingrédients du placard et des tomates fraîches.",
      ingredients: [
        { name: "Pâtes au blé complet (penne ou fusilli)", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Thon au naturel (conserve égouttée)", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Tomates cerises", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Ail", qty: 1, unit: "gousse", aisle: "Fruits & Légumes" },
        { name: "Câpres ou olives noires", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire les pâtes complètes dans un grand volume d'eau bouillante salée selon le temps indiqué sur le paquet.",
        "Couper les tomates cerises en deux et hacher la gousse d'ail. Les faire revenir 4 minutes à la poêle dans l'huile d'olive.",
        "Ajouter le thon émietté et les câpres (ou olives), mélanger 2 minutes à feu doux.",
        "Égoutter les pâtes en gardant 2 cuillères d'eau de cuisson, mélanger le tout dans la poêle et poivrer généreusement."
      ]
    },
    {
      id: "wd-7",
      title: "Salade tiède de quinoa, patate douce rôtie et feta",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "18 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "450 kcal / part",
      tags: ["Healthy", "Végétarien", "Équilibré"],
      baseServings: 2,
      description: "Un bol complet aux saveurs douces-salées, riche en fibres et vitamines.",
      ingredients: [
        { name: "Patate douce", qty: 300, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Quinoa", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Feta", qty: 80, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Jeunes pousses d'épinards ou roquette", qty: 80, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Jus de citron", qty: 1, unit: "c. à soupe", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Éplucher et couper la patate douce en petits dés d'1 cm. Les faire dorer à la poêle couverte (ou au four/airfryer) avec un filet d'huile d'olive et une pincée de paprika pendant 15 minutes.",
        "Rincer et cuire le quinoa 12 minutes dans deux fois son volume d'eau bouillante.",
        "Dans deux bols, disposer les jeunes pousses, le quinoa tiède et les dés de patate douce rôtis.",
        "Émietter la feta par-dessus et arroser d'un filet de jus de citron."
      ]
    },
    {
      id: "wd-8",
      title: "Wraps complets au poulet grillé, crudités et sauce yaourt-citron",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "8 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Rapide", "Ludique"],
      baseServings: 2,
      description: "Des wraps frais et protéinés avec une sauce légère au yaourt grec remplaçant la mayonnaise.",
      ingredients: [
        { name: "Galettes wraps au blé complet", qty: 4, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Filets de poulet", qty: 240, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Yaourt grec ou nature brassé", qty: 1, unit: "pot", aisle: "Crèmerie & Frais" },
        { name: "Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Salade verte", qty: 60, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Couper le poulet en aiguillettes, saler, poivrer et les faire griller 6 à 8 minutes à la poêle.",
        "Mélanger le yaourt avec du sel, du poivre et un filet de citron ou des herbes.",
        "Couper la tomate et le concombre en fines rondelles ou bâtonnets.",
        "Tartiner les galettes de sauce yaourt, garnir de salade, crudités et poulet chaud, puis rouler serré."
      ]
    },
    {
      id: "wd-9",
      title: "Chakshouka aux poivrons, tomates et œufs pochés",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "390 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique"],
      baseServings: 2,
      description: "Une poêlée ensoleillée de poivrons fondants et sauce tomate dans laquelle cuisent les œufs.",
      ingredients: [
        { name: "Poivrons (rouge ou vert)", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Tomates concassées (conserve)", qty: 400, unit: "g", aisle: "Épicerie salée" },
        { name: "Œufs", qty: 4, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Pain de campagne", qty: 2, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Émincer l'oignon et les poivrons en lanières. Les faire revenir 7 minutes dans une poêle avec l'huile d'olive.",
        "Verser les tomates concassées, saler, poivrer (ajouter une pointe de paprika ou cumin) et laisser mijoter 5 minutes.",
        "Creuser 4 petits puits dans la sauce et y casser les œufs. Couvrir et cuire 4 à 5 minutes jusqu'à ce que le blanc soit pris et le jaune encore coulant.",
        "Déguster directement avec le pain grillé."
      ]
    },
    {
      id: "wd-10",
      title: "Poêlée de brocolis, champignons, tofu ou dés de jambon & riz",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "410 kcal / part",
      tags: ["Healthy", "Rapide", "Équilibré"],
      baseServings: 2,
      description: "Une assiette verte ultra-équilibrée et rassasiante prête en un clin d'œil.",
      ingredients: [
        { name: "Brocoli", qty: 1, unit: "tête", aisle: "Fruits & Légumes" },
        { name: "Champignons de Paris", qty: 150, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Dés de jambon blanc (ou tofu ferme)", qty: 150, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Riz complet ou basmati", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Sauce soja", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Détailler le brocoli en petits bouquets et les cuire 6 minutes à l'eau bouillante ou à la vapeur avec le riz à côté.",
        "Émincer les champignons et les faire sauter à la poêle avec les dés de jambon (ou tofu) pendant 5 minutes.",
        "Ajouter les bouquets de brocoli égouttés et la sauce soja dans la poêle, faire sauter 2 minutes.",
        "Servir chaud sur le lit de riz."
      ]
    },
    {
      id: "wd-11",
      title: "Velouté de courgettes au chèvre frais & tartines grillées au jambon cru",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "380 kcal / part",
      tags: ["Healthy", "Léger", "Réconfortant"],
      baseServings: 2,
      description: "Un velouté onctueux sans crème grâce au chèvre frais, accompagné de tartines croustillantes.",
      ingredients: [
        { name: "Courgettes", qty: 3, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Fromage de chèvre frais (type Petit Billy)", qty: 80, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Pain complet ou campagne", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Jambon cru ou blanc découenné", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Bouillon de légumes", qty: 1, unit: "cube", aisle: "Épicerie salée" }
      ],
      steps: [
        "Laver et couper les courgettes en rondelles (sans les éplucher). Les cuire 13 minutes dans une casserole avec 400 ml d'eau et le cube de bouillon.",
        "Ajouter les trois quarts du chèvre frais dans la casserole et mixer finement jusqu'à obtention d'un velouté lisse.",
        "Griller les tranches de pain, y répartir le reste de chèvre et le jambon.",
        "Servir le velouté bien chaud avec les tartines croustillantes."
      ]
    },
    {
      id: "wd-12",
      title: "Galettes de sarrasin complètes (œuf, jambon, épinards & emmental)",
      type: "weekday",
      prepTime: "5 min",
      cookTime: "10 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "440 kcal / part",
      tags: ["Healthy", "Rapide", "Économique"],
      baseServings: 2,
      description: "La traditionnelle galette de blé noir revisitée avec une poignée de pousses d'épinards pour un repas complet.",
      ingredients: [
        { name: "Galettes de sarrasin (blé noir)", qty: 2, unit: "pièces", aisle: "Crèmerie & Frais" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Jambon blanc", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pousses d'épinards", qty: 100, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Emmental râpé", qty: 50, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Chauffer une grande poêle légèrement huilée et y déposer une galette de sarrasin.",
        "Parsemer d'emmental râpé, d'une poignée d'épinards frais, d'une tranche de jambon et casser un œuf au centre.",
        "Laisser cuire 4 minutes jusqu'à ce que le blanc soit cuit, replier les 4 bords en carré et renouveler pour la seconde galette.",
        "Servir avec le reste des pousses d'épinards en salade."
      ]
    },
    {
      id: "wd-13",
      title: "Salade méditerranéenne de lentilles vertes, saumon fumé et pomme verte",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "0 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Sans cuisson", "Riche en fibres"],
      baseServings: 2,
      description: "Zéro cuisson pour les soirs pressés : lentilles fondantes, croquant de la pomme et oméga-3 du saumon.",
      ingredients: [
        { name: "Lentilles vertes cuites (conserve)", qty: 260, unit: "g", aisle: "Épicerie salée" },
        { name: "Saumon ou truite fumée", qty: 100, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pomme (type Granny ou Gala)", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Huile de colza ou olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Moutarde", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Rincer et égoutter soigneusement les lentilles vertes.",
        "Couper la pomme en petits dés, émincer finement l'échalote et détailler le saumon fumé en lanières.",
        "Préparer une vinaigrette légère avec la moutarde, l'huile, une cuillère de vinaigre ou citron, sel et poivre.",
        "Mélanger tous les ingrédients dans un saladier et déguster frais."
      ]
    },
    {
      id: "wd-14",
      title: "Escalopes de dinde au citron, haricots verts persillés et pommes vapeur",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "415 kcal / part",
      tags: ["Healthy", "Classique", "Léger"],
      baseServings: 2,
      description: "Le grand classique équilibré et digeste du soir, simple et savoureux.",
      ingredients: [
        { name: "Escalopes de dinde", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Haricots verts extra-fins (frais ou surgelés)", qty: 300, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Ail", qty: 1, unit: "gousse", aisle: "Fruits & Légumes" },
        { name: "Citron", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Couper les pommes de terre en cubes et les cuire à l'eau ou à la vapeur 12 minutes avec les haricots verts.",
        "Saisir les escalopes de dinde 4 minutes par face dans une poêle avec un filet d'huile d'olive et déglacer au jus de citron.",
        "Faire revenir les haricots verts et pommes de terre 2 minutes avec l'ail haché et du persil.",
        "Dresser dans les assiettes et arroser du jus citronné de la poêle."
      ]
    },
    {
      id: "wd-15",
      title: "Chili sin carne express aux haricots rouges, maïs et avocat",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "450 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique", "Rapide"],
      baseServings: 2,
      description: "Un chili végétarien ultra-économique, riche en fibres et prêt en 20 minutes.",
      ingredients: [
        { name: "Haricots rouges cuits (conserve)", qty: 250, unit: "g", aisle: "Épicerie salée" },
        { name: "Maïs doux (conserve)", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Pulpe de tomates (conserve)", qty: 300, unit: "g", aisle: "Épicerie salée" },
        { name: "Avocat", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Cumin & Paprika", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Émincer l'oignon et le faire revenir 3 minutes dans une sauteuse avec un filet d'huile, le cumin et le paprika.",
        "Ajouter les haricots rouges et le maïs rincés et égouttés ainsi que la pulpe de tomates.",
        "Laisser mijoter à feu moyen pendant 10 minutes pour que la sauce épaississe.",
        "Servir chaud garni de lamelles d'avocat frais."
      ]
    },
    {
      id: "wd-16",
      title: "Frittata au four aux courgettes, tomates et mozzarella",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "395 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique"],
      baseServings: 2,
      description: "L'omelette italienne dorée et légère, garnie de légumes du soleil et de mozzarella.",
      ingredients: [
        { name: "Œufs", qty: 4, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Mozzarella", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte", qty: 80, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Couper la courgette en fines rondelles et les faire dorer 5 minutes à la poêle dans l'huile d'olive.",
        "Battre les œufs salés et poivrés, les verser sur les courgettes et disposer les rondelles de tomate et les dés de mozzarella par-dessus.",
        "Couvrir la poêle à feu doux pendant 8 à 10 minutes (ou passer 4 minutes sous le gril du four) jusqu'à ce que le dessus soit pris.",
        "Accompagner de la salade verte."
      ]
    },
    {
      id: "wd-17",
      title: "Pavé de saumon poêlé, fondue de poireaux légère et riz",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "470 kcal / part",
      tags: ["Healthy", "Poisson", "Oméga-3"],
      baseServings: 2,
      description: "Une fondue de poireaux douce au yaourt ou crème légère accompagnée d'un pavé de saumon grillé.",
      ingredients: [
        { name: "Pavés de saumon (ou truite)", qty: 240, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Poireaux", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Crème fraîche légère 15%", qty: 2, unit: "c. à soupe", aisle: "Crèmerie & Frais" },
        { name: "Riz basmati", qty: 110, unit: "g", aisle: "Épicerie salée" },
        { name: "Citron", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Laver et émincer finement les poireaux. Les faire fondre à couvert dans une sauteuse avec un fond d'eau pendant 12 minutes à feu doux.",
        "Cuire le riz en parallèle. En fin de cuisson des poireaux, incorporer la crème légère, le jus de citron, sel et poivre.",
        "Saisir les pavés de saumon dans une poêle antiadhésive 3 à 4 minutes de chaque côté.",
        "Servir le saumon sur le lit de fondue de poireaux avec le riz."
      ]
    },
    {
      id: "wd-18",
      title: "Tartines chaudes d'avocat, œuf poché, radis et cottage cheese",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "5 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "410 kcal / part",
      tags: ["Healthy", "Rapide", "Végétarien"],
      baseServings: 2,
      description: "Un dîner express façon brunch healthy, frais et riche en bonnes graisses et protéines.",
      ingredients: [
        { name: "Pain complet au levain", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Avocat mûr", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Fromage frais ou Cottage cheese", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Radis ou tomates cerises", qty: 120, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire griller les tranches de pain complet.",
        "Écraser la chair de l'avocat à la fourchette avec du sel, du poivre et un trait de citron.",
        "Cuire les œufs au plat ou pochés pendant 3 à 4 minutes.",
        "Tartiner le pain de fromage frais puis d'avocat, déposer les rondelles de radis/tomates et surmonter de l'œuf."
      ]
    },
    {
      id: "wd-19",
      title: "Sauté de crevettes à l'ail, courgettes et nouilles de blé",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Rapide", "Poisson"],
      baseServings: 2,
      description: "Prêt en moins de 20 minutes, ce sauté de crevettes aux légumes est léger et parfumé.",
      ingredients: [
        { name: "Crevettes décortiquées", qty: 220, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgettes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Nouilles chinoises ou spaghettis", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Ail", qty: 2, unit: "gousses", aisle: "Fruits & Légumes" },
        { name: "Sauce soja", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire les nouilles selon les instructions du paquet et les égoutter.",
        "Couper les courgettes en demi-rondelles fines et les faire sauter 6 minutes à feu vif avec l'ail haché.",
        "Ajouter les crevettes et la sauce soja, faire sauter 3 minutes supplémentaires.",
        "Incorporer les nouilles dans la poêle, bien mélanger 1 minute et servir."
      ]
    },
    {
      id: "wd-20",
      title: "Buddha Bowl au poulet mariné, carottes râpées, concombre et boulghour",
      type: "weekday",
      prepTime: "12 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "445 kcal / part",
      tags: ["Healthy", "Équilibré", "Économique"],
      baseServings: 2,
      description: "Un bol coloré et complet associant céréales, crudités croquantes et poulet doré.",
      ingredients: [
        { name: "Blanc de poulet", qty: 240, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Boulghour", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Carottes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive & Citron", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire le boulghour 10 minutes dans de l'eau bouillante salée puis l'égoutter.",
        "Couper le poulet en dés et le faire dorer à la poêle 8 minutes avec des herbes et une pincée de curry ou paprika.",
        "Râper les carottes et couper le concombre en dés.",
        "Assembler dans deux bols le boulghour, les carottes, le concombre et le poulet, puis arroser d'huile d'olive et de citron."
      ]
    },
    {
      id: "wd-21",
      title: "Salade César légère au poulet grillé, œuf dur et copeaux de parmesan",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "8 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Déjeuner idéal", "Rapide"],
      baseServings: 2,
      costFor2: 4.90,
      description: "Une salade repas complète et rassasiante avec une sauce légère au yaourt et citron.",
      ingredients: [
        { name: "Blanc de poulet", qty: 240, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Salade romaine ou sucrine", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Parmesan", qty: 30, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Pain complet (en croûtons)", qty: 2, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Yaourt nature & Moutarde", qty: 1, unit: "pot", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Cuire les œufs 9 minutes à l'eau bouillante pour les avoir durs, puis les écaler et les couper en quartiers.",
        "Griller les aiguillettes de poulet à la poêle 7 minutes et faire dorer les dés de pain complet.",
        "Mélanger le yaourt avec 1 c. à café de moutarde, un trait de citron, sel et poivre.",
        "Dresser la salade avec le poulet, les œufs, les croûtons, le parmesan et la sauce légère."
      ]
    },
    {
      id: "wd-22",
      title: "Quiche sans pâte légère au thon, tomates et herbes de Provence",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "20 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "390 kcal / part",
      tags: ["Healthy", "Économique", "Riche en protéines"],
      baseServings: 2,
      costFor2: 3.60,
      description: "Moelleuse et ultra-légère sans pâte, parfaite avec une salade verte au déjeuner comme au dîner.",
      ingredients: [
        { name: "Thon au naturel (conserve)", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Œufs", qty: 3, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait demi-écrémé", qty: 200, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Farine ou Maïzena", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Salade verte", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Préchauffer le four à 190°C. Fouetter les œufs avec la farine et le lait, saler et poivrer.",
        "Incorporer le thon égoutté et émietté, verser dans un petit moule et disposer des rondelles de tomate sur le dessus.",
        "Enfourner 20 minutes jusqu'à ce que la quiche soit dorée, et servir avec la salade verte."
      ]
    },
    {
      id: "wd-23",
      title: "Riz sauté cantonais healthy aux petits pois, carottes, jambon et omelette",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "440 kcal / part",
      tags: ["Healthy", "Rapide", "Économique"],
      baseServings: 2,
      costFor2: 3.70,
      description: "Un grand classique familial revisité avec très peu de matière grasse et plein de petits légumes.",
      ingredients: [
        { name: "Riz basmati", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Petits pois & carottes (frais ou conserve/surgelés)", qty: 200, unit: "g", aisle: "Épicerie salée" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Dés de jambon blanc", qty: 100, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Sauce soja", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire le riz basmati 10 minutes à l'eau bouillante salée puis l'égoutter.",
        "Battre les œufs en omelette fine dans une poêle chaude, puis la couper en lanières.",
        "Dans la même poêle, faire sauter les petits pois-carottes, les dés de jambon, le riz et les lanières d'omelette avec la sauce soja pendant 3 minutes."
      ]
    },
    {
      id: "wd-24",
      title: "Poke Bowl express au saumon (ou thon), riz vinaigré, avocat et concombre",
      type: "weekday",
      prepTime: "12 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "460 kcal / part",
      tags: ["Healthy", "Frais", "Déjeuner idéal"],
      baseServings: 2,
      costFor2: 6.20,
      description: "Un bol frais et équilibré, parfait pour faire le plein d'énergie sans lourdeur.",
      ingredients: [
        { name: "Pavé de saumon frais ou fumé", qty: 200, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Riz", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Avocat", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Carotte", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Sauce soja & Citron", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire le riz et le laisser tiédir.",
        "Couper le saumon en dés, le concombre en rondelles, l'avocat en lamelles et râper la carotte.",
        "Disposer le riz au fond de deux bols, répartir harmonieusement les garnitures par-dessus et arroser de sauce soja citronnée."
      ]
    },
    {
      id: "wd-25",
      title: "Steak haché 5% grillé, purée maison de carottes-pommes de terre et salade",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "450 kcal / part",
      tags: ["Healthy", "Classique", "Équilibré"],
      baseServings: 2,
      costFor2: 5.10,
      description: "Une purée bicolore douce et vitaminée accompagnée d'un steak haché maigre.",
      ingredients: [
        { name: "Steaks hachés bœuf 5%", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Carottes", qty: 3, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Lait demi-écrémé", qty: 50, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Salade verte", qty: 60, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Éplucher et couper les carottes et pommes de terre en petits dés, les cuire 15 minutes dans l'eau bouillante salée.",
        "Les écraser au presse-purée avec le lait chaud, une pincée de muscade, sel et poivre.",
        "Saisir les steaks hachés 3 minutes par face dans une poêle chaude et servir avec la purée et la salade."
      ]
    },
    {
      id: "wd-26",
      title: "Salade tiède de pâtes tricolores, courgettes grillées, mozzarella et basilic",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique"],
      baseServings: 2,
      costFor2: 3.80,
      description: "Aussi bonne tiède que froide pour un déjeuner ou un dîner ensoleillé.",
      ingredients: [
        { name: "Pâtes fusilli ou farfalle", qty: 150, unit: "g", aisle: "Épicerie salée" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomates cerises", qty: 150, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Mozzarella", qty: 125, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Huile d'olive & Basilic", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire les pâtes 10 minutes à l'eau bouillante salée.",
        "Couper la courgette en dés et les faire dorer 6 minutes à la poêle dans l'huile d'olive.",
        "Mélanger les pâtes égouttées avec les courgettes, les tomates cerises coupées en deux, la mozzarella en dés et le basilic."
      ]
    },
    {
      id: "wd-27",
      title: "Filets de maquereaux au vin blanc, pommes de terre tièdes et oignon rouge",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "410 kcal / part",
      tags: ["Healthy", "Oméga-3", "Économique"],
      baseServings: 2,
      costFor2: 3.50,
      description: "Une assiette bistrotière économique, très riche en oméga-3 et rapide à préparer.",
      ingredients: [
        { name: "Filets de maquereaux au naturel ou vin blanc", qty: 200, unit: "g", aisle: "Épicerie salée" },
        { name: "Pommes de terre", qty: 350, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Oignon rouge", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Mâche ou jeunes pousses", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire les pommes de terre coupées en rondelles épaisses pendant 12 minutes dans l'eau bouillante salée.",
        "Disposer dans les assiettes la mâche, les pommes de terre encore tièdes, l'oignon rouge finement émincé et les filets de maquereaux.",
        "Arroser d'un filet de la marinade aromatique et poivrer."
      ]
    },
    {
      id: "wd-28",
      title: "Club-sandwich complet au blanc de dinde, avocat, tomate et œuf dur",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "8 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "425 kcal / part",
      tags: ["Healthy", "Déjeuner idéal", "Rapide"],
      baseServings: 2,
      costFor2: 4.40,
      description: "Un club-sandwich healthy au pain complet et fromage frais léger, idéal le midi.",
      ingredients: [
        { name: "Pain de mie complet ou pain de campagne", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Blanc de dinde ou poulet (tranches)", qty: 4, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Avocat", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Fromage frais à tartiner", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte", qty: 60, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire griller légèrement les tranches de pain complet et les tartiner de fromage frais.",
        "Garnir de feuilles de salade, rondelles de tomate, lamelles d'avocat et tranches de blanc de dinde.",
        "Refermer, couper en triangles et servir avec le reste de salade verte."
      ]
    },
    {
      id: "wd-29",
      title: "Gnocchis poêlés aux tomates cerises rôties, épinards et billes de mozzarella",
      type: "weekday",
      prepTime: "5 min",
      cookTime: "10 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "435 kcal / part",
      tags: ["Healthy", "Végétarien", "Rapide", "Économique"],
      baseServings: 2,
      costFor2: 3.90,
      description: "Une poêlée italienne prête en 15 minutes, croustillante dehors et fondante dedans.",
      ingredients: [
        { name: "Gnocchis à poêler", qty: 300, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Tomates cerises", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Pousses d'épinards", qty: 120, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Mozzarella", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Huile d'olive & Basilic", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire dorer les gnocchis dans une poêle chaude avec un filet d'huile d'olive pendant 5 minutes.",
        "Ajouter les tomates cerises coupées en deux et les pousses d'épinards, laisser fondre 3 minutes.",
        "Hors du feu, parsemer de dés de mozzarella et de basilic frais, puis servir aussitôt."
      ]
    },
    {
      id: "wd-30",
      title: "Émincé de poulet au curry doux, lait de coco léger et courgettes fondantes",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "445 kcal / part",
      tags: ["Healthy", "Rapide", "Riche en protéines"],
      baseServings: 2,
      costFor2: 5.10,
      description: "Un curry express doux et parfumé, accompagné de riz basmati.",
      ingredients: [
        { name: "Blanc de poulet", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgettes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Lait de coco léger", qty: 150, unit: "ml", aisle: "Épicerie salée" },
        { name: "Riz basmati", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Curry en poudre", qty: 1.5, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Lancer la cuisson du riz basmati dans l'eau bouillante salée.",
        "Couper le poulet et les courgettes en dés, les faire dorer 6 minutes à la poêle avec le curry.",
        "Verser le lait de coco léger, laisser mijoter 5 minutes à feu doux et servir sur le riz."
      ]
    },
    {
      id: "wd-31",
      title: "Salade grecque complète au pois chiches, concombre, tomates, olives et feta",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "0 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "410 kcal / part",
      tags: ["Healthy", "Végétarien", "Sans cuisson", "Déjeuner idéal"],
      baseServings: 2,
      costFor2: 3.80,
      description: "La fraîcheur de la salade crétoise enrichie de pois chiches pour un repas rassasiant sans cuisson.",
      ingredients: [
        { name: "Pois chiches cuits (conserve)", qty: 240, unit: "g", aisle: "Épicerie salée" },
        { name: "Concombre", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomates", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Feta", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Olives noires", qty: 40, unit: "g", aisle: "Épicerie salée" },
        { name: "Huile d'olive & Origan", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Rincer et égoutter les pois chiches. Couper le concombre et les tomates en dés.",
        "Réunir dans un saladier avec les olives noires et la feta coupée en cubes.",
        "Assaisonner d'huile d'olive, d'un trait de citron ou vinaigre et d'origan séché."
      ]
    },
    {
      id: "wd-32",
      title: "Croque-monsieur healthy au four (pain complet, jambon blanc, tomate & mozzarella)",
      type: "weekday",
      prepTime: "7 min",
      cookTime: "10 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Rapide", "Économique"],
      baseServings: 2,
      costFor2: 3.90,
      description: "Le plaisir du croque doré sans béchamel lourde, remplacée par du fromage frais et de la tomate.",
      ingredients: [
        { name: "Pain de mie complet ou pain de campagne", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Jambon blanc découenné", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Mozzarella ou Emmental", qty: 80, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Salade verte", qty: 100, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Préchauffer le four à 200°C (ou utiliser un appareil à croque).",
        "Garnir les tranches de pain de rondelles fines de tomate, jambon blanc et tranches de mozzarella.",
        "Dorer 10 minutes au four et servir bien chaud avec la salade verte."
      ]
    },
    {
      id: "wd-33",
      title: "Filet de merlu meunière au citron, purée de brocolis et pommes de terre",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "395 kcal / part",
      tags: ["Healthy", "Poisson", "Léger"],
      baseServings: 2,
      costFor2: 5.60,
      description: "Un poisson blanc délicatement doré accompagné d'un écrasé vert riche en vitamines.",
      ingredients: [
        { name: "Filets de merlu ou colin", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Brocoli", qty: 1, unit: "tête", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Citron", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive ou beurre", qty: 1, unit: "c. à soupe", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Cuire les pommes de terre en cubes et les bouquets de brocoli 13 minutes dans l'eau bouillante salée, puis les écraser à la fourchette.",
        "Poêler les filets de merlu 3 à 4 minutes par face avec un filet d'huile ou noisette de beurre.",
        "Arroser de jus de citron et servir avec l'écrasé de brocolis."
      ]
    },
    {
      id: "wd-34",
      title: "Nouilles sautées aux légumes croquants, œufs brouillés et sésame (Bami Goreng)",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "440 kcal / part",
      tags: ["Healthy", "Végétarien", "Rapide", "Économique"],
      baseServings: 2,
      costFor2: 3.40,
      description: "Un wok végétarien complet, économique et parfumé à la sauce soja.",
      ingredients: [
        { name: "Nouilles de blé ou de riz", qty: 150, unit: "g", aisle: "Épicerie salée" },
        { name: "Œufs", qty: 3, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Carottes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Poireau ou chou blanc", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Sauce soja", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire les nouilles selon le paquet. Tailler les carottes et le poireau en fines juliennes.",
        "Faire sauter les légumes 6 minutes à feu vif dans un wok, pousser sur le côté et brouiller les œufs.",
        "Ajouter les nouilles égouttées et la sauce soja, mélanger 2 minutes à feu vif."
      ]
    },
    {
      id: "wd-35",
      title: "Velouté de potimarron rôti, éclats de châtaignes ou noisettes & œuf mollet",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "390 kcal / part",
      tags: ["Healthy", "Végétarien", "Réconfortant"],
      baseServings: 2,
      costFor2: 3.70,
      description: "Un velouté d'automne-hiver ultra-doux transformé en plat complet grâce à l'œuf mollet.",
      ingredients: [
        { name: "Potimarron (inutile d'éplucher)", qty: 450, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pain aux céréales", qty: 2, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Crème légère", qty: 2, unit: "c. à soupe", aisle: "Crèmerie & Frais" },
        { name: "Bouillon de légumes", qty: 1, unit: "cube", aisle: "Épicerie salée" }
      ],
      steps: [
        "Couper le potimarron lavé et épépiné en cubes. Cuire 15 minutes dans 400 ml d'eau avec le bouillon.",
        "Cuire les œufs 6 minutes à l'eau bouillante puis les écaler.",
        "Mixer le potimarron avec la crème légère, servir dans deux bols avec l'œuf mollet ouvert au centre et le pain grillé."
      ]
    },
    {
      id: "wd-36",
      title: "Aiguillettes de poulet à la moutarde à l'ancienne, haricots verts et semoule",
      type: "weekday",
      prepTime: "7 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "445 kcal / part",
      tags: ["Healthy", "Rapide", "Riche en protéines"],
      baseServings: 2,
      costFor2: 4.90,
      description: "Une sauce minute légère à la moutarde en grains qui relève tendrement le poulet.",
      ingredients: [
        { name: "Aiguillettes de poulet", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Haricots verts", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Semoule moyenne", qty: 110, unit: "g", aisle: "Épicerie salée" },
        { name: "Moutarde à l'ancienne", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Crème légère 15%", qty: 2, unit: "c. à soupe", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Cuire les haricots verts 10 minutes à l'eau ou vapeur et gonfler la semoule à l'eau bouillante.",
        "Dorer les aiguillettes de poulet 7 minutes à la poêle, puis ajouter la moutarde et la crème légère.",
        "Mélanger 2 minutes à feu doux et servir avec les haricots verts et la semoule."
      ]
    },
    {
      id: "wd-37",
      title: "Pâtes penne à l'arrabbiata douce, courgettes grillées et ricotta fraîche",
      type: "weekday",
      prepTime: "7 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "440 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique"],
      baseServings: 2,
      costFor2: 3.60,
      description: "La douceur lactée de la ricotta vient équilibrer une sauce tomate parfumée à l'ail.",
      ingredients: [
        { name: "Pâtes penne", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Coulis de tomates", qty: 250, unit: "g", aisle: "Épicerie salée" },
        { name: "Ricotta", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Ail", qty: 1, unit: "gousse", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire les penne al dente dans l'eau bouillante salée.",
        "Faire dorer la courgette coupée en petits dés avec l'ail haché pendant 5 minutes, puis verser le coulis de tomates.",
        "Mélanger les pâtes égouttées à la sauce et déposer une belle cuillerée de ricotta fraîche sur chaque assiette."
      ]
    },
    {
      id: "wd-38",
      title: "Salade niçoise express au thon, haricots verts, tomates, œuf dur et pommes de terre",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Déjeuner idéal", "Équilibré"],
      baseServings: 2,
      costFor2: 4.30,
      description: "Toute la Méditerranée dans une assiette complète, fraîche et rassasiante.",
      ingredients: [
        { name: "Thon au naturel (conserve)", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Haricots verts cuits ou surgelés", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Tomates", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Olives noires & Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire les pommes de terre en dés, les haricots verts et les œufs durs pendant 10 à 12 minutes.",
        "Couper les tomates en quartiers et écaler les œufs.",
        "Assembler dans deux grandes assiettes avec le thon émietté et les olives, puis arroser d'un filet d'huile d'olive."
      ]
    },
    {
      id: "wd-39",
      title: "Quesadillas complètes au poulet effiloché, poivrons doux, maïs et cheddar",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "8 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "460 kcal / part",
      tags: ["Healthy", "Rapide", "Ludique"],
      baseServings: 2,
      costFor2: 4.70,
      description: "Des galettes mexicaines dorées à la poêle, croustillantes et accompagnées de salade verte.",
      ingredients: [
        { name: "Tortillas de blé ou maïs", qty: 4, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Émincé de poulet cuit ou rôti", qty: 180, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Poivron rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Maïs doux (conserve)", qty: 80, unit: "g", aisle: "Épicerie salée" },
        { name: "Fromage râpé ou Cheddar", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire revenir le poivron émincé 4 minutes à la poêle avec le poulet et le maïs égoutté.",
        "Répartir la garniture et le fromage sur la moitié des tortillas, replier en demi-lune.",
        "Dorer 2 minutes de chaque côté dans la poêle sèche et servir avec la salade."
      ]
    },
    {
      id: "wd-40",
      title: "Curry de pois chiches et épinards au lait de coco (Chana Palak) & riz basmati",
      type: "weekday",
      prepTime: "6 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "435 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique", "Sans gluten"],
      baseServings: 2,
      costFor2: 3.10,
      description: "Un grand classique végétarien indien ultra-rapide, riche en protéines et minéraux.",
      ingredients: [
        { name: "Pois chiches cuits (conserve)", qty: 250, unit: "g", aisle: "Épicerie salée" },
        { name: "Épinards frais ou surgelés", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Lait de coco léger", qty: 150, unit: "ml", aisle: "Épicerie salée" },
        { name: "Riz basmati", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Garam masala ou Curry", qty: 1.5, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire le riz basmati 10 minutes dans l'eau bouillante salée.",
        "Faire chauffer les pois chiches égouttés avec les épices, le lait de coco et les épinards pendant 8 minutes à feu moyen.",
        "Servir bien chaud sur le riz basmati."
      ]
    },
    {
      id: "wd-41",
      title: "Filet de truite rose au four, rondelles de courgettes au thym et semoule",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "14 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Poisson", "Oméga-3"],
      baseServings: 2,
      costFor2: 5.90,
      description: "La truite, alternative locale et économique au saumon, cuite au four sur lit de courgettes.",
      ingredients: [
        { name: "Pavés de truite", qty: 240, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgettes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Semoule ou boulghour", qty: 110, unit: "g", aisle: "Épicerie salée" },
        { name: "Citron", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive & Thym", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Préchauffer le four à 195°C. Disposer les courgettes en fines rondelles au fond d'un plat, arroser d'un filet d'huile et de thym.",
        "Poser les pavés de truite par-dessus, arroser de citron et enfourner 14 minutes.",
        "Préparer la semoule et servir aussitôt."
      ]
    },
    {
      id: "wd-42",
      title: "Poêlée campagnarde légère de pommes de terre, haricots verts, jambon cru et œuf au plat",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "450 kcal / part",
      tags: ["Healthy", "Économique", "Convivial"],
      baseServings: 2,
      costFor2: 4.10,
      description: "Une assiette rustique mais parfaitement équilibrée avec moitié légumes verts et moitié pommes de terre.",
      ingredients: [
        { name: "Pommes de terre", qty: 300, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Haricots verts", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Jambon cru ou bacon maigre", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Précuire les pommes de terre en dés et les haricots verts 10 minutes à la vapeur ou à l'eau.",
        "Les faire dorer 5 minutes à la poêle avec le jambon cru coupé en lanières.",
        "Cuire les 2 œufs au plat et les déposer sur la poêlée chaude."
      ]
    },
    {
      id: "wd-43",
      title: "Taboulé oriental maison au poulet grillé, menthe fraîche, concombre et tomates",
      type: "weekday",
      prepTime: "12 min",
      cookTime: "8 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Frais", "Déjeuner idéal"],
      baseServings: 2,
      costFor2: 4.50,
      description: "Parfait au déjeuner ou pour un dîner léger plein de fraîcheur.",
      ingredients: [
        { name: "Blanc de poulet", qty: 220, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Semoule moyenne", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Tomates", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Citron & Menthe fraîche", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Réhydrater la semoule avec de l'eau chaude, le jus de citron et l'huile d'olive.",
        "Ajouter les tomates et le concombre coupés en petits dés ainsi que la menthe ciselée.",
        "Saisir les dés de poulet 7 minutes à la poêle et les disposer sur le taboulé."
      ]
    },
    {
      id: "wd-44",
      title: "Spaghettis à l'ail, huile d'olive, brocolis croquants et copeaux de parmesan",
      type: "weekday",
      prepTime: "6 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique", "Rapide"],
      baseServings: 2,
      costFor2: 3.20,
      description: "Un classique italien du quotidien où le brocoli cuit directement avec les pâtes.",
      ingredients: [
        { name: "Spaghettis (blé complet ou classique)", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Brocoli", qty: 1, unit: "tête", aisle: "Fruits & Légumes" },
        { name: "Parmesan râpé", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Ail", qty: 2, unit: "gousses", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Plonger les spaghettis dans l'eau bouillante salée et ajouter les petits bouquets de brocoli 5 minutes avant la fin de cuisson.",
        "Faire revenir l'ail émincé dans l'huile d'olive à feu doux.",
        "Égoutter pâtes et brocolis, mélanger dans la poêle avec l'huile parfumée et le parmesan."
      ]
    },
    {
      id: "wd-45",
      title: "Bagel complet au saumon fumé, fromage frais citronné, concombre et roquette",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "2 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Rapide", "Déjeuner idéal"],
      baseServings: 2,
      costFor2: 5.50,
      description: "Prêt en moins de 10 minutes, frais et gourmand sans excès.",
      ingredients: [
        { name: "Pains bagels au sésame ou complets", qty: 2, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Saumon ou truite fumée", qty: 100, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Fromage frais nature", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Roquette ou mâche", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Ouvrir les bagels en deux et les toaster légèrement.",
        "Tartiner de fromage frais poivré et citronné, puis garnir de rondelles de concombre, de saumon fumé et de roquette.",
        "Servir le reste de roquette et concombre en salade d'accompagnement."
      ]
    },
    {
      id: "wd-46",
      title: "Sauté de dinde aux poivrons, oignon rouge et semoule aux raisins secs",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "440 kcal / part",
      tags: ["Healthy", "Rapide", "Parfumé"],
      baseServings: 2,
      costFor2: 4.80,
      description: "Des saveurs façon tajine express prêtes en 20 minutes.",
      ingredients: [
        { name: "Filets de dinde", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Poivrons", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Semoule moyenne", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Oignon rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Ras-el-hanout ou Cumin", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Émincer l'oignon et les poivrons, les faire revenir 5 minutes à la poêle avec les épices.",
        "Ajouter la dinde coupée en cubes et cuire 7 minutes supplémentaires.",
        "Servir chaud sur la semoule gonflée à l'eau bouillante."
      ]
    },
    {
      id: "wd-47",
      title: "Flan léger de courgettes au basilic, coulis de tomate et jambon blanc",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "18 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "360 kcal / part",
      tags: ["Healthy", "Léger", "Économique"],
      baseServings: 2,
      costFor2: 3.60,
      description: "Un dîner très léger et digeste, riche en protéines et légumes.",
      ingredients: [
        { name: "Courgettes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 3, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Jambon blanc", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait ou crème légère", qty: 100, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Fromage râpé", qty: 30, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Râper les courgettes et les faire revenir 4 minutes à la poêle.",
        "Battre les œufs avec le lait, le fromage râpé et le jambon coupé en dés, puis incorporer les courgettes.",
        "Cuire 15 minutes au four à 190°C (ou à la poêle couverte à feu doux)."
      ]
    },
    {
      id: "wd-48",
      title: "Salade tiède de lentilles vertes, œufs mollets, carottes fanes et moutarde à l'ancienne",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "10 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "415 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique", "Riche en fibres"],
      baseServings: 2,
      costFor2: 3.10,
      description: "Le grand classique bistrot en version healthy et économique.",
      ingredients: [
        { name: "Lentilles vertes cuites (conserve)", qty: 260, unit: "g", aisle: "Épicerie salée" },
        { name: "Œufs", qty: 4, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Carottes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Moutarde à l'ancienne & Huile", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Râper ou couper en fines rondelles les carottes. Réchauffer doucement les lentilles égouttées.",
        "Cuire les œufs 6 minutes dans l'eau bouillante pour qu'ils soient mollets, puis les écaler.",
        "Mélanger les lentilles tièdes avec la vinaigrette à la moutarde, l'échalote et les carottes, puis poser les œufs dessus."
      ]
    },
    {
      id: "wd-49",
      title: "Filet de colin au lait de coco, citron vert, tomates cerises et riz",
      type: "weekday",
      prepTime: "7 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Poisson", "Rapide"],
      baseServings: 2,
      costFor2: 5.40,
      description: "Un poisson poché directement dans une sauce légère au lait de coco et citron vert.",
      ingredients: [
        { name: "Filets de colin ou cabillaud", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Tomates cerises", qty: 150, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Lait de coco léger", qty: 150, unit: "ml", aisle: "Épicerie salée" },
        { name: "Riz basmati", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Citron vert", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire le riz basmati.",
        "Dans une sauteuse, porter à frémissement le lait de coco avec les tomates cerises coupées en deux et le zeste de citron vert.",
        "Déposer les filets de poisson dans la sauce et laisser pocher à couvert 8 à 10 minutes à feu doux. Servir avec le riz."
      ]
    },
    {
      id: "wd-50",
      title: "Tartine nordique sur pain de seigle : avocat, crevettes roses, pamplemousse ou citron",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "0 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "390 kcal / part",
      tags: ["Healthy", "Sans cuisson", "Léger", "Déjeuner idéal"],
      baseServings: 2,
      costFor2: 5.20,
      description: "Inspiré du Smørrebrød danois : ultra-frais, riche en protéines et prêt en 10 minutes.",
      ingredients: [
        { name: "Pain de seigle ou complet", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Crevettes roses cuites décortiquées", qty: 180, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Avocat", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Fromage frais", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Mâche ou jeunes pousses", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Tartiner les tranches de pain de seigle de fromage frais.",
        "Disposer les lamelles d'avocat et les crevettes roses assaisonnées d'un filet de citron et d'aneth ou ciboulette.",
        "Accompagner de la salade de mâche."
      ]
    },
    {
      id: "wd-51",
      title: "Boulettes de bœuf maigre aux herbes, sauce tomate maison et spaghettis complets",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "465 kcal / part",
      tags: ["Healthy", "Classique", "Convivial"],
      baseServings: 2,
      costFor2: 5.20,
      description: "Des boulettes moelleuses mijotées dans un coulis de tomates au basilic.",
      ingredients: [
        { name: "Bœuf haché 5%", qty: 240, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Spaghettis complets", qty: 150, unit: "g", aisle: "Épicerie salée" },
        { name: "Coulis de tomates", qty: 300, unit: "g", aisle: "Épicerie salée" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Herbes de Provence", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Façonner de petites boulettes avec le bœuf haché, du sel, du poivre et les herbes.",
        "Les dorer 5 minutes à la poêle avec l'oignon émincé, puis verser le coulis de tomates et mijoter 7 minutes.",
        "Servir sur les spaghettis complets cuits al dente."
      ]
    },
    {
      id: "wd-52",
      title: "Poêlée de haricots blancs à la provençale, tomates, thon et persil frais",
      type: "weekday",
      prepTime: "5 min",
      cookTime: "10 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Économique", "Placard", "Rapide"],
      baseServings: 2,
      costFor2: 3.30,
      description: "Une recette du placard ultra-rapide et savoureuse aux accents du Sud.",
      ingredients: [
        { name: "Haricots blancs cuits (conserve)", qty: 260, unit: "g", aisle: "Épicerie salée" },
        { name: "Thon au naturel (conserve)", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Tomates concassées", qty: 200, unit: "g", aisle: "Épicerie salée" },
        { name: "Ail & Persil", qty: 1, unit: "gousse", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire revenir l'ail haché dans l'huile d'olive puis ajouter les tomates concassées et laisser réduire 4 minutes.",
        "Incorporer les haricots blancs rincés et le thon émietté, chauffer 5 minutes à feu doux.",
        "Parsemer de persil ciselé et servir chaud."
      ]
    },
    {
      id: "wd-53",
      title: "Omelette espagnole légère (Tortilla) aux pommes de terre vapeur, oignon et salade",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "410 kcal / part",
      tags: ["Healthy", "Végétarien", "Économique"],
      baseServings: 2,
      costFor2: 3.00,
      description: "Une tortilla fondante préparée sans friture grâce à une précuisson vapeur des pommes de terre.",
      ingredients: [
        { name: "Œufs", qty: 4, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pommes de terre", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Salade verte", qty: 100, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Couper les pommes de terre en fines rondelles et les précuire 8 minutes à l'eau ou au micro-ondes couvert.",
        "Les dorer 3 minutes à la poêle avec l'oignon émincé, puis verser les œufs battus.",
        "Cuire 4 minutes par face et servir avec la salade verte."
      ]
    },
    {
      id: "wd-54",
      title: "Salade thaïe au bœuf mariné (ou poulet), concombre, carottes, menthe et vermicelles",
      type: "weekday",
      prepTime: "12 min",
      cookTime: "6 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "435 kcal / part",
      tags: ["Healthy", "Frais", "Riche en protéines"],
      baseServings: 2,
      costFor2: 5.60,
      description: "Inspirée du Bo Bun : fraîche, parfumée à la menthe et très légère.",
      ingredients: [
        { name: "Bavette de bœuf ou filet de poulet", qty: 220, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Vermicelles de riz", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Carotte", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Menthe fraîche & Citron vert", qty: 0.5, unit: "botte", aisle: "Fruits & Légumes" },
        { name: "Sauce soja", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Réhydrater les vermicelles de riz 4 minutes dans l'eau bouillante puis les égoutter.",
        "Râper la carotte, couper le concombre en bâtonnets et ciseler la menthe.",
        "Saisir la viande émincée 4 minutes à feu vif avec la sauce soja et dresser le tout dans deux bols."
      ]
    },
    {
      id: "wd-55",
      title: "Gratin express de chou-fleur et pommes de terre au jambon et béchamel légère",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Très économique)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Économique", "Réconfortant"],
      baseServings: 2,
      costFor2: 3.90,
      description: "Le grand classique familial allégé avec du lait demi-écrémé et de la muscade.",
      ingredients: [
        { name: "Chou-fleur (frais ou surgelé)", qty: 350, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Jambon blanc", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait demi-écrémé & Maïzena", qty: 200, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Emmental râpé", qty: 40, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Cuire les bouquets de chou-fleur et les dés de pommes de terre 10 minutes à l'eau bouillante.",
        "Épaissir le lait chaud avec 1 c. à soupe de Maïzena, sel, poivre et muscade.",
        "Mélanger légumes, lanières de jambon et sauce dans un plat, parsemer d'emmental et gratiner 5 minutes sous le gril."
      ]
    },
    {
      id: "wd-56",
      title: "Pita garnie façon gyros grec : poulet grillé au paprika, tzatziki léger et crudités",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "8 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "440 kcal / part",
      tags: ["Healthy", "Rapide", "Ludique"],
      baseServings: 2,
      costFor2: 4.80,
      description: "Des pains pita chauds garnis de poulet doré et d'une sauce fraîche yaourt-concombre.",
      ingredients: [
        { name: "Pains pita", qty: 2, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Filets de poulet", qty: 240, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Yaourt grec", qty: 1, unit: "pot", aisle: "Crèmerie & Frais" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire dorer le poulet émincé avec du paprika, de l'origan et un filet d'huile d'olive pendant 7 minutes.",
        "Râper la moitié du concombre et la mélanger au yaourt grec avec sel, poivre et menthe ou ail.",
        "Chauffer les pains pita, les ouvrir et les garnir de tzatziki, tomate, concombre et poulet."
      ]
    },
    {
      id: "wd-57",
      title: "Risotto express de coquillettes au jambon blanc, petits pois et parmesan",
      type: "weekday",
      prepTime: "5 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Très économique)",
      calories: "450 kcal / part",
      tags: ["Healthy", "Rapide", "Économique"],
      baseServings: 2,
      costFor2: 3.60,
      description: "Le coquillettes-jambon façon risotto avec des petits pois verts pour l'équilibre.",
      ingredients: [
        { name: "Coquillettes", qty: 150, unit: "g", aisle: "Épicerie salée" },
        { name: "Jambon blanc découenné", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Petits pois (frais ou surgelés)", qty: 150, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Parmesan ou Comté râpé", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Bouillon de légumes", qty: 1, unit: "cube", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire les coquillettes et les petits pois dans une sauteuse avec 450 ml d'eau bouillante et le cube de bouillon pendant 10 minutes jusqu'à absorption.",
        "Hors du feu, incorporer le jambon coupé en dés et le fromage râpé pour lier."
      ]
    },
    {
      id: "wd-58",
      title: "Salade d'automne-printemps : quinoa, betterave rouge, chèvre frais et noix",
      type: "weekday",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "430 kcal / part",
      tags: ["Healthy", "Végétarien", "Déjeuner idéal"],
      baseServings: 2,
      costFor2: 4.20,
      description: "Une salade colorée, riche en antioxydants et très rassasiante.",
      ingredients: [
        { name: "Quinoa", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Betterave rouge cuite", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Fromage de chèvre frais", qty: 80, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Mâche", qty: 80, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Cerneaux de noix", qty: 25, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Cuire le quinoa 12 minutes dans l'eau bouillante puis le passer sous l'eau froide et l'égoutter.",
        "Couper la betterave en dés et émietter le chèvre frais.",
        "Assembler dans deux bols sur un lit de mâche avec les noix concassées et une vinaigrette légère."
      ]
    },
    {
      id: "wd-59",
      title: "Poêlée de crevettes, poireaux fondants au curry et riz basmati",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "425 kcal / part",
      tags: ["Healthy", "Poisson", "Rapide"],
      baseServings: 2,
      costFor2: 5.70,
      description: "L'alliance subtile des poireaux fondants au curry doux et des crevettes sautées.",
      ingredients: [
        { name: "Crevettes décortiquées", qty: 200, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Poireaux", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Riz basmati", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Crème légère 15%", qty: 2, unit: "c. à soupe", aisle: "Crèmerie & Frais" },
        { name: "Curry doux", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Laver et émincer les poireaux, les faire fondre 10 minutes à couvert avec un fond d'eau et le curry.",
        "Cuire le riz en parallèle.",
        "Ajouter les crevettes et la crème légère dans les poireaux, chauffer 3 minutes et servir avec le riz."
      ]
    },
    {
      id: "wd-60",
      title: "Bruschettas chaudes à la tomate fraîche, jambon Serrano, mozzarella et roquette",
      type: "weekday",
      prepTime: "8 min",
      cookTime: "7 min",
      difficulty: "Très facile",
      budget: "€ (Bon marché)",
      calories: "420 kcal / part",
      tags: ["Healthy", "Rapide", "Italien"],
      baseServings: 2,
      costFor2: 4.50,
      description: "De grandes tartines italiennes dorées au four, servies sur un lit de roquette.",
      ingredients: [
        { name: "Pain de campagne (grandes tranches)", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Tomates mûres", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Jambon cru Serrano", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Mozzarella", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Roquette", qty: 80, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Ail & Huile d'olive", qty: 1, unit: "gousse", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Frotter les tranches de pain avec la gousse d'ail, répartir les tomates en petits dés et la mozzarella.",
        "Passer 7 minutes au four à 200°C jusqu'à ce que le fromage fonde.",
        "Ajouter le jambon Serrano et la roquette fraîche à la sortie du four."
      ]
    }
  ],

  // =========================================================================
  // 2. REPAS DU WEEK-END ÉQUILIBRÉS / CONVIVIAUX (pour les 2 repas hors menus Plaisir)
  // =========================================================================
  weekendBalancedMeals: [
    {
      id: "we-b1",
      title: "Poulet rôti aux herbes de Provence, pommes grenailles et haricots verts",
      type: "weekend-balanced",
      prepTime: "10 min",
      cookTime: "30 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "510 kcal / part",
      tags: ["Convivial", "Équilibré", "Week-end"],
      baseServings: 2,
      description: "L'incontournable du week-end en version légère et parfumée au thym et romarin.",
      ingredients: [
        { name: "Cuisses ou filets de poulet fermier", qty: 350, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pommes de terre grenailles", qty: 350, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Haricots verts", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Ail", qty: 2, unit: "gousses", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive & Herbes de Provence", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Préchauffer le four à 200°C. Laver les pommes grenailles et les couper en deux.",
        "Disposer le poulet et les pommes de terre dans un plat à four avec les gousses d'ail en chemise, l'huile d'olive et les herbes.",
        "Enfourner pour 30 minutes en retournant les pommes de terre à mi-cuisson.",
        "Cuire les haricots verts à la vapeur 10 minutes et servir l'ensemble bien chaud."
      ]
    },
    {
      id: "we-b2",
      title: "Tarte fine rustique à la tomate, moutarde à l'ancienne et chèvre, salade verte",
      type: "weekend-balanced",
      prepTime: "10 min",
      cookTime: "25 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "490 kcal / part",
      tags: ["Végétarien", "Week-end", "Convivial"],
      baseServings: 2,
      description: "Une tarte croustillante et dorée aux saveurs du Sud, servie avec une belle salade croquante.",
      ingredients: [
        { name: "Pâte brisée", qty: 1, unit: "rouleau", aisle: "Crèmerie & Frais" },
        { name: "Tomates mûres", qty: 4, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Bûche de chèvre", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Moutarde à l'ancienne", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Salade verte mélangée", qty: 120, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Préchauffer le four à 200°C. Étaler la pâte brisée et napper le fond de moutarde à l'ancienne.",
        "Disposer les tomates coupées en rondelles et parsemer de tranches de bûche de chèvre et d'origan.",
        "Replier légèrement les bords de la pâte et enfourner 25 minutes jusqu'à ce qu'elle soit bien dorée.",
        "Servir avec la salade verte assaisonnée."
      ]
    },
    {
      id: "we-b3",
      title: "Filet mignon de porc à la moutarde douce et poêlée de légumes racines",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "25 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "495 kcal / part",
      tags: ["Week-end", "Équilibré", "Savoureux"],
      baseServings: 2,
      description: "Une viande très tendre et peu grasse nappée d'une sauce légère à la moutarde.",
      ingredients: [
        { name: "Filet mignon de porc", qty: 320, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Carottes", qty: 3, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Crème légère 15%", qty: 3, unit: "c. à soupe", aisle: "Crèmerie & Frais" },
        { name: "Moutarde de Dijon", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Couper le filet mignon en médaillons et les dorer 3 minutes par face dans une cocotte avec l'oignon émincé.",
        "Ajouter les carottes et pommes de terre coupées en petits morceaux avec un demi-verre d'eau, couvrir et laisser mijoter 18 minutes.",
        "En fin de cuisson, lier le jus avec la moutarde et la crème légère.",
        "Servir bien chaud."
      ]
    },
    {
      id: "we-b4",
      title: "Pavé de cabillaud rôti en croûte d'herbes, écrasé de patate douce",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "20 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "465 kcal / part",
      tags: ["Poisson", "Week-end", "Healthy"],
      baseServings: 2,
      description: "Une assiette digne d'un bistrot, saine et pleine de couleurs pour le week-end.",
      ingredients: [
        { name: "Dos de cabillaud", qty: 300, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Patates douces", qty: 400, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Chapelure", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Persil frais", qty: 0.5, unit: "botte", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Préchauffer le four à 190°C. Éplucher et cuire les patates douces en cubes 15 minutes dans l'eau bouillante salée.",
        "Mélanger la chapelure, le persil ciselé et 1 cuillère d'huile d'olive, puis en recouvrir les dos de cabillaud.",
        "Enfourner le poisson pendant 12 à 15 minutes.",
        "Écraser les patates douces à la fourchette avec un filet d'huile d'olive et servir avec le cabillaud croustillant."
      ]
    },
    {
      id: "we-b5",
      title: "Shakshuka royale aux légumes grillés, feta rôtie et pain pita",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "20 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "480 kcal / part",
      tags: ["Végétarien", "Week-end", "Convivial"],
      baseServings: 2,
      description: "Idéal pour un déjeuner ou dîner du week-end ensoleillé et convivial à partager.",
      ingredients: [
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Poivron rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomates concassées", qty: 400, unit: "g", aisle: "Épicerie salée" },
        { name: "Œufs", qty: 4, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Feta", qty: 80, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Pains pita", qty: 2, unit: "pièces", aisle: "Boulangerie & Divers" }
      ],
      steps: [
        "Couper la courgette et le poivron en dés et les faire dorer 8 minutes à la poêle avec un filet d'huile d'olive.",
        "Ajouter les tomates concassées, saler, poivrer et laisser mijoter 6 minutes.",
        "Casser les œufs sur la sauce, émietter la feta autour et couvrir 5 minutes.",
        "Chauffer les pains pita au grille-pain et servir immédiatement."
      ]
    },
    {
      id: "we-b6",
      title: "Brochettes de poulet marinées au citron et taboulé maison menthe-grenade",
      type: "weekend-balanced",
      prepTime: "15 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "475 kcal / part",
      tags: ["Week-end", "Frais", "Équilibré"],
      baseServings: 2,
      description: "Un repas frais et parfumé qui sent bon la Méditerranée.",
      ingredients: [
        { name: "Filets de poulet", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Semoule moyenne", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Tomates", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Concombre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Menthe fraîche", qty: 0.5, unit: "botte", aisle: "Fruits & Légumes" },
        { name: "Citron", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Gonfler la semoule avec son volume d'eau chaude, le jus d'un demi-citron et 1 c. à soupe d'huile d'olive.",
        "Couper les tomates et le concombre en tout petits dés, ciseler la menthe et mélanger à la semoule.",
        "Couper le poulet en cubes, l'arroser du reste de citron et le griller à la poêle 10 minutes.",
        "Servir les brochettes chaudes avec le taboulé frais."
      ]
    },
    {
      id: "we-b7",
      title: "Tajine léger de poulet aux abricots secs, amandes effilées et semoule",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "25 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "495 kcal / part",
      tags: ["Week-end", "Convivial", "Sucré-salé"],
      baseServings: 2,
      costFor2: 6.90,
      description: "Un tajine parfumé à la cannelle et au gingembre, tendre et léger.",
      ingredients: [
        { name: "Blancs ou hauts de cuisse de poulet", qty: 300, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Abricots secs moelleux", qty: 60, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Semoule moyenne", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Amandes effilées", qty: 20, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Ras-el-hanout & Cannelle", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire dorer le poulet et l'oignon émincé dans une sauteuse avec les épices pendant 5 minutes.",
        "Ajouter les abricots secs et un verre d'eau, couvrir et laisser mijoter 20 minutes à feu doux.",
        "Servir sur la semoule chaude parsemée d'amandes effilées grillées à sec."
      ]
    },
    {
      id: "we-b8",
      title: "Pavé de saumon rôti au miel et moutarde, riz sauvage et brocolis croquants",
      type: "weekend-balanced",
      prepTime: "10 min",
      cookTime: "18 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "510 kcal / part",
      tags: ["Poisson", "Week-end", "Healthy"],
      baseServings: 2,
      costFor2: 7.80,
      description: "Un glaçage miel-moutarde à l'ancienne qui caramélise délicatement le saumon au four.",
      ingredients: [
        { name: "Pavés de saumon", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Brocoli", qty: 1, unit: "tête", aisle: "Fruits & Légumes" },
        { name: "Riz complet ou mélange 3 riz", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Moutarde à l'ancienne", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Miel", qty: 1, unit: "c. à café", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Préchauffer le four à 195°C. Badigeonner les pavés de saumon du mélange miel-moutarde et enfourner 14 minutes.",
        "Cuire le riz et les bouquets de brocoli à la vapeur.",
        "Dresser dans les assiettes avec le jus de cuisson du poisson."
      ]
    },
    {
      id: "we-b9",
      title: "Tian provençal de courgettes, aubergines, tomates et mozzarella rôtie, filet de volaille",
      type: "weekend-balanced",
      prepTime: "15 min",
      cookTime: "30 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "460 kcal / part",
      tags: ["Week-end", "Méditerranéen", "Healthy"],
      baseServings: 2,
      costFor2: 6.20,
      description: "Les couleurs et parfums du Sud dans un plat familial équilibré.",
      ingredients: [
        { name: "Filets de poulet", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomates", qty: 3, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Mozzarella", qty: 125, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Herbes de Provence & Huile d'olive", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Préchauffer le four à 190°C. Alterner verticalement dans un plat les rondelles de courgette, tomate et tranches de mozzarella.",
        "Arroser d'huile d'olive, parsemer d'herbes et enfourner 30 minutes.",
        "Griller les filets de poulet à la poêle et les servir avec le tian fondant."
      ]
    },
    {
      id: "we-b10",
      title: "Wok de bœuf mariné au gingembre, poivrons rouges, brocolis et nouilles udon",
      type: "weekend-balanced",
      prepTime: "15 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "490 kcal / part",
      tags: ["Week-end", "Asiatique", "Équilibré"],
      baseServings: 2,
      costFor2: 7.40,
      description: "Un sauté minute riche en légumes croquants et bœuf tendre.",
      ingredients: [
        { name: "Bavette ou rumsteck de bœuf", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Brocoli", qty: 0.5, unit: "tête", aisle: "Fruits & Légumes" },
        { name: "Poivron rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Nouilles asiatiques", qty: 150, unit: "g", aisle: "Épicerie salée" },
        { name: "Sauce soja & Gingembre", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Émincer le bœuf en fines lamelles et le mariner avec la sauce soja et le gingembre.",
        "Faire sauter les petits bouquets de brocoli et les lanières de poivron 7 minutes au wok.",
        "Saisir le bœuf 3 minutes à feu vif, ajouter les nouilles cuites et servir."
      ]
    },
    {
      id: "we-b11",
      title: "Quiche lorraine légère sur pâte brisée maison ou fine, jambon blanc et salade aux noix",
      type: "weekend-balanced",
      prepTime: "10 min",
      cookTime: "28 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "485 kcal / part",
      tags: ["Week-end", "Convivial", "Classique"],
      baseServings: 2,
      costFor2: 4.90,
      description: "Une quiche dorée préparée avec du lait, de la crème légère et du jambon découenné.",
      ingredients: [
        { name: "Pâte brisée", qty: 1, unit: "rouleau", aisle: "Crèmerie & Frais" },
        { name: "Œufs", qty: 3, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Jambon blanc ou allumettes de bacon maigre", qty: 150, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait & Crème légère", qty: 200, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Comté ou Emmental râpé", qty: 50, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte", qty: 100, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Foncer un moule avec la pâte brisée et répartir les dés de jambon ou bacon.",
        "Battre les œufs avec le lait, la crème légère, la muscade et le fromage râpé.",
        "Enfourner 28 minutes à 190°C et déguster avec la salade verte."
      ]
    },
    {
      id: "we-b12",
      title: "Dorade ou bar au four au citron et fenouil, pommes de terre vapeur persillées",
      type: "weekend-balanced",
      prepTime: "10 min",
      cookTime: "22 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "460 kcal / part",
      tags: ["Poisson", "Week-end", "Healthy"],
      baseServings: 2,
      costFor2: 8.20,
      description: "Un plat de poisson raffiné et très simple à réussir le week-end.",
      ingredients: [
        { name: "Filets de dorade ou bar", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Bulbe de fenouil (ou courgette)", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 300, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Citron", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Émincer finement le fenouil, le disposer dans un plat à four avec les filets de poisson, des rondelles de citron et l'huile d'olive.",
        "Enfourner 20 minutes à 190°C et servir avec les pommes de terre vapeur."
      ]
    },
    {
      id: "we-b13",
      title: "Risotto printanier aux petits pois, courgettes, menthe et jambon cru croustillant",
      type: "weekend-balanced",
      prepTime: "10 min",
      cookTime: "20 min",
      difficulty: "Moyenne",
      budget: "€ (Bon marché)",
      calories: "495 kcal / part",
      tags: ["Week-end", "Italien", "Équilibré"],
      baseServings: 2,
      costFor2: 5.80,
      description: "Un risotto vert et léger, relevé par des éclats de jambon cru doré.",
      ingredients: [
        { name: "Riz à risotto (Arborio)", qty: 150, unit: "g", aisle: "Épicerie salée" },
        { name: "Petits pois", qty: 150, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Jambon cru", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Parmesan râpé", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Bouillon de légumes", qty: 1, unit: "cube", aisle: "Épicerie salée" }
      ],
      steps: [
        "Nacrer le riz dans une sauteuse puis mouiller louche par louche avec 550 ml de bouillon chaud pendant 18 minutes.",
        "Ajouter les petits pois et les petits dés de courgette à mi-cuisson.",
        "Lier au parmesan et servir garni de lanières de jambon cru grillées à sec."
      ]
    },
    {
      id: "we-b14",
      title: "Suprêmes de volaille rôtis au citron confit, carottes fanes glacées et boulghour",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "22 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "480 kcal / part",
      tags: ["Week-end", "Convivial", "Healthy"],
      baseServings: 2,
      costFor2: 6.50,
      description: "Des carottes fondantes légèrement caramélisées au jus d'orange ou citron.",
      ingredients: [
        { name: "Filets de poulet fermier", qty: 300, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Carottes", qty: 4, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Boulghour", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Citron", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Cumin & Huile d'olive", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Couper les carottes en bâtonnets et les faire étuver 18 minutes à couvert avec un fond d'eau, du cumin et du jus de citron.",
        "Poêler les suprêmes de volaille 10 minutes jusqu'à ce qu'ils soient bien dorés et cuire le boulghour."
      ]
    },
    {
      id: "we-b15",
      title: "Lasagnes végétariennes aux épinards, ricotta et coulis de tomates au basilic",
      type: "weekend-balanced",
      prepTime: "15 min",
      cookTime: "25 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "490 kcal / part",
      tags: ["Végétarien", "Week-end", "Italien"],
      baseServings: 2,
      costFor2: 5.50,
      description: "Plus légères que les lasagnes classiques, ultra-fondantes grâce à la ricotta.",
      ingredients: [
        { name: "Feuilles de lasagnes", qty: 6, unit: "pièces", aisle: "Épicerie salée" },
        { name: "Épinards frais ou surgelés", qty: 300, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Ricotta", qty: 200, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Coulis de tomates", qty: 350, unit: "g", aisle: "Épicerie salée" },
        { name: "Mozzarella ou Emmental râpé", qty: 60, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Faire tomber les épinards 4 minutes à la poêle puis les mélanger hors du feu avec la ricotta, sel, poivre et muscade.",
        "Alterner dans un plat à gratin coulis de tomates, feuilles de lasagnes et farce ricotta-épinards.",
        "Parsemer de fromage râpé et enfourner 25 minutes à 190°C."
      ]
    },
    {
      id: "we-b16",
      title: "Brochettes de gambas ou grosses crevettes à l'ananas rôti et riz parfumé",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "450 kcal / part",
      tags: ["Poisson", "Week-end", "Exotique"],
      baseServings: 2,
      costFor2: 7.90,
      description: "Une assiette ensoleillée, légère et festive pour le week-end.",
      ingredients: [
        { name: "Grosses crevettes décortiquées", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Ananas frais ou au jus naturel", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Riz basmati ou thaï", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Citron vert & Sauce soja", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire le riz parfumé.",
        "Poêler les dés d'ananas et les crevettes à feu vif pendant 5 à 6 minutes avec le jus de citron vert et la sauce soja.",
        "Dresser sur le riz chaud."
      ]
    },
    {
      id: "we-b17",
      title: "Couscous express de légumes d'été & automne aux pois chiches et filet de poulet grillé",
      type: "weekend-balanced",
      prepTime: "15 min",
      cookTime: "20 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "505 kcal / part",
      tags: ["Week-end", "Convivial", "Équilibré"],
      baseServings: 2,
      costFor2: 5.90,
      description: "Tout le plaisir d'un couscous parfumé prêt en 30 minutes et sans excès de gras.",
      ingredients: [
        { name: "Filets de poulet", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Semoule à couscous", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Pois chiches cuits", qty: 150, unit: "g", aisle: "Épicerie salée" },
        { name: "Courgette & Carottes", qty: 3, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Épices à couscous (Ras-el-hanout)", qty: 1.5, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Couper les carottes et la courgette en morceaux et les cuire 18 minutes dans un bouillon parfumé au ras-el-hanout avec les pois chiches.",
        "Griller le poulet à la poêle et gonfler la semoule.",
        "Servir la semoule arrosée de bouillon et garnie des légumes et du poulet."
      ]
    },
    {
      id: "we-b18",
      title: "Aubergines rôties au four façon Parmigiana légère (tomate, basilic, mozzarella)",
      type: "weekend-balanced",
      prepTime: "15 min",
      cookTime: "25 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "440 kcal / part",
      tags: ["Végétarien", "Week-end", "Italien"],
      baseServings: 2,
      costFor2: 5.40,
      description: "Des aubergines dorées au four sans friture, nappées de tomate et mozzarella fondante.",
      ingredients: [
        { name: "Aubergines", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Coulis de tomates", qty: 350, unit: "g", aisle: "Épicerie salée" },
        { name: "Mozzarella", qty: 125, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Parmesan râpé", qty: 30, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Pain ciabatta ou campagne", qty: 2, unit: "tranches", aisle: "Boulangerie & Divers" }
      ],
      steps: [
        "Couper les aubergines en tranches et les précuire 12 minutes au four à 200°C (ou à la poêle couverte).",
        "Monter en couches dans un plat avec le coulis de tomates, la mozzarella et le parmesan, puis gratiner 15 minutes.",
        "Déguster avec le pain grillé."
      ]
    },
    {
      id: "we-b19",
      title: "Bavette d'aloyau grillée aux échalotes confites, haricots verts et pommes au four",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "20 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "515 kcal / part",
      tags: ["Week-end", "Bistrot", "Équilibré"],
      baseServings: 2,
      costFor2: 8.40,
      description: "Le classique de brasserie du week-end en version saine avec pommes rôties au four.",
      ingredients: [
        { name: "Bavettes de bœuf", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pommes de terre", qty: 300, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Haricots verts", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Échalotes", qty: 3, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Huile d'olive & Vinaigre balsamique", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Rôtir les quartiers de pommes de terre 20 minutes au four à 200°C et cuire les haricots verts à la vapeur.",
        "Faire fondre les échalotes émincées à feu doux avec un trait de vinaigre balsamique.",
        "Saisir les bavettes 2 à 3 minutes par face et napper des échalotes confites."
      ]
    },
    {
      id: "we-b20",
      title: "Paëlla express de la mer (crevettes, colin, petits pois, poivrons et riz safrané)",
      type: "weekend-balanced",
      prepTime: "12 min",
      cookTime: "20 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "490 kcal / part",
      tags: ["Poisson", "Week-end", "Convivial"],
      baseServings: 2,
      costFor2: 7.60,
      description: "Une poêlée espagnole conviviale et complète, cuite dans une seule sauteuse.",
      ingredients: [
        { name: "Crevettes décortiquées", qty: 150, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Filet de colin ou cabillaud", qty: 150, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Riz long ou rond", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Poivron rouge & Petits pois", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Curcuma ou épices à paëlla", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire revenir le poivron en dés dans une grande poêle, ajouter le riz et les épices.",
        "Verser 350 ml d'eau chaude salée et cuire 15 minutes à feu doux avec les petits pois.",
        "Disposer les morceaux de poisson et les crevettes sur le riz pour les 5 dernières minutes de cuisson à couvert."
      ]
    },
    {
      id: "we-b21",
      title: "Poke Bowl festif au saumon mariné soja-sésame, mangue fraîche, avocat et riz",
      type: "weekend-balanced",
      prepTime: "15 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "510 kcal / part",
      tags: ["Poisson", "Week-end", "Frais"],
      baseServings: 2,
      costFor2: 8.10,
      description: "Coloré, frais et exotique, idéal pour un déjeuner de week-end.",
      ingredients: [
        { name: "Pavé de saumon très frais", qty: 220, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Mangue mûre", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Avocat", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Riz", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Sauce soja & Graines de sésame", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Cuire le riz et le laisser tiédir.",
        "Couper le saumon, la mangue et l'avocat en dés.",
        "Mariner le saumon dans la sauce soja et dresser harmonieusement sur le riz."
      ]
    },
    {
      id: "we-b22",
      title: "Galettes bretonnes forestières au poulet, champignons poêlés, œuf et cidre brut",
      type: "weekend-balanced",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "480 kcal / part",
      tags: ["Week-end", "Convivial", "Équilibré"],
      baseServings: 2,
      costFor2: 5.30,
      description: "Une crêperie à la maison avec une garniture forestière légère.",
      ingredients: [
        { name: "Galettes de sarrasin", qty: 2, unit: "pièces", aisle: "Crèmerie & Frais" },
        { name: "Blanc de poulet", qty: 200, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Champignons de Paris", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Crème légère & Emmental râpé", qty: 50, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Poêler les champignons émincés et les petits dés de poulet 8 minutes, lier d'une cuillère de crème légère.",
        "Garnir les galettes de sarrasin du mélange, d'un œuf et de fromage, replier et servir avec la salade."
      ]
    }
  ],

  // =========================================================================
  // 3. MENUS PLAISIR (SEMAINE & WEEK-END) : Se faire plaisir même si moins équilibrés, simples et rapides à réaliser
  // =========================================================================
  weekendPleasureMeals: [
    {
      id: "we-p1",
      title: "Burgers gourmets maison au cheddar affiné, oignons caramélisés & potatoes express",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "680 kcal / part",
      tags: ["Menu Plaisir 🌟", "Gourmand", "Simple & Rapide"],
      baseServings: 2,
      description: "Le vrai burger bistrot fait maison ultra-gourmand avec cheddar coulant et oignons fondants, prêt en un clin d'œil.",
      ingredients: [
        { name: "Pains burgers briochés", qty: 2, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Steaks hachés bœuf bouchère", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Cheddar affiné en tranches", qty: 4, unit: "tranches", aisle: "Crèmerie & Frais" },
        { name: "Pommes de terre grenailles ou potatoes précuites", qty: 350, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Oignon rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Sauce burger & feuilles de salade", qty: 1, unit: "portion", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire dorer les potatoes à la poêle ou à l'Airfryer pendant 12 minutes avec une pincée de paprika.",
        "Émincer l'oignon rouge et le faire caraméliser 5 minutes à la poêle avec une noisette de beurre et un trait de vinaigre balsamique.",
        "Saisir les steaks hachés à feu vif 3 minutes par face, déposer le cheddar dessus à couvert 1 minute pour qu'il fonde.",
        "Toaster les pains briochés, napper de sauce burger, garnir avec steak au cheddar et oignons fondants."
      ]
    },
    {
      id: "we-p2",
      title: "Risotto express crémeux aux champignons bruns, crème fraîche et copeaux de parmesan",
      type: "weekend-pleasure",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "590 kcal / part",
      tags: ["Menu Plaisir 🌟", "Italien", "Simple & Rapide"],
      baseServings: 2,
      description: "Un risotto ultra-onctueux et réconfortant enrichi de crème et de parmesan généreux.",
      ingredients: [
        { name: "Riz à risotto (Arborio cuisson rapide)", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Champignons bruns de Paris", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Parmesan râpé ou copeaux", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Crème fraîche épaisse", qty: 60, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Bouillon de légumes", qty: 1, unit: "cube", aisle: "Épicerie salée" },
        { name: "Beurre", qty: 20, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Poêler les champignons émincés 5 minutes à feu vif avec une noisette de beurre.",
        "Nacrer le riz dans la sauteuse 1 minute, puis verser 500 ml de bouillon chaud et laisser cuire 12 à 14 minutes à petits bouillons.",
        "Hors du feu, lier généreusement avec la crème fraîche et le parmesan. Servir bien chaud."
      ]
    },
    {
      id: "we-p3",
      title: "Lasagnes express à la poêle : bolognaise fondante, ricotta et mozzarella gratinée",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "640 kcal / part",
      tags: ["Menu Plaisir 🌟", "Gratiné", "Simple & Rapide"],
      baseServings: 2,
      description: "Tout le plaisir fondant des lasagnes italiennes gratinées à la mozzarella, préparées sans attendre en 15 minutes à la sauteuse.",
      ingredients: [
        { name: "Feuilles de lasagnes fraîches", qty: 6, unit: "pièces", aisle: "Crèmerie & Frais" },
        { name: "Bœuf haché", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Coulis de tomates cuisiné", qty: 350, unit: "g", aisle: "Épicerie salée" },
        { name: "Ricotta ou crème épaisse", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Mozzarella râpée", qty: 80, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire revenir l'oignon émincé et le bœuf haché 5 minutes dans une sauteuse, puis verser le coulis de tomates.",
        "Glisser les feuilles de lasagnes fraîches coupées en deux directement dans la sauce, ajouter des cuillerées de ricotta et parsemer de mozzarella.",
        "Couvrir la sauteuse et laisser fondre et gratiner 10 minutes à feu doux."
      ]
    },
    {
      id: "we-p4",
      title: "Tagliatelles fraîches au saumon fumé, crème épaisse citronnée et aneth",
      type: "weekend-pleasure",
      prepTime: "8 min",
      cookTime: "8 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "610 kcal / part",
      tags: ["Menu Plaisir 🌟", "Poisson", "Simple & Rapide"],
      baseServings: 2,
      description: "Un grand classique gourmand et généreux en crème, prêt en moins de 15 minutes chrono.",
      ingredients: [
        { name: "Tagliatelles fraîches", qty: 250, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Saumon fumé", qty: 120, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Crème fraîche épaisse", qty: 140, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Citron non traité", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Aneth ou ciboulette", qty: 0.5, unit: "botte", aisle: "Fruits & Légumes" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire fondre l'échalote ciselée 2 minutes à la poêle, ajouter la crème fraîche et le zeste de citron.",
        "Cuire les tagliatelles fraîches 3 minutes dans l'eau bouillante salée.",
        "Enrober les pâtes égouttées dans la crème avec les lanières de saumon fumé et l'aneth hors du feu."
      ]
    },
    {
      id: "we-p5",
      title: "Curry thaï ultra-crémeux de crevettes au lait de coco et riz jasmin",
      type: "weekend-pleasure",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "580 kcal / part",
      tags: ["Menu Plaisir 🌟", "Exotique", "Simple & Rapide"],
      baseServings: 2,
      description: "Une sauce coco onctueuse et parfumée qui se prépare en 12 minutes pour un vrai plaisir d'évasion.",
      ingredients: [
        { name: "Grosses crevettes décortiquées", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait de coco crémeux", qty: 200, unit: "ml", aisle: "Épicerie salée" },
        { name: "Poivron rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Riz thaï ou jasmin", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Pâte de curry doux ou curry jaune", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Citron vert & Coriandre", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Lancer la cuisson du riz jasmin.",
        "Faire sauter le poivron émincé 4 minutes à la poêle avec la pâte de curry, puis verser le lait de coco.",
        "Laisser réduire 5 minutes, ajouter les crevettes 2 minutes pour les réchauffer et servir avec le riz."
      ]
    },
    {
      id: "we-p6",
      title: "Quesadillas & Fajitas mexicaines croustillantes au poulet, cheddar fondant et guacamole",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "630 kcal / part",
      tags: ["Menu Plaisir 🌟", "Convivial", "Simple & Rapide"],
      baseServings: 2,
      description: "Des tortillas dorées à la poêle garnies de poulet épicé et de fromage filant, prêtes en 10 minutes de cuisson.",
      ingredients: [
        { name: "Tortillas de blé", qty: 4, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Émincés de filet de poulet", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Poivron", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Avocat mûr (ou guacamole frais)", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Cheddar ou Emmental râpé", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Sauce salsa douce", qty: 100, unit: "g", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire sauter à feu vif les émincés de poulet et le poivron en fines lanières pendant 6 minutes avec les épices.",
        "Répartir le poulet, la salsa et le fromage râpé sur les tortillas, les replier et les dorer 2 minutes par face à la poêle jusqu'à ce que le fromage fonde.",
        "Servir chaud avec l'avocat écrasé au citron."
      ]
    },
    {
      id: "we-p7",
      title: "Parmentier express de canard confit à la poêle et écrasé de pommes de terre au beurre",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "650 kcal / part",
      tags: ["Menu Plaisir 🌟", "Bistrot", "Simple & Rapide"],
      baseServings: 2,
      description: "Tout le réconfort d'un hachis Parmentier de canard bistrot, réalisé en un temps record.",
      ingredients: [
        { name: "Cuisses de canard confit", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pommes de terre à purée (coupées en petits dés)", qty: 450, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Beurre & Lait", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte aux noix", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire les petits dés de pommes de terre 12 minutes à l'eau bouillante salée puis les écraser à la fourchette avec le beurre et un trait de lait.",
        "Pendant ce temps, effilocher les cuisses de canard et les faire croustiller 5 minutes à la poêle avec l'échalote ciselée.",
        "Dresser l'effiloché de canard sous l'écrasé de pommes de terre chaud et servir avec la salade."
      ]
    },
    {
      id: "we-p8",
      title: "Gnocchis poêlés au gorgonzola fondant, poire rôtie et éclats de noix",
      type: "weekend-pleasure",
      prepTime: "5 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "610 kcal / part",
      tags: ["Menu Plaisir 🌟", "Végétarien", "Simple & Rapide"],
      baseServings: 2,
      description: "Des gnocchis croustillants dehors et moelleux dedans nappés d'une sauce crémeuse au gorgonzola en 10 minutes.",
      ingredients: [
        { name: "Gnocchis à poêler", qty: 350, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Gorgonzola crémeux (ou Roquefort)", qty: 100, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Poire", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Crème liquide", qty: 80, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Cerneaux de noix", qty: 30, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Jeunes pousses de roquette", qty: 60, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire dorer les gnocchis dans une poêle pendant 6 minutes avec les dés de poire et une noisette de beurre.",
        "Verser la crème liquide et le gorgonzola en morceaux directement dans la poêle 2 minutes pour enrober les gnocchis.",
        "Parsemer de noix concassées et accompagner de roquette."
      ]
    },
    {
      id: "we-p9",
      title: "Croque-monsieur brioché gratiné au Comté affiné, jambon blanc et béchamel express",
      type: "weekend-pleasure",
      prepTime: "8 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "640 kcal / part",
      tags: ["Menu Plaisir 🌟", "Bistrot", "Simple & Rapide"],
      baseServings: 2,
      costFor2: 7.40,
      description: "Le vrai croque-monsieur de brasserie parisienne doré au beurre et ultra-fondant au Comté.",
      ingredients: [
        { name: "Pain de mie épais ou brioché", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Jambon blanc supérieur", qty: 4, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Comté affiné râpé ou en fines tranches", qty: 120, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Crème fraîche épaisse & pincée de muscade", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Beurre doux", qty: 20, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte croquante", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Tartiner les tranches de pain de crème fraîche parfumée à la muscade, garnir généreusement de jambon et de Comté.",
        "Refermer les croques, ajouter un peu de Comté sur le dessus et les faire dorer à la poêle dans le beurre (ou 8 minutes au four/Airfryer à 200°C).",
        "Déguster bien chaud et filant avec la salade verte."
      ]
    },
    {
      id: "we-p10",
      title: "Tartiflette savoyarde expresse à la poêle au Reblochon fermier et salade verte",
      type: "weekend-pleasure",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "690 kcal / part",
      tags: ["Menu Plaisir 🌟", "Montagne", "Simple & Rapide"],
      baseServings: 2,
      costFor2: 8.40,
      description: "Le grand classique montagnard au Reblochon coulant réalisé directement à la sauteuse en 15 minutes.",
      ingredients: [
        { name: "Pommes de terre grenailles précuites ou en petits dés", qty: 450, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Demi-Reblochon", qty: 220, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Lardons fumés ou allumettes de bacon", qty: 120, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Oignon", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Salade verte", qty: 100, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire dorer les pommes de terre coupées en dés à la sauteuse pendant 10 minutes avec l'oignon émincé et les lardons.",
        "Déposer le demi-Reblochon coupé en tranches sur le dessus, couvrir la sauteuse 4 minutes à feu doux jusqu'à ce qu'il soit totalement fondu.",
        "Servir aussitôt avec la salade verte."
      ]
    },
    {
      id: "we-p11",
      title: "Pad Thaï gourmand aux crevettes, œufs brouillés, cacahuètes grillées et citron vert",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "590 kcal / part",
      tags: ["Menu Plaisir 🌟", "Asiatique", "Simple & Rapide"],
      baseServings: 2,
      costFor2: 8.50,
      description: "Le célèbre plat de street-food thaïlandaise aux nouilles de riz sautées et cacahuètes croquantes en 20 minutes.",
      ingredients: [
        { name: "Nouilles de riz plates", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Crevettes décortiquées ou blanc de poulet", qty: 220, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Cacahuètes grillées concassées", qty: 40, unit: "g", aisle: "Épicerie salée" },
        { name: "Citron vert & Sauce soja sucrée/salée", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Carotte & Oignon nouveau", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Tremper les nouilles de riz 6 minutes dans l'eau bouillante hors du feu puis les égoutter.",
        "Saisir les crevettes et la carotte râpée au wok 3 minutes, pousser sur le côté et brouiller les œufs.",
        "Ajouter les nouilles, la sauce soja, le jus de citron vert et parsemer généreusement de cacahuètes."
      ]
    },
    {
      id: "we-p12",
      title: "Mac & Cheese ultra-fondant au cheddar affiné et bacon croustillant",
      type: "weekend-pleasure",
      prepTime: "5 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "660 kcal / part",
      tags: ["Menu Plaisir 🌟", "Comfort Food", "Simple & Rapide"],
      baseServings: 2,
      costFor2: 7.20,
      description: "Des macaronis enrobés d'une sauce au cheddar ultra-crémeuse et garnis d'éclats de bacon grillé.",
      ingredients: [
        { name: "Macaronis ou Coquillettes", qty: 180, unit: "g", aisle: "Épicerie salée" },
        { name: "Cheddar affiné râpé", qty: 120, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Tranches de poitrine fumée ou bacon", qty: 80, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Crème liquide", qty: 120, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Jeunes pousses de salade", qty: 60, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire les macaronis 9 minutes à l'eau bouillante salée.",
        "Pendant ce temps, faire croustiller le bacon émincé à la poêle, puis chauffer la crème liquide et y faire fondre le cheddar râpé à feu doux.",
        "Mélanger les pâtes égouttées à la sauce au cheddar, parsemer de bacon croustillant et servir avec la salade."
      ]
    },
    {
      id: "we-p13",
      title: "Pizza bianca maison sur pâte fine : burrata crémeuse, jambon de Parme et roquette",
      type: "weekend-pleasure",
      prepTime: "5 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "630 kcal / part",
      tags: ["Menu Plaisir 🌟", "Italien", "Simple & Rapide"],
      baseServings: 2,
      costFor2: 8.20,
      description: "Une pizza croustillante garnie après cuisson de burrata fraîche, jambon cru et roquette.",
      ingredients: [
        { name: "Pâte à pizza fine", qty: 1, unit: "rouleau", aisle: "Crèmerie & Frais" },
        { name: "Burrata (ou Mozzarella di Bufala)", qty: 150, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Jambon de Parme ou Serrano", qty: 4, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Tomates cerises", qty: 150, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Roquette", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Préchauffer le four à 220°C. Étaler la pâte, la garnir d'un filet d'huile d'olive et des tomates cerises coupées en deux, puis enfourner 14 minutes.",
        "À la sortie du four, disposer la roquette, les chiffonnades de jambon de Parme et la burrata ouverte au centre."
      ]
    },
    {
      id: "we-p14",
      title: "Blanquette de veau ou volaille express à l'ancienne, champignons, carottes et riz",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "25 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "580 kcal / part",
      tags: ["Menu Plaisir 🌟", "Tradition", "Bistrot"],
      baseServings: 2,
      costFor2: 9.20,
      description: "Toute la douceur d'une blanquette crémeuse au citron en version rapide.",
      ingredients: [
        { name: "Émincé de veau ou filets de poulet", qty: 300, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Champignons de Paris", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Carottes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Riz basmati", qty: 130, unit: "g", aisle: "Épicerie salée" },
        { name: "Crème fraîche & Citron", qty: 100, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Bouillon de volaille", qty: 1, unit: "cube", aisle: "Épicerie salée" }
      ],
      steps: [
        "Couper la viande en morceaux et les carottes en rondelles fines, couvrir à hauteur d'eau avec le cube de bouillon et mijoter 18 minutes.",
        "Ajouter les champignons émincés pour les 6 dernières minutes.",
        "Lier le bouillon avec la crème fraîche et un trait de citron, puis servir avec le riz."
      ]
    },
    {
      id: "we-p15",
      title: "Pâtes rigatoni alla Carbonara authentique (guanciale/pancetta, pecorino, jaune d'œuf)",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€ (Bon marché)",
      calories: "620 kcal / part",
      tags: ["Menu Plaisir 🌟", "Italien", "Gourmand"],
      baseServings: 2,
      costFor2: 6.40,
      description: "La vraie recette romaine crémeuse sans crème, liée au jaune d'œuf et au fromage affiné.",
      ingredients: [
        { name: "Rigatoni ou Spaghettis", qty: 180, unit: "g", aisle: "Épicerie salée" },
        { name: "Pancetta ou lardons fumés", qty: 120, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Œufs", qty: 3, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pecorino ou Parmesan râpé", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Salade verte croquante", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire les pâtes dans l'eau bouillante salée. Faire croustiller la pancetta à sec dans une poêle.",
        "Fouetter 2 jaunes + 1 œuf entier avec le fromage râpé et beaucoup de poivre noir.",
        "Hors du feu, mélanger les pâtes égouttées, la pancetta, une louche d'eau de cuisson et le mélange œufs-fromage. Servir avec la salade."
      ]
    },
    {
      id: "we-p16",
      title: "Camembert rôti au four au miel, thym et éclats de noix, pommes grenailles & jambon cru",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "20 min",
      difficulty: "Très facile",
      budget: "€€ (Moyen)",
      calories: "670 kcal / part",
      tags: ["Menu Plaisir 🌟", "Convivial", "Partage"],
      baseServings: 2,
      costFor2: 7.80,
      description: "Ultra-convivial pour un soir de week-end : un camembert coulant parfumé au thym.",
      ingredients: [
        { name: "Camembert au lait cru (en boîte bois)", qty: 1, unit: "pièce", aisle: "Crèmerie & Frais" },
        { name: "Pommes de terre grenailles", qty: 350, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Jambon cru", qty: 4, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Salade verte", qty: 100, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Miel & Thym", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Cuire les pommes grenailles 20 minutes à l'eau ou au four.",
        "Inciser la croûte du camembert en croisillons, arroser d'un filet de miel et de thym, et enfourner 18 minutes à 190°C dans sa boîte en bois.",
        "Déguster en trempant les pommes de terre, accompagné du jambon cru et de la salade."
      ]
    },
    {
      id: "we-p17",
      title: "Poulet Tikka Masala crémeux aux épices douces, riz basmati et pains naans chauds",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "20 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "630 kcal / part",
      tags: ["Menu Plaisir 🌟", "Indien", "Parfumé"],
      baseServings: 2,
      costFor2: 8.10,
      description: "Le plat indien le plus populaire : morceaux de poulet grillés dans une sauce tomate-coco onctueuse.",
      ingredients: [
        { name: "Filets de poulet", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Coulis de tomates", qty: 250, unit: "g", aisle: "Épicerie salée" },
        { name: "Yaourt grec ou lait de coco", qty: 120, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Riz basmati", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Pains Naans", qty: 2, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Garam masala & Paprika", qty: 1.5, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Saisir les cubes de poulet enrobés d'épices 6 minutes à feu vif.",
        "Ajouter le coulis de tomates et le yaourt (ou lait de coco) et laisser mijoter 12 minutes à feu doux.",
        "Servir avec le riz basmati et les pains naans réchauffés au four."
      ]
    },
    {
      id: "we-p18",
      title: "Entrecôte ou faux-filet grillé, sauce au poivre vert légère et pommes sautées",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "20 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "660 kcal / part",
      tags: ["Menu Plaisir 🌟", "Bistrot", "Gourmand"],
      baseServings: 2,
      costFor2: 11.40,
      description: "Une belle pièce de bœuf façon bistrot parisien avec pommes de terre dorées et salade.",
      ingredients: [
        { name: "Faux-filets ou entrecôtes de bœuf", qty: 320, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pommes de terre", qty: 400, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Crème liquide légère", qty: 80, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Salade verte", qty: 80, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Poivre concassé & Moutarde", qty: 1, unit: "c. à café", aisle: "Épicerie salée" }
      ],
      steps: [
        "Faire dorer les pommes de terre coupées en cubes 20 minutes à la poêle ou au four.",
        "Saisir la viande selon la cuisson souhaitée, puis déglacer la poêle avec la crème, la moutarde et le poivre.",
        "Servir avec les pommes sautées et la salade."
      ]
    },
    {
      id: "we-p19",
      title: "Gratin de ravioles du Dauphiné au saumon fumé, courgettes et crème ciboulette",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "18 min",
      difficulty: "Très facile",
      budget: "€€ (Moyen)",
      calories: "590 kcal / part",
      tags: ["Menu Plaisir 🌟", "Gratiné", "Rapide"],
      baseServings: 2,
      costFor2: 8.60,
      description: "Un gratin ultra-fondant prêt en moins de 30 minutes qui plaît à tous les coups.",
      ingredients: [
        { name: "Ravioles du Dauphiné", qty: 240, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Saumon ou truite fumée", qty: 100, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Courgette", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Crème liquide légère", qty: 150, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Comté ou Emmental râpé", qty: 40, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Préchauffer le four à 200°C. Faire revenir la courgette en petits dés 5 minutes à la poêle.",
        "Dans un plat à gratin, alterner plaques de ravioles crues, courgettes et lanières de saumon fumé.",
        "Arroser de crème, parsemer de fromage râpé et enfourner 15 minutes."
      ]
    },
    {
      id: "we-p20",
      title: "Filet mignon de porc en croûte feuilletée (façon Wellington), moutarde et champignons",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "28 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "640 kcal / part",
      tags: ["Menu Plaisir 🌟", "Festif", "Convivial"],
      baseServings: 2,
      costFor2: 8.90,
      description: "Un plat du dimanche spectaculaire et pourtant très simple avec une pâte feuilletée prête à dérouler.",
      ingredients: [
        { name: "Filet mignon de porc", qty: 320, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pâte feuilletée", qty: 1, unit: "rouleau", aisle: "Crèmerie & Frais" },
        { name: "Champignons de Paris", qty: 150, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Jambon cru", qty: 2, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Moutarde", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Salade verte", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Dorer le filet mignon 4 minutes sur toutes ses faces à la poêle, puis hacher et poêler les champignons.",
        "Étaler la pâte feuilletée, déposer le jambon cru, les champignons et le filet mignon badigeonné de moutarde, puis refermer.",
        "Enfourner 25 minutes à 200°C et servir tranché avec la salade."
      ]
    },
    {
      id: "we-p21",
      title: "Moules marinières au vin blanc, échalotes et persil plat & frites dorées au four",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "580 kcal / part",
      tags: ["Menu Plaisir 🌟", "Poisson", "Convivial"],
      baseServings: 2,
      costFor2: 8.30,
      description: "L'esprit bord de mer à la maison avec des frites maison dorées au four.",
      ingredients: [
        { name: "Moules de bouchot nettoyées", qty: 1.2, unit: "kg", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pommes de terre à frites", qty: 400, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Échalotes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Persil frais", qty: 0.5, unit: "botte", aisle: "Fruits & Légumes" },
        { name: "Vin blanc sec ou bouillon", qty: 100, unit: "ml", aisle: "Épicerie salée" }
      ],
      steps: [
        "Enfourner les bâtonnets de pommes de terre légèrement huilés pour 22 minutes à 200°C.",
        "Dans une grande cocotte, faire suer les échalotes ciselées, verser le vin blanc et les moules.",
        "Couvrir à feu vif pendant 6 minutes en secouant la cocotte jusqu'à ouverture des moules, puis parsemer de persil."
      ]
    },
    {
      id: "we-p22",
      title: "Cannellonis gratinés à la ricotta, épinards, jambon italien et sauce tomate basilic",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "25 min",
      difficulty: "Moyenne",
      budget: "€ (Bon marché)",
      calories: "580 kcal / part",
      tags: ["Menu Plaisir 🌟", "Italien", "Gratiné"],
      baseServings: 2,
      costFor2: 6.60,
      description: "Des rouleaux de pâtes généreusement farcis et gratinés à la mozzarella.",
      ingredients: [
        { name: "Tubes de cannellonis ou feuilles de lasagnes", qty: 8, unit: "pièces", aisle: "Épicerie salée" },
        { name: "Ricotta", qty: 250, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Épinards hachés", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Coulis de tomates", qty: 350, unit: "g", aisle: "Épicerie salée" },
        { name: "Mozzarella râpée", qty: 70, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Mélanger la ricotta et les épinards cuits essorés avec sel, poivre et muscade.",
        "Garnir les cannellonis, les ranger dans un plat nappé de coulis de tomates et couvrir de mozzarella.",
        "Enfourner 25 minutes à 190°C."
      ]
    },
    {
      id: "we-p23",
      title: "Burger croustillant de poulet pané aux cornflakes, avocat, tomate et potatoes au four",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "20 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "640 kcal / part",
      tags: ["Menu Plaisir 🌟", "Gourmand", "Ludique"],
      baseServings: 2,
      costFor2: 7.90,
      description: "Un chicken burger maison ultra-croustillant cuit sans friture.",
      ingredients: [
        { name: "Pains burgers", qty: 2, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Filets de poulet", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Avocat", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre", qty: 350, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Chapelure ou Cornflakes non sucrés", qty: 50, unit: "g", aisle: "Épicerie salée" },
        { name: "Salade & Tomate", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Couper les pommes de terre en quartiers (potatoes) et les rôtir 20 minutes au four à 200°C avec les filets de poulet enrobés de chapelure.",
        "Garnir les pains burgers toastés d'avocat écrasé, tomate, salade et poulet croustillant."
      ]
    },
    {
      id: "we-p24",
      title: "Croziflette légère de Savoie aux crozets de sarrasin, jambon cru, poireaux et Reblochon",
      type: "weekend-pleasure",
      prepTime: "12 min",
      cookTime: "20 min",
      difficulty: "Facile",
      budget: "€€ (Moyen)",
      calories: "630 kcal / part",
      tags: ["Menu Plaisir 🌟", "Montagne", "Convivial"],
      baseServings: 2,
      costFor2: 8.30,
      description: "Les petites pâtes carrées savoyardes associées à une fondue de poireaux pour plus de légèreté.",
      ingredients: [
        { name: "Crozets de Savoie (sarrasin ou nature)", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Poireau", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Jambon cru de Savoie", qty: 3, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Reblochon", qty: 180, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Crème légère", qty: 60, unit: "ml", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Cuire les crozets 15 minutes à l'eau bouillante salée et faire fondre le poireau émincé à la poêle.",
        "Mélanger dans un plat à gratin les crozets, le poireau, le jambon cru en lanières et la crème.",
        "Disposer les tranches de Reblochon dessus et gratiner 12 minutes à 200°C."
      ]
    }
  ],

  // =========================================================================
  // 4. MENUS GOURMET (Semaine & Week-end) : Ingrédients plus nobles et délicats,
  //    recettes SIMPLES à réaliser + SUGGESTION DE VIN pour accompagner ce repas
  // =========================================================================
  gourmetMeals: [
    {
      id: "gm-1",
      title: "Noix de Saint-Jacques snackées au beurre demi-sel, fondue de poireaux vanillée & noisettes",
      type: "gourmet",
      prepTime: "10 min",
      cookTime: "8 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "460 kcal / part",
      tags: ["Gourmet 🍷", "Ingrédients nobles", "Recette simple"],
      baseServings: 2,
      costFor2: 14.90,
      winePairing: {
        name: "Chablis 1er Cru ou Sancerre Blanc",
        color: "Vin blanc sec & minéral",
        temp: "10-12°C",
        note: "Sa fraîcheur ciselée et ses notes d'agrumes équilibrent à merveille le fondant beurré de la Saint-Jacques."
      },
      description: "Des noix de Saint-Jacques juste saisies 1 minute par face, déposées sur une étuvée de poireaux délicate.",
      ingredients: [
        { name: "Noix de Saint-Jacques fraîches (ou décongelées)", qty: 10, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Blancs de poireaux", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Crème entière fluide", qty: 80, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Beurre gastronomique demi-sel", qty: 25, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Noisettes torréfiées concassées", qty: 20, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Émincer finement les blancs de poireaux et les faire fondre 10 minutes à couvert à feu doux avec une noisette de beurre, puis lier avec la crème.",
        "Sécher soigneusement les noix de Saint-Jacques sur du papier absorbant.",
        "Dans une poêle bien chaude avec le beurre demi-sel moussant, snacker les Saint-Jacques 1 min 30 de chaque côté pour qu'elles soient dorées et nacrées à cœur.",
        "Dresser sur la fondue de poireaux et parsemer d'éclats de noisettes."
      ]
    },
    {
      id: "gm-2",
      title: "Magret de canard rôti au miel d'acacia et figues fraîches, pommes grenailles au romarin",
      type: "gourmet",
      prepTime: "8 min",
      cookTime: "15 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "580 kcal / part",
      tags: ["Gourmet 🍷", "Sud-Ouest", "Recette simple"],
      baseServings: 2,
      costFor2: 14.50,
      winePairing: {
        name: "Saint-Émilion Grand Cru ou Pécharmant",
        color: "Vin rouge velouté & fruité",
        temp: "16-17°C",
        note: "Ses tanins soyeux et ses arômes de fruits noirs mûrs répondent à la tendreté du magret et à la douceur de la figue."
      },
      description: "Un grand plat de table aux saveurs sucrées-salées raffinées, très simple à cuire à la poêle.",
      ingredients: [
        { name: "Magret de canard du Sud-Ouest", qty: 1, unit: "pièce (350g)", aisle: "Viandes, Poissons & Œufs" },
        { name: "Figues fraîches (ou rôties)", qty: 4, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Pommes de terre grenailles", qty: 350, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Miel d'acacia", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Vinaigre balsamique affiné", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" }
      ],
      steps: [
        "Quadriller la peau du magret au couteau sans entailler la chair. Faire dorer les pommes grenailles coupées en deux 15 minutes à la poêle couverte.",
        "Déposer le magret côté peau dans une poêle froide, puis cuire 8 minutes à feu moyen en vidant l'excédent de graisse.",
        "Retourner le magret, ajouter les figues coupées en deux et cuire 4 minutes côté chair. Réserver la viande sous une feuille d'aluminium.",
        "Déglacer la poêle avec le miel et le vinaigre balsamique, trancher le magret rosé et napper du jus réduit."
      ]
    },
    {
      id: "gm-3",
      title: "Tournedos de filet de bœuf poêlé, sauce onctueuse aux morilles et tagliatelles fraîches",
      type: "gourmet",
      prepTime: "8 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "590 kcal / part",
      tags: ["Gourmet 🍷", "Ingrédients nobles", "Recette simple"],
      baseServings: 2,
      costFor2: 16.80,
      winePairing: {
        name: "Pommard, Gevrey-Chambertin ou Crozes-Hermitage",
        color: "Vin rouge racé & boisé",
        temp: "16-17°C",
        note: "Les notes de sous-bois d'un grand Pinot Noir de Bourgogne ou d'une Syrah du Rhône épousent divinement le parfum des morilles."
      },
      description: "La pièce de bœuf la plus tendre sublimée par une sauce minute à la crème et aux morilles.",
      ingredients: [
        { name: "Tournedos dans le filet de bœuf", qty: 2, unit: "pièces (300g)", aisle: "Viandes, Poissons & Œufs" },
        { name: "Morilles séchées ou surgelées", qty: 30, unit: "g", aisle: "Épicerie salée" },
        { name: "Crème entière de Normandie", qty: 120, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Tagliatelles fraîches aux œufs", qty: 250, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Échalote & Beurre", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Réhydrater les morilles 10 minutes dans un bol d'eau tiède (ou les rincer si surgelées).",
        "Saisir les tournedos à feu vif dans le beurre moussant 2 à 3 minutes par face selon la cuisson désirée, puis réserver au chaud.",
        "Dans la même poêle, faire revenir l'échalote ciselée et les morilles égouttées 3 minutes, verser la crème et laisser réduire 3 minutes.",
        "Servir les tournedos nappés de sauce aux morilles avec les tagliatelles fraîches cuites 3 minutes."
      ]
    },
    {
      id: "gm-4",
      title: "Risotto Carnaroli aux cèpes, huile de truffe blanche et Parmigiano Reggiano 24 mois",
      type: "gourmet",
      prepTime: "8 min",
      cookTime: "18 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "560 kcal / part",
      tags: ["Gourmet 🍷", "Haute gastronomie", "Végétarien"],
      baseServings: 2,
      costFor2: 12.90,
      winePairing: {
        name: "Meursault (Bourgogne Blanc) ou Pinot Noir d'Alsace",
        color: "Vin blanc gastronomique ou Rouge léger",
        temp: "12-14°C",
        note: "La rondeur beurrée et les notes de noisette d'un grand Chardonnay bourguignon prolongent l'arôme envoûtant de la truffe et du cèpe."
      },
      description: "Un grand risotto de table d'une grande délicatesse aromatique, très simple à réaliser pas à pas.",
      ingredients: [
        { name: "Riz Carnaroli (ou Arborio)", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Cèpes (frais, bocal ou surgelés)", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Parmigiano Reggiano affiné 24 mois", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Huile d'olive à la truffe blanche", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Échalote & Bouillon de volaille", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Beurre doux", qty: 25, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Poêler les cèpes 5 minutes au beurre avec une pointe d'ail et de persil plat, puis les réserver.",
        "Faire suer l'échalote ciselée, nacrer le riz Carnaroli 2 minutes et mouiller progressivement avec 550 ml de bouillon chaud pendant 16 minutes.",
        "Hors du feu, incorporer le beurre froid, le Parmigiano râpé et les cèpes poêlés.",
        "Dresser dans des assiettes creuses chaudes et parfumer d'un filet d'huile à la truffe blanche."
      ]
    },
    {
      id: "gm-5",
      title: "Pavé de bar sauvage rôti sur peau, beurre blanc citronné & asperges vertes croquantes",
      type: "gourmet",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "450 kcal / part",
      tags: ["Gourmet 🍷", "Poisson noble", "Recette simple"],
      baseServings: 2,
      costFor2: 15.40,
      winePairing: {
        name: "Pouilly-Fumé ou Pessac-Léognan Blanc",
        color: "Vin blanc sec & racé",
        temp: "10-12°C",
        note: "Ses notes fumées et d'agrumes mûrs mettent en valeur la chair fine et nacrée du bar rôti sur peau."
      },
      description: "Une assiette marine digne d'une table étoilée, prête en 20 minutes avec très peu de gestes.",
      ingredients: [
        { name: "Filets de bar (ou daurade royale) avec peau", qty: 300, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Asperges vertes (ou haricots fins)", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Beurre demi-sel froid", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Citron jaune bio", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Crème liquide", qty: 2, unit: "c. à soupe", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Cuire les asperges vertes 6 minutes à l'eau bouillante salée puis les dorer 2 minutes à la poêle pour les garder croquantes.",
        "Saisir les pavés de bar côté peau pendant 5 minutes dans une poêle chaude avec un filet d'huile d'olive, puis 2 minutes côté chair.",
        "Faire réduire l'échalote ciselée avec le jus du demi-citron et 2 c. à soupe d'eau, ajouter la crème puis monter au fouet hors du feu avec le beurre froid en dés.",
        "Dresser le bar croustillant sur les asperges et napper de sauce beurre blanc citronné."
      ]
    },
    {
      id: "gm-6",
      title: "Suprême de pintade ou volaille fermière doré, crème de truffe et mousseline de panais",
      type: "gourmet",
      prepTime: "10 min",
      cookTime: "16 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "540 kcal / part",
      tags: ["Gourmet 🍷", "Volaille fine", "Recette simple"],
      baseServings: 2,
      costFor2: 13.80,
      winePairing: {
        name: "Mercurey Blanc ou Côtes-du-Jura Chardonnay",
        color: "Vin blanc rond & ample",
        temp: "11-13°C",
        note: "Un grand vin blanc bourguignon à la texture onctueuse accompagne avec élégance la douceur du panais et la crème truffée."
      },
      description: "La finesse d'un suprême fermier à la peau dorée accompagnée d'une mousseline douce et veloutée.",
      ingredients: [
        { name: "Suprêmes de pintade ou poulet fermier Label Rouge", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Panais (ou pommes de terre Agata)", qty: 400, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Crème fraîche entière", qty: 100, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Brisures ou tartufata de truffe d'été", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Beurre doux", qty: 25, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Éplucher et couper les panais en dés, les cuire 14 minutes dans l'eau bouillante salée puis les mixer finement avec le beurre et une cuillère de crème.",
        "Dorer les suprêmes de volaille à la poêle 6 minutes côté peau puis 6 minutes côté chair à feu moyen.",
        "Déglacer la poêle avec le reste de crème et la cuillère de truffe, laisser frémir 2 minutes.",
        "Servir les suprêmes tranchés en biseau sur la mousseline de panais."
      ]
    },
    {
      id: "gm-7",
      title: "Tataki de thon rouge mi-cuit en croûte de sésame, avocat et mangue fraîche au citron vert",
      type: "gourmet",
      prepTime: "10 min",
      cookTime: "4 min",
      difficulty: "Très facile",
      budget: "€€€ (Gourmet)",
      calories: "470 kcal / part",
      tags: ["Gourmet 🍷", "Poisson noble", "Ultra-rapide"],
      baseServings: 2,
      costFor2: 15.20,
      winePairing: {
        name: "Riesling Grand Cru d'Alsace ou Bandol Rosé",
        color: "Vin blanc aromatique ou Rosé de gastronomie",
        temp: "9-11°C",
        note: "La tension fraîche et les notes exotiques du Riesling soulignent le sésame torréfié, la mangue et le fondant du thon mi-cuit."
      },
      description: "Une recette spectaculaire et ultra-rapide : le thon est simplement saisi 1 minute par face en croûte de sésame.",
      ingredients: [
        { name: "Pavés de thon rouge (ou albacore) très frais", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Graines de sésame blond et noir", qty: 3, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Avocat mûr", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Mangue fraîche", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Sauce soja sucrée & Huile de sésame", qty: 2, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Citron vert", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Badigeonner les pavés de thon de sauce soja puis les rouler dans les graines de sésame pour former une croûte régulière.",
        "Couper l'avocat et la mangue en petits dés, les assaisonner de jus de citron vert et d'une goutte d'huile de sésame.",
        "Saisir le thon à feu très vif dans une poêle chaude pendant 1 minute seulement sur chaque face afin que le cœur reste cru et fondant.",
        "Trancher finement le thon et le dresser à côté du tartare avocat-mangue."
      ]
    },
    {
      id: "gm-8",
      title: "Gambas sauvages rôties à l'ail doux, linguine fraîches à la bisque de homard et basilic",
      type: "gourmet",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "550 kcal / part",
      tags: ["Gourmet 🍷", "Fruits de mer", "Recette simple"],
      baseServings: 2,
      costFor2: 14.20,
      winePairing: {
        name: "Châteauneuf-du-Pape Blanc ou Cassis Blanc",
        color: "Vin blanc solaire & iodé",
        temp: "10-12°C",
        note: "Son volume en bouche et sa finale saline s'harmonisent intensément avec la bisque de homard et les gambas grillées."
      },
      description: "Des linguine enrobées d'une sauce veloutée à la bisque de homard et surmontées de belles gambas dorées.",
      ingredients: [
        { name: "Grosses gambas décortiquées", qty: 10, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Linguine fraîches (ou spaghettis bronze)", qty: 220, unit: "g", aisle: "Épicerie salée" },
        { name: "Bisque de homard (bocal ou conserve fine)", qty: 200, unit: "g", aisle: "Épicerie salée" },
        { name: "Crème liquide entière", qty: 60, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Tomates cerises & Basilic frais", qty: 120, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Ail & Huile d'olive", qty: 1, unit: "gousse", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire les linguine al dente dans l'eau bouillante salée.",
        "Dans une grande poêle, saisir les gambas et les tomates cerises coupées en deux à l'huile d'olive avec l'ail pendant 3 minutes.",
        "Verser la bisque de homard et la crème liquide, laisser réduire 2 minutes à feu doux.",
        "Enrober les linguine dans la sauce et parsemer de feuilles de basilic frais."
      ]
    },
    {
      id: "gm-9",
      title: "Médaillons de veau en robe de jambon de Parme et sauge (Saltimbocca), polenta crémeuse au parmesan",
      type: "gourmet",
      prepTime: "10 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "530 kcal / part",
      tags: ["Gourmet 🍷", "Gastronomie italienne", "Recette simple"],
      baseServings: 2,
      costFor2: 14.60,
      winePairing: {
        name: "Chianti Classico Riserva ou Volnay (Bourgogne)",
        color: "Vin rouge fin & élégant",
        temp: "15-16°C",
        note: "Sa fraîcheur fruitée et ses tanins délicats respectent la finesse du veau tout en répondant au jambon de Parme."
      },
      description: "Le grand classique romain ultra-rapide où le jambon de Parme et la sauge parfument le veau fondant.",
      ingredients: [
        { name: "Médaillons ou escalopes fines de veau", qty: 280, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Jambon de Parme affiné", qty: 4, unit: "tranches", aisle: "Viandes, Poissons & Œufs" },
        { name: "Polenta fine précuite", qty: 120, unit: "g", aisle: "Épicerie salée" },
        { name: "Parmesan râpé", qty: 50, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Feuilles de sauge fraîche (ou thym) & Beurre", qty: 6, unit: "feuilles", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Poser une tranche de jambon de Parme et une feuille de sauge sur chaque médaillon de veau.",
        "Saisir les médaillons à la poêle dans le beurre moussant 3 minutes par face, puis déglacer avec 3 c. à soupe d'eau ou vin blanc.",
        "En parallèle, verser la polenta en pluie dans 500 ml d'eau/lait frémissant salé, remuer 4 minutes et incorporer le parmesan.",
        "Servir les Saltimbocca sur la polenta crémeuse nappée du jus de cuisson."
      ]
    },
    {
      id: "gm-10",
      title: "Dos de cabillaud Skrei nacré, sauce veloutée au safran et tombée d'épinards frais",
      type: "gourmet",
      prepTime: "8 min",
      cookTime: "12 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "440 kcal / part",
      tags: ["Gourmet 🍷", "Poisson noble", "Recette simple"],
      baseServings: 2,
      costFor2: 13.90,
      winePairing: {
        name: "Condrieu (Viognier) ou Viré-Clessé",
        color: "Vin blanc aromatique & soyeux",
        temp: "10-12°C",
        note: "Les arômes de fleurs blanches et d'abricot du Viognier créent un accord majestueux avec l'or rouge du safran."
      },
      description: "Des pétales de cabillaud nacrés servis sur des épinards fondants et une sauce d'or au safran.",
      ingredients: [
        { name: "Dos de cabillaud épais (Skrei)", qty: 300, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Jeunes pousses d'épinards frais", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Crème entière liquide", qty: 120, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Pistils ou poudre de safran", qty: 1, unit: "dose", aisle: "Épicerie salée" },
        { name: "Riz basmati ou sauvage", qty: 110, unit: "g", aisle: "Épicerie salée" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire le riz et faire tomber les épinards frais 2 minutes à la poêle avec une noisette de beurre.",
        "Faire revenir l'échalote ciselée, verser la crème et infuser le safran à feu très doux pendant 4 minutes.",
        "Cuire les dos de cabillaud 4 à 5 minutes par face à la poêle (ou 12 min au four à 190°C) pour qu'ils restent nacrés.",
        "Dresser sur le lit d'épinards et napper de sauce safranée."
      ]
    },
    {
      id: "gm-11",
      title: "Ravioles du Dauphiné Label Rouge pochées, crème de saumon sauvage & œufs de truite",
      type: "gourmet",
      prepTime: "5 min",
      cookTime: "5 min",
      difficulty: "Très facile",
      budget: "€€€ (Gourmet)",
      calories: "540 kcal / part",
      tags: ["Gourmet 🍷", "Ultra-rapide", "Recette simple"],
      baseServings: 2,
      costFor2: 13.20,
      winePairing: {
        name: "Crozes-Hermitage Blanc ou Chignin-Bergeron",
        color: "Vin blanc souple & floral",
        temp: "10-12°C",
        note: "Un blanc de la Vallée du Rhône ou de Savoie tout en finesse accompagne le Comté des ravioles et le saumon fumé."
      },
      description: "Un plat gastronomique prêt en 10 minutes chrono : les ravioles cuisent en 1 minute et fondent en bouche.",
      ingredients: [
        { name: "Ravioles du Dauphiné Label Rouge", qty: 240, unit: "g (4 plaques)", aisle: "Crèmerie & Frais" },
        { name: "Saumon fumé sauvage (ou truite)", qty: 120, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Œufs de truite ou de saumon (optionnel)", qty: 30, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Crème fraîche entière", qty: 120, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Ciboulette fraîche & Citron", qty: 0.5, unit: "botte", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Chauffer doucement la crème fraîche dans une petite casserole avec un filet de citron et du poivre du moulin.",
        "Plonger les plaques de ravioles dans une eau frémissante (non bouillante) pendant 1 minute exactement : dès qu'elles remontent, les égoutter à l'écumoire.",
        "Dresser les ravioles dans des assiettes creuses, napper de crème chaude et garnir de saumon fumé, d'œufs de truite et de ciboulette."
      ]
    },
    {
      id: "gm-12",
      title: "Côtes d'agneau rôties au thym frais et fleur de sel, poêlée d'artichauts et tomates confites",
      type: "gourmet",
      prepTime: "8 min",
      cookTime: "10 min",
      difficulty: "Facile",
      budget: "€€€ (Gourmet)",
      calories: "560 kcal / part",
      tags: ["Gourmet 🍷", "Terroir", "Recette simple"],
      baseServings: 2,
      costFor2: 15.90,
      winePairing: {
        name: "Saint-Julien (Bordeaux) ou Pic Saint-Loup",
        color: "Vin rouge structuré & aromatique",
        temp: "16-17°C",
        note: "Ses notes de garrigue, de cassis et d'épices douces s'accordent merveilleusement avec l'agneau rôti au thym."
      },
      description: "Des côtes d'agneau premières saisies au thym frais et accompagnées d'une garniture méditerranéenne délicate.",
      ingredients: [
        { name: "Côtes d'agneau premières (ou filet)", qty: 4, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Cœurs d'artichauts marinés", qty: 200, unit: "g", aisle: "Épicerie salée" },
        { name: "Tomates séchées ou confites à l'huile", qty: 80, unit: "g", aisle: "Épicerie salée" },
        { name: "Pommes de terre grenailles", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Thym frais, Ail en chemise & Fleur de sel", qty: 1, unit: "branche", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Cuire les pommes grenailles coupées en deux 12 minutes à l'eau ou à la poêle.",
        "Poêler les cœurs d'artichauts coupés en quartiers avec les tomates confites et les grenailles pendant 4 minutes.",
        "Saisir les côtes d'agneau 3 minutes par face à feu vif avec la branche de thym et l'ail en chemise.",
        "Parsemer de fleur de sel et servir aussitôt avec la poêlée méditerranéenne."
      ]
    }
  ],

  // =========================================================================
  // 5. DESSERTS (Associés aux repas du week-end, Plaisir et Gourmet)
  // =========================================================================
  weekendDesserts: [
    {
      id: "des-1",
      title: "Moelleux au chocolat noir cœur fondant",
      style: "pleasure",
      prepTime: "10 min",
      cookTime: "12 min",
      baseServings: 2,
      ingredients: [
        { name: "Chocolat noir pâtissier", qty: 100, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Beurre doux", qty: 50, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Sucre", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Farine", qty: 25, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Préchauffer le four à 200°C. Faire fondre le chocolat noir et le beurre ensemble.",
        "Fouetter les œufs avec le sucre puis incorporer la farine et le chocolat fondu.",
        "Verser dans 2 ramequins beurrés et enfourner 10 à 12 minutes pour garder le cœur coulant."
      ]
    },
    {
      id: "des-2",
      title: "Crumble tiède pommes-poires à la cannelle",
      style: "pleasure",
      prepTime: "10 min",
      cookTime: "20 min",
      baseServings: 2,
      ingredients: [
        { name: "Pomme", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Poire", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Farine", qty: 50, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Beurre", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Sucre roux / Cassonade", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Couper la pomme et la poire en dés, les répartir dans un petit plat à gratin avec une pincée de cannelle.",
        "Sabler du bout des doigts la farine, la cassonade et le beurre froid coupé en dés.",
        "Recouvrir les fruits de pâte à crumble et enfourner 20 minutes à 190°C jusqu'à ce qu'il soit doré."
      ]
    },
    {
      id: "des-3",
      title: "Tiramisu express en verrines aux spéculoos et café",
      style: "pleasure",
      prepTime: "12 min",
      cookTime: "0 min",
      baseServings: 2,
      ingredients: [
        { name: "Mascarpone", qty: 125, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Œufs", qty: 1, unit: "pièce", aisle: "Viandes, Poissons & Œufs" },
        { name: "Biscuits Spéculoos", qty: 6, unit: "pièces", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Sucre", qty: 25, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Cacao non sucré", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Fouetter le jaune d'œuf avec le sucre puis incorporer le mascarpone.",
        "Monter le blanc en neige ferme et l'incorporer délicatement à la crème.",
        "Alterner dans 2 verrines les spéculoos émiettés (légèrement imbibés de café) et la crème, puis saupoudrer de cacao. Réserver 1h au frais."
      ]
    },
    {
      id: "des-4",
      title: "Panna cotta vanillée et coulis de fruits rouges",
      style: "balanced",
      prepTime: "8 min",
      cookTime: "5 min",
      baseServings: 2,
      ingredients: [
        { name: "Crème liquide ou lait d'amande/coco", qty: 200, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Fruits rouges (frais ou surgelés)", qty: 100, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Gélatine (ou agar-agar)", qty: 1, unit: "feuille", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Sucre vanillé", qty: 1, unit: "sachet", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Ramollir la feuille de gélatine dans l'eau froide. Chauffer la crème avec le sucre vanillé pendant 3 minutes.",
        "Hors du feu, incorporer la gélatine essorée, verser dans 2 verrines et laisser prendre 2h au réfrigérateur.",
        "Servir nappé des fruits rouges compotés ou mixés."
      ]
    },
    {
      id: "des-5",
      title: "Salade de fruits frais de saison, menthe et zeste de citron vert",
      style: "balanced",
      prepTime: "10 min",
      cookTime: "0 min",
      baseServings: 2,
      ingredients: [
        { name: "Orange", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Kiwi", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Pomme ou Poire", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Miel", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Citron vert & Menthe", qty: 0.5, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Éplucher et couper l'orange, les kiwis et la pomme en petits morceaux réguliers.",
        "Arroser du jus de citron vert et de la cuillère de miel, puis parsemer de feuilles de menthe ciselées.",
        "Servir bien frais."
      ]
    },
    {
      id: "des-6",
      title: "Mousse au chocolat noir aérienne (2 ingrédients)",
      style: "pleasure",
      prepTime: "10 min",
      cookTime: "3 min",
      baseServings: 2,
      ingredients: [
        { name: "Chocolat noir 70%", qty: 80, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Œufs", qty: 3, unit: "pièces", aisle: "Viandes, Poissons & Œufs" }
      ],
      steps: [
        "Faire fondre le chocolat noir au bain-marie ou au micro-ondes par tranches de 30 secondes.",
        "Séparer les blancs des jaunes d'œufs. Incorporer les jaunes au chocolat tiédi.",
        "Monter les blancs en neige ferme avec une pincée de sel, les incorporer délicatement au chocolat et réserver 2h au frais."
      ]
    },
    {
      id: "des-7",
      title: "Pommes rôties au four au miel, éclats de noix et cannelle",
      style: "balanced",
      prepTime: "5 min",
      cookTime: "20 min",
      baseServings: 2,
      ingredients: [
        { name: "Pommes (Golden ou Reine des Reinettes)", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Miel", qty: 2, unit: "c. à café", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Cerneaux de noix ou amandes", qty: 20, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Beurre", qty: 10, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Évider le cœur des pommes sans les percer jusqu'en bas et les déposer dans un plat à four.",
        "Garnir le centre de chaque pomme de noix concassées, d'une cuillère de miel et d'une noisette de beurre.",
        "Ajouter 2 c. à soupe d'eau au fond du plat et enfourner 20 minutes à 190°C."
      ]
    },
    {
      id: "des-8",
      title: "Verrines de fromage blanc onctueux, compotée de poires et granola croquant",
      style: "balanced",
      prepTime: "8 min",
      cookTime: "8 min",
      baseServings: 2,
      ingredients: [
        { name: "Fromage blanc ou Skyr", qty: 200, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Poires mûres", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Granola ou flocons d'avoine dorés", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Miel ou sirop d'érable", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Couper les poires en petits dés et les faire compoter 8 minutes à la poêle avec la cuillère de miel.",
        "Répartir le fromage blanc dans deux verrines, ajouter la compotée de poires tiède.",
        "Parsemer de granola croquant juste avant de déguster."
      ]
    },
    {
      id: "des-9",
      title: "Crêpes légères à la fleur d'oranger et chocolat fondu",
      style: "pleasure",
      prepTime: "8 min",
      cookTime: "10 min",
      baseServings: 2,
      ingredients: [
        { name: "Farine", qty: 100, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait demi-écrémé", qty: 220, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Chocolat noir", qty: 50, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Mélanger la farine et les œufs au fouet, puis délayer progressivement avec le lait pour obtenir une pâte lisse.",
        "Cuire les crêpes 1 à 2 minutes par face dans une poêle chaude légèrement huilée.",
        "Servir nappées de chocolat noir fondu."
      ]
    },
    {
      id: "des-10",
      title: "Tarte fine feuilletée aux pommes caramélisées",
      style: "pleasure",
      prepTime: "10 min",
      cookTime: "20 min",
      baseServings: 2,
      ingredients: [
        { name: "Pâte feuilletée", qty: 0.5, unit: "rouleau", aisle: "Crèmerie & Frais" },
        { name: "Pommes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Beurre doux", qty: 15, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Sucre cassonade", qty: 20, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Préchauffer le four à 200°C. Découper 2 disques dans la pâte feuilletée et les piquer à la fourchette.",
        "Disposer de fines lamelles de pommes en rosace, parsemer de cassonade et de petites noisettes de beurre.",
        "Enfourner 20 minutes jusqu'à ce que les bords soient bien feuilletés et caramélisés."
      ]
    },
    {
      id: "des-11",
      title: "Pain perdu brioché doré à la vanille et poêlée de pommes caramélisées",
      style: "pleasure",
      prepTime: "8 min",
      cookTime: "8 min",
      baseServings: 2,
      costFor2: 2.30,
      ingredients: [
        { name: "Brioche tranchée", qty: 4, unit: "tranches", aisle: "Boulangerie & Divers" },
        { name: "Œufs", qty: 1, unit: "pièce", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait", qty: 100, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Pomme", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Sucre vanillé & Beurre", qty: 1, unit: "sachet", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Battre l'œuf avec le lait et le sucre vanillé, y tremper les tranches de brioche.",
        "Faire dorer 2 minutes par face à la poêle avec les quartiers de pomme."
      ]
    },
    {
      id: "des-12",
      title: "Carpaccio d'ananas frais (ou orange) au sirop de citron vert, menthe et pistaches",
      style: "gourmet",
      prepTime: "10 min",
      cookTime: "0 min",
      baseServings: 2,
      costFor2: 2.80,
      ingredients: [
        { name: "Ananas Victoria mûr (ou oranges)", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Citron vert", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Menthe fraîche & Pistaches", qty: 0.25, unit: "botte", aisle: "Fruits & Légumes" },
        { name: "Miel d'acacia", qty: 1, unit: "c. à café", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Trancher très finement l'ananas et le disposer en rosace sur deux assiettes.",
        "Arroser de jus de citron vert mélangé au miel et parsemer de menthe ciselée et pistaches."
      ]
    },
    {
      id: "des-13",
      title: "Clafoutis léger aux fruits rouges (ou cerises) et amandes effilées",
      style: "balanced",
      prepTime: "8 min",
      cookTime: "22 min",
      baseServings: 2,
      costFor2: 2.60,
      ingredients: [
        { name: "Fruits rouges ou cerises", qty: 180, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait demi-écrémé", qty: 150, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Farine & Sucre", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Fouetter les œufs avec le sucre, la farine et le lait.",
        "Répartir les fruits dans deux ramequins, verser l'appareil et cuire 22 minutes à 190°C."
      ]
    },
    {
      id: "des-14",
      title: "Poires Belle-Hélène express pochées à la vanille et nappage chocolat noir",
      style: "gourmet",
      prepTime: "8 min",
      cookTime: "12 min",
      baseServings: 2,
      costFor2: 2.70,
      ingredients: [
        { name: "Poires mûres", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Chocolat noir grand cru 70%", qty: 60, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Amandes effilées torréfiées", qty: 15, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Éplucher et pocher les demi-poires 10 minutes dans une casserole d'eau vanillée.",
        "Faire fondre le chocolat noir avec 2 cuillères d'eau chaude, napper les poires et parsemer d'amandes."
      ]
    },
    {
      id: "des-15",
      title: "Riz au lait crémeux à la vanille Bourbon et caramel léger",
      style: "pleasure",
      prepTime: "5 min",
      cookTime: "22 min",
      baseServings: 2,
      costFor2: 1.80,
      ingredients: [
        { name: "Riz rond à dessert", qty: 70, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Lait demi-écrémé", qty: 400, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Sucre vanillé", qty: 1, unit: "sachet", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Sucre roux", qty: 25, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Cuire le riz rond à feu très doux dans le lait vanillé pendant 20 minutes en remuant souvent.",
        "Sucrer en fin de cuisson et servir tiède ou frais."
      ]
    },
    {
      id: "des-16",
      title: "Verrines façon Cheesecake léger au citron, fromage frais et spéculoos",
      style: "gourmet",
      prepTime: "10 min",
      cookTime: "0 min",
      baseServings: 2,
      costFor2: 2.60,
      ingredients: [
        { name: "Fromage frais (type Philadelphia ou St Môret) & Skyr", qty: 160, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Biscuits Spéculoos ou Sablés", qty: 4, unit: "pièces", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Citron non traité", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Miel ou sucre glace", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Émietter les biscuits au fond de deux verrines.",
        "Fouetter le fromage frais avec le miel, le jus et le zeste de citron, puis dresser sur les biscuits."
      ]
    },
    {
      id: "des-17",
      title: "Bananes flambées ou rôties au lait de coco, citron vert et pépites de chocolat",
      style: "pleasure",
      prepTime: "5 min",
      cookTime: "8 min",
      baseServings: 2,
      costFor2: 2.00,
      ingredients: [
        { name: "Bananes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Chocolat noir", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Sucre roux & Beurre", qty: 15, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Couper les bananes dans la longueur et les dorer 5 minutes à la poêle avec le beurre et le sucre roux.",
        "Parsemer de pépites de chocolat noir qui fondent à la chaleur."
      ]
    },
    {
      id: "des-18",
      title: "Mousse légère au citron et fromage blanc sur sablé breton",
      style: "balanced",
      prepTime: "10 min",
      cookTime: "0 min",
      baseServings: 2,
      costFor2: 2.20,
      ingredients: [
        { name: "Fromage blanc 3%", qty: 200, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Citron jaune", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Sablés bretons", qty: 2, unit: "pièces", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Sucre", qty: 20, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Mélanger le fromage blanc avec le zeste et le jus de citron ainsi que le sucre.",
        "Répartir sur les sablés bretons émiettés en verrines."
      ]
    },
    {
      id: "des-19",
      title: "Cookies géants moelleux (Skillet Cookie) aux pépites de chocolat noir et noisettes",
      style: "pleasure",
      prepTime: "10 min",
      cookTime: "12 min",
      baseServings: 2,
      costFor2: 2.30,
      ingredients: [
        { name: "Farine", qty: 80, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Beurre mou", qty: 40, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Sucre cassonade", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Œufs", qty: 1, unit: "pièce", aisle: "Viandes, Poissons & Œufs" },
        { name: "Chocolat noir en pépites", qty: 50, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Mélanger le beurre mou, la cassonade, l'œuf, la farine et les pépites de chocolat.",
        "Enfourner 12 minutes à 185°C pour garder un cœur ultra-moelleux."
      ]
    },
    {
      id: "des-20",
      title: "Brochettes de fruits frais rôtis au miel et romarin, yaourt grec vanillé",
      style: "gourmet",
      prepTime: "8 min",
      cookTime: "6 min",
      baseServings: 2,
      costFor2: 2.60,
      ingredients: [
        { name: "Pomme, Poire ou Pêche", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Yaourt grec", qty: 1, unit: "pot", aisle: "Crèmerie & Frais" },
        { name: "Miel", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Poêler les quartiers de fruits 5 minutes avec le miel.",
        "Servir tiède accompagné du yaourt grec frais."
      ]
    },
    {
      id: "des-21",
      title: "Crème dessert maison au chocolat noir intense (sans œuf)",
      style: "balanced",
      prepTime: "5 min",
      cookTime: "8 min",
      baseServings: 2,
      costFor2: 1.90,
      ingredients: [
        { name: "Lait demi-écrémé", qty: 250, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Chocolat noir pâtissier", qty: 60, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Maïzena", qty: 15, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Sucre", qty: 15, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Délayer la Maïzena dans le lait froid avec le sucre, porter à ébullition 2 minutes en fouettant.",
        "Hors du feu, faire fondre le chocolat noir dedans et verser en ramequins."
      ]
    },
    {
      id: "des-22",
      title: "Crumble express aux fruits rouges et flocons d'avoine dorés",
      style: "balanced",
      prepTime: "8 min",
      cookTime: "18 min",
      baseServings: 2,
      costFor2: 2.40,
      ingredients: [
        { name: "Fruits rouges (frais ou surgelés)", qty: 200, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Flocons d'avoine & Farine", qty: 60, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Beurre", qty: 30, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Cassonade", qty: 25, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Disposer les fruits rouges dans deux ramequins.",
        "Sabler les flocons d'avoine, la farine, la cassonade et le beurre, répartir sur les fruits et enfourner 18 minutes à 190°C."
      ]
    },
    {
      id: "des-23",
      title: "Îles flottantes légères sur crème anglaise vanillée",
      style: "gourmet",
      prepTime: "12 min",
      cookTime: "8 min",
      baseServings: 2,
      costFor2: 2.30,
      ingredients: [
        { name: "Œufs", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait demi-écrémé", qty: 250, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Sucre & Vanille", qty: 40, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Amandes effilées", qty: 15, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Préparer une crème anglaise légère avec les jaunes d'œufs, le sucre et le lait vanillé.",
        "Monter les blancs en neige ferme, les pocher 1 minute au micro-ondes ou sur le lait et les déposer sur la crème."
      ]
    },
    {
      id: "des-24",
      title: "Coupe glacée ou yaourt glacé minute aux fruits rouges mixés et éclats de chocolat",
      style: "balanced",
      prepTime: "5 min",
      cookTime: "0 min",
      baseServings: 2,
      costFor2: 2.30,
      ingredients: [
        { name: "Fruits rouges surgelés", qty: 180, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Yaourt grec", qty: 150, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Miel", qty: 1, unit: "c. à soupe", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Chocolat noir concassé", qty: 20, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" }
      ],
      steps: [
        "Mixer les fruits rouges surgelés avec le yaourt grec et le miel pour obtenir un yaourt glacé onctueux immédiat.",
        "Servir parsemé d'éclats de chocolat noir."
      ]
    }
  ],

  // Coûts moyens estimés en supermarché (pour 2 adultes : baseServings = 2)
  estimatedCostsFor2: {
    // Dîners de semaine (économiques & équilibrés)
    "wd-1": 3.40,
    "wd-2": 5.20,
    "wd-3": 2.90,
    "wd-4": 3.50,
    "wd-5": 6.40,
    "wd-6": 3.80,
    "wd-7": 4.60,
    "wd-8": 5.40,
    "wd-9": 3.60,
    "wd-10": 4.80,
    "wd-11": 4.20,
    "wd-12": 3.90,
    "wd-13": 5.90,
    "wd-14": 5.50,
    "wd-15": 3.50,
    "wd-16": 3.90,
    "wd-17": 6.80,
    "wd-18": 4.30,
    "wd-19": 5.80,
    "wd-20": 4.90,
    // Repas week-end équilibrés
    "we-b1": 7.20,
    "we-b2": 5.40,
    "we-b3": 7.90,
    "we-b4": 8.50,
    "we-b5": 5.60,
    "we-b6": 6.80,
    // Menus Plaisir
    "we-p1": 8.90,
    "we-p2": 6.80,
    "we-p3": 7.90,
    "we-p4": 8.60,
    "we-p5": 9.40,
    "we-p6": 8.20,
    "we-p7": 10.80,
    "we-p8": 7.50,
    // Menus Gourmet
    "gm-1": 14.90,
    "gm-2": 14.50,
    "gm-3": 16.80,
    "gm-4": 12.90,
    "gm-5": 15.40,
    "gm-6": 13.80,
    "gm-7": 15.20,
    "gm-8": 14.20,
    "gm-9": 14.60,
    "gm-10": 13.90,
    "gm-11": 13.20,
    "gm-12": 15.90,
    // Desserts
    "des-1": 2.40,
    "des-2": 2.20,
    "des-3": 2.90,
    "des-4": 2.50,
    "des-5": 2.60,
    "des-6": 2.30,
    "des-7": 1.90,
    "des-8": 2.40,
    "des-9": 2.10,
    "des-10": 2.00
  }
};

// Enrichissement automatique de chaque recette et dessert avec son coût pour 2 parts et normalisation de simplicité
(function attachCosts() {
  const db = window.RECIPES_DB;
  const costMap = db.estimatedCostsFor2 || {};
  [
    ...(db.weekdayDinners || []),
    ...(db.weekendBalancedMeals || []),
    ...(db.weekendPleasureMeals || []),
    ...(db.gourmetMeals || [])
  ].forEach((r) => {
    if (typeof r.costFor2 !== 'number') {
      r.costFor2 =
        costMap[r.id] ||
        (r.type === 'gourmet' ? 14.50 : r.type === 'weekend-pleasure' ? 8.50 : 4.50);
    }
    // Toutes les recettes (Équilibré, Plaisir, Gourmet) restent simples à réaliser
    if (r.difficulty === 'Moyenne') {
      r.difficulty = 'Facile';
    }
  });
  (db.weekendDesserts || []).forEach((d) => {
    if (typeof d.costFor2 !== 'number') {
      d.costFor2 = costMap[d.id] || (d.style === 'gourmet' ? 2.60 : 2.30);
    }
  });
})();

