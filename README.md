# auction-dApp

1) you need to install the packages using
```shell
npm install
```

2) the project is ready
2.1) after compilation, you need to migrate the abi from \main_dir\artifacts\contracts\Auction.sol\Auction.json ("abi":) to \main_dir\src\Constant\constant.js (const contractAbi)
```shell
npx hardhat compile
```
2.2) the only thing in it is to create a new contract every time using the command (npx hardhat run --network volta scripts/deploy.js) at the root of the voting contract project (you can change the contract lifetime using voting/scripts/deploy.js)
add the created contract address to 2 files: (.env) and (constant.js located in the react project react-app/src/Constant/constant.js )
```shell
npx hardhat run --network volta scripts/deploy.js
```

3) The react project is launched from the root folder using the command 
```shell
npm start
```
