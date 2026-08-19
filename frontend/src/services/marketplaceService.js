import { apiRequest } from "../api/httpClient";
import { API_BASE_URL, STORAGE_KEYS, USE_MOCKS } from "../api/config";
import { products } from "../data/mockData";
import {
  delay,
  getStoredArray,
  setStoredArray,
} from "./mockHelpers";

const WISHLIST_KEY = "unilife_mock_wishlist";
const USER_LISTINGS_KEY = "unilife_mock_user_listings";
const ADMIN_REPORTS_KEY = "unilife_admin_reports";
const ADMIN_DELETED_LISTINGS_KEY =
  "unilife_admin_deleted_listings";
const ADMIN_LISTING_OVERRIDES_KEY =
  "unilife_admin_listing_overrides";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

function getLoggedInUser() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.user) || "null"
    );
  } catch {
    return null;
  }
}

function getWishlistKey() {
  const loggedInUser = getLoggedInUser();
  const userEmail = loggedInUser?.email || "guest";

  return `${WISHLIST_KEY}_${userEmail
    .toLowerCase()
    .trim()}`;
}

function getAllMockProducts() {
  const userListings = getStoredArray(
    USER_LISTINGS_KEY,
    []
  );

  const deletedIds = getStoredArray(
    ADMIN_DELETED_LISTINGS_KEY,
    []
  ).map(Number);

  const overrides = getStoredArray(
    ADMIN_LISTING_OVERRIDES_KEY,
    []
  );

  const defaultProducts = products.map((product) => {
    const override = overrides.find(
      (item) =>
        Number(item.id) === Number(product.id)
    );

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
        override?.sellerEmail ||
        product.sellerEmail ||
        "student@college.ca",

      sellerRating:
        override?.sellerRating ||
        product.sellerRating ||
        product.rating ||
        5,

      rating:
        override?.sellerRating ||
        product.rating ||
        5,

      status:
        override?.status ||
        product.status ||
        "Active",
    };
  });

  return [...userListings, ...defaultProducts].filter(
    (product) =>
      !deletedIds.includes(Number(product.id))
  );
}

function filterProducts(params = {}) {
  const {
    query = "",
    category = "All",
    location = "All",
    sort = "newest",
  } = params;

  const normalizedQuery = query
    .trim()
    .toLowerCase();

  const result = getAllMockProducts().filter(
    (product) => {
      const status = product.status || "Active";

      if (
        status === "Hidden" ||
        status === "Sold"
      ) {
        return false;
      }

      const searchableText = `
        ${product.title || ""}
        ${product.seller || ""}
        ${product.sellerName || ""}
        ${product.category || ""}
        ${product.location || ""}
        ${product.description || ""}
      `.toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      const matchesLocation =
        location === "All" ||
        product.location === location;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesLocation
      );
    }
  );

  sortListings(result, sort);

  return result;
}

function sortListings(listings, sort = "newest") {
  if (sort === "price-low") {
    listings.sort(
      (first, second) =>
        Number(first.price) -
        Number(second.price)
    );
  }

  if (sort === "price-high") {
    listings.sort(
      (first, second) =>
        Number(second.price) -
        Number(first.price)
    );
  }

  if (sort === "newest") {
    listings.sort(
      (first, second) =>
        new Date(
          second.createdAt ||
            second.postedAt ||
            0
        ).getTime() -
        new Date(
          first.createdAt ||
            first.postedAt ||
            0
        ).getTime()
    );
  }

  return listings;
}

function getImageUrl(listing) {
  const images = Array.isArray(listing?.images)
    ? listing.images
    : [];

  const firstImage = images[0];

  const imageUrl =
    firstImage?.imageUrl ||
    firstImage?.url ||
    firstImage?.filePath ||
    listing?.imageUrl ||
    listing?.image;

  if (!imageUrl) {
    return FALLBACK_IMAGE;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");

  return `${backendOrigin}${
    imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
  }`;
}

function normalizeListing(listing) {
  if (!listing) {
    return null;
  }

  const listingId =
    listing.listingId ?? listing.id;

  const categoryName =
    listing.category?.name ||
    listing.categoryName ||
    listing.category ||
    "Other";

  const sellerName =
    listing.user?.fullName ||
    listing.sellerName ||
    listing.seller ||
    "Student Seller";

  const sellerEmail =
    listing.user?.email ||
    listing.sellerEmail ||
    "";

  return {
    ...listing,

    id: listingId,
    listingId,

    title: listing.title || "",
    description: listing.description || "",
    price: Number(listing.price || 0),
    location: listing.location || "",

    category: categoryName,
    categoryId:
      listing.categoryId ??
      listing.category?.categoryId,

    seller: sellerName,
    sellerName,
    sellerEmail,

    sellerId:
      listing.userId ??
      listing.user?.userId,

    postedAt:
      listing.createdAt ||
      listing.postedAt,

    imageUrl: getImageUrl(listing),
    image: getImageUrl(listing),
    imagePreview: getImageUrl(listing),

    photos: Array.isArray(listing.images)
      ? listing.images.map(
          (image) =>
            image.imageUrl ||
            image.url ||
            image.filePath
        )
      : [],

    listingType:
      listing.listingType ?? 1,

    listingTypeName:
      Number(listing.listingType) === 2
        ? "For Rent"
        : "For Sale",

    status:
      listing.status ??
      "Available",

    viewCount:
      listing.viewCount ?? 0,
  };
}

function normalizeListingArray(response) {
  let listings = [];

  if (Array.isArray(response)) {
    listings = response;
  } else if (Array.isArray(response?.data)) {
    listings = response.data;
  } else if (
    Array.isArray(response?.listings)
  ) {
    listings = response.listings;
  }

  return listings
    .map(normalizeListing)
    .filter(Boolean);
}

function filterBackendListings(
  listings,
  params = {}
) {
  const {
    category = "All",
    categoryId,
    sort = "newest",
  } = params;

  let result = [...listings];

  if (
    categoryId !== undefined &&
    categoryId !== null &&
    categoryId !== "" &&
    categoryId !== "All"
  ) {
    result = result.filter(
      (listing) =>
        Number(listing.categoryId) ===
        Number(categoryId)
    );
  } else if (
    category &&
    category !== "All"
  ) {
    result = result.filter(
      (listing) =>
        listing.category === category
    );
  }

  return sortListings(result, sort);
}

export const marketplaceService = {
  async getListings(params = {}) {
    if (USE_MOCKS) {
      return delay(filterProducts(params));
    }

    const response = await apiRequest("/Listing", {
      method: "GET",
    });

    const listings = normalizeListingArray(response);

    let result = [...listings];

    const query = String(params.query || "")
      .trim()
      .toLowerCase();

    if (query) {
      result = result.filter((listing) => {
        const searchableText = `
          ${listing.title || ""}
          ${listing.description || ""}
          ${listing.category || ""}
          ${listing.location || ""}
          ${listing.sellerName || ""}
        `.toLowerCase();

        return searchableText.includes(query);
      });
    }

    if (
      params.location &&
      params.location !== "All"
    ) {
      result = result.filter(
        (listing) =>
          listing.location === params.location
      );
    }

    const selectedCategoryId =
  params.categoryId ??
  params.category;

if (
  selectedCategoryId &&
  selectedCategoryId !== "All"
) {
  result = result.filter((listing) => {
    const listingCategoryId =
      listing.categoryId ??
      listing.category?.categoryId;

    return (
      Number(listingCategoryId) ===
      Number(selectedCategoryId)
    );
  });
}

    return sortListings(
      result,
      params.sort || "newest"
    );
  },

  async getAllListings() {
    if (USE_MOCKS) {
      return delay(getAllMockProducts());
    }

    const response = await apiRequest(
      "/Listing",
      {
        method: "GET",
      }
    );

    return normalizeListingArray(response);
  },

  async getListingById(id) {
    if (!id) {
      throw new Error(
        "Listing ID is required."
      );
    }

    if (USE_MOCKS) {
      const listing =
        getAllMockProducts().find(
          (product) =>
            Number(product.id) ===
            Number(id)
        );

      return delay(listing || null);
    }

    const response = await apiRequest(
      `/Listing/${id}`,
      {
        method: "GET",
      }
    );

    return normalizeListing(response);
  },

  async createListing(payload) {
    if (USE_MOCKS) {
      const {
        imageFile,
        imagePreview,
        photos = [],
        ...listingData
      } = payload;

      const loggedInUser =
        getLoggedInUser();

      const mainImage =
        photos?.[0] ||
        imagePreview ||
        listingData.imageUrl ||
        listingData.image ||
        FALLBACK_IMAGE;

      const sellerName =
        loggedInUser?.fullName ||
        "Student Seller";

      const sellerEmail =
        loggedInUser?.email ||
        "student@college.ca";

      const createdListing = {
        id: Date.now(),
        listingId: Date.now(),
        ...listingData,

        price: Number(
          listingData.price
        ),

        photos,
        imageUrl: mainImage,
        imagePreview: mainImage,
        image: mainImage,

        seller: sellerName,
        sellerName,
        sellerEmail,

        sellerId:
          loggedInUser?.userId ||
          loggedInUser?.id ||
          null,

        sellerRating: 5,
        rating: 5,

        postedAt:
          new Date().toISOString(),

        createdAt:
          new Date().toISOString(),

        status: "Available",

        description:
          listingData.description ||
          "No description provided.",
      };

      const currentListings =
        getStoredArray(
          USER_LISTINGS_KEY,
          []
        );

      setStoredArray(
        USER_LISTINGS_KEY,
        [
          createdListing,
          ...currentListings,
        ]
      );

      return delay(createdListing, 500);
    }

    const formData = new FormData();

    formData.append("Title", payload.title?.trim() || "");
    formData.append(
      "Description",
      payload.description?.trim() || ""
    );
    formData.append("Price", String(payload.price));
    formData.append(
      "Location",
      payload.location?.trim() || ""
    );
    formData.append(
      "ListingType",
      String(payload.listingType)
    );
    formData.append(
      "CategoryId",
      String(payload.categoryId)
    );
    formData.append("UserId", String(payload.userId));

    if (
      payload.latitude !== null &&
      payload.latitude !== undefined &&
      payload.latitude !== ""
    ) {
      formData.append("Latitude", String(payload.latitude));
    }

    if (
      payload.longitude !== null &&
      payload.longitude !== undefined &&
      payload.longitude !== ""
    ) {
      formData.append("Longitude", String(payload.longitude));
    }

    if (payload.imageFile instanceof File) {
      formData.append("Image", payload.imageFile);
    }

    const response = await apiRequest("/Listing", {
      method: "POST",
      body: formData,
      isFormData: true,
    });

    return normalizeListing(response);
  },

  async updateListing(id, updates) {
    if (!id) {
      throw new Error(
        "Listing ID is required."
      );
    }

    if (USE_MOCKS) {
      const listings =
        getStoredArray(
          USER_LISTINGS_KEY,
          []
        );

      const updated = listings.map(
        (listing) =>
          Number(listing.id) ===
          Number(id)
            ? {
                ...listing,
                ...updates,

                price:
                  updates.price !==
                  undefined
                    ? Number(
                        updates.price
                      )
                    : listing.price,
              }
            : listing
      );

      setStoredArray(
        USER_LISTINGS_KEY,
        updated
      );

      const editedListing =
        updated.find(
          (listing) =>
            Number(listing.id) ===
            Number(id)
        );

      return delay(
        editedListing,
        300
      );
    }

    const requestBody = {
      title: updates.title?.trim(),
      description:
        updates.description?.trim(),
      price: Number(updates.price),
      location:
        updates.location?.trim(),
      listingType: Number(
        updates.listingType
      ),
      categoryId: Number(
        updates.categoryId
      ),

      latitude:
        updates.latitude === "" ||
        updates.latitude === undefined
          ? null
          : updates.latitude,

      longitude:
        updates.longitude === "" ||
        updates.longitude === undefined
          ? null
          : updates.longitude,
    };

    const response = await apiRequest(
      `/Listing/${id}`,
      {
        method: "PUT",
        body: requestBody,
      }
    );

    return {
      ...response,
      listing: normalizeListing(
        response?.listing
      ),
    };
  },

  async deleteListing(id) {
    if (!id) {
      throw new Error(
        "Listing ID is required."
      );
    }

    if (USE_MOCKS) {
      const listings =
        getStoredArray(
          USER_LISTINGS_KEY,
          []
        );

      const updated =
        listings.filter(
          (listing) =>
            Number(listing.id) !==
            Number(id)
        );

      setStoredArray(
        USER_LISTINGS_KEY,
        updated
      );

      return delay(
        {
          id: Number(id),
          deleted: true,
        },
        300
      );
    }

    return apiRequest(
      `/Listing/${id}`,
      {
        method: "DELETE",
      }
    );
  },

  async getNewestListings() {
    if (USE_MOCKS) {
      const listings =
        filterProducts({
          sort: "newest",
        });

      return delay(
        listings.slice(0, 20)
      );
    }

    const response = await apiRequest(
      "/Listing/new",
      {
        method: "GET",
      }
    );

    return normalizeListingArray(
      response
    );
  },

  async getTrendingListings() {
    if (USE_MOCKS) {
      const listings =
        getAllMockProducts()
          .sort(
            (first, second) =>
              Number(
                second.viewCount || 0
              ) -
              Number(
                first.viewCount || 0
              )
          )
          .slice(0, 20);

      return delay(listings);
    }

    const response = await apiRequest(
      "/Listing/trending",
      {
        method: "GET",
      }
    );

    return normalizeListingArray(
      response
    );
  },

  async getSimilarListings(id) {
    if (!id) {
      throw new Error(
        "Listing ID is required."
      );
    }

    if (USE_MOCKS) {
      const currentListing =
        getAllMockProducts().find(
          (product) =>
            Number(product.id) ===
            Number(id)
        );

      if (!currentListing) {
        return delay([]);
      }

      const similar =
        getAllMockProducts()
          .filter(
            (product) =>
              Number(product.id) !==
                Number(id) &&
              product.category ===
                currentListing.category
          )
          .slice(0, 10);

      return delay(similar);
    }

    const response = await apiRequest(
      `/Listing/${id}/similar`,
      {
        method: "GET",
      }
    );

    return normalizeListingArray(
      response
    );
  },

  async getRecentlyViewed() {
    if (USE_MOCKS) {
      return delay([]);
    }

    const response = await apiRequest(
      "/Listing/recently-viewed",
      {
        method: "GET",
      }
    );

    const records = Array.isArray(response)
      ? response
      : response?.data || [];

    return records
      .map((record) =>
        normalizeListing(
          record.listing || record
        )
      )
      .filter(Boolean);
  },

  async getRecommendedListings() {
    if (USE_MOCKS) {
      return delay(
        getAllMockProducts().slice(
          0,
          20
        )
      );
    }

    const response = await apiRequest(
      "/Listing/recommended-for-you",
      {
        method: "GET",
      }
    );

    return normalizeListingArray(
      response
    );
  },

  async getNearbyListings({
    latitude,
    longitude,
    radiusKm = 10,
  }) {
    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      throw new Error(
        "Latitude and longitude are required."
      );
    }

    if (USE_MOCKS) {
      return delay([]);
    }

    const searchParams =
      new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radiusKm: String(radiusKm),
      });

    const response = await apiRequest(
      `/Listing/nearby?${searchParams.toString()}`,
      {
        method: "GET",
      }
    );

    const nearbyItems =
      Array.isArray(response)
        ? response
        : [];

    return nearbyItems.map((item) => ({
      ...normalizeListing(
        item.listing || item.Listing
      ),

      distanceKm:
        item.distanceKm ??
        item.DistanceKm,
    }));
  },

  async getTopSellers() {
    if (USE_MOCKS) {
      return delay([]);
    }

    return apiRequest(
      "/Listing/top-sellers",
      {
        method: "GET",
      }
    );
  },

  async reportListing(
    productId,
    reason =
      "Student reported this listing."
  ) {
    if (USE_MOCKS) {
      const reports =
        getStoredArray(
          ADMIN_REPORTS_KEY,
          []
        );

      const listing =
        getAllMockProducts().find(
          (product) =>
            Number(product.id) ===
            Number(productId)
        );

      const loggedInUser =
        getLoggedInUser();

      const newReport = {
        id: Date.now(),
        listingId:
          Number(productId),

        title:
          listing?.title ||
          "Reported Listing",

        reportedBy:
          loggedInUser?.fullName ||
          "Student",

        reportedByEmail:
          loggedInUser?.email || "",

        reason,
        status: "Pending",

        createdAt:
          new Date().toISOString(),
      };

      setStoredArray(
        ADMIN_REPORTS_KEY,
        [newReport, ...reports]
      );

      return delay(newReport, 300);
    }

    throw new Error(
      "The current backend does not contain a listing report endpoint."
    );
  },

async getWishlist() {
  const loggedInUser = getLoggedInUser();

  const userId =
    loggedInUser?.userId ??
    loggedInUser?.UserId ??
    loggedInUser?.id ??
    loggedInUser?.Id;

  if (!userId) {
    throw new Error(
      "User ID was not found. Please log out and log in again."
    );
  }

  const response = await apiRequest(
    `/Favorites/user/${Number(userId)}`,
    {
      method: "GET",
    }
  );

  const favorites = Array.isArray(response)
    ? response
    : response?.data ||
      response?.$values ||
      response?.favorites ||
      [];

  return favorites
    .map((favorite) => {
      const listing =
        favorite?.listing ||
        favorite?.Listing ||
        favorite?.product ||
        favorite?.Product;

      const normalizedListing =
        normalizeListing(listing);

      if (!normalizedListing) {
        return null;
      }

      return {
        ...normalizedListing,

        favoriteId:
          favorite?.favoriteId ??
          favorite?.FavoriteId ??
          favorite?.id ??
          favorite?.Id,
      };
    })
    .filter(Boolean);
},

async addToWishlist(productId) {
  const loggedInUser = getLoggedInUser();

  const userId =
    loggedInUser?.userId ??
    loggedInUser?.UserId ??
    loggedInUser?.id ??
    loggedInUser?.Id;

  const listingId = Number(productId);

  if (!userId) {
    throw new Error(
      "User ID was not found. Please log out and log in again."
    );
  }

  if (
    !Number.isFinite(listingId) ||
    listingId <= 0
  ) {
    throw new Error(
      "A valid listing ID is required."
    );
  }

  const response = await apiRequest(
    "/Favorites",
    {
      method: "POST",
      body: {
        userId: Number(userId),
        listingId,
      },
    }
  );

  return {
    ...response,
    productId: listingId,
    listingId,

    favoriteId:
      response?.favoriteId ??
      response?.FavoriteId ??
      response?.id ??
      response?.Id,

    isSaved: true,
  };
},

async removeFromWishlist(productId) {
  const listingId = Number(productId);

  if (
    !Number.isFinite(listingId) ||
    listingId <= 0
  ) {
    throw new Error(
      "A valid listing ID is required."
    );
  }

  const wishlistItems =
    await this.getWishlist();

  const savedItem = wishlistItems.find(
    (item) =>
      Number(
        item.listingId ??
          item.id
      ) === listingId
  );

  const favoriteId =
    savedItem?.favoriteId;

  if (!favoriteId) {
    throw new Error(
      "The favorite record was not found."
    );
  }

  await apiRequest(
    `/Favorites/${Number(favoriteId)}`,
    {
      method: "DELETE",
    }
  );

  return {
    productId: listingId,
    listingId,
    favoriteId: Number(favoriteId),
    removed: true,
    isSaved: false,
  };
},

async toggleWishlist(productId) {
  const listingId = Number(productId);

  if (
    !Number.isFinite(listingId) ||
    listingId <= 0
  ) {
    throw new Error(
      "A valid listing ID is required."
    );
  }

  const wishlistItems =
    await this.getWishlist();

  const savedItem = wishlistItems.find(
    (item) =>
      Number(
        item.listingId ??
          item.id
      ) === listingId
  );

  if (savedItem) {
    const favoriteId =
      savedItem.favoriteId;

    if (!favoriteId) {
      throw new Error(
        "The favorite record was not found."
      );
    }

    await apiRequest(
      `/Favorites/${Number(favoriteId)}`,
      {
        method: "DELETE",
      }
    );

    return {
      productId: listingId,
      listingId,
      favoriteId: Number(favoriteId),
      isSaved: false,
    };
  }

  return this.addToWishlist(listingId);
},
  getWishlistIds() {
    const wishlistKey =
      getWishlistKey();

    return getStoredArray(
      wishlistKey,
      []
    ).map(Number);
  },
};