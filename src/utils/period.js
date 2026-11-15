// Time-aware scene: morning 6-12, day 12-17, evening 17-21, night otherwise
export const periodOf = (h) => (h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'day' : h >= 17 && h < 21 ? 'evening' : 'night')
