const baseUrl = "http://localhost:4000"; // change if needed

const yearSelect = document.getElementById("year-select");
const refreshBtn = document.getElementById("refresh-btn");
const downloadPdfBtn = document.getElementById("download-pdf-btn");
const reportTbody = document.querySelector("#report-table tbody");
const yearTotalEl = document.getElementById("year-total");
const totalYearEl = document.getElementById("total-year");
const totalCountEl = document.getElementById("total-count");

let expenses = [];

// ---- Helpers ----
function formatRupee(num) {
  return "₹" + Number(num || 0).toLocaleString("en-IN");
}

// ---- Fetch data from API ----
async function fetchExpenses() {
  try {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${baseUrl}/expenses?limit=200`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch expenses");
    const data = await res.json();
    expenses = data.rows || [];
    console.log("Fetched Expenses:", expenses);
    return expenses;
  } catch (err) {
    console.error(err);
    alert("Error fetching expenses");
  }
}

// ---- Populate Year Dropdown ----
function populateYearOptions() {
  const years = new Set();
  expenses.forEach((exp) => {
    const d = new Date(exp.createdAt);
    if (!isNaN(d)) years.add(d.getFullYear());
  });

  yearSelect.innerHTML = "";
  Array.from(years)
    .sort((a, b) => b - a)
    .forEach((y) => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });

  // If at least one year present, show report for latest year
  if (years.size) {
    yearSelect.value = Array.from(years).sort((a, b) => b - a)[0];
    renderReport(yearSelect.value);
  }
}

// ---- Aggregate data month-wise ----
function aggregateByMonth(selectedYear) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: 0,
  }));
  let count = 0;

  expenses.forEach((exp) => {
    const d = new Date(exp.createdAt);
    if (isNaN(d)) return;
    const y = d.getFullYear();
    if (Number(selectedYear) === y) {
      const m = d.getMonth(); // 0..11
      months[m].total += Number(exp.expenseAmount || 0);
      count++;
    }
  });
  return { months, count };
}

// ---- Render report table ----
function renderReport(selectedYear) {
  const { months, count } = aggregateByMonth(selectedYear);
  reportTbody.innerHTML = "";

  let sum = 0;
  months.forEach((m) => {
    const tr = document.createElement("tr");

    const tdMonth = document.createElement("td");
    tdMonth.textContent = new Date(0, m.month - 1).toLocaleString("en", {
      month: "long",
    });

    const tdAmt = document.createElement("td");
    tdAmt.textContent = formatRupee(m.total);

    tr.appendChild(tdMonth);
    tr.appendChild(tdAmt);
    reportTbody.appendChild(tr);
    sum += m.total;
  });

  yearTotalEl.textContent = formatRupee(sum);
  totalYearEl.textContent = `Total for ${selectedYear}: ${formatRupee(sum)}`;
  totalCountEl.textContent = `Transactions: ${count}`;
}

// ---- PDF Download ----
function downloadPDF() {
  const element = document.getElementById("report-table-section");
  if (window.html2pdf) {
    html2pdf().from(element).save(`Expense-Report-${yearSelect.value}.pdf`);
  } else {
    window.print();
  }
}

// ---- Init ----
async function init() {
  const user = JSON.parse(localStorage.getItem("user-details"));
  const token = localStorage.getItem("jwt");
  if (!user?.id || !token) {
    alert("User not found. Please log in again.");
    return;
  }
  
  await fetchExpenses();
  populateYearOptions();

  refreshBtn.addEventListener("click", () => {
    renderReport(yearSelect.value);
  });

  yearSelect.addEventListener("change", () => {
    renderReport(yearSelect.value);
  });
}

if(downloadPdfBtn){
    downloadPdfBtn.addEventListener("click", downloadPDF);
}

document.addEventListener("DOMContentLoaded", init);
