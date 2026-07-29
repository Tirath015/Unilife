import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { categories, pickupLocations } from "../../data/mockData";
import { marketplaceService } from "../../services/marketplaceService";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 700;
        const scale = Math.min(maxWidth / img.width, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.55);
        resolve(compressedImage);
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CreateListing() {
  const [form, setForm] = useState({
    title: "",
    category: "Textbooks & Study Materials",
    price: "",
    condition: "Good",
    customlocation: "On Campus",
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
        description="Add product details, upload photos, and publish your item to the student marketplace."
      />

      <section className="create-listing-page">
        {error && <div className="form-error create-listing-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-listing-layout">
          <Card className="listing-upload-card">
            <div className="listing-card-heading">
              <span className="material-symbols-rounded">
                add_photo_alternate
              </span>

              <div>
                <h2>Product Photos</h2>
                <p>
                  Upload up to 5 photos. The first photo becomes the main image.
                </p>
              </div>
            </div>

            <label className="modern-upload-box">
              <input
                className="file-input"
                type="file"
                accept="image/*"
                multiple
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
                  <span className="material-symbols-rounded">cloud_upload</span>
                  <strong>Click to upload photos</strong>
                  <small>PNG, JPG, or JPEG under 2 MB each</small>
                </div>
              )}
            </label>

            {form.photos.length > 0 && (
              <div className="listing-photo-preview-grid">
                {form.photos.map((photo, index) => (
                  <div className="listing-photo-preview" key={`${photo}-${index}`}>
                    <img src={photo} alt={`Product preview ${index + 1}`} />

                    <button type="button" onClick={() => removePhoto(index)}>
                      <span className="material-symbols-rounded">close</span>
                    </button>

                    {index === 0 && (
                      <span className="main-photo-badge">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="listing-details-card">
            <div className="listing-card-heading">
              <span className="material-symbols-rounded">edit_square</span>

              <div>
                <h2>Listing Details</h2>
                <p>Fill in the product information students will see.</p>
              </div>
            </div>

            <div className="form-grid two-col-form">
              <label>
                Product Name
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Example: Calculus Textbook"
                  required
                />
              </label>

              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {categories
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Price
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                  placeholder="45"
                  required
                />
              </label>

              <label>
                Condition
                <select
                  value={form.condition}
                  onChange={(event) =>
                    setForm({ ...form, condition: event.target.value })
                  }
                >
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Used</option>
                </select>
              </label>

              <label className="span-2">
  Pickup Location
  <select
    value={form.location}
    onChange={(event) =>
      setForm({
        ...form,
        location: event.target.value,
        customLocation: "",
      })
    }
    required
  >
    {pickupLocations.map((location) => (
      <option key={location} value={location}>
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
      onChange={(event) =>
        setForm({ ...form, customLocation: event.target.value })
      }
      placeholder="Example: Sheridan Davis Campus, Brampton Gateway Terminal"
      required
    />
  </label>
)}

              <label className="span-2">
                Description
                <textarea
                  rows="6"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe item condition, pickup details, and included accessories..."
                  required
                />
              </label>

              <Button disabled={loading} className="span-2">
                {loading ? "Posting..." : "Post Listing"}
              </Button>
            </div>
          </Card>
        </form>
      </section>
    </>
  );
}