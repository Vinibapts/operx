import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def send_whatsapp_alert(message: str):
    phone = os.getenv("WHATSAPP_PHONE")
    apikey = os.getenv("WHATSAPP_APIKEY")
    
    url = "https://api.callmebot.com/whatsapp.php"
    params = {
        "phone": phone,
        "text": message,
        "apikey": apikey
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        print("Status:", response.status_code)
        print("Resposta:", response.text)