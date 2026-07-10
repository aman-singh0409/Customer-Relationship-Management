import { create } from "zustand";
import Cookies from "js-cookie";

export const useAuthStore = create((set) => ({
  user: {
    id: Cookies.get("id") || null,
    name: Cookies.get("name") || "",
    email: Cookies.get("email") || "",
    role: Cookies.get("role") || "",
    token: Cookies.get("token") || "",
    avatar: Cookies.get("avatar") || "", 
  },

  // Login
  login: (userData) => {
    // Save all to cookies
    Object.keys(userData).forEach((key) => {
      Cookies.set(key, userData[key], { expires: 7 });
    });
    set({ user: userData });
  },

  // Logout
  logout: () => {
    const keys = ["id", "name", "email", "role", "token", "avatar"];
    keys.forEach((key) => Cookies.remove(key));
    set({
      user: { id: null, name: "", email: "", role: "", token: "", avatar: "" }
    });
  },
  setUser: (updates) => {
    set((state) => {
      const updatedUser = { ...state.user, ...updates };
      if (updates.name) Cookies.set("name", updates.name, { expires: 7 });
      if (updates.email) Cookies.set("email", updates.email, { expires: 7 });
      if (updates.role) Cookies.set("role", updates.role, { expires: 7 });
      if (updates.avatar) Cookies.set("avatar", updates.avatar, { expires: 7 });
      return { user: updatedUser };
    });
  },
}));