import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";
import { scoreLead } from "@/lib/scoring";

type AppState = {
  leads: Lead[];
  audits: Record<string, AuditResult>;
  selectedId: string | null;
  setLeads: (leads: Lead[]) => void;
  addAudit: (audit: AuditResult) => void;
  setSelectedId: (id: string | null) => void;
  selectedRanked: RankedLead | null;
  clearAll: () => void;
};

const AppContext = createContext<AppState>({
  leads: [],
  audits: {},
  selectedId: null,
  setLeads: () => {},
  addAudit: () => {},
  setSelectedId: () => {},
  selectedRanked: null,
  clearAll: () => {},
});

const LEADS_KEY = "ll_leads_v1";
const AUDITS_KEY = "ll_audits_v1";
const SELECTED_KEY = "ll_selected_v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeadsState] = useState<Lead[]>([]);
  const [audits, setAuditsState] = useState<Record<string, AuditResult>>({});
  const [selectedId, setSelectedIdState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [l, a, s] = await Promise.all([
          AsyncStorage.getItem(LEADS_KEY),
          AsyncStorage.getItem(AUDITS_KEY),
          AsyncStorage.getItem(SELECTED_KEY),
        ]);
        if (l) setLeadsState(JSON.parse(l));
        if (a) setAuditsState(JSON.parse(a));
        if (s) setSelectedIdState(JSON.parse(s));
      } catch {}
    })();
  }, []);

  const setLeads = useCallback((newLeads: Lead[]) => {
    setLeadsState(newLeads);
    AsyncStorage.setItem(LEADS_KEY, JSON.stringify(newLeads)).catch(() => {});
  }, []);

  const addAudit = useCallback((audit: AuditResult) => {
    setAuditsState((prev) => {
      const next = { ...prev, [audit.leadId]: audit };
      AsyncStorage.setItem(AUDITS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIdState(id);
    AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(id)).catch(() => {});
  }, []);

  const clearAll = useCallback(() => {
    setLeadsState([]);
    setAuditsState({});
    setSelectedIdState(null);
    AsyncStorage.multiRemove([LEADS_KEY, AUDITS_KEY, SELECTED_KEY]).catch(() => {});
  }, []);

  const selectedRanked: RankedLead | null = React.useMemo(() => {
    if (!selectedId) return null;
    const lead = leads.find((l) => l.id === selectedId);
    const audit = audits[selectedId];
    if (!lead || !audit) return null;
    return scoreLead(lead, audit);
  }, [selectedId, leads, audits]);

  return (
    <AppContext.Provider value={{ leads, audits, selectedId, setLeads, addAudit, setSelectedId, selectedRanked, clearAll }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
