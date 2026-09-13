import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** The current URL hash without `#`; empty on the server. */
export function useHash() {
  return useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => "");
}

/** Update the hash without a history entry and notify every `useHash` subscriber. */
export function setHash(value: string) {
  history.replaceState(null, "", `#${value}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
