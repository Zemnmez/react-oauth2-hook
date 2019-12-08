/*
    This file contains types describing OAuth 2.0
    primitives. These types are higher level than
    they might otherwise be: for example, 'scope'
    is a comma separated string, but is represented
    as an array. This is to better represent these
    constructs in typescript.
*/


export const enum oauthError {
    /**
     * The request is missing a required parameter, includes
     * an invalid parameter value, includes a parameter more
     * than once or is otherwise malformed.
     */
    invalid_request = "invalid_request",

    /**
     * The client is not authorized to request an authorization
     * code using this method.
     */
    unauthorized_client = "unauthorized_client",

    /**
     * The resource owner or authorization server denied
     * the request. Semantically the same as HTTP 403 Access Denied
     */
    access_denied = "access_denied",

    /**
     * The authorization server does not support
     * obtaining an authorization code using this method.
     */
    unsupported_response_type = "unsupported_response_type",

    /**
     * The requested scope is invalid, unknown or malformed.
     */
    invalid_scope = "invalid_scope",

    /**
     * The Authorization server encountered an unexpected
     * condition that prevented it from fulfilling the request.
     * 
     * (this is in essence HTTP 500, except OAuth cannot return this)
     */
    server_error = "server_error",

    /**
     * Same as HTTP 503 Service Unavailable
     */
    temporarily_unavailable = "temporarily_unavailable"
}

export const enum OAuthResponseType {
    code = "code",
    token = "token"
}

/**
 * The parameters of an OAuth 2.0 implicit grant request.
 * @see https://tools.ietf.org/html/rfc6749#section-4.2.1
 */
export type OAuthImplicitRequest = {
    response_type: OAuthResponseType.token,
    client_id: string,
    redirect_uri?: URL,
    scope?: Array<string>,
    state?: string
}