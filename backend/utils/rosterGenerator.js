const { format, addDays, parseISO } = require('date-fns');

// Helper to format employee name
const formatEmpName = (emp) => `${emp.rank.toLowerCase()} ${emp.name} (${emp.battery})`;

const isOnLeave = (date, employee) => {
  return employee.leaves?.some(leave => {
    try {
      return format(parseISO(leave), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    } catch {
      return false;
    }
  });
};

function generateRosterData(employees, startDateStr, endDateStr) {
  const startDate = parseISO(startDateStr);
  const endDate = parseISO(endDateStr);
  const days = [];

  // OOD pool (Cpl and above)
  const oodPool = employees.filter(e => ['Cpl', 'Sgt', 'SSgt', 'GySgt'].includes(e.rank));
  // A Duty pool (LCpl only)
  const aDutyPool = employees.filter(e => e.rank === 'LCpl');

  let oodIndex = 0;
  let aDutyIndex = 0;

  for (let i = 0; ; i++) {
    const current = addDays(startDate, i);
    if (current > endDate) break;

    // Skip employees on leave
    let ood = null;
    let aDuty = null;

    // Assign OOD (Cpl and above, weekend rule applies)
    let attempts = 0;
    while (oodPool.length > 0 && attempts < oodPool.length) {
      const candidate = oodPool[oodIndex % oodPool.length];
      oodIndex++;
      attempts++;
      if (!isOnLeave(current, candidate)) {
        ood = candidate;
        break;
      }
    }

    // Assign A Duty (LCpls only)
    attempts = 0;
    while (aDutyPool.length > 0 && attempts < aDutyPool.length) {
      const candidate = aDutyPool[aDutyIndex % aDutyPool.length];
      aDutyIndex++;
      attempts++;
      if (!isOnLeave(current, candidate)) {
        aDuty = candidate;
        break;
      }
    }

    const weekday = format(current, 'EEEE');
    const isWeekend = ['Friday', 'Saturday', 'Sunday'].includes(weekday);

    // Format the row data for the table
    const row = {
      date: format(current, 'yyyy-MM-dd'),
      day: weekday,
      ood: ood ? formatEmpName(ood) : '',
      oodPhone: ood ? ood.phone : '',  // Use OOD phone number
      oodComment: ood ? ['SSgt', 'GySgt'].includes(ood.rank) ? 'SNCO+' : 'SGT+' : '',
      aDuty: aDuty ? formatEmpName(aDuty) : '',
      aDutyPhone: aDuty ? aDuty.phone : '',  // Use A Duty phone number
      aDutyComment: aDuty ? 'CPL and below' : '',
      isWeekend,
    };

    days.push(row);
  }

  return days;
}

module.exports = generateRosterData;