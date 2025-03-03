"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface FileContextType {
  file: File | null;
  fileData: any[] | null; // Store parsed spreadsheet data
  setFile: (file: File | null) => void;
  setFileData: (data: any[] | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[] | null>(null);

  return (
    <FileContext.Provider value={{ file, fileData, setFile, setFileData }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};
