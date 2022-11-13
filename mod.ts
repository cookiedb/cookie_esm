/**
 * A type representing a valid schema
 */
export interface Schema {
  [key: string]: "string" | "string?" | "boolean" | "boolean?" | "number" | "number?" | Schema
}

/**
 * A type representing a valid query
 */
export interface Query {
  [key: string]: string | Query
}

/**
 * Main CookieDB interface
 */
export class CookieDB {
  url: string
  auth: string

  /**
   * @param url The url of the cookieDB server (ex: `http://localhost:8777`)
   * @param auth The auth token of the cookieDB tenant
   * @example
   * ```javascript
   * const cookieDB = new CookieDB('http://localhost:8777', 'UKTZOvKweOG6tyKQl3q1SZlNx7AthowA')
   * ```
   */
  constructor(url: string, auth: string) {
    this.url = url
    this.auth = `Bearer ${auth}`
  }

  /**
   * Create a table by name and with an optional schema
   * @example
   * ```javascript
   * await cookieDB.createTable('users', {
   *  name: 'string',
   *  description: 'string?',
   *  age: 'number'
   * })
   * ``` 
   */
  async createTable(table: string, schema?: Schema) {
    await (await fetch(`${this.url}/create/${table}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth
      },
      body: schema ? JSON.stringify(schema) : undefined
    })).text()
  }

  /**
   * Drops a table by name
   * @example
   * ```javascript
   * await cookieDB.dropTable('users')
   * ``` 
   */
  async dropTable(table: string) {
    await(await fetch(`${this.url}/drop/${table}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth
      }
    })).text()
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
  async insert(table: string, document: any) {
    const res = await fetch(`${this.url}/insert/${table}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth
      },
      body: JSON.stringify(document)
    })

    return await res.text()
  }

  /**
   * Get a document from table by key. Optionally can join documents by foreign keys
   * @example
   * ```javascript
   * await cookieDB.get('users', 'b94a8779-f737-466b-ac40-4dfb130f0eee')
   * ```
   */
  async get(table: string, key: string, expandKeys?: boolean) {
    const res = await fetch(`${this.url}/get/${table}/${key}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth
      },
      body: JSON.stringify({
        expand_keys: !!expandKeys // force into boolean
      })
    })

    return await res.json()
  }

  /**
   * Delete a document from table by key.
   * @example
   * ```javascript
   * await cookieDB.delete('users', 'b94a8779-f737-466b-ac40-4dfb130f0eee')
   * ```
   */
  async delete(table: string, key: string) {
    await(await fetch(`${this.url}/delete/${table}/${key}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth
      }
    })).text()
  }

  /**
   * Update a document from table by key.
   * @example
   * ```javascript
   * await cookieDB.delete('users', 'b94a8779-f737-466b-ac40-4dfb130f0eee', {
   *  name: 'cookie_fan',
   *  description: 'a huge fan of cookies',
   *  age: 21
   * })
   * ```
   */
  async update(table: string, key: string, document: any) {
    await(await fetch(`${this.url}/update/${table}/${key}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth
      },
      body: JSON.stringify(document)
    })).text()
  }

  /**
   * Selects a number of documents from a table. Accepts an options argument that specifies the maximum amount of results, whether to display keys, and whether to join documents by foreign keys.
   * @example
   * ```javascript
   * await cookieDB.select('users', {
   *  name: 'starts_with($, "cookie")'
   * }, {
   *  maxResults: 5,
   *  showKeys: true
   * })
   * ```
   */
  async select(table: string, query: Query | Query[], options?: {maxResults?: number, showKeys?: boolean, expandKeys?: boolean}): Promise<any[]> {
    const res = await fetch(`${this.url}/select/${table}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth
      },
      body: JSON.stringify({
        queries: Array.isArray(query) ? query : undefined,
        query: Array.isArray(query) ? undefined : query,
        max_results: options?.maxResults ?? -1,
        show_keys: options?.showKeys ?? false,
        expand_keys: options?.expandKeys ?? false
      })
    })

    return await res.json()
  }
}