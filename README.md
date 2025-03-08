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
   cd auction-dApp
   ```

2. Install dependencies:
   ```shell
   npm install
   ```

3. Compile smart contracts:
   ```shell
   npx hardhat compile
   ```

4. Deploy the smart contract to the Volta network:
   ```shell
   npx hardhat run --network volta scripts/deploy.js
   ```

5. Update the contract address in the following files:
   - `.env`
   - `react-app/src/Constant/constant.js`

6. Start the backend server:
   ```shell
   cd backend
   node server.js
   ```

7. Start the React application:
   ```shell
   cd ../react-app
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
