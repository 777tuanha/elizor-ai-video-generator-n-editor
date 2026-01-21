import { cn } from '@/lib/utils'

interface SectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <section className={cn('flex flex-col', className)}>
      {title && (
        <div className="border-b px-4 py-2 bg-muted/50">
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </section>
  )
}
