import * as crypto from '../crypto';
export type Token = string & {
    __StateTokenBrand: 'statetoken'
}

export type Key = string & {
    readonly __StateTokenKey: 'statetoken'
}

interface TokenObject<D> {
    readonly data: D,
    readonly challenge: Key,
}

interface PackResponse {
    /** the packed token itself */
    readonly token: Token
    /** used to verify tokens */
    readonly key: Key
}

export const Pack:
    (data: any) => PackResponse
=
    data => {
        const key = crypto.randomString() as Key;
        const o: TokenObject<any> = {
            data,
            challenge: key
        }

        return {
            token: JSON.stringify(o) as Token,
            key
        }
    }
;

export const Unpack:
    (token: Readonly<Token>, key: Readonly<Key>) => unknown | Error
=
    (token, key) => {
        const obj: TokenObject<unknown> = JSON.parse(token as any as string)

        if (obj.challenge != key) return new Error("incorrect challenge");

        return obj.data;
    }
;

