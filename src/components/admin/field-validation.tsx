"use client";

import { createContext, useContext } from "react";

export const FieldErrorsContext = createContext<Record<string, string>>({});

export function useFieldError(name: string) {
  const errors = useContext(FieldErrorsContext);
  return (
    errors[name] ??
    Object.entries(errors).find(([path]) => path.endsWith(`.${name}`))?.[1]
  );
}

export function FieldError({ name, id }: { name: string; id: string }) {
  const message = useFieldError(name);
  return message ? (
    <p id={id} className="text-destructive text-sm">
      {message}
    </p>
  ) : null;
}

export function focusInvalidField(
  form: HTMLFormElement,
  errors: Record<string, string>
) {
  for (const path of Object.keys(errors)) {
    const name = path.split(".").at(-1) ?? path;
    const field = form.elements.namedItem(name);
    if (!(field instanceof HTMLElement)) continue;
    let parent: HTMLElement | null = field.parentElement;
    while (parent) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
      parent = parent.parentElement;
    }
    field.focus();
    return;
  }
  form.querySelector<HTMLElement>('[role="alert"]')?.focus();
}
