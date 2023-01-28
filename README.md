# CookieDB for ESM

> A fast and correct [CookieDB](https://cookiedb.com) driver for javascript
> runtimes (like Deno, Node, or the web)

Examples for how to use this module can be found on the
[official documentation site](https://docs.cookiedb.com)

Documentation for this module can be found
[here](https://deno.land/x/cookie_driver/mod.ts).

## Example

```typescript
import { CookieDB } from "https://deno.land/x/cookie_driver/mod.ts";

// Initialize instance
const cookieDB = new CookieDB(
  "http://localhost:8777",
  "UKTZOvKweOG6tyKQl3q1SZlNx7AthowA",
);

// Create a table with a schema
await cookieDB.createTable("users", {
  name: "string",
  description: "nullable string",
  age: "number",
});

// Get schema for a table
await cookieDB.metaTable("users");

// Get schemas for all table
await cookieDB.meta();

// Insert document
const cookieFanKey = await cookieDB.insert("users", {
  name: "cookie_fan",
  description: null,
  age: 20,
});

interface User {
  name: string;
  description: string | null;
  age: number;
  key: string;
}

// Get document
const cookieFan = await cookieDB.get<User>("users", cookieFanKey);

// Update document
await cookieDB.update("users", cookieFanKey, {
  description: "a huge fan of cookies",
  age: 21,
});

// Select document by query
const usersThatStartWithCookie = await cookieDB.select(
  "users",
  'starts_with($name, "cookie")',
  {
    maxResults: 5,
  },
);

// Delete document
await cookieDB.delete("users", cookieFanKey);

// Delete documents by query
await cookieDB.deleteByQuery("users", 'starts_with($name, "cookie")');

// Edit the table
await cookieDB.editTable("users", {
  name: "deprecatedUsers",
  schema: {
    name: "string",
  },
  alias: {
    name: "$name",
  },
});

// Drop the table
await cookieDB.dropTable("deprecatedUsers");

// Create a user
const { username, token } = await cookieDB.createUser({
  username: "cookie_fan",
  token: "a_very_secure_password",
});

// Regenerate a user's token
const { token: new_token } = await cookieDB.regenerateToken(
  "cookie_fan",
);

// Delete a user
await cookieDB.deleteUser("cookie_fan");
```

If for some reason you are still using Node.
