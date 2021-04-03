export interface AuthProviderAPICreds {
    clientId: string;
    secret: string;
}

export interface BaseUserDetails {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    socialNetworkKey: string;
}

export interface AuthProviderConfig {
    key: string;
    credentials: AuthProviderAPICreds;
}

export interface TokenData {
    access_token: string;
    [key: string]: any;
}
