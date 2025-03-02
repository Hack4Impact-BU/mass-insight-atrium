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

  // Store parsed data in sessionStorage for persistence
  useEffect(() => {
    if (fileData) {
      sessionStorage.setItem("fileData", JSON.stringify(fileData));
      console.log(fileData);
    } else {
      sessionStorage.removeItem("fileData");
    }
  }, [fileData]);

  // Restore fileData from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem("fileData");
    if (storedData) {
      setFileData(JSON.parse(storedData));
    }
  }, []);

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
