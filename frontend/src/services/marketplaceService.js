import { apiRequest } from "../api/httpClient";
import { STORAGE_KEYS, USE_MOCKS } from "../api/config";
import { products } from "../data/mockData";
import { delay, getStoredArray, setStoredArray } from "./mockHelpers";

const WISHLIST_KEY = "unilife_mock_wishlist";
const USER_LISTINGS_KEY = "unilife_mock_user_listings";
const ADMIN_REPORTS_KEY = "unilife_admin_reports";
const ADMIN_DELETED_LISTINGS_KEY = "unilife_admin_deleted_listings";
const ADMIN_LISTING_OVERRIDES_KEY = "unilife_admin_listing_overrides";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
}
function getWishlistKey() {
  const loggedInUser = getLoggedInUser();
  const userEmail = loggedInUser?.email || "guest";
  return `${WISHLIST_KEY}_${userEmail.toLowerCase().trim()}`;
}

function getAllMockProducts() {
  const userListings = getStoredArray(USER_LISTINGS_KEY, []);
  const deletedIds = getStoredArray(ADMIN_DELETED_LISTINGS_KEY, []).map(Number);
  const overrides = getStoredArray(ADMIN_LISTING_OVERRIDES_KEY, []);

  const defaultProducts = products.map((product) => {
    const override = overrides.find((item) => Number(item.id) === Number(product.id));

    return {
      ...product,
      ...override,
      sellerName:
        override?.sellerName ||
        product.sellerName ||
        product.seller ||
        "Student Seller",
      seller:
        override?.sellerName ||
        product.sellerName ||
        product.seller ||
        "Student Seller",
      sellerEmail:
        override?.sellerEmail || product.sellerEmail || "student@college.ca",
      sellerRating:
        override?.sellerRating || product.sellerRating || product.rating || 5,
      rating: override?.sellerRating || product.rating || 5,
      status: override?.status || product.status || "Active",
    };
  });

  return [...userListings, ...defaultProducts].filter(
    (product) => !deletedIds.includes(Number(product.id))
  );
}

function filterProducts(params = {}) {
  const {
    query = "",
    category = "All",
    location = "All",
    sort = "newest",
  } = params;

  const q = query.trim().toLowerCase();

  const result = getAllMockProducts().filter((product) => {
    const status = product.status || "Active";

    if (status === "Hidden" || status === "Sold") return false;

    const searchableText = `
      ${product.title || ""}
      ${product.seller || ""}
      ${product.sellerName || ""}
      ${product.category || ""}
      ${product.location || ""}
      ${product.description || ""}
    `.toLowerCase();

    const matchesQuery = !q || searchableText.includes(q);

    const matchesCategory =
      category === "All" || product.category === category;

    const matchesLocation =
      location === "All" || product.location === location;

    return matchesQuery && matchesCategory && matchesLocation;
  });

  if (sort === "price-low") {
    result.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sort === "price-high") {
    result.sort((a, b) => Number(b.price) - Number(a.price));
  }

  if (sort === "newest") {
    result.sort(
      (a, b) =>
        new Date(b.postedAt || 0).getTime() -
        new Date(a.postedAt || 0).getTime()
    );
  }

  return result;
}

function buildListingFormData(payload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "imageFile" && value) {
      formData.append("image", value);
      return;
    }

    if (key === "photos" && Array.isArray(value)) {
      value.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });
      return;
    }

    if (key !== "imagePreview" && value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return formData;
}

export const marketplaceService = {
  async getListings(params) {
    if (USE_MOCKS) {
      return delay(filterProducts(params));
    }

    const search = new URLSearchParams(params).toString();
    return apiRequest(`/marketplace/listings?${search}`);
  },

  async getListingById(id) {
    if (USE_MOCKS) {
      const listing = getAllMockProducts().find(
        (product) => Number(product.id) === Number(id)
      );

      return delay(listing || null);
    }

    return apiRequest(`/marketplace/listings/${id}`);
  },

  async createListing(payload) {
    if (USE_MOCKS) {
      const { imageFile, imagePreview, photos = [], ...listingData } = payload;

      const loggedInUser = getLoggedInUser();

      const mainImage =
        photos?.[0] ||
        imagePreview ||
        listingData.imageUrl ||
        listingData.image ||
        FALLBACK_IMAGE;

      const sellerName = loggedInUser?.fullName || "Student Seller";
      const sellerEmail = loggedInUser?.email || "student@college.ca";

      const createdListing = {
        id: Date.now(),
        ...listingData,
        price: Number(listingData.price),
        photos,
        imageUrl: mainImage,
        imagePreview: mainImage,
        image: mainImage,
        seller: sellerName,
        sellerName,
        sellerEmail,
        sellerId: loggedInUser?.id || null,
        sellerRating: 5,
        rating: 5,
        sellerBio:
          "Student seller on UniLife. Message the seller to confirm pickup details and availability.",
        postedAt: new Date().toISOString(),
        status: "Active",
        description: listingData.description || "No description provided.",
      };

      const currentListings = getStoredArray(USER_LISTINGS_KEY, []);
      setStoredArray(USER_LISTINGS_KEY, [createdListing, ...currentListings]);

      return delay(createdListing, 500);
    }
    

    return apiRequest("/marketplace/listings", {
      method: "POST",
      body: buildListingFormData(payload),
      isFormData: true,
    });
  },

  async updateListing(id, updates) {
    if (USE_MOCKS) {
      const listings = getStoredArray(USER_LISTINGS_KEY, []);

      const updated = listings.map((listing) =>
        Number(listing.id) === Number(id)
          ? {
              ...listing,
              ...updates,
              price:
                updates.price !== undefined
                  ? Number(updates.price)
                  : listing.price,
            }
          : listing
      );

      setStoredArray(USER_LISTINGS_KEY, updated);

      const editedListing = updated.find(
        (listing) => Number(listing.id) === Number(id)
      );

      return delay(editedListing, 300);
    }

    return apiRequest(`/marketplace/listings/${id}`, {
      method: "PUT",
      body: updates,
    });
  },

  async deleteListing(id) {
    if (USE_MOCKS) {
      const listings = getStoredArray(USER_LISTINGS_KEY, []);

      const updated = listings.filter(
        (listing) => Number(listing.id) !== Number(id)
      );

      setStoredArray(USER_LISTINGS_KEY, updated);

      return delay({ id: Number(id), deleted: true }, 300);
    }

    return apiRequest(`/marketplace/listings/${id}`, {
      method: "DELETE",
    });
  },

  async reportListing(productId, reason = "Student reported this listing.") {
    if (USE_MOCKS) {
      const reports = getStoredArray(ADMIN_REPORTS_KEY, []);

      const listing = getAllMockProducts().find(
        (product) => Number(product.id) === Number(productId)
      );

      const loggedInUser = getLoggedInUser();

      const newReport = {
        id: Date.now(),
        listingId: Number(productId),
        title: listing?.title || "Reported Listing",
        reportedBy: loggedInUser?.fullName || "Student",
        reportedByEmail: loggedInUser?.email || "",
        reason,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      setStoredArray(ADMIN_REPORTS_KEY, [newReport, ...reports]);

      return delay(newReport, 300);
    }

    return apiRequest(`/marketplace/listings/${productId}/report`, {
      method: "POST",
      body: { reason },
    });
  },

  async getWishlist() {
  if (USE_MOCKS) {
    const wishlistKey = getWishlistKey();
    const ids = getStoredArray(wishlistKey, []).map(Number);
    const uniqueIds = [...new Set(ids)];

    const wishlistItems = getAllMockProducts().filter((product) =>
      uniqueIds.includes(Number(product.id))
    );

    return delay(wishlistItems);
  }

  return apiRequest("/wishlist");
},

async toggleWishlist(productId) {
  if (USE_MOCKS) {
    const wishlistKey = getWishlistKey();
    const id = Number(productId);
    const ids = getStoredArray(wishlistKey, []).map(Number);

    const next = ids.includes(id)
      ? ids.filter((savedId) => savedId !== id)
      : [...new Set([...ids, id])];

    setStoredArray(wishlistKey, next);

    return delay(
      {
        productId: id,
        isSaved: next.includes(id),
        wishlistIds: next,
      },
      150
    );
  }

  return apiRequest(`/wishlist/${productId}`, {
    method: "POST",
  });
},

async removeFromWishlist(productId) {
  if (USE_MOCKS) {
    const wishlistKey = getWishlistKey();
    const id = Number(productId);
    const ids = getStoredArray(wishlistKey, []).map(Number);

    const next = ids.filter((savedId) => savedId !== id);

    setStoredArray(wishlistKey, next);

    return delay(
      {
        productId: id,
        removed: true,
        wishlistIds: next,
      },
      150
    );
  }

  return apiRequest(`/wishlist/${productId}`, {
    method: "DELETE",
  });
},

getWishlistIds() {
  const wishlistKey = getWishlistKey();
  return getStoredArray(wishlistKey, []).map(Number);
},
};