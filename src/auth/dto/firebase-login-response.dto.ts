export interface FirebaseSignInResponse {
  kind?: string;                  // ej. "identitytoolkit#VerifyPasswordResponse"
  localId: string;                // UID del usuario
  email: string;
  displayName?: string;
  idToken: string;                // El token que necesitas
  registered?: boolean;
  profilePicture?: string;
  oauthAccessToken?: string;
  oauthExpireIn?: number;
  oauthAuthorizationCode?: string;
  refreshToken?: string;
  expiresIn: string;              // string, aunque es número en segundos
  mfaPendingCredential?: string;
  // mfaInfo?: any[];             // si usas MFA
}