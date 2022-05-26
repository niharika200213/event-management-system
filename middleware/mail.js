const mailjet = require('node-mailjet')
    .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)

module.exports = (email, subject, html) => {
    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "eventooze@gmail.com",
                        "Name": "Eventooze"
                    },
                    "To": [
                        {
                            "Email": email
                        }
                    ],
                    "TemplateID": 3964147,
                    "TemplateLanguage": true,
                    "Subject": subject,
                    "Variables": {
                        "html": html
                    }
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}