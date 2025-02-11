"use client"
import React from "react";
import { useState } from "react";
import Header from "../../components/progress-header";
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import { useSearchParams, useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";


const Page: React.FC = () => {
    const sampleData = ["first_name", "last_name", "id (Student ID)", "email"] // for testing/UI testing
    const [selectedItems, setSelectedItems] = useState<boolean[]>(new Array(sampleData.length).fill(false));
    const searchParams = useSearchParams();
    const router = useRouter();
    const data = searchParams.get("data"); // data taken in from first page "one"
    
    const handleToggle = (index: number) => {
        setSelectedItems((prev) => {
        const newSelected = [...prev];
            newSelected[index] = !newSelected[index];
            return newSelected;
        });
        //selected items in array of "true/false" values of data to be sent to next page
    };

    const handleNextPageDataSend = () => {
        router.push('/email-flow/steps/three');
       // add data that is to be sent to next page
       // not sending data need redux or something else for larger data sending
    }

return (
    <div>
        <Header/>
        <div className="text-center">
            <p className="text-4xl font-semibold">Are these the following fields from your data?</p>
            <p className="text-sm mt-6">Select the fields needed to email your invitees.</p>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-10">
            {sampleData.map((item, index) => (
                    <div key={index} className="p-4 pb-2.5 pt-2.5 border border-[#006EB6] cursor-pointer flex justify-center items-center">
                        <ToggleButton className="w-8 h-8" value="check" selected={selectedItems[index]} onChange={() => handleToggle(index)} >
                            <CheckIcon/>
                        </ToggleButton>
                        <p className="w-36 ml-4">{item}</p>
                    </div>
            ))}
        </div>

        <Buttons
            buttons={[
            { label: "Cancel", diffStyle: true, onClick: () => {} },
            { label: "Previous", onClick: () => {router.push('/email-flow/steps/one');}  },
            { label: "Next Page", onClick: handleNextPageDataSend }
            ]}
        />
    </div>
    );
};

export default Page;