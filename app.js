"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_mailjet_1 = __importDefault(require("node-mailjet"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
console.log(process.env.MAILJET_PUBLIC_KEY);
const mailjet = new node_mailjet_1.default({
    apiKey: process.env.MAILJET_PUBLIC_KEY,
    apiSecret: process.env.MAILJET_SECREY_KEY,
});
app.post("/subscriber", (req, res) => {
    const { email } = req.body;
    // Newsletter list ID
    const listId = 144250;
    let contactId = -1;
    // Create a contact
    mailjet
        .post("contact", { version: "v3" })
        .request({
        IsExcludedFromCampaigns: false,
        Name: "New Contact",
        Email: email,
    })
        .then((result) => {
        contactId = result.body.Data[0].ID;
        console.log("Contact id : ", contactId);
        // Add the contact to the list
        mailjet
            .post("listrecipient", { version: "v3" })
            .request({
            IsUnsubscribed: true,
            ContactID: contactId,
            ContactAlt: email,
            ListID: listId,
        })
            .then((result) => {
            console.log(result);
            res.send({
                message: `Contact ${email} added to the list`,
                status: result.response.status,
            });
        })
            .catch((error) => {
            // Delete the contact if it was not added to the list
            mailjet
                .delete("contact", { version: "v3" })
                .id(contactId)
                .request()
                .then(() => {
                res.send({
                    message: error.statusText,
                    status: error.statusCode,
                });
            })
                .catch(() => {
                res.send({
                    message: error.statusText,
                    status: error.statusCode,
                });
            });
            res.send({
                error: error.statusText,
                status: error.statusCode,
            });
        });
    })
        .catch((error) => {
        console.log(error);
        res.send({ error: error.statusText, status: error.statusCode });
    });
});
app.listen(3000, () => {
    console.log("Listening on port 3000.");
});
module.exports = app;
