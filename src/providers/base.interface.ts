export interface AuthProviderAPICreds {
    clientId: string;
    secret: string;
}

export interface BaseUserDetails {
    email: string;
    firstName: string;
    id?: string;
    lastName: string;
    password?: string;
    socialNetworkKey?: string;
}

export interface RegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthProviderConfig {
    key: string;
    credentials: AuthProviderAPICreds;
}

export interface TokenData {
    access_token: string;
    [key: string]: any;
}

export interface TokenPayloadData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}
