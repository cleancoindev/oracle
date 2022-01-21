//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import './IGovernable.sol';

interface IExchangeWrapper is IGovernable {
  event ExchangeAddressUpdated(address _exchange);

  /// @param _tokenIn The address of the base token
  /// @param _amountIn The amount of base token to be converted
  /// @param _tokenOut The address of the quote token
  /// @return The amount of _tokenOut that can be exchanged to _amountIn of _tokenIn
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external returns (uint256);
}
