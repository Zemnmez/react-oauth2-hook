interface URLSearchParams {
    entries(): Iterator<[string,string]>
    [Symbol.iterator]: URLSearchParams["entries"]
}