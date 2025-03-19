interface TechCardProps {
  name: string;
}

export function TechCard({ name }: TechCardProps) {
  return (
    <div className="flex items-center justify-center p-4 bg-black border border-zinc-800 rounded-xl">
      <span className="font-space-grotesk font-medium text-zinc-300">{name}</span>
    </div>
  )
} 