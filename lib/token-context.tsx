"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface TokenContextValue {
  token: string
  setToken: (t: string) => void
}

const TokenContext = createContext<TokenContextValue>({
  token: "",
  setToken: () => {},
})

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState("")

  // Persist across page navigations (not a real secret store, just convenience)
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_jwt") || ""
    setTokenState(stored)
  }, [])

  function setToken(t: string) {
    setTokenState(t)
    if (t) {
      sessionStorage.setItem("admin_jwt", t)
    } else {
      sessionStorage.removeItem("admin_jwt")
    }
  }

  return <TokenContext.Provider value={{ token, setToken }}>{children}</TokenContext.Provider>
}

export function useToken() {
  return useContext(TokenContext)
}
