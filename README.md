# Auction dApp

A decentralized auction application (dApp) built on the Volta blockchain, leveraging smart contracts for secure and transparent bidding. This project integrates a full-stack development approach, combining blockchain technology with a modern web application framework.

## Project Overview

The Auction dApp allows users to participate in decentralized auctions, where bids are recorded on the blockchain for transparency and immutability. The application includes features for both administrators and users, such as auction creation, user registration, bidding, and payment processing.

### Key Features

- **Admin Functionality**:
  - Create auctions with customizable parameters (name, description, start time, duration, initial cost, minimum bid step, and bid validity time).
  - Approve or reject user registrations.

- **User Functionality**:
  - Register and log in to the system.
  - View active auctions and participate in bidding.
  - Access detailed auction pages with real-time bidding updates.
  - Manage won auctions, including payment processing or cancellation with a penalty.

### Technologies Used

#### Blockchain
- **Solidity**: For writing smart contracts.
- **Hardhat**: For compiling, testing, and deploying smart contracts.
- **Volta Blockchain**: A public Ethereum-compatible blockchain for deploying and interacting with smart contracts.
- **Ethers.js**: For interacting with the blockchain from the frontend.

#### Backend
- **Node.js** and **Express**: For handling off-chain logic and API interactions.
- **MongoDB**: For storing off-chain data such as user information and auction details.

#### Frontend
- **React**: For building the user interface.
- **Tailwind CSS**: For styling the application.
- **MetaMask**: For user authentication and wallet integration.

#### Development Environment
- **Visual Studio Code**: Primary IDE for writing and debugging code.
- **Windows 11**: Operating system.
- **Node.js v16.20.2** and **npm v8.19.4**: Runtime and package manager.

## Project Setup

### Prerequisites
- Install Node.js and npm.
- Install MetaMask browser extension.
- Set up a MongoDB instance.

### Installation

1. Clone the repository:
   ```shell
   git clone https://github.com/your-username/auction-dApp.git
   cd dApp_Auction
   ```

2. Install dependencies:
   ```shell
   npm install
   ```

3. Compile smart contracts:
   ```shell
   cd blockchain
   npm install
   npx hardhat compile
   ```

4. Deploy the smart contract to the Volta network:
   ```shell
   npx hardhat run --network volta scripts/deploy.js
   ```

5. Update the contract address in the following files:
   - `.env`
   - `frontend/src/Constant/constant.js`

6. Start the backend server:
   ```shell
   cd backend
   npm install
   node server.js
   ```

7. Start the React application:
   ```shell
   cd frontend
   npm install
   npm start
   ```

8. Set up Tailwind CSS:
   ```shell
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init
   ```

   Update `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: ["./src/**/*.{js,jsx,ts,tsx}"],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

   Update `src/App.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

   Add the following script to `package.json`:
   ```json
   "scripts": {
     "build:css": "tailwindcss -i ./src/App.css -o ./src/output.css --watch"
   }
   ```

   Run the script:
   ```shell
   npm run build:css
   ```

   Import the compiled CSS in `src/index.js`:
   ```javascript
   import './output.css';
   ```

## Docker Setup

To containerize your project using Docker, you'll need to create Dockerfiles for each component (backend, blockchain, and frontend) and a `docker-compose.yml` file to manage the multi-container setup. Below is a step-by-step guide to help you achieve this:

### Step 1: Create Dockerfiles for Each Component

1. **Backend Dockerfile**  
   Created a Dockerfile in the `backend` directory:
   

2. **Blockchain Dockerfile**  
   Created a Dockerfile in the `blockchain` directory:
   

3. **Frontend Dockerfile**  
   Created a Dockerfile in the `frontend` directory:
   

### Step 2: Create a `docker-compose.yml` File

Created a `docker-compose.yml` file in the root of your project to manage all the services (backend, blockchain, and frontend):


### Step 3: Build and Run the Docker Containers

Build and start the containers:
```shell
docker-compose up --build
```

Access the services:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

### Notes:
- When working in a Docker container, there is no normal connection to the MongoDB database for authentication. Ensure proper configuration for MongoDB authentication in your Docker setup.
- Fix the auction bid time synchronization to rely on the server inside the container.

### Step 4: (Optional) Use GitHub Actions for CI/CD

You can set up a GitHub Actions workflow to automatically build and push Docker images to a container registry (e.g., Docker Hub). Here's an example `.github/workflows/docker.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: your-dockerhub-username/backend:latest

      - name: Build and push blockchain
        uses: docker/build-push-action@v4
        with:
          context: ./blockchain
          push: true
          tags: your-dockerhub-username/blockchain:latest

      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: your-dockerhub-username/frontend:latest
```

This setup will allow you to run your entire project in Docker containers, making it easier to develop, test, and deploy.

## Usage

1. **Admin**:
   - Log in to the admin account.
   - Create auctions and manage user registrations.

2. **User**:
   - Register and log in to the system.
   - Browse active auctions and place bids.
   - Manage won auctions and process payments.

## Future Improvements

1. **Docker Integration**: Package the application in Docker containers for easier deployment and scalability.
2. **Time auction bid**: If the bid has not been exceeded and the time of the bid step has ended, end the auction.

## Links

- **Volta Explorer**: [View Contract Transactions](https://volta-explorer.energyweb.org/address/{contract_address}/transactions#address-tabs)
- **Volta Faucet**: [Get Test Tokens](https://voltafaucet.energyweb.org/)

---
```

Let me know if you need further adjustments!
