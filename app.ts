import express from "express"
import Mailjet from "node-mailjet"
import dotenv from "dotenv"
import bodyParser from "body-parser"

dotenv.config()

const app = express()

app.use(bodyParser.json())

console.log(process.env.MAILJET_PUBLIC_KEY)

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_PUBLIC_KEY,
    apiSecret: process.env.MAILJET_SECREY_KEY,
})

app.post("/subscriber", (req, res) => {
    const { email } = req.body

    // Newsletter list ID
    const listId = 144250

    let contactId = -1

    // Create a contact
    mailjet
        .post("contact", { version: "v3" })
        .request({
            IsExcludedFromCampaigns: false,
            Name: "New Contact",
            Email: email,
        })
        .then((result: any) => {
            contactId = result.body.Data[0].ID
            console.log("Contact id : ", contactId)

            // Add the contact to the list
            mailjet
                .post("listrecipient", { version: "v3" })
                .request({
                    IsUnsubscribed: true,
                    ContactID: contactId,
                    ContactAlt: email,
                    ListID: listId,
                })
                .then((result: any) => {
                    res.send({
                        success: `Contact ${email} added to the list`,
                        status: result.status,
                    })
                })
                .catch((error) => {
                    // Delete the contact if it was not added to the list
                    mailjet
                        .delete("contact", { version: "v3" })
                        .id(contactId)
                        .request()
                        .then(() => {
                            res.send({
                                error: error.statusText,
                                status: error.statusCode,
                            })
                        })
                        .catch(() => {
                            res.send({
                                error: error.statusText,
                                status: error.statusCode,
                            })
                        })

                    res.send({
                        error: error.statusText,
                        status: error.statusCode,
                    })
                })
        })
        .catch((error) => {
            console.log(error)
            res.send({ error: error.statusText, status: error.statusCode })
        })
})

app.listen(3000, () => {
    console.log("Listening on port 3000.")
})
