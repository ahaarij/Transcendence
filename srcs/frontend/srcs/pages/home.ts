export function HomePage()
{
    return `
    <div class="p-6">
        <h1 class="text-3xl font-bold mb-4">Home</h1>
        <p>Welcome To Transcendence</p>
        <nav class="mt-4 flex gap-4">
        <a href="/login" data-link>Go to Login</a>
        <a href="/register" data-link>Go to Register</a>
      </nav>
    </div>
    `;
}

export function mountHomePage() {}
