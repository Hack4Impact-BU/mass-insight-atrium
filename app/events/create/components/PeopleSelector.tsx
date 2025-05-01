"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  Chip,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

const supabase = createClient();

type Person = Database["public"]["Tables"]["people"]["Row"];
type School = Database["public"]["Tables"]["schools"]["Row"] & { district_name?: string };
type District = Database["public"]["Tables"]["districts"]["Row"];

interface PeopleSelectorProps {
  onSelectionChange: (selectedPeople: Person[]) => void;
  initialSelectedPeople?: Person[];
}

export default function PeopleSelector({ onSelectionChange, initialSelectedPeople = [] }: PeopleSelectorProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<Person[]>(initialSelectedPeople);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedContentAreas, setSelectedContentAreas] = useState<string[]>([]);
  const [selectedGradeLevels, setSelectedGradeLevels] = useState<string[]>([]);
  const [tableRowSelection, setTableRowSelection] = useState<Record<number, boolean>>({});

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      // Fetch people with distinct email addresses
      const { data: peopleData } = await supabase
        .from("people")
        .select("*")
        .not("email", "is", null)
        .order("last_name", { ascending: true });

      if (peopleData) {
        const uniquePeople = peopleData.reduce<Person[]>((acc, current) => {
          const exists = acc.some(person => person.email === current.email);
          if (!exists) {
            return [...acc, current];
          }
          return acc;
        }, []);
        setPeople(uniquePeople);
      }

      // Fetch districts first
      const { data: districtsData } = await supabase
        .from("districts")
        .select("id, name")
        .order("name", { ascending: true });

      if (districtsData) {
        const uniqueDistricts = Array.from(new Map(districtsData.map(district => [district.name, district])).values());
        setDistricts(uniqueDistricts);

        // Fetch schools with district information
        const { data: schoolsData, error: schoolsError } = await supabase
          .from("schools")
          .select("id, name, district_id")
          .order("name", { ascending: true });

        if (schoolsError) {
          console.error("Error fetching schools:", schoolsError);
        }

        if (schoolsData) {
          // Add district names to schools
          const schoolsWithDistricts = schoolsData.map(school => ({
            ...school,
            district_name: districtsData.find(d => d.id === school.district_id)?.name || "Unknown District"
          }));

          // Sort by name and district
          schoolsWithDistricts.sort((a, b) => {
            const nameCompare = a.name.localeCompare(b.name);
            if (nameCompare !== 0) return nameCompare;
            return (a.district_name || "").localeCompare(b.district_name || "");
          });

          setSchools(schoolsWithDistricts);
        }
      }
    }
    fetchData();
  }, []);

  // Get unique values for filters, ensuring we don't have null values
  const states = Array.from(new Set(people.map(p => p.state_work).filter((s): s is string => s !== null))).sort();
  const roles = Array.from(new Set(people.map(p => p.role_profile).filter((r): r is string => r !== null))).sort();
  const contentAreas = Array.from(new Set(
    people
      .map(p => p.content_area)
      .filter((c): c is string => c !== null)
      .flatMap(c => c.split(',').map(area => area.trim()))
      .filter(area => area.length > 0)
  )).sort();
  const gradeLevels = Array.from(new Set(people.map(p => p.sy2024_25_grade_level).filter((g): g is string => g !== null))).sort();

  // Update selected people based on filters and table selection
  useEffect(() => {
    const hasActiveFilters = 
      selectedSchools.length > 0 ||
      selectedDistricts.length > 0 ||
      selectedStates.length > 0 ||
      selectedRoles.length > 0 ||
      selectedContentAreas.length > 0 ||
      selectedGradeLevels.length > 0;

    // Only apply filtering if there are active filters
    const filteredPeople = hasActiveFilters ? people.filter((person) => {
      const matchesSchool = selectedSchools.length === 0 || (person.school_id && selectedSchools.includes(person.school_id));
      const matchesDistrict = selectedDistricts.length === 0 || (person.district_id && selectedDistricts.includes(person.district_id));
      const matchesState = selectedStates.length === 0 || (person.state_work && selectedStates.includes(person.state_work));
      const matchesRole = selectedRoles.length === 0 || (person.role_profile && selectedRoles.includes(person.role_profile));
      const matchesContentArea = selectedContentAreas.length === 0 || 
        (person.content_area && selectedContentAreas.some(area => 
          person.content_area?.split(',').map(a => a.trim()).includes(area)
        ));
      const matchesGradeLevel = selectedGradeLevels.length === 0 || 
        (person.sy2024_25_grade_level && selectedGradeLevels.includes(person.sy2024_25_grade_level));

      return matchesSchool && matchesDistrict && matchesState && matchesRole && matchesContentArea && matchesGradeLevel;
    }) : [];

    // Get people selected from the table
    const selectedFromTable = people.filter((person) => tableRowSelection[person.id]);
    
    // Remove duplicates based on email using Map
    const uniquePeople = new Map<string, Person>();
    
    // Add filtered people first (only if there are active filters)
    if (hasActiveFilters) {
      filteredPeople.forEach(person => {
        if (person.email) {
          uniquePeople.set(person.email, person);
        }
      });
    }
    
    // Add table-selected people
    selectedFromTable.forEach(person => {
      if (person.email) {
        uniquePeople.set(person.email, person);
      }
    });
    
    const combinedPeople = Array.from(uniquePeople.values());
    
    setSelectedPeople(combinedPeople);
    onSelectionChange(combinedPeople);
  }, [
    selectedSchools,
    selectedDistricts,
    selectedStates,
    selectedRoles,
    selectedContentAreas,
    selectedGradeLevels,
    tableRowSelection,
    people,
  ]);

  // Handle initial selected people separately
  useEffect(() => {
    if (initialSelectedPeople.length > 0) {
      setSelectedPeople(prev => {
        // Remove duplicates based on email when adding initial people
        const newSelection = [...prev, ...initialSelectedPeople].reduce<Person[]>((acc, current) => {
          if (!current.email) return acc;
          
          const exists = acc.some(person => person.email === current.email);
          if (!exists) {
            return [...acc, current];
          }
          return acc;
        }, []);
        
        onSelectionChange(newSelection);
        return newSelection;
      });
    }
  }, [initialSelectedPeople]);

  const columns: MRT_ColumnDef<Person>[] = [
    {
      accessorKey: 'last_name',
      header: 'Last Name',
    },
    {
      accessorKey: 'first_name',
      header: 'First Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role_profile',
      header: 'Role',
    },
    {
      accessorKey: 'state_work',
      header: 'State',
    },
    {
      accessorKey: 'content_area',
      header: 'Content Areas',
    },
    {
      accessorKey: 'sy2024_25_grade_level',
      header: 'Grade Level',
    },
  ];

  const updateSelectedPeople = (newSelection: Record<number, boolean>) => {
    const selectedFromTable = people.filter((person) => newSelection[person.id]);
    const uniquePeople = new Map<string, Person>();
    
    selectedFromTable.forEach(person => {
      if (person.email) {
        uniquePeople.set(person.email, person);
      }
    });
    
    const selectedPeopleArray = Array.from(uniquePeople.values());
    setSelectedPeople(selectedPeopleArray);
    onSelectionChange(selectedPeopleArray);
  };

  return (
    <Box className="space-y-6">
      <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
          Select People by Groups
        </Typography>

        <Box className="space-y-3">
          <Accordion
            elevation={1}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 1,
              mb: 1,
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
              }}
            >
              <Typography>Schools ({selectedSchools.length} selected)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Schools</InputLabel>
                <Select
                  multiple
                  value={selectedSchools}
                  onChange={(e) => setSelectedSchools(e.target.value as number[])}
                  input={<OutlinedInput label="Select Schools" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id) => {
                        const school = schools.find((s) => s.id === id);
                        return (
                          <Chip
                            key={id}
                            label={school ? `${school.name} (${school.district_name})` : "Unknown School"}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {schools.map((school) => (
                    <MenuItem key={`${school.id}-${school.district_id}`} value={school.id}>
                      <Checkbox checked={selectedSchools.includes(school.id)} />
                      <ListItemText 
                        primary={school.name}
                        secondary={school.district_name}
                        primaryTypographyProps={{ style: { fontWeight: 500 } }}
                        secondaryTypographyProps={{ style: { fontSize: '0.8rem' } }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion
            elevation={1}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 1,
              mb: 1,
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
              }}
            >
              <Typography>Districts ({selectedDistricts.length} selected)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Districts</InputLabel>
                <Select
                  multiple
                  value={selectedDistricts}
                  onChange={(e) => setSelectedDistricts(e.target.value as number[])}
                  input={<OutlinedInput label="Select Districts" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id) => (
                        <Chip
                          key={id}
                          label={districts.find((d) => d.id === id)?.name}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id}>
                      <Checkbox checked={selectedDistricts.includes(district.id)} />
                      <ListItemText primary={district.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion
            elevation={1}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 1,
              mb: 1,
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
              }}
            >
              <Typography>States ({selectedStates.length} selected)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select States</InputLabel>
                <Select
                  multiple
                  value={selectedStates}
                  onChange={(e) => setSelectedStates(e.target.value as string[])}
                  input={<OutlinedInput label="Select States" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((state) => (
                        <Chip key={state} label={state} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>
                      <Checkbox checked={selectedStates.includes(state)} />
                      <ListItemText primary={state} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion
            elevation={1}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 1,
              mb: 1,
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
              }}
            >
              <Typography>Roles ({selectedRoles.length} selected)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Roles</InputLabel>
                <Select
                  multiple
                  value={selectedRoles}
                  onChange={(e) => setSelectedRoles(e.target.value as string[])}
                  input={<OutlinedInput label="Select Roles" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((role) => (
                        <Chip key={role} label={role} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      <Checkbox checked={selectedRoles.includes(role)} />
                      <ListItemText primary={role} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion
            elevation={1}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 1,
              mb: 1,
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
              }}
            >
              <Typography>Content Areas ({selectedContentAreas.length} selected)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Content Areas</InputLabel>
                <Select
                  multiple
                  value={selectedContentAreas}
                  onChange={(e) => setSelectedContentAreas(e.target.value as string[])}
                  input={<OutlinedInput label="Select Content Areas" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((area) => (
                        <Chip key={area} label={area} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {contentAreas.map((area) => (
                    <MenuItem key={area} value={area}>
                      <Checkbox checked={selectedContentAreas.includes(area)} />
                      <ListItemText primary={area} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion
            elevation={1}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 1,
              mb: 1,
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
              }}
            >
              <Typography>Grade Levels ({selectedGradeLevels.length} selected)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Grade Levels</InputLabel>
                <Select
                  multiple
                  value={selectedGradeLevels}
                  onChange={(e) => setSelectedGradeLevels(e.target.value as string[])}
                  input={<OutlinedInput label="Select Grade Levels" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((grade) => (
                        <Chip key={grade} label={grade} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {gradeLevels.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      <Checkbox checked={selectedGradeLevels.includes(grade)} />
                      <ListItemText primary={grade} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
          Search and Select Individual People
        </Typography>

        <Box sx={{ backgroundColor: 'white', borderRadius: 1, overflow: 'hidden' }}>
          <MaterialReactTable
            columns={columns}
            data={people}
            enableRowSelection
            enableColumnFilters
            enableGlobalFilter
            enablePagination
            muiTableBodyRowProps={({ row }) => ({
              selected: tableRowSelection[row.original.id] || false,
              sx: { cursor: 'default' }
            })}
            onRowSelectionChange={(updaterOrValue) => {
              let newSelection: Record<number, boolean> = {};
              if (typeof updaterOrValue === 'function') {
                const selectedRows = updaterOrValue(tableRowSelection);
                newSelection = selectedRows;
              } else {
                newSelection = updaterOrValue;
              }
              setTableRowSelection(newSelection);
              updateSelectedPeople(newSelection);
            }}
            state={{ rowSelection: tableRowSelection }}
            initialState={{
              density: 'compact',
              pagination: { pageSize: 5, pageIndex: 0 },
              columnVisibility: { email: false },
            }}
            getRowId={(row) => row.id.toString()}
            muiTablePaperProps={{
              elevation: 1,
              sx: {
                borderRadius: 1,
              }
            }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            Selected People: {selectedPeople.length}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedPeople.slice(0, 5).map((person) => (
              <Chip
                key={person.id}
                label={`${person.first_name} ${person.last_name}`}
                size="small"
                onDelete={() => {
                  const newSelection = {
                    ...tableRowSelection,
                    [person.id]: false
                  };
                  setTableRowSelection(newSelection);
                  updateSelectedPeople(newSelection);
                }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(0, 0, 0, 0.26)',
                    '&:hover': {
                      color: 'rgba(0, 0, 0, 0.4)',
                    },
                  },
                }}
              />
            ))}
            {selectedPeople.length > 5 && (
              <Chip
                label={`+${selectedPeople.length - 5} more`}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: 'white' }}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 