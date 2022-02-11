// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/// @notice https://github.com/1inch/1inchProtocol/blob/master/contracts/OneSplitAudit.sol
interface IOneSplitAudit {
  function getExpectedReturn(
    IERC20 fromToken,
    IERC20 destToken,
    uint256 amount,
    uint256 parts,
    uint256 flags
  ) external view returns (uint256 returnAmount, uint256[] memory distribution);
}
