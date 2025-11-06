export interface HydraView {
  '@id'?: string;
  '@type'?: string;
  // Accept both prefixed and unprefixed keys
  first?: string;
  last?: string;
  next?: string;
  previous?: string;
  'hydra:first'?: string;
  'hydra:last'?: string;
  'hydra:next'?: string;
  'hydra:previous'?: string;
}

// Generic Hydra collection shape that tolerates both prefixed and unprefixed keys
export interface HydraCollection<T> {
  '@context'?: string;
  '@id'?: string;
  '@type'?: string;
  // total items may appear with or without hydra prefix depending on server config
  'hydra:totalItems'?: number;
  totalItems?: number;
  // members list
  'hydra:member'?: T[];
  member?: T[];
  // view / pagination metadata
  'hydra:view'?: HydraView;
  view?: HydraView;
}

export function getHydraMembers<T>(data: HydraCollection<T>): T[] {
  return data.member || data['hydra:member'] || [];
}

export function getHydraTotalItems(data: HydraCollection<unknown>): number | undefined {
  return data.totalItems ?? data['hydra:totalItems'];
}

export function getHydraView(data: HydraCollection<unknown>): HydraView | undefined {
  return data.view || data['hydra:view'];
}
