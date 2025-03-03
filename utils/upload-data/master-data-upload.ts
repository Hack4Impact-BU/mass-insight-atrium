import { createClient } from "../supabase/client";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient();
/**
 * 
 * @param file uploaded file from HTML input element
 * @returns boolean
 * Returns true if the file is a valid file type (csv or xlsx)
 */
export const isValidFileType = (
  file: File | null,
  validExtensions: string[]
) => {
  if (!file) return false;
  const fileExtension = file.type;
  return validExtensions.includes(fileExtension);
};

/**
 * 
 * @param data array of objects
 * @returns boolean
 * Returns true if the data contains the required columns
 */
export const isValidFormat = (data: any[]) => {
  if (!data || data.length === 0) return false;
  const columns = Object.keys(data[0]);
  // TODO: Add check for required columns & more specific checks for column formats
  const requiredColumns = [
    "first_name", "last_name", "id", "date_of_birth", "email", "role_profile", "race_ethnicity", "state_work", "district_name", "district_id", "school_name", "school_id", 
    "content_area", "sy2024_25_course", "sy2024_25_grade_level"
  ];
  return true;
};

interface RowData {
  first_name: string;
  last_name: string;
  id: number;
  date_of_birth: string;
  email: string;
  role_profile: string;
  race_ethnicity: string;
  state_work: string;
  district_name: string;
  district_id: number;
  school_name: string;
  school_id: number;
  sy2024_25_participation_limits: string;
  content_area: string;
  sy2024_25_course: string;
  sy2024_25_grade_level: number;
}

export const uploadDataSheetToSupabase = async (data: RowData[]) => {
  const districtMap = new Map();
  const schoolMap = new Map();
  const districtInserts = data.map((row) => {
    if (!districtMap.has(row.district_id)) {
      districtMap.set(row.district_id, row.district_name);
      return {
        id: row.district_id,
        name: row.district_name,
      };
    }
  }).filter(row => row && row !== undefined);

  const schoolInserts = data.map((row) => {
    if (!schoolMap.has(row.school_id)) {
      schoolMap.set(row.school_id, row.school_name);
      return {
        id: row.school_id,
        name: row.school_name,
        district_id: row.district_id,
      };
    }
  }).filter(row => row && row !== undefined);

  const personInserts = data.map((row) => {
    return {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      date_of_birth: row.date_of_birth,
      email: row.email,
      role_profile: row.role_profile,
      role_ethnicity: row.race_ethnicity,
      state_work: row.state_work,
      district_id: row.district_id,
      school_id: row.school_id,
    };
  }).filter(row => row || row !== undefined);

  const { error: districtInsertError } = await supabase
    .from("districts")
    .upsert(
      districtInserts,
      { onConflict: "id" }
    );

  if (districtInsertError) {
    console.error("District Insert Error:", districtInsertError);
    throw districtInsertError;
  }

  const { error: schoolInsertError } = await supabase
    .from("schools")
    .upsert(
      schoolInserts,
      { onConflict: "id" }
    );
  
  if (schoolInsertError) {
    console.error("School Insert Error:", schoolInsertError);
    throw schoolInsertError;
  }

  const { error: personInsertError } = await supabase
    .from("people")
    .upsert(
      personInserts,
      { onConflict: "id" }
    );

  if (personInsertError) {
    console.error("Person Insert Error:", personInsertError);
    throw personInsertError;
  }
};
