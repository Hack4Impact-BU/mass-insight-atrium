"use client"
import React from "react";
import Header from "../../components/progress-header";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";
import DataEntry from "@/components/svg/DataEntry";
import Sheet from "@/components/svg/Sheet"

const Page: React.FC = () => {
  const [dataEntryType, setDataEntryType] = useState<string>("");
  const [spreadsheetUpload, setSpreadsheetUpload] = useState<File | null>(null);
  const router = useRouter();

  type DivType = "dataEntry" | "spreadsheet";

  const handleClick = (div: DivType) => {
    setDataEntryType(div);
    if(div == "dataEntry"){
      //prompt for file upload of data file > filter data and send to next page
    }
    else if(div =="spreadsheet"){
      //handle spreadsheet data and send to next page
    }
  };

  const handleNextPageDataSend = () => {
    if(dataEntryType.length != 0){
      router.push(`/email-flow/steps/two?data=${encodeURIComponent(dataEntryType)}`);
      //just sending the data type selected for testing/overall flow
    }
    else{
      alert("Please make a data type selection");
    }
  };

return (
    <div>
      <Header/>
      <div className="text-center">
        <p className="text-4xl font-semibold">Import a list of recipients</p>
        <p className="text-sm mt-6">Import a .xlsx or .csv. You'll be able to move on to emailing in the next steps.</p>
        <div className="flex justify-center mt-8">
          <div className={`w-64 h-56 border m-6 cursor-pointer ${ 
            dataEntryType === "dataEntry" ? "border-[3px] border-[#022C4D]" : "border-[#000]"}`} 
            onClick={() => handleClick("dataEntry")} >
            <div className="flex justify-center mt-10 h-24 items-center">
              <DataEntry/>
            </div>
            <p className="mt-6 text-sm font-medium">Import from Data Entry</p>
          </div>

          <div className={`w-64 h-56 border m-6 cursor-pointer ${ 
            dataEntryType === "spreadsheet" ? "border-[3px] border-[#022C4D]" : "border-[#000]"}`} 
            onClick={() => handleClick("spreadsheet")} >
              <input
              type="file"
              onChange={(e) => setSpreadsheetUpload(e.target.files?.[0] || null)}
              style={{ display: "none" }}
              id="logoInput" />
            <div className="flex justify-center mt-10 h-24 items-center" onClick={() => document.getElementById("logoInput")?.click()}>
              <Sheet/>
            </div>
            <p className="mt-6 text-sm font-medium">Import new spreadsheet</p>
          </div>

        </div>
        
        <div className="mt-12 text-[#645F5F] flex justify-center">
          <div className="w-2/3">
          <p className="text-2xl">NOTICE:</p>
          <p className="text-xs mt-2 text-center">Please format your invitee list appropriately with distinct data fields so that it may be imported more easily. Be sure to at least include the fields “First Name”, “Last Name” and/or “Email”.</p>
          </div>
        </div>
      </div>

      <Buttons
        buttons={[
          { label: "Cancel", diffStyle: true, onClick: () => {} },
          { label: "Previous", onClick: () => {}, disabled: true  },
          { label: "Next Page", onClick: handleNextPageDataSend, disabled: !(dataEntryType.length != 0)  }
        ]}
      />
    </div>
  );
};

export default Page;