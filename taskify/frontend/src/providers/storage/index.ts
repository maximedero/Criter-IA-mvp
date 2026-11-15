export type StorageProvider = {
  providerName: string;
};

export const foundationStorageProviderContract: StorageProvider = {
  providerName: "storage-provider-contract"
};

export * from "./casesStorage";
export * from "./canvasStorage";
export * from "./aiSessionStorage";
export * from "./criticalReviewStorage";
