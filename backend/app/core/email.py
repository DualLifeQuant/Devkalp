import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, BaseLoader
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Email Templates
TEMPLATES = {
    "welcome": {
        "subject": "Welcome to Devkalp Foundation! 🌱",
        "body": """
<html><body style="font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
  <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a6bb5 100%); padding: 40px; text-align: center;">
    <h1 style="color: #f0c060; margin: 0; font-size: 28px;">Devkalp Foundation</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Empowering Communities, Transforming Lives</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #1a3a5c;">Welcome, {{name}}! 🎉</h2>
    <p style="color: #4a5568; line-height: 1.7;">Thank you for joining the Devkalp Foundation family. Your account has been created successfully.</p>
    <div style="background: #f0f7ff; border-left: 4px solid #0f4c81; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; color: #2d5986;"><strong>Account Type:</strong> {{role}}</p>
      <p style="margin: 4px 0 0; color: #2d5986;"><strong>Email:</strong> {{email}}</p>
    </div>
    <p style="color: #4a5568; line-height: 1.7;">{{message}}</p>
    <a href="{{dashboard_url}}" style="display: inline-block; background: #0f4c81; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">Access Dashboard →</a>
  </div>
  <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #718096; font-size: 13px; margin: 0;">© 2024 Devkalp Foundation. All rights reserved.</p>
  </div>
</div></body></html>
"""
    },
    "interview_scheduled": {
        "subject": "Interview Scheduled – {{job_title}} | Devkalp Foundation",
        "body": """
<html><body style="font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
  <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a6bb5 100%); padding: 40px; text-align: center;">
    <h1 style="color: #f0c060; margin: 0; font-size: 28px;">Devkalp Foundation</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Interview Invitation</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #1a3a5c;">Dear {{candidate_name}},</h2>
    <p style="color: #4a5568; line-height: 1.7;">We are pleased to inform you that you have been shortlisted for an interview for the position of <strong>{{job_title}}</strong>.</p>
    <div style="background: #f0f7ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; color: #1a3a5c;">Interview Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #718096; width: 40%;">Date & Time:</td><td style="color: #2d3748; font-weight: 600;">{{interview_date}}</td></tr>
        <tr><td style="padding: 8px 0; color: #718096;">Mode:</td><td style="color: #2d3748; font-weight: 600;">{{interview_mode}}</td></tr>
        <tr><td style="padding: 8px 0; color: #718096;">Location/Link:</td><td style="color: #2d3748; font-weight: 600;">{{interview_location}}</td></tr>
        <tr><td style="padding: 8px 0; color: #718096;">Interviewer:</td><td style="color: #2d3748; font-weight: 600;">{{interviewer_name}}</td></tr>
      </table>
    </div>
    <p style="color: #4a5568;">Please confirm your attendance by replying to this email. Bring a copy of your resume and original ID proof.</p>
    <p style="color: #4a5568;">All the best!</p>
  </div>
  <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #718096; font-size: 13px; margin: 0;">© 2024 Devkalp Foundation | HR Department</p>
  </div>
</div></body></html>
"""
    },
    "donation_receipt": {
        "subject": "Donation Receipt #{{receipt_number}} – Thank you! 💛",
        "body": """
<html><body style="font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
  <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a6bb5 100%); padding: 40px; text-align: center;">
    <h1 style="color: #f0c060; margin: 0; font-size: 28px;">Devkalp Foundation</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Donation Acknowledgement</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #1a3a5c;">Thank you, {{donor_name}}! 🙏</h2>
    <p style="color: #4a5568; line-height: 1.7;">Your generous donation has been received. Together, we are making a difference.</p>
    <div style="background: #fffbeb; border: 1px solid #f6d860; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; color: #744210;">Donation Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #92400e; width: 40%;">Receipt No:</td><td style="color: #744210; font-weight: 600;">{{receipt_number}}</td></tr>
        <tr><td style="padding: 8px 0; color: #92400e;">Amount:</td><td style="color: #744210; font-weight: 600;">₹{{amount}}</td></tr>
        <tr><td style="padding: 8px 0; color: #92400e;">Campaign:</td><td style="color: #744210; font-weight: 600;">{{campaign_name}}</td></tr>
        <tr><td style="padding: 8px 0; color: #92400e;">Date:</td><td style="color: #744210; font-weight: 600;">{{donation_date}}</td></tr>
        <tr><td style="padding: 8px 0; color: #92400e;">Payment ID:</td><td style="color: #744210; font-weight: 600;">{{payment_id}}</td></tr>
      </table>
    </div>
    <p style="color: #4a5568;">This donation is eligible for tax deduction under Section 80G of the Income Tax Act. Your PDF receipt is attached.</p>
  </div>
  <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #718096; font-size: 13px; margin: 0;">© 2024 Devkalp Foundation | Registered NGO</p>
  </div>
</div></body></html>
"""
    },
    "profile_approved": {
        "subject": "Your Matrimony Profile is Approved! ✅",
        "body": """
<html><body style="font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
  <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a6bb5 100%); padding: 40px; text-align: center;">
    <h1 style="color: #f0c060; margin: 0; font-size: 28px;">Devkalp Foundation</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Matrimony Service</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #1a3a5c;">Congratulations, {{name}}! 🎊</h2>
    <p style="color: #4a5568; line-height: 1.7;">Your matrimony profile has been reviewed and approved by our team. We will now start working on finding suitable matches for you.</p>
    <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="color: #22543d; font-size: 18px; margin: 0;">✅ Profile Status: <strong>Active</strong></p>
    </div>
    <p style="color: #4a5568;">Our counselors will contact you when a suitable match is found. The entire process is confidential and secure.</p>
    <a href="{{dashboard_url}}" style="display: inline-block; background: #0f4c81; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">View Dashboard →</a>
  </div>
  <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #718096; font-size: 13px; margin: 0;">© 2024 Devkalp Foundation | Matrimony Services</p>
  </div>
</div></body></html>
"""
    },
}


async def send_email(to_email: str, template_name: str, context: dict):
    """Send HTML email using a template"""
    try:
        template_data = TEMPLATES.get(template_name)
        if not template_data:
            logger.error(f"Email template '{template_name}' not found")
            return False

        env = Environment(loader=BaseLoader())

        subject_tmpl = env.from_string(template_data["subject"])
        body_tmpl = env.from_string(template_data["body"])

        subject = subject_tmpl.render(**context)
        body = body_tmpl.render(**context)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(body, "html"))

        if not settings.SMTP_USER:
            logger.info(f"[DEV] Email would be sent to {to_email}: {subject}")
            return True

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=True,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
        )
        logger.info(f"Email sent to {to_email}: {subject}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_raw_email(to_email: str, subject: str, html_body: str):
    """Send raw HTML email"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        if not settings.SMTP_USER:
            logger.info(f"[DEV] Raw email to {to_email}: {subject}")
            return True

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=True,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
        )
        return True
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False
