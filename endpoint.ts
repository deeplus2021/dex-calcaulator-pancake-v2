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

        let start = BigNumber(startPrice);
        let end = BigNumber(endPrice);
        let reserve0: BigNumber = new BigNumber(returns.reserve0);
        let reserve1: BigNumber = new BigNumber(returns.reserve1);
        let decimals0: BigNumber = new BigNumber(returns.decimals0);
        let decimals1: BigNumber = new BigNumber(returns.decimals1);
        let symbol0: string = String(returns.symbol0);
        let symbol1: string = String(returns.symbol1);
        const K: BigNumber = reserve0.times(reserve1);

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
        const diffDecimals: BigNumber = BigNumber(10).pow(decimals0.minus(decimals1));

        let a0: BigNumber;
        let a1: BigNumber;
        const currentPrice: BigNumber = reserve1.times(BigNumber(10).pow(decimals0)).div(reserve0).div(BigNumber(10).pow(decimals1));
        if (currentPrice.gt(start)) {
            // diffDecimals * K / P = (r0 + a0) * (r0 + 0.9975a0)
            // a0 = -1.9975 * r0 + ((1.9975 * r0) ^ 2 - 4 * (r0 ^ 2 - diffDecimals * K / P)) ^ 0.5
            let T: BigNumber = BigNumber(1.9975).times(reserve0).pow(2).minus(BigNumber(4).times(reserve0.pow(2).minus(K.times(diffDecimals).div(start))));
            if (T.lt(0)) {
                console.log("ERROR!: Calc failed!");
                return;
            }

            a0 = T.sqrt().minus(BigNumber(1.9975).times(reserve0)).div(BigNumber(1.995));
            a1 = BigNumber(0.9975).times(a0).times(reserve1).div(reserve0.plus(BigNumber(0.9975).times(a0)));
            console.log(`${scientificNotation(a0.div(BigNumber(10).pow(decimals0)), 4)} ${symbol0} => ${scientificNotation(a1.div(BigNumber(10).pow(decimals1)), 4)} ${symbol1} | to reach the price of ${start} ${symbol0}/${symbol1}`);
        } else {
            let T: BigNumber = BigNumber(1.9975).times(reserve1).pow(2).minus(BigNumber(4).times(reserve1.pow(2).minus(K.times(start).div(diffDecimals))));
            if (T.lt(0)) {
                console.log("ERROR!: Calc failed!");
                return;
            }

            a1 = T.sqrt().minus(BigNumber(1.9975).times(reserve1)).div(BigNumber(1.995));
            a0 = BigNumber(0.9975).times(a1).times(reserve0).div(reserve1.plus(BigNumber(0.9975).times(a1)));
            console.log(`${scientificNotation(a1.div(BigNumber(10).pow(decimals1)), 4)} ${symbol1} => ${scientificNotation(a0.div(BigNumber(10).pow(decimals0)), 4)} ${symbol0} | to reach the price of ${start} ${symbol0}/${symbol1}`);
        }

        if (currentPrice.gt(end)) {
            // diffDecimals * K / P = (r0 + a0) * (r0 + 0.9975a0)
            // a0 = -1.9975 * r0 + ((1.9975 * r0) ^ 2 - 4 * (r0 ^ 2 - diffDecimals * K / P)) ^ 0.5
            let T: BigNumber = BigNumber(1.9975).times(reserve0).pow(2).minus(BigNumber(4).times(reserve0.pow(2).minus(K.times(diffDecimals).div(end))));
            if (T.lt(0)) {
                console.log("ERROR!: Calc failed!");
                return;
            }

            a0 = T.sqrt().minus(BigNumber(1.9975).times(reserve0)).div(BigNumber(1.995));
            a1 = BigNumber(0.9975).times(a0).times(reserve1).div(reserve0.plus(BigNumber(0.9975).times(a0)));
            console.log(`${scientificNotation(a0.div(BigNumber(10).pow(decimals0)), 4)} ${symbol0} => ${scientificNotation(a1.div(BigNumber(10).pow(decimals1)), 4)} ${symbol1} | to reach the price of ${end} ${symbol0}/${symbol1}`);
        } else {
            let T: BigNumber = BigNumber(1.9975).times(reserve1).pow(2).minus(BigNumber(4).times(reserve1.pow(2).minus(K.times(end).div(diffDecimals))));
            if (T.lt(0)) {
                console.log("ERROR!: Calc failed!");
                return;
            }

            a1 = T.sqrt().minus(BigNumber(1.9975).times(reserve1)).div(BigNumber(1.995));
            a0 = BigNumber(0.9975).times(a1).times(reserve0).div(reserve1.plus(BigNumber(0.9975).times(a1)));
            console.log(`${scientificNotation(a1.div(BigNumber(10).pow(decimals1)), 4)} ${symbol1} => ${scientificNotation(a0.div(BigNumber(10).pow(decimals0)), 4)} ${symbol0} | to reach the price of ${end} ${symbol0}/${symbol1}`);
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
        console.log(`${symbol0}/${symbol1}: ${scientificNotation(price01, 4)}`);
        console.log(`${symbol1}/${symbol0}: ${scientificNotation(price10, 4)}`);
    } catch(error) {
        console.error(error);
        throw error;
    };
}


function scientificNotation(num: BigNumber, precision: number): string {
    if (num.gte(1)) return num.toFixed(precision, 1);
    const exponent = new BigNumber(Number(num.e));
    return num.toFixed(exponent.abs().plus(precision - 1).toNumber(), 1);
}

export async function test() {
    console.log(BigNumber(3).times(4).pow(2));
}