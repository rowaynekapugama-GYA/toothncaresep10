import * as migration_20260928_041509_initial from './20260928_041509_initial';
import * as migration_20261103_102912_client_dashboard from './20261103_102912_client_dashboard';

export const migrations = [
  {
    up: migration_20260928_041509_initial.up,
    down: migration_20260928_041509_initial.down,
    name: '20260928_041509_initial',
  },
  {
    up: migration_20261103_102912_client_dashboard.up,
    down: migration_20261103_102912_client_dashboard.down,
    name: '20261103_102912_client_dashboard'
  },
];
