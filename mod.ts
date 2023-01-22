/**
 * Possible types for schemas
 */
export type SchemaTypes = "string" | "boolean" | "number" | "foreign_key";

/**
 * Possible keywords for schemas
 */
export type SchemaKeywords = SchemaTypes | "nullable" | "unique";

/**
 * A type representing a valid schema
 */
export interface Schema {
  [key: string]:
    | SchemaTypes
    | `nullable ${SchemaTypes}`
    | `${SchemaTypes} nullable`
    | `unique ${SchemaTypes}`
    | `${SchemaTypes} unique`
    | `unique nullable ${SchemaTypes}`
    | `unique ${SchemaTypes} nullable`
    | `${SchemaTypes} unique nullable`
    | `nullable ${SchemaTypes} unique`
    | `${SchemaTypes} nullable unique`
    | `nullable unique ${SchemaTypes}`
    | Schema;
}

/**
 * A type representing valid types for CookieDB
 */
export type ValidTypes = string | number | boolean | null;

/**
 * A type representing a valid document
 */
export interface Document {
  [key: string]: ValidTypes | ValidTypes[] | Document;
}

/**
 * Main CookieDB interface
 */
export class CookieDB {
  url: string;
  auth: string;

  /**
   * @param url The url of the cookieDB server (ex: `http://localhost:8777`)
   * @param auth The auth token of the cookieDB tenant
   * @example
   * ```javascript
   * const cookieDB = new CookieDB('http://localhost:8777', 'UKTZOvKweOG6tyKQl3q1SZlNx7AthowA')
   * ```
   */
  constructor(url: string, auth: string) {
    this.url = url;
    this.auth = `Bearer ${auth}`;
  }

  /**
   * Create a table by name and with an optional schema
   * @example
   * ```javascript
   * await cookieDB.createTable('users', {
   *  name: 'string',
   *  description: 'nullable string',
   *  age: 'number'
   * })
   * ```
   */
  async createTable(table: string, schema?: Schema) {
    const req = await fetch(`${this.url}/create/${table}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
      body: schema ? JSON.stringify(schema) : undefined,
    });

    const res = await req.text();

    if (res !== "success") throw res;
  }

  /**
   * Drops a table by name
   * @example
   * ```javascript
   * await cookieDB.dropTable('users')
   * ```
   */
  async dropTable(table: string) {
    const req = await fetch(`${this.url}/drop/${table}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
    });

    const res = await req.text();

    if (res !== "success") throw res;
  }

  /**
   * Gets metadata for a table by name
   * @example
   * ```javascript
   * await cookieDB.metaTable('users')
   * ```
   */
  async metaTable(table: string): Promise<{
    schema: Schema;
    size: number;
  }> {
    const req = await fetch(`${this.url}/meta/${table}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
    });

    return await req.json();
  }

  /**
   * Insert a document into a table and return key
   * @returns key of inserted document
   * @example
   * ```javascript
   * await cookieDB.insert('users', {
   *  name: 'cookie_fan',
   *  description: null,
   *  age: 20
   * })
   * ```
   */
  async insert<T extends Document | Document[]>(
    table: string,
    document: T,
  ): Promise<T extends Document[] ? string[] : string> {
    const req = await fetch(`${this.url}/insert/${table}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
      body: JSON.stringify(document),
    });

    if (Array.isArray(document)) {
      return await req.json();
    } else {
      // @ts-ignore we return a string conditionally here, but typescript isn't smart enough to narrow types in this situation
      return await req.text();
    }
  }

  /**
   * Get a document from table by key. Optionally can join documents by foreign keys
   * @example
   * ```javascript
   * await cookieDB.get('users', 'b94a8779-f737-466b-ac40-4dfb130f0eee')
   * ```
   */
  async get(
    table: string,
    key: string,
    expandKeys?: boolean,
  ): Promise<Document> {
    const req = await fetch(`${this.url}/get/${table}/${key}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
      body: JSON.stringify({
        expand_keys: expandKeys,
      }),
    });

    return await req.json();
  }

  /**
   * Delete a document from table by key.
   * @example
   * ```javascript
   * await cookieDB.delete('users', 'b94a8779-f737-466b-ac40-4dfb130f0eee')
   * ```
   */
  async delete(table: string, key: string): Promise<string> {
    const req = await fetch(`${this.url}/delete/${table}/${key}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
    });

    return await req.json();
  }

  /**
   * Delete documents from table by query.
   * @example
   * ```javascript
   * await cookieDB.deleteByQuery('users', 'starts_with($name, "cookie")')
   * ```
   */
  async deleteByQuery(table: string, query: string): Promise<string[]> {
    const req = await fetch(`${this.url}/delete/${table}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
      body: JSON.stringify({
        where: query,
      }),
    });

    return await req.json();
  }

  /**
   * Update a document from table by key.
   * @example
   * ```javascript
   * await cookieDB.delete('users', 'b94a8779-f737-466b-ac40-4dfb130f0eee', {
   *  description: 'a huge fan of cookies',
   *  age: 21
   * })
   * ```
   */
  async update(table: string, key: string, document: Document) {
    const req = await fetch(`${this.url}/update/${table}/${key}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
      body: JSON.stringify(document),
    });

    const res = await req.text();

    if (res !== "success") throw res;
  }

  /**
   * Selects a number of documents from a table. Accepts an options argument that specifies the maximum amount of results, whether to display keys, and whether to join documents by foreign keys.
   * @example
   * ```javascript
   * await cookieDB.select('users', 'starts_with($name, "cookie")', {
   *  maxResults: 5,
   * })
   * ```
   */
  async select(
    table: string,
    where?: string,
    options?: {
      maxResults?: number;
      showKeys?: boolean;
      expandKeys?: boolean;
      order?: {
        by: string;
        descending?: boolean;
      };
    },
  ): Promise<Document[]> {
    const req = await fetch(`${this.url}/select/${table}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
      body: JSON.stringify({
        where: where,
        max_results: options?.maxResults,
        show_keys: options?.showKeys,
        expand_keys: options?.expandKeys,
        order: options?.order,
      }),
    });

    return await req.json();
  }

  /**
   * Gets metadata for all tables for this user
   * @example
   * ```javascript
   * await cookieDB.meta()
   * ```
   */
  async meta(): Promise<{
    tables: Record<string, {
      schema: Schema;
    }>;
    size: number;
  }> {
    const req = await fetch(`${this.url}/meta`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
    });

    return await req.json();
  }

  /**
   * Creates a user for this database. Requires an administrator token.
   * @example
   * ```javascript
   * await cookieDB.createUser({ username: "cookie_fan", token: "a_very_secure_password" })
   * ```
   */
  async createUser(
    options?: { username?: string; token?: string; admin?: boolean },
  ): Promise<{
    username: string;
    token: string;
  }> {
    const req = await fetch(`${this.url}/create_user`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
      body: JSON.stringify(options),
    });

    return await req.json();
  }

  /**
   * Deletes a user for this database. Requires an administrator token.
   * @example
   * ```javascript
   * await cookieDB.deleteUser("cookie_fan")
   * ```
   */
  async deleteUser(username: string) {
    const req = await fetch(`${this.url}/delete_user/${username}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
    });

    const res = await req.text();

    if (res !== "success") throw res;
  }

  /**
   * Regenerates a token for a user for this database. Requires an administrator token.
   * @example
   * ```javascript
   * await cookieDB.regenerateToken("cookie_fan")
   * ```
   */
  async regenerateToken(username: string) {
    const req = await fetch(`${this.url}/regenerate_token/${username}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
    });

    return await req.json();
  }
}
