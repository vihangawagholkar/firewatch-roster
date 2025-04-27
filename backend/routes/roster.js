const express = require('express');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Draft = require('../models/Drafts');
const ExcelJS = require('exceljs');
const draftsFile = path.join(__dirname, '../data/drafts.json');
const generateRosterData = require('../utils/rosterGenerator');

router.post('/preview', async (req, res) => {
  try {
    const { employees, startDate, endDate, oodPhone, aDutyPhone } = req.body;
    console.log('Received preview data:', req.body); 
    const previewData = generateRosterData(employees, startDate, endDate, oodPhone, aDutyPhone); // This returns a JSON-friendly version
    res.json(previewData);
  } catch (err) {
    console.error('Error generating preview:', err);
    res.status(500).json({ error: 'Error generating preview data' });
  }
});

// Helper to read draft data
function readDrafts() {
  if (!fs.existsSync(draftsFile)) return {};
  const data = fs.readFileSync(draftsFile);
  return JSON.parse(data);
}

// Helper to save draft data
function saveDrafts(drafts) {
  fs.writeFileSync(draftsFile, JSON.stringify(drafts, null, 2));
}

// Save Draft (generate UUID if not provided)
router.post('/save-draft', async (req, res) => {
  const { userId, employees, startDate, endDate } = req.body;

  if (!employees || employees.length === 0) {
    return res.status(400).send("No employees data provided.");
  }

  const id = userId || uuidv4();

  try {
    const existing = await Draft.findOne({ userId: id });

    if (existing) {
      existing.employees = employees;
      existing.startDate = startDate;
      existing.endDate = endDate;
      await existing.save();
    } else {
      await Draft.create({ userId: id, employees, startDate, endDate });
    }

    res.send({ message: 'Draft saved successfully', userId: id });
  } catch (err) {
    console.error('Error saving draft:', err);
    res.status(500).send('Error saving draft');
  }
});

// Load Draft
router.get('/load-draft/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const draft = await Draft.findOne({ userId });

    if (!draft) {
      return res.status(404).send('No draft found.');
    }

    res.send(draft);
  } catch (err) {
    console.error('Error loading draft:', err);
    res.status(500).send('Error loading draft');
  }
});

// Helper function to check if the date is a weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Function to get rank level
function getRankLevel(rank) {
  const r = rank.toLowerCase();
  if (["ssgt", "msgt", "gysgt"].includes(r)) return "snco";
  if (["sgt"].includes(r)) return "sgt";
  if (["cpl"].includes(r)) return "cpl";
  return "lcpl";
}

// Function to filter employees based on availability (leave status)
function filterByAvailability(employees, date) {
    const iso = date.toISOString().split('T')[0];
    const weekend = isWeekend(date);
  
    const available = employees.filter(e => !e.leaves?.includes(iso));
    const oodCandidates = available.filter(e => {
      const r = getRankLevel(e.rank);
      return (
        (!weekend && (r === 'sgt' || r === 'cpl')) || // Weekdays: sgt or cpl
        (weekend && (r === 'sgt' || r === 'snco'))    // Weekends: sgt or snco
      );
    });
  
    // Weekend fallback: if no Sgt or SNCO, use CPLs instead
    let finalOodCandidates = [...oodCandidates];
    if (weekend && oodCandidates.length === 0) {
      finalOodCandidates = available.filter(e => getRankLevel(e.rank) === 'cpl');
    }
  
    const aDutyCandidates = available.filter(e => getRankLevel(e.rank) === 'lcpl');
  
    return {
      oodCandidates: finalOodCandidates,
      aDutyCandidates
    };
  }

// Generate the roster and create the Excel file
router.post('/generate', async (req, res) => {
  const { employees, startDate, endDate } = req.body;

  if (!employees || employees.length === 0) {
    return res.status(400).send("No employee data provided.");
  }

  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0);

  const dateList = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dateList.push(new Date(d));
  }

  const roster = [];
  let oodIndex = 0;
  let aDutyIndex = 0;

  dateList.forEach(date => {
    const iso = date.toISOString().split('T')[0];
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });

    const { oodCandidates, aDutyCandidates } = filterByAvailability(employees, date);

    const ood = oodCandidates.length ? oodCandidates[oodIndex % oodCandidates.length] : null;
    const aDuty = aDutyCandidates.length ? aDutyCandidates[aDutyIndex % aDutyCandidates.length] : null;

    if (ood) oodIndex++;
    if (aDuty) aDutyIndex++;

    // Add OOD and A Duty information to the roster, including phone numbers
    roster.push({
      Date: iso,
      Day: day,
      "OOD / Battery": ood ? `${ood.rank.toLowerCase()} ${ood.name.split(' ').pop()} (${ood.battery})` : "None",
      "OOD Phone": ood?.phone || '',  // Get OOD phone
      "OOD Comments": ood ? (["ssgt", "msgt", "gysgt"].includes(ood.rank.toLowerCase()) ? "SNCO+" : "SGT+") : '',
      "A Duty / Battery": aDuty ? `${aDuty.rank.toLowerCase()} ${aDuty.name.split(' ').pop()} (${aDuty.battery})` : "None",
      "A Duty Phone": aDuty?.phone || '',  // Get A Duty phone
      "A Duty Comments": aDuty ? "CPL and below" : ''
    });
  });

  // Create Excel file with the generated data
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Roster');

  // Define columns for the Excel sheet
  sheet.columns = [
    { header: 'Date', key: 'Date', width: 12 },
    { header: 'Day', key: 'Day', width: 12 },
    { header: 'OOD / Battery', key: 'OOD / Battery', width: 20 },
    { header: 'OOD Phone', key: 'OOD Phone', width: 15 },
    { header: 'OOD Comments', key: 'OOD Comments', width: 15 },
    { header: 'A Duty / Battery', key: 'A Duty / Battery', width: 20 },
    { header: 'A Duty Phone', key: 'A Duty Phone', width: 15 },
    { header: 'A Duty Comments', key: 'A Duty Comments', width: 15 },
  ];

  // Add rows for each date in the roster
  roster.forEach(row => {
    const newRow = sheet.addRow(row);
    // Apply weekend highlight color
    if (["Friday", "Saturday", "Sunday"].includes(row.Day)) {
      newRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' },
        };
      });
    }
  });

  // Save the Excel file
  const outputPath = path.join(__dirname, '../output/Shift_Roster.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  // Send the file to the user
  res.download(outputPath, 'Shift_Roster.xlsx', err => {
    if (err) {
      console.error("Download error:", err);
      if (!res.headersSent) {
        res.status(500).send("Error sending file.");
      }
    }

    setTimeout(() => {
      fs.unlink(outputPath, () => {});
    }, 5000);
  });
});

module.exports = router;