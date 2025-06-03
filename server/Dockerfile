FROM node:20

WORKDIR /app

# Установите зависимости для drizzle-kit
RUN apt-get update && apt-get install -y openssl

# Копируем только зависимости для кэширования
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies)
RUN npm install --include=dev

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Запускаем приложение
CMD ["npm", "start"]