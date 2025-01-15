# menggunakan node 16 alpine dengan ukuran terkecil
FROM node:latest

# menyimpan direktori kerja di dalam container
WORKDIR /app

# menyalin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# menginstall dependensi dari package.json
RUN npm install

# menyalin semua file ke dalam container
COPY . .

# eksport port 3000
EXPOSE 3000

# menjalankan aplikasi
CMD ["npm", "run", "start"]

