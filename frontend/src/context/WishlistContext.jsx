import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { marketplaceService } from "../services/marketplaceService";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (!user) {
      setWishlistIds([]);
      return;
    }

    setWishlistIds(marketplaceService.getWishlistIds());
  }, [user?.email]);

  function isSaved(productId) {
    return wishlistIds.includes(Number(productId));
  }

  async function toggleWishlist(productId) {
    const response = await marketplaceService.toggleWishlist(Number(productId));
    setWishlistIds(response.wishlistIds.map(Number));
    return response;
  }

  async function removeFromWishlist(productId) {
    const response = await marketplaceService.removeFromWishlist(Number(productId));
    setWishlistIds(response.wishlistIds.map(Number));
    return response;
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isSaved,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
