
declare global {
  var storageData: {
    users: [number, any][];
    walletConnections: [number, any][];
    intents: [number, any][];
    executionHistory: [number, any][];
    chatMessages: [number, any][];
    nftTokens: any[];
    currentId: number;
  } | undefined;
}

export {};
