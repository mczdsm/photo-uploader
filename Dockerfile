# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Build the app for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 5173

# Use a non-root user for security
USER node

# Serve the built app using a simple HTTP server (serve is installed globally for simplicity)
CMD ["npx", "vite", "preview", "--port", "5173", "--host", "0.0.0.0"]
