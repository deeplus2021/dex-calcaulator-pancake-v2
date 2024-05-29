# PancakeswapV2 Calculator Interface

## Usage

This typescript interface is developed to interact with smart contracts on the BSC chain for calculating pool prices of pancakeswap V2.

## How to use

### To get the price of the pool

You can use this interface to get the pair tokens' prices of the pancake v2 pool.

The type of commands to use this feature is as follow:
```
ts-node main.ts 1 <pair_address>
```

For example, to get the prices in `TRUNK/BUSD` pair of pancakeswap v2, you should type following commands:
```
ts-node main.ts 1 0xf15A72B15fC4CAeD6FaDB1ba7347f6CCD1E0Aede
```
`0xf15A72B15fC4CAeD6FaDB1ba7347f6CCD1E0Aede` is the address of `TRUNK/BUSD` pair of pancakeswap V2.

The result is as follow:
```
TRUNK/BUSD: 0.4897
BUSD/TRUNK: 2.0418
```
The result shows that one token's price in another token of the pair based on their reserves.

The first line is the price as `token0/token1` in the pool, and second line is the price of `token1/token0` in the pool.

### Get the swapable range of the pool

You can get the swapable token amount based on the particular token price ranges in another token of the pair.

The type of commands to use this feature is as follow:
```
ts-node main.ts 2 <pair_address> <range_from> <range_to>
```

For example, let look at following examples:
```
ts-node main.ts 2 0xf15A72B15fC4CAeD6FaDB1ba7347f6CCD1E0Aede 0.4894 0.4899

3462.5176 TRUNK => 1690.9110 BUSD :to reach the price of 0.4894 TRUNK/BUSD
776.4675 BUSD => 1581.2418 TRUNK :to reach the price of 0.4899 TRUNK/BUSD
```

Above result shows that swapable `TRUNK` or `BUSD`'s amounts based on the given price ranges of `TRUNK/BUSD`.

In other words, if you swap `3462.5176 TRUNK`, then you will get some `1690.9110 BUSD` and the price will be `0.4894 TRUNK/BUSD`. And you can get `1581.2418 TRUNK` by swapping some `776.4675 BUSD` and the price will be `0.4899 TRUNK/BUSD`.

```
ts-node main.ts 2 0xf15A72B15fC4CAeD6FaDB1ba7347f6CCD1E0Aede 2.0415 2.0421 

459.7012 BUSD => 936.2226 TRUNK :to reach the price of 2.0415 BUSD/TRUNK
513.8729 TRUNK => 251.0233 BUSD :to reach the price of 2.0421 BUSD/TRUNK
```

Above result shows that swapable `BUSD` or `TRUNK`'s amounts based on the given price ranges of `BUSD/TRUNK`.

This result is calculated based on the current reserves of the pair.

