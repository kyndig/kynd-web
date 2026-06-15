type HideableEntry = {
  data: {
    hideFromProduction?: boolean | undefined;
  };
};

export const isProductionBuild = import.meta.env.PROD;

export const isVisibleInProduction = <T extends HideableEntry>(entry: T): boolean => {
  if (!isProductionBuild) {
    return true;
  }

  return entry.data.hideFromProduction !== true;
};

export const filterForProduction = <T extends HideableEntry>(entries: T[]): T[] =>
  entries.filter(isVisibleInProduction);
