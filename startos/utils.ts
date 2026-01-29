// Here we define any constants or functions that are shared by multiple components
// throughout the package codebase. This file will be unnecessary for many packages.

export const gamePort = 25565
export const rconPort = 25575
export const webAdminPort = 4326
export const webAdminWsPort = 4327

export function getRandomString(options: {
  charset: 'alphanumeric' | 'hex'
  len: number
}): string {
  const chars = options.charset === 'alphanumeric'
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    : '0123456789abcdef'
  let result = ''
  const bytes = crypto.getRandomValues(new Uint8Array(options.len))
  for (let i = 0; i < options.len; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}
