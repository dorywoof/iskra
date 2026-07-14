export function SparkMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g transform="translate(32 32)">
        <path
          d="M0 -26 L6 -6 L26 0 L6 6 L0 26 L-6 6 L-26 0 L-6 -6 Z"
          fill="var(--color-spark)"
        />
        <path d="M0 -26 L6 -6 L0 0 Z" fill="var(--color-ochre)" />
        <circle cx="0" cy="0" r="5" fill="var(--color-ink)" className="dark:fill-[var(--color-night)]" />
      </g>
    </svg>
  )
}
