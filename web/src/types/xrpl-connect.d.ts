declare module 'xrpl-connect' {
  export class WalletManager {
    constructor(options: { network: string; adapters: any[] });
    connect(id: string): Promise<any>;
    disconnect(): void;
    signAndSubmit(tx: any): Promise<any>;
    on(event: string, callback: (data: any) => void): void;
  }

  export class CrossmarkAdapter {
    constructor();
  }

  export class XamanAdapter {
    constructor(apiKey: string);
  }

  export class WalletConnectAdapter {
    constructor(options: { projectId: string });
  }
}

