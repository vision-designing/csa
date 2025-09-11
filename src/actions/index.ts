import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { Resend } from "resend";

export const server = {
  application: defineAction({
    accept: "form",
    input: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string().min(10),
      country: z.string(),
      howDidYouHear: z.string().optional(),
      position: z.string(),
      linkedin: z.string().optional().refine((val) => {
        if (!val || val.trim() === '') return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      }, { message: "Please enter a valid LinkedIn URL or leave this field empty" }),
      resume: z.instanceof(File),
      experience: z.union([z.string(), z.number()]).optional().transform((val) => {
        if (!val || val === '') return undefined;
        const num = typeof val === 'string' ? parseInt(val) : val;
        return isNaN(num) ? undefined : num;
      }),
      comments: z.string().optional(),
    }),
    handler: async (input) => {
      const {
        firstName,
        lastName,
        email,
        phone,
        country,
        howDidYouHear,
        linkedin,
        experience,
        comments,
        position,
        resume,
      } = input;
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: "no-reply@skyramedia.com",
          to: "marketing@criticalsa.com",
          subject: `Job application: ${firstName} ${lastName}`,
          text: `From: ${firstName} ${lastName} (${email})\nPhone: ${phone}\nLocation: ${country}\nWhere did you here about us?: ${howDidYouHear}\nPosition: ${position}\nLinkedin: ${linkedin}\nExperience: ${experience}\n\nMessage:\n${comments}`,
          attachments: [
            {
              filename: "resume.pdf",
              content: Buffer.from(await resume.arrayBuffer()),
            },
          ],
        });
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sorry, something went wrong. Please try again later.",
        });
      }
    },
  }),
  contact: defineAction({
    accept: "form",
    input: z.object({
      name: z.string(),
      company: z.string(),
      email: z.string().email(),
      phone: z.string().min(10).max(10).optional(),
      message: z.string().optional(),
    }),
    handler: async ({ name, company, email, phone, message }) => {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: "no-reply@skyramedia.com",
          to: "marketing@criticalsa.com",
          subject: `${name} from ${company}`,
          text: `From: ${name} (${email})\nCompany: ${company}\nPhone: ${phone}\n\nMessage:\n${message}`,
        });
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sorry, something went wrong. Please try again later.",
        });
      }
    },
  }),
  downloadPdf: defineAction({
    accept: "json",
    input: z.object({
      email: z.string().email(),
      pdfUrl: z.string().url(),
      title: z.string(),
    }),
    handler: async ({ email, pdfUrl, title }) => {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      try {
        // Send notification to company email
        await resend.emails.send({
          from: "no-reply@skyramedia.com",
          to: "marketing@criticalsa.com",
          subject: `PDF Download Request: ${title}`,
          text: `A user has requested to download the PDF: ${title}\n\nUser Email: ${email}\nPDF URL: ${pdfUrl}\nTimestamp: ${new Date().toISOString()}`,
        });

        // Send PDF copy to user
        await resend.emails.send({
          from: "no-reply@skyramedia.com",
          to: email,
          subject: `Your requested PDF: ${title}`,
          html: `
            <h2>Thank you for your interest!</h2>
            <p>As requested, here is your copy of <strong>${title}</strong>.</p>
            <br>
            <p><a href="${pdfUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download PDF</a></p>
            <br>
            <p>Best regards,<br>Critical Systems Analysis Team</p>
            <hr>
            <p style="font-size: 12px; color: #666;">You received this email because you requested a PDF download from our website. If you have any questions, please contact us at marketing@criticalsa.com</p>
          `,
        });
      } catch (error) {
        console.error('Email sending error:', error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sorry, something went wrong. Please try again later.",
        });
      }
    },
  }),
};
