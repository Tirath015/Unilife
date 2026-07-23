# UniLife API Contract Draft

This file shows the backend endpoints the React frontend expects when `VITE_USE_MOCKS=false`.

Base URL example:

```text
http://localhost:5000/api
```

## Authentication

### POST `/auth/register`

Request:

```json
{
  "fullName": "Mehakdeep Kaur",
  "email": "student@college.ca",
  "studentId": "C1234567",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "fullName": "Mehakdeep Kaur",
    "email": "student@college.ca",
    "studentId": "C1234567",
    "program": "Computer Systems Technology",
    "campus": "Main Campus"
  }
}
```

Backend responsibilities:

- Validate college/university email
- Hash password using a secure hashing algorithm
- Store user in SQL Server
- Return signed JWT token

### POST `/auth/login`

Request:

```json
{
  "email": "student@college.ca",
  "password": "Password123",
  "remember": true
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": { "id": 1, "fullName": "Student User", "email": "student@college.ca" }
}
```

### GET `/auth/me`

Headers:

```text
Authorization: Bearer jwt-token
```

Response:

```json
{
  "id": 1,
  "fullName": "Student User",
  "email": "student@college.ca",
  "studentId": "C1234567"
}
```

## Marketplace

### GET `/marketplace/listings`

Query params:

```text
?query=book&category=Textbooks
```

Response:

```json
[
  {
    "id": 1,
    "title": "Java Programming Textbook",
    "price": 48,
    "category": "Textbooks",
    "seller": "Aman S.",
    "sellerRating": 4.8,
    "postedAt": "2026-07-01",
    "imageUrl": "https://example.com/image.jpg",
    "description": "Used for one semester."
  }
]
```

### GET `/marketplace/listings/{id}`

Returns one product listing.

### POST `/marketplace/listings`

Headers:

```text
Authorization: Bearer jwt-token
```

Request:

```json
{
  "title": "Laptop Stand",
  "category": "Electronics",
  "price": 18,
  "description": "Foldable laptop stand."
}
```

Response:

```json
{
  "id": 10,
  "status": "posted"
}
```

## Wishlist

### GET `/wishlist`

Returns the logged-in user's saved listings.

### POST `/wishlist/{productId}`

Adds or toggles a product in the wishlist.

### DELETE `/wishlist/{productId}`

Removes a product from the wishlist.

## Notifications

### GET `/notifications`

Returns Marketplace updates, seller messages, and event reminders.

### PATCH `/notifications/mark-all-read`

Marks all notifications as read.

## Events Prototype

### GET `/events`

Returns campus events.

### POST `/events/{eventId}/register`

Registers the logged-in student for an event.

## Resources Prototype

### GET `/resources`

Returns library, advising, IT support, counselling, tutoring, and emergency contacts.

## Jobs Prototype

### GET `/jobs`

Query params:

```text
?query=react&type=Co-op
```

## Discussions Prototype

### GET `/discussions`

Returns discussion topics.

### POST `/discussions`

Creates a discussion post.

## Bruno AI Prototype

### POST `/bruno/chat`

Request:

```json
{
  "message": "How do I sell an item?"
}
```

Response:

```json
{
  "reply": "Open Marketplace and click Post Listing."
}
```
