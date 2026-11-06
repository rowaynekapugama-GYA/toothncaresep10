import * as migration_20260928_041509_initial from './20260928_041509_initial';
import * as migration_20261103_102912_client_dashboard from './20261103_102912_client_dashboard';
import * as migration_20261104_090000_restore_original_photos from './20261104_090000_restore_original_photos';
import * as migration_20261104_100000_team_and_directions from './20261104_100000_team_and_directions';
import * as migration_20261105_090000_home_about_photo from './20261105_090000_home_about_photo';
import * as migration_20261106_090000_role_titles_and_ahpra from './20261106_090000_role_titles_and_ahpra';

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
  {
    up: migration_20261104_090000_restore_original_photos.up,
    down: migration_20261104_090000_restore_original_photos.down,
    name: '20261104_090000_restore_original_photos'
  },
  {
    up: migration_20261104_100000_team_and_directions.up,
    down: migration_20261104_100000_team_and_directions.down,
    name: '20261104_100000_team_and_directions'
  },
  {
    up: migration_20261105_090000_home_about_photo.up,
    down: migration_20261105_090000_home_about_photo.down,
    name: '20261105_090000_home_about_photo'
  },
  {
    up: migration_20261106_090000_role_titles_and_ahpra.up,
    down: migration_20261106_090000_role_titles_and_ahpra.down,
    name: '20261106_090000_role_titles_and_ahpra'
  },
];
