const express = require("express");
const {
  registerPhone,
  verifyPhoneOtp,
} = require("../controller/user/registerPhone");
const { checkUserName } = require("../controller/user/userDetails");
const { loginAdmin } = require("../controller/Admin/admin.login");
const {
  FetchDefaultLanguage,
  FetchLanguageKeywordsWithTranslation,
  ListAllLanguages,
} = require("../controller/Admin/languageController");
const { fetchReportTyes } = require("../controller/Admin/report_controller");
const { getSetting } = require("../controller/Admin/appsettingController");
const {
  getWebsiteSetting,
} = require("../controller/Admin/webSettingController");
const {
  getPrivacyPrivacyPolicy,
  getTermsAndConditions,
} = require("../controller/Admin/PoilcyController");
const {
  registerEmail,
  verifyEmailOtp,
} = require("../controller/user/registerEmail");

const router = express.Router();

router.post("/register-phone", registerPhone); // register with email
router.post("/verify-phone-otp", verifyPhoneOtp); // verify email otp
router.post("/register-email", registerEmail); // register with email
router.post("/verify-email-otp", verifyEmailOtp); // verify email otp
router.post("/check-user-name", checkUserName); // check available users
router.post("/admin-login", loginAdmin);
router.post("/fetch-default-language", FetchDefaultLanguage);
router.post("/get-privacy-policy", getPrivacyPrivacyPolicy);
router.post("/get-tncs", getTermsAndConditions);

router.post(
  "/fetch-keywords-with-translation",
  FetchLanguageKeywordsWithTranslation
);
router.post("/List-Language", ListAllLanguages);
router.post("/Report-type-list", fetchReportTyes);

router.post("/get-settings", getSetting);
router.post("/get-website-settings", getWebsiteSetting);

module.exports = router;
