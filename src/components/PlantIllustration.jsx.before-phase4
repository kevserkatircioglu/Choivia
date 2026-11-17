import { useId } from 'react'
import {
  PLANT_STAGE_KEYS,
  resolvePlantStage,
} from '../utils/plantStages.js'

const STEM_PATHS = {
  seed: '',
  sprout: 'M60 78 C60 70 58 65 60 58',
  growing: 'M60 78 C60 66 57 54 60 43',
  flourishing: 'M60 78 C61 63 58 46 60 32',
  bloom: 'M60 78 C62 62 56 43 60 28',
}

export default function PlantIllustration({
  stage = 'seed',
  size = 64,
  className = '',
  label,
}) {
  const currentStage = resolvePlantStage(stage)
  const index = PLANT_STAGE_KEYS.indexOf(currentStage)
  const id = useId().replace(/:/g, '')
  const potGradient = `plant-pot-${id}`

  return (
    <svg
      className={`plant-illustration ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <defs>
        <linearGradient id={potGradient} x1="60" y1="78" x2="60" y2="112">
          <stop stopColor="#F2B99B" />
          <stop offset="1" stopColor="#D98970" />
        </linearGradient>
      </defs>

      {/* Soft background */}
      <circle cx="60" cy="56" r="49" fill="#F0F5E9" />
      <circle cx="87" cy="27" r="7" fill="#FFFFFF" opacity=".55" />
      <circle cx="28" cy="43" r="3" fill="#FFFFFF" opacity=".7" />

      {/* Plant stem */}
      {index > 0 && (
        <path
          d={STEM_PATHS[currentStage]}
          stroke="#56835C"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}

      {/* First pair of leaves */}
      {index >= 1 && (
        <>
          <path
            d="M60 68 C49 67 45 61 48 55 C56 55 62 60 60 68Z"
            fill="#83B777"
            stroke="#56835C"
            strokeWidth="1.3"
          />
          <path
            d="M60 68 C70 67 75 61 72 55 C64 55 58 60 60 68Z"
            fill="#A2C98C"
            stroke="#56835C"
            strokeWidth="1.3"
          />
          <path
            d="M51 59 Q55 62 59 66 M69 59 Q65 62 61 66"
            stroke="#D9EACD"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Second pair of leaves */}
      {index >= 2 && (
        <>
          <path
            d="M59 56 C49 55 46 49 49 43 C56 43 61 48 59 56Z"
            fill="#73A96C"
            stroke="#4E7E56"
            strokeWidth="1.3"
          />
          <path
            d="M60 53 C70 53 75 47 72 41 C64 41 59 46 60 53Z"
            fill="#96C483"
            stroke="#4E7E56"
            strokeWidth="1.3"
          />
        </>
      )}

      {/* Fuller foliage */}
      {index >= 3 && (
        <>
          <path
            d="M59 45 C49 44 46 38 49 33 C56 33 61 38 59 45Z"
            fill="#A2C98C"
            stroke="#56835C"
            strokeWidth="1.2"
          />
          <path
            d="M60 43 C69 43 73 37 70 32 C63 32 58 37 60 43Z"
            fill="#78AD70"
            stroke="#56835C"
            strokeWidth="1.2"
          />
          <circle cx="43" cy="48" r="2.2" fill="#E6B77B" />
          <circle cx="77" cy="46" r="2.2" fill="#E6B77B" />
        </>
      )}

      {/* Flower */}
      {index === 4 && (
        <g>
          <path
            d="M60 31 C52 29 51 22 56 19 C60 21 61 25 60 31Z"
            fill="#E9A5B1"
          />
          <path
            d="M60 31 C53 34 48 29 50 24 C55 23 59 26 60 31Z"
            fill="#F2B7BE"
          />
          <path
            d="M60 31 C64 24 71 25 72 30 C68 34 64 34 60 31Z"
            fill="#E9A5B1"
          />
          <path
            d="M60 30 C57 22 61 17 66 19 C68 24 65 28 60 30Z"
            fill="#F5C5C8"
          />
          <path
            d="M60 31 C64 33 65 39 60 41 C56 38 56 34 60 31Z"
            fill="#F2B7BE"
          />
          <circle cx="60" cy="30" r="5" fill="#EAB85F" />
          <circle cx="58.5" cy="28.5" r="1" fill="#F8DB96" />
        </g>
      )}

      {/* Seed */}
      {index === 0 && (
        <>
          <ellipse
            cx="60"
            cy="73"
            rx="6"
            ry="3.5"
            transform="rotate(-25 60 73)"
            fill="#A97449"
          />
          <path
            d="M57 72 Q59 70 62 71"
            stroke="#D7AC77"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Soil */}
      <ellipse cx="60" cy="78" rx="24" ry="5" fill="#795A43" />
      <ellipse cx="60" cy="77" rx="20" ry="2.5" fill="#987453" />

      {/* Pot */}
      <path
        d="M37 79 H83 L78 105 Q60 113 42 105 Z"
        fill={`url(#${potGradient})`}
        stroke="#BE8068"
        strokeWidth="1.6"
      />
      <path
        d="M43 85 Q60 88 77 85"
        stroke="#F7D1B7"
        strokeWidth="1.4"
        opacity=".75"
      />
      <rect
        x="34"
        y="72"
        width="52"
        height="10"
        rx="5"
        fill="#E9A58A"
        stroke="#BE8068"
        strokeWidth="1.5"
      />
      <path
        d="M47 96 Q60 100 73 96"
        stroke="#F8C4A9"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".8"
      />

      {/* Small decorative details */}
      {index >= 3 && (
        <>
          <path
            d="M28 30 L30 34 L34 36 L30 38 L28 42 L26 38 L22 36 L26 34Z"
            fill="#E7BD79"
          />
          <path
            d="M89 54 L90.5 57 L94 58.5 L90.5 60 L89 63 L87.5 60 L84 58.5 L87.5 57Z"
            fill="#E7BD79"
          />
        </>
      )}
    </svg>
  )
}
