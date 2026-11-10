"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthInput, type AuthInputProps } from "./AuthInput";

/**
 * Password field with a labelled Show/Hide button. Pasting and password
 * managers work as normal.
 */
export function PasswordInput(props: Omit<AuthInputProps, "type" | "endAdornment">) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthInput
      {...props}
      type={visible ? "text" : "password"}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-base font-semibold text-primary hover:bg-secondary"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
          {visible ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      }
    />
  );
}
