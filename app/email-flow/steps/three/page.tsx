"use client"
import React from "react";
import { useState } from "react";
import Header from "../../components/progress-header";
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Buttons from "../../components/nav-buttons";
import { useSearchParams, useRouter } from "next/navigation";
import Modal from "../../components/recip-modal";

const Page: React.FC = () => {
    const [customFeilds, setCustomFeilds] = React.useState<boolean>(false);
    const [confirmationCode, setconfirmationCode] = React.useState<boolean>(false);
    const [replyToEmailValue, setReplyToEmailValue] = React.useState<string>('');
    const [remindTimeOne, setRemindTimeOne] = React.useState<string>('');
    const [remindTimeTwo, setRemindTimeTwo] = React.useState<string>('');
    const [colorValue, setColorValue] = React.useState<string>('');
    const [logoFileValue, setLogoFileValue] = useState<File | null>(null);
    const [emailInputValues, setEmailInputValues] = useState<{ [key: string]: string }>({
        emailTitleValue: '',
        emailSubjectValue: '',
        emailBodyValue: '',
        emailFooterValue: ''
    });
    const [modal, setModal] = useState(false);
    const sampleData = ["rtiska@bu.edu", "tsmith@bu.edu", "kgold@bu.edu", "chris@bu.edu"];
    const [dataCheck, setDataCheck] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleGetInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReplyToEmailValue(event.target.value);
    };
    const handleRemindTimeOne = (event: SelectChangeEvent) => {
        setRemindTimeOne(event.target.value);
    };
    const handleRemindTimeTwo = (event: SelectChangeEvent) => {
        setRemindTimeTwo(event.target.value);
    };
    const handleEmailInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setEmailInputValues((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleNextPageDataSend = () => {
            if (
                //!replyToEmailValue ||
                //!remindTimeOne ||
                //!remindTimeTwo ||
                //!colorValue ||
                //!logoFileValue ||
                !emailInputValues.emailTitleValue ||
                !emailInputValues.emailSubjectValue ||
                !emailInputValues.emailBodyValue ||
                !emailInputValues.emailFooterValue
            ) {
                alert("Please fill out all fields.");
            }
            else{
                router.push('/email-flow/steps/four')
                const queryString = new URLSearchParams(emailInputValues).toString(); // just sending email values for now
                router.push(`/email-flow/steps/four?${queryString}`);
            }
    }

return (
    <div>
        <Header/>
        <div className="text-center">
            <p className="text-4xl font-semibold">Email your invitees</p>
            <p className="text-sm mt-6">You’ll be able to customize the design of your email in the next step.</p>
        </div>

        <div className="flex justify-center mt-10">
            <div className="border border-[#006EB6] p-4 pb-2.5 pt-2.5 flex justify-center items-center">
                <Checkbox className="w-8 h-8" value="check" checked={customFeilds} onChange={() => setCustomFeilds((prevSelected) => !prevSelected)}/>                <p className="text-sm ml-4">Include replies to custom fields in email confirmation</p>
            </div>

            <div className="border border-[#006EB6] p-4 pb-2.5 pt-2.5 flex justify-center items-center ml-16">
                <Checkbox className="w-8 h-8" value="check" checked={confirmationCode} onChange={() => setconfirmationCode((prevSelected) => !prevSelected)}/>                <p className="text-sm ml-4">Include a confirmation code</p>
            </div>
        </div>

        <div className="mt-10">
                <p className="font-medium">Auto Reminders</p>
                <div className="flex items-center mt-3">
                    <p className="text-sm">Send guests a reminder in advance of start</p>
                    <div className="ml-6">
                        <Select className="h-10 w-32" labelId="demo-select-small-label" id="demo-select-small" value={remindTimeOne} onChange={handleRemindTimeOne} >
                            <MenuItem value={24}>24 hours</MenuItem>
                            <MenuItem value={12}>12 hours</MenuItem>
                            <MenuItem value={6}>6 hours</MenuItem>
                            <MenuItem value={3}>3 hours</MenuItem>
                        </Select>
                    </div>
                    <p className="ml-6 text-sm">and</p>
                    <div className="ml-6">
                        <Select className="h-10 w-32" labelId="demo-select-small-label" id="demo-select-small" value={remindTimeTwo} onChange={handleRemindTimeTwo} >
                            <MenuItem value={24}>24 hours</MenuItem>
                            <MenuItem value={12}>12 hours</MenuItem>
                            <MenuItem value={6}>6 hours</MenuItem>
                            <MenuItem value={3}>3 hours</MenuItem>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-3/5">
                        <p className="text-sm font-medium">Reply-to Email</p>
                        <input className="w-3/4 h-10 border border-[#929292] mt-2 pl-3 pr-3" placeholder="" onChange={handleGetInputValue} value={replyToEmailValue}></input>
                    </div>
                    <div className="w-1/5">
                        <p className="text-sm font-medium">Color</p>
                        <div className="flex mt-2">
                            <button className="w-10 h-10 bg-[#fff] border border-[#006EB6]" onClick={() => setColorValue("white")}></button>
                            <button className="w-10 h-10 bg-[#000] ml-2" onClick={() => setColorValue("black")}></button>
                        </div>
                    </div>
                    <div className="w-1/5">
                        <p className="text-sm font-medium">Logo</p>
                        <input
                        type="file"
                        onChange={(e) => setLogoFileValue(e.target.files?.[0] || null)}
                        style={{ display: "none" }}
                        id="logoInput" />
                        <button onClick={() => document.getElementById("logoInput")?.click()} 
                        className="h-10 w-full border border-[#006EB6] mt-2 text-sm text-[#006EB6]">Choose file</button>
                    </div>
                </div>
        </div>
        <div className="mt-10">
            <Accordion>
            <AccordionSummary expandIcon={<ArrowDownwardIcon />}>
                <Typography component="span">Edit email content</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography></Typography>
                <div className="flex items-center mt-4">
                    <p className="text-sm font-medium w-20">Title:</p>
                    <input className="w-3/4 h-10 border border-[#929292] p-3 h-10" placeholder=""
                        name="emailTitleValue"
                        value={emailInputValues.emailTitleValue}
                        onChange={handleEmailInputs}
                    ></input>
                </div>
                <div className="flex items-center mt-8">
                    <p className="text-sm font-medium w-20">Subject:</p>
                    <input className="w-3/4 h-10 border border-[#929292] p-3 h-10" placeholder=""
                        name="emailSubjectValue"
                        value={emailInputValues.emailSubjectValue}
                        onChange={handleEmailInputs}
                    ></input>
                </div>
                <div className="flex items-center mt-8">
                    <p className="text-sm font-medium w-20">Body:</p>
                    <textarea className="w-3/4 h-10 border border-[#929292] p-3 h-24" placeholder=""
                        name="emailBodyValue"
                        value={emailInputValues.emailBodyValue}
                        onChange={handleEmailInputs}
                    ></textarea>
                </div>
                <div className="flex items-center mt-8">
                    <p className="text-sm font-medium w-20">Footer:</p>
                    <textarea className="w-3/4 h-10 border border-[#929292] p-3 h-24" placeholder=""
                        name="emailFooterValue"
                        value={emailInputValues.emailFooterValue}
                        onChange={handleEmailInputs}
                    ></textarea>
                </div>
                <button className="mt-6 mb-6 h-10 w-36 border border-[#006EB6] text-sm text-[#006EB6]" onClick={() => setModal(true)}>Add recipients</button>
                <Modal isOpen={modal} onClose={() => setModal(false)}>
                    <h2 className="text-lg font-medium">Add recipients</h2>
                    <p className="mt-2 text-sm">Select the recipients you want send this email</p>
                    <hr className="mt-4"></hr>
                    <div className="overflow-auto h-96">
                        <p className="text-sm mt-4 m-2">Emails imported: {sampleData.length}</p>
                        {sampleData.map((item, index) => (
                        <div key={index} className="m-2 p-4 pb-2.5 pt-2.5 border border-[#006EB6] cursor-pointer flex justify-center items-center">
                            <p>{item}</p>
                        </div>
                        ))}
                    </div>
                </Modal>
            </AccordionDetails>
            </Accordion>
</div>
    <Buttons
        buttons={[
        { label: "Cancel", diffStyle: true, onClick: () => {} },
        { label: "Previous", onClick: () => {router.push('/email-flow/steps/two');}  },
        { label: "Next Page", onClick: handleNextPageDataSend, disabled: false }
        ]}/>
    </div>
    );
};

export default Page;