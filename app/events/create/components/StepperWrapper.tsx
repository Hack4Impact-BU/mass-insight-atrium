"use client";
import { usePathname } from "next/navigation";
import path from "path";
import { steps } from "../../utils";
import { Step, StepLabel, Stepper } from "@mui/material";
import { ReactNode } from "react";
export default function Steps() {
  const currentPathname = usePathname();
  return (
    <Stepper
      activeStep={steps.findIndex((step) => step.route === currentPathname)}
    >
      {steps.map((label) => {
        const stepProps: { completed?: boolean } = {};
        const labelProps: { optional?: ReactNode } = {};
        return (
          <Step key={label.name} {...stepProps}>
            <StepLabel {...labelProps}>{label.name}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}
