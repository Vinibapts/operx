import asyncio
from services.whatsapp_service import send_whatsapp_alert

asyncio.run(send_whatsapp_alert("🔧 Teste Operx - WhatsApp funcionando!"))