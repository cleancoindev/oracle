//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

/// @notice https://github.com/aave/aave-protocol/blob/4b4545fb583fd4f400507b10f3c3114f45b8a037/contracts/interfaces/IChainlinkAggregator.sol
interface IChainlinkOracle {
  function latestAnswer() external view returns (uint256);
}
