const { Op } = require("sequelize");
const { ReportedUser, User, ReportType, Conversation } = require("../../models");
const { Sequelize } = require('sequelize');

async function getAllReportedGroup(req, res) {
    try {
        const { page = 1, limit = 10 } = req.body;

        const offset = (page - 1) * limit;

        // Step 1: Get conversation IDs from ReportedUser for groups along with count
        const reportedConversations = await ReportedUser.findAll({
            attributes: [
                'conversation_id',
                [Sequelize.fn('COUNT', Sequelize.col('conversation_id')), 'report_count']
            ],
            group: ['conversation_id'],
            raw: true
        });

        // Extract conversation IDs into an array
        const conversationIds = reportedConversations.map(report => report.conversation_id);

        // Create a mapping for report counts
        const reportCounts = reportedConversations.reduce((acc, report) => {
            acc[report.conversation_id] = report.report_count;
            return acc;
        }, {});

        // Step 2: Find conversations that match these IDs and are groups
        const { count: group_count, rows: groups } = await Conversation.findAndCountAll({
            where: {
                conversation_id: conversationIds,
                is_group: true
            },
            limit,
            offset,
            attributes: [
                'conversation_id', 'group_name', 'group_profile_image',
                'last_message', 'last_message_id', 'last_message_type',
                'blocked_by_admin', 'createdAt', 'updatedAt'
            ],
            order: [['createdAt', 'DESC']],
        });

        // Step 3: Add report counts to each group
        const groupsWithReportCount = groups.map(group => ({
            ...group.get(), // Convert Sequelize instance to plain object
            report_count: reportCounts[group.conversation_id] || 0 // Default to 0 if not found
        }));

        // Step 4: Return paginated response with group data
        res.status(200).json({
            success: true,
            message: "All Reported Groups",
            groups: groupsWithReportCount,
            pagination: {
                total: group_count,
                pages: Math.ceil(group_count / limit),
                currentPage: page
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in getting reported groups" });
    }
}

async function getGroupReports(req, res) {
    try {
        const { page = 1, limit = 10, conversation_id } = req.body;

        const offset = (page - 1) * limit;

        // Step 1: Get conversation IDs from ReportedUser for groups along with count
        const reportedConversations = await ReportedUser.findAndCountAll({
            where: { conversation_id },
            include: [
                { model: Conversation },
                {
                    model: User,
                    as: 'Who_Reported', // Specify the alias explicitly
                },
                {
                    model: ReportType,
                },

            ],
        });
        console.log(reportedConversations.rows);
        
        // Extract conversation IDs into an array

        // Create a mapping for report counts


        // Step 2: Find conversations that match these IDs and are groups


        // Step 3: Add report counts to each group


        // Step 4: Return paginated response with group data
        res.status(200).json({
            success: true,
            message: "All Report of Groups",
            groups: reportedConversations.rows,
            pagination: {
                total: reportedConversations.count,
                pages: Math.ceil(reportedConversations.count / limit),
                currentPage: page
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in getting reported groups" });
    }
}



module.exports = { getAllReportedGroup, getGroupReports };
