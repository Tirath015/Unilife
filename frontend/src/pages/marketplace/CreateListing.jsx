import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { categories } from "../../data/mockData";
import { marketplaceService } from "../../services/marketplaceService";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export function CreateListing() {
  const [form, setForm] = useState({
    title: "",
    category: "Textbooks",
    price: "",
    description: "",
    photos: [],
  });

  const [postedListing, setPostedListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoChange(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (form.photos.length + files.length > 5) {
      setError("You can upload up to 5 photos only.");
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      setError("Please upload image files only.");
      return;
    }

    const largeFile = files.find((file) => file.size > 2 * 1024 * 1024);

    if (largeFile) {
      setError("Each photo must be smaller than 2 MB.");
      return;
    }

    const uploadedPhotos = await Promise.all(files.map(readFileAsDataUrl));

    setForm((current) => ({
      ...current,
      photos: [...current.photos, ...uploadedPhotos].slice(0, 5),
    }));

    setError("");
    event.target.value = "";
  }

  function removePhoto(indexToRemove) {
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((_, index) => index !== indexToRemove),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const created = await marketplaceService.createListing({
        ...form,
        price: Number(form.price),
        imagePreview: form.photos[0] || "",
        imageUrl: form.photos[0] || "",
        photos: form.photos,
      });

      setPostedListing(created);
    } catch (err) {
      setError(err.message || "Listing could not be posted. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (postedListing) {
    return (
      <Card className="success-page-card">
        <span className="material-symbols-rounded success-icon">
          check_circle
        </span>

        <h1>Listing posted</h1>

        <p>
          Your listing is now saved and will appear in Marketplace. In the final
          version, this form will send data to the ASP.NET Core API and store it
          in SQL Server.
        </p>

        <div className="success-actions">
          <Link className="btn btn-primary btn-md" to="/marketplace">
            Back to Marketplace
          </Link>

          <Link
            className="btn btn-outline btn-md"
            to={`/marketplace/${postedListing.id}`}
          >
            View Listing
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Marketplace"
        title="Create Listing"
        description="Add product details and upload up to 5 photos for your marketplace listing."
      />

      <Card className="listing-form-card">
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid two-col-form">
          <label className="upload-box upload-clickable span-2">
            <input
              className="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
            />

            <span className="material-symbols-rounded">add_photo_alternate</span>
            <strong>Upload product photos</strong>
            <p>
              Click to upload up to 5 photos. The first photo will be used as the
              main marketplace image.
            </p>
          </label>

          {form.photos.length > 0 && (
            <div className="listing-photo-preview-grid span-2">
              {form.photos.map((photo, index) => (
                <div className="listing-photo-preview" key={`${photo}-${index}`}>
                  <img src={photo} alt={`Product preview ${index + 1}`} />

                  <button type="button" onClick={() => removePhoto(index)}>
                    <span className="material-symbols-rounded">close</span>
                  </button>

                  {index === 0 && <span className="main-photo-badge">Main</span>}
                </div>
              ))}
            </div>
          )}

          <label>
            Product Name
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Example: Calculus Textbook"
              required
            />
          </label>

          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories
                .filter((category) => category !== "All")
                .map((category) => (
                  <option key={category}>{category}</option>
                ))}
            </select>
          </label>

          <label>
            Price
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="45"
              required
            />
          </label>

          <label className="span-2">
            Description
            <textarea
              rows="5"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe item condition, pickup details, and included accessories..."
              required
            />
          </label>

          <Button disabled={loading} className="span-2">
            {loading ? "Posting..." : "Post Listing"}
          </Button>
        </form>
      </Card>
    </>
  );
}
