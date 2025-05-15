# auth/Dockerfile

# 1. 베이스 이미지
FROM node:18

# 2. 앱 디렉토리 생성
WORKDIR /app

# 3. 패키지 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. 소스 복사
COPY . .

# 5. 포트 오픈 및 앱 실행
EXPOSE 3001
CMD ["npm", "run", "start:dev"]