import {
    tokenPriceInThePool,
    swapableTokenAmountInThePool,
    test
} from "./endpoint";
import dotenv from 'dotenv';

dotenv.config();

async function tokenPrice(pool: string) {
    try {
        await tokenPriceInThePool(pool);
    } catch (error) {
        console.error("Error fetching token price:", error);
    }
}

async function swapableTokenAmount(pool: string, priceFrom: number, priceTo: number) {
    try {
        await swapableTokenAmountInThePool(pool, priceFrom, priceTo);
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
    const startPrice = Number(process.argv[4]);
    const endPrice = Number(process.argv[5]);
    swapableTokenAmount(pool, startPrice, endPrice);
} else {
    test();
    console.log("There is no matching function indicator");
}
