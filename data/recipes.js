// Base de données complète de recettes (Semaine Healthy & Économique, Week-end Équilibré, Week-end Plaisir, et Desserts)
// Toutes les quantités d'ingrédients sont calibrées pour baseServings: 2 (2 adultes par défaut).

window.RECIPES_DB = {
  categories: {
    "Fruits & Légumes": { icon: "🥦", order: 1 },
    "Viandes, Poissons & Œufs": { icon: "🍗", order: 2 },
    "Crèmerie & Frais": { icon: "🧀", order: 3 },
    "Épicerie salée": { icon: "🍝", order: 4 },
    "Épicerie sucrée & Pâtisserie": { icon: "🍫", order: 5 },
    "Boulangerie & Divers": { icon: "🥖", order: 6 }
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
    }
  ],

  // =========================================================================
  // 3. MENUS PLAISIR DU WEEK-END : Simplicité moyenne & durée moyenne (30-45 min), gourmands
  // =========================================================================
  weekendPleasureMeals: [
    {
      id: "we-p1",
      title: "Burgers gourmets maison au cheddar affiné, oignons caramélisés & frites de patate douce",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "20 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "680 kcal / part",
      tags: ["Menu Plaisir 🌟", "Gourmand", "Simplicité moyenne"],
      baseServings: 2,
      description: "Le vrai burger bistrot fait maison avec des oignons fondants et des frites dorées au four.",
      ingredients: [
        { name: "Pains burgers briochés", qty: 2, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Steaks hachés bœuf 5% ou 15%", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Cheddar en tranches", qty: 4, unit: "tranches", aisle: "Crèmerie & Frais" },
        { name: "Patates douces (ou pommes de terre)", qty: 400, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Oignon rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Tomate & feuilles de salade", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Préchauffer le four à 200°C. Couper les patates douces en frites, les enrober d'une cuillère d'huile et de paprika et enfourner 20 à 25 minutes.",
        "Émincer l'oignon rouge et le faire compoter à feu doux 10 minutes dans une poêle avec une goutte d'eau et une pincée de sucre ou vinaigre balsamique.",
        "Saisir les steaks hachés à feu vif 3 minutes par face, déposer le cheddar dessus en fin de cuisson pour qu'il fonde.",
        "Toaster légèrement les pains, monter les burgers avec salade, tomate, steak au cheddar et oignons caramélisés, et servir avec les frites."
      ]
    },
    {
      id: "we-p2",
      title: "Risotto crémeux aux champignons bruns, vin blanc et copeaux de parmesan",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "25 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "590 kcal / part",
      tags: ["Menu Plaisir 🌟", "Italien", "Végétarien"],
      baseServings: 2,
      description: "Un risotto onctueux à souhait, mijoté doucement au bouillon et parfumé aux champignons poêlés.",
      ingredients: [
        { name: "Riz à risotto (Arborio)", qty: 160, unit: "g", aisle: "Épicerie salée" },
        { name: "Champignons bruns de Paris", qty: 250, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Parmesan râpé ou copeaux", qty: 50, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Bouillon de légumes", qty: 1, unit: "cube", aisle: "Épicerie salée" },
        { name: "Beurre", qty: 20, unit: "g", aisle: "Crèmerie & Frais" }
      ],
      steps: [
        "Préparer 600 ml de bouillon chaud. Nettoyer et poêler les champignons émincés 6 minutes avec une noisette de beurre, puis réserver.",
        "Dans une sauteuse, faire revenir l'échalote ciselée puis nacrer le riz Arborio 2 minutes jusqu'à ce qu'il soit translucide.",
        "Verser le bouillon chaud louche par louche pendant 18 minutes en remuant régulièrement jusqu'à absorption.",
        "Hors du feu, incorporer les champignons, le parmesan et le reste de beurre pour lier le risotto. Servir aussitôt."
      ]
    },
    {
      id: "we-p3",
      title: "Lasagnes maison à la bolognaise mijotée et béchamel légère",
      type: "weekend-pleasure",
      prepTime: "20 min",
      cookTime: "25 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "640 kcal / part",
      tags: ["Menu Plaisir 🌟", "Gratiné", "Convivial"],
      baseServings: 2,
      description: "Des lasagnes fondantes et gratinées préparées maison pour un vrai plaisir du week-end.",
      ingredients: [
        { name: "Feuilles de lasagnes", qty: 6, unit: "pièces", aisle: "Épicerie salée" },
        { name: "Bœuf haché", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Coulis de tomates", qty: 400, unit: "g", aisle: "Épicerie salée" },
        { name: "Lait demi-écrémé", qty: 250, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Emmental ou Mozzarella râpée", qty: 70, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Oignon & Carotte", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire revenir l'oignon et la carotte coupés finement avec le bœuf haché pendant 6 minutes, puis ajouter le coulis de tomates et les herbes. Mijoter 10 minutes.",
        "Préparer une béchamel rapide en chauffant le lait épaissi avec 1 c. à soupe de farine ou maïzena et une pincée de muscade.",
        "Dans un plat à gratin, alterner couches de sauce bolognaise, feuilles de lasagnes et béchamel. Terminer par le fromage râpé.",
        "Enfourner 25 minutes à 190°C jusqu'à obtenir un beau gratiné."
      ]
    },
    {
      id: "we-p4",
      title: "Tagliatelles fraîches au saumon fumé, crème citronnée et aneth",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "15 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "610 kcal / part",
      tags: ["Menu Plaisir 🌟", "Poisson", "Gourmand"],
      baseServings: 2,
      description: "Un grand classique gourmand où la fraîcheur du citron et de l'aneth sublime les pâtes fraîches.",
      ingredients: [
        { name: "Tagliatelles fraîches", qty: 250, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Saumon fumé", qty: 120, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Crème fraîche", qty: 120, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Citron non traité", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Aneth ou ciboulette", qty: 0.5, unit: "botte", aisle: "Fruits & Légumes" },
        { name: "Échalote", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire fondre l'échalote ciselée dans une poêle à feu doux pendant 3 minutes.",
        "Ajouter la crème fraîche, le zeste et un trait de jus de citron, puis laisser réduire 3 minutes à feu très doux.",
        "Cuire les tagliatelles fraîches 3 à 4 minutes dans l'eau bouillante salée.",
        "Mélanger les pâtes égouttées à la sauce avec les lanières de saumon fumé et l'aneth ciselé hors du feu."
      ]
    },
    {
      id: "we-p5",
      title: "Curry thaï crémeux de crevettes au lait de coco, poivrons et riz jasmin",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "20 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "580 kcal / part",
      tags: ["Menu Plaisir 🌟", "Exotique", "Parfumé"],
      baseServings: 2,
      description: "Une évasion gourmande aux parfums de coco, gingembre et citron vert.",
      ingredients: [
        { name: "Grosses crevettes décortiquées", qty: 250, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Lait de coco", qty: 200, unit: "ml", aisle: "Épicerie salée" },
        { name: "Poivron rouge", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Riz thaï ou jasmin", qty: 140, unit: "g", aisle: "Épicerie salée" },
        { name: "Pâte de curry doux ou curry jaune", qty: 1, unit: "c. à soupe", aisle: "Épicerie salée" },
        { name: "Citron vert & Coriandre", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Lancer la cuisson du riz parfumé.",
        "Émincer le poivron en fines lanières et le faire revenir 5 minutes dans une sauteuse avec la pâte de curry.",
        "Verser le lait de coco et laisser mijoter 8 minutes à feu doux pour que les saveurs infusent.",
        "Ajouter les crevettes pour les 3 dernières minutes de cuisson, arroser d'un trait de citron vert et servir avec le riz."
      ]
    },
    {
      id: "we-p6",
      title: "Fajitas mexicaines gratinées au four (poulet épicé, poivrons, guacamole maison)",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "20 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "630 kcal / part",
      tags: ["Menu Plaisir 🌟", "Convivial", "Mexicain"],
      baseServings: 2,
      description: "Des tortillas garnies de poulet fondant aux épices douces, gratinées au four et servies avec un guacamole frais.",
      ingredients: [
        { name: "Tortillas de blé", qty: 4, unit: "pièces", aisle: "Boulangerie & Divers" },
        { name: "Filets de poulet", qty: 260, unit: "g", aisle: "Viandes, Poissons & Œufs" },
        { name: "Poivrons", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Avocat mûr", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Fromage râpé", qty: 60, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Sauce tomate ou salsa", qty: 150, unit: "g", aisle: "Épicerie salée" }
      ],
      steps: [
        "Émincer le poulet et les poivrons, les faire sauter 10 minutes à la poêle avec du paprika et du cumin.",
        "Garnir les tortillas du mélange poulet-poivrons, les rouler dans un plat à four, napper de sauce tomate et de fromage râpé.",
        "Gratiner 10 minutes au four à 200°C.",
        "Pendant ce temps, écraser l'avocat avec citron, sel et poivre pour accompagner les fajitas chaudes."
      ]
    },
    {
      id: "we-p7",
      title: "Hachis Parmentier de canard confit et salade aux noix",
      type: "weekend-pleasure",
      prepTime: "15 min",
      cookTime: "25 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "650 kcal / part",
      tags: ["Menu Plaisir 🌟", "Bistrot", "Tradition"],
      baseServings: 2,
      description: "Un grand classique de bistrot français avec un effiloché de canard sous une purée maison gratinée.",
      ingredients: [
        { name: "Cuisses de canard confit", qty: 2, unit: "pièces", aisle: "Viandes, Poissons & Œufs" },
        { name: "Pommes de terre à purée", qty: 500, unit: "g", aisle: "Fruits & Légumes" },
        { name: "Échalotes", qty: 2, unit: "pièces", aisle: "Fruits & Légumes" },
        { name: "Lait", qty: 80, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Salade verte & cerneaux de noix", qty: 80, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Éplucher et cuire les pommes de terre 20 minutes dans l'eau salée puis les écraser en purée avec le lait chaud.",
        "Dégraisser et effilocher les cuisses de canard, puis les faire revenir 5 minutes avec les échalotes ciselées.",
        "Dans un plat à gratin, répartir l'effiloché de canard, recouvrir de purée et enfourner 15 minutes à 200°C pour dorer le dessus.",
        "Déguster avec la salade verte aux noix."
      ]
    },
    {
      id: "we-p8",
      title: "Gnocchis poêlés au gorgonzola, poires rôties et éclats de noix",
      type: "weekend-pleasure",
      prepTime: "10 min",
      cookTime: "18 min",
      difficulty: "Moyenne",
      budget: "€€ (Moyen)",
      calories: "610 kcal / part",
      tags: ["Menu Plaisir 🌟", "Végétarien", "Gourmand"],
      baseServings: 2,
      description: "L'alliance irrésistible des gnocchis dorés à la poêle, du fromage italien fondant et du croquant des noix.",
      ingredients: [
        { name: "Gnocchis à poêler ou frais", qty: 350, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Gorgonzola (ou Roquefort)", qty: 90, unit: "g", aisle: "Crèmerie & Frais" },
        { name: "Poire", qty: 1, unit: "pièce", aisle: "Fruits & Légumes" },
        { name: "Crème liquide légère", qty: 80, unit: "ml", aisle: "Crèmerie & Frais" },
        { name: "Cerneaux de noix", qty: 30, unit: "g", aisle: "Épicerie sucrée & Pâtisserie" },
        { name: "Jeunes pousses de roquette", qty: 60, unit: "g", aisle: "Fruits & Légumes" }
      ],
      steps: [
        "Faire dorer les gnocchis dans une poêle pendant 6 à 8 minutes avec les dés de poire.",
        "Dans une petite casserole, faire fondre doucement le gorgonzola dans la crème liquide avec du poivre du moulin.",
        "Napper les gnocchis dorés de sauce au gorgonzola et parsemer de cerneaux de noix concassés.",
        "Servir avec la roquette fraîche."
      ]
    }
  ],

  // =========================================================================
  // 4. DESSERTS DU WEEK-END (Associés aux 4 repas du week-end)
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
    }
  ],

  // Coûts moyens estimés en supermarché (pour 2 adultes : baseServings = 2)
  estimatedCostsFor2: {
    // Dîners de semaine (économiques & healthy)
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

// Enrichissement automatique de chaque recette et dessert avec son coût pour 2 parts
(function attachCosts() {
  const db = window.RECIPES_DB;
  const costMap = db.estimatedCostsFor2 || {};
  [...db.weekdayDinners, ...db.weekendBalancedMeals, ...db.weekendPleasureMeals].forEach((r) => {
    if (typeof r.costFor2 !== 'number') {
      r.costFor2 = costMap[r.id] || (r.type === 'weekend-pleasure' ? 8.50 : 4.50);
    }
  });
  db.weekendDesserts.forEach((d) => {
    if (typeof d.costFor2 !== 'number') {
      d.costFor2 = costMap[d.id] || 2.30;
    }
  });
})();

