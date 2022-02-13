// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.4 <0.9.0;

/// @notice https://github.com/Uniswap/v3-periphery/blob/main/contracts/interfaces/IQuoter.sol
interface IQuoter {
  function quoteExactInputSingle(
    address tokenIn,
    address tokenOut,
    uint24 fee,
    uint256 amountIn,
    uint160 sqrtPriceLimitX96
  ) external returns (uint256 amountOut);
}
