import os
from mailjet_rest import Client
from dotenv import load_dotenv

load_dotenv()

mailjet = Client(
    auth=(os.getenv("MAILJET_API_KEY"), os.getenv("MAILJET_SECRET_KEY")),
    version='v3.1'
)

def send_reset_code(email, code):
    data = {
        'Messages': [
            {
                "From": {
                    "Email": os.getenv("MAILJET_SENDER"),
                    "Name": "Wellify Support"
                },
                "To": [{"Email": email}],
                "Subject": "Код восстановления пароля",
                "TextPart": f"Ваш код восстановления: {code}"
            }
        ]
    }
    return mailjet.send.create(data=data)
