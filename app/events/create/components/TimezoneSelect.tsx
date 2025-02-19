import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useEventFormContext } from "../event-form-provider";

export default function TimezoneSelect() {
  const { formData, updateFields } = useEventFormContext();
  return (
    <FormControl>
      <InputLabel id="timezone-label">Time Zone</InputLabel>
      <Select
        labelId="timezone-label"
        id="timezone-select"
        label="Time Zone"
        value={formData.timezone}
        onChange={(e) => updateFields({ timezone: e.target.value })}
      >
        <MenuItem value="-12:00">(GMT -12:00) Eniwetok, Kwajalein</MenuItem>
        <MenuItem value="-11:00">(GMT -11:00) Midway Island, Samoa</MenuItem>
        <MenuItem value="-10:00">(GMT -10:00) Hawaii</MenuItem>
        <MenuItem value="-09:50">(GMT -9:30) Taiohae</MenuItem>
        <MenuItem value="-09:00">(GMT -9:00) Alaska</MenuItem>
        <MenuItem value="-08:00">
          (GMT -8:00) Pacific Time (US &amp; Canada)
        </MenuItem>
        <MenuItem value="-07:00">
          (GMT -7:00) Mountain Time (US &amp; Canada)
        </MenuItem>
        <MenuItem value="-06:00">
          (GMT -6:00) Central Time (US &amp; Canada), Mexico City
        </MenuItem>
        <MenuItem value="-05:00">
          (GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima
        </MenuItem>
        <MenuItem value="-04:50">(GMT -4:30) Caracas</MenuItem>
        <MenuItem value="-04:00">
          (GMT -4:00) Atlantic Time (Canada), Caracas, La Paz
        </MenuItem>
        <MenuItem value="-03:50">(GMT -3:30) Newfoundland</MenuItem>
        <MenuItem value="-03:00">
          (GMT -3:00) Brazil, Buenos Aires, Georgetown
        </MenuItem>
        <MenuItem value="-02:00">(GMT -2:00) Mid-Atlantic</MenuItem>
        <MenuItem value="-01:00">
          (GMT -1:00) Azores, Cape Verde Islands
        </MenuItem>
        <MenuItem value="+00:00">
          (GMT) Western Europe Time, London, Lisbon, Casablanca
        </MenuItem>
        <MenuItem value="+01:00">
          (GMT +1:00) Brussels, Copenhagen, Madrid, Paris
        </MenuItem>
        <MenuItem value="+02:00">
          (GMT +2:00) Kaliningrad, South Africa
        </MenuItem>
        <MenuItem value="+03:00">
          (GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg
        </MenuItem>
        <MenuItem value="+03:50">(GMT +3:30) Tehran</MenuItem>
        <MenuItem value="+04:00">
          (GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi
        </MenuItem>
        <MenuItem value="+04:50">(GMT +4:30) Kabul</MenuItem>
        <MenuItem value="+05:00">
          (GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent
        </MenuItem>
        <MenuItem value="+05:50">
          (GMT +5:30) Bombay, Calcutta, Madras, New Delhi
        </MenuItem>
        <MenuItem value="+05:75">(GMT +5:45) Kathmandu, Pokhara</MenuItem>
        <MenuItem value="+06:00">(GMT +6:00) Almaty, Dhaka, Colombo</MenuItem>
        <MenuItem value="+06:50">(GMT +6:30) Yangon, Mandalay</MenuItem>
        <MenuItem value="+07:00">(GMT +7:00) Bangkok, Hanoi, Jakarta</MenuItem>
        <MenuItem value="+08:00">
          (GMT +8:00) Beijing, Perth, Singapore, Hong Kong
        </MenuItem>
        <MenuItem value="+08:75">(GMT +8:45) Eucla</MenuItem>
        <MenuItem value="+09:00">
          (GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk
        </MenuItem>
        <MenuItem value="+09:50">(GMT +9:30) Adelaide, Darwin</MenuItem>
        <MenuItem value="+10:00">
          (GMT +10:00) Eastern Australia, Guam, Vladivostok
        </MenuItem>
        <MenuItem value="+10:50">(GMT +10:30) Lord Howe Island</MenuItem>
        <MenuItem value="+11:00">
          (GMT +11:00) Magadan, Solomon Islands, New Caledonia
        </MenuItem>
        <MenuItem value="+11:50">(GMT +11:30) Norfolk Island</MenuItem>
        <MenuItem value="+12:00">
          (GMT +12:00) Auckland, Wellington, Fiji, Kamchatka
        </MenuItem>
        <MenuItem value="+12:75">(GMT +12:45) Chatham Islands</MenuItem>
        <MenuItem value="+13:00">(GMT +13:00) Apia, Nukualofa</MenuItem>
        <MenuItem value="+14:00">(GMT +14:00) Line Islands, Tokelau</MenuItem>
      </Select>
    </FormControl>
  );
}
