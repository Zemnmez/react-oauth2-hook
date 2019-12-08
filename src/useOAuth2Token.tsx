import * as React from 'react';
import { useStorage } from 'react-storage-hook';
import { Map } from 'immutable';


/**
 * storagePrefix is prepended to all
 * keys used by this package.
 */
export const storagePrefix = 'react-oauth2-hook';



export interface OAuth2AuthorizeConfig {
    authorizeUrl: string;
    scope?: Array<string>;
    redirectUri: string;
    clientID: string;
}

export type OIDCRequest = OAuth2AuthorizeConfig & {
    display: OIDC_DISPLAY
}

