import { WordCategory } from '../types';

export const esWordCategories: WordCategory[] = [
  {
    id: 'animals',
    name: 'Animales',
    emoji: '🐾',
    words: [
      'elefante', 'jirafa', 'pingüino', 'delfín', 'canguro',
      'pulpo', 'mariposa', 'cocodrilo', 'flamenco', 'erizo',
      'koala', 'leopardo', 'panda', 'mapache', 'cebra',
      'gorila', 'guepardo', 'pavo real', 'hipopótamo', 'armadillo',
      'águila', 'tiburón', 'tortuga', 'camaleón', 'lobo',
      'oso', 'león', 'tigre', 'serpiente', 'búho'
    ]
  },
  {
    id: 'food',
    name: 'Comida',
    emoji: '🍕',
    words: [
      'pizza', 'hamburguesa', 'espagueti', 'sushi', 'tacos',
      'pancakes', 'chocolate', 'sandía', 'piña', 'aguacate',
      'croissant', 'burrito', 'lasaña', 'pastel', 'pretzel',
      'palomitas', 'empanada', 'waffle', 'sándwich', 'nachos',
      'paella', 'ceviche', 'arepa', 'churros', 'helado',
      'flan', 'ensalada', 'sopa', 'arroz', 'pollo'
    ]
  },
  {
    id: 'places',
    name: 'Lugares',
    emoji: '🏖️',
    words: [
      'playa', 'montaña', 'biblioteca', 'hospital', 'aeropuerto',
      'museo', 'estadio', 'restaurante', 'casino', 'zoológico',
      'parque', 'cine', 'teatro', 'iglesia', 'supermercado',
      'escuela', 'universidad', 'gimnasio', 'piscina', 'jardín',
      'plaza', 'mercado', 'estación', 'puerto', 'faro',
      'castillo', 'palacio', 'pirámide', 'cueva', 'volcán'
    ]
  },
  {
    id: 'professions',
    name: 'Profesiones',
    emoji: '👨‍⚕️',
    words: [
      'doctor', 'bombero', 'astronauta', 'chef', 'piloto',
      'maestro', 'detective', 'arquitecto', 'cirujano', 'músico',
      'abogado', 'policía', 'veterinario', 'periodista', 'ingeniero',
      'dentista', 'enfermero', 'fotógrafo', 'pintor', 'actor',
      'cantante', 'bailarín', 'escritor', 'científico', 'programador',
      'mecánico', 'electricista', 'carpintero', 'panadero', 'jardinero'
    ]
  },
  {
    id: 'movies',
    name: 'Películas',
    emoji: '🎬',
    words: [
      'titanic', 'avatar', 'frozen', 'tiburón', 'batman',
      'shrek', 'origen', 'gladiador', 'matrix', 'coco',
      'up', 'ratatouille', 'toy story', 'buscando a nemo', 'cars',
      'moana', 'encanto', 'spider-man', 'iron man', 'thor',
      'jurassic park', 'harry potter', 'star wars', 'el padrino', 'forrest gump',
      'rocky', 'rambo', 'terminator', 'alien', 'indiana jones'
    ]
  },
  {
    id: 'sports',
    name: 'Deportes',
    emoji: '⚽',
    words: [
      'fútbol', 'baloncesto', 'tenis', 'natación', 'béisbol',
      'voleibol', 'golf', 'boxeo', 'ciclismo', 'atletismo',
      'surf', 'esquí', 'patinaje', 'karate', 'judo',
      'hockey', 'rugby', 'cricket', 'bádminton', 'ping pong',
      'escalada', 'paracaidismo', 'buceo', 'vela', 'remo',
      'gimnasia', 'lucha', 'esgrima', 'polo', 'equitación'
    ]
  },
  {
    id: 'objects',
    name: 'Objetos',
    emoji: '🔧',
    words: [
      'teléfono', 'computadora', 'televisión', 'reloj', 'lámpara',
      'silla', 'mesa', 'cama', 'espejo', 'ventana',
      'puerta', 'escalera', 'ascensor', 'bicicleta', 'carro',
      'avión', 'barco', 'tren', 'moto', 'patineta',
      'guitarra', 'piano', 'tambor', 'violín', 'flauta',
      'cámara', 'libro', 'lápiz', 'tijeras', 'paraguas'
    ]
  },
  {
    id: 'nature',
    name: 'Naturaleza',
    emoji: '🌳',
    words: [
      'árbol', 'flor', 'río', 'lago', 'océano',
      'bosque', 'selva', 'desierto', 'isla', 'cascada',
      'arcoíris', 'nube', 'sol', 'luna', 'estrella',
      'lluvia', 'nieve', 'trueno', 'relámpago', 'tornado',
      'terremoto', 'maremoto', 'glaciar', 'aurora', 'amanecer',
      'atardecer', 'coral', 'alga', 'hongo', 'cactus'
    ]
  }
];
