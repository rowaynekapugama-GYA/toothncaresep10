import * as migration_20260928_041509_initial from './20260928_041509_initial';

export const migrations = [
  {
    up: migration_20260928_041509_initial.up,
    down: migration_20260928_041509_initial.down,
    name: '20260928_041509_initial'
  },
];
