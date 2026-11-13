import * as migration_20260928_041509_initial from './20260928_041509_initial';
import * as migration_20261103_102912_client_dashboard from './20261103_102912_client_dashboard';
import * as migration_20261104_090000_restore_original_photos from './20261104_090000_restore_original_photos';
import * as migration_20261104_100000_team_and_directions from './20261104_100000_team_and_directions';
import * as migration_20261105_090000_home_about_photo from './20261105_090000_home_about_photo';
import * as migration_20261106_090000_role_titles_and_ahpra from './20261106_090000_role_titles_and_ahpra';
import * as migration_20261111_100000_team_support_fields from './20261111_100000_team_support_fields';
import * as migration_20261111_090000_about_reception_photo from './20261111_090000_about_reception_photo';
import * as migration_20261111_110000_team_roster_and_headings from './20261111_110000_team_roster_and_headings';

export const migrations = [
  {
    up: migration_20260928_041509_initial.up,
    down: migration_20260928_041509_initial.down,
    name: '20260928_041509_initial',
  },
  {
    up: migration_20261103_102912_client_dashboard.up,
    down: migration_20261103_102912_client_dashboard.down,
    name: '20261103_102912_client_dashboard',
  },
  {
    up: migration_20261104_090000_restore_original_photos.up,
    down: migration_20261104_090000_restore_original_photos.down,
    name: '20261104_090000_restore_original_photos',
  },
  {
    up: migration_20261104_100000_team_and_directions.up,
    down: migration_20261104_100000_team_and_directions.down,
    name: '20261104_100000_team_and_directions',
  },
  {
    up: migration_20261105_090000_home_about_photo.up,
    down: migration_20261105_090000_home_about_photo.down,
    name: '20261105_090000_home_about_photo',
  },
  {
    up: migration_20261106_090000_role_titles_and_ahpra.up,
    down: migration_20261106_090000_role_titles_and_ahpra.down,
    name: '20261106_090000_role_titles_and_ahpra',
  },
  {
    up: migration_20261111_090000_about_reception_photo.up,
    down: migration_20261111_090000_about_reception_photo.down,
    name: '20261111_090000_about_reception_photo',
  },
  {
    up: migration_20261111_100000_team_support_fields.up,
    down: migration_20261111_100000_team_support_fields.down,
    name: '20261111_100000_team_support_fields',
  },
  {
    up: migration_20261111_110000_team_roster_and_headings.up,
    down: migration_20261111_110000_team_roster_and_headings.down,
    name: '20261111_110000_team_roster_and_headings',
  },
];
