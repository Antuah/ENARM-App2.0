import { createClient } from "@supabase/supabase-js";
import { createEnarmApi } from "./enarm-api.js";

// Public application key from the integration guide; never a secret or service-role key.
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://oksifebzxhciydqryisi.supabase.co";
const publicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_KOkMCzEYB2v2T4bE_UdKQw_nzS1NW85";
const preference = "entrenarme.auth.remember";
const memory = new Map();
const storage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(preference) === "true"
        ? window.localStorage.getItem(key)
        : window.sessionStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem(key, value) {
    memory.set(key, value);
    try {
      const persistent = window.localStorage.getItem(preference) === "true";
      (persistent ? window.localStorage : window.sessionStorage).setItem(
        key,
        value,
      );
      (persistent ? window.sessionStorage : window.localStorage).removeItem(
        key,
      );
    } catch {
      /* A private browser can keep the session in memory. */
    }
  },
  removeItem(key) {
    memory.delete(key);
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {}
  },
};
const client = createClient(supabaseUrl, publicKey, {
  auth: {
    storage,
    storageKey: "entrenarme.supabase.session",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});
export const api = createEnarmApi({
  client,
  baseUrl: supabaseUrl,
  publicKey,
  location: window.location,
  replaceUrl: (url) => {
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  },
  remember: (enabled) => {
    try {
      window.localStorage.setItem(preference, String(enabled));
    } catch {}
  },
  pendingProfile: {
    get: () => {
      try {
        return JSON.parse(
          window.sessionStorage.getItem("entrenarme.pending-profile") || "null",
        );
      } catch {
        return null;
      }
    },
    set: (value) => {
      try {
        window.sessionStorage.setItem(
          "entrenarme.pending-profile",
          JSON.stringify(value),
        );
      } catch {}
    },
    clear: () => {
      try {
        window.sessionStorage.removeItem("entrenarme.pending-profile");
      } catch {}
    },
  },
});
