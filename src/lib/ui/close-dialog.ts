/**
 * Closing a modal dialog without losing the keyboard.
 *
 * The browser normally hands focus back to whatever had it before the
 * dialog opened. On these screens that is usually the button that opened
 * it, and the action often replaces that button with its opposite —
 * "Revoke" becomes "Reactivate", "Suspend Account" becomes "Reactivate
 * Account". The original button no longer exists, so the browser has
 * nowhere to put focus and drops it on the page body: someone using only a
 * keyboard is left at the top of the page with no idea where they are.
 *
 * Confirmations on these screens open on top of a details panel, so when
 * one closes the keyboard belongs in the panel underneath. Where there is
 * no panel underneath, the button that opened the dialog is usually still
 * there and the browser's own behaviour is right, so this only steps in if
 * focus has been dropped.
 */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function focusInside(dialog: HTMLDialogElement) {
  dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();
}

export function closeDialog(dialog: HTMLDialogElement) {
  dialog.close();

  const below = [...document.querySelectorAll<HTMLDialogElement>("dialog[open]")].pop();

  if (below) {
    focusInside(below);
    // The panel underneath re-renders to show what just changed, which can
    // take the focused button away with it; put the keyboard back afterwards.
    setTimeout(() => {
      if (below.open && !below.contains(document.activeElement)) focusInside(below);
    }, 150);
    return;
  }

  // Nothing underneath: only step in if the browser had nowhere to put focus.
  setTimeout(() => {
    if (document.activeElement && document.activeElement !== document.body) return;
    document.getElementById("main-content")?.focus();
  }, 150);
}
