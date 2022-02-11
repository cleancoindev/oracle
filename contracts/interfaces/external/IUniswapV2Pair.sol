// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.4 <0.9.0;

/// @notice https://github.com/Uniswap/v2-core/blob/master/contracts/interfaces/IUniswapV2Pair.sol
interface IUniswapV2Pair {
  function getReserves()
    external
    view
    returns (
      uint112 reserve0,
      uint112 reserve1,
      uint32 blockTimestampLast
    );
}
