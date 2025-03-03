import { FileProvider } from "@/utils/upload-data/file-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FileProvider>{children}</FileProvider>;
}
