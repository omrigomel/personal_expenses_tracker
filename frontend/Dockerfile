# Dockerfile (Frontend)
FROM node:16

WORKDIR /app

COPY package*.json /app/
RUN npm install

# מעתיקים את כל קבצי הפרויקט של ה-frontend
COPY . /app

# הפורט ש-React מאזינה עליו
EXPOSE 3000

CMD ["npm", "start"]
