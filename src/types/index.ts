export type NavigationTab = 'home' | 'tools' | 'history' | 'settings';

export type AppTheme = 'dark' | 'light' | 'system';

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan';

export type GlassIntensity = 'low' | 'medium' | 'high';

export type LanguageCode = 'en' | 'hi';

export type NumberFormatStyle = 'standard' | 'in';

export interface AppSettings {
  theme: AppTheme;
  accent: AccentColor;
  glassIntensity: GlassIntensity;
  ambientLight: boolean;
  animations: boolean;
  haptics: boolean;
  language: LanguageCode;
  precision: number;
  numberFormat: NumberFormatStyle;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  type: 'standard' | 'scientific' | 'tool';
  toolName?: string;
  note?: string;
}

export type ToolCategory = 'all' | 'finance' | 'math' | 'converters' | 'daily' | 'datetime';

export interface ToolMeta {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  category: ToolCategory;
  iconName: string;
}
