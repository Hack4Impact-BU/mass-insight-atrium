import React from "react";

interface ButtonProps {
    label: string;
    onClick?: () => void;
    diffStyle?: boolean;
    disabled?: boolean;
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
            onClick={!button.disabled ? button.onClick : undefined}
            className={`w-32 h-14 ml-2 ${
            button.diffStyle
                    ? "bg-[#fff] text-[#000]"
                    : button.disabled
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-[#006EB6] text-[#fff]"
        }`}
            disabled={button.disabled}
        >
        {button.label}
        </button>
    ))}
    </div>
);
}