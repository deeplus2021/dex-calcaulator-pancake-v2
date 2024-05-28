import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

let artifact = require('./artifacts/PancakeCal.json');
dotenv.config();
const web3 = new Web3(process.env.BSC_MAINNET_RPC_URL);
const address = process.env.PAN_CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(artifact.abi, address);

export async function swapableTokenAmountInThePool(pool: string, startPrice: number, endPrice: number, rangeType: number) {
    try {
        const returns: {
            'reserve0': number,
            'reserve1': number,
            'decimals0': number,
            'decimals1': number,
            'symbol0': string,
            'symbol1': string
        } = await contract.methods.getPoolInfo(pool).call();

        const reserve0: BigNumber = new BigNumber(returns.reserve0);
        const reserve1: BigNumber = new BigNumber(returns.reserve1);
        const decimals0: BigNumber = new BigNumber(returns.decimals0);
        const decimals1: BigNumber = new BigNumber(returns.decimals1);
        const symbol0: string = String(returns.symbol0);
        const symbol1: string = String(returns.symbol1);
        
        let current;
        let decimals;
        let decimalsLeft;
        let decimalsRight;
        let symbolLeft: string;
        let symbolRight: string;
        if (rangeType == 0) {
            current = reserve0;
            decimals = decimals0;
            decimalsLeft = decimals0;
            decimalsRight = decimals1;
            symbolLeft = symbol0;
            symbolRight = symbol1;
        } else {
            current = reserve1;
            decimals = decimals1;
            decimalsLeft = decimals1;
            decimalsRight = decimals0;
            symbolLeft = symbol1;
            symbolRight = symbol0;
        }

        const startReserve: BigNumber = reserve0.times(reserve1)
            .div(BigNumber(startPrice))
            .times(BigNumber(10).pow(decimalsLeft))
            .div(BigNumber(10).pow(decimalsRight))
            .sqrt();
        const endReserve: BigNumber = reserve0.times(reserve1)
            .div(BigNumber(endPrice))
            .times(BigNumber(10).pow(decimalsLeft))
            .div(BigNumber(10).pow(decimalsRight))
            .sqrt();

        let amountForStart = startReserve.minus(current).div(BigNumber(10).pow(decimals));
        let endForStart = endReserve.minus(current).div(BigNumber(10).pow(decimals));

        if (amountForStart.gt(0)) {
            console.log(`${scientificNotation(amountForStart)} ${symbolLeft} is swapable to get ${symbolRight} in the bottom price of ${startPrice} ${symbolLeft}/${symbolRight}`);
        } else {
            amountForStart = amountForStart.abs();
            console.log(`${scientificNotation(amountForStart)} ${symbolLeft} is able to get by swapping ${symbolRight} in the bottom price of ${startPrice} ${symbolLeft}/${symbolRight}`);
        }

        if (endForStart.gt(0)) {
            console.log(`${scientificNotation(endForStart)} ${symbolLeft} is swapable to get ${symbolRight} in the top price of ${endPrice} ${symbolLeft}/${symbolRight}`);
        } else {
            endForStart = endForStart.abs();
            console.log(`${scientificNotation(endForStart)} ${symbolLeft} is able to get by swapping ${symbolRight} in the top price of ${endPrice} ${symbolLeft}/${symbolRight}`);
        }
    } catch(error) {
        console.error("Error fetching token price:", error);
        throw error;
    };
}

export async function tokenPriceInThePool(pool: string) {
    try {
        const returns: {
            'reserve0': number,
            'reserve1': number,
            'decimals0': number,
            'decimals1': number,
            'symbol0': string,
            'symbol1': string
        } = await contract.methods.getPoolInfo(pool).call();

        const reserve0: BigNumber = new BigNumber(returns.reserve0);
        const reserve1: BigNumber = new BigNumber(returns.reserve1);
        const decimals0: BigNumber = new BigNumber(returns.decimals0);
        const decimals1: BigNumber = new BigNumber(returns.decimals1);
        const symbol0: string = String(returns.symbol0);
        const symbol1: string = String(returns.symbol1);

        const price01: BigNumber = reserve1.times(BigNumber(10).pow(decimals0)).div(reserve0).div(BigNumber(10).pow(decimals1));
        const price10: BigNumber = reserve0.times(BigNumber(10).pow(decimals1)).div(reserve1).div(BigNumber(10).pow(decimals0));

        // output prices
        console.log(`${symbol0}/${symbol1}: ${scientificNotation(price01)}`);
        console.log(`${symbol1}/${symbol0}: ${scientificNotation(price10)}`);
    } catch(error) {
        console.error(error);
        throw error;
    };
}


function scientificNotation(num: BigNumber): string {
    if (num.gte(1)) return num.toFixed(4, 1);
    const exponent = new BigNumber(Number(num.e));
    return num.toFixed(exponent.abs().plus(3).toNumber(), 1);
}