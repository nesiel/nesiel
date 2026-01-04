import { Database, Student, PRICING } from './types';
import * as XLSX from 'xlsx';

export const parseExcel = (file: File): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);

        const newDb: Database = {};

        rows.forEach((row) => {
          const name = row['שם התלמיד'];
          if (!name) return;

          // Initialize student if not exists
          if (!newDb[name]) {
            newDb[name] = { name, total: 0, logs: [] };
          }

          const student = newDb[name];

          // Iterate columns
          Object.keys(row).forEach((col) => {
            if (!col.includes("-")) return; // Expect format: Subject - Teacher

            const parts = col.split("-");
            const sub = parts[0].trim();
            const teach = parts.length > 1 ? parts[1].trim() : "";
            const cellValue = String(row[col] || "");

            // Check against pricing keys
            Object.keys(PRICING).forEach((key) => {
              // Regex to match "ActionName...: Count"
              // Escape special characters in key just in case
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(`${escapedKey}.*?:\\s*(\\d+)`, 'g');
              
              let m;
              while ((m = regex.exec(cellValue)) !== null) {
                const count = parseInt(m[1], 10);
                const score = count * PRICING[key];
                
                // Add to total
                student.total += score;

                // Create log display name
                let actionName = key;
                if (cellValue.includes("למהלך") && key === "הפרעה") {
                  actionName += " למהלך";
                }

                student.logs.push({
                  sub,
                  teach,
                  k: actionName,
                  c: count,
                  s: score
                });
              }
            });
          });
        });

        resolve(newDb);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};
