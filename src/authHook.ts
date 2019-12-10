import * as React from 'react';
import { useStorage } from 'react-storage-hook';
import { useExpiringStorage } from './useExpiringStorage'
import { Map } from 'immutable';
import stableStringify from 'json-stable-stringify';

import {
    OidcIdToken,
    OidcImplicitRequestConfig,
    MakeOidcImplicitRequestParams,
    OidcImplicitRequestParams
} from './oidc'
import {
    OAuthToken, OAuthResponseType, 
} from './oauth';

const cryptoRandomString = () => {
    const entropy = new Uint32Array(10);
    window.crypto.getRandomValues(entropy)
    return window.btoa([...entropy].join(","));
}


const storagePrefix = `react-auth-hook`;
const statePrefix = `${storagePrefix}-state`;

type StateToken<request> = {
    entropy: string;
    request: request;
}

type useAuthTokenResponse = {
    /**
     * Who the user is.
     */
    who: OidcIdToken,

    /**
     * An OAuth 2.0 token for the user.
     */
    token: OAuthToken,

    /**
     * Returns an authentication URL that can be used
     * to get new tokens.
     */
    newTokens: () => URL
}

type authTokenConfig =
    Readonly<Omit<OidcImplicitRequestConfig, 'response_type' | 'state' | 'nonce'>>

/**
 * authKeyObject is used to identify and differentiate
 * OIDC requests.
 */
type authKeyObject = Omit<OidcImplicitRequestParams, 'state'>;

/**
 * authKey is used to identify and differentiate
 * OIDC requests.
 */
const authKey = (o: authKeyObject): string =>
    stableStringify(o);


const tokenPrefix = `${storagePrefix}-token`;

export type useAuthTokenOptions = {
    expiresAfterMilliseconds?: number
}

const useStateToken = (r: authKeyObject) => 
    useExpiringStorage<{ entropy: string}>(
        `[${statePrefix}] ${stableStringify(r)}`,
        { expiresAfterMilliseconds: 100 * 60 * 60 * 2}
    );


export const useAuthToken = (rq: authTokenConfig, {
    expiresAfterMilliseconds
}: useAuthTokenOptions):
     useAuthTokenResponse => {


    const authKeyObject: authKeyObject = {
        ...rq,
        response_type: 'id_token token',
    }

    type tokens = {
        who: string;
        token: string;
    }

    const [tokens] = useExpiringStorage<tokens>(
        authKey(authKeyObject), {
            expiresAfterMilliseconds
        });
    
    const { who, token } = tokens ?? {};

    const [, setStateToken] = useStateToken(authKeyObject);

    const getAuthUrl = () => {
        const entropy = cryptoRandomString();

        setStateToken({entropy});

        // if theres a way to do this without reparsing
        // or modifying the incoming object id love to know
        const url = new URL(rq.authUrl.toString());
        url.search =
            MakeOidcImplicitRequestParams({
                ...rq,
                response_type: 'id_token token',
                state: stableStringify({
                    ...rq,
                    entropy
                } as (typeof rq & { entropy: string }))
            }).toString();
        return Object.freeze(url)
    }

    return {
        who,
        token,
        newTokens: getAuthUrl
    }
}

