import random
import time
import smtplib
from email.mime.text import MIMEText
from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from DataBase.database import SessionLocal
from DataBase.DBmodels import User
from utiles import validate_password_strength
from security import hash_password, verify_password
recovery_router = APIRouter()


recovery_codes = {}  # key: email, value: (code, expiration timestamp)


SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "easssmt@gmail.com"
SMTP_PASSWORD = "oeag bals vjhg punw"
FROM_EMAIL = SMTP_USERNAME


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@recovery_router.post("/users/forgot-password")
def forgot_password(email: str = Body(...), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create recovery code
    code = str(random.randint(100000, 999999))
    expiration = time.time() + 15 * 60  # valid for 15 minutes
    recovery_codes[email] = (code, expiration)

    # Send email by SMTP
    subject = "Password Recovery Code"
    body = f"Your password recovery code is: {code}. This code is valid for 15 minutes."
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = email

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, [email], msg.as_string())
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error sending recovery email: " + str(e))

    return {"message": "Recovery code sent to your email"}


@recovery_router.post("/users/reset-password")
def reset_password(
        email: str = Body(...),
        recovery_code: str = Body(...),
        new_password: str = Body(...),
        confirm_password: str = Body(...),
        db: Session = Depends(get_db)
):

    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Validate password strength
    if not validate_password_strength(new_password):
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long and contain at least one uppercase letter"
        )


    if email not in recovery_codes:
        raise HTTPException(status_code=400, detail="Recovery code not requested or expired")

    code, expiration = recovery_codes[email]
    if time.time() > expiration:
        del recovery_codes[email]
        raise HTTPException(status_code=400, detail="Recovery code expired")

    if recovery_code != code:
        raise HTTPException(status_code=400, detail="Invalid recovery code")


    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(new_password)
    db.commit()
    db.refresh(user)

    del recovery_codes[email]
    return {"message": "Password updated successfully"}
