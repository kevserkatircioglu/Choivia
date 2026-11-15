// Hazır hobi yol haritaları. Her adım küçük (2-35 dk), isteğe bağlı ipucu içerir.
// `key` alanı başarımların hangi adıma bağlı olduğunu belirler, kullanıcı görmez.
// Yeni şablon eklemek için diziye bir nesne eklemek yeterli.
const t = (key, text, minutes, tip = '') => ({ key, text, minutes, tip })

export const TEMPLATES = [
  {
    id: 'violin',
    name: 'Violin',
    emoji: '🎻',
    blurb: 'From holding the bow to your first simple melody.',
    stages: [
      {
        title: 'Meet your violin',
        tasks: [
          t('violin-parts', 'Name the parts: scroll, neck, strings, bridge and bow', 3, 'Find a labelled diagram and point to each part on your own violin.'),
          t('violin-rosin', 'Rosin your bow lightly', 3, 'A few slow strokes along the hair is enough. Too much rosin sounds scratchy.'),
          t('bow-hold', 'Practice the bow hold without the violin', 5, 'Thumb bent, fingers relaxed and curved. Holding a pencil the same way is a good warm-up.'),
          t('violin-posture', 'Practice standing posture and violin position', 5, 'Feet shoulder-width apart, violin resting on the collarbone, shoulders relaxed.'),
          t('violin-bow-air', 'Draw the bow slowly across an open string', 5, 'Keep the bow parallel to the bridge. Count four slow beats down and four up.'),
        ],
      },
      {
        title: 'Open strings and first notes',
        tasks: [
          t('violin-names', 'Learn the four string names: G D A E', 3, 'A mnemonic helps, such as “Good Dogs Always Eat”.'),
          t('tune', 'Tune your violin with a tuner app', 5, 'Use the fine tuners first and turn the pegs only a tiny bit at a time.'),
          t('violin-long-bows', 'Play each open string with five long bows', 5),
          t('finger-one', 'Place your first finger on the A string', 5, 'A small piece of tape on the fingerboard can mark the spot while you learn.'),
          t('violin-three-notes', 'Play on the A string: open, first finger, open', 5),
        ],
      },
      {
        title: 'Your first melody',
        tasks: [
          t('song-pick', 'Choose a simple song, such as Twinkle Twinkle', 2),
          t('song-notes', 'Write down the note names for the first phrase', 5),
          t('song-phrase', 'Play the first phrase slowly', 8, 'Slow is smooth. Speed comes by itself later.'),
          t('song-through', 'Play the whole song without stopping', 10, 'Keep going after a mistake. Finishing matters more than perfection.'),
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
        title: 'Meet your guitar',
        tasks: [
          t('g-strings', 'Learn the six string names: E A D G B E', 3, 'Try the mnemonic “Eddie Ate Dynamite, Good Bye Eddie”.'),
          t('g-tune', 'Tune your guitar with a tuner app', 5, 'Tune from the thickest string to the thinnest.'),
          t('g-hold', 'Practice holding the guitar and the pick', 5),
          t('g-pluck', 'Pluck each open string slowly', 3),
        ],
      },
      {
        title: 'First chords',
        tasks: [
          t('g-em', 'Learn the E minor chord and strum all six strings', 5, 'Two fingers on the A and D strings, second fret. Press just behind the fret.'),
          t('g-am', 'Learn the A minor chord', 5),
          t('g-c', 'Learn the C major chord', 8, 'It is a stretch at first. Take it slowly and relax your wrist.'),
          t('g-g', 'Learn the G major chord', 8),
          t('g-switch', 'Switch between Em and Am for three minutes', 3, 'Aim for clean changes, not speed. Fingers should move together.'),
        ],
      },
      {
        title: 'Strumming and a first song',
        tasks: [
          t('g-down', 'Strum down on four counts with Em', 5),
          t('g-pattern', 'Practice a down, down-up, up-down-up strumming pattern', 8),
          t('g-song-pick', 'Pick a song with three or four chords', 3),
          t('g-song-through', 'Play the song from start to finish', 10),
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
          t('d-lines', 'Fill half a page with straight lines and curves', 5, 'Draw from your shoulder, not your wrist, for smoother lines.'),
          t('d-shapes', 'Draw circles, squares and triangles freehand', 5),
          t('d-objects', 'Draw three objects from your desk without erasing', 10),
          t('d-contour', 'Draw an object without lifting your pencil', 5, 'Look at the object more than at the paper.'),
        ],
      },
      {
        title: 'Light and shadow',
        tasks: [
          t('d-sphere', 'Shade a sphere with the light on one side', 10, 'Darkest part is opposite the light, with a soft edge between.'),
          t('d-gradient', 'Make a smooth gradient from light to dark', 5),
          t('d-cube', 'Draw a cube with a cast shadow', 10),
        ],
      },
      {
        title: 'Drawing from life',
        tasks: [
          t('d-gesture', 'Do a two-minute gesture sketch of your hand', 2),
          t('d-life', 'Sketch a plant or a mug in ten minutes', 10),
          t('d-finish', 'Finish one drawing you are proud of', 20),
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
          t('r-shoes', 'Get comfortable shoes and plan a 20-minute route', 5),
          t('r-walk', 'Go for a 20-minute brisk walk', 20),
          t('r-first', 'Do a walk-run for 15 minutes: 1 minute running, 2 minutes walking', 15, 'You should be able to talk. If not, slow down.'),
          t('r-repeat', 'Repeat the walk-run on another day this week', 15),
        ],
      },
      {
        title: 'Build up',
        tasks: [
          t('r-3-1', 'Run 3 minutes, walk 1 minute, for 20 minutes', 20),
          t('r-10', 'Run 10 minutes without stopping', 10),
          t('r-20', 'Run 20 minutes without stopping', 20),
        ],
      },
      {
        title: 'Reach 5 km',
        tasks: [
          t('r-3k', 'Run 3 km at an easy pace', 25),
          t('r-4k', 'Run 4 km at an easy pace', 30),
          t('r-5k', 'Run 5 km', 35),
        ],
      },
    ],
  },
]