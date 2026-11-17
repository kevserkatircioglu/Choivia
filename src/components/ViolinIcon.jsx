import { Violin } from '@iconoven/react'

export default function ViolinIcon({
  size = 20,
  strokeWidth = 1.8,
  className,
  ...svgProps
}) {
  return (
    <Violin
      size={size}
      strokeWidth={strokeWidth >= 1.9 ? 2 : 1.5}
      corners="rounded"
      variant="stroke"
      color="currentColor"
      className={className}
      {...svgProps}
    />
  )
}
