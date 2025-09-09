const { Call, Conversation, Conversation_users, User } = require("../../models");

async function getCallHistory(req, res) {
    try {
        const calls = await Call.findAll({
            include: [
                {
                    model: Conversation,
                    attributes: ['conversation_id', 'is_group', 'group_name', 'group_profile_image'],
                    include: [
                        {
                            model: Conversation_users,
                            attributes: ['userId'],
                        }
                    ]
                },
                {
                    model: User, // Assuming you have a User model to get sender information
                    attributes: ['user_id', 'name', 'email'], // Adjust attributes as needed
                    as: 'Sender'
                }
            ],
            attributes: ['call_id', 'conversationId', 'callType', 'callDuration']
        });

        const callHistory = calls.map(call => {
            const conversation = call.Conversation;
            let receiver = null;
            
            if (conversation.isGroup) {
                receiver = {
                    groupName: conversation.groupName,
                    groupImage: conversation.groupImage
                };
            } else {
                const users = conversation.Conversation_users;
                const receiverUserId = users.find(user => user.userId !== call.userId).userId;
                
                receiver = {
                    userId: receiverUserId
                };
            }

            return {
                sender: {
                    id: call.Sender.id,
                    name: call.Sender.name,
                    email: call.Sender.email
                },
                receiver,
                callType: call.callType,
                callDuration: call.callDuration
            };
        });

        res.status(200).json({
            success: true,
            callHistory
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error retrieving call history" });
    }
}

module.exports = { getCallHistory };
