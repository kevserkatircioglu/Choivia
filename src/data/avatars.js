// Optional `poses` per avatar: morning | day | evening | night image files in public/avatars/:
// { id: 'panda', poses: { night: 'panda-uyku.webp' } }  -> public/avatars/ klasörüne koy.
export const AVATARS = [
  { id: 'kurbaga', name: 'Frog', sleepy: 'Sleeping on a leaf bed' },
  { id: 'panda', name: 'Panda', sleepy: 'Dreaming of bamboo' },
  { id: 'kedi', name: 'Tabby' },
  { id: 'pamuk', name: 'Pamuk' },
  { id: 'karakedi', name: 'Shadow' },
  { id: 'tavsan', name: 'Bunny' },
  { id: 'tilki', name: 'Fox' },
  { id: 'ayi', name: 'Bear' },
  { id: 'penguen', name: 'Penguin' },
  { id: 'kapibara', name: 'Capybara' },
  { id: 'civciv', name: 'Chick' },
  { id: 'fidan', name: 'Sprout' },
  { id: 'kaplumbaga', name: 'Turtle' },
  { id: 'kelebek', name: 'Butterfly' },
  { id: 'muzikci', name: 'Music' },
  { id: 'uzayli', name: 'Alien' },
  { id: 'astronot', name: 'Astronaut' },
  { id: 'gezegen', name: 'Planet' },
]
export const DEFAULT_AVATAR = 'kurbaga'
export const getAvatar = (id) => AVATARS.find((a) => a.id === id) || AVATARS[0]
