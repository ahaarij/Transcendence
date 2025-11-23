export function LoginPage() {
    return `
    <div class="p-6 max-w-md mx-auto">
      <h1 class="text-3xl font-bold mb-6">Login</h1>

      <form id="loginForm" class="flex flex-col gap-4">

        <div>
          <label class="block mb-1 font-medium">Email</label>
          <input 
            id="email"
            type="email"
            class="w-full border p-2 rounded"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label class="block mb-1 font-medium">Password</label>
          <input 
            id="password"
            type="password"
            class="w-full border p-2 rounded"
            placeholder="Enter your password"
          />
        </div>

        <button 
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Login
        </button>

        <button 
          class="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded mt-2"
          id="googleBtn"
        >
          Sign in with Google (placeholder)
        </button>

      </form>

      <p class="mt-4">
        Don't have an account? 
        <a href="/register" data-link class="text-blue-600 underline">Register</a>
        </p>
        </div>
    `;
}
export function mountLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form)
        return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        alert("Login form submitted (fake).");
    });
    const googleBtn = document.getElementById("googleBtn");
    googleBtn === null || googleBtn === void 0 ? void 0 : googleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Google Login placeholder.");
    });
}
