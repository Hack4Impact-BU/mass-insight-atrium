"use client";

import React, { useState } from 'react';
import { Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { createClient } from '@/utils/supabase/client';
import Papa from 'papaparse';

// Function to convert Excel serial date to YYYY-MM-DD
const convertExcelDate = (excelDate: string | number): string | null => {
  // If empty or not a number, return null
  if (!excelDate || isNaN(Number(excelDate))) {
    return null;
  }

  try {
    // Convert to number and adjust for Excel's date system
    const days = Number(excelDate) - 25569;
    const date = new Date(days * 86400 * 1000);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return null;
    }

    // Format as YYYY-MM-DD
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting date:', error);
    return null;
  }
};

interface CSVRow {
  first_name: string;
  last_name: string;
  id: string;
  date_of_birth: string;
  email: string;
  role_profile: string;
  race_ethnicity: string;
  state_work: string;
  district_name: string;
  district_id: string;
  school_name: string;
  school_id: string;
  sy2023_24_participation_limits: string;
  content_area: string;
  sy2023_24_course: string;
  sy2023_24_grade_level: string;
}

export default function ReportsPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    added: number;
    updated: number;
    errors: number;
  } | null>(null);

  const validateRow = (row: CSVRow): string | null => {
    if (!row.first_name) return 'Missing first name';
    if (!row.last_name) return 'Missing last name';
    if (!row.id) return 'Missing Student ID';
    if (!row.email?.includes('@')) return 'Invalid email format';
    if (!['student', 'teacher', 'administrator'].includes(row.role_profile?.toLowerCase())) {
      return 'Invalid role_profile (must be student, teacher, or administrator)';
    }
    return null;
  };

  const processCSV = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    setStats(null);

    const stats = {
      total: 0,
      added: 0,
      updated: 0,
      errors: 0,
    };

    try {
      const supabase = createClient();

      // Parse CSV
      const results = await new Promise<CSVRow[]>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as CSVRow[]),
          error: (error) => reject(error),
        });
      });

      stats.total = results.length;

      // Process each row
      for (const row of results) {
        try {
          const validationError = validateRow(row);
          if (validationError) {
            console.error(`Validation error for ID ${row.id}: ${validationError}`);
            stats.errors++;
            continue;
          }

          // Check if district exists, create if not
          const { data: district, error: districtError } = await supabase
            .from('districts')
            .upsert({
              id: row.district_id,
              name: row.district_name,
            })
            .select()
            .single();

          if (districtError) throw districtError;

          // Check if school exists, create if not
          const { data: school, error: schoolError } = await supabase
            .from('schools')
            .upsert({
              id: row.school_id,
              name: row.school_name,
              district_id: district.id,
            })
            .select()
            .single();

          if (schoolError) throw schoolError;

          // Prepare person data
          const personData = {
            student_id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            date_of_birth_raw: row.date_of_birth ? Number(row.date_of_birth) : null,
            email: row.email,
            role_profile: row.role_profile.toLowerCase(),
            race_ethnicity: row.race_ethnicity || null,
            state_work: row.state_work || null,
            district_id: district.id,
            school_id: school.id,
            sy2023_24_participation_limits: row.sy2023_24_participation_limits === 'true',
            content_area: row.content_area || null,
            sy2023_24_course: row.sy2023_24_course || null,
            sy2023_24_grade_level: row.sy2023_24_grade_level || null,
          };

          // Log the date conversion for debugging
          console.log(`Processing date for ${row.id}: ${row.date_of_birth} -> ${personData.date_of_birth_raw}`);

          // Upsert person record
          const { data: person, error: personError } = await supabase
            .from('people')
            .upsert(personData, {
              onConflict: 'student_id'
            })
            .select()
            .single();

          if (personError) {
            console.error('Person upsert error:', personError);
            throw personError;
          }

          // Update stats based on the operation result
          const { data: checkExisting } = await supabase
            .from('people')
            .select('created_at, updated_at')
            .eq('student_id', row.id)
            .single();

          if (checkExisting && checkExisting.created_at === checkExisting.updated_at) {
            stats.added++;
          } else {
            stats.updated++;
          }

        } catch (error) {
          console.error(`Error processing row for ID ${row.id}:`, error);
          stats.errors++;
        }
      }

      setStats(stats);
      setSuccess(`Successfully processed ${stats.total} records`);

    } catch (error) {
      console.error('Error processing CSV:', error);
      setError('Failed to process CSV file. Please check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <Typography variant="h4" gutterBottom>
        Reports & Data Import
      </Typography>

      <Paper className="p-6 mt-6">
        <Typography variant="h6" gutterBottom>
          Import People Data
        </Typography>
        
        <Typography variant="body2" color="text.secondary" className="mb-4">
          Upload a CSV file with the following headers: first_name, last_name, id (Student ID),
          date_of_birth, email, role_profile, race_ethnicity, state_work, district_name,
          district_id, school_name, school_id, sy2023_24_participation_limits, content_area,
          sy2023_24_course, sy2023_24_grade_level
        </Typography>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processCSV(file);
          }}
          className="hidden"
          id="csv-upload"
          disabled={uploading}
        />

        <Button
          variant="contained"
          component="label"
          htmlFor="csv-upload"
          disabled={uploading}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload CSV'}
        </Button>

        {error && (
          <Alert severity="error" className="mt-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="mt-4">
            {success}
          </Alert>
        )}

        {stats && (
          <div className="mt-4">
            <Typography variant="h6" gutterBottom>
              Import Results
            </Typography>
            <Typography variant="body2">
              Total Records: {stats.total}<br />
              New Records: {stats.added}<br />
              Updated Records: {stats.updated}<br />
              Errors: {stats.errors}
            </Typography>
          </div>
        )}
      </Paper>
    </div>
  );
} 