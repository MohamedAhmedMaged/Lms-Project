# Soft Delete Plugin

## Overview

The Soft Delete Plugin provides a reusable way to implement soft delete functionality in Mongoose schemas. Instead of permanently deleting documents, it marks them as deleted with a timestamp, allowing for data recovery and audit trails.

---

## Schema Field

When you apply this plugin to a schema, it automatically adds a `deletedAt` field:

```javascript
deletedAt: {
    type: Date,
    default: null
}
```

- `null` = document is active (not deleted)
- `Date` = document was soft deleted at this timestamp

---

## Virtual Property: `isDeleted`

Check if a document is deleted without accessing the raw `deletedAt` field:

```javascript
const user = await UserModel.findById(userId);
console.log(user.isDeleted); // true or false
```

---

## Instance Methods

### `softDelete()`

Marks the document as deleted:

```javascript
const user = await UserModel.findById(userId);
await user.softDelete(); // Sets deletedAt to current date
```

### `restore()`

Restores a deleted document:

```javascript
const user = await UserModel.findOne({ _id: userId, deletedAt: { $ne: null } });
await user.restore(); // Sets deletedAt to null
```

---

## Static Methods

### `findActive(filter)`

Find only non-deleted documents:

```javascript
const activeUsers = await UserModel.findActive({ role: "student" });
```

### `findDeleted(filter)`

Find only deleted documents:

```javascript
const deletedUsers = await UserModel.findDeleted({ role: "student" });
```

### `softDeleteById(id)`

Soft delete a document by ID:

```javascript
const deletedUser = await UserModel.softDeleteById(userId);
```

### `restoreById(id)`

Restore a soft-deleted document by ID:

```javascript
const restoredUser = await UserModel.restoreById(userId);
```

---

## Query Middleware

### Automatic Filtering

By default, all queries automatically exclude deleted documents:

```javascript
// These will NOT include deleted users:
const users = await UserModel.find();
const user = await UserModel.findOne({ email: "test@example.com" });
const count = await UserModel.countDocuments();
```

### Including Deleted Documents

To include deleted documents in queries, use the `includeDeleted` option:

```javascript
// Method 1: Use static methods
const allUsers = await UserModel.findActive();
const deletedUsers = await UserModel.findDeleted();

// Method 2: Direct query with includeDeleted (custom implementation needed)
// Not directly supported - use the static methods above
```

---

## The `return` Statement Logic

The plugin includes query middleware that automatically filters out deleted documents:

```javascript
const filterDeleted = function (next) {
  const options = this.getOptions ? this.getOptions() : {};
  if (!options.includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
};
```

### How it works

| Condition                              | Action                          |
| -------------------------------------- | ------------------------------- |
| `includeDeleted: true`                 | Skip filter, show all documents |
| `includeDeleted: false` or `undefined` | Add filter `deletedAt: null`    |

### Visual Flow

```
Query initiated
      ↓
Check options.includeDeleted
      ↓
   ┌──┴──┐
   ↓     ↓
 TRUE   FALSE/undefined
   ↓     ↓
Skip    Add filter
filter  { deletedAt: null }
   ↓     ↓
   └────┘
      ↓
Execute query
```

---

## Example Service Implementation

```javascript
class UserService {
  // Get active users
  async getActiveUsers() {
    return await UserModel.findActive();
  }

  // Soft delete user
  async softDeleteUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");

    return await user.softDelete();
  }

  // Restore user
  async restoreUser(userId) {
    const user = await UserModel.restoreById(userId);
    if (!user) throw new Error("User not found or not deleted");
    return user;
  }

  // Get deleted users (for admin)
  async getDeletedUsers() {
    return await UserModel.findDeleted();
  }
}
```

---

## Applied To These Models

| Model        | Applied         |
| ------------ | --------------- |
| User         | ✓               |
| Course       | ✓               |
| Lesson       | ✓               |
| Review       | ✓               |
| Comment      | ✓               |
| Enrollment   | ✓               |
| Category     | ✓               |
| RefreshToken | ✗ (hard delete) |

---

## Why Soft Delete?

1. **Data Recovery** - Accidental deletes can be undone
2. **Audit Trail** - Keep history of what existed
3. **Referential Integrity** - Prevents broken references
4. **Analytics** - Deleted data still available for reports
5. **Legal Compliance** - Some regulations require data retention
