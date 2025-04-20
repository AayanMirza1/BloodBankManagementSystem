// === Supabase Configuration ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xfasfldsoqiciqnfbauf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYXNmbGRzb3FpY2lxbmZiYXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzA1MjAsImV4cCI6MjA2MDQ0NjUyMH0.egaYl_7zGqtGwNtHpsIRYVT394UfOK2VZOIQMRIC7Ks";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === Alert Box ===
function alertBox(message) {
  alert(message);
}

// === SIGNUP ===
const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
  
    const blood_group = document.querySelector('input[name="signupBloodGroup"]:checked')?.value || document.getElementById("signupBloodGroup").value;
    const city = document.getElementById("signupCity").value.trim();
    const last_donation = document.getElementById("signupLastDonation").value;
    const disease = document.getElementById("signupDisease").value.trim();
    const age = parseInt(document.getElementById("signupAge").value.trim());
    const gender = document.querySelector('input[name="signupGender"]:checked')?.value;
    const register_as = document.querySelector('input[name="signupRole"]:checked')?.value;
  
    if (!name || !email || !password || !blood_group || !city || !age || !gender || !register_as) {
      return alertBox("Please fill all required fields.");
    }
  
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

if (error || !data.user) throw new Error(error?.message || "Signup failed.");

const userId = data.user.id;
const profileId = crypto.randomUUID(); // ✅ important

const profile = {
  id: profileId,
  auth_user_id: userId,
  name,
  email,
  role: register_as,
  register_as,
  blood_group,
  city,
  last_donation: last_donation || null,
  disease: disease || null,
  age,
  gender,
};

const { error: insertError } = await supabase.from("profiles").insert([profile]);

if (insertError) {
  await supabase.auth.admin.deleteUser(userId);
  throw new Error("Signup failed: " + insertError.message);
}

  
      alertBox("🎉 Signup successful!");
      window.location.href = register_as === "donor" ? "donor-dashboard" : "user-dashboard";
    } catch (err) {
      alertBox("❌ " + err.message);
    }
  });
  
}

// === LOGIN ===
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) return alertBox("Please enter both email and password.");

    try {
      const { data: loginData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !loginData.user) throw new Error("Login failed: " + error.message);

      const userId = loginData.user.id;

      // Check profile role
      const { data: profile, error: roleError } = await supabase
        .from("profiles")
        .select("register_as")
        .eq("auth_user_id", userId)
        .single();

      if (roleError || !profile) {
        throw new Error("Couldn't fetch user role.");
      }

      const role = profile.register_as;

      if (role === "admin") {
        alertBox("👑 Welcome Admin!");
        window.location.href = "hospital-dashboard";
      } else if (role === "donor") {
        alertBox("👋 Welcome Donor!");
        window.location.href = "donor-dashboard";
      } else if (role === "patient") {
        alertBox("👋 Welcome Patient!");
        window.location.href = "user-dashboard";  // ✅ This is correct
      }
      
       else {
        alertBox("❌ Unknown role. Contact admin.");
      }
    } catch (err) {
      alertBox("❌ " + err.message);
    }
  });
}

// === Smooth Page Transitions ===
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".fade-link");
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = this.href;
      }, 50);
    });
  });
});
