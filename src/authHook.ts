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
    OAuthToken, 
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

/**
 * useStateToken generates a unique state token
 * for the given request, and stores it in expiring
 * localStorage.
 * @param request the request object the state token correlates to
 */
const useNewStateToken = <request>(request: request):
    [StateToken<request>] => {

    const stateToken = {
        entropy: cryptoRandomString(),
        request: request
    }

    const [, setStateToken] = useExpiringStorage<true>(
        `[${statePrefix}] ${JSON.stringify(request)})`,
        { expiresAfterMilliseconds: 1000 * 60 * 60 * 2}
    )

    setStateToken(true);
    return [stateToken];
}

/**
 * useVerifyStateToken verifies a state token
 * is valid, and returns the request it is for.
 * @param token the state token to verify
 */
const useVerifyStateToken = <request>(token: StateToken<request>):
    [true, request] | [undefined | false, undefined] => {
    const [isValid] = useExpiringStorage<boolean>(
        `[${statePrefix}] ${JSON.stringify(token.request)})`,
        { expiresAfterMilliseconds: 1000 * 60 * 60 * 2}
    )

    if (!isValid) return [isValid, undefined];
    return [isValid, token.request];
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
     * Call to get new tokens.
     */
    refresh: (overrides: Partial<authTokenConfig>) => void
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

export const useAuthToken = (rq: authTokenConfig, {
    expiresAfterMilliseconds
}: useAuthTokenOptions):
     useAuthTokenResponse => {


    const authKeyObject: authKeyObject = {
        ...rq,
        response_type: 'id_token token',
    }

    type tokens = {
        oidc: string;
        token: string;
    }

    const [tokens, setTokens] = useExpiringStorage<tokens>(
        authKey(authKeyObject), {
            expiresAfterMilliseconds
        });

    const getNewToken = () => {
        const [stateToken] = useNewStateToken(authKey);

        const requestParams: OidcImplicitRequestParams = {
            ...authKeyObject,
            state: stableStringify(stateToken)
        }

        // if theres a way to do this without reparsing
        // or modifying the incoming object id love to know
        const url = new URL(rq.authUrl.toString());
        url.search =
            MakeOidcImplicitRequestParams(requestParams).toString();
    }
}

