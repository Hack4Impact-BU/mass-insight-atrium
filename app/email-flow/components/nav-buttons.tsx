import React from "react";

interface ButtonProps {
    label: string;
    onClick?: () => void;
    diffStyle?: boolean;
}

interface ButtonGroupProps {
    buttons: ButtonProps[];
}

export default function Buttons({ buttons }: ButtonGroupProps) {
    return (
    <div className="flex gap-2 mt-10 mb-10">
        {buttons.map((button, index) => (
        <button
            key={index}
            onClick={button.onClick || (() => {})}
            className={`w-32 h-14 ml-2 ${
            button.diffStyle
                    ? "bg-[#fff] text-[#000]"
                    : "bg-[#006EB6] text-[#fff]"
        }`}
        >
        {button.label}
        </button>
    ))}
    </div>
);
}