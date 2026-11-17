const TEMPLATE_THEMES = new Set([
  'violin',
  'guitar',
  'drawing',
  'running',
])

// Hazır şablonlar kendi renklerini kullanır; kişisel hobiler bahçe temasında kalır.
export function getHobbyTheme(hobby) {
  const templateId = typeof hobby === 'string'
    ? hobby
    : hobby?.templateId

  return TEMPLATE_THEMES.has(templateId) ? templateId : 'garden'
}
