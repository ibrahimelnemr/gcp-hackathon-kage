import os
from cryptography.fernet import Fernet

class TokenEncryptor:
    def __init__(self):
        key = os.getenv("ENCRYPTION_KEY")
        if not key:
            raise ValueError("ENCRYPTION_KEY not found in environment.")
        self.fernet = Fernet(key.encode())

    def encrypt(self, plain_text: str) -> str:
        return self.fernet.encrypt(plain_text.encode()).decode()

    def decrypt(self, encrypted_text: str) -> str:
        return self.fernet.decrypt(encrypted_text.encode()).decode()
