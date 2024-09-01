/**
 * Get a limited array with a specified maximum number of elements.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The original array.
 * @param {number} limit - The maximum number of elements in the limited array.
 * @returns {T[]} - A new array with a maximum number of elements.
 *
 * @example
 * // Get a limited array with 3 elements
 * const originalArray = [1, 2, 3, 4, 5];
 * const limitedArray = getLimitedArray(originalArray, 3);
 * // limitedArray is [1, 2, 3]
 */
export const getLimitedArray = <T>(array: T[], limit: number): T[] =>
  array ? Array.from(array.slice(0, Math.min(array.length, limit))) : []

export const getUniqueArray = <T>(array: T[]): T[] => Array.from(new Set(array))

/**
 * Segment an array into at most a specified number of segments.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The original array to be segmented.
 * @param {number} [segmentLimit=10] - The maximum number of segments (default is 10).
 * @returns {T[][]} - An array of segments, each containing a subset of the original array.
 */
export const getSegmentedArray = <T>(
  arr: T[],
  segmentLimit: number = 10,
): T[][] => {
  const segments: T[][] = []
  let startIndex = 0

  while (startIndex < arr.length) {
    const segment = getLimitedArray(arr.slice(startIndex), segmentLimit)
    segments.push(segment)
    startIndex += segment.length
  }

  return segments
}

export const getRangedArray = ({
  min = 1,
  max,
}: {
  min?: number
  max: number
}): number[] => Array.from({ length: max - min + 1 }, (_, index) => index + min)

/**
 * Converts the values of an object into strings and returns a new object with the same keys.
 * @param {object} object - The object whose values need to be converted to strings.
 * @returns {Record<string, string>} - A new object with the same keys as the input object, but with stringified values.
 * @example
 * const inputObject = { a: 123, b: true, c: { x: 1, y: 2 } };
 * const stringifiedObject = getStringifiedRecord(inputObject);
 * // stringifiedObject is { a: "123", b: "true", c: "[object Object]" }
 */
export const getStringifiedRecord = (object: object): Record<string, string> =>
  Object.entries(object).reduce(
    (result, [key, value]) => {
      result[key] = String(value)
      return result
    },
    {} as Record<string, string>,
  )

/**
 * Flattens a nested object and returns an array of key-value pairs.
 *
 * @param {object} o - The input object to be flattened.
 * @param {Object} options - Options for flattening the object.
 * @param {boolean} [options.usePrefix=true] - Indicates whether to use a prefix for keys.
 * @param {Object} [options.cfg] - Configuration object for customizing prefix and delimiter.
 * @param {string} [options.cfg.prefix=''] - The prefix to be used for keys.
 * @param {string} [options.cfg.delimiter='.'] - The delimiter to be used between nested keys.
 *
 * @returns {[string, string][]} An array of key-value pairs representing the flattened object.
 */
export const getFlattenedObject = (
  o: object,
  {
    usePrefix = true,
    cfg = {
      prefix: '',
      delimiter: '.',
    },
  },
): [string, string][] =>
  Object.entries(o)
    .filter(([, v]) => v != null)
    .flatMap(([k, v]) => {
      const key = usePrefix ? `${cfg.prefix}${k}` : k
      cfg.prefix = usePrefix ? `${cfg.prefix}${k}${cfg.delimiter}` : ''
      return Object(v) === v
        ? getFlattenedObject(v, { usePrefix, cfg })
        : [[key, String(v).trim()]]
    })

/**
 * Returns a unique list of objects based on a specified key.
 * @template T - The type of the objects in the array.
 * @param {T[]} array - The array of objects.
 * @param {keyof T} key - The key to determine uniqueness.
 * @returns {T[]} - A new array of unique objects based on the specified key.
 * @example
 * const users = [
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' },
 *   { id: 3, name: 'John' },
 * ];
 *
 * const uniqueUsers = getUniqueObjectList(users, 'name');
 * // uniqueUsers: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 */
export const getUniqueObjectList = <T>(array: T[], key: keyof T): T[] => {
  if (!array.length || !key) return array
  return Array.from(new Map(array.map((item) => [item[key], item])).values())
}

/**
 * Recursively deep compares two objects for equality.
 *
 * @template T - The type of the objects being compared.
 * @param {T} obj1 - The first object.
 * @param {T} obj2 - The second object.
 * @returns {boolean} - `true` if the objects are deeply equal, `false` otherwise.
 */
export const isEqual = <T>(obj1: T, obj2: T): boolean => {
  if (obj1 === obj2) {
    return true
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1) as Array<keyof T>
  const keys2 = Object.keys(obj2) as Array<keyof T>

  if (keys1.length !== keys2.length) {
    return false
  }

  return keys1.every((key) => isEqual(obj1[key], obj2[key]))
}

export const isFulfilled = <T>(
  val: PromiseSettledResult<T>,
): val is PromiseFulfilledResult<T> => val.status === 'fulfilled'

export const isSimilarStrings = (str1: string, str2: string): boolean => {
  return str1.includes(str2) || str2.includes(str1)
}

export const getShuffledArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array]
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }
  return shuffledArray
}

export const getNameInitials = (name: string): string => {
  const words = name.trim().split(' ')
  if (words.length === 1) {
    // Handle single-word names
    return words[0].charAt(0).toUpperCase()
  } else {
    // Handle multi-word names
    const initials = words.map((word) => word.charAt(0).toUpperCase()).join('')
    return initials
  }
}
