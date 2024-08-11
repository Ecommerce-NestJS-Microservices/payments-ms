FROM node:20.15.0-alpine3.19

WORKDIR /usr/src/app

#COPY package*.song ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

#RUN npx prisma migrate dev      , At this time, the database doesn't exist, so this command won't work, much less will ti update...

#RUN npx prisma generate ,  At this time, the database doesn't exist, so this command won't work, much less will ti update...


# is the same if you choise other port
EXPOSE 3003 