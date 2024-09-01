import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class values into a single string for applying CSS classes.
 * @param {...ClassValue[]} inputs - The class values to be combined.
 * @returns {string} - A string representing the combined class values.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

/**
 * Converts a string to a base64-encoded string.
 * @param {string} str - The string to be converted to base64.
 * @returns {string} - The base64-encoded string.
 * @see NextImage
 */
export const toBase64 = (str: string): string =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

export const copyToClipboard = (content: string) =>
  navigator.clipboard.writeText(content)

export const getRootRoute = (route: string) => {
  const regex = /^(\/[^/]+).*$/
  const routes = route.match(regex)
  return routes?.[1] ?? ''
}
