const express = require("express");
const { userDetails } = require("../controller/user/userDetails");
const { searchUser } = require("../controller/user/searchUser");
const { blockUser } = require("../controller/user/blockUser");
const { getOneToOneMedia } = require("../controller/Chat/getOneToOneMedia");
const {
  innerChatScreen,
} = require("../controller/Chat/MessageList/innerChatScreen");
const { callUser } = require("../controller/Call/callUser");
const nocache = require("../middleware/callMiddleware");
const { callCutByMe } = require("../controller/Call/callCutByMe");

const { callTime } = require("../controller/Call/callTime");
const { callList } = require("../controller/Call/callList");
const { sendMessage } = require("../controller/Chat/sendMessage");
const { addContactName } = require("../controller/user/addContactName");
const { createGroup } = require("../controller/Chat/Group/createGroup");
const {
  addMemberToGroup,
} = require("../controller/Chat/Group/addMemberToGroup");
const {
  removeMemberFromGroup,
} = require("../controller/Chat/Group/removeMemberFromGroup");
const {
  createGroupAdmin,
} = require("../controller/Chat/Group/createGroupAdmin");
const {
  addToStarMessage,
} = require("../controller/Chat/StarMessage/addToStarMessage");
const {
  starMessageList,
} = require("../controller/Chat/StarMessage/starMessageList");
const {
  getAllAvailableContacts,
} = require("../controller/Contact/getAllAvailableContacts");
const { addStatus } = require("../controller/Status/addStatus");
const { statusList } = require("../controller/Status/statusList");
const { statusViewesList } = require("../controller/Status/statusViewesList");
const { viewStatus } = require("../controller/Status/viewStatus");
const { addToArchive } = require("../controller/Chat/ChatList/addToArchive");
const {
  deleteMessages,
} = require("../controller/Chat/MessageList/deleteMessages");
const { logoutUser } = require("../controller/user/logoutUser");
const { getBlockUserList } = require("../controller/user/getBlockUserList");
const {
  getMessageDetails,
} = require("../controller/Chat/MessageList/getMessageDetails");
const { exitFromGroup } = require("../controller/Chat/Group/exitFromGroup");
const { clearAllChat } = require("../controller/Chat/MessageList/clearAllChat");
const { callCutByReceiver } = require("../controller/Call/callCutByReceiver");
const { getGroupMembers } = require("../controller/Chat/Group/getGroupMembers");
const { deleteStatusById } = require("../controller/Status/deleteStatusById");
const {
  deleteStatusMediaById,
} = require("../controller/Status/deleteStatusMediaById");
const { getStatusDetails } = require("../controller/Status/getStatusDetails");
const { getMyContacts } = require("../controller/Contact/getMyContacts");
const {
  searchMessage,
} = require("../controller/Chat/SearchMessage/searchMessage");
const {
  deleteChatList,
} = require("../controller/Chat/ChatList/deleteChatList");
const { reportUser } = require("../controller/user/reportUser");
const { deleteAccount } = require("../controller/user/deleteAccount");

const {
  addToPinMessage,
} = require("../controller/Chat/PinMessage/addToPinMessage");
const {
  pinMessageList,
} = require("../controller/Chat/PinMessage/pinMessageList");
const { createPoll } = require("../controller/Chat/Poll/createPoll");
const { voteInPoll } = require("../controller/Chat/Poll/voteInPoll");
const getPublicGroup = require("../controller/Chat/Group/getPublicGroup");

const router = express.Router();

// Routes Start ==============================================================================================================================
router.post("/user-details", userDetails);
router.post("/block-user", blockUser);
router.post("/report-user", reportUser);
router.post("/delete-account", deleteAccount);
router.post("/block-user-list", getBlockUserList);
router.post("/get-one-to-one-media", getOneToOneMedia);

// Archive ==================================================================================
router.post("/add-to-archive", addToArchive);

// Contact ==================================================================================
router.post("/get-all-available-contacts", getAllAvailableContacts);

// Chat ==================================================================================
// router.post("/send-message", nocache, callUser);
router.post("/send-message", sendMessage);
router.post("/create-group", createGroup);
router.post("/add-member-to-group", addMemberToGroup);
router.post("/remove-member-from-group", removeMemberFromGroup);
router.post("/exit-from-group", exitFromGroup);
router.post("/create-group-admin", createGroupAdmin);
router.post("/get-message-details", getMessageDetails);
router.post("/delete-chatlist", deleteChatList);
router.post("/create-poll", createPoll);
router.post("/vote", voteInPoll);
router.post("/get-public-groups", getPublicGroup);

// Star Message ==================================================================================
router.post("/add-to-star-message", addToStarMessage);
router.post("/star-message-list", starMessageList);

// Pin Message ==================================================================================
router.post("/add-to-pin-message", addToPinMessage);
router.post("/pin-message-list", pinMessageList);

// Search Message ===========================================================================
router.post("/search-message", searchMessage);

// Delete Chat ==================================================================================
router.post("/clear-all-chat", clearAllChat);
router.post("/delete-messages", deleteMessages);

// Status ==================================================================================
router.post("/add-status", addStatus);
router.post("/status-list", statusList);
router.post("/view-status", viewStatus);
router.post("/status-view-list", statusViewesList);
router.post("/delete-status", deleteStatusById);
router.post("/delete-status-media-by-id", deleteStatusMediaById);
router.post("/status-details", getStatusDetails);

// Call ==================================================================================
router.post("/call-user", callUser);
router.post("/call-cut-by-me", callCutByMe);
router.post("/call-cut-by-receiver", callCutByReceiver);
router.post("/get-group-members", getGroupMembers);

// router.post("/call-time", callTime);
router.post("/call-list", callList);

// router.post("/inner-chat-screen", innerChatScreen); // call this api when you go back from inner screen to outer screen
// AllContact ==================================================================================
router.post("/add-contact-name", addContactName);
router.post("/my-contacts", getMyContacts);

// Logout ==================================================================================
router.post("/logout-user", logoutUser);

module.exports = router;
