from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv
import os

# Force load .env overriding existing environment variables
load_dotenv(override=True)



class Settings(BaseSettings):
    APP_NAME: str = "Devkalp Foundation"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-this-to-a-real-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/devkalp_db"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/devkalp_db"

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"  # overridden by BACKEND_URL env var in production

    ADMIN_EMAIL_1: str = "admin@devkalpfoundation.org"
    ADMIN_EMAIL_2: str = "director@devkalpfoundation.org"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "Devkalp Foundation <noreply@devkalpfoundation.org>"

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    WHATSAPP_API_URL: str = "https://graph.facebook.com/v17.0"
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""

    REDIS_URL: str = "redis://localhost:6379/0"

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    AWS_BUCKET_NAME: str = "devkalp-documents"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
