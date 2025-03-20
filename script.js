// Google Sheets URL (replace with your published CSV link)
const googleSheetsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRfz9OLWJbv8cMNwPRtslyCZQDuOfGLx6DucdkR8iuLcmnaHuorZy7-x0RtraRPZpVO8GI0zX2xX31M/pub?output=csv";
// https://docs.google.com/spreadsheets/d/e/2PACX-1vQKesIbHwrGaoK1bJiApz1RzQi31j4abfMdnfeuDWXLPPeaKrhPcb1wbOs0lni7rw/pub?output=csv

let allData = []; // Store all data fetched from Google Sheets
let filteredData = []; // Store filtered data
let resultsPerPage = 10; // Default number of results per page

// Fetch data from Google Sheets
async function fetchData() {
  try {
    const response = await fetch(googleSheetsUrl);
    const csvData = await response.text();
    allData = parseCSV(csvData);
    setupSearch(allData); // Enable search functionality
    setupFilter(allData); // Enable filter functionality
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Parse CSV data into an array of objects
function parseCSV(csv) {
  const rows = csv.split("\n");
  const headers = rows[0].split(",");
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(",");
    if (row.length === headers.length) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j].trim()] = row[j].trim();
      }
      data.push(obj);
    }
  }

  return data;
}

// Display results in the grid
function displayResults(results) {
  const resultsGrid = document.getElementById("results-grid");
  resultsGrid.innerHTML = ""; // Clear previous results

  if (results.length === 0) {
    resultsGrid.innerHTML = `<p class="no-results">ไม่พบผลลัพธ์ที่ค้นหา</p>`;
    return;
  }

  // Limit results based on the selected number of results per page
  const limitedResults = results.slice(0, resultsPerPage);

  limitedResults.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item["ยศ ชื่อ ชื่อสกุล"]}</h3>
      <p><strong>ตำแหน่ง/สังกัด:</strong> ${item["ตำแหน่ง/สังกัด"]}</p>
      <p><strong>พื้นที่/ความรับผิดชอบ:</strong> ${item["พื้นที่/ความรับผิดชอบ"]}</p>
      <p><strong>ที่อยู่หน่วยงาน:</strong> ${item["ที่อยู่หน่วยงาน"]}</p>
      <p><strong>หมายเลขโทรศัพท์:</strong> ${item["หมายเลขโทรศัพท์"]}</p>
      <div class="phone-actions">
        <button onclick="callNumber('${item["หมายเลขโทรศัพท์"]}')">
          <img src="assets/phone-icon.png" alt="Call">
          โทร
        </button>
        <button onclick="copyNumber('${item["หมายเลขโทรศัพท์"]}')">
          <img src="assets/copy-icon.png" alt="Copy">
          คัดลอก
        </button>
      </div>
    `;
    resultsGrid.appendChild(card);
  });
}

// Call phone number
function callNumber(phone) {
  window.location.href = `tel:${phone}`;
}

// Copy phone number to clipboard
function copyNumber(phone) {
  navigator.clipboard.writeText(phone).then(() => {
    alert("คัดลอกหมายเลขโทรศัพท์เรียบร้อยแล้ว!");
  });
}

// Enable search functionality (for single result)
function setupSearch(data) {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission
    const query = searchInput.value.toLowerCase();

    // Find the first match
    const result = data.find((item) => {
      return (
        item["ยศ ชื่อ ชื่อสกุล"].toLowerCase().includes(query) ||
        item["ตำแหน่ง/สังกัด"].toLowerCase().includes(query) ||
        item["พื้นที่/ความรับผิดชอบ"].toLowerCase().includes(query) ||
        item["ที่อยู่หน่วยงาน"].toLowerCase().includes(query) ||
        item["หมายเลขโทรศัพท์"].toLowerCase().includes(query)
      );
    });

    // Display only the first match (or a "No results" message)
    if (result) {
      displayResults([result]); // Pass the single result as an array
    } else {
      displayResults([]); // Clear results if no match is found
      alert("No matching results found.");
    }
  });
}

// Enable filter functionality (for ตำแหน่ง/สังกัด)
function setupFilter(data) {
  const filterForm = document.getElementById("filter-form");
  const filterInput = document.getElementById("filter-input");

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission
    const query = filterInput.value.toLowerCase();

    // Filter data based on the ตำแหน่ง/สังกัด column
    filteredData = data.filter((item) => {
      return item["ตำแหน่ง/สังกัด"].toLowerCase().includes(query);
    });

    // Display the filtered results
    displayResults(filteredData);
  });
}

// Update results per page
document.getElementById("results-per-page").addEventListener("change", (e) => {
  resultsPerPage = parseInt(e.target.value);
  displayResults(filteredData); // Re-display results with the new limit
});

// Fetch data when the page loads
fetchData();