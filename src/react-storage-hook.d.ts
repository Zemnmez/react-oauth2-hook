declare module 'react-storage-hook' {
  export function useStorage(name: string, {
    placeholder, storageArea
  }?: { placeholder?: string, storageArea?: any }): [
    string,
    (newValue: string) => void
  ]
}
