import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode
} from 'react'

type Variant = 'solid' | 'outline' | 'ghost'

const variants: Record<Variant, string> = {
  solid: 'bg-ink text-paper hover:bg-spark dark:bg-cream dark:text-night dark:hover:bg-spark dark:hover:text-paper',
  outline: 'border-2 border-ink text-ink hover:bg-ink hover:text-paper dark:border-cream dark:text-cream dark:hover:bg-cream dark:hover:text-night',
  ghost: 'text-ink-soft hover:text-spark dark:text-cream-soft dark:hover:text-spark'
}

export function Button({
  variant = 'solid',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 font-grotesk text-sm font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-grotesk text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-cream-soft">
        {label}
      </span>
      {children}
    </label>
  )
}

const controlClass =
  'w-full border-2 border-ink bg-transparent px-3 py-2 font-body text-lg text-ink outline-none placeholder:text-ink-soft/50 focus:border-spark dark:border-cream/60 dark:text-cream dark:placeholder:text-cream-soft/40 dark:focus:border-spark'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlClass} resize-y ${props.className ?? ''}`} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${controlClass} appearance-none dark:[&>option]:text-ink ${props.className ?? ''}`}
    />
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border border-ink px-2 py-0.5 font-grotesk text-[0.65rem] font-bold uppercase tracking-widest dark:border-cream/60">
      {children}
    </span>
  )
}
