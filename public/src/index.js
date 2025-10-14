const baseUrl = "http://localhost:3000";

const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const data = { name, email, password };

  try {
    const createUser = await axios.post(`${baseUrl}/users/signup`, data);
    const res = createUser.data.message;
    if(createUser.data.success === false) {
      showToast(res, "error");  
      form.reset();
    } else {
      showToast(res, "success"); 
    }

  } catch (error) {
    console.error("Error:", error);
    const errorMsg = error?.response?.data?.message || "Something went wrong!";
    showToast(errorMsg, "error");
  }

  form.reset();
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = `toast show ${type}`;

  // Show toast for 3 seconds
  setTimeout(() => {
    toast.className = `toast hidden`;
  }, 3000);
}
