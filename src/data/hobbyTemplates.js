// Hazır hobi yol haritaları. Kullanıcı hepsini sonradan düzenleyebilir.
// Yeni şablon eklemek için diziye bir nesne eklemek yeterli.
export const TEMPLATES = [
  {
    id: 'violin',
    name: 'Violin',
    emoji: '🎻',
    blurb: 'From holding the bow to your first simple melody.',
    stages: [
      {
        title: 'Posture and bow hold',
        tasks: [
          'Learn the parts of the violin and bow',
          'Practice the bow hold for 5 minutes',
          'Practice standing posture and violin position',
          'Draw the bow across open strings, slowly',
        ],
      },
      {
        title: 'Open strings and first notes',
        tasks: [
          'Learn the names of the four open strings (G D A E)',
          'Play each open string with long, even bows',
          'Place your first finger on the A string',
          'Tune the violin with a tuner app',
        ],
      },
      {
        title: 'Your first melody',
        tasks: [
          'Learn the notes of a simple song (e.g. Twinkle Twinkle)',
          'Play the song slowly, one phrase at a time',
          'Play it all the way through without stopping',
        ],
      },
    ],
  },
  {
    id: 'guitar',
    name: 'Guitar',
    emoji: '🎸',
    blurb: 'Chords, strumming and your first full song.',
    stages: [
      {
        title: 'Getting to know the guitar',
        tasks: [
          'Learn the names of the six strings (E A D G B E)',
          'Tune the guitar with a tuner app',
          'Practice holding the guitar and pick',
        ],
      },
      {
        title: 'First chords',
        tasks: [
          'Learn the E minor and A minor chords',
          'Learn C, G and D major chords',
          'Switch between two chords for 5 minutes',
        ],
      },
      {
        title: 'Strumming and a first song',
        tasks: [
          'Practice a basic down-up strumming pattern',
          'Pick an easy song with 3-4 chords',
          'Play the song from start to finish',
        ],
      },
    ],
  },
  {
    id: 'drawing',
    name: 'Drawing',
    emoji: '✏️',
    blurb: 'Build a habit of seeing and sketching every day.',
    stages: [
      {
        title: 'Lines and shapes',
        tasks: [
          'Fill one page with straight lines and curves',
          'Draw circles, squares and triangles freehand',
          'Draw three simple objects from your desk',
        ],
      },
      {
        title: 'Light and shadow',
        tasks: [
          'Shade a sphere with a light source on one side',
          'Practice a gradient from light to dark',
          'Draw a simple object with a cast shadow',
        ],
      },
      {
        title: 'Drawing from life',
        tasks: [
          'Sketch a plant or a mug in 10 minutes',
          'Do a quick 2-minute sketch of your hand',
          'Finish one drawing you are proud of',
        ],
      },
    ],
  },
  {
    id: 'running',
    name: 'Running',
    emoji: '🏃',
    blurb: 'Walk-run intervals that build up to 5 km.',
    stages: [
      {
        title: 'Start gently',
        tasks: [
          'Get comfortable shoes and plan a route',
          'Do a 20-minute walk-run (1 min run, 2 min walk)',
          'Repeat the walk-run twice in one week',
        ],
      },
      {
        title: 'Build up',
        tasks: [
          'Run 3 minutes, walk 1 minute, for 20 minutes',
          'Run for 10 minutes without stopping',
          'Run for 20 minutes without stopping',
        ],
      },
      {
        title: 'Reach 5 km',
        tasks: [
          'Run 3 km at an easy pace',
          'Run 4 km at an easy pace',
          'Run 5 km',
        ],
      },
    ],
  },
]
