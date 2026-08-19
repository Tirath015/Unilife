import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

import { useAuth } from "../context/AuthContext";

import { marketplaceService } from "../services/marketplaceService";
import { userService } from "../services/userService";

import { getInitials } from "../utils/formatters";

export function Profile() {
  const { user, updateProfilePhoto } = useAuth();

  const fileInputRef = useRef(null);

  const [profileStats, setProfileStats] = useState({
    myListings: 0,
    wishlist: 0,
  });

  const [profileData, setProfileData] = useState(null);

  const [bio, setBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [bioMessage, setBioMessage] = useState("");
  const [bioError, setBioError] = useState("");

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoadingProfile(true);

        const response =
          await userService.getMyProfile();

        if (cancelled) {
          return;
        }

        setProfileData(response);
        setBio(response?.bio || "");
      } catch (error) {
        console.error(
          "Could not load profile:",
          error
        );

        if (!cancelled) {
          setProfileData(null);
          setBio("");
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileStats() {
      try {
        const [allListingsResponse, wishlistResponse] =
          await Promise.all([
            marketplaceService.getListings(),
            marketplaceService.getWishlist(),
          ]);

        if (cancelled) {
          return;
        }

        const allListings = Array.isArray(
          allListingsResponse
        )
          ? allListingsResponse
          : allListingsResponse?.data || [];

        const wishlistItems = Array.isArray(
          wishlistResponse
        )
          ? wishlistResponse
          : wishlistResponse?.data || [];

        const currentUserId =
          Number(
            user?.userId ??
              user?.id ??
              profileData?.userId
          ) || 0;

        const currentUserEmail =
          user?.email?.toLowerCase() ||
          profileData?.email?.toLowerCase() ||
          "";

        const myListings = allListings.filter(
          (listing) => {
            const listingSellerId = Number(
              listing.userId ??
                listing.sellerId ??
                listing.ownerId
            );

            const listingSellerEmail =
              listing.sellerEmail?.toLowerCase() ||
              listing.user?.email?.toLowerCase() ||
              "";

            if (
              currentUserId &&
              listingSellerId === currentUserId
            ) {
              return true;
            }

            return (
              currentUserEmail &&
              listingSellerEmail === currentUserEmail
            );
          }
        );

        setProfileStats({
          myListings: myListings.length,
          wishlist: wishlistItems.length,
        });
      } catch (error) {
        console.error(
          "Could not load profile statistics:",
          error
        );

        if (!cancelled) {
          setProfileStats({
            myListings: 0,
            wishlist: 0,
          });
        }
      }
    }

    if (
      user?.email ||
      user?.userId ||
      user?.id ||
      profileData?.userId
    ) {
      loadProfileStats();
    }

    return () => {
      cancelled = true;
    };
  }, [
    user?.email,
    user?.userId,
    user?.id,
    profileData?.userId,
    profileData?.email,
  ]);

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("The profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      updateProfilePhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleSaveBio(event) {
    event.preventDefault();

    try {
      setSavingBio(true);
      setBioMessage("");
      setBioError("");

      const currentProfile =
        profileData || user || {};

      const updatedProfile =
        await userService.updateMyProfile({
          fullName:
            currentProfile.fullName ||
            user?.fullName ||
            "",
          phoneNumber:
            currentProfile.phoneNumber ||
            user?.phoneNumber ||
            "",
          bio: bio.trim(),
          city:
            currentProfile.city ||
            user?.city ||
            "",
          province:
            currentProfile.province ||
            user?.province ||
            "",
          country:
            currentProfile.country ||
            user?.country ||
            "",
          preferredContactMethod:
            currentProfile.preferredContactMethod ||
            user?.preferredContactMethod ||
            "",
        });

      setProfileData((current) => ({
        ...(current || {}),
        ...(updatedProfile || {}),
        bio: bio.trim(),
      }));

      setBioMessage(
        "Marketplace bio updated successfully."
      );
    } catch (error) {
      console.error(
        "Could not update bio:",
        error
      );

      setBioError(
        error?.message ||
          "The marketplace bio could not be updated."
      );
    } finally {
      setSavingBio(false);
    }
  }

  const displayUser = profileData || user || {};

  const profilePhoto =
    user?.photoUrl ||
    displayUser.profileImageUrl ||
    displayUser.photoUrl ||
    "";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your account information and public marketplace bio."
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
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="profile-photo-image"
                />
              ) : (
                <span className="profile-photo-initials">
                  {getInitials(
                    displayUser.fullName ||
                      "Student User"
                  )}
                </span>
              )}

              <span className="profile-photo-overlay">
                <span className="material-symbols-rounded">
                  photo_camera
                </span>
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handlePhotoChange}
            />

            <p className="profile-photo-hint">
              Click photo to upload
            </p>
          </div>

          <div className="profile-user-info">
            <h2>
              {displayUser.fullName ||
                "Student User"}
            </h2>

            {displayUser.program && (
              <p>{displayUser.program}</p>
            )}

            {displayUser.campus && (
              <p>{displayUser.campus}</p>
            )}

            <Link
              to="/update-password"
              className="profile-update-password-btn"
            >
              <span className="material-symbols-rounded">
                lock_reset
              </span>

              Update Password
            </Link>
          </div>
        </div>

        <div className="profile-grid">
          <div>
            <span>Campus Email</span>

            <strong>
              {displayUser.email ||
                "Email unavailable"}
            </strong>
          </div>

          <div>
            <span>Student ID</span>

            <strong>
              {displayUser.studentId ||
                "Not provided"}
            </strong>
          </div>

          <div>
            <span>My Listings</span>

            <strong>
              {profileStats.myListings}{" "}
              {profileStats.myListings === 1
                ? "active listing"
                : "active listings"}
            </strong>
          </div>

          <div>
            <span>Wishlist</span>

            <strong>
              {profileStats.wishlist}{" "}
              {profileStats.wishlist === 1
                ? "saved item"
                : "saved items"}
            </strong>
          </div>
        </div>

        <form
          className="profile-bio-section"
          onSubmit={handleSaveBio}
        >
          <div className="profile-bio-heading">
            <div>
              <span>Marketplace Bio</span>

              <p>
                This bio appears on your public seller
                profile.
              </p>
            </div>

            <small>{bio.length}/500</small>
          </div>

          {loadingProfile ? (
            <div className="profile-bio-loading">
              Loading marketplace bio...
            </div>
          ) : (
            <textarea
              rows="5"
              maxLength="500"
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
                setBioMessage("");
                setBioError("");
              }}
              placeholder="Tell buyers about yourself, the kinds of items you sell, and how you prefer to arrange pickup."
              disabled={savingBio}
            />
          )}

          {bioMessage && (
            <div className="profile-bio-message">
              <span className="material-symbols-rounded">
                check_circle
              </span>

              {bioMessage}
            </div>
          )}

          {bioError && (
            <div className="profile-bio-error">
              <span className="material-symbols-rounded">
                error
              </span>

              {bioError}
            </div>
          )}

          <button
            type="submit"
            className="profile-bio-save-button"
            disabled={
              savingBio || loadingProfile
            }
          >
            <span className="material-symbols-rounded">
              save
            </span>

            {savingBio
              ? "Saving..."
              : "Save Marketplace Bio"}
          </button>
        </form>
      </Card>
    </>
  );
}