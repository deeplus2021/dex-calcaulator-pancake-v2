# PancakeswapV2 Calculator Interface

## Usage

This typescript interface is developed to interact with smart contracts on the BSC chain for calculating pool prices of pancakeswap V2.

## Smart Contract Address

0x50e65732f6fe18a6cbe7ad962bf6a2c445821545

## How to use

### To get the price of the pool

You can use this interface to get the pair tokens' prices of the pancake v2 pool.

The type of commands to use this feature is as follow:
```
ts-node main.ts 1 <pair_address>
```

For example, to get the prices in `FINK/WBNB` pair of pancakeswap v2, you should type following commands:
```
ts-node main.ts 1 0x72dd39014b8c9230498307e9da40872f1644aeef
```
`0x72dd39014b8c9230498307e9da40872f1644aeef` is the address of `FINK/WBNB` pair of pancakeswap V2.

The result is as follow:
```
WBNB / FINK: 84160.4557
FINK / WBNB: 0.00001188
```
The result shows that one token's price in another token of the pair based on their reserves.

The first line is the price as `token0/token1` in the pool, and second line is the price of `token1/token0` in the pool.

### Get the swapable range of the pool

You can get the swapable token amount based on the particular token price ranges in another token of the pair.

The type of commands to use this feature is as follow:
```
ts-node main.ts 2 <pair_address> <range_from> <range_to> <0|1>
```
The last parameter is for range type.

If you are going to put range of prices as `token0/token1` (In above example, `WBNB/FINK`), you should put this parameter as `0`.

On the other hand, if you are going to put range of prices as `token1/token0` (`FINK/WBNB`), you should put this parameter as `1`.

For example, let look at following examples:
```
ts-node main.ts 2 0x72dd39014b8c9230498307e9da40872f1644aeef 84160 84161 0

0.0003672 WBNB is swapable to get FINK in the bottom price of 84160 WBNB/FINK
0.0004386 WBNB is able to get by swapping FINK in the top price of 84161 WBNB/FINK
```

The result shows that swapable WBNB's amount based on the given price ranges of `WBNB/FINK`.

```
ts-node main.ts 2 0x72dd39014b8c9230498307e9da40872f1644aeef 0.00001187 0.00001189 1 

5799.9911 FINK is swapable to get WBNB in the bottom price of 0.00001187 FINK/WBNB
3809.8162 FINK is able to get by swapping WBNB in the top price of 0.00001189 FINK/WBNB
```

The result shows that swapable WBNB's amount based on the given price ranges of `FINK/WBNB`.

This result is calculated based on the current reserves of the pair.

