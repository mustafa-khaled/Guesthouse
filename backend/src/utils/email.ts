import nodemailer from 'nodemailer'
import pug from 'pug'
import { htmlToText } from 'html-to-text'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface UserInfo {
  email: string
  name: string
}

export class Email {
  private to: string
  private firstName: string
  private url: string
  private from: string

  constructor(user: UserInfo, url: string) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = `Mustafa Khaled <${process.env.EMAIL_FROM}>`
  }

  private newTransport(): nodemailer.Transporter {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      } as nodemailer.TransportOptions)
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  async send(template: string, subject: string): Promise<void> {
    const html = pug.renderFile(
      path.join(__dirname, '..', '..', 'views', 'emails', `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    )

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    }

    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome(): Promise<void> {
    await this.send('welcome', 'Welcome to the Guesthouse Family!')
  }

  async sendPasswordReset(): Promise<void> {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    )
  }
}
