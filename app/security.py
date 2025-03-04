from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    #security function to hash the password

    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    #check if the password is correct
    return pwd_context.verify(plain_password, hashed_password)
