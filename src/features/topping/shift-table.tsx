import { formatDays } from './format-days'
import {
  MAX_TOPPINGS,
  MAX_TOPPINGS_IN_SERVICES,
  shiftDaysForTopping,
  totalShiftDays,
} from './topping-rules'

/** Kolik topování ukázat v tabulce — od sedmého je posun vždy 1 den. */
const SHOWN_TOPPINGS = 7

export function ShiftTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-canvas text-left text-muted">
          <tr>
            <th className="px-4 py-2 font-medium">Topování</th>
            <th className="px-4 py-2 font-medium">Posune inzerát o</th>
            <th className="px-4 py-2 font-medium">Celkem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {Array.from({ length: SHOWN_TOPPINGS }, (_, index) => index + 1).map((order) => (
            <tr key={order}>
              <td className="px-4 py-2">
                {order === SHOWN_TOPPINGS ? `${order}. a každé další` : `${order}.`}
              </td>
              <td className="px-4 py-2 font-medium">{formatDays(shiftDaysForTopping(order))}</td>
              <td className="px-4 py-2 text-muted">{formatDays(totalShiftDays(order))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line px-4 py-2 text-xs text-muted">
        Inzerát lze topovat nejvýše {MAX_TOPPINGS}×, v kategorii Služby {MAX_TOPPINGS_IN_SERVICES}×.
      </p>
    </div>
  )
}
