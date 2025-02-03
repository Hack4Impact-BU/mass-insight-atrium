import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase credentials. Check your .env file.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  sy2024_25_participation_limits?: string;
  content_area?: string;
  sy2024_25_course?: string;
  sy2024_25_grade_level?: number;
}

const parseExcel = async (fileBuffer: Buffer): Promise<RowData[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  const worksheet = workbook.worksheets[0];

  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = (
      typeof cell.text === "string" ? cell.text : String(cell.text)
    ).trim();
  });
  const data: RowData[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData: any = {};

    row.eachCell((cell, colNumber) => {
      let value: string;

      if (typeof cell.value === "object" && cell.value !== null) {
        // Handle objects like hyperlinks
        if ("hyperlink" in cell.value) {
          value = cell.value.hyperlink.split(":")[1]; // Use the hyperlink itself
        } else {
          value = "N/A"; // Default to empty string for unknown object types
        }
      } else {
        // Handle simple strings, numbers, or booleans
        value = (
          typeof cell.text === "string" ? cell.text : String(cell.text)
        ).trim();
      }

      rowData[headers[colNumber - 1]] = value;
    });

    data.push(rowData);
  });

  return data;
};

const insertIntoSupabase = async (data: RowData[]) => {
  const districtMap = new Map();
  const schoolMap = new Map();

  for (const row of data) {
    let district_id = row.district_id;
    let school_id = row.school_id;

    if (!districtMap.has(row.district_id)) {
      const { error: districtError } = await supabase
        .from("districts")
        .upsert([{ id: district_id, name: row.district_name }], {
          onConflict: "id",
        })
        .single();

      if (districtError) console.error("District Insert Error:", districtError);
      districtMap.set(row.district_name, district_id);
    }

    if (!schoolMap.has(row.school_id)) {
      const { error: schoolError } = await supabase
        .from("schools")
        .upsert([{ id: school_id, name: row.school_name, district_id }], {
          onConflict: "id",
        })
        .single();

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
        },
      ],
      { onConflict: "id" }
    );

    if (personError) console.error("Person Insert Error:", personError);
  }
};

/**
 * Handles the file upload and processes data.
 * @param file - The uploaded Excel file.
 *
 * Might need edits to intake a correct file type - Simon 2/2/25
 */
export const handleFileUpload = async (file: { buffer: Buffer }) => {
  try {
    const jsonData = await parseExcel(file.buffer);
    console.log("Parsed Data:", jsonData);
    await insertIntoSupabase(jsonData);
    console.log("Upload completed successfully!");
  } catch (error) {
    console.error("Error processing file:", error);
  }
};
