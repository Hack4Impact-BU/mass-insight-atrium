import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { rows } = await request.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ status: 'error', error: 'No rows provided' }, { status: 400 });
    }
    const supabase = await createClient();
    let added = 0, updated = 0, errors = 0;
    const errorRows: any[] = [];

    for (const row of rows) {
      try {
        // 1. Upsert district
        const { data: district, error: districtError } = await supabase
          .from('districts')
          .upsert({ id: row.district_id, name: row.district_name }, { onConflict: 'id' })
          .select()
          .single();
        if (districtError) throw districtError;

        // 2. Upsert school
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .upsert({ id: row.school_id, name: row.school_name, district_id: row.district_id }, { onConflict: 'id' })
          .select()
          .single();
        if (schoolError) throw schoolError;

        // 3. Upsert person (hybrid: by id, then by email)
        const person = null;
        const personError = null;
        // Try by id
        if (row.id) {
          const { data, error } = await supabase.from('people').select('*').eq('id', row.id).single();
          if (data) {
            // Update by id
            const { error: updateError } = await supabase.from('people').update({
              first_name: row.first_name,
              last_name: row.last_name,
              date_of_birth: row.date_of_birth,
              email: row.email,
              role_profile: row.role_profile,
              race_ethnicity: row.race_ethnicity,
              state_work: row.state_work,
              district_id: row.district_id,
              school_id: row.school_id,
              sy2024_25_participation_limits: row.sy2024_25_participation_limits,
              content_area: row.content_area,
              sy2024_25_course: row.sy2024_25_course,
              sy2024_25_grade_level: row.sy2024_25_grade_level,
            }).eq('id', row.id);
            if (updateError) throw updateError;
            updated++;
            continue;
          } else if (error && error.code !== 'PGRST116') {
            // Not found is fine, but other errors are not
            throw error;
          }
        }
        // Try by email if not found by id
        if (row.email) {
          const { data, error } = await supabase.from('people').select('*').eq('email', row.email).single();
          if (data) {
            // Update by email (and update id if different)
            const { error: updateError } = await supabase.from('people').update({
              id: row.id,
              first_name: row.first_name,
              last_name: row.last_name,
              date_of_birth: row.date_of_birth,
              email: row.email,
              role_profile: row.role_profile,
              race_ethnicity: row.race_ethnicity,
              state_work: row.state_work,
              district_id: row.district_id,
              school_id: row.school_id,
              sy2024_25_participation_limits: row.sy2024_25_participation_limits,
              content_area: row.content_area,
              sy2024_25_course: row.sy2024_25_course,
              sy2024_25_grade_level: row.sy2024_25_grade_level,
            }).eq('email', row.email);
            if (updateError) throw updateError;
            updated++;
            continue;
          } else if (error && error.code !== 'PGRST116') {
            throw error;
          }
        }
        // Insert new person
        const { error: insertError } = await supabase.from('people').insert({
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          date_of_birth: row.date_of_birth,
          email: row.email,
          role_profile: row.role_profile,
          race_ethnicity: row.race_ethnicity,
          state_work: row.state_work,
          district_id: row.district_id,
          school_id: row.school_id,
          sy2024_25_participation_limits: row.sy2024_25_participation_limits,
          content_area: row.content_area,
          sy2024_25_course: row.sy2024_25_course,
          sy2024_25_grade_level: row.sy2024_25_grade_level,
        });
        if (insertError) throw insertError;
        added++;
      } catch (err) {
        errors++;
        errorRows.push(row);
        console.error('Error processing row:', row, err);
      }
    }

    return NextResponse.json({
      status: 'success',
      summary: {
        received: rows.length,
        added,
        updated,
        errors,
      },
      errors: errorRows,
    });
  } catch (error) {
    console.error('Error in report upload API:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 