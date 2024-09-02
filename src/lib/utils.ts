import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export enum ChartType {
  Line = "Line",
  Bar = "Bar",
  StackedBar = "StackedBar",
  Area = "Area",
}

export const ChartTypeKeys = Object.keys(ChartType);