import { WordCategory } from '../types';

export const nlWordCategories: WordCategory[] = [
  {
    id: 'animals',
    name: 'Dieren',
    emoji: '🐾',
    words: [
      'olifant', 'giraffe', 'pinguïn', 'dolfijn', 'kangoeroe',
      'octopus', 'vlinder', 'krokodil', 'flamingo', 'egel',
      'koala', 'luipaard', 'panda', 'wasbeer', 'zebra',
      'gorilla', 'jachtluipaard', 'pauw', 'nijlpaard', 'gordeldier',
      'adelaar', 'haai', 'schildpad', 'kameleon', 'wolf',
      'beer', 'leeuw', 'tijger', 'slang', 'uil',
      'walvis', 'neushoorn', 'struisvogel', 'bever', 'vleermuis',
      'bij', 'spin', 'krab', 'kwal', 'paard',
      'konijn', 'muis', 'kat', 'hond', 'papegaai',
      'toekan', 'pelikaan', 'zwaan', 'otter', 'zeehond'
    ]
  },
  {
    id: 'food',
    name: 'Eten',
    emoji: '🍕',
    words: [
      'pizza', 'hamburger', 'spaghetti', 'sushi', 'taco',
      'pannenkoeken', 'chocolade', 'watermeloen', 'ananas', 'avocado',
      'croissant', 'burrito', 'lasagne', 'taart', 'pretzel',
      'popcorn', 'empanada', 'wafel', 'boterham', 'nachos',
      'paella', 'stroopwafel', 'bitterballen', 'poffertjes', 'ijs',
      'pudding', 'salade', 'soep', 'rijst', 'kip',
      'mango', 'aardbei', 'banaan', 'druif', 'kers',
      'kaas', 'ham', 'spek', 'ei', 'brood',
      'koekje', 'donut', 'brownie', 'gelei', 'snoep',
      'koffie', 'limonade', 'smoothie', 'omelet', 'kroket'
    ]
  },
  {
    id: 'places',
    name: 'Plaatsen',
    emoji: '🏖️',
    words: [
      'strand', 'berg', 'bibliotheek', 'ziekenhuis', 'vliegveld',
      'museum', 'stadion', 'restaurant', 'casino', 'dierentuin',
      'park', 'bioscoop', 'theater', 'kerk', 'supermarkt',
      'school', 'universiteit', 'sportschool', 'zwembad', 'tuin',
      'plein', 'markt', 'station', 'haven', 'vuurtoren',
      'kasteel', 'paleis', 'piramide', 'grot', 'vulkaan',
      'aquarium', 'circus', 'discotheek', 'cafetaria', 'bakkerij',
      'apotheek', 'bank', 'kantoor', 'fabriek', 'boerderij',
      'begraafplaats', 'gevangenis', 'ambassade', 'kathedraal', 'moskee',
      'tempel', 'klooster', 'sterrenwacht', 'planetarium', 'klif'
    ]
  },
  {
    id: 'professions',
    name: 'Beroepen',
    emoji: '👨‍⚕️',
    words: [
      'dokter', 'brandweerman', 'astronaut', 'kok', 'piloot',
      'leraar', 'detective', 'architect', 'chirurg', 'muzikant',
      'advocaat', 'politieagent', 'dierenarts', 'journalist', 'ingenieur',
      'tandarts', 'verpleegster', 'fotograaf', 'schilder', 'acteur',
      'zanger', 'danser', 'schrijver', 'wetenschapper', 'programmeur',
      'monteur', 'elektricien', 'timmerman', 'bakker', 'tuinman',
      'bibliothecaris', 'archeoloog', 'bioloog', 'scheikundige', 'natuurkundige',
      'psycholoog', 'socioloog', 'econoom', 'accountant', 'bankier',
      'kapper', 'kleermaker', 'schoenmaker', 'juwelier', 'horlogemaker',
      'zeeman', 'visser', 'boer', 'veehouder', 'mijnwerker'
    ]
  },
  {
    id: 'movies',
    name: 'Films',
    emoji: '🎬',
    words: [
      'titanic', 'avatar', 'frozen', 'jaws', 'batman',
      'shrek', 'inception', 'gladiator', 'matrix', 'coco',
      'up', 'ratatouille', 'toy story', 'finding nemo', 'cars',
      'moana', 'encanto', 'spider-man', 'iron man', 'thor',
      'jurassic park', 'harry potter', 'star wars', 'the godfather', 'forrest gump',
      'rocky', 'rambo', 'terminator', 'alien', 'indiana jones',
      'the lion king', 'aladdin', 'mulan', 'tarzan', 'pocahontas',
      'hercules', 'dumbo', 'bambi', 'pinocchio', 'cinderella',
      'the little mermaid', 'interstellar', 'dunkirk', 'joker', 'aquaman',
      'wonder woman', 'superman', 'hulk', 'deadpool', 'venom'
    ]
  },
  {
    id: 'sports',
    name: 'Sport',
    emoji: '⚽',
    words: [
      'voetbal', 'basketbal', 'tennis', 'zwemmen', 'honkbal',
      'volleybal', 'golf', 'boksen', 'fietsen', 'atletiek',
      'surfen', 'skiën', 'schaatsen', 'karate', 'judo',
      'hockey', 'rugby', 'cricket', 'badminton', 'tafeltennis',
      'klimmen', 'parachutespringen', 'duiken', 'zeilen', 'roeien',
      'gymnastiek', 'worstelen', 'schermen', 'polo', 'paardrijden',
      'snowboarden', 'wakeboarden', 'skateboarden', 'parkour', 'crossfit',
      'triatlon', 'marathon', 'tienkamp', 'vijfkamp', 'biatlon',
      'taekwondo', 'aikido', 'sumo', 'kickboksen', 'capoeira',
      'darten', 'biljart', 'bowlen', 'schaken', 'poker'
    ]
  },
  {
    id: 'objects',
    name: 'Voorwerpen',
    emoji: '🔧',
    words: [
      'telefoon', 'computer', 'televisie', 'klok', 'lamp',
      'stoel', 'tafel', 'bed', 'spiegel', 'raam',
      'deur', 'trap', 'lift', 'fiets', 'auto',
      'vliegtuig', 'boot', 'trein', 'motor', 'skateboard',
      'gitaar', 'piano', 'drumstel', 'viool', 'fluit',
      'camera', 'boek', 'potlood', 'schaar', 'paraplu',
      'koffer', 'rugzak', 'handtas', 'portemonnee', 'sleutel',
      'hangslot', 'zaklamp', 'kompas', 'verrekijker', 'telescoop',
      'microscoop', 'thermometer', 'stethoscoop', 'spuit', 'scalpel',
      'hamer', 'schroevendraaier', 'boor', 'zaag', 'tang'
    ]
  },
  {
    id: 'nature',
    name: 'Natuur',
    emoji: '🌳',
    words: [
      'boom', 'bloem', 'rivier', 'meer', 'oceaan',
      'bos', 'jungle', 'woestijn', 'eiland', 'waterval',
      'regenboog', 'wolk', 'zon', 'maan', 'ster',
      'regen', 'sneeuw', 'donder', 'bliksem', 'tornado',
      'aardbeving', 'tsunami', 'gletsjer', 'noorderlicht', 'zonsopgang',
      'zonsondergang', 'koraal', 'zeewier', 'paddenstoel', 'cactus',
      'palmboom', 'bamboe', 'eik', 'den', 'wilg',
      'orchidee', 'roos', 'tulp', 'zonnebloem', 'madeliefje',
      'berg', 'vallei', 'kloof', 'weide', 'moeras',
      'mangrove', 'toendra', 'savanne', 'steppe', 'oase'
    ]
  }
];
