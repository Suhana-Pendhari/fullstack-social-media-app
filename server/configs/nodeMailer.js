import nodemailer from 'nodemailer';

// create transporter object using SMTP settings

const transporter = nodemailer.createTransport({
  host: "",
  port: 587,
  auth: {
    user: "",
    pass: "",
  },
});

const sendEmail = async ({to, subject, body}) => {
    const response = await transporter.sendMail({
        from: '',
        to,
        subject,
        html: body,
    })
    return response
}

export default sendEmail;
