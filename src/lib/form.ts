/** Bezpečné čtení textového pole z FormData (File a null → prázdný řetězec). */
export function formString(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Nahrané soubory z vícenásobného file inputu — prázdné položky (nic nevybráno) vynechá. */
export function formFiles(formData: FormData, name: string): File[] {
  return formData
    .getAll(name)
    .filter((value): value is File => value instanceof File && value.size > 0)
}
