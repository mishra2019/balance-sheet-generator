const fs = require("fs");

// Read input JSON file
const input = JSON.parse(fs.readFileSync("data/1-input.json", "utf8"));

// Initialize an object to store the monthly balances
const balanceSheet = {};
// Calculate balance for each month
input.revenueData.forEach((revenueEntry) => {
  const date = new Date(revenueEntry.startDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  if (!balanceSheet[year]) {
    balanceSheet[year] = {};
  }

  if (!balanceSheet[year][month]) {
    balanceSheet[year][month] = 0;
  }

  balanceSheet[year][month] += revenueEntry.amount;
});

input.expenseData.forEach((expenseEntry) => {
  const date = new Date(expenseEntry.startDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  if (!balanceSheet[year]) {
    balanceSheet[year] = {};
  }

  if (!balanceSheet[year][month]) {
    balanceSheet[year][month] = 0;
  }

  balanceSheet[year][month] -= expenseEntry.amount;
});

// Prepare balance sheet for output
const output = [];
for (const year in balanceSheet) {
  for (const month in balanceSheet[year]) {
    const amount = balanceSheet[year][month];
    const timestamp = new Date(Date.UTC(year, month, 1));
    output.push({ amount, startDate: timestamp.toISOString() });
  }
}

// Sort the balance sheet by timestamp in ascending order
output.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
const finalOutput = [];
// Inserting the missing month
let prevMonth = new Date(output[0].startDate).getUTCMonth() + 1;
let prevYear = new Date(output[0].startDate).getUTCFullYear();
finalOutput.push(output[0]);
for (let i = 1; i < output.length; i++) {
  const currMonth = new Date(output[i].startDate).getUTCMonth() + 1;
  const currYear = new Date(output[i].startDate).getUTCFullYear();
  if (prevYear === currYear) {
    while (currMonth !== prevMonth + 1) {
      const timestamp = new Date(Date.UTC(currYear, prevMonth, 1));
      const amount = 0;
      finalOutput.push({ amount, startDate: timestamp.toISOString() });
      prevMonth += 1;
    }
    finalOutput.push(output[i]);
  } else {
    // inserting missing months between two years
    while (prevYear < currYear) {
      while (prevMonth <= 12) {
        const timestamp = new Date(Date.UTC(prevYear, prevMonth, 1));
        const amount = 0;
        finalOutput.push({ amount, startDate: timestamp.toISOString() });
        prevMonth += 1;
      }
      prevMonth = 1;
      prevYear += 1;
    }

    while (prevMonth < currMonth - 1) {
      const timestamp = new Date(Date.UTC(currYear, prevMonth, 1));
      const amount = 0;
      finalOutput.push({ amount, startDate: timestamp.toISOString() });
      prevMonth += 1;
    }
    finalOutput.push(output[i]);
  }
  prevMonth = currMonth;
  prevYear = currYear;
}
const finalBalance = { balance: finalOutput };
// Write output JSON file
fs.writeFileSync("output.json", JSON.stringify(finalBalance, null, 2));

// Print balance sheet to the console
console.log(finalBalance);
