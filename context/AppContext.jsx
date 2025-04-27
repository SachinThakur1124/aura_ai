"use client";
import { useUser } from "@clerk/nextjs";
import { createContext, useContext } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const value = {
    user,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Something went wrong inside the AppContext !!");
  }
  return context;
};

export default useAppContext;
