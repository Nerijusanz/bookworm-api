import nodemailer from 'nodemailer';


function mailSetup(){
    
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

}

export function emailConfirmation(user){

   const transport  = mailSetup();

   const mailFrom = '"Bookworm" <info@bookworm.com>';

    const email={
        from:mailFrom,
        to:user.email,
        subject:"bookworm mailer",
        text: `Welcome to Bookworm. Please, confirm your email.
        ${user.generateConfirmationUrl()}`
    };

    transport.sendMail(email);
}

