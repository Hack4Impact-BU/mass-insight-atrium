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
  addToFileListData: (data: any[]) => void;
  addToFileList: (data: File) => void;
  fileList: File[] | null;
  fileListData: any[][] | null;
  meetingId: string;
  setMeetingId: (id: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [fileList, setFileList] = useState<File[]>([]);
  const [fileListData, setFileListData] = useState<any[][]>([]);
  const [meetingId, setMeetingId] = useState("");

  const addToFileList = (data: File): void => {
    setFileList((prevFiles) => [...prevFiles!, data]);
  };

  const addToFileListData = (data: any[]): void => {
    setFileListData((prevListData) => [...prevListData, data]);
  };
  return (
    <FileContext.Provider
      value={{
        file,
        fileData,
        setFile,
        setFileData,
        addToFileList,
        addToFileListData,
        fileList,
        fileListData,
        meetingId,
        setMeetingId,
      }}
    >
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
