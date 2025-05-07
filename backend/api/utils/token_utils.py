import os
from cryptography.fernet import Fernet
from ..models import GitHubToken, Project, GitHubRepository

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

encryptor = TokenEncryptor()

def get_token():
    token_obj = GitHubToken.objects.first()
    if not token_obj:
        return None
    return encryptor.decrypt(token_obj.encrypted_token)

def get_token_obj():
    token_obj = GitHubToken.objects.first()
    if not token_obj:
        return None
    return token_obj