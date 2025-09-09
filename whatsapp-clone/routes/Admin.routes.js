const express = require("express");
const { UpdateProfile } = require("../controller/Admin/admin.editprofile");
const { resetPasswordAdmin } = require("../controller/Admin/admin.resetpass");
const {
  editWebSettings,
  UploadLogo,
} = require("../controller/Admin/webSettingController");
const { getAllUsers } = require("../controller/Admin/List.all.user");
const {
  addWallpaper,
  editWallpaper,
  deleteWallpaper,
  updateWallpaperStatus,
  listAllWallpaper,
  WallpaperFromId,
} = require("../controller/Admin/wallpaper.contoller");
const { BlockUser, unBlockUser } = require("../controller/Admin/blockUser");
const {
  editAppSettings,
  getSetting,
} = require("../controller/Admin/appsettingController");
const {
  getGroupSetting,
  editGroupSettings,
} = require("../controller/Admin/GroupSetting.Controllers");
const {
  getPrivacyPrivacyPolicy,
  getTermsAndConditions,
  editPrivacyPolicy,
  editTermsAndCondition,
} = require("../controller/Admin/PoilcyController");
const {
  addAvatar,
  editAvatar,
  avatarFromId,
  listAllAvatar,
} = require("../controller/Admin/avtarController");
const {
  groupList,
  UserListFromGroup,
  getYearlyNewGroupsCount,
} = require("../controller/Admin/groupController");
const {
  getAllUsersCountWithLastWeek,
  getGroupCounts,
  getAudioCallCounts,
  getVideoCallCounts,
  getLatest5Users,
  getLatest5groups,
  getWeeklyNewUsersCount,
  getCountrywiseTraffic,
  getYearlyNewUsersCount,
  getYearlyAudioCallCounts,
  getYearlyVideoCallCounts,
  getActiveUsers,
  getLoginTypes,
  getPlatformActivity,
  getRecentlyActiveUsers,
} = require("../controller/Admin/Dashboard/DashboardController");
const {
  AddKey,
  AddLanguageColumn,
  EditKeyword,
  TranslateLanguage,
  ListAllLanguages,
  TranslateAllKeywords,
  UpdateStatus,
  GetLanguageDataFromStatus_id,
  EditLanguage,
} = require("../controller/Admin/languageController");
const {
  ListUserListNotification,
  ViewUser,
} = require("../controller/Admin/Admin_Notification");
const {
  editOneSignalSettings,
  getOneSignalSetting,
} = require("../controller/Admin/oneSignalsettingController");
const {
  editGoogleMapsSettings,
  getGoogleMapsSetting,
} = require("../controller/Admin/googleMapsController");
const {
  fetchAppFlow,
  editAppFlow,
} = require("../controller/Admin/AppFlow.Controller");
const {
  addNewReportType,
  editReportType,
} = require("../controller/Admin/report_controller");
const {
  getAllReportedUsers,
} = require("../controller/Admin/List.all.reported.user");
const {
  getReportedUserDetail,
} = require("../controller/Admin/reported.user.details");
const {
  getAllReportedGroup,
  getGroupReports,
} = require("../controller/Admin/List.all.reported.group");
const { block_group } = require("../controller/Admin/reported_groupdetails");
const { deactivate, GetPurchaceCode, GetPurchaseCode } = require("../controller/Admin/ActivationContoller");

const router = express.Router();

router.post("/update-profile", UpdateProfile);
router.post("/reset-admin-password", resetPasswordAdmin);
router.post("/list-all-User", getAllUsers);
router.post("/list-all-reported-User", getAllReportedUsers);
router.post("/block-a-Group", block_group);
router.post("/reported_user_details", getReportedUserDetail);
router.post("/reported_group_list", getAllReportedGroup);
router.post("/get-reports-of-group", getGroupReports);

router.post("/add-wallpaper", addWallpaper);
router.post("/edit-wallpaper", editWallpaper);
router.post("/delete-wallpaper", deleteWallpaper);
router.post("/get-wallpaper-from-id", WallpaperFromId);
router.post("/update-wallpaper-status", updateWallpaperStatus);
router.post("/list-all-wallapapers", listAllWallpaper);
router.post("/add-avtar", addAvatar);
router.post("/edit-avatar", editAvatar);

router.post("/get-avtar-from-id", avatarFromId);

router.post("/list-all-avtars", listAllAvatar);

router.post("/block-a-user", BlockUser);
router.post("/unblock-a-user", unBlockUser);

// App Settings
router.post("/edit-app-setting", editAppSettings);
router.post("/edit-website-setting", editWebSettings);
router.post("/edit-favicon", UploadLogo);
// router.post("/get-settings", getSetting)
router.post("/get-app-flow", fetchAppFlow);
router.post("/edit-app-flow", editAppFlow);

// One Signal Settings
router.post("/edit-One-Signal-setting", editOneSignalSettings);
router.post("/get-OneSignal-settings", getOneSignalSetting);
// Google Maps Settings
router.post("/edit-google-maps-setting", editGoogleMapsSettings);
router.post("/get-google-maps-settings", getGoogleMapsSetting);
// Group Settingd
router.post("/get-Group-settings", getGroupSetting);
router.post("/edit-Group-settings", editGroupSettings);
router.post("/get-all-groups", groupList);
router.post("/Get-monthly-groups", getYearlyNewGroupsCount);
router.post("/get-all-users-from-group", UserListFromGroup);

// Policy settings
// router.post("/get-privacy-policy", getPrivacyPrivacyPolicy);
// router.post("/get-tncs", getTermsAndConditions);
router.post("/edit-privacy-policy", editPrivacyPolicy);
router.post("/edit-tncs", editTermsAndCondition);

// Dashboard
router.post("/All-User-count-with-lastweek", getAllUsersCountWithLastWeek);
router.post("/All-group-count-with-lastweek", getGroupCounts);
router.post("/All-AudioCall-count-with-lastweek", getAudioCallCounts);
router.post("/All-VideoCall-count-with-lastweek", getVideoCallCounts);
router.post("/Get-Latest-5-users", getLatest5Users);
router.post("/Get-Login-types", getLoginTypes);
router.post("/Get-Platform-Activity", getPlatformActivity);
router.post("/Get-Latest-5-groups", getLatest5groups);
router.post("/Get-Weekly-Users", getWeeklyNewUsersCount);
router.post("/Get-monthly-Users", getYearlyNewUsersCount);
router.post("/Get-Countrywise-trafic", getCountrywiseTraffic);
router.post("/Get-yearly-audioCall", getYearlyAudioCallCounts);
router.post("/Get-Yearly-videoCall", getYearlyVideoCallCounts);
router.post("/Get-Active-Users", getActiveUsers);
router.post("/Get-Active-Users-last-30-mins", getRecentlyActiveUsers);

// Language Settings
router.post("/Add-a-Key", AddKey);
router.post("/Add-a-new-language", AddLanguageColumn);
router.post("/Edit-a-Keyword", EditKeyword);
router.post("/Translate-Language", TranslateLanguage);
// router.post("/List-Language",ListAllLanguages)
router.post("/Translate-all", TranslateAllKeywords);
router.post("/update_status", UpdateStatus);
router.post("/Get-Language-from-id", GetLanguageDataFromStatus_id);
router.post("/Edit-Language", EditLanguage);

// Admin notifications
router.post("/List-AllNotification", ListUserListNotification);
router.post("/View-User", ViewUser);

// Report Routes
router.post("/add-new-report-type", addNewReportType);
router.post("/update-report-type", editReportType);


// Deactivation
router.post("/de-activation", deactivate);
router.post("/get-purchasecode", GetPurchaseCode);





module.exports = router;
