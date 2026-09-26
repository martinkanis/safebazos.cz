'use client'

import type { ComponentProps, MouseEvent } from 'react'
import { Button } from './button'

type ConfirmSubmitButtonProps = ComponentProps<typeof Button> & { confirmMessage: string }

/** Odesílací tlačítko s potvrzením — pro nevratné akce (smazání). */
export function ConfirmSubmitButton({
  confirmMessage,
  onClick,
  ...props
}: ConfirmSubmitButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }
  return <Button type="submit" onClick={handleClick} {...props} />
}
