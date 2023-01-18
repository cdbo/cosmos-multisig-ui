import React, { useEffect, createContext, useContext, useReducer } from "react";

import { AppReducer, ChangeChainAction, initialState } from "./AppReducer";
import { ChainInfo } from "../types";

export interface AppContextType {
  chain: ChainInfo;
}

const AppContext = createContext<{
  state: AppContextType;
  dispatch: React.Dispatch<ChangeChainAction>;
}>({ state: initialState, dispatch: () => {} });

function getChainInfoFromUrl(): ChainInfo {
  const url = location.search;
  const params = new URLSearchParams(url);
  const chainInfo: ChainInfo = {
    nodeAddress: decodeURIComponent(params.get("nodeAddress") || ""),
    denom: decodeURIComponent(params.get("denom") || ""),
    displayDenom: decodeURIComponent(params.get("displayDenom") || ""),
    displayDenomExponent: parseInt(
      decodeURIComponent(params.get("displayDenomExponent") || ""),
      10,
    ),
    gasPrice: decodeURIComponent(params.get("gasPrice") || ""),
    chainId: decodeURIComponent(params.get("chainId") || ""),
    chainDisplayName: decodeURIComponent(params.get("chainDisplayName") || ""),
    registryName: decodeURIComponent(params.get("registryName") || ""),
    addressPrefix: decodeURIComponent(params.get("addressPrefix") || ""),
    explorerLink: decodeURIComponent(params.get("explorerLink") || ""),
  };

  return chainInfo;
}

function setChainInfoParams(chainInfo: ChainInfo) {
  const params = new URLSearchParams();

  const keys = Object.keys(chainInfo) as Array<keyof ChainInfo>;

  keys.forEach((value: keyof ChainInfo) => {
    params.set(value, encodeURIComponent(chainInfo[value] || ""));
  });

  window.history.replaceState({}, "", `${location.pathname}?${params}`);
}

export function AppWrapper({ children }: { children: React.ReactNode }) {
  let existingState;
  if (typeof window !== "undefined") {
    const storedState = localStorage.getItem("state");
    if (storedState) {
      existingState = JSON.parse(storedState);
    }

    const urlChainInfo = getChainInfoFromUrl();

    // query params should override saved state
    if (urlChainInfo.chainId) {
      console.log("setting state from url");
      existingState = { chain: urlChainInfo };
    }
  }
  const [state, dispatch] = useReducer(AppReducer, existingState ? existingState : initialState);

  const contextValue = { state, dispatch };

  useEffect(() => {
    if (state && state !== initialState) {
      localStorage.setItem("state", JSON.stringify(state));
      setChainInfoParams(state.chain);
    }
  }, [state]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
export function useAppContext() {
  return useContext(AppContext);
}
