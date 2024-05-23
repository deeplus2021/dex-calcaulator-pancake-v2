import Web3 from 'web3';
import dotenv from 'dotenv'

let artifact = require('./artifacts/PancakeCal.json');
dotenv.config();
const web3 = new Web3(process.env.BSC_MAINNET_RPC_URL);
const address = process.env.PAN_CONTRACT_ADDRESS;
const DENOMINATOR = Math.pow(10, Number(process.env.DENOMINATOR));
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
        } = await contract.methods.getSwapableTokenAmount(pool, startPrice * DENOMINATOR, endPrice * DENOMINATOR, rangeType).call();

        let amountForStart = (Number(returns.startReserve) - Number(returns.current)) / (10 ** Number(returns.decimals));
        let endForStart = (Number(returns.endReserve) - Number(returns.current)) / (10 ** Number(returns.decimals));

        let symbol0: string;
        let symbol1: string;
        if (rangeType == 0) {
            symbol0 = returns.symbol0;
            symbol1 = returns.symbol1;
        } else {
            symbol1 = returns.symbol0;
            symbol0 = returns.symbol1;
        }

        if (amountForStart > 0) {
            console.log(`${amountForStart} ${symbol0} is swapable to get ${symbol1} in the bottom price of ${startPrice} ${symbol0}/${symbol1}`);
        } else {
            amountForStart = Math.abs(amountForStart);
            console.log(`${amountForStart} ${symbol0} is able to get by swapping ${symbol1} in the bottom price of ${startPrice} ${symbol0}/${symbol1}`);
        }

        if (endForStart > 0) {
            console.log(`${endForStart} ${symbol0} is swapable to get ${symbol1} in the top price of ${endPrice} ${symbol0}/${symbol1}`);
        } else {
            endForStart = Math.abs(endForStart);
            console.log(`${endForStart} ${symbol0} is able to get by swapping ${symbol1} in the top price of ${endPrice} ${symbol0}/${symbol1}`);
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
        const price01: number = Number(returns.price01) / DENOMINATOR;
        const price10: number = Number(returns.price10) / DENOMINATOR;
        // output prices
        console.log(`${returns.symbol0} / ${returns.symbol1}: ${price01}`);
        console.log(`${returns.symbol1} / ${returns.symbol0}: ${price10}`);
    } catch(error) {
        console.error(error);
        throw error;
    };
}
