import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../../components/ProductCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useWishlist } from "../../context/WishlistContext";
import { pickupLocations } from "../../data/mockData";
import { marketplaceService } from "../../services/marketplaceService";
import { categoryService } from "../../services/categoryService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

/*
|--------------------------------------------------------------------------
| Normalize listing status from the ASP.NET API
|--------------------------------------------------------------------------
| Backend enum values:
| 1 = Available, 2 = Sold, 3 = Rented, 4 = Removed
*/
function normalizeListingStatus(value) {
  if (typeof value === "number") {
    return value >= 1 && value <= 4 ? value : 1;
  }

  const normalizedValue = String(value ?? "Available")
    .trim()
    .toLowerCase();

  if (normalizedValue === "2" || normalizedValue === "sold") {
    return 2;
  }

  if (normalizedValue === "3" || normalizedValue === "rented") {
    return 3;
  }

  if (
    normalizedValue === "4" ||
    normalizedValue === "removed" ||
    normalizedValue === "hidden"
  ) {
    return 4;
  }

  return 1;
}

function getListingStatusDetails(status) {
  switch (Number(status)) {
    case 2:
      return {
        name: "Sold",
        background: "rgba(153, 27, 27, 0.94)",
        color: "#ffffff",
      };

    case 3:
      return {
        name: "Rented",
        background: "rgba(146, 64, 14, 0.94)",
        color: "#ffffff",
      };

    case 4:
      return {
        name: "Removed",
        background: "rgba(31, 41, 55, 0.94)",
        color: "#ffffff",
      };

    default:
      return {
        name: "Available",
        background: "rgba(22, 101, 52, 0.94)",
        color: "#ffffff",
      };
  }
}

/*
|--------------------------------------------------------------------------
| Find an array inside different ASP.NET response shapes
|--------------------------------------------------------------------------
*/
function findFirstArray(value, visited = new Set()) {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (visited.has(value)) {
    return [];
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return value;
  }

  const preferredKeys = [
    "$values",
    "data",
    "result",
    "items",
    "listings",
    "categories",
    "value",
  ];

  for (const key of preferredKeys) {
    if (key in value) {
      const result = findFirstArray(value[key], visited);

      if (result.length > 0) {
        return result;
      }
    }
  }

  for (const nestedValue of Object.values(value)) {
    const result = findFirstArray(nestedValue, visited);

    if (result.length > 0) {
      return result;
    }
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| Read a property without worrying about capital letters
|--------------------------------------------------------------------------
*/
function getObjectValue(object, possibleNames, fallbackValue = undefined) {
  if (!object || typeof object !== "object") {
    return fallbackValue;
  }

  const keys = Object.keys(object);

  for (const possibleName of possibleNames) {
    const matchingKey = keys.find(
      (key) => key.toLowerCase() === possibleName.toLowerCase()
    );

    if (matchingKey) {
      return object[matchingKey];
    }
  }

  return fallbackValue;
}

/*
|--------------------------------------------------------------------------
| Normalize category response
|--------------------------------------------------------------------------
*/
function normalizeCategory(category) {
  if (!category || typeof category !== "object") {
    return null;
  }

  const categoryId = getObjectValue(category, [
    "categoryId",
    "CategoryId",
    "id",
    "Id",
  ]);

  const name = getObjectValue(category, [
    "name",
    "Name",
    "categoryName",
    "CategoryName",
  ]);

  if (
    categoryId === undefined ||
    categoryId === null ||
    !String(name || "").trim()
  ) {
    return null;
  }

  return {
    categoryId: Number(categoryId),
    name: String(name).trim(),
  };
}

/*
|--------------------------------------------------------------------------
| Read category from a listing
|--------------------------------------------------------------------------
*/
function getListingCategory(listing) {
  const categoryObject = getObjectValue(listing, [
    "category",
    "Category",
  ]);

  // If category is already a string, use it
  if (typeof categoryObject === "string") {
    return categoryObject.trim();
  }

  const categoryNameFromObject = getObjectValue(
    categoryObject,
    ["name", "Name", "categoryName", "CategoryName"],
    ""
  );

  const directCategoryName =
    getObjectValue(listing, [
      "categoryName",
      "CategoryName",
    ]) ||
    getObjectValue(listing, [
      "category",
      "Category",
    ]);

  return String(
    categoryNameFromObject ||
      directCategoryName ||
      "Other"
  ).trim();
}


/*
|--------------------------------------------------------------------------
| Read seller information
|--------------------------------------------------------------------------
*/
function getListingSeller(listing) {
  const userObject = getObjectValue(listing, ["user", "User"]);

  const sellerName =
    getObjectValue(userObject, [
      "fullName",
      "FullName",
      "name",
      "Name",
      "userName",
      "UserName",
    ]) ||
    getObjectValue(listing, [
      "sellerName",
      "SellerName",
      "seller",
      "Seller",
    ]) ||
    "Student Seller";

  const sellerEmail =
    getObjectValue(userObject, ["email", "Email"]) ||
    getObjectValue(listing, ["sellerEmail", "SellerEmail"]) ||
    "";

  return {
    sellerName: String(sellerName),
    sellerEmail: String(sellerEmail),
  };
}

/*
|--------------------------------------------------------------------------
| Read listing images
|--------------------------------------------------------------------------
*/
function getListingImages(listing) {
  const imagesValue = getObjectValue(listing, [
    "images",
    "Images",
    "listingImages",
    "ListingImages",
  ]);

  const imageArray = findFirstArray(imagesValue);

  const normalizedImages = imageArray
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }

      return getObjectValue(image, [
        "imageUrl",
        "ImageUrl",
        "url",
        "Url",
        "path",
        "Path",
        "filePath",
        "FilePath",
      ]);
    })
    .filter(Boolean);

  const directImage = getObjectValue(listing, [
    "imageUrl",
    "ImageUrl",
    "image",
    "Image",
    "photoUrl",
    "PhotoUrl",
  ]);

  if (directImage && !normalizedImages.includes(directImage)) {
    normalizedImages.unshift(directImage);
  }

  return normalizedImages;
}

/*
|--------------------------------------------------------------------------
| Normalize backend listing for ProductCard
|--------------------------------------------------------------------------
*/
function normalizeListing(listing) {
  if (!listing || typeof listing !== "object") {
    return null;
  }

  const listingId = getObjectValue(listing, [
    "listingId",
    "ListingId",
    "id",
    "Id",
  ]);

  if (listingId === undefined || listingId === null) {
    return null;
  }

  const title = getObjectValue(
    listing,
    ["title", "Title"],
    "Untitled Listing"
  );

  const description = getObjectValue(
    listing,
    ["description", "Description"],
    "No description provided."
  );

  const priceValue = getObjectValue(
    listing,
    ["price", "Price"],
    0
  );

  const location = getObjectValue(
    listing,
    ["location", "Location"],
    "Campus"
  );

  const listingTypeValue = Number(
    getObjectValue(
      listing,
      ["listingType", "ListingType"],
      1
    )
  );

  const statusValue = getObjectValue(
    listing,
    ["status", "Status"],
    1
  );

  const numericStatus = normalizeListingStatus(statusValue);
  const statusDetails = getListingStatusDetails(numericStatus);

  const createdAt = getObjectValue(
    listing,
    ["createdAt", "CreatedAt", "postedAt", "PostedAt"],
    new Date().toISOString()
  );

  const viewCount = Number(
    getObjectValue(
      listing,
      ["viewCount", "ViewCount"],
      0
    )
  );

  const category = getListingCategory(listing);
  const { sellerName, sellerEmail } = getListingSeller(listing);
  const photos = getListingImages(listing);

  const mainImage = photos[0] || FALLBACK_IMAGE;

  return {
    ...listing,

    id: Number(listingId),
    listingId: Number(listingId),

    title: String(title),
    description: String(description),
    price: Number(priceValue) || 0,
    location: String(location),

    category,
    categoryName: category,

    listingType: listingTypeValue,
    listingTypeName:
      listingTypeValue === 2 ? "For Rent" : "For Sale",

    seller: sellerName,
    sellerName,
    sellerEmail,

    status: numericStatus,
    statusName: statusDetails.name,
    postedAt: createdAt,
    createdAt,

    viewCount,

    photos,
    image: mainImage,
    imageUrl: mainImage,
    imagePreview: mainImage,

    sellerRating: 5,
    rating: 5,
  };
}

export function Marketplace() {
  const [filters, setFilters] = useState({
    query: "",
    category: "All",
    location: "All",
    sort: "newest",
  });

  const [allListings, setAllListings] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const { isSaved, toggleWishlist } = useWishlist();

  /*
  |--------------------------------------------------------------------------
  | Load backend categories
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoryError("");

      try {
        const response =
          await categoryService.getAllCategories();

        console.log("MARKETPLACE CATEGORY RESPONSE:", response);

        const extractedCategories = findFirstArray(response);

        const normalizedCategories = extractedCategories
          .map(normalizeCategory)
          .filter(Boolean);

        if (!cancelled) {
          setCategoryList(normalizedCategories);
        }
      } catch (err) {
        console.error(
          "MARKETPLACE CATEGORY ERROR:",
          err
        );

        if (!cancelled) {
          setCategoryError(
            err?.message ||
              "Unable to load marketplace categories."
          );

          setCategoryList([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load all backend listings
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setError("");

      try {
        /*
         * We load all listings from GET /api/Listing.
         * Search and filters are applied below in React.
         */
        const response =
          await marketplaceService.getListings();

        console.log(
          "MARKETPLACE LISTING RESPONSE:",
          response
        );

        console.log(
          "MARKETPLACE LISTING JSON:",
          JSON.stringify(response, null, 2)
        );

        const extractedListings = findFirstArray(response);

        console.log(
          "EXTRACTED MARKETPLACE LISTINGS:",
          extractedListings
        );

        const normalizedListings = extractedListings
          .map(normalizeListing)
          .filter(Boolean);

        console.log(
          "NORMALIZED MARKETPLACE LISTINGS:",
          normalizedListings
        );

        if (!cancelled) {
          setAllListings(normalizedListings);
        }
      } catch (err) {
        console.error(
          "MARKETPLACE LISTING ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load marketplace listings."
          );

          setAllListings([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Filter and sort listings
  |--------------------------------------------------------------------------
  */
  const filteredListings = useMemo(() => {
    const searchQuery = filters.query
      .trim()
      .toLowerCase();

    const result = allListings.filter((listing) => {
      // Removed listings remain visible to the owner in My Listings,
      // but they are hidden from the public Marketplace page.
      const isPublicListing = Number(listing.status) !== 4;

      const searchableContent = `
        ${listing.title || ""}
        ${listing.description || ""}
        ${listing.category || ""}
        ${listing.location || ""}
        ${listing.sellerName || ""}
      `.toLowerCase();

      const matchesSearch =
        searchQuery === "" ||
        searchableContent.includes(searchQuery);

      const matchesCategory =
        filters.category === "All" ||
        listing.category === filters.category;

      const matchesLocation =
        filters.location === "All" ||
        listing.location === filters.location;

      return (
        isPublicListing &&
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    });

    if (filters.sort === "price-low") {
      result.sort(
        (firstListing, secondListing) =>
          Number(firstListing.price) -
          Number(secondListing.price)
      );
    }

    if (filters.sort === "price-high") {
      result.sort(
        (firstListing, secondListing) =>
          Number(secondListing.price) -
          Number(firstListing.price)
      );
    }

    if (filters.sort === "newest") {
      result.sort((firstListing, secondListing) => {
        const firstDate = new Date(
          firstListing.createdAt || 0
        ).getTime();

        const secondDate = new Date(
          secondListing.createdAt || 0
        ).getTime();

        return secondDate - firstDate;
      });
    }

    return result;
  }, [allListings, filters]);

  function updateFilter(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      query: "",
      category: "All",
      location: "All",
      sort: "newest",
    });
  }

  return (
    <>
      <div className="marketplace-header-row">
        <div>
          <span className="eyebrow">
            Marketplace
          </span>

          <h1>Campus Marketplace</h1>

          <p>
            Search student listings, choose a pickup
            location, and browse by category.
          </p>
        </div>

   <div className="marketplace-header-actions">
  <Link
    to="/wishlist"
    className="marketplace-wishlist-button"
  >
    <span className="material-symbols-rounded">
      favorite
    </span>

    Wishlist
  </Link>

  <Link
    to="/my-listings"
    className="marketplace-wishlist-button"
  >
    <span className="material-symbols-rounded">
      inventory_2
    </span>

    My Listings
  </Link>

  <Link
    to="/messages"
    className="marketplace-wishlist-button"
  >
    <span className="material-symbols-rounded">
      chat
    </span>

    Messages
  </Link>

  <Link
    to="/marketplace/create"
    className="marketplace-post-button"
  >
    <span className="material-symbols-rounded">
      add
    </span>

    Post Listing
  </Link>
</div>
</div>

      <section className="marketplace-layout">
        <div className="marketplace-main">
          <div className="marketplace-filter-panel card">
            <div className="marketplace-search-row">
              <label className="marketplace-search-field">
                <span className="material-symbols-rounded">
                  search
                </span>

                <input
                  type="search"
                  placeholder="Search textbooks, laptop, jacket..."
                  value={filters.query}
                  onChange={(event) =>
                    updateFilter(
                      "query",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="marketplace-select-field">
                <span className="material-symbols-rounded">
                  location_on
                </span>

                <select
                  value={filters.location}
                  onChange={(event) =>
                    updateFilter(
                      "location",
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Locations
                  </option>

                  {pickupLocations
                    .filter(
                      (location) =>
                        location !== "Other"
                    )
                    .map((location) => (
                      <option
                        key={location}
                        value={location}
                      >
                        {location}
                      </option>
                    ))}
                </select>
              </label>

              <label className="marketplace-select-field">
                <span className="material-symbols-rounded">
                  sort
                </span>

                <select
                  value={filters.sort}
                  onChange={(event) =>
                    updateFilter(
                      "sort",
                      event.target.value
                    )
                  }
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>
                </select>
              </label>

              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>

            <div className="marketplace-category-section">
              <span className="category-section-label">
                Shop by category
              </span>

              {categoriesLoading && (
                <p className="category-loading-message">
                  Loading categories...
                </p>
              )}

              {!categoriesLoading &&
                categoryError && (
                  <p className="category-error-message">
                    {categoryError}
                  </p>
                )}

              {!categoriesLoading &&
                !categoryError && (
                  <div className="category-pill-row">
                    <button
                      type="button"
                      className={`category-pill ${
                        filters.category === "All"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateFilter(
                          "category",
                          "All"
                        )
                      }
                    >
                      All
                    </button>

                    {categoryList.map((category) => (
                      <button
                        type="button"
                        key={category.categoryId}
                        className={`category-pill ${
                          filters.category ===
                          category.name
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          updateFilter(
                            "category",
                            category.name
                          )
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {loading && (
            <LoadingState label="Loading marketplace listings..." />
          )}

          {!loading && error && (
            <EmptyState
              title="Unable to load listings"
              body={error}
            />
          )}

          {!loading &&
            !error &&
            filteredListings.length === 0 && (
              <EmptyState
                title="No listings found"
                body="Try another search, category, or pickup location."
              />
            )}

          {!loading &&
            !error &&
            filteredListings.length > 0 && (
              <div className="product-grid">
                {filteredListings.map(
                  (product) => {
                    const productId =
                      product.listingId ??
                      product.id;

                    const statusDetails =
                      getListingStatusDetails(product.status);

                    const isUnavailable =
                      Number(product.status) === 2 ||
                      Number(product.status) === 3;

                    return (
                      <div
                        key={productId}
                        style={{
                          position: "relative",
                          minWidth: 0,
                          opacity: isUnavailable ? 0.86 : 1,
                        }}
                      >
                        <span
                          aria-label={`Listing status: ${statusDetails.name}`}
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            zIndex: 10,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "7px 12px",
                            borderRadius: "999px",
                            background: statusDetails.background,
                            color: statusDetails.color,
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            lineHeight: 1,
                            textTransform: "uppercase",
                            pointerEvents: "none",
                          }}
                        >
                          {statusDetails.name}
                        </span>

                        <ProductCard
                          product={product}
                          saved={isSaved(productId)}
                          onToggleWishlist={() =>
                            toggleWishlist(productId)
                          }
                        />
                      </div>
                    );
                  }
                )}
              </div>
            )}
        </div>
      </section>
    </>
  );

}