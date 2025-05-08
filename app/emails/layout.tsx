import React from "react";
import { EmailProvider } from "./context";
 
export default function EmailsLayout({ children }: { children: React.ReactNode }) {
  return <EmailProvider>{children}</EmailProvider>;
} 