import type { ReactNode } from 'react'

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      {children}
    </div>
  )
}
