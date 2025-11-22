import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';

const BANGKOK_TZ = 'Asia/Bangkok';

// Helper to safely create Date object from SQL timestamp, treating it as Bangkok time
export function sqlTimestampToDate(value: string): Date {
  // Convert SQL format to ISO format: "2025-02-20 19:00:00" → "2025-02-20T19:00:00"
  const isoFormat = value.includes(" ") && !value.includes("T") 
    ? value.replace(" ", "T") 
    : value;
  
  // Parse as Bangkok time and convert to UTC Date object
  // This ensures consistent behavior regardless of client timezone
  return fromZonedTime(isoFormat, BANGKOK_TZ);
}

// Helper to format a Date object as Bangkok time for display
export function formatBangkokTime(date: Date, formatStr: string = "yyyy-MM-dd HH:mm:ss"): string {
  return formatInTimeZone(date, BANGKOK_TZ, formatStr);
}

// Helper to get current time in Bangkok
export function getBangkokNow(): Date {
  return toZonedTime(new Date(), BANGKOK_TZ);
}

// Helper to convert SQL timestamp to datetime-local format
export function sqlTimestampToDatetimeLocal(value: string): string {
  return value.replace(" ", "T").slice(0, 16); // "2025-02-20 19:00:00" → "2025-02-20T19:00"
}

// Helper to convert datetime-local to SQL timestamp format
export function datetimeLocalToSql(value: string): string {
  const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!pattern.test(value)) {
    throw new Error("วันที่และเวลาไม่ถูกต้อง");
  }
  return value.replace("T", " ") + ":00"; // "2025-02-20T19:00" → "2025-02-20 19:00:00"
}
