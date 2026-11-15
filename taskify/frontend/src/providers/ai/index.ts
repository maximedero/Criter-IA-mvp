export * from "./AIProvider";
export * from "./MockAIProvider";
export * from "./aiParsing";

export type AIFoundationContract = {
  providerName: string;
};

export const foundationAIProviderContract: AIFoundationContract = {
  providerName: "ai-provider-contract"
};
