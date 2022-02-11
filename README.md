[![Actions Status](https://github.com/gas1cent/oracle/actions/workflows/tests.yml/badge.svg)](https://github.com/gas1cent/oracle/actions)

# WonderOracle

🔮 A price oracle that unifies access to most popular price feeds.

# Contents

The project is built on top of the Defi Wonderland's [Solidity boilerplate](https://github.com/defi-wonderland/solidity-boilerplate), refer to the README in that repo for the list of available tools and commands.

# Contracts
There is an Oracle contract and a few wrapper contracts in the repository. All 3rd party files, libraries and interfaces are carbon copies of the originals and haven't been changed in any way.

## Oracle.sol
The main entry point, `Oracle` provides a unified interface for different data sources. Call `getAmountOut(address _tokenIn, uint256 _amountIn, address _tokenOut)` to calculate how much `_tokenOut` you can get for `_amountIn` of `_tokenIn`.
Governance can set wrappers for certain tokens and pair. Pairs have priority over tokens, and tokens over the default wrapper.

## Wrappers
Currently supported
- UniswapV2
- UniswapV3
- UniswapV3 TWAP
- Sushiswap
- 1inch
- Curve (via SynthSwap)
- Chainlink
