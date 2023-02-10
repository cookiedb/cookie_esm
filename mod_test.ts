import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.175.0/testing/asserts.ts";
import { CookieDB } from "./mod.ts";

Deno.test("Intialize CookieDB", () => {
  // Create test directory
  new Deno.Command("cookie", { args: ["init", "./test"] }).outputSync();

  // Create test user
  new Deno.Command("cookie", {
    args: [
      "create_user",
      "./test",
      "--token=UKTZOvKweOG6tyKQl3q1SZlNx7AthowA",
      "--admin",
    ],
  }).outputSync();
});

Deno.test("README demo works", async () => {
  // Run cookie
  const cookieProcess = new Deno.Command("cookie", {
    args: ["start", "./test"],
    stdout: "null",
  }).spawn();

  // Wait two seconds for the cookie instance to start up
  await new Promise((r) => setTimeout(r, 2000));

  /*
   * START README DEMO
   */

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
  assertEquals(await cookieDB.metaTable("users"), {
    schema: {
      name: "string",
      description: "nullable string",
      age: "number",
    },
    size: 0,
  });

  // Get schemas for all table
  assertEquals(await cookieDB.meta(), {
    tables: {
      users: {
        schema: {
          name: "string",
          description: "nullable string",
          age: "number",
        },
      },
    },
    size: 179,
  });

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

  assertEquals(cookieFan, {
    name: "cookie_fan",
    description: null,
    age: 20,
    key: cookieFanKey,
  });

  // Update document
  await cookieDB.update<User>("users", cookieFanKey, {
    name: "cookie_fan",
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

  assertEquals(usersThatStartWithCookie, [
    {
      name: "cookie_fan",
      description: "a huge fan of cookies",
      age: 21,
      key: cookieFanKey,
    },
  ]);

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
    username: "cookie fan",
    token: "a_very_secure_password",
  });
  assertEquals("cookie fan", username);
  assertEquals("a_very_secure_password", token);

  // Regenerate a user's token
  const { token: new_token } = await cookieDB.regenerateToken(
    "cookie_fan",
  );
  assertNotEquals(token, new_token);

  // Delete a user
  await cookieDB.deleteUser("cookie fan");

  /*
   * END README DEMO
   */

  await cookieProcess.kill();
});
