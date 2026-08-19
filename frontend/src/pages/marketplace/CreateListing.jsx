import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { pickupLocations } from "../../data/mockData";
import { marketplaceService } from "../../services/marketplaceService";
import { categoryService } from "../../services/categoryService";

import { aiListingService } from "../../services/aiListingService";

function getLoggedInUser() {
  const possibleKeys = [
    "user",
    "currentUser",
    "unilife_user",
    "auth_user",
  ];

  for (const key of possibleKeys) {
    try {
      const storedValue = localStorage.getItem(key);

      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Unable to read ${key}:`, error);
    }
  }

  return null;
}

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
    "categories",
    "items",
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

function normalizeCategory(category) {
  if (!category || typeof category !== "object") {
    return null;
  }

  const keys = Object.keys(category);

  const idKey = keys.find((key) => {
    const normalizedKey = key.toLowerCase();

    return (
      normalizedKey === "categoryid" ||
      normalizedKey === "id"
    );
  });

  const nameKey = keys.find((key) => {
    const normalizedKey = key.toLowerCase();

    return (
      normalizedKey === "name" ||
      normalizedKey === "categoryname"
    );
  });

  const categoryId = idKey ? category[idKey] : null;
  const name = nameKey ? category[nameKey] : "";

  if (
    categoryId === null ||
    categoryId === undefined ||
    !String(name).trim()
  ) {
    return null;
  }

  return {
    categoryId: Number(categoryId),
    name: String(name).trim(),
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maximumWidth = 700;
        const scale = Math.min(maximumWidth / image.width, 1);

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Unable to process the selected image."));
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg", 0.55));
      };

      image.onerror = () => {
        reject(new Error("Unable to load the selected image."));
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected file."));
    };

    reader.readAsDataURL(file);
  });
}

export function CreateListing() {
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    price: "",
    listingType: "1",
    location: pickupLocations[0] || "",
    customLocation: "",
    description: "",
    latitude: "",
    longitude: "",
    photos: [],
    imageFile: null,
  });

  const [categoryList, setCategoryList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [postedListing, setPostedListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [generatingDescription, setGeneratingDescription] =
    useState(false);

  const [aiDescriptionError, setAiDescriptionError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);
      setError("");

      try {
        const response =
          await categoryService.getAllCategories();

        console.log("CATEGORY RESPONSE:", response);
        console.log(
          "CATEGORY JSON:",
          JSON.stringify(response, null, 2)
        );

        const extractedCategories = findFirstArray(response);

        console.log(
          "EXTRACTED CATEGORIES:",
          extractedCategories
        );

        const normalizedCategories = extractedCategories
          .map(normalizeCategory)
          .filter(Boolean);

        console.log(
          "NORMALIZED CATEGORIES:",
          normalizedCategories
        );

        if (cancelled) {
          return;
        }

        setCategoryList(normalizedCategories);

        if (normalizedCategories.length > 0) {
          setForm((current) => ({
            ...current,
            categoryId:
              current.categoryId ||
              String(normalizedCategories[0].categoryId),
          }));
        } else {
          setError(
            "The category API responded, but no valid categories could be read. Check the browser console."
          );
        }
      } catch (err) {
        console.error("CATEGORY LOADING ERROR:", err);

        if (!cancelled) {
          setCategoryList([]);
          setError(
            err?.message ||
              "Categories could not be loaded from the backend."
          );
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

  function updateForm(fieldName, value) {
    setForm((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      const preview = await readFileAsDataUrl(file);

      setForm((current) => ({
        ...current,
        imageFile: file,
        photos: [preview],
      }));

      setError("");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to process the selected image."
      );
    } finally {
      event.target.value = "";
    }
  }

  function removePhoto(indexToRemove) {
    setForm((current) => ({
      ...current,
      imageFile: indexToRemove === 0 ? null : current.imageFile,
      photos: current.photos.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  }

  async function handleGenerateDescription() {
    setAiDescriptionError("");

    const title = form.title.trim();

    if (!title) {
      setAiDescriptionError(
        "Enter a product name before using the AI suggestion."
      );
      return;
    }

    const selectedCategory = categoryList.find(
      (category) =>
        Number(category.categoryId) ===
        Number(form.categoryId)
    );

    const finalLocation =
      form.location === "Other"
        ? form.customLocation.trim()
        : form.location.trim();

    const listingTypeText =
      Number(form.listingType) === 2
        ? "For Rent"
        : "For Sale";

    try {
      setGeneratingDescription(true);

      const response =
        await aiListingService.generateDescription({
          title,
          categoryName: selectedCategory?.name || "",
          condition: listingTypeText,
          price: form.price
            ? Number(form.price)
            : null,
          location: finalLocation,
          keyDetails: "",
          existingDescription:
            form.description.trim(),
        });

      const suggestedDescription =
        response?.description ||
        response?.data?.description ||
        "";

      if (!suggestedDescription.trim()) {
        throw new Error(
          "The AI did not return a description."
        );
      }

      setForm((current) => ({
        ...current,
        description: suggestedDescription.trim(),
      }));
    } catch (err) {
      console.error(
        "AI DESCRIPTION GENERATION ERROR:",
        err
      );

      setAiDescriptionError(
        err?.message ||
          "The AI description could not be generated."
      );
    } finally {
      setGeneratingDescription(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const loggedInUser = getLoggedInUser();

    console.log("LOGGED-IN USER:", loggedInUser);

    const userId =
      loggedInUser?.userId ??
      loggedInUser?.UserId ??
      loggedInUser?.id ??
      loggedInUser?.Id;

    if (!userId) {
      setError(
        "User ID was not found. Please log out and log in again."
      );
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();

    const finalLocation =
      form.location === "Other"
        ? form.customLocation.trim()
        : form.location.trim();

    const price = Number(form.price);
    const categoryId = Number(form.categoryId);
    const listingType = Number(form.listingType);

    if (!title) {
      setError("Product name is required.");
      return;
    }

    if (!description) {
      setError("Description is required.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than $0.");
      return;
    }

    if (!categoryId) {
      setError("Please select a valid category.");
      return;
    }

    if (![1, 2].includes(listingType)) {
      setError("Please select a valid listing type.");
      return;
    }

    if (!finalLocation) {
      setError("Pickup location is required.");
      return;
    }

    const latitude =
      form.latitude.trim() === ""
        ? null
        : Number(form.latitude);

    const longitude =
      form.longitude.trim() === ""
        ? null
        : Number(form.longitude);

    if (
      latitude !== null &&
      (!Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90)
    ) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (
      longitude !== null &&
      (!Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    const requestBody = {
      title,
      description,
      price,
      location: finalLocation,
      listingType,
      categoryId,
      userId: Number(userId),
      latitude,
      longitude,
      imageFile: form.imageFile,
    };

    console.log("CREATE LISTING REQUEST:", requestBody);

    setLoading(true);

    try {
      const createdListing =
        await marketplaceService.createListing(requestBody);

      console.log(
        "CREATED LISTING RESPONSE:",
        createdListing
      );

      setPostedListing(createdListing);
    } catch (err) {
      console.error("CREATE LISTING ERROR:", err);

      setError(
        err?.message ||
          "Listing could not be posted. Check the browser console."
      );
    } finally {
      setLoading(false);
    }
  }

  if (postedListing) {
    const listingId =
      postedListing.listingId ??
      postedListing.ListingId ??
      postedListing.id ??
      postedListing.Id;

    return (
      <Card className="success-page-card">
        <span className="material-symbols-rounded success-icon">
          check_circle
        </span>

        <h1>Listing posted</h1>

        <p>
          Your listing was successfully saved in the
          marketplace.
        </p>

        <div className="success-actions">
          <Link
            className="btn btn-primary btn-md"
            to="/marketplace"
          >
            Back to Marketplace
          </Link>

          {listingId && (
            <Link
              className="btn btn-outline btn-md"
              to={`/marketplace/${listingId}`}
            >
              View Listing
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Marketplace"
        title="Create Listing"
        description="Add product details and publish your item to the student marketplace."
      />

      <section className="create-listing-page">
        {error && (
          <div className="form-error create-listing-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="create-listing-layout"
        >
          <Card className="listing-upload-card">
            <div className="listing-card-heading">
              <span className="material-symbols-rounded">
                add_photo_alternate
              </span>

              <div>
                <h2>Product Photos</h2>

                <p>
                  Upload one product image. It will be saved with the listing.
                </p>
              </div>
            </div>

            <label className="modern-upload-box">
              <input
                className="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePhotoChange}
              />

              {form.photos.length > 0 ? (
                <img
                  src={form.photos[0]}
                  alt="Main product preview"
                  className="main-upload-preview"
                />
              ) : (
                <div className="upload-placeholder">
                  <span className="material-symbols-rounded">
                    cloud_upload
                  </span>

                  <strong>Click to preview photos</strong>

                  <small>
                    PNG, JPG, JPEG, or WEBP under 5 MB
                  </small>
                </div>
              )}
            </label>

            {form.photos.length > 0 && (
              <div className="listing-photo-preview-grid">
                {form.photos.map((photo, index) => (
                  <div
                    className="listing-photo-preview"
                    key={`photo-${index}`}
                  >
                    <img
                      src={photo}
                      alt={`Product preview ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <span className="material-symbols-rounded">
                        close
                      </span>
                    </button>

                    {index === 0 && (
                      <span className="main-photo-badge">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="listing-details-card">
            <div className="listing-card-heading">
              <span className="material-symbols-rounded">
                edit_square
              </span>

              <div>
                <h2>Listing Details</h2>

                <p>
                  Fill in the product information students
                  will see.
                </p>
              </div>
            </div>

            <div className="form-grid two-col-form">
              <label>
                Product Name

                <input
                  value={form.title}
                  maxLength={150}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="Example: Calculus Textbook"
                  required
                />
              </label>

              <label>
                Category

                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    updateForm(
                      "categoryId",
                      event.target.value
                    )
                  }
                  disabled={categoriesLoading}
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>

                  {categoryList.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Price

                <input
                  type="number"
                  min="0.01"
                  max="999999"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    updateForm("price", event.target.value)
                  }
                  placeholder="45.00"
                  required
                />
              </label>

              <label>
                Listing Type

                <select
                  value={form.listingType}
                  onChange={(event) =>
                    updateForm(
                      "listingType",
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="1">For Sale</option>
                  <option value="2">For Rent</option>
                </select>
              </label>

              <label className="span-2">
                Pickup Location

                <select
                  value={form.location}
                  onChange={(event) => {
                    const selectedLocation =
                      event.target.value;

                    setForm((current) => ({
                      ...current,
                      location: selectedLocation,
                      customLocation:
                        selectedLocation === "Other"
                          ? current.customLocation
                          : "",
                    }));
                  }}
                  required
                >
                  {pickupLocations.map((location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  ))}
                </select>
              </label>

              {form.location === "Other" && (
                <label className="span-2">
                  Enter Pickup Location

                  <input
                    value={form.customLocation}
                    maxLength={100}
                    onChange={(event) =>
                      updateForm(
                        "customLocation",
                        event.target.value
                      )
                    }
                    placeholder="Example: Sheridan Davis Campus"
                    required
                  />
                </label>
              )}

              <label>
                Latitude

                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={form.latitude}
                  onChange={(event) =>
                    updateForm(
                      "latitude",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                Longitude

                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={form.longitude}
                  onChange={(event) =>
                    updateForm(
                      "longitude",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </label>

              <div className="listing-description-field span-2">
                <div className="listing-description-heading">
                  <label htmlFor="listing-description">
                    Description
                  </label>

                  <button
                    type="button"
                    className="ai-description-button"
                    onClick={handleGenerateDescription}
                    disabled={
                      generatingDescription ||
                      categoriesLoading
                    }
                  >
                    <span className="material-symbols-rounded">
                      auto_awesome
                    </span>

                    {generatingDescription
                      ? "Generating..."
                      : "Suggest with AI"}
                  </button>
                </div>

                <textarea
                  id="listing-description"
                  rows="6"
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) => {
                    updateForm(
                      "description",
                      event.target.value
                    );
                    setAiDescriptionError("");
                  }}
                  placeholder="Describe the item, pickup details, and included accessories..."
                  disabled={generatingDescription}
                  required
                />

                <div className="listing-description-footer">
                  <small>
                    Review and edit the AI suggestion before
                    publishing.
                  </small>

                  <small>
                    {form.description.length}/1000
                  </small>
                </div>

                {aiDescriptionError && (
                  <div className="form-error ai-description-error">
                    {aiDescriptionError}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || categoriesLoading || generatingDescription}
                className="span-2"
              >
                {loading ? "Posting..." : "Post Listing"}
              </Button>
            </div>
          </Card>
        </form>
      </section>
    </>
  );
}