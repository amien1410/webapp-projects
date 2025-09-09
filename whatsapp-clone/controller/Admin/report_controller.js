const { ReportType } = require("../../models");

async function fetchReportTyes(req, res) {
    try {
        const reportType = await ReportType.findAll();
        if (ReportType) {
            res.status(200).json(
                {
                success: true,
                message: "ReportType retrieved successfully",
                reportType, // Return the existing AppFlow row
            }
        );
        } else {
            res.status(404).json({ success: false, message: "No ReportType data found" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in fetching ReportType data" });
    }
}
async function addNewReportType(req, res) {
    try {
        const admin_id = req.authData.admin_id;
        const { report_title, report_details, report_for } =req.body
        const newReport = await ReportType.create({ report_title, report_details, report_for });
        if (newReport) {
            res.status(200).json({
                success: true,
                message: "Report type created successfully",
                newReport, // Return the existing AppFlow row
            });
        } else {
            res.status(404).json({ success: false, message: "No Report type created" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in creating Report type data" });
    }
}

// Edit AppFlow Data
async function editReportType(req, res) {
    try {
        const admin_id = req.authData.admin_id;
        const { report_id, report_title, report_details, report_for } = req.body
        if (await ReportType.findOne({where:{report_id}})){
            const updatedReportData = await ReportType.update(
                { report_title, report_details, report_for },
                {where : {report_id}}
            )
            if(updatedReportData.length>0){
                res.status(200).json({success:true , message:"Report type Edited Successfully"})
            }
            else{
                res.status(200).json({success:false ,message:"Report type not updated"})
            }
        }
        else{
            res.status(200).json({ success: false, message: "invalid Report" })

        }


    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in updating Report Type" });
    }
}


module.exports = {
    fetchReportTyes,
    addNewReportType,
    editReportType
};
