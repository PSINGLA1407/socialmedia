import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    pageBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryHover: string;
    error: string;
    errorBg: string;
    cardBg: string;
    inputBg: string;
    inputBorder: string;
    buttonText: string;
    disabledBg: string;
    shadowColor: string;
  }
} 