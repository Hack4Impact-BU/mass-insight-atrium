"use client"
import React from "react";
import Header from "../../components/progress-header";
import Buttons from "../../components/nav-buttons";
import { useSearchParams, useRouter } from "next/navigation";


const Page: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const emailData = {
        emailTitleValue: searchParams.get("emailTitleValue") || "",
        emailSubjectValue: searchParams.get("emailSubjectValue") || "",
        emailBodyValue: searchParams.get("emailBodyValue") || "",
        emailFooterValue: searchParams.get("emailFooterValue") || "",
    };

    const handleNextPageDataSend = () => {
        router.push('/email-flow/steps/five') // will need to send data to next page to send the email
    }

return (
    <div>
        <Header/>
        <div className="text-center">
            <p className="text-4xl font-semibold">Edit your email design</p>
        </div>

    <div className="flex justify-center w-full mt-6">
        <div className="w-3/5 flex">
            <div className="w-full ml-10">
            <div className="mt-10 bg-[#022C4D] border border-[#0D99FF] text-[#fff] p-3 rounded-t-md w-fit">
                    <p className="text-sm">{emailData.emailTitleValue}</p>
            </div>
                <div className="border border-[#929292] p-2 flex justify-center">
                    <div>
                        
                        <div className="m-10 text-center">
                            <p className="text-sm">Image goes here</p>
                        </div>

                        <div className="m-10 text-center border border-[#929292] p-3">
                            <p className="text-4xl font-bold">{emailData.emailSubjectValue}</p>
                            <p className="text-center text-lg mt-4">Date of meeting here</p>
                        </div>

                        <div className="m-10 flex justify-center border border-[#929292] p-3">
                            <p className="">{emailData.emailBodyValue}</p>
                        </div>

                        <div className="m-10 text-center border border-[#929292] p-3">
                            <p>{emailData.emailFooterValue}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>

        <Buttons
        buttons={[
        { label: "Cancel", diffStyle: true, onClick: () => {} },
        { label: "Previous", onClick: () => {router.push('/email-flow/steps/three');}  },
        { label: "Next Page", onClick: handleNextPageDataSend }
        ]}/>
    </div>
    );
};

export default Page;