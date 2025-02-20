"use client";
import dayjs, { Dayjs } from "dayjs";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type MeetingCreateFormDataType = {
  meetingName: string;
  description: string;
  startDate: string;
  endDate: string;
  locationType: "online" | "inperson" | "both";
  meetingAddress: string;
  meetingLink: string;
  passcode: string; // hashed with bcrypt when sending to database
  moderators: { firstName: string; lastName: string; emailAddress: string }[];
  attendees: { firstName: string; lastName: string; emailAddress: string }[];
  waitlist: boolean;
  cap: number | "";
  timezone: string;
};

type MeetingFormContextType = {
  formData: MeetingCreateFormDataType;
  step: number;
  next: () => void;
  prev: () => void;
  updateFields: (fields: Partial<MeetingCreateFormDataType>) => void;
};

const initialValues: MeetingCreateFormDataType = {
  meetingName: "",
  description: "",
  startDate: dayjs().toISOString(),
  endDate: dayjs().toISOString(),
  locationType: "online",
  meetingAddress: "",
  meetingLink: "",
  passcode: "",
  waitlist: false,
  cap: 0,
  attendees: [],
  moderators: [{ firstName: "", lastName: "", emailAddress: "" }],
  timezone: "-05:00",
};

export const MeetingFormContext = createContext<MeetingFormContextType | null>(
  null
);

export const MeetingFormContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialValues);
  const updateFields = useCallback(
    (fields: Partial<MeetingCreateFormDataType>) => {
      setFormData((data) => {
        return { ...data, ...fields };
      });
    },
    []
  );

  const next = useCallback(() => setStep((step) => step + 1), []);
  const prev = useCallback(() => {
    if (step > 0) {
      setStep((step) => step - 1);
    }
  }, [step]);

  const contextValue = useMemo<MeetingFormContextType>(
    () => ({
      step,
      formData,
      updateFields,
      prev,
      next,
    }),
    [formData, prev, next, step, updateFields]
  );
  return (
    <MeetingFormContext.Provider value={contextValue}>
      {children}
    </MeetingFormContext.Provider>
  );
};

export const useMeetingFormContext = () => {
  const context = useContext(MeetingFormContext);
  if (context === null) {
    throw new Error(
      "useMeetingFormContext must be used within a EventFormContextProvider"
    );
  }
  return context;
};
