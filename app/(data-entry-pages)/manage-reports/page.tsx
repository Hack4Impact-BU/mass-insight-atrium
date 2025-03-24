"use client";

import { useFile } from "@/utils/upload-data/file-context";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ManageReports() {
    const router = useRouter()
    const { setFile, setFileData, fileList, fileListData } = useFile()
    console.log(fileList)
    return <div className="w-full flex items-center justify-center flex-col">
        {fileList && fileList?.length > 0 ? <div><h1>Review</h1>
            <ul>
                {fileList.map((entry, index) => <li key={index}>
                    <Button onClick={() => {
                        setFile(fileList[index])
                        setFileData(fileListData![index])
                        router.push("/view-data")
                    }}>{entry.name}</Button>
                </li>)}
            </ul></div>
 : <h1>No Reports to show.</h1>}
    </div>
}