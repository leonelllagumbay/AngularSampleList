export interface IntentI {
  patterns: string[];
  responses: string[];
  tag: string;
  context_set?: string;
  context_filter?: string;
}
