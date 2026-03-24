# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite React frontend
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the Express proxy server
CMD ["node", "server.js"]
