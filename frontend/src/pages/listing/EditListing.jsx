import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listingService } from "../../services/listingService";


export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    listingType: 0,
    categoryId: "",
    latitude: null,
    longitude: null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadEditPage = async () => {
      try {
        setLoading(true);
        setError("");

        // apiRequest returns the response data directly
        const listing =
          await listingService.getListingById(id);

        if (!listing) {
          throw new Error("Listing could not be found.");
        }

        setForm({
          title: listing.title ?? "",
          description: listing.description ?? "",
          price: listing.price ?? "",
          location: listing.location ?? "",
          listingType: listing.listingType ?? 0,
          categoryId: listing.categoryId ?? "",
          latitude: listing.latitude ?? null,
          longitude: listing.longitude ?? null,
        });

        try {
          const categoryResult =
            await listingService.getCategories();

          let categoryList = [];

          if (Array.isArray(categoryResult)) {
            categoryList = categoryResult;
          } else if (
            Array.isArray(categoryResult?.categories)
          ) {
            categoryList = categoryResult.categories;
          } else if (
            Array.isArray(categoryResult?.items)
          ) {
            categoryList = categoryResult.items;
          }

          setCategories(categoryList);
        } catch (categoryError) {
          console.error(
            "Could not load categories:",
            categoryError
          );

          // The listing can still be edited even if
          // the category endpoint is unavailable.
          setCategories([]);
        }
      } catch (loadError) {
        console.error(
          "Could not load listing:",
          loadError
        );

        setError(
          loadError?.message ||
            "Unable to load this listing."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEditPage();
    } else {
      setError("Invalid listing ID.");
      setLoading(false);
    }
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Please enter a listing title.";
    }

    if (!form.description.trim()) {
      return "Please enter a description.";
    }

    if (!form.location.trim()) {
      return "Please enter a location.";
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      return "Please enter a valid price.";
    }

    if (!form.categoryId) {
      return "Please select a category.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updateData = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        location: form.location.trim(),
        listingType: Number(form.listingType),
        categoryId: Number(form.categoryId),
        latitude:
          form.latitude === null ||
          form.latitude === ""
            ? null
            : Number(form.latitude),
        longitude:
          form.longitude === null ||
          form.longitude === ""
            ? null
            : Number(form.longitude),
      };

      await listingService.updateListing(
        id,
        updateData
      );

      setSuccess("Listing updated successfully.");

      setTimeout(() => {
        navigate("/my-listings");
      }, 800);
    } catch (updateError) {
      console.error(
        "Could not update listing:",
        updateError
      );

      setError(
        updateError?.message ||
          "Unable to update the listing."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-listing-loading">
        Loading listing...
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="edit-listing-page">
        <div className="edit-listing-card">
          <div className="edit-listing-message error">
            {error}
          </div>

          <div className="edit-listing-actions">
            <button
              type="button"
              className="edit-listing-cancel-button"
              onClick={() =>
                navigate("/my-listings")
              }
            >
              Back to My Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-listing-page">
      <div className="edit-listing-card">
        <div className="edit-listing-header">
          <h1>Edit Listing</h1>

          <p>
            Update your listing information and save
            the changes.
          </p>
        </div>

        {error && (
          <div className="edit-listing-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="edit-listing-message success">
            {success}
          </div>
        )}

        <form
          className="edit-listing-form"
          onSubmit={handleSubmit}
        >
          <div className="edit-listing-grid">
            <div className="edit-listing-field full-width">
              <label htmlFor="title">
                Listing title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter listing title"
                maxLength={150}
                required
              />
            </div>

            <div className="edit-listing-field full-width">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your item"
                maxLength={2000}
                required
              />
            </div>

            <div className="edit-listing-field">
              <label htmlFor="price">Price</label>

              <input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div className="edit-listing-field">
              <label htmlFor="location">
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="edit-listing-field">
              <label htmlFor="categoryId">
                Category
              </label>

              {categories.length > 0 ? (
                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => {
                    const categoryId =
                      category.categoryId ??
                      category.id;

                    const categoryName =
                      category.name ??
                      category.categoryName ??
                      category.title ??
                      "Category";

                    return (
                      <option
                        key={categoryId}
                        value={categoryId}
                      >
                        {categoryName}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  id="categoryId"
                  name="categoryId"
                  type="number"
                  value={form.categoryId}
                  onChange={handleChange}
                  min="1"
                  placeholder="Category ID"
                  required
                />
              )}
            </div>

            <div className="edit-listing-field">
              <label htmlFor="listingType">
                Listing type
              </label>

              <select
                id="listingType"
                name="listingType"
                value={form.listingType}
                onChange={handleChange}
              >
                <option value={0}>For Sale</option>
                <option value={1}>Wanted</option>
              </select>
            </div>
          </div>

          <div className="edit-listing-actions">
            <button
              type="button"
              className="edit-listing-cancel-button"
              onClick={() =>
                navigate("/my-listings")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-listing-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Update Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}