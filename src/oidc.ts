import { OAuthImplicitRequest } from "./oauth";
import { BCP47LanguageTag } from "./BCP47";
import { filterUndefinedFromObject } from './util';

/*
    This file contains types describing OIDC 1.0
    primitives. These types are higher level than
    they might otherwise be: for example, 'scope'
    is a comma separated string, but is represented
    as an array. This is to better represent these
    constructs in typescript.
*/


export const enum OidcPrompt {
    /**
     * The OIDC server must not display any kind of authentication
     * page. If the user is not already suitably authenticated,
     * it is an error.
     */
    none = "none",

    /**
     * The OIDC server should prompt for (re)authentication.
     * if the user cannot be suitably authenticated, it is an
     * error.
     */
    login = "login",

    /**
     * The OIDC server should prompt for user consent
     * before returning to us. If it cannot obtain consent,
     * it is an error.
     */
    consent = "consent",

    /**
     * The Authorization Server SHOULD prompt the End-User to select a user account.
     * This enables an End-User who has multiple accounts at the Authorization Server to select amongst the multiple accounts that they might have current sessions for.
     */
    select_account = "select_account"
}

export const enum OidcDisplay {
    /**
     * Display a UI to fill the whole page.
     */
    page = "page",

    /**
     * Display a UI appropriate for a popup.
     */
    popup = "popup",

    /**
     * Display a UI a touch device can use.
     */
    touch = "touch",

    /**
     * Display a UI a 'feature phone' can use (WAP)
     */
    wap = "wap"

}

export const enum OidcError {
    /**
     * User interaction is needed to authenticate.
     * Can be returned by a request with prompt: none.
     */
    interaction_required = "interaction_required",

    /**
     * A login is needed to authenticate.
     * Can be returned by a request with prompt: none.
     */
    login_required = "login_required",

    /**
     * The user needs to select an account to authenticate.
     * Can be returned by a request with prompt: none.
     */
    account_selection_required = "account_selection_required",

    /**
     * The user needs to consent to authenticate.
     * Can be retuerned by a request with prompt: none.
     */
    consent_required = "consent_required",

    /**
     * The request_uri in the request object is invalid.
     * Only happens during the 'Passing a Request Object
     * By Reference' flow. I don't know why anyone
     * would use that flow though. Seems kinda complicated.
     */
    invalid_request_uri = "invalid_request_uri",

    /**
     * The request_object is invalid. Used when passing a
     * Request object directly. Again, I don't know why
     * you'd use this weirdly complex flow.
     */
    invalid_request_object = "invalid_request_object",

    /**
     * Request parameter is not supported. Wow this error
     * is easy to misinterpret. Also don't know why anyone
     * would use the request parameter flow.
     */
    request_not_supported = "request_not_supported",

    /**
     * Request object by reference flow not supported.
     * I wouldn't use it anyway!!
     */
    request_uri_not_supported = "request_uri_not_supported",

    /**
     * Registration parameter (to register an account) not
     * supported.
     */
    registration_not_supported = "registration_not_supported"
}

/**
 * The parameters of an OIDC implicit grant request.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
 */
export type OidcImplicitRequestParams = Omit<
    OAuthImplicitRequest,
    'scope' | 'response_type'
> &{
    /**
     * OAuth scopes. 'openid' will be added if it
     * is not already a scope.
     */
    scope?: Array<string>,

    /**
     * Expected response type. id_token for just
     * an id token; 'id_token token' for both
     * an OIDC and OAuth 2.0 token at once.
     */
    response_type: 'id_token' | 'id_token token',

    /**
     * Single-use token to prevent replay.
     */
    nonce?: string,

    /**
     * The configured redirect_uri for the client_id.
     */
    redirect_uri: Required<OAuthImplicitRequest>["redirect_uri"],

    /**
     * Used to associate this request with a particular user session
     * to prevent CSRF (also to store other data, as originally
     * intended...).
     */
    state: string,

    /**
     * Used to suggest how the OIDC server should display
     * any UI.
     */
    display?: OidcDisplay,

    /**
     * Used to suggest how the OIDC sever should 
     * prompt for authentication.
     */
    prompt?: OidcPrompt,

    /**
     * Used to ensure the user has last authenticated
     * at least this many seconds ago. If they haven't
     * they'll be prompted to re-authenticate
     */
    max_age?: number,
    
    /**
     * A list of BCP47 language tag values specifying
     * the locale to render the ui for, in order
     * of preference.
     */
    ui_locales?: Array<BCP47LanguageTag | string>,

    /**
     * An id_token previously issued by this Authorization
     * server. This should be used when display: none if
     * possible.
     * 
     * If the user specified by this token cannot be logged in
     * it is an error.
     */
    id_token_hint?: string,

    /**
     * A string identifying a specific account which can 
     * be used to suggest a particular user should sign in.
     * 
     * For example: gamemaster@example.com.
     */
    login_hint?: string,

    /**
     * 
     */
    //acr
    // this thing is annoying and complicated so im leaving
    // it out. amr is better anyway

    /**
     * Used to request that specific claims should be
     * returned in the final ID Token.
     * @see https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter
     */
    claims?: OidcClaimsRequest
}

export type OidcImplicitRequestConfig = OidcImplicitRequestParams & {
    /**
     * The URL of the Authorization Endpoint.
     * @example "https://api.twitch.tv/oauth/authorize"
     * @see https://tools.ietf.org/html/rfc6749#section-3.1
     */
    authUrl: URL
}


/**
 * OIDCImplicitRequestParams constructs the concrete query parameters
 * for an OIDC Implicit request.
 * @param rq The OIDC Implicit Request parameters
 * @returns query parameters as URLSearchParams
 */
export const MakeOidcImplicitRequestParams = (rq: OidcImplicitRequestParams): URLSearchParams => {
    type paramsT = {
        [k in keyof OidcImplicitRequestParams]:
            string | undefined
    };

    const params: paramsT = {
        ...rq,
        redirect_uri: rq.redirect_uri.toString(),
        scope: rq.scope?.join(","),
        max_age: rq.max_age?.toString(),
        ui_locales: rq.ui_locales?.join(" "),
        claims: rq.claims? JSON.stringify(rq.claims): void 0,
    }
    return new URLSearchParams(
        filterUndefinedFromObject<string,string | undefined>(params)
    );
}

/**
 * Used to specify specific claims (fields) that should
 * be present in an ID Token.
 */
export interface OidcClaimsRequest {
    id_token?: {
        [k in keyof OidcIdToken]?: OidcClaimsProperties<OidcIdToken[k]> | null
    },
    userinfo?: {
        [key in keyof UserInfoResponse]?: OidcClaimsProperties<UserInfoResponse[key]> | null
    }
}

/**
 * Used to specify specific properties of an
 * ID Token claim.
 * 
 * Mostly a utility type used to construct OidcClaimsProperties
 */
interface OidcClaimsProperties<T> {
    /**
     * Indicates the claim must be present
     * in the response ID Token.
     */
    essential?: boolean,

    /**
     * The claim must have a given value.
     */
    value?: T

    /**
     * The claim must be returned with one of
     * these values.
     */
    values?: Array<T>
}

/**
 * The eponymous ID Token of OIDC.
 * An actual ID token is a JWT; this 
 * type represents only the raw data
 * contained in such a JWT (in JWT speak, 'claims').
 * @see https://openid.net/specs/openid-connect-core-1_0.html#IDToken
 */
export type OidcIdToken = {
    /**
     * The issuer of this ID Token.
     * A case-sensitive URL.
     */
    iss: URL & { scheme: "https:" }

    /**
     * The audience (client_id) this token is intended
     * for. It may be one, or several.
     */
    aud: string | Array<string>

    /**
     * Single-use token to prevent replay.
     */
    nonce?: string

    /**
     * A permanant identifier uniquely identifying this user
     * in the context of the issuer.
     * 
     * This could, for example be a username or better
     * still a user id.
     */
    sub: string

    /**
     * The time on, or after which the ID Token is invalid.
     */
    exp: Date

    /**
     * When the token was issued.
     */
    iat: Date

    /**
     * Time when the user authentication occurred.
     * Only required when max_age is requested or when
     * auth_time is an Essential Claim via the 'claims'
     * request parameter.
     */
    auth_time?: Date

    /**
     * List of strings identifying authentication methods
     * (for example a user using 2FA). There is no
     * standard for this in the OIDC 1.0 spec.
     * @example ["2FA"]
     */
    amr?: Array<string>

    /**
     * The party to which this token was issued,
     * when the party to which this token was issued
     * is different from the one this token is the aud(ience)
     * for.
     * 
     * For example, a dashboard system might request tokens
     * destined for other systems called by the dashboard
     * software, even if it itself does not use them.
     */
    azp?: string

} & Partial<StandardClaims>

/**
 * Claims that are typically returned by the userinfo
 * request but may also be returned in the ID Token
 * if so requested via the 'claims' request parameter.
 * 
 * This type is not intended to be used directly,
 * but rather to build other types using these standard
 * fields.
 * 
 * @see https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export type StandardClaims = {
    /**
     * A permanant identifier uniquely identifying this user
     * in the context of the issuer.
     * 
     * This could, for example be a username or better
     * still a user id.
     */
    sub: string,

    /**
     * User's full name including suffixes and prefixes,
     * according to their locale and preferences.
     */
    name: string;

    /**
     * Given, or first name of user (space separated)
     */
    given_name: string;

    /**
     * Surname, or last names of user (space separated)
     */
    family_name: string;

    /**
     * Middle name(s) of user (space separated)
     */
    middle_name: string;

    /**
     * Casual name of user.
     */
    nickname: string;
    
    /**
     * Shorthand name the user uses.
     * This shouldn't be trusted to be unique.
     */
    preferred_username: string;

    /**
     * URL of user's profile page
     */
    profile: URL;

    /**
     * URL of user's picture
     */
    picture: URL;

    /**
     * URL of user's webpage.
     */
    website: URL;
    
    /**
     * User's preferred email
     */
    email: string;

    /**
     * Whether the email is verified.
     */
    email_verified: boolean;

    /**
     * User's gender. Spec defines female and male
     * but who cares
     */
    gender: ("female" | "male") | string;

    /**
     * The date the user was born in YYYY-MM-DD format
     * OR YYYY format.
     * @example "1994"
     * @example "1994-05-17"
     */
    birthdate: string;


    /**
     * string from zoneinfo time zone database
     * representing user's time zone
     * @example "Europe/Paris"
     */
    zoneinfo: string;

    /**
     * User's locale as a BCP47 language tag.
     * @example "en-GB"
     */
    locale: string;

    /**
     * User's phone number E.164 is recommended as the format.
     * Extension may be present in RFC 3966 syntax.
     * 
     * @example "+1 (425) 555-1212"
     * @example "+56 (2) 687 2400"
     * @example "+1 (604) 555-1234;ext=567"
     */
    phone_number: string;

    /**
     * Whether the usr's phone number has been verified.
     * If true, phone_number MUST be E.164 / RFC3966
     */
    phone_number_verified: boolean;

    /**
     * User's preferred postal address
     */
    address: OidcAddress;

    /**
     * The last time the user's information
     * was updated
     */
    updated_at: Date;
}

/**
 * The OIDC-specific address form.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim
 */
export type OidcAddress = {
    /**
     * Full mailing address, formatted for display
     * or on a mailing label.
     * 
     * Both \r\n and \n can be used for newlines.
     * @example "15 Fake Ave., Watford, Herts, UK"
     */
    formatted: string;

    /**
     * Full street address component, which MAY include 
     * house number, street name, Post Office Box,
     * and multi-line extended street address information.
     * 
     * Both \r\n and \n can be used for newlines.
     * @example "15 Fake Ave."
     */
    street_address: string;

    /**
     * City or locality
     * @example "Watford"
     */
    locality: string;

    /**
     * State, province, prefecture, or region component
     * @example "Hertfordshire"
     */
    region: string;

    /**
     * Country name
     * @example "UK"
     */
    country: string;
}

/**
 * The successful response from a UserInfo flow.
 * 'iss' and 'aud' are present for signed responses.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse
 */
export type UserInfoResponse = Pick<OidcIdToken, 'sub'> &
    Partial<StandardClaims> & Partial<Pick<OidcIdToken, "iss" | "aud">>

/**
 * Claims that can be requested of an OIDC ID token
 * in a request providing the 'claims' parameter.
 */
export type OidcIdTokenClaim = keyof OidcIdToken

/**
 * Claims that can be requested as part of a userinfo request
 */
export type UserinfoClaim = keyof UserInfoResponse

