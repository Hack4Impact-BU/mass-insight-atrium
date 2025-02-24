"use client";
import { redirect, usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { steps } from "../utils";
import { useRouter } from "next/navigation";

export type ProgressType = {
  pageNum: number;
  next: () => void;
  prev: () => void;
  progressRedirect: (buttonType: "prev-button" | "next-button") => void;
};

export const ProgressContext = createContext<ProgressType | null>(null);

export const useProgressContext = () => {
  const context = useContext(ProgressContext);
  if (context === null) {
    throw new Error(
      "useProgressContext must be used within a RedirectManager!"
    );
  }
  return context;
};

export const RedirectManager = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [pageNum, setPageNum] = useState(0);

  // console.log(`pageNum = ${pageNum}, currentPathname = $`);
  const next = useCallback(() => {
    setPageNum((pageNum) => pageNum + 1);
  }, [pageNum]);
  const prev = useCallback(() => {
    if (pageNum > 0) {
      setPageNum((pageNum) => pageNum - 1);
    }
  }, [pageNum ]);

  const progressRedirect = (buttonType: "prev-button" | "next-button") => {
    if (buttonType == "prev-button") {
      prev();
    }
    if (buttonType == "next-button") {
      next();
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        pageNum: pageNum,
        next: next,
        prev: prev,
        progressRedirect: progressRedirect,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
