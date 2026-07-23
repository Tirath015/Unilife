import { products } from "../../data/mockData";
import { adminReports, adminUsers } from "../data/adminMockData";

const USERS_KEY = "unilife_mock_users";
const REPORTS_KEY = "unilife_admin_reports";
const USER_LISTINGS_KEY = "unilife_mock_user_listings";
const LISTING_OVERRIDES_KEY = "unilife_admin_listing_overrides";
const DELETED_LISTINGS_KEY = "unilife_admin_deleted_listings";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

function read(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function normalizeId(id) {
  return Number(id);
}

function getAllListingsForAdmin() {
  const userListings = read(USER_LISTINGS_KEY, []);
  const overrides = read(LISTING_OVERRIDES_KEY, []);
  const deletedIds = read(DELETED_LISTINGS_KEY, []);

  const defaultListings = products.map((product) => {
    const override = overrides.find((item) => item.id === product.id);

    return {
      ...product,
      ...override,
      sellerName: product.sellerName || product.seller || "Student Seller",
      sellerEmail: product.sellerEmail || "student@college.ca",
      sellerRating: product.sellerRating || product.rating || 5,
      status: product.status || "Active",
    };
  });

  return [...userListings, ...defaultListings].filter(
    (listing) => !deletedIds.includes(listing.id)
  );
}

export const adminLocalService = {
  getUsers() {
    return Promise.resolve(read(USERS_KEY, adminUsers));
  },

  addUser(payload) {
    const users = read(USERS_KEY, adminUsers);

    const newUser = {
      id: Date.now(),
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password || "Password123!",
      studentId: payload.studentId || `C${Date.now().toString().slice(-7)}`,
      program: payload.program || "Computer Systems Technology",
      campus: payload.campus || "Main Campus",
      role: payload.role || "student",
      status: "Active",
      joinedAt: new Date().toISOString(),
      photoUrl: "",
    };

    return Promise.resolve(write(USERS_KEY, [newUser, ...users]));
  },

  updateUser(id, updates) {
    const users = read(USERS_KEY, adminUsers);

    const updated = users.map((user) =>
      user.id === normalizeId(id) ? { ...user, ...updates } : user
    );

    return Promise.resolve(write(USERS_KEY, updated));
  },

  deleteUser(id) {
    const users = read(USERS_KEY, adminUsers);
    const userToDelete = users.find((user) => user.id === normalizeId(id));

    const updatedUsers = users.filter((user) => user.id !== normalizeId(id));
    write(USERS_KEY, updatedUsers);

    if (userToDelete?.email) {
      const listings = read(USER_LISTINGS_KEY, []);

      const updatedListings = listings.filter(
        (listing) => listing.sellerEmail !== userToDelete.email
      );

      write(USER_LISTINGS_KEY, updatedListings);
    }

    return Promise.resolve(updatedUsers);
  },

  getListings() {
    return Promise.resolve(getAllListingsForAdmin());
  },

  addListing(payload) {
    const listings = read(USER_LISTINGS_KEY, []);

    const newListing = {
      id: Date.now(),
      title: payload.title,
      category: payload.category || "Textbooks",
      price: Number(payload.price) || 0,
      description: payload.description || "No description provided.",
      photos: payload.photos || [],
      imageUrl:
        payload.imageUrl ||
        payload.imagePreview ||
        payload.photos?.[0] ||
        FALLBACK_IMAGE,
      imagePreview:
        payload.imageUrl ||
        payload.imagePreview ||
        payload.photos?.[0] ||
        FALLBACK_IMAGE,
      image: payload.imageUrl || payload.imagePreview || payload.photos?.[0] || FALLBACK_IMAGE,
      seller: payload.sellerName || "Admin",
      sellerName: payload.sellerName || "Admin",
      sellerEmail: payload.sellerEmail || "admin@college.ca",
      sellerRating: Number(payload.sellerRating) || 5,
      rating: Number(payload.sellerRating) || 5,
      sellerBio:
        payload.sellerBio ||
        "Verified UniLife seller. Contact to confirm pickup details.",
      status: payload.status || "Active",
      postedAt: new Date().toISOString(),
    };

    return Promise.resolve(write(USER_LISTINGS_KEY, [newListing, ...listings]));
  },

  updateListing(id, updates) {
    const listingId = normalizeId(id);
    const userListings = read(USER_LISTINGS_KEY, []);
    const listingExistsInUserStorage = userListings.some(
      (listing) => listing.id === listingId
    );

    const cleanedUpdates = {
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : updates.price,
      sellerRating:
        updates.sellerRating !== undefined
          ? Number(updates.sellerRating)
          : updates.sellerRating,
      rating:
        updates.sellerRating !== undefined
          ? Number(updates.sellerRating)
          : updates.rating,
      status: updates.status || "Active",
    };

    if (listingExistsInUserStorage) {
      const updatedUserListings = userListings.map((listing) =>
        listing.id === listingId ? { ...listing, ...cleanedUpdates } : listing
      );

      write(USER_LISTINGS_KEY, updatedUserListings);
      return Promise.resolve(updatedUserListings);
    }

    const overrides = read(LISTING_OVERRIDES_KEY, []);
    const existingOverride = overrides.find((item) => item.id === listingId);

    const updatedOverrides = existingOverride
      ? overrides.map((item) =>
          item.id === listingId ? { ...item, ...cleanedUpdates } : item
        )
      : [{ id: listingId, ...cleanedUpdates }, ...overrides];

    write(LISTING_OVERRIDES_KEY, updatedOverrides);

    return Promise.resolve(getAllListingsForAdmin());
  },

  deleteListing(id) {
    const listingId = normalizeId(id);

    const userListings = read(USER_LISTINGS_KEY, []);
    const updatedUserListings = userListings.filter(
      (listing) => listing.id !== listingId
    );
    write(USER_LISTINGS_KEY, updatedUserListings);

    const deletedIds = read(DELETED_LISTINGS_KEY, []);
    const nextDeletedIds = deletedIds.includes(listingId)
      ? deletedIds
      : [...deletedIds, listingId];

    write(DELETED_LISTINGS_KEY, nextDeletedIds);

    return Promise.resolve(getAllListingsForAdmin());
  },

  getReports() {
    return Promise.resolve(read(REPORTS_KEY, adminReports));
  },

  addReport(payload) {
    const reports = read(REPORTS_KEY, adminReports);

    const newReport = {
      id: Date.now(),
      listingId: payload.listingId,
      title: payload.title || "Reported Listing",
      reportedBy: payload.reportedBy || "Student",
      reportedByEmail: payload.reportedByEmail || "",
      reason: payload.reason || "No reason provided.",
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    return Promise.resolve(write(REPORTS_KEY, [newReport, ...reports]));
  },

  updateReport(id, updates) {
    const reports = read(REPORTS_KEY, adminReports);

    const updated = reports.map((report) =>
      report.id === normalizeId(id) ? { ...report, ...updates } : report
    );

    return Promise.resolve(write(REPORTS_KEY, updated));
  },

  deleteReport(id) {
    const reports = read(REPORTS_KEY, adminReports);
    const updated = reports.filter((report) => report.id !== normalizeId(id));

    return Promise.resolve(write(REPORTS_KEY, updated));
  },
};