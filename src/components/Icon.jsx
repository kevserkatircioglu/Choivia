import { ICON_MAP, resolveIconKey } from '../data/iconMap.js'

export default function Icon({
  name,
  fallback = 'help',
  size = 20,
  strokeWidth = 1.8,
  label,
  className,
  ...svgProps
}) {
  const key = resolveIconKey(name, fallback)
  const IconComponent = ICON_MAP[key] ?? ICON_MAP.help

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      focusable="false"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...svgProps}
    />
  )
}
