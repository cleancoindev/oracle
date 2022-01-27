//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import './interfaces/IExchangeWrapper.sol';
import './interfaces/ISynthSwap.sol';

contract CurveWrapper is IExchangeWrapper {
  address public immutable synthSwap;

  constructor(address _synthSwap) {
    synthSwap = _synthSwap;
  }

  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256) {
    return ISynthSwap(synthSwap).get_estimated_swap_amount(_tokenIn, _tokenOut, _amountIn);
  }
}
