export function HomePage() {
    return `
    <div class="min-h-screen flex flex-col items-center justify-start py-20">
      <div class="bg-white p-8 rounded-xl shadow border w-full max-w-2xl">
        <h1 class="text-3xl font-bold mb-4">Home</h1>
        <p>Welcome to Transcendence</p>

        <nav class="mt-6 flex gap-6 text-blue-600 underline">
          <a href="/login" data-link>Login</a>
          <a href="/register" data-link>Register</a>
        </nav>
      </div>
    </div>
  `;
}
export function mountHomePage() { }
