import type {MouseEvent} from 'react';

export interface IButton {
  title: string;
  onClick: (event?: MouseEvent<HTMLButtonElement>) => void;
  type: "submit" | "reset" | "button" | undefined;
};
