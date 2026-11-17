export const stageForDays = (d) => (d < 2 ? 1 : d < 4 ? 2 : d < 7 ? 3 : 4)
export const stageForPercent = (p) => (p <= 0 ? 0 : p < 35 ? 1 : p < 70 ? 2 : p < 100 ? 3 : 4)
