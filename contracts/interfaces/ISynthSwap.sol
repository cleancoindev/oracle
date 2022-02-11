// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

/// @notice https://github.com/curvefi/curve-cross-asset-swaps/blob/master/contracts/SynthSwap.vy
interface ISynthSwap {
  // solhint-disable-next-line func-name-mixedcase
  function get_estimated_swap_amount(
    address _from,
    address _to,
    uint256 _amount
  ) external view returns (uint256);
}
