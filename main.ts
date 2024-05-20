import { tokenPriceInThePool, swapableTokenAmountInThePool } from "./endpoint";
import dotenv from 'dotenv';

dotenv.config();

async function tokenPrice(token0: string, token1: string) {
    try {
        await tokenPriceInThePool(token0, token1);
    } catch (error) {
        console.error("Error fetching token price:", error);
    }
}

async function swapableTokenAmount(token0: string, token1: string, priceFrom: number, priceTo: number) {
    try {
        await swapableTokenAmountInThePool(token0, token1, priceFrom, priceTo);
    } catch (error) {
        console.error("Error fetching token price:", error);
    }
}

const functionIndicator = process.argv[2];

if (functionIndicator == '1') {
    // get the token price in the pool
    const token0 = process.argv[3];
    const token1 = process.argv[4];
    tokenPrice(token0, token1);
} else if (functionIndicator == '2') {
    // get the swapable token amount in the pool
    const token0 = process.argv[3];
    const token1 = process.argv[4];
    const startPrice = Number(process.argv[5]);
    const endPrice = Number(process.argv[6]);
    swapableTokenAmount(token0, token1, startPrice, endPrice);
} else {
    console.log("There is no matching function indicator");
}
