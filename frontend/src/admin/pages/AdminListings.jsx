import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { adminLocalService } from "../services/adminLocalService";

export function AdminListings() {
  const [listings, setListings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  function loadListings() {
    adminLocalService.getListings().then(setListings);
  }

  useEffect(() => {
    loadListings();
  }, []);

  function startEdit(listing) {
  setEditingId(listing.id);

  setEditForm({
    title: listing.title || "",
    category: listing.category || "Textbooks",
    price: listing.price || "",
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

  async function changeStatus(listing, status) {
    await adminLocalService.updateListing(listing.id, { status });
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
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Marketplace Listings</h2>
          <p>Edit, hide, activate, or delete marketplace listings.</p>
        </div>
      </div>
      <button
  type="button"
  className="admin-add-button"
  onClick={() => setShowAddForm((current) => !current)}
>
  <span className="material-symbols-rounded">add</span>
  Add Listing
</button>

      <Card className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Category</th>
              <th>Price</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {listings.map((listing) => {
              const isEditing = editingId === listing.id;

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
                          setEditForm({ ...editForm, category: event.target.value })
                        }
                      >
                        <option>Textbooks</option>
                        <option>Electronics</option>
                        <option>Furniture</option>
                        <option>Clothing</option>
                        <option>Miscellaneous</option>
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
                          setEditForm({ ...editForm, price: Number(event.target.value) })
                        }
                      />
                    ) : (
                      `$${listing.price}`
                    )}
                  </td>

                  <td>{listing.sellerName}</td>

                  <td>
                    <span
  className={`admin-status ${
    (listing.status || "Active") === "Hidden" ||
    (listing.status || "Active") === "Sold"
      ? "blocked"
      : "active"
  }`}
>
  {listing.status || "Active"}
</span>
                  </td>

                  <td>
                    <div className="admin-row-actions">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveListing(listing.id)}>Save</button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(listing)}>Edit</button>
                          <button onClick={() => changeStatus(listing, "Active")}>
                            Activate
                          </button>
                          <button onClick={() => changeStatus(listing, "Hidden")}>
                            Hide
                          </button>
                          <button
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
