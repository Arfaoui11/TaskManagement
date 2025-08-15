export interface AppClient {
    id: number;
    clientId: string;
    clientSecret: string;
    accessTokenValidity: number;
    scope: string;
    authorities: string;
    authorizedGrantTypes: string;
    refreshTokenValidity: number;
    resourceIds: string;
    webServerRedirectUri: string;
    autoApprove: string;
    addInfo?: string;
  }
  