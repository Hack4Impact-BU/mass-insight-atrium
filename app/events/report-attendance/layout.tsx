import { FileProvider } from "@/utils/upload-data/file-context";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FileProvider>{children}</FileProvider>;
}
