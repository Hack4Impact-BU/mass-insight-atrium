"use client";
import React from "react";
import { usePathname } from "next/navigation"; 

const steps = [
    { index: 1, label: "Import recipients", path: "/emails/steps/one" },
    { index: 2, label: "Confirm data", path: "/emails/steps/two" },
    { index: 3, label: "Create email", path: "/emails/steps/three" },
    { index: 4, label: "Design", path: "/emails/steps/four" },
    { index: 5, label: "Review and send", path: "/emails/steps/five" },
];

const Header: React.FC = () => {
    const pathname = usePathname();
    const currentStepIndex = steps.findIndex((step) => step.path === pathname);

return (
    <div className="w-full mt-10">
        <div className="flex items-center justify-center">
        {steps.map((step, index) => {
            const isVisited = index <= currentStepIndex;
            return (
            <div key={step.index} className="w-44 h-36">
                <div className="flex justify-center">
                    <div className={`w-12 h-12 rounded-full flex justify-center items-center text-2xl 
                        ${isVisited ? "border border-[#0D99FF] bg-[#003050] text-[#fff]" : "border border-[#929292] text-[#929292]"}`}>
                        {step.index}
                    </div>
                </div>
                <div className="-mt-6"></div>
                    { step.index !== 5 && (
                        <div className={`ml-[120px] w-28 h-1 rounded-full ${isVisited ? "bg-[#0D99FF]" : "bg-[#929292]"}`}></div>
                    )}
                <div className="w-full mt-4 flex justify-center">
                    <button className={`w-44 mt-4 text-sm ${isVisited ? "text-[#0D99FF]" : "text-[#929292]"}`}>{step.label}</button>
                </div>
            </div>
            );
        })}
        </div>
    </div>
    );
};

export default Header;