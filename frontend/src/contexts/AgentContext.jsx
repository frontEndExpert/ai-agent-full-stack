import React, { createContext, useContext } from 'react';

const AgentContext = createContext();

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

export const AgentProvider = ({ children, value }) => {
  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};
