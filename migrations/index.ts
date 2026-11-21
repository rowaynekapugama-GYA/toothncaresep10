import * as migration_20260928_041509_initial from './20260928_041509_initial';
import * as migration_20261103_102912_client_dashboard from './20261103_102912_client_dashboard';
import * as migration_20261104_090000_restore_original_photos from './20261104_090000_restore_original_photos';
import * as migration_20261104_100000_team_and_directions from './20261104_100000_team_and_directions';
import * as migration_20261105_090000_home_about_photo from './20261105_090000_home_about_photo';
import * as migration_20261106_090000_role_titles_and_ahpra from './20261106_090000_role_titles_and_ahpra';
import * as migration_20261111_090000_about_reception_photo from './20261111_090000_about_reception_photo';
import * as migration_20261111_100000_team_support_fields from './20261111_100000_team_support_fields';
import * as migration_20261111_110000_team_roster_and_headings from './20261111_110000_team_roster_and_headings';
import * as migration_20261117_090000_practice_photos from './20261117_090000_practice_photos';
import * as migration_20261117_100000_team_dimple_redirects from './20261117_100000_team_dimple_redirects';
import * as migration_20261119_090000_dimple_mursal_share_image from './20261119_090000_dimple_mursal_share_image';
import * as migration_20261120_090000_blob_upload_columns from './20261120_090000_blob_upload_columns';
import * as migration_20261120_100000_golive_offers_verify from './20261120_100000_golive_offers_verify';
import * as migration_20261120_110000_rav_profile_ready from './20261120_110000_rav_profile_ready';
import * as migration_20261120_120000_staff_photo_switch from './20261120_120000_staff_photo_switch';
import * as migration_20261120_130000_dr_rav_photo from './20261120_130000_dr_rav_photo';
import * as migration_20261121_100000_staff_photos_on from './20261121_100000_staff_photos_on';
import * as migration_20261121_110000_client_copy_21nov from './20261121_110000_client_copy_21nov';

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
  {
    up: migration_20261117_090000_practice_photos.up,
    down: migration_20261117_090000_practice_photos.down,
    name: '20261117_090000_practice_photos',
  },
  {
    up: migration_20261117_100000_team_dimple_redirects.up,
    down: migration_20261117_100000_team_dimple_redirects.down,
    name: '20261117_100000_team_dimple_redirects',
  },
  {
    up: migration_20261119_090000_dimple_mursal_share_image.up,
    down: migration_20261119_090000_dimple_mursal_share_image.down,
    name: '20261119_090000_dimple_mursal_share_image',
  },
  {
    up: migration_20261120_090000_blob_upload_columns.up,
    down: migration_20261120_090000_blob_upload_columns.down,
    name: '20261120_090000_blob_upload_columns'
  },
  {
    up: migration_20261120_100000_golive_offers_verify.up,
    down: migration_20261120_100000_golive_offers_verify.down,
    name: '20261120_100000_golive_offers_verify',
  },
  {
    up: migration_20261120_110000_rav_profile_ready.up,
    down: migration_20261120_110000_rav_profile_ready.down,
    name: '20261120_110000_rav_profile_ready',
  },
  {
    up: migration_20261120_120000_staff_photo_switch.up,
    down: migration_20261120_120000_staff_photo_switch.down,
    name: '20261120_120000_staff_photo_switch',
  },
  {
    up: migration_20261120_130000_dr_rav_photo.up,
    down: migration_20261120_130000_dr_rav_photo.down,
    name: '20261120_130000_dr_rav_photo',
  },
  {
    up: migration_20261121_100000_staff_photos_on.up,
    down: migration_20261121_100000_staff_photos_on.down,
    name: '20261121_100000_staff_photos_on',
  },
  {
    up: migration_20261121_110000_client_copy_21nov.up,
    down: migration_20261121_110000_client_copy_21nov.down,
    name: '20261121_110000_client_copy_21nov',
  },
];
