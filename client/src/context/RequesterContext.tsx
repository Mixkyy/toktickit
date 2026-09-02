import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Requester {
  id: number;
  name: string;
  email: string;
}

interface RequesterContextType {
  selectedRequester: Requester | null;
  setSelectedRequester: (requester: Requester | null) => void;
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

export const RequesterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRequester, setSelectedRequester] = useState<Requester | null>(null);

  return (
    <RequesterContext.Provider value={{ selectedRequester, setSelectedRequester }}>
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = () => {
  const context = useContext(RequesterContext);
  if (context === undefined) {
    throw new Error('useRequester must be used within a RequesterProvider');
  }
  return context;
};
