// === Supabase Configuration ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://xfasfldsoqiciqnfbauf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYXNmbGRzb3FpY2lxbmZiYXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzA1MjAsImV4cCI6MjA2MDQ0NjUyMH0.egaYl_7zGqtGwNtHpsIRYVT394UfOK2VZOIQMRIC7Ks"
);

let currentUserId = null;
let currentProfileId = null;
const contentArea = document.getElementById("dashboard-content");

// === Session & Auth Guard Initialization ===
async function initDashboard() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session || sessionError) {
    console.warn("\u274C No valid session. Redirecting...");
    await supabase.auth.signOut();
    return (window.location.href = "login");
  }

  currentUserId = session.user.id;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", currentUserId)
    .single();

  if (!profile || profileErr) {
    console.error("\u274C Failed to fetch profile:", profileErr);
    await supabase.auth.signOut();
    return (window.location.href = "login");
  }

  currentProfileId = profile.id;
  console.log("\u2705 Authenticated:", currentUserId, "| Profile ID:", currentProfileId);

  loadHome(); // Default load
}

// === Logout Button Handler ===
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login";
  });
}

// === Navigation Buttons ===
// document.getElementById("homeBtn").addEventListener("click", loadHome);
// document.getElementById("makeRequestBtn").addEventListener("click", loadRequestForm);
// document.getElementById("historyBtn").addEventListener("click", loadRequestHistory);
document.addEventListener("DOMContentLoaded", () => {
  const homeBtn = document.getElementById("homeBtn");
  const makeRequestBtn = document.getElementById("makeRequestBtn");
  const makeDonationBtn = document.getElementById("makeDonationBtn");
  const historyBtn = document.getElementById("historyBtn");
  const donationHistoryBtn = document.getElementById("donationHistoryBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (homeBtn) homeBtn.addEventListener("click", loadHome);
  if (makeRequestBtn) makeRequestBtn.addEventListener("click", loadRequestForm);
  if (makeDonationBtn) makeDonationBtn.addEventListener("click", loadDonationForm);
  if (historyBtn) historyBtn.addEventListener("click", loadRequestHistory);
  if (donationHistoryBtn) donationHistoryBtn.addEventListener("click", loadDonationHistory);
  if (logoutBtn) logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login";
  });

  // Init dashboard after bindings
  initDashboard();
});




// === Home View ===
async function loadHome() {
  if (!currentProfileId) return window.location.href = "login";

  const { data, error } = await supabase
    .from("requests")
    .select("status")
    .eq("profile_id", currentProfileId);

  if (error || !data) {
    contentArea.innerHTML = `<h2>Error loading dashboard</h2>`;
    return;
  }

  const total = data.length;
  const pending = data.filter(r => r.status === "pending").length;
  const approved = data.filter(r => r.status === "approved").length;
  const rejected = data.filter(r => r.status === "rejected").length;

  contentArea.innerHTML = `
    <h2>Welcome to Your Dashboard 🩸</h2>
    <div class="dashboard-cards">
      <div class="card card-total">
        <div class="card-top">
          <h3><i class="fas fa-list"></i> Request Made</h3>
          <button class="refresh-btn" onclick="loadHome()"><i class="fas fa-sync-alt"></i></button>
        </div>
        <p>${total}</p>
      </div>
      <div class="card card-pending">
        <div class="card-top">
          <h3><i class="fas fa-clock"></i> Pending Request</h3>
          <button class="refresh-btn" onclick="loadHome()"><i class="fas fa-sync-alt"></i></button>
        </div>
        <p>${pending}</p>
      </div>
      <div class="card card-approved">
        <div class="card-top">
          <h3><i class="fas fa-check-circle"></i> Approved Request</h3>
          <button class="refresh-btn" onclick="loadHome()"><i class="fas fa-sync-alt"></i></button>
        </div>
        <p>${approved}</p>
      </div>
      <div class="card card-rejected">
        <div class="card-top">
          <h3><i class="fas fa-times-circle"></i> Rejected Request</h3>
          <button class="refresh-btn" onclick="loadHome()"><i class="fas fa-sync-alt"></i></button>
        </div>
        <p>${rejected}</p>
      </div>
    </div>
  `;
}

// === Request Form View ===
function loadRequestForm() {
  contentArea.innerHTML = `
    <h2>Make a Blood Request</h2>
    <form id="requestForm">
      <input type="text" placeholder="Reason for request" id="reason" required /><br />
      <select id="blood_group" required>
        <option value="" disabled selected>Select Blood Group</option>
        <option value="A+">A+</option><option value="B+">B+</option>
        <option value="O+">O+</option><option value="AB+">AB+</option>
        <option value="A-">A-</option><option value="B-">B-</option>
        <option value="O-">O-</option><option value="AB-">AB-</option>
      </select><br />
      <input type="date" id="when" required /><br />
      <input type="number" placeholder="Unit (ml)" id="unit" required /><br />
      <button type="submit">Submit Request</button>
    </form>
  `;

  document.getElementById("requestForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("Session expired. Please log in again.");
      return (window.location.href = "login");
    }

    // ✅ Re-fetch the profile ID before making the request
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", currentUserId)
      .single();

    if (profileErr || !profile) {
      console.error("❌ Failed to fetch profile for request:", profileErr);
      alert("❌ Could not fetch your profile. Please try logging in again.");
      return;
    }

    const requestData = {
      profile_id: profile.id,
      reason: document.getElementById("reason").value,
      blood_group: document.getElementById("blood_group").value,
      unit: parseInt(document.getElementById("unit").value),
      date_needed: document.getElementById("when").value,
      status: "pending"
    };

    console.log("📄 Submitting:", requestData);

    const { error } = await supabase.from("requests").insert([requestData]);

    if (error) {
      console.error("❌ Request insert failed:", error);
      alert("❌ Failed to submit request.");
    } else {
      alert("✅ Request submitted!");
      document.getElementById("requestForm").reset();
      loadRequestHistory();
    }
  });
}


// === Request History View ===
async function loadRequestHistory() {
  if (!currentUserId || !currentProfileId) {
    alert("Session expired. Please login again.");
    return (window.location.href = "login");
  }

  contentArea.innerHTML = `
    <h2>Your Request History</h2>
    <table class="styled-table">
      <thead>
        <tr>
          <th>Reason</th>
          <th>Blood Group</th>
          <th>Units</th>
          <th>Needed By</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="history-table-body">
        <tr><td colspan="5">Loading...</td></tr>
      </tbody>
    </table>
  `;

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("profile_id", currentProfileId)
    .order("created_at", { ascending: false });

  const body = document.getElementById("history-table-body");

  if (error || !data) {
    body.innerHTML = `<tr><td colspan="5">Error loading request history.</td></tr>`;
    return;
  }

  if (data.length === 0) {
    body.innerHTML = `<tr><td colspan="5">No blood requests found.</td></tr>`;
    return;
  }

  body.innerHTML = "";
  data.forEach((r) => {
    body.innerHTML += `
      <tr>
        <td>${r.reason}</td>
        <td>${r.blood_group}</td>
        <td>${r.unit} ml</td>
        <td>${r.date_needed}</td>
        <td><span class="status ${r.status}">${r.status}</span></td>
      </tr>
    `;
  });
}

// === On DOM Ready ===
window.addEventListener("DOMContentLoaded", initDashboard);



function loadDonationForm() {
  contentArea.innerHTML = `
    <h2>Make a Donation</h2>
    <form id="donationForm">
      <select id="donation_blood_group" required>
        <option value="" disabled selected>Select Blood Group</option>
        <option value="A+">A+</option><option value="B+">B+</option>
        <option value="O+">O+</option><option value="AB+">AB+</option>
        <option value="A-">A-</option><option value="B-">B-</option>
        <option value="O-">O-</option><option value="AB-">AB-</option>
      </select><br />
      <input type="date" id="donation_date" required /><br />
      <input type="number" placeholder="Units (ml)" id="donation_units" required /><br />
      <button type="submit">Submit Donation</button>
    </form>
  `;

  document.getElementById("donationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const donationData = {
      donor_id: currentProfileId,
      donation_date: document.getElementById("donation_date").value,
      blood_group: document.getElementById("donation_blood_group").value,
      units: parseInt(document.getElementById("donation_units").value),
      status: "pending"
    };

    const { error } = await supabase.from("donations").insert([donationData]);

    if (error) {
      console.error("❌ Donation insert failed:", error);
      alert("❌ Failed to submit donation.");
    } else {
      alert("✅ Donation submitted!");
      document.getElementById("donationForm").reset();
      loadDonationHistory(); // go to history view after submit
    }
  });
}



async function loadDonationHistory() {
  contentArea.innerHTML = `
    <h2>Your Donation History</h2>
    <table class="styled-table">
      <thead>
        <tr>
          <th>Blood Group</th>
          <th>Units</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="donation-history-body">
        <tr><td colspan="4">Loading...</td></tr>
      </tbody>
    </table>
  `;

  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("donor_id", currentProfileId)
    .order("donation_date", { ascending: false });

  const body = document.getElementById("donation-history-body");

  if (error || !data) {
    body.innerHTML = `<tr><td colspan="4">Error loading donation history.</td></tr>`;
    return;
  }

  if (data.length === 0) {
    body.innerHTML = `<tr><td colspan="4">No donations found.</td></tr>`;
    return;
  }

  body.innerHTML = "";
  data.forEach((d) => {
    body.innerHTML += `
      <tr>
        <td>${d.blood_group}</td>
        <td>${d.units} ml</td>
        <td>${d.donation_date}</td>
        <td><span class="status ${d.status}">${d.status}</span></td>
      </tr>
    `;
  });
}


