import random
import string

def generate_reset_code(length=6):
    """Генерация случайного кода для восстановления пароля."""
    return ''.join(random.choices(string.digits, k=length))
