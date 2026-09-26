/** Next.js volá register() jednou při startu serveru, před obsluhou prvního požadavku. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { ensureStartupTasks } = await import('./db/startup')
  await ensureStartupTasks()
}
