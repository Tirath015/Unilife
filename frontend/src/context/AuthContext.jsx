import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../api/config";
import { authService } from "../services/authService";

const AuthContext = createContext(null);
const PROFILE_PHOTOS_KEY = "unilife_profile_photos";

function getSavedProfilePhotos() {
  const saved = localStorage.getItem(PROFILE_PHOTOS_KEY);
  return saved ? JSON.parse(saved) : {};
}

function attachSavedPhoto(user) {
  if (!user?.email) return user;

  const photos = getSavedProfilePhotos();

  return {
    ...user,
    photoUrl: photos[user.email] || user.photoUrl || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.user);
    return saved ? attachSavedPhoto(JSON.parse(saved)) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem(STORAGE_KEYS.token);

    if (!token) return;

    setLoading(true);

    authService
      .getCurrentUser()
      .then((profile) => {
        if (mounted && profile) {
          const profileWithPhoto = attachSavedPhoto(profile);
          setUser(profileWithPhoto);
          localStorage.setItem(
            STORAGE_KEYS.user,
            JSON.stringify(profileWithPhoto)
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function login(credentials) {
    const response = await authService.login(credentials);
    const userWithPhoto = attachSavedPhoto(response.user);

    setUser(userWithPhoto);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userWithPhoto));

    return {
      ...response,
      user: userWithPhoto,
    };
  }

  async function register(payload) {
    const response = await authService.register(payload);
    const userWithPhoto = attachSavedPhoto(response.user);

    setUser(userWithPhoto);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userWithPhoto));

    return {
      ...response,
      user: userWithPhoto,
    };
  }

  function updateProfilePhoto(photoUrl) {
    if (!user) return;

    const updatedUser = {
      ...user,
      photoUrl,
    };

    const photos = getSavedProfilePhotos();

    if (user.email) {
      photos[user.email] = photoUrl;
      localStorage.setItem(PROFILE_PHOTOS_KEY, JSON.stringify(photos));
    }

    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
  }

  function logout() {
    authService.logout();
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfilePhoto,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
