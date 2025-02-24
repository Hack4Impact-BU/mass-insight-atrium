import { FileProvider } from "@/utils/xlsx/file-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FileProvider>{children}</FileProvider>;
}
