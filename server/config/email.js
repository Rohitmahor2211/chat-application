// const nodemailer = require("nodemailer");

// Create a transporter using SMTP
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // ❗ IMPORTANT (true nahi)
//     auth: {
//         user: process.env.Email_user_account,
//         pass: process.env.Email_APP_KEY
//     }
// });

// module.exports = transporter;


// NOTE:- mailGum setup:- 
// const formData = require("form-data");
// const Mailgun = require("mailgun.js");

// const mailgun = new Mailgun(formData);

// const mg = mailgun.client({
//     username: "api",
//     key: process.env.MAILGUN_API_KEY,
// });

// module.exports = mg;


// Brevo setup
const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = tranEmailApi;
