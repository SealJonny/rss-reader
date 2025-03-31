/**
 * Interface representing a news category
 */
export interface Category {
    id?: number;
    name: string
}

/**
 * System-defined categories that always exist
 */
export enum SystemCategory {
  GENERAL = "Allgemein",
  FAVORITES = "Favoriten"
}

/**
 * Type guard to check if a value is a SystemCategory
 * @param value Value to check
 * @returns True if the value is a SystemCategory
 */
export const isSystemCategory = (value: any): value is SystemCategory => {
  return Object.values(SystemCategory).includes(value as SystemCategory);
};
