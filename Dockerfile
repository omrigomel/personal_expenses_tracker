# Dockerfile (Backend)
FROM python:3.11

# הגדרת תיקיית העבודה בקונטיינר
WORKDIR /app

# העתקת קובץ הדרישות
COPY requirements.txt /app/

# התקנת תלויות
RUN pip install --no-cache-dir -r requirements.txt

# העתקת קבצי הפרויקט הרלוונטיים ל־Backend
# (אם תרצה להתמקד רק בתיקיות 'app' ו-'DataBase', אפשר לעשות זאת במדויק)
COPY app /app/app
COPY DataBase /app/DataBase

# הפורט שהאפליקציה מאזינה עליו
EXPOSE 8000

# הרצת השרת (שים לב לנתיב main.py בהתאם לתיקיות)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
