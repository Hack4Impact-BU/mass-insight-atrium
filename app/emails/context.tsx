'use client';
import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Types
export interface Recipient {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role_profile: string;
  isManual?: boolean;
}

export interface CampaignSettings {
  customFields: boolean;
  confirmationCode: boolean;
  replyTo: string;
  reminderOne: string;
  reminderTwo: string;
  color: string;
  logoFile: File | null;
}

export interface CampaignData {
  id?: string;
  title: string;
  subject: string;
  body: string;
  footer: string;
  status: 'draft' | 'sent' | 'failed';
}

export interface EmailState {
  campaign: Partial<CampaignData>;
  recipients: Recipient[];
  settings: Partial<CampaignSettings>;
}

const initialState: EmailState = {
  campaign: {},
  recipients: [],
  settings: {},
};

type Action =
  | { type: 'SET_CAMPAIGN'; payload: Partial<CampaignData> }
  | { type: 'SET_RECIPIENTS'; payload: Recipient[] }
  | { type: 'ADD_RECIPIENT'; payload: Recipient }
  | { type: 'REMOVE_RECIPIENT'; payload: string | number }
  | { type: 'SET_SETTINGS'; payload: Partial<CampaignSettings> }
  | { type: 'RESET' };

function reducer(state: EmailState, action: Action): EmailState {
  switch (action.type) {
    case 'SET_CAMPAIGN':
      return { ...state, campaign: { ...state.campaign, ...action.payload } };
    case 'SET_RECIPIENTS':
      return { ...state, recipients: action.payload };
    case 'ADD_RECIPIENT':
      return { ...state, recipients: [...state.recipients, action.payload] };
    case 'REMOVE_RECIPIENT':
      return { ...state, recipients: state.recipients.filter(r => r.id !== action.payload) };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const EmailContext = createContext<{
  state: EmailState;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

export const EmailProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <EmailContext.Provider value={{ state, dispatch }}>
      {children}
    </EmailContext.Provider>
  );
};

export function useEmailContext() {
  const context = useContext(EmailContext);
  if (!context) throw new Error('useEmailContext must be used within EmailProvider');
  return context;
} 