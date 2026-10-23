import { eq } from 'drizzle-orm'
import { getDb } from '@/db/client'
import { users } from '@/db/schema'

export interface VerifiedPhone {
  phone: string
  verifiedAt: Date
}

export async function getVerifiedPhone(userId: string): Promise<VerifiedPhone | null> {
  const [row] = await getDb()
    .select({ phone: users.phone, verifiedAt: users.phoneVerifiedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return row?.phone && row.verifiedAt ? { phone: row.phone, verifiedAt: row.verifiedAt } : null
}
