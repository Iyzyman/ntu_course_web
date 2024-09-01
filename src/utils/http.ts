/**
 * API endpoint specifications.
 *
 * @see HTTP<PathSpecs> for details on usage.
 */
export type PathSpecs = Record<string, string>

export type GetQueryParams = {
  url: URL
  headers?: Record<string, string>
}
export type QueryParams = GetQueryParams & {
  contentType?: string
  data?: Record<string, unknown>
}

/**
 * Executes HTTP GET request with fetch
 */
export const get = async ({
  url,
  headers,
}: GetQueryParams): Promise<Response> =>
  await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
    },
  })

/**
 * Executes HTTP POST request with fetch
 */
export const post = async ({
  url,
  data,
  contentType = 'application/json',
  headers,
}: QueryParams): Promise<Response> =>
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': contentType || 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  })
/**
 * Executes HTTP DELETE request with fetch
 */
export const del = async ({
  url,
  headers,
  data,
}: QueryParams): Promise<Response> =>
  await fetch(url, {
    method: 'DELETE',
    headers,
    body: JSON.stringify(data),
  })

/**
 * Executes HTTP multipart POST request with fetch
 */
export const multi_post = async ({
  url,
  headers,
  data,
}: QueryParams): Promise<Response> =>
  await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

/**
 * Executes HTTP PUT request with fetch
 */
export const put = async ({
  url,
  headers,
  data,
}: QueryParams): Promise<Response> =>
  await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })

export const url = ({
  endpoint,
  route,
  routeParams,
  queryParams,
}: {
  endpoint: string
  route: string
  routeParams?: Record<string, string>
  queryParams?: Record<string, string>
}): URL => {
  let url = `${endpoint}${route}`

  // substitute route params
  if (routeParams) {
    for (const paramKey in routeParams)
      url = url.replace(`:${paramKey}`, routeParams[paramKey] || '')
  }

  // append query params
  if (queryParams && Object.keys(queryParams).length) {
    const params = new URLSearchParams(queryParams)
    url += `?${params.toString()}`
  }
  return new URL(url)
}

/**
 * Helper class for abstracting URL manipulation specifically for
 * API endpoints.
 *
 */
export class HTTP<PathSpecs> {
  apiPrefix: string
  apiEndpoints: PathSpecs
  defaultHeaders: GetQueryParams['headers']

  /**
   * Constructor for `HTTP` helper class.
   *
   * `apiEndpoints` example:
   * ```javascript
   *    {
   *        getBalance: "/zilliqa/addresses/:address",
   *        listTransactions: "/zilliqa/addresses/:address/txs",
   *    };
   * ```
   *
   * @param apiPrefix prefix to add for all endpoints URL construction.
   * @param apiEndpoints see `apiEndpoints` example above.
   * @param defaultHeaders
   */
  constructor(
    apiPrefix: string,
    apiEndpoints: PathSpecs,
    defaultHeaders?: GetQueryParams['headers'],
  ) {
    this.apiPrefix = apiPrefix
    this.apiEndpoints = apiEndpoints
    this.defaultHeaders = defaultHeaders ?? {}
  }

  /**
   * Path generator to obtain URL for a specific endpoint
   * provided in the constructor.
   *
   * example usage:
   * ```javascript
   * const http = new HTTP("http://localhost/api", { getUser: "/users/:user_id/detail" });
   * const url = http.path("getUser", { user_id: 42 }, { access_token: "awesomeAccessToken" });
   * // url: http://localhost/api/users/42/detail?access_token=awesomeAccessToken
   * ```
   *
   * @param path a key of apiEndpoints provided in the constructor.
   * @param routeParams object map for route parameters.
   * @param queryParams object map for query parameters.
   */
  path = ({
    path,
    routeParams,
    queryParams,
  }: {
    path: keyof PathSpecs
    routeParams?: Record<string, string>
    queryParams?: Record<string, string>
  }) => {
    const route = this.apiEndpoints[path] as string
    return url({
      endpoint: this.apiPrefix,
      route: route,
      routeParams,
      queryParams,
    })
  }

  /**
   * Executes HTTP GET request with fetch
   */
  get = get

  /**
   * Executes HTTP POST request with fetch
   */
  post = post

  /**
   * Executes HTTP DELETE request with fetch
   */
  del = del

  /**
   * Executes HTTP multipart POST request with fetch
   */
  multi_post = multi_post

  /**
   * Executes HTTP PUT request with fetch
   */
  put = put
}
