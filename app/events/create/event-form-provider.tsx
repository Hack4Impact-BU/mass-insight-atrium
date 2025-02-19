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

export type EventCreateFormDataType = {
  name: string;
  description: string;
  startDate: number | undefined;
  endDate: number | undefined;
  location: "online" | "in-person";
  locationInfo: string;
  passcode: string // hashed with bcrypt when sending to databae
  moderators: string[];
  attendees: string[];
  waitlist: boolean;
  cap?: number | "";
  timezone: string;
};

type EventFormContextType = {
  formData: EventCreateFormDataType;
  step: number;
  next: () => void;
  prev: () => void;
  updateFields: (fields: Partial<EventCreateFormDataType>) => void;
};
const initialValues: EventCreateFormDataType = {
  name: "",
  description: "",
  startDate: dayjs().valueOf(),
  endDate: dayjs().valueOf(),
  location: "online",
  locationInfo: "",
  passcode: "",
  waitlist: false,
  cap: 0,
  attendees: [],
  moderators: [],
  timezone: "-05:00"
};

export const EventFormContext = createContext<EventFormContextType | null>(
  null
);

export const EventFormContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialValues);
  const updateFields = useCallback(
    (fields: Partial<EventCreateFormDataType>) => {
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

  const contextValue = useMemo<EventFormContextType>(
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
    <EventFormContext.Provider value={contextValue}>
      {children}
    </EventFormContext.Provider>
  );
};

export const useEventFormContext = () => {
  const context = useContext(EventFormContext);
  if (context === null) {
    throw new Error(
      "useEventFormContext must be used within a EventFormContextProvider"
    );
  }
  return context;
};
