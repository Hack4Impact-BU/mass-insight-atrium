'use client';

import * as React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
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
            { header: 'Role Profile', accessorKey: 'role_profile' },
            { header: 'Race/Ethnicity', accessorKey: 'race_ethnicity' },
            { header: 'State Work', accessorKey: 'state_work' },
            { header: 'District', accessorKey: 'district_name' },
            { header: 'School', accessorKey: 'school_name' },
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
        initialState: { pagination: { pageSize: 20, pageIndex: 0 } },
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