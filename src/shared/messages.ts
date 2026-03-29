import type {
  DefaultTranslationScope,
  ExtensionSettings,
  PageAnalysis,
  ProviderModelInfo,
  SessionSnapshot,
  TabSessionState,
  TranslationBatchRequest,
  TranslationBatchResult,
} from './types';

export interface StartTranslationMessage {
  type: 'START_TRANSLATION';
  settings?: ExtensionSettings;
  scope?: DefaultTranslationScope;
}

export interface TogglePageMessage {
  type: 'TOGGLE_PAGE';
  settings?: ExtensionSettings;
  scope?: DefaultTranslationScope;
}

export interface StartSelectionTranslationMessage {
  type: 'START_SELECTION_TRANSLATION';
  settings?: ExtensionSettings;
}

export interface ToggleSelectionMessage {
  type: 'TOGGLE_SELECTION';
  settings?: ExtensionSettings;
}

export interface RetranslateSelectionMessage {
  type: 'RETRANSLATE_SELECTION';
  settings?: ExtensionSettings;
}

export interface ClearCacheMessage {
  type: 'CLEAR_CACHE';
  settings?: ExtensionSettings;
}

export interface CancelTranslationMessage {
  type: 'CANCEL_TRANSLATION';
}

export interface GetPageAnalysisMessage {
  type: 'GET_PAGE_ANALYSIS';
  settings?: ExtensionSettings;
  scope?: DefaultTranslationScope;
}

export interface GetDebugBlocksMessage {
  type: 'GET_DEBUG_BLOCKS';
  settings?: ExtensionSettings;
  scope?: DefaultTranslationScope;
}

export interface GetSelectionStateMessage {
  type: 'GET_SELECTION_STATE';
}

export interface GetSessionSnapshotMessage {
  type: 'GET_SESSION_SNAPSHOT';
}

export interface TranslateApiMessage {
  type: 'TRANSLATE_API';
  request: TranslationBatchRequest;
}

export interface GetTabSessionStateMessage {
  type: 'GET_TAB_SESSION_STATE';
  tabId: number;
}

export interface SessionStateChangedMessage {
  type: 'SESSION_STATE_CHANGED';
  snapshot: SessionSnapshot;
}

export interface TabSessionUpdatedMessage {
  type: 'TAB_SESSION_UPDATED';
  state: TabSessionState;
}

export interface ClearAllCacheMessage {
  type: 'CLEAR_ALL_CACHE';
}

export interface GetProviderModelsMessage {
  type: 'GET_PROVIDER_MODELS';
}

export type ContentCommandMessage =
  | StartTranslationMessage
  | TogglePageMessage
  | StartSelectionTranslationMessage
  | ToggleSelectionMessage
  | RetranslateSelectionMessage
  | ClearCacheMessage
  | CancelTranslationMessage
  | GetPageAnalysisMessage
  | GetDebugBlocksMessage
  | GetSelectionStateMessage
  | GetSessionSnapshotMessage;

export type BackgroundMessage =
  | TranslateApiMessage
  | GetTabSessionStateMessage
  | SessionStateChangedMessage
  | ClearAllCacheMessage
  | CancelTranslationMessage
  | GetProviderModelsMessage;

export type RuntimeMessage =
  | ContentCommandMessage
  | BackgroundMessage
  | TabSessionUpdatedMessage;

export interface ActionResponse {
  ok: boolean;
  message?: string;
}

export interface AnalysisResponse extends ActionResponse {
  analysis?: PageAnalysis;
}

export interface DebugBlocksResponse extends ActionResponse {
  debug?: unknown;
}

export interface SelectionStateResponse extends ActionResponse {
  hasSelection?: boolean;
}

export interface SessionSnapshotResponse extends ActionResponse {
  snapshot?: SessionSnapshot;
}

export interface TranslateApiResponse extends ActionResponse {
  result?: TranslationBatchResult;
}

export interface TabStateResponse extends ActionResponse {
  state?: TabSessionState;
}

export interface ProviderModelsResponse extends ActionResponse {
  models?: ProviderModelInfo[];
}
