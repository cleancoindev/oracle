// SPDX-License-Identifier: WTFPLv2
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/external/IQuoter.sol';
import '../interfaces/IExchangeWrapper.sol';

contract UniswapV3Wrapper is IExchangeWrapper {
  address public immutable uniswapV3Quoter;

  // We assume 0.5% fee and no restrictions on the max price
  uint24 public constant SWAP_FEE = 500;
  uint160 public constant PRICE_LIMIT = 0;

  constructor(address _uniswapV3Quoter) {
    uniswapV3Quoter = _uniswapV3Quoter;
  }

  /// @inheritdoc IExchangeWrapper
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external override returns (uint256) {
    return IQuoter(uniswapV3Quoter).quoteExactInputSingle(_tokenIn, _tokenOut, SWAP_FEE, _amountIn, PRICE_LIMIT);
  }
}
