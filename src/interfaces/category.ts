export interface Category {
    id?: number;
    name: string
}

export enum SystemCategory {
  GENERAL = "Allgemein",
  FAVORITES = "Favoriten"
}

export const isSystemCategory = (value: any): value is SystemCategory => {
  return Object.values(SystemCategory).includes(value as SystemCategory);
};
