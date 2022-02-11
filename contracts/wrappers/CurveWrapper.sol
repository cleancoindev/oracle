// SPDX-License-Identifier: WTFPLv2
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/external/ISynthSwap.sol';
import '../interfaces/IExchangeWrapper.sol';

contract CurveWrapper is IExchangeWrapper {
  address public immutable synthSwap;

  constructor(address _synthSwap) {
    synthSwap = _synthSwap;
  }

  /// @inheritdoc IExchangeWrapper
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256 _amountOut) {
    _amountOut = ISynthSwap(synthSwap).get_estimated_swap_amount(_tokenIn, _tokenOut, _amountIn);
  }
}
