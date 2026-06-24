import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def send_whatsapp_message(phone: str, message: str) -> bool:
    """Send WhatsApp message via Meta Cloud API"""
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.info(f"[DEV] WhatsApp to {phone}: {message[:100]}")
        return True

    # Normalize phone number
    phone = phone.replace("+", "").replace(" ", "").replace("-", "")
    if not phone.startswith("91") and len(phone) == 10:
        phone = f"91{phone}"

    url = f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": message}
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers, timeout=10)
            if resp.status_code == 200:
                logger.info(f"WhatsApp sent to {phone}")
                return True
            else:
                logger.error(f"WhatsApp failed {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        logger.error(f"WhatsApp error: {e}")
        return False


async def notify_interview_scheduled(candidate_name: str, phone: str, job_title: str,
                                      interview_date: str, interview_mode: str,
                                      interview_location: str):
    message = (
        f"🎉 *Devkalp Foundation - Interview Invitation*\n\n"
        f"Dear {candidate_name},\n\n"
        f"Congratulations! You have been shortlisted for *{job_title}*.\n\n"
        f"📅 *Interview Details:*\n"
        f"• Date & Time: {interview_date}\n"
        f"• Mode: {interview_mode}\n"
        f"• Location/Link: {interview_location}\n\n"
        f"Please be available 10 minutes before. Carry your resume and ID proof.\n\n"
        f"All the best! 🙏\n"
        f"_Devkalp Foundation HR Team_"
    )
    return await send_whatsapp_message(phone, message)


async def notify_match_suggested(user_name: str, phone: str):
    message = (
        f"💍 *Devkalp Foundation - Match Suggestion*\n\n"
        f"Dear {user_name},\n\n"
        f"We have found a potential match for you! 🎊\n\n"
        f"Please login to your dashboard to review the suggestion and respond.\n\n"
        f"This is a confidential communication. Please do not share.\n\n"
        f"_Devkalp Foundation Matrimony Team_"
    )
    return await send_whatsapp_message(phone, message)


async def notify_donation_received(donor_name: str, phone: str, amount: float,
                                    campaign: str, receipt_number: str):
    message = (
        f"💛 *Devkalp Foundation - Donation Received*\n\n"
        f"Dear {donor_name},\n\n"
        f"Thank you for your generous donation!\n\n"
        f"✅ *Receipt #{receipt_number}*\n"
        f"• Amount: ₹{amount:,.0f}\n"
        f"• Campaign: {campaign}\n\n"
        f"Your contribution will make a real difference. 🙏\n\n"
        f"_Devkalp Foundation_"
    )
    return await send_whatsapp_message(phone, message)


async def notify_profile_approved(user_name: str, phone: str, module: str):
    message = (
        f"✅ *Devkalp Foundation - Profile Approved*\n\n"
        f"Dear {user_name},\n\n"
        f"Your {module} profile has been reviewed and *approved*!\n\n"
        f"Please login to your dashboard to continue.\n\n"
        f"_Devkalp Foundation Team_"
    )
    return await send_whatsapp_message(phone, message)
