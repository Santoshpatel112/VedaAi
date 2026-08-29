"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextValue {
  expanded: boolean;
  toggle: () => void;
  setExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  expanded: false,
  toggle: () => {},
  setExpanded: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((v) => !v);
  return (
    <SidebarContext.Provider value={{ expanded, toggle, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
