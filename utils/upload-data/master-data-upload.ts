import { createClient } from "../supabase/client";
import dotenv from "dotenv";
dotenv.config();
//papapase for csv

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
  console.log(fileExtension)
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
  // TODO: Add check for required columns
  const requiredColumns = [
    "first_name",
    "last_name",
    "id",
    "date_of_birth",
    "email",
    "role_profile",
    "race_ethnicity",
    "state_work",
    "district_name",
    "district_id",
    "school_name",
    "school_id",
    "content_area",
    "sy2024_25_course",
    "sy2024_25_grade_level",
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

export const uploadDataSheeToSupabase = async (data: RowData[]) => {
  const districtMap = new Map();
  const schoolMap = new Map();

  console.log(
    "Uploading the following data to Supabase:",
    JSON.stringify(data, null, 2)
  );
  for (const row of data) {
    let district_id = row.district_id;
    let school_id = row.school_id;

    if (!districtMap.has(row.district_id)) {
      const { error: districtError } = await supabase
        .from("districts")
        .upsert([{ id: district_id, name: row.district_name }], {
          onConflict: "id",
        });

      if (districtError) console.error("District Insert Error:", districtError);
      districtMap.set(row.district_name, district_id);
    }

    if (!schoolMap.has(row.school_id)) {
      const { error: schoolError } = await supabase
        .from("schools")
        .upsert([{ id: school_id, name: row.school_name, district_id }], {
          onConflict: "id",
        });

      if (schoolError) console.error("School Insert Error:", schoolError);
      schoolMap.set(row.school_name, school_id);
    }

    const { error: personError } = await supabase.from("people").upsert(
      [
        {
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          date_of_birth: row.date_of_birth,
          email: row.email,
          role_profile: row.role_profile,
          race_ethnicity: row.race_ethnicity,
          state_work: row.state_work,
          district_id,
          school_id,
          content_area: row.content_area,
          sy2024_25_course: row.sy2024_25_course,
          sy2024_25_grade_level: row.sy2024_25_grade_level,
        },
      ],
      { onConflict: "id" }
    );
    console.log("success " + row.id)
  

    if (personError) {
      console.error("Person Insert Error:", personError);
      console.error("Error Details:", JSON.stringify(personError, null, 2));
    }
  }
};
