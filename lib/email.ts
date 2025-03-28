import { Resend } from "resend";
import { env } from "./env";

// Initialize Resend with your API key
const resend = new Resend(env.RESEND_API_KEY);

interface OrganizationInvitationProps {
  email: string;
  invitedByUsername: string | null;
  invitedByEmail: string | null;
  teamName: string;
  inviteLink: string;
}

export async function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: OrganizationInvitationProps) {
  const inviterName = invitedByUsername || invitedByEmail || "Someone";

  try {
    const { data, error } = await resend.emails.send({
      from: "Nexora <no-reply@yourdomain.com>",
      to: email,
      subject: `You've been invited to join ${teamName} on Nexora`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Team Invitation</h2>
          <p>Hello,</p>
          <p>${inviterName} has invited you to join <strong>${teamName}</strong> on Nexora.</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${inviteLink}</p>
          <p>This invitation will expire in 7 days.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="color: #6B7280; font-size: 14px;">
            If you weren't expecting this invitation, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send invitation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return { success: false, error };
  }
}
