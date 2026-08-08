export interface DictionaryTextItem {
  id: string;
  grade: '6ème' | '5ème' | '4ème' | '3ème';
  category: string;
  title: string;
  text: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  targetWpm: number;
}

export const COLLEGE_DICTIONARY_TEXTS: DictionaryTextItem[] = [
  // ================= 6ème =================
  {
    id: '6e_1',
    grade: '6ème',
    category: 'Français & Récit',
    title: 'Le Conte et la Mythologie (6ème)',
    text: "Ulysse naviguait sur la mer Méditerranée avec son équipage. Pour échapper aux sirènes et à leur chant envoûtant, le héros grec demanda à ses marins de se boucher les oreilles avec de la cire d'abeille.",
    difficulty: 'Débutant',
    targetWpm: 30
  },
  {
    id: '6e_2',
    grade: '6ème',
    category: 'Sciences & Nature',
    title: 'La Biodiversité et les Écosystèmes (6ème)',
    text: "La forêt abrite des milliers d'espèces végétales et animales. La photosynthèse permet aux plantes vertes de fabriquer de la matière organique grâce à la lumière du soleil et à l'eau captée par les racines.",
    difficulty: 'Débutant',
    targetWpm: 30
  },
  {
    id: '6e_3',
    grade: '6ème',
    category: 'Initiation Informatique',
    title: 'Posture et Clavier AZERTY (6ème)',
    text: "Pour bien taper sur un clavier ordinateur en 6ème, posez vos dix doigts sur la ligne centrale. Vos deux pouces restent au-dessus de la grande barre d'espace pour rythmer chaque mot.",
    difficulty: 'Débutant',
    targetWpm: 25
  },
  {
    id: '6e_4',
    grade: '6ème',
    category: 'Histoire Antique',
    title: 'L\'Égypte des Pharaons (6ème)',
    text: "Le Nil traversait l'Égypte antique et apportait le limon fertile nécessaire aux récoltes. Les égyptiens écrivaient sur du papyrus à l'aide de hiéroglyphes sculptés ou dessinés.",
    difficulty: 'Débutant',
    targetWpm: 32
  },

  // ================= 5ème =================
  {
    id: '5e_1',
    grade: '5ème',
    category: 'Histoire du Moyen Âge',
    title: 'Chevaliers et Châteaux Forts (5ème)',
    text: "Au Moyen Âge, le chevalier prêtait serment de fidélité à son seigneur lors de la cérémonie de l'hommage. Revêtu de sa cotte de mailles et armé d'une lance, il défendait le domaine féodal.",
    difficulty: 'Intermédiaire',
    targetWpm: 40
  },
  {
    id: '5e_2',
    grade: '5ème',
    category: 'Littérature & Aventure',
    title: 'Le Roman de Renart (5ème)',
    text: "Renart le goupil usait de mille ruses et stratagèmes pour duper Ysangrin le loup. Ses aventures satiriques et comiques captivaient le public des foires médiévales au Moyen Âge.",
    difficulty: 'Intermédiaire',
    targetWpm: 42
  },
  {
    id: '5e_3',
    grade: '5ème',
    category: 'Géographie & Climat',
    title: 'Gestion de l\'Eau et Ressources (5ème)',
    text: "L'eau douce est une ressource précieuse et inégalement répartie sur la planète. Le cycle naturel de l'eau comprend l'évaporation, la condensation dans les nuages et les précipitations.",
    difficulty: 'Intermédiaire',
    targetWpm: 38
  },
  {
    id: '5e_4',
    grade: '5ème',
    category: 'Technologie & Réseaux',
    title: 'Communication et Internet (5ème)',
    text: "Les données numériques voyagent sous forme de paquets à travers la fibre optique et les câbles sous-marins. L'adresse IP permet d'identifier chaque appareil connecté sur le réseau mondial.",
    difficulty: 'Intermédiaire',
    targetWpm: 45
  },

  // ================= 4ème =================
  {
    id: '4e_1',
    grade: '4ème',
    category: 'Littérature du XIXe siècle',
    title: 'Nouvelles Fantastiques de Maupassant (4ème)',
    text: "La nuit tombait doucement sur la ville silencieuse et un frisson étrange glissait le long de mon échine. Les ombres projetées par les lampadaires à gaz semblaient s'animer d'une vie mystérieuse.",
    difficulty: 'Avancé',
    targetWpm: 50
  },
  {
    id: '4e_2',
    grade: '4ème',
    category: 'Histoire & Révolutions',
    title: 'La Révolution Industrielle (4ème)',
    text: "L'invention de la machine à vapeur par James Watt transforma profondément l'économie européenne au XIXe siècle. Le développement des chemins de fer accéléra les échanges de marchandises et la croissance des villes.",
    difficulty: 'Avancé',
    targetWpm: 52
  },
  {
    id: '4e_3',
    grade: '4ème',
    category: 'Physique-Chimie',
    title: 'Atomes et Recommandations Moléculaires (4ème)',
    text: "Toute la matière qui nous entoure est constituée d'atomes assemblés en molécules. Une molécule d'eau contient deux atomes d'hydrogène reliés à un atome d'oxygène par des liaisons chimiques.",
    difficulty: 'Avancé',
    targetWpm: 55
  },
  {
    id: '4e_4',
    grade: '4ème',
    category: 'Citoyenneté & Droits',
    title: 'La Déclaration des Droits de l\'Homme (4ème)',
    text: "Les hommes naissent et demeurent libres et égaux en droits. Les distinctions sociales ne peuvent être fondées que sur l'utilité commune et la préservation des libertés fondamentales.",
    difficulty: 'Avancé',
    targetWpm: 48
  },

  // ================= 3ème =================
  {
    id: '3e_1',
    grade: '3ème',
    category: 'Préparation au DNB (Brevet)',
    title: 'Analyse de Texte et Argumentation (3ème)',
    text: "Pour réussir l'épreuve de français du Brevet des Collèges, il convient de structurer soigneusement son argumentation en développant des idées claires appuyées par des exemples littéraires précis.",
    difficulty: 'Expert',
    targetWpm: 60
  },
  {
    id: '3e_2',
    grade: '3ème',
    category: 'Histoire Contemporaine',
    title: 'La Construction Européenne (3ème)',
    text: "Au lendemain des deux guerres mondiales, la déclaration Schuman de 1950 posa les fondations de la Communauté Européenne du Charbon et de l'Acier afin de garantir une paix durable entre les nations.",
    difficulty: 'Expert',
    targetWpm: 62
  },
  {
    id: '3e_3',
    grade: '3ème',
    category: 'SVT & Génétique',
    title: 'L\'ADN et l\'Hérédité Cellulaire (3ème)',
    text: "L'acide désoxyribonucléique ou ADN se situe dans le noyau des cellules sous forme de chromosomes. Il porte le programme génétique individuel transmis de génération en génération lors de la reproduction.",
    difficulty: 'Expert',
    targetWpm: 65
  },
  {
    id: '3e_4',
    grade: '3ème',
    category: 'Informatique & Algorithmique',
    title: 'Programmation Scratch & Python (3ème)',
    text: "Un algorithme est une suite d'instructions précises et ordonnées exécutées par une machine. En classe de 3ème, la maîtrise des boucles logiques et des variables prépare aux métiers du numérique.",
    difficulty: 'Expert',
    targetWpm: 65
  }
];
