import { createContext, useState, ReactNode, useContext, useEffect } from "react";

interface FormStep {
  title: string;
  description?: string;
}

interface MultistepFormContextProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  data: Record<string, any>;
  setData: (data: Record<string, any>) => void;
  file?: File;
  setFile?: (file: File) => void;
  parsedFileData?: any;
  setParsedFileData?: (data: any) => void;
  steps: FormStep[];
  formCreated: boolean;
}

const MultistepFormContext = createContext<MultistepFormContextProps | undefined>(undefined);

export const useMultistepForm = () => {
  const context = useContext(MultistepFormContext);
  if (!context) {
    throw new Error("useMultistepForm must be used within a MultistepFormProvider");
  }
  return context;
};

interface MultistepFormProviderProps {
  children: ReactNode;
}

/**
 * Provides context for a multi-step form, including current step, form data, file handling, and step management.
 * 
 * @param {Object} props - The properties object.
 * @param {ReactNode} props.children - The child components that will have access to the multi-step form context.
 * @param {number} props.currentStep - The current step of the form.
 * @param {function} props.setCurrentStep - Function to set the current step of the form.
 * @param {Object} props.data - The data collected from the form steps.
 * @param {function} props.setData - Function to set the form data.
 * @param {File} [props.file] - The file uploaded in the form, if any.
 * @param {function} [props.setFile] - Function to set the uploaded file.
 * @param {any} [props.parsedFileData] - The parsed data from the uploaded file.
 * @param {function} [props.setParsedFileData] - Function to set the parsed file data.
 * @param {Array} props.steps - The steps of the form.
 * @param {boolean} props.formCreated - Indicates if the form has been created.
 * 
 * @returns {JSX.Element} The provider component that wraps its children with the multi-step form context.
 */
export const MultistepFormProvider = ({ children }: MultistepFormProviderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [file, setFile] = useState<File | undefined>(undefined);
  const [parsedFileData, setParsedFileData] = useState<any>(undefined);
  const [steps, setStepsState] = useState<FormStep[]>([]);
  const [formCreated, setFormCreated] = useState(false);

  const setSteps = (newSteps: FormStep[]) => {
    if (!formCreated) {
      setStepsState(newSteps);
    } else {
      console.warn("Cannot modify steps after the form has been created");
    }
  };

  useEffect(() => {
    if (steps.length > 0) {
      setFormCreated(true);
    }
  }, [steps]);

  return (
    <MultistepFormContext.Provider value={{ currentStep, setCurrentStep, data, setData, file, setFile, parsedFileData, setParsedFileData, steps, formCreated }}>
      {children}
    </MultistepFormContext.Provider>
  );
};

