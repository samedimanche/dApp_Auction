# auction-dApp

https://volta-explorer.energyweb.org/address/{contract_address}/transactions#address-tabs - check contracts in blockchain

https://voltafaucet.energyweb.org/ - faucet for pay transactions



1) you need to install the packages using<br>
```shell
npm install
```

2) the project is ready<br>
2.1) after compilation, you need to migrate the abi from \main_dir\artifacts\contracts\Auction.sol\Auction.json ("abi":) to \main_dir\src\Constant\constant.js (const contractAbi)<br>
```shell
npx hardhat compile
```
<br>
2.2) the only thing in it is to create a new contract every time using the command (npx hardhat run --network volta scripts/deploy.js) at the root of the voting contract project (you can change the contract lifetime using voting/scripts/deploy.js)
add the created contract address to 2 files: (.env) and (constant.js located in the react project react-app/src/Constant/constant.js )<br>

 ```shell
npx hardhat run --network volta scripts/deploy.js
```



3) launched MongoDB from the folder using the command cd \main_dir\backend<br>
   ```shell
   node server.js
   ```
5) The react project is launched from the root folder using the command <br>
```shell
npm start
```

6) For Tailwind <br>
```shell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```
Open the tailwind.config.js:
```shell
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```
Open the src/App.css:
```shell
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Run the Tailwind CLI:
Add the following script to your package.json to compile Tailwind CSS:
```shell
"scripts": {
  "build:css": "tailwindcss -i ./src/App.css -o ./src/output.css --watch"
}
```
Then, run the script in your terminal:
```shell
npm run build:css
```
This will generate an output.css file in your src directory.
Import the Compiled CSS:
Open src/index.js and import the output.css file:
```shell
import './output.css';
```
