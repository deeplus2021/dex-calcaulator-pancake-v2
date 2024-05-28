import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

let artifact = require('./artifacts/PancakeCal.json');
dotenv.config();
const web3 = new Web3(process.env.BSC_MAINNET_RPC_URL);
const address = process.env.PAN_CONTRACT_ADDRESS;
const DENOMINATOR = Math.pow(10, 15);
const contract = new web3.eth.Contract(artifact.abi, address);

export async function swapableTokenAmountInThePool(pool: string, startPrice: number, endPrice: number, rangeType: number) {
    try {
        const returns: {
            'current': number,
            'startReserve': number,
            'endReserve': number,
            'decimals': number,
            'symbol0': string,
            'symbol1': string
        } = await contract.methods.getSwapableTokenAmount(pool, BigInt(startPrice * DENOMINATOR), BigInt(endPrice * DENOMINATOR), rangeType).call();

        const current = new BigNumber(returns.current);
        const startReserve = new BigNumber(returns.startReserve);
        const endReserve = new BigNumber(returns.endReserve);
        const decimals = new BigNumber(returns.decimals);

        let amountForStart = startReserve.minus(current).div(BigNumber(10).pow(decimals));
        let endForStart = endReserve.minus(current).div(BigNumber(10).pow(decimals));

        let symbol0: string;
        let symbol1: string;
        if (rangeType == 0) {
            symbol0 = returns.symbol0;
            symbol1 = returns.symbol1;
        } else {
            symbol1 = returns.symbol0;
            symbol0 = returns.symbol1;
        }

        if (amountForStart.gt(0)) {
            console.log(`${scientificNotation(amountForStart)} ${symbol0} is swapable to get ${symbol1} in the bottom price of ${startPrice} ${symbol0}/${symbol1}`);
        } else {
            amountForStart = amountForStart.abs();
            console.log(`${scientificNotation(amountForStart)} ${symbol0} is able to get by swapping ${symbol1} in the bottom price of ${startPrice} ${symbol0}/${symbol1}`);
        }

        if (endForStart.gt(0)) {
            console.log(`${scientificNotation(endForStart)} ${symbol0} is swapable to get ${symbol1} in the top price of ${endPrice} ${symbol0}/${symbol1}`);
        } else {
            endForStart = endForStart.abs();
            console.log(`${scientificNotation(endForStart)} ${symbol0} is able to get by swapping ${symbol1} in the top price of ${endPrice} ${symbol0}/${symbol1}`);
        }
    } catch(error) {
        console.error("Error fetching token price:", error);
        throw error;
    };
}

export async function tokenPriceInThePool(pool: string) {
    try {
        const returns: {
            'price01': number,
            'price10': number,
            'symbol0': string,
            'symbol1': string
        } = await contract.methods.getPriceFromPoolTokens(pool).call();

        const price01 = new BigNumber(returns.price01).div(DENOMINATOR);
        const price10 = new BigNumber(returns.price10).div(DENOMINATOR);

        // output prices
        console.log(`${returns.symbol0} / ${returns.symbol1}: ${scientificNotation(price01)}`);
        console.log(`${returns.symbol1} / ${returns.symbol0}: ${scientificNotation(price10)}`);
    } catch(error) {
        console.error(error);
        throw error;
    };
}


function scientificNotation(num: BigNumber): string {
    if (num.gte(1)) return num.toFixed(4);
    const exponent = new BigNumber(Number(num.e));
    return num.toFixed(exponent.abs().plus(3).toNumber());
}