'use client';

import * as React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable, type MRT_Cell } from 'material-react-table';
import { StudentType } from '../types';

interface StudentTableSectionProps {
    students: StudentType[];
}

export function StudentTableSection({ students }: StudentTableSectionProps) {
    const columns = React.useMemo(
        () => [
            { header: 'First Name', accessorKey: 'first_name' },
            { header: 'Last Name', accessorKey: 'last_name' },
            { header: 'Email', accessorKey: 'email' },
            { 
                header: 'Date of Birth', 
                accessorKey: 'date_of_birth',
                Cell: ({ cell }: { cell: MRT_Cell<StudentType> }) => 
                    cell.getValue() ? new Date(cell.getValue() as string).toLocaleDateString() : '-'
            },
            { header: 'Role Profile', accessorKey: 'role_profile' },
            { header: 'Race/Ethnicity', accessorKey: 'race_ethnicity' },
            { header: 'State Work', accessorKey: 'state_work' },
            { header: 'District', accessorKey: 'district_name' },
            { header: 'School', accessorKey: 'school_name' },
            { header: 'Content Area', accessorKey: 'content_area' },
            { header: '24-25 Course', accessorKey: 'sy2024_25_course' },
            { 
                header: '24-25 Grade Level', 
                accessorKey: 'sy2024_25_grade_level',
                Cell: ({ cell }: { cell: MRT_Cell<StudentType> }) => 
                    cell.getValue() ? `Grade ${cell.getValue()}` : '-'
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        data: students,
        columns,
        enableRowSelection: true,
        enableColumnFilters: true,
        enableSorting: true,
        enablePagination: true,
        enableGlobalFilter: true,
        initialState: { 
            pagination: { pageSize: 20, pageIndex: 0 },
            columnVisibility: {
                date_of_birth: false, // Hide by default for privacy
            }
        },
    });

    return (
        <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
                <Typography variant="h5" fontWeight={700} mb={2}>Student Data</Typography>
                <Box sx={{ height: 600, width: '100%' }}>
                    <MaterialReactTable table={table} />
                </Box>
            </CardContent>
        </Card>
    );
} 