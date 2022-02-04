// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/IUniswapV3Pool.sol';

/// @notice https://github.com/Uniswap/v3-periphery/blob/main/contracts/libraries/OracleLibrary.sol
library OracleLibrary {
  /// @notice Calculates time-weighted means of tick and liquidity for a given Uniswap V3 pool
  /// @param pool Address of the pool that we want to observe
  /// @param period Number of seconds in the past from which to calculate the time-weighted means
  /// @return timeWeightedAverageTick The arithmetic mean tick from (block.timestamp - period) to block.timestamp
  function consult(address pool, uint32 period) internal view returns (int24 timeWeightedAverageTick) {
    require(period != 0, 'BP');

    uint32[] memory secondAgos = new uint32[](2);
    secondAgos[0] = period;
    secondAgos[1] = 0;

    (int56[] memory tickCumulatives, ) = IUniswapV3Pool(pool).observe(secondAgos);
    int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];

    timeWeightedAverageTick = int24(tickCumulativesDelta / int256(uint256(period)));

    // Always round to negative infinity
    if (tickCumulativesDelta < 0 && (tickCumulativesDelta % int256(uint256(period)) != 0)) timeWeightedAverageTick--;
  }
}
