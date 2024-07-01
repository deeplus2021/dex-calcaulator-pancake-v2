import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

let artifact = require('./artifacts/PancakeCal.json');
dotenv.config();
const web3 = new Web3(process.env.BSC_MAINNET_RPC_URL);
const address = process.env.PAN_CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(artifact.abi, address);

// BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN })

export async function swapableTokenAmountInThePool(pool: string, startPrice: number, endPrice: number) {
    let rangeType: number = 0;
    try {
        const returns: {
            'reserve0': number,
            'reserve1': number,
            'decimals0': number,
            'decimals1': number,
            'symbol0': string,
            'symbol1': string
        } = await contract.methods.getPoolInfo(pool).call();

        let start = BigNumber(startPrice);
        let end = BigNumber(endPrice);
        let reserve0: BigNumber = new BigNumber(returns.reserve0);
        let reserve1: BigNumber = new BigNumber(returns.reserve1);
        let decimals0: BigNumber = new BigNumber(returns.decimals0);
        let decimals1: BigNumber = new BigNumber(returns.decimals1);
        let symbol0: string = String(returns.symbol0);
        let symbol1: string = String(returns.symbol1);

        const price01: BigNumber = reserve1.times(BigNumber(10).pow(decimals0)).div(reserve0).div(BigNumber(10).pow(decimals1));
        const price10: BigNumber = reserve0.times(BigNumber(10).pow(decimals1)).div(reserve1).div(BigNumber(10).pow(decimals0));

        if (price01.minus(startPrice).abs().gt(price10.minus(startPrice).abs()))
            rangeType = 1;
        
        let middle: BigNumber;
        let symbol: string;
        if (rangeType == 1) { // reverse all order of infos
            middle = reserve0;
            reserve0 = reserve1;
            reserve1 = middle;

            middle = decimals0;
            decimals0 = decimals1;
            decimals1 = middle;

            symbol = symbol0;
            symbol0 = symbol1;
            symbol1 = symbol;
        }
        // D = 10 ^ d0 / 10 ^ d1
        const D0 = BigNumber(10).pow(decimals0);
        const D1 = BigNumber(10).pow(decimals1);
        const D: BigNumber = D0.div(D1);

        let a0: BigNumber;
        let a1: BigNumber;
        const currentPrice: BigNumber = reserve1.times(D0).div(reserve0).div(D1);
        if (currentPrice.gt(start)) {
            // a0 = r1 * D / P - r0 / 0.9975
            // a1 = a0 * P / D
            a0 = reserve1.times(D).div(start).minus(reserve0.div(BigNumber(0.9975)));
            if (a0.gt(0)) {
                a1 = a0.times(start).div(D).times(0.9999);
                console.log(`we can get ${convert(a1.div(D1), 4)} ${symbol1} by spending ${convert(a0.div(D0), 4)} ${symbol0} | at the price of ${start} ${symbol0}/${symbol1}`);
            } else {
                console.log(`NO SWAP: To swap, price should be under ${convert(BigNumber(0.9975).times(currentPrice), 4, 0)} | be over ${convert(currentPrice.div(BigNumber(0.9975)), 4)}`);
            }
        } else {
            a1 = reserve0.times(start).div(D).minus(reserve1.div(BigNumber(0.9975)));
            if (a1.gt(0)) {
                a0 = a1.div(start).times(D).times(0.9999);
                console.log(`we can get ${convert(a0.div(D0), 4)} ${symbol0} by spending ${convert(a1.div(D1), 4)} ${symbol1} | at the price of ${start} ${symbol0}/${symbol1}`);
            } else {
                console.log(`NO SWAP: To swap, price should be under ${convert(BigNumber(0.9975).times(currentPrice), 4, 0)} | be over ${convert(currentPrice.div(BigNumber(0.9975)), 4)}`);
            }
        }

        if (currentPrice.gt(end)) {
            // a0 = r1 * D / P - r0 / 0.9975
            // a1 = a0 * P / D
            a0 = reserve1.times(D).div(end).minus(reserve0.div(BigNumber(0.9975)));
            if (a0.gt(0)) {
                a1 = a0.times(end).div(D).times(0.9999);
                console.log(`we can get ${convert(a1.div(D1), 4)} ${symbol1} by spending ${convert(a0.div(D0), 4)} ${symbol0} | at the price of ${end} ${symbol0}/${symbol1}`);
            } else {
                console.log(`NO SWAP: To swap, price should be under ${convert(BigNumber(0.9975).times(currentPrice), 4, 0)} | be over ${convert(currentPrice.div(BigNumber(0.9975)), 4)}`);
            }
        } else {
            a1 = reserve0.times(end).div(D).minus(reserve1.div(BigNumber(0.9975)));
            if (a1.gt(0)) {
                a0 = a1.div(end).times(D).times(0.9999);
                console.log(`we can get ${convert(a0.div(D0), 4)} ${symbol0} by spending ${convert(a1.div(D1), 4)} ${symbol1} | at the price of ${end} ${symbol0}/${symbol1}`);
            } else {
                console.log(`NO SWAP: To swap, price should be under ${convert(BigNumber(0.9975).times(currentPrice), 4, 0)} | be over ${convert(currentPrice.div(BigNumber(0.9975)), 4)}`);
            }
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
        const D0 = BigNumber(10).pow(decimals0);
        const D1 = BigNumber(10).pow(decimals1);

        const price01: BigNumber = reserve1.times(D0).div(reserve0).div(D1);
        const price10: BigNumber = reserve0.times(D1).div(reserve1).div(D0);

        // output prices
        console.log(`${symbol0}/${symbol1}: ${convert(price01, 4)}`);
        console.log(`${symbol1}/${symbol0}: ${convert(price10, 4)}`);
    } catch(error) {
        console.error(error);
        throw error;
    };
}


function convert(num: BigNumber, precision: number, round: BigNumber.RoundingMode = 1): string {
    if (num.gte(1)) return num.toFixed(precision, 1);
    const exponent = new BigNumber(Number(num.e));
    return num.toFixed(exponent.abs().plus(precision - 1).toNumber(), round);
}

export async function test() {
    console.log(BigNumber(3).times(4).pow(2));
}