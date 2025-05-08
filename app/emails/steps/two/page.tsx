"use client"
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Typography, CircularProgress, Alert } from '@mui/material';
import PeopleSelector from '../../../components/PeopleSelector';
import Buttons from '../../components/nav-buttons';
import Header from '../../components/progress-header';
import { Database } from "@/utils/supabase/types";
import { useEmailContext } from '../../context';

type Person = Database["public"]["Tables"]["people"]["Row"] | {
    id: string | number;
    email: string;
    first_name: string;
    last_name: string;
    role_profile: string;
    isManual?: boolean;
};

const Page: React.FC = () => {
    const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { dispatch } = useEmailContext();
    const data = searchParams.get("data"); // data taken in from first page "one"

    const handleNextPageDataSend = async () => {
        if (selectedPeople.length === 0) {
            setError("Please select at least one recipient");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Ensure all recipients have the correct type and email is string
            const typedRecipients = selectedPeople
                .filter(person => !!person.email)
                .map(person => ({
                    ...person,
                    email: String(person.email),
                    role_profile: person.role_profile ? String(person.role_profile) : '',
                    isManual: typeof person.id === 'string' && (
                        person.id.startsWith('manual_') || 
                        person.id.startsWith('import_') || 
                        person.id.startsWith('meeting_')
                    )
                }));
            dispatch({ type: 'SET_RECIPIENTS', payload: typedRecipients });
            await router.push('/emails/steps/three');
        } catch (err) {
            console.error('Navigation error:', err);
            setError('Failed to navigate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Alert severity="error" className="mb-4">
                    {error}
                </Alert>
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-[#006EB6] text-white px-4 py-2 rounded"
                >
                    Reload Page
                </button>
            </div>
        );
    }

    return (
        <div>
            <Header/>
            <div className="text-center">
                <Typography variant="h4" className="font-bold mb-2">
                    Select Recipients
                </Typography>
                <Typography variant="body1" className="text-gray-600 mb-6">
                    Choose the people you want to send the email to.
                </Typography>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <Suspense fallback={<CircularProgress />}>
                    <PeopleSelector onSelectionChange={setSelectedPeople} />
                </Suspense>
                
                <div className="mt-8">
                    <Typography variant="body2" color="text.secondary">
                        {selectedPeople.length} recipients selected
                    </Typography>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <Buttons
                    buttons={[
                        { 
                            label: "Cancel", 
                            diffStyle: true, 
                            onClick: () => router.push('/emails/campaigns') 
                        },
                        { 
                            label: "Previous", 
                            onClick: () => router.push('/emails/steps/one') 
                        },
                        { 
                            label: "Next Page", 
                            onClick: handleNextPageDataSend, 
                            disabled: selectedPeople.length === 0 || loading
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default Page;