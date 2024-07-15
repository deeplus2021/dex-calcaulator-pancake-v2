import {
    tokenPriceInThePool,
    swapableTokenAmountInThePool,
    exactOutputSwapInputAmount,
    test
} from "./endpoint";
import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

dotenv.config();

async function tokenPrice(pool: string) {
    try {
        await tokenPriceInThePool(pool);
    } catch (error) {
        console.error("Error fetching token price:", error);
    }
}

async function swapableTokenAmount(pool: string, price: BigNumber) {
    try {
        await swapableTokenAmountInThePool(pool, price);
    } catch (error) {
        console.error("Error fetching token price:", error);
    }
}

const functionIndicator = process.argv[2];

if (functionIndicator == '1') {
    // get the token price in the pool
    const pool = process.argv[3];
    tokenPrice(pool);
} else if (functionIndicator == '2') {
    // get the swapable token amount in the pool
    const pool = process.argv[3];
    const price = Number(process.argv[4]);
    swapableTokenAmount(pool, BigNumber(price));
} else if (functionIndicator == '3') {
    const pool = process.argv[3];
    const output = Number(process.argv[4]);
    const zeroForOne = Number(process.argv[5]);
    exactOutputSwapInputAmount(pool, output, zeroForOne);
} else {
    test();
    console.log("There is no matching function indicator");
}
