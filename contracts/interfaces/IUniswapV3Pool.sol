// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.4 <0.9.0;

/// @notice https://github.com/lbertenasco/uniswap-v3-core/blob/main/contracts/UniswapV3Pool.sol
interface IUniswapV3Pool {
  /// @notice Returns the cumulative tick and liquidity as of each timestamp `secondsAgo` from the current block timestamp
  /// @dev To get a time weighted average tick or liquidity-in-range, you must call this with two values, one representing
  /// the beginning of the period and another for the end of the period. E.g., to get the last hour time-weighted average tick,
  /// you must call it with secondsAgos = [3600, 0].
  /// @dev The time weighted average tick represents the geometric time weighted average price of the pool, in
  /// log base sqrt(1.0001) of token1 / token0. The TickMath library can be used to go from a tick value to a ratio.
  /// @param secondsAgos From how long ago each cumulative tick and liquidity value should be returned
  /// @return tickCumulatives Cumulative tick values as of each `secondsAgos` from the current block timestamp
  /// @return secondsPerLiquidityCumulativeX128s Cumulative liquidity-in-range value as of each `secondsAgos` from the current block
  /// timestamp
  function observe(uint32[] calldata secondsAgos)
    external
    view
    returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s);
}
