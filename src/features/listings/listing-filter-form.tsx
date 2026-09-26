import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form-field'
import type { ListingFilters } from './listing-filters'
import { SEARCH_PARAM, SORT_OPTIONS, sortParamValue } from './search-params'

interface ListingFilterFormProps {
  /** Adresa, na kterou se filtr odešle (aktuální kategorie nebo /hledat). */
  action: string
  filters: Omit<ListingFilters, 'categoryIds'>
}

/** Filtr výpisu jako prostý GET formulář — funguje i bez JavaScriptu a dá se sdílet odkazem. */
export function ListingFilterForm({ action, filters }: ListingFilterFormProps) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="lg:col-span-2">
        <label htmlFor="filter-query" className="sr-only">
          Hledaný text
        </label>
        <Input
          id="filter-query"
          name={SEARCH_PARAM.query}
          type="search"
          placeholder="Hledaný text"
          defaultValue={filters.query}
        />
      </div>
      <div>
        <label htmlFor="filter-location" className="sr-only">
          Obec nebo PSČ
        </label>
        <Input
          id="filter-location"
          name={SEARCH_PARAM.location}
          placeholder="Obec nebo PSČ"
          defaultValue={filters.location}
        />
      </div>
      <div className="flex gap-2">
        <label htmlFor="filter-price-min" className="sr-only">
          Cena od
        </label>
        <Input
          id="filter-price-min"
          name={SEARCH_PARAM.priceMin}
          inputMode="numeric"
          placeholder="Cena od"
          defaultValue={filters.priceMin}
        />
        <label htmlFor="filter-price-max" className="sr-only">
          Cena do
        </label>
        <Input
          id="filter-price-max"
          name={SEARCH_PARAM.priceMax}
          inputMode="numeric"
          placeholder="do"
          defaultValue={filters.priceMax}
        />
      </div>
      <div>
        <label htmlFor="filter-sort" className="sr-only">
          Řazení
        </label>
        <Select
          id="filter-sort"
          name={SEARCH_PARAM.sort}
          defaultValue={sortParamValue(filters.sort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit">Filtrovat</Button>
      <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-6">
        <input
          type="checkbox"
          name={SEARCH_PARAM.safePaymentOnly}
          value="1"
          defaultChecked={filters.safePaymentOnly}
          className="size-4 accent-brand-600"
        />
        Jen inzeráty s bezpečnou platbou (peníze v úschově do převzetí zboží)
      </label>
    </form>
  )
}
