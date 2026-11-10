"use client";

import { useState, type FormEvent } from "react";

type Errors<K extends string> = Partial<Record<K, string>>;

/**
 * Small form helper with gentle validation:
 * - a field is checked when you leave it (if you typed something),
 * - once checked, its message updates as you type, so fixes show at once,
 * - pressing submit checks everything and moves focus to the first problem.
 */
export function useFormFields<K extends string>(
  initial: Record<K, string>,
  validate: (values: Record<K, string>) => Errors<K>,
) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});
  const [errors, setErrors] = useState<Errors<K>>({});

  const visibleErrors = (all: Errors<K>, touchedNow: Partial<Record<K, boolean>>) => {
    const shown: Errors<K> = {};
    for (const key of Object.keys(all) as K[]) {
      if (touchedNow[key]) shown[key] = all[key];
    }
    return shown;
  };

  const field = (name: K) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event: { target: { value: string } }) => {
      const next = { ...values, [name]: event.target.value };
      setValues(next);
      setErrors(visibleErrors(validate(next), touched));
    },
    onBlur: () => {
      if (!values[name] || touched[name]) return;
      const nextTouched = { ...touched, [name]: true };
      setTouched(nextTouched);
      setErrors(visibleErrors(validate(values), nextTouched));
    },
  });

  /** Checks every field. Returns true when the form is ready to send. */
  const checkAll = (event: FormEvent<HTMLFormElement>): boolean => {
    const all = validate(values);
    const allTouched = Object.fromEntries(
      Object.keys(values).map((key) => [key, true]),
    ) as Record<K, boolean>;
    setTouched(allTouched);
    setErrors(all);

    const firstInvalid = (Object.keys(values) as K[]).find((key) => all[key]);
    if (firstInvalid) {
      const input = event.currentTarget.elements.namedItem(firstInvalid);
      if (input instanceof HTMLElement) input.focus();
      return false;
    }
    return true;
  };

  return { values, field, checkAll };
}
