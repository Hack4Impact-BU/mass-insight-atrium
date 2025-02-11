"use client"
import React from "react";
import Header from "../../components/progress-header";
import { useSearchParams, useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";

//Skip review page for now > can be added later to add more editing funcionality to email
//Email gets sent and then added to email dashboard where all previous emails are (start and end page) > need to add

const Page: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const data = searchParams.get("data");

    const handleNextPageDataSend = () => {
        //send email and store email in dashboard
        //add data that is to be sent to next page
        //not sending data need redux or something else for larger data sending
    }

    //will also need to get the email sending function to actually send the email with all data

return (
    <div>
        <Header/>
        <div className="text-center">
            <p className="text-4xl font-semibold">Review and send email</p>
        </div>

        <Buttons
            buttons={[
            { label: "Cancel", diffStyle: true, onClick: () => {} },
            { label: "Previous", onClick: () => {router.push('/email-flow/steps/four');}  },
            { label: "Send email", onClick: () => {} }
            ]}
        />
    </div>
    );
};

export default Page;