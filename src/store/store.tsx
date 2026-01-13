import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { UserProfile } from "../types";
import { defaultProfile } from "../data/profile";
import { loadJSON, saveJSON } from "./storage";

type State = {
  profile: UserProfile;
  favorites: string[]; // measure ids
  hydrated: boolean;
};

type Action =
  | { type: "SET_PROFILE"; profile: UserProfile }
  | { type: "TOGGLE_FAVORITE"; id: string }
  | { type: "HYDRATE"; profile?: UserProfile; favorites?: string[] };

const KEY_PROFILE = "bn_profile_v2";
const KEY_FAVS = "bn_favs_v2";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: action.profile };
    case "TOGGLE_FAVORITE": {
      const set = new Set(state.favorites);
      if (set.has(action.id)) set.delete(action.id);
      else set.add(action.id);
      return { ...state, favorites: Array.from(set) };
    }
    case "HYDRATE":
      return {
        profile: action.profile ?? state.profile,
        favorites: action.favorites ?? state.favorites,
        hydrated: true,
      };
    default:
      return state;
  }
}

const Ctx = createContext<{
  state: State;
  setProfile: (p: UserProfile) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
} | null>(null);

export function StoreProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, {
    profile: defaultProfile,
    favorites: [],
    hydrated: false,
  });

  // hydrate
  useEffect(() => {
    (async () => {
      const p = await loadJSON<UserProfile>(KEY_PROFILE);
      const f = await loadJSON<string[]>(KEY_FAVS);
      dispatch({ type: "HYDRATE", profile: p ?? undefined, favorites: f ?? undefined });
    })();
  }, []);

  // persist
  useEffect(() => {
    if (!state.hydrated) return;
    saveJSON(KEY_PROFILE, state.profile);
  }, [state.profile, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveJSON(KEY_FAVS, state.favorites);
  }, [state.favorites, state.hydrated]);

  const api = useMemo(() => ({
    state,
    setProfile: (p: UserProfile) => dispatch({ type: "SET_PROFILE", profile: p }),
    toggleFavorite: (id: string) => dispatch({ type: "TOGGLE_FAVORITE", id }),
    isFavorite: (id: string) => state.favorites.includes(id),
  }), [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
