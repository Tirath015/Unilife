import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { marketplaceService } from "../services/marketplaceService";

const WishlistContext = createContext(null);

function getListingId(item) {
  return Number(
    item?.listingId ??
      item?.id ??
      item?.listing?.listingId ??
      item?.listing?.id
  );
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();

  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);
  const [wishlistError, setWishlistError] =
    useState("");

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      setWishlistError("");
      setWishlistLoading(false);
      return [];
    }

    try {
      setWishlistLoading(true);
      setWishlistError("");

      const response =
        await marketplaceService.getWishlist();

      const wishlistItems = Array.isArray(response)
        ? response
        : response?.data || [];

      const ids = wishlistItems
        .map(getListingId)
        .filter(
          (id) =>
            Number.isFinite(id) &&
            id > 0
        );

      setWishlistIds([
        ...new Set(ids),
      ]);

      return wishlistItems;
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );

      setWishlistIds([]);

      setWishlistError(
        error?.message ||
          "The wishlist could not be loaded."
      );

      return [];
    } finally {
      setWishlistLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isSaved = useCallback(
    (productId) => {
      const id = Number(productId);

      return wishlistIds.includes(id);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      const id = Number(productId);

      if (!Number.isFinite(id) || id <= 0) {
        throw new Error(
          "A valid listing ID is required."
        );
      }

      try {
        setWishlistError("");

        const response =
          await marketplaceService.toggleWishlist(id);

        const isNowSaved =
          typeof response?.isSaved === "boolean"
            ? response.isSaved
            : !wishlistIds.includes(id);

        setWishlistIds((currentIds) => {
          if (isNowSaved) {
            return [
              ...new Set([
                ...currentIds,
                id,
              ]),
            ];
          }

          return currentIds.filter(
            (savedId) =>
              savedId !== id
          );
        });

        return {
          ...response,
          productId: id,
          listingId: id,
          isSaved: isNowSaved,
        };
      } catch (error) {
        console.error(
          "Wishlist update failed:",
          error
        );

        setWishlistError(
          error?.message ||
            "The wishlist could not be updated."
        );

        throw error;
      }
    },
    [wishlistIds]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      const id = Number(productId);

      if (!Number.isFinite(id) || id <= 0) {
        throw new Error(
          "A valid listing ID is required."
        );
      }

      try {
        setWishlistError("");

        const response =
          await marketplaceService.removeFromWishlist(
            id
          );

        setWishlistIds((currentIds) =>
          currentIds.filter(
            (savedId) =>
              savedId !== id
          )
        );

        return {
          ...response,
          productId: id,
          listingId: id,
          isSaved: false,
        };
      } catch (error) {
        console.error(
          "Wishlist removal failed:",
          error
        );

        setWishlistError(
          error?.message ||
            "The item could not be removed from the wishlist."
        );

        throw error;
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      wishlistIds,
      wishlistLoading,
      wishlistError,
      isSaved,
      toggleWishlist,
      removeFromWishlist,
      refreshWishlist: loadWishlist,
    }),
    [
      wishlistIds,
      wishlistLoading,
      wishlistError,
      isSaved,
      toggleWishlist,
      removeFromWishlist,
      loadWishlist,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(
    WishlistContext
  );

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}