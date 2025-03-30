"use client";

import TablePreview from "@/components/TablePreview";
import { useFile } from "@/utils/upload-data/file-context";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ManageReports() {
  const router = useRouter();
  const { setFile, setFileData, fileList, fileListData } = useFile();
  console.log(fileList);
  return (
    <>
      {fileList && fileList?.length > 0 ? (
        <div>
          <h1 className="text-center mb-8">Review Reports uploaded</h1>
          <div className="w-full flex">
            <div className="flex ml-auto mr-auto gap-8">
              {fileList.map((entry, index) => (
                <div key={index} className="border-2">
                  <Button
                    onClick={() => {
                      setFile(fileList[index]);
                      setFileData(fileListData![index]);
                      router.push("/view-data");
                    }}
                  >
                    <div className="flex flex-col">
                      <TablePreview
                        fileData={fileListData![index]}
                        file={fileList[index]}
                      ></TablePreview>
                      <hr></hr>
                      {entry.name}
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-8 mr-8">
            <Button
              onClick={() => {
                router.push("/upload-data");
              }}
            >
              Import another spreadsheet
            </Button>
          </div>
        </div>
      ) : (
        <h1 className="text-center">No Reports to show.</h1>
      )}
    </>
  );
}
