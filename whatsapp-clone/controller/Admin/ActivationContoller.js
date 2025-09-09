const axios= require('axios')
const {Admin} = require('../../models')
const getmac = require('getmac').default;
const os = require("os");
const path = require("path");
const fs = require("fs");

function getMacAddress() {

    try {
        const mac = getmac();
        return mac
    } catch (err) {
        console.error('Error fetching MAC address:', err);
        return null
    }

}

function getServerIP() {
    const networkInterfaces = os.networkInterfaces();

    for (const interfaceName in networkInterfaces) {
        for (const interface of networkInterfaces[interfaceName]) {
            // Check for IPv4 and non-internal addresses (to exclude localhost)
            if (interface.family === "IPv4" && !interface.internal) {
                return interface.address;
            }
        }
    }

    return "IP address not found";
}

async function readToken() {
    const tokenFilePath = path.join(__dirname, "../../validatedToken.txt");
    console.log("Dirrr",tokenFilePath,"\n");
    console.log("Dirrr",__dirname);
    console.log(!fs.existsSync(tokenFilePath));
    
    if (!fs.existsSync(tokenFilePath)) {
        console.log("Token file does not exist. No verification needed.");
        return false; // No token file found, no verification needed
    }

    try {
        const token = await fs.promises.readFile(tokenFilePath, "utf-8");
        console.log(token);
        
        return token

    } catch (error) {
        console.error("Error during token verification:", error);
        return false;
    }
}

async function deactivate(req,res) {
    try {
        const isAdmin = await Admin.findOne({ where: { admin_id: 1 } })
        if(!isAdmin){
            return res.status(400).json({ error: "Invalid User",  status : false })
        }
        
        
        else {
            token = await readToken()
            console.log("Tokennnnn",token);
            // Prepare data to send to the third-party API
            const requestData = {
                server_ip: getServerIP(), // Example data
                mac_address: getMacAddress(),
                token: token,
            };

            // Make the third-party API request
            const apiResponse = await axios.post(
              "http://62.72.36.245:1142/de-activate",
              requestData,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer YOUR_API_TOKEN`, // Replace with actual token if required
                },
              }
            );
            console.log("APII",apiResponse.data);
            
            if(apiResponse?.data?.success){
                console.log(apiResponse.data.message);
                
                return res.status(200).json({
                    message: apiResponse.data.message,
                    status: true,
                });
            }
            // Handle the API response
            return res.status(200).json({
                message: apiResponse.data.message,
                status: false,
            });
        }
    }
    catch (err) {
        console.error(err); 
        res.status(501).json({ error: "Error in Deactivation" });
    }
}

async function GetPurchaseCode(req, res) {
    try {
        const isAdmin = await Admin.findOne({ where: { admin_id: 1 } });
        if (!isAdmin) {
            return res.status(400).json({ error: "Invalid User", status: false });
        } else {
            // Prepare data to send to the third-party API
            token = await readToken()
            console.log("Tokennnnn", token);

            const requestData = {
                mac_address: getMacAddress(),
                server_ip:getServerIP(),
                token: token,
            };

            // Make the third-party API request
            const apiResponse = await axios.post(
              "http://62.72.36.245:1142/get-purchase-code",
              requestData,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer YOUR_API_TOKEN`, // Replace with actual token if required
                },
              }
            );

            if (apiResponse?.data?.success) {
                const purchaseCode = apiResponse.data.purchase_code;

                // Calculate the number of x's to insert in the middle
                const totalLength = purchaseCode.length;
                const visibleLength = 6; // 3 characters at the beginning + 3 at the end
                const maskedLength = totalLength - visibleLength; // Length of the middle part to be replaced

                // Mask the purchase code
                const maskedPurchaseCode =
                    purchaseCode.slice(0, 3) +
                    "x".repeat(maskedLength) + // Repeat 'x' to cover the middle part
                    purchaseCode.slice(-3);

                console.log(maskedPurchaseCode); // This will log the masked purchase code


                return res.status(200).json({
                    message: apiResponse.data.message,
                    purchase_code: maskedPurchaseCode,
                    status: true,
                });
            }

            // Handle the API response in case of failure
            return res.status(200).json({
                message: apiResponse.data.message,
                status: false,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(501).json({ error: "Error in fetching purchase code", status: false });
    }
}


module.exports = { deactivate, GetPurchaseCode }