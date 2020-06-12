export const randomString = () => {
  const entropy = new Uint32Array(10)
  window.crypto.getRandomValues(entropy)

  return window.btoa([...entropy].join(','))
}


