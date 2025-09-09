const { App_Flow } = require("../../models");

async function checkAppFlowAndCreate(req,res){
    try{
        const isAppflow = await App_Flow.findOne({ where: { setting_id : 1}})
        if(isAppflow){
            return
        }
        else{
            await App_Flow.create()
        }
    }
    catch(err){
        console.error(err);
        // res.status(501).json({ error: "Error in fetching AppFlow data" });
    }
}

async function fetchAppFlow(req, res) {
    try {
        const appFlow = await App_Flow.findOne();

        if (appFlow) {
            res.status(200).json({
                success: true,
                message: "AppFlow data retrieved successfully",
                appFlow, // Return the existing AppFlow row
            });
        } else {
            res.status(404).json({ success: false, message: "No AppFlow data found" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in fetching AppFlow data" });
    }
}

// Edit AppFlow Data
async function editAppFlow(req, res) {
    try {
        const { isContact } = req.body; // Extract the isContact value from request body

        if (typeof isContact !== 'boolean') {
            return res.status(400).json({ success: false, message: "isContact must be a boolean value" });
        }

        const appFlow = await App_Flow.findOne(); // Fetch the single row

        if (appFlow) {
            const updatedAppFlow = await App_Flow.update({ isContact }, {
                where: { setting_id: appFlow.setting_id }, // Update the existing row
            });

            if (updatedAppFlow[0] === 1) {
                res.status(200).json({
                    success: true,
                    message: "AppFlow updated successfully",
                });
            } else {
                res.status(400).json({ success: false, message: "AppFlow not updated" });
            }
        } else {
            res.status(404).json({ success: false, message: "No AppFlow data found" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in updating AppFlow" });
    }
}


module.exports = {
    fetchAppFlow,
    editAppFlow,
    checkAppFlowAndCreate
};
