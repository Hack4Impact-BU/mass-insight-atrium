"use client";
import { usePathname } from "next/navigation";
import path from "path";
import { steps } from "../layout";
import { Step, StepLabel, Stepper } from "@mui/material";
import { ReactNode } from "react";
export default function Steps() {
  const pathname = usePathname();
  const currentPath = path.basename(pathname);
  return (
    <Stepper activeStep={steps.findIndex((step) => step.route === currentPath)}>
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
