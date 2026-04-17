"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const SAVED_CREATORS_KEY = "lumiai_saved_creators";
const SAVED_CAMPAIGNS_KEY = "lumiai_saved_campaigns";

interface SavedListsContextType {
  savedCreators: string[];
  savedCampaigns: string[];
  toggleCreator: (id: string) => void;
  toggleCampaign: (id: string) => void;
  isCreatorSaved: (id: string) => boolean;
  isCampaignSaved: (id: string) => boolean;
}

const SavedListsContext = createContext<SavedListsContextType | undefined>(undefined);

export function SavedListsProvider({ children }: { children: ReactNode }) {
  const [savedCreators, setSavedCreators] = useState<string[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);

  useEffect(() => {
    const creators = localStorage.getItem(SAVED_CREATORS_KEY);
    const campaigns = localStorage.getItem(SAVED_CAMPAIGNS_KEY);
    if (creators) {
      try { setSavedCreators(JSON.parse(creators)); } catch {}
    }
    if (campaigns) {
      try { setSavedCampaigns(JSON.parse(campaigns)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVED_CREATORS_KEY, JSON.stringify(savedCreators));
  }, [savedCreators]);

  useEffect(() => {
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(savedCampaigns));
  }, [savedCampaigns]);

  const toggleCreator = (id: string) => {
    setSavedCreators((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const toggleCampaign = (id: string) => {
    setSavedCampaigns((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const isCreatorSaved = (id: string) => savedCreators.includes(id);
  const isCampaignSaved = (id: string) => savedCampaigns.includes(id);

  return (
    <SavedListsContext.Provider value={{ savedCreators, savedCampaigns, toggleCreator, toggleCampaign, isCreatorSaved, isCampaignSaved }}>
      {children}
    </SavedListsContext.Provider>
  );
}

export function useSavedLists() {
  const context = useContext(SavedListsContext);
  if (context === undefined) {
    throw new Error("useSavedLists must be used within a SavedListsProvider");
  }
  return context;
}
