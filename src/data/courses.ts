import { Course, Badge } from '../types';

export const COURSES: Course[] = [
  {
    id: 'course_beginner',
    title: 'Cours Débutant : La Rangée de Base',
    level: 'Débutant',
    description: 'Maîtrisez les touches repères F et J ainsi que toute la rangée centrale sans regarder le clavier.',
    icon: '🎯',
    lessons: [
      {
        id: 'beg_1',
        title: 'Leçon 1 : Repères F et J',
        description: 'Repérez le petit ergot relief sur F (index gauche) et J (index droit).',
        level: 'Débutant',
        category: 'home_row',
        text: 'ffff jjjj ff jj fj jf fff jjj fjfj jfjf fff jjj ff jj fj',
        targetWpm: 15,
        minAccuracy: 95,
        keysTaught: ['f', 'j']
      },
      {
        id: 'beg_2',
        title: 'Leçon 2 : Rangée de base F D S A',
        description: 'Déplacez la main gauche sur D (majeur), S (annulaire) et A (auriculaire).',
        level: 'Débutant',
        category: 'home_row',
        text: 'fdsa asdf ff dd ss aa fsa das fda asf fds asd fds',
        targetWpm: 18,
        minAccuracy: 95,
        keysTaught: ['f', 'd', 's', 'a']
      },
      {
        id: 'beg_3',
        title: 'Leçon 3 : Rangée de base J K L M',
        description: 'Déplacez la main droite sur K (majeur), L (annulaire) et M (auriculaire).',
        level: 'Débutant',
        category: 'home_row',
        text: 'jklm mlkj jj kk ll mm jkl klm jm mlk jkm lkj',
        targetWpm: 18,
        minAccuracy: 95,
        keysTaught: ['j', 'k', 'l', 'm']
      },
      {
        id: 'beg_4',
        title: 'Leçon 4 : Rangée de base complète & Espace',
        description: 'Combinez les deux mains avec la barre d\'espace actionnée par les pouces.',
        level: 'Débutant',
        category: 'home_row',
        text: 'qsdf jklm fds jkl qsd fgh jkl mfd sjk lqf dsg hjk',
        targetWpm: 22,
        minAccuracy: 96,
        keysTaught: ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm']
      },
      {
        id: 'beg_5',
        title: 'Leçon 5 : Mots simples de la rangée centrale',
        description: 'Saisissez vos premiers vrais mots composés uniquement de la rangée de base.',
        level: 'Débutant',
        category: 'home_row',
        text: 'sa sas fala flash salsa gala flasque dada kadhafas las sa la ma fa ga',
        targetWpm: 25,
        minAccuracy: 96
      }
    ]
  },
  {
    id: 'course_intermediate',
    title: 'Cours Intermédiaire : Rangées Supérieure et Inférieure',
    level: 'Intermédiaire',
    description: 'Etendez votre portée vers le haut (E R T U I O P) et vers le bas (C V B N).',
    icon: '⚡',
    lessons: [
      {
        id: 'int_1',
        title: 'Leçon 6 : Rangée supérieure - E R T Y U I O P',
        description: 'Apprenez les voyelles E, I, O, U et les consonnes R, T, Y, P.',
        level: 'Intermédiaire',
        category: 'top_row',
        text: 'ert yui op ertu iop er ty ui op eir tou pye rui op eir tou',
        targetWpm: 28,
        minAccuracy: 96,
        keysTaught: ['e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
      },
      {
        id: 'int_2',
        title: 'Leçon 7 : Mots courants (Base + Haut)',
        description: 'Combinez la rangée de base avec la rangée supérieure.',
        level: 'Intermédiaire',
        category: 'top_row',
        text: 'route porte partie sortie vitesse pirate courte tour de magie tapis rouge',
        targetWpm: 32,
        minAccuracy: 96
      },
      {
        id: 'int_3',
        title: 'Leçon 8 : Rangée inférieure - W X C V B N',
        description: 'Descendez vos doigts sur la rangée inférieure avec précision.',
        level: 'Intermédiaire',
        category: 'bottom_row',
        text: 'wxc vbn wxcv bn wx cv bn wxc vbn cvb wxc bnc vwx cbn',
        targetWpm: 30,
        minAccuracy: 95,
        keysTaught: ['w', 'x', 'c', 'v', 'b', 'n']
      },
      {
        id: 'int_4',
        title: 'Leçon 9 : Mots complets toutes lettres minuscules',
        description: 'Saisissez des phrases courantes sur l\'ensemble des 3 rangées du clavier.',
        level: 'Intermédiaire',
        category: 'texts',
        text: 'la pratique reguliere de la dactylographie assure une frappe rapide et fluide sur tout clavier',
        targetWpm: 35,
        minAccuracy: 97
      }
    ]
  },
  {
    id: 'course_advanced',
    title: 'Cours Avancé : Majuscules, Chiffres et Ponctuation',
    level: 'Avancé',
    description: 'Combinez les touches Shift, les chiffres de 0 à 9 et la ponctuation complexe.',
    icon: '🚀',
    lessons: [
      {
        id: 'adv_1',
        title: 'Leçon 10 : Les Majuscules et la touche Shift',
        description: 'Utilisez la touche Shift opposée à la main qui tape la lettre.',
        level: 'Avancé',
        category: 'capitals',
        text: 'Opponè Classroom Paris Lyon Marseille France Europe Afrique Amerique Asie',
        targetWpm: 38,
        minAccuracy: 96,
        keysTaught: ['Shift']
      },
      {
        id: 'adv_2',
        title: 'Leçon 11 : Les Chiffres et les Nombres',
        description: 'Maîtrisez la rangée supérieure des chiffres de 0 à 9.',
        level: 'Avancé',
        category: 'numbers',
        text: '123 456 7890 2026 100% 365 jours 24 heures 60 minutes 1000 pixels',
        targetWpm: 35,
        minAccuracy: 95,
        keysTaught: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
      },
      {
        id: 'adv_3',
        title: 'Leçon 12 : Ponctuation & Accents français',
        description: 'Maîtrisez les points, virgules, points d\'interrogation et é è à ç ù.',
        level: 'Avancé',
        category: 'symbols',
        text: 'Où allez-vous ? C\'est une excellente nouvelle ! Réussir nécessite de l\'effort, de la patience et de la rigueur.',
        targetWpm: 40,
        minAccuracy: 97
      }
    ]
  },
  {
    id: 'course_expert',
    title: 'Cours Expert : Maîtrise Virtuose & Code',
    level: 'Expert',
    description: 'Atteignez des vitesses supérieures à 50-70 Mots/Min sur des textes littéraires et du code informatique.',
    icon: '👑',
    lessons: [
      {
        id: 'exp_1',
        title: 'Leçon 13 : Défi Grandes Citations',
        description: 'Test de vitesse et précision sur des maximes célèbres.',
        level: 'Expert',
        category: 'texts',
        text: 'La connaissance s\'acquiert par l\'expérience, tout le reste n\'est que de l\'information. La simplicité est la sophistication suprême.',
        targetWpm: 50,
        minAccuracy: 98
      },
      {
        id: 'exp_2',
        title: 'Leçon 14 : Défi Code Informatique (JavaScript)',
        description: 'Entraînez-vous à saisir de la syntaxe de programmation avec accolades et symboles.',
        level: 'Expert',
        category: 'symbols',
        text: 'const speed = (words, seconds) => Math.round((words / seconds) * 60); if (accuracy >= 98) console.log("Parfait !");',
        targetWpm: 45,
        minAccuracy: 97
      },
      {
        id: 'exp_3',
        title: 'Leçon 15 : Le Grand Marathon Opponè',
        description: 'L\'épreuve ultime pour valider votre certificat officiel Opponè.',
        level: 'Expert',
        category: 'texts',
        text: 'Félicitations pour votre parcours dactylographique. Vous avez développé une mémoire musculaire solide et un contrôle exemplaire de chacun de vos dix doigts sur le clavier.',
        targetWpm: 60,
        minAccuracy: 98
      }
    ]
  }
];

export const BADGES: Badge[] = [
  {
    id: 'badge_first_step',
    title: 'Premier Pas',
    description: 'Complétez votre premier exercice de dactylographie.',
    icon: '🐣',
    category: 'lessons'
  },
  {
    id: 'badge_speed_30',
    title: 'Sprinter 30 WPM',
    description: 'Atteignez une vitesse de 30 mots par minute.',
    icon: '🏃',
    category: 'wpm'
  },
  {
    id: 'badge_speed_50',
    title: 'Pilote 50 WPM',
    description: 'Atteignez une vitesse de 50 mots par minute.',
    icon: '🏎️',
    category: 'wpm'
  },
  {
    id: 'badge_speed_70',
    title: 'Éclair 70 WPM',
    description: 'Atteignez une vitesse exceptionnelle de 70 mots par minute !',
    icon: '⚡',
    category: 'wpm'
  },
  {
    id: 'badge_accuracy_100',
    title: 'Chirurgien du Clavier',
    description: 'Obtenez 100% de précision sur un exercice d\'au moins 50 mots.',
    icon: '🎯',
    category: 'accuracy'
  },
  {
    id: 'badge_course_beginner',
    title: 'Diplômé Débutant',
    description: 'Terminez toutes les leçons du niveau Débutant.',
    icon: '🎓',
    category: 'lessons'
  },
  {
    id: 'badge_multiplayer_win',
    title: 'Champion du Multijoueur',
    description: 'Remportez votre première victoire dans une course en temps réel.',
    icon: '🏆',
    category: 'multiplayer'
  }
];
