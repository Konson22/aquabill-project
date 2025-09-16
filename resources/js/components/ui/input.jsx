import { cn } from "@/lib/utils"


function Input({ type, options = [], ...props }) {
  const className = cn(
    // consumer classes first; base classes last so they win on conflicts
    props.className,
    'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    'mt-1 h-12 bg-white',
  );
  return (
    type !== 'select' ?<input
      type={type}
      data-slot="input"
      className={className}
      {...props}
    />:
    <select className={className} {...props}>
      <option value="">{props.placeholder}</option>
      {options.map((option) => (
        <option value={option.id} key={option.id}>{option.name}</option>
      ))}
    </select>
  )
}

function Select({ options = [], ...props }) {
  const className = cn(
    // consumer classes first; base classes last so they win on conflicts
    props.className,
    'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    'mt-1 h-12 bg-white',
  );
  return (
    <select className={className} {...props}>
      <option value="">{props.placeholder}</option>
      {options.map((option) => (
        <option value={option.id} key={option.id}>{option.name}</option>
      ))}
    </select>
  )
}

export { Input, Select }
