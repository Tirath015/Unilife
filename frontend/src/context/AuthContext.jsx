import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS } from "../api/config";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

const PROFILE_PHOTOS_KEY = "unilife_profile_photos";

function getSavedProfilePhotos() {
  try {
    const savedPhotos = localStorage.getItem(PROFILE_PHOTOS_KEY);

    return savedPhotos ? JSON.parse(savedPhotos) : {};
  } catch (error) {
    console.error("Unable to load profile photos:", error);
    return {};
  }
}

function attachSavedPhoto(user) {
  if (!user?.email) {
    return user;
  }

  const photos = getSavedProfilePhotos();

  return {
    ...user,
    photoUrl: photos[user.email] || user.photoUrl || "",
  };
}

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem(STORAGE_KEYS.user);

    if (!savedUser) {
      return null;
    }

    return attachSavedPhoto(JSON.parse(savedUser));
  } catch (error) {
    console.error("Unable to load stored user:", error);

    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);

    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.token);

        if (!token) {
          if (mounted) {
            setUser(null);
          }

          return;
        }

        const currentUser = await authService.getCurrentUser();

        if (!mounted) {
          return;
        }

        if (!currentUser) {
          authService.logout();
          setUser(null);
          return;
        }

        const userWithPhoto = attachSavedPhoto(currentUser);

        setUser(userWithPhoto);

        localStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(userWithPhoto)
        );
      } catch (error) {
        console.error("Unable to restore login session:", error);

        authService.logout();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(credentials) {
    const response = await authService.login(credentials);

    const userWithPhoto = attachSavedPhoto(response.user);

    setUser(userWithPhoto);

    localStorage.setItem(
      STORAGE_KEYS.user,
      JSON.stringify(userWithPhoto)
    );

    return {
      ...response,
      user: userWithPhoto,
    };
  }

  async function register(payload) {
    /*
     * Registration does not log the user in.
     * The user must verify their email first.
     */
    return authService.register(payload);
  }

  function updateProfilePhoto(photoUrl) {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      photoUrl,
    };

    const photos = getSavedProfilePhotos();

    if (user.email) {
      photos[user.email] = photoUrl;

      localStorage.setItem(
        PROFILE_PHOTOS_KEY,
        JSON.stringify(photos)
      );
    }

    setUser(updatedUser);

    localStorage.setItem(
      STORAGE_KEYS.user,
      JSON.stringify(updatedUser)
    );
  }

  function updateCurrentUser(updatedInformation) {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      ...updatedInformation,
    };

    setUser(updatedUser);

    localStorage.setItem(
      STORAGE_KEYS.user,
      JSON.stringify(updatedUser)
    );
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(
        user && localStorage.getItem(STORAGE_KEYS.token)
      ),
      login,
      register,
      logout,
      updateProfilePhoto,
      updateCurrentUser,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}