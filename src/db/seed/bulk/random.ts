/** Deterministický generátor (mulberry32) — stejné semínko = stejná demo data. */
export class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let value = this.state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }

  integer(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  chance(probability: number): boolean {
    return this.next() < probability
  }

  pick<T>(items: readonly T[]): T {
    const item = items[Math.floor(this.next() * items.length)]
    if (item === undefined) throw new Error('Nelze vybrat z prázdného seznamu')
    return item
  }

  /** Vážený výběr: [hodnota, váha][]. */
  weighted<T>(options: ReadonlyArray<readonly [T, number]>): T {
    const total = options.reduce((sum, [, weight]) => sum + weight, 0)
    let threshold = this.next() * total
    for (const [value, weight] of options) {
      threshold -= weight
      if (threshold < 0) return value
    }
    return this.pick(options)[0]
  }
}
