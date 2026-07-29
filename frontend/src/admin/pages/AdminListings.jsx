import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { categories, pickupLocations } from "../../data/mockData";
import { adminLocalService } from "../services/adminLocalService";

const emptyListingForm = {
  title: "",
  category: "Textbooks",
  price: "",
  condition: "Good",
  location: "Brampton",
  sellerName: "",
  sellerEmail: "",
  sellerRating: 5,
  status: "Active",
  description: "",
};

export function AdminListings() {
  const [listings, setListings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newListing, setNewListing] = useState(emptyListingForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });

  function loadListings() {
    adminLocalService.getListings().then(setListings);
  }

  useEffect(() => {
    loadListings();
  }, []);

  function handleSort(key) {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (sortConfig.key === "price") {
        return sortConfig.direction === "asc"
          ? Number(aValue || 0) - Number(bValue || 0)
          : Number(bValue || 0) - Number(aValue || 0);
      }

      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [listings, sortConfig]);

  function sortIcon(key) {
    if (sortConfig.key !== key) return "unfold_more";
    return sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward";
  }

  function startEdit(listing) {
    setEditingId(listing.id);

    setEditForm({
      title: listing.title || "",
      category: listing.category || "Textbooks",
      price: listing.price || "",
      condition: listing.condition || "Good",
      location: listing.location || "Brampton",
      description: listing.description || "",
      sellerName: listing.sellerName || listing.seller || "",
      sellerEmail: listing.sellerEmail || "",
      sellerRating: listing.sellerRating || listing.rating || 5,
      status: listing.status || "Active",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function addListing(event) {
    event.preventDefault();

    await adminLocalService.addListing({
      ...newListing,
      price: Number(newListing.price),
      sellerRating: Number(newListing.sellerRating),
      rating: Number(newListing.sellerRating),
    });

    setNewListing(emptyListingForm);
    setShowAddForm(false);
    loadListings();
  }

  async function saveListing(id) {
    await adminLocalService.updateListing(id, {
      ...editForm,
      price: Number(editForm.price),
      sellerRating: Number(editForm.sellerRating),
      rating: Number(editForm.sellerRating),
    });

    cancelEdit();
    loadListings();
  }

  async function toggleListingStatus(listing) {
    const currentStatus = listing.status || "Active";
    const nextStatus = currentStatus === "Active" ? "Hidden" : "Active";

    await adminLocalService.updateListing(listing.id, { status: nextStatus });
    loadListings();
  }

  async function deleteListing(id) {
    const ok = window.confirm("Delete this listing?");
    if (!ok) return;

    await adminLocalService.deleteListing(id);
    loadListings();
  }

  return (
    <>
      <div className="admin-page-heading admin-page-heading-row">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Marketplace Listings</h2>
          <p>Edit, hide, activate, deactivate, or delete marketplace listings.</p>
        </div>

        <button
          type="button"
          className="admin-add-button"
          onClick={() => setShowAddForm((current) => !current)}
        >
          <span className="material-symbols-rounded">add</span>
          Add Listing
        </button>
      </div>

      {showAddForm && (
        <Card className="admin-form-card">
          <form onSubmit={addListing} className="admin-inline-form">
            <label>
              Title
              <input
                value={newListing.title}
                onChange={(event) =>
                  setNewListing({ ...newListing, title: event.target.value })
                }
                required
              />
            </label>

            <label>
              Category
              <select
                value={newListing.category}
                onChange={(event) =>
                  setNewListing({ ...newListing, category: event.target.value })
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
                value={newListing.price}
                onChange={(event) =>
                  setNewListing({ ...newListing, price: event.target.value })
                }
                required
              />
            </label>

            <label>
              Pickup Location
              <select
                value={newListing.location}
                onChange={(event) =>
                  setNewListing({ ...newListing, location: event.target.value })
                }
              >
                {pickupLocations
                  .filter((location) => location !== "Other")
                  .map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Seller Name
              <input
                value={newListing.sellerName}
                onChange={(event) =>
                  setNewListing({
                    ...newListing,
                    sellerName: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Seller Email
              <input
                type="email"
                value={newListing.sellerEmail}
                onChange={(event) =>
                  setNewListing({
                    ...newListing,
                    sellerEmail: event.target.value,
                  })
                }
              />
            </label>

            <button className="admin-add-button" type="submit">
              Save Listing
            </button>
          </form>
        </Card>
      )}

      <Card className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <button className="admin-sort-button" onClick={() => handleSort("title")}>
                  Listing
                  <span className="material-symbols-rounded">{sortIcon("title")}</span>
                </button>
              </th>

              <th>
                <button className="admin-sort-button" onClick={() => handleSort("category")}>
                  Category
                  <span className="material-symbols-rounded">{sortIcon("category")}</span>
                </button>
              </th>

              <th>
                <button className="admin-sort-button" onClick={() => handleSort("price")}>
                  Price
                  <span className="material-symbols-rounded">{sortIcon("price")}</span>
                </button>
              </th>

              <th>
                <button className="admin-sort-button" onClick={() => handleSort("location")}>
                  Pickup Location
                  <span className="material-symbols-rounded">{sortIcon("location")}</span>
                </button>
              </th>

              <th>
                <button className="admin-sort-button" onClick={() => handleSort("sellerName")}>
                  Seller
                  <span className="material-symbols-rounded">{sortIcon("sellerName")}</span>
                </button>
              </th>

              <th>
                <button className="admin-sort-button" onClick={() => handleSort("status")}>
                  Status
                  <span className="material-symbols-rounded">{sortIcon("status")}</span>
                </button>
              </th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedListings.map((listing) => {
              const isEditing = editingId === listing.id;
              const status = listing.status || "Active";

              return (
                <tr key={listing.id}>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm({ ...editForm, title: event.target.value })
                        }
                      />
                    ) : (
                      listing.title
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.category}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            category: event.target.value,
                          })
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
                    ) : (
                      listing.category
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(event) =>
                          setEditForm({ ...editForm, price: event.target.value })
                        }
                      />
                    ) : (
                      `$${Number(listing.price || 0)}`
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.location}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            location: event.target.value,
                          })
                        }
                      >
                        {pickupLocations
                          .filter((location) => location !== "Other")
                          .map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                      </select>
                    ) : (
                      listing.location || "Not selected"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.sellerName}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            sellerName: event.target.value,
                          })
                        }
                      />
                    ) : (
                      listing.sellerName || listing.seller
                    )}
                  </td>

                  <td>
                    <span
                      className={`admin-status ${
                        status === "Hidden" || status === "Sold"
                          ? "blocked"
                          : "active"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  <td>
                    <div className="admin-row-actions">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => saveListing(listing.id)}>
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(listing)}>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleListingStatus(listing)}
                          >
                            {status === "Active" ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => deleteListing(listing.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}