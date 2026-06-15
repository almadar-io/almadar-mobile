import type {
  EntityRow,
  FieldValue,
  EventKey,
  EventPayload,
  BusEvent,
  BusEventSource,
  BusEventListener,
} from '@almadar/core';
import type { TraitState } from '@almadar/runtime';

// EntityWith is authored in @almadar/core source but not yet exported from the
// installed 9.11.0 dist. Provide a local alias so mobile components can still
// declare required-field subsets of an entity row.
export type EntityWith<K extends string> = EntityRow & {
  [P in K]: FieldValue | undefined;
};

export type {
  EntityRow,
  FieldValue,
  EventKey,
  EventPayload,
  BusEvent,
  BusEventSource,
  BusEventListener,
  TraitState,
};
