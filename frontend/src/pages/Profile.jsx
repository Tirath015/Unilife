import React, { useRef, useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/formatters";
import {marketplaceService} from "../services/marketplaceService";
import { useWishlist } from "../context/WishlistContext";

export function Profile() {
  const { user, updateProfilePhoto } = useAuth();
  const fileInputRef = useRef(null);
  const [profileStats, setProfileStats] = useState({
  myListings: 0,
  wishlist: 0,
});
useEffect(() => {
  async function loadProfileStats() {
    const allListings = await marketplaceService.getListings();
    const wishlistItems = await marketplaceService.getWishlist();

    const myListings = allListings.filter(
      (listing) =>
        listing.sellerEmail?.toLowerCase() === user?.email?.toLowerCase()
    );

    setProfileStats({
      myListings: myListings.length,
      wishlist: wishlistItems.length,
    });
  }

  if (user?.email) {
    loadProfileStats();
  }
}, [user?.email]);

  function handlePhotoClick() {
    fileInputRef.current.click();
  }

  function handlePhotoChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      updateProfilePhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Student profile page prepared for backend profile management."
      />

      <Card className="profile-card">
        <div className="profile-cover" />

        <div className="profile-main-row">
          <div className="profile-photo-section">
  <button
    type="button"
    className="profile-photo-button"
    onClick={handlePhotoClick}
    aria-label="Upload profile photo"
  >
    {user?.photoUrl ? (
      <img
        src={user.photoUrl}
        alt="Profile"
        className="profile-photo-image"
      />
    ) : (
      <span className="profile-photo-initials">
        {getInitials(user?.fullName || "Mehakdeep Kaur")}
      </span>
    )}

    <span className="profile-photo-overlay">
      <span className="material-symbols-rounded">photo_camera</span>
    </span>
  </button>

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="hidden-file-input"
    onChange={handlePhotoChange}
  />

  <p className="profile-photo-hint">Click photo to upload</p>
</div>

          <div>
            <h2>{user?.fullName}</h2>
            <p>{user?.program}</p>
            <p>{user?.campus}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div>
            <span>Campus Email</span>
            <strong>{user?.email}</strong>
          </div>

          <div>
            <span>Student ID</span>
            <strong>{user?.studentId}</strong>
          </div>

          <div>
  <span>My Listings</span>
  <strong>
    {profileStats.myListings} {profileStats.myListings === 1 ? "active" : "active"}
  </strong>
</div>

<div>
  <span>Wishlist</span>
  <strong>
    {profileStats.wishlist} {profileStats.wishlist === 1 ? "saved" : "saved"}
  </strong>
</div>
        </div>
      </Card>

      
    </>
  );
}
