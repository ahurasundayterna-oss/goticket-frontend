// FRONTEND auth helper (NOT backend)

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  // notify React app
  window.dispatchEvent(new Event("auth-change"));
};

export const login = (token, role) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);

  window.dispatchEvent(new Event("auth-change"));
};