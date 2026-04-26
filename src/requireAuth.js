export function requireAuth() {
  const token = localStorage.getItem("token");

  // ⛔ If no token, redirect
  if (!token) {
    window.location.href = "/login";
    return false;
  }

  return true;
}