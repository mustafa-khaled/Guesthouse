import { Booking, IBooking } from "../../models/booking.model";
import { Guest } from "../../models/guest.model";
import { Property } from "../../models/property.model";
import { Payment, IPayment } from "../../models/payment.model";
import { sendEmail } from "../../lib/email";
import { formatDate } from "../../common/utils/dateUtils";

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

class NotificationService {
  async sendBookingConfirmation(booking: IBooking): Promise<void> {
    const populatedBooking = await Booking.findById(booking._id)
      .populate("guestId")
      .populate("propertyId")
      .populate("roomTypeId");

    if (!populatedBooking) return;

    const guest = populatedBooking.guestId as any;
    const property = populatedBooking.propertyId as any;
    const roomType = populatedBooking.roomTypeId as any;

    const email: EmailData = {
      to: guest.email,
      subject: `Booking Confirmation - ${populatedBooking.confirmationNumber}`,
      html: this.getBookingConfirmationTemplate({
        guestName: `${guest.firstName} ${guest.lastName}`,
        confirmationNumber: populatedBooking.confirmationNumber,
        propertyName: property.name,
        propertyAddress: this.formatAddress(property.address),
        roomType: roomType.name,
        checkIn: formatDate(populatedBooking.dates.checkIn),
        checkOut: formatDate(populatedBooking.dates.checkOut),
        nights: populatedBooking.dates.nights,
        guests: populatedBooking.occupancy.adults + populatedBooking.occupancy.children,
        rooms: populatedBooking.occupancy.rooms,
        totalAmount: populatedBooking.pricing.grandTotal,
        currency: property.settings?.currency || "USD",
        checkInTime: property.settings?.checkInTime || "15:00",
        checkOutTime: property.settings?.checkOutTime || "11:00",
      }),
    };

    await this.send(email);
  }

  async sendCancellationNotice(
    booking: IBooking,
    refundAmount: number
  ): Promise<void> {
    const populatedBooking = await Booking.findById(booking._id)
      .populate("guestId")
      .populate("propertyId");

    if (!populatedBooking) return;

    const guest = populatedBooking.guestId as any;
    const property = populatedBooking.propertyId as any;

    const email: EmailData = {
      to: guest.email,
      subject: `Booking Cancellation - ${populatedBooking.confirmationNumber}`,
      html: this.getCancellationTemplate({
        guestName: `${guest.firstName} ${guest.lastName}`,
        confirmationNumber: populatedBooking.confirmationNumber,
        propertyName: property.name,
        checkIn: formatDate(populatedBooking.dates.checkIn),
        checkOut: formatDate(populatedBooking.dates.checkOut),
        refundAmount,
        currency: property.settings?.currency || "USD",
      }),
    };

    await this.send(email);
  }

  async sendPreArrivalReminder(booking: IBooking): Promise<void> {
    const populatedBooking = await Booking.findById(booking._id)
      .populate("guestId")
      .populate("propertyId")
      .populate("roomTypeId");

    if (!populatedBooking) return;

    const guest = populatedBooking.guestId as any;
    const property = populatedBooking.propertyId as any;
    const roomType = populatedBooking.roomTypeId as any;

    const email: EmailData = {
      to: guest.email,
      subject: `Your Stay Begins Tomorrow - ${property.name}`,
      html: this.getPreArrivalTemplate({
        guestName: `${guest.firstName} ${guest.lastName}`,
        confirmationNumber: populatedBooking.confirmationNumber,
        propertyName: property.name,
        propertyAddress: this.formatAddress(property.address),
        roomType: roomType.name,
        checkIn: formatDate(populatedBooking.dates.checkIn),
        checkInTime: property.settings?.checkInTime || "15:00",
        contactPhone: property.contact?.phone,
        contactEmail: property.contact?.email,
      }),
    };

    await this.send(email);
  }

  async sendReviewRequest(booking: IBooking): Promise<void> {
    const populatedBooking = await Booking.findById(booking._id)
      .populate("guestId")
      .populate("propertyId");

    if (!populatedBooking) return;

    const guest = populatedBooking.guestId as any;
    const property = populatedBooking.propertyId as any;

    const reviewUrl = `${process.env.FRONTEND_URL}/review/${populatedBooking._id}`;

    const email: EmailData = {
      to: guest.email,
      subject: `How was your stay at ${property.name}?`,
      html: this.getReviewRequestTemplate({
        guestName: `${guest.firstName} ${guest.lastName}`,
        propertyName: property.name,
        checkIn: formatDate(populatedBooking.dates.checkIn),
        checkOut: formatDate(populatedBooking.dates.checkOut),
        reviewUrl,
      }),
    };

    await this.send(email);
  }

  async sendPaymentReceipt(booking: IBooking, payment: IPayment): Promise<void> {
    const populatedBooking = await Booking.findById(booking._id)
      .populate("guestId")
      .populate("propertyId");

    if (!populatedBooking) return;

    const guest = populatedBooking.guestId as any;
    const property = populatedBooking.propertyId as any;

    const email: EmailData = {
      to: guest.email,
      subject: `Payment Receipt - ${populatedBooking.confirmationNumber}`,
      html: this.getPaymentReceiptTemplate({
        guestName: `${guest.firstName} ${guest.lastName}`,
        confirmationNumber: populatedBooking.confirmationNumber,
        propertyName: property.name,
        amount: Math.abs(payment.amount),
        currency: payment.currency,
        paymentMethod: payment.method,
        paymentDate: formatDate(payment.processedAt || payment.createdAt),
        isRefund: payment.amount < 0,
      }),
    };

    await this.send(email);
  }

  async sendTestEmail(to: string): Promise<void> {
    const email: EmailData = {
      to,
      subject: "Test Email - Hotel Booking System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email from the Hotel Booking System.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    };

    await this.send(email);
  }

  private async send(email: EmailData): Promise<void> {
    try {
      await sendEmail(email.to, email.subject, email.html);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }

  private formatAddress(address: any): string {
    if (!address) return "";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  }

  private getBookingConfirmationTemplate(data: {
    guestName: string;
    confirmationNumber: string;
    propertyName: string;
    propertyAddress: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    rooms: number;
    totalAmount: number;
    currency: string;
    checkInTime: string;
    checkOutTime: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          Booking Confirmed
        </h1>
        
        <p>Dear ${data.guestName},</p>
        <p>Thank you for your reservation. Your booking has been confirmed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2c3e50; margin-top: 0;">Confirmation Number: ${data.confirmationNumber}</h2>
          
          <h3 style="color: #3498db;">${data.propertyName}</h3>
          <p style="color: #666;">${data.propertyAddress}</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Room Type:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.roomType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Check-in:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.checkIn} from ${data.checkInTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Check-out:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.checkOut} by ${data.checkOutTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Nights:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.nights}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Guests:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.guests}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Rooms:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.rooms}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Total:</strong></td>
              <td style="padding: 8px 0; font-size: 18px; color: #27ae60;"><strong>${data.currency} ${data.totalAmount.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
        
        <p>We look forward to welcoming you!</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you have any questions, please contact us.
        </p>
      </div>
    `;
  }

  private getCancellationTemplate(data: {
    guestName: string;
    confirmationNumber: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    refundAmount: number;
    currency: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
          Booking Cancelled
        </h1>
        
        <p>Dear ${data.guestName},</p>
        <p>Your booking has been cancelled as requested.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Confirmation Number:</strong> ${data.confirmationNumber}</p>
          <p><strong>Property:</strong> ${data.propertyName}</p>
          <p><strong>Original Dates:</strong> ${data.checkIn} - ${data.checkOut}</p>
          ${data.refundAmount > 0 ? `
            <p style="color: #27ae60;"><strong>Refund Amount:</strong> ${data.currency} ${data.refundAmount.toFixed(2)}</p>
            <p style="font-size: 12px; color: #666;">Refunds typically take 5-10 business days to process.</p>
          ` : ''}
        </div>
        
        <p>We hope to welcome you in the future.</p>
      </div>
    `;
  }

  private getPreArrivalTemplate(data: {
    guestName: string;
    confirmationNumber: string;
    propertyName: string;
    propertyAddress: string;
    roomType: string;
    checkIn: string;
    checkInTime: string;
    contactPhone?: string;
    contactEmail?: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          Your Stay Begins Tomorrow!
        </h1>
        
        <p>Dear ${data.guestName},</p>
        <p>We're excited to welcome you tomorrow at ${data.propertyName}!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Confirmation:</strong> ${data.confirmationNumber}</p>
          <p><strong>Check-in:</strong> ${data.checkIn} from ${data.checkInTime}</p>
          <p><strong>Room Type:</strong> ${data.roomType}</p>
          <p><strong>Address:</strong> ${data.propertyAddress}</p>
        </div>
        
        <h3>What to bring:</h3>
        <ul>
          <li>Valid photo ID</li>
          <li>Credit card for incidentals</li>
          <li>This confirmation email</li>
        </ul>
        
        ${data.contactPhone || data.contactEmail ? `
          <p><strong>Contact us:</strong></p>
          ${data.contactPhone ? `<p>Phone: ${data.contactPhone}</p>` : ''}
          ${data.contactEmail ? `<p>Email: ${data.contactEmail}</p>` : ''}
        ` : ''}
        
        <p>See you soon!</p>
      </div>
    `;
  }

  private getReviewRequestTemplate(data: {
    guestName: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    reviewUrl: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          How was your stay?
        </h1>
        
        <p>Dear ${data.guestName},</p>
        <p>Thank you for staying at ${data.propertyName} (${data.checkIn} - ${data.checkOut}).</p>
        <p>We'd love to hear about your experience!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reviewUrl}" style="background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Leave a Review
          </a>
        </div>
        
        <p>Your feedback helps us improve and helps other travelers make informed decisions.</p>
        
        <p>Thank you!</p>
      </div>
    `;
  }

  private getPaymentReceiptTemplate(data: {
    guestName: string;
    confirmationNumber: string;
    propertyName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentDate: string;
    isRefund: boolean;
  }): string {
    const title = data.isRefund ? "Refund Receipt" : "Payment Receipt";
    const color = data.isRefund ? "#e74c3c" : "#27ae60";

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;">
          ${title}
        </h1>
        
        <p>Dear ${data.guestName},</p>
        <p>${data.isRefund ? 'Your refund has been processed.' : 'Thank you for your payment.'}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking:</strong> ${data.confirmationNumber}</p>
          <p><strong>Property:</strong> ${data.propertyName}</p>
          <p><strong>Amount:</strong> ${data.currency} ${data.amount.toFixed(2)}</p>
          <p><strong>Method:</strong> ${data.paymentMethod}</p>
          <p><strong>Date:</strong> ${data.paymentDate}</p>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          This is an automated receipt. Please keep it for your records.
        </p>
      </div>
    `;
  }
}

export const notificationService = new NotificationService();
