// SPDX-License-Identifier: WTFPLv2
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/external/IUniswapV2Pair.sol';
import '../interfaces/IExchangeWrapper.sol';
import '../libraries/UniswapV2Library.sol';

contract UniswapV2Wrapper is IExchangeWrapper {
  address public immutable uniswapV2Factory;

  constructor(address _uniswapV2Factory) {
    uniswapV2Factory = _uniswapV2Factory;
  }

  /// @inheritdoc IExchangeWrapper
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256) {
    address _pair = UniswapV2Library.pairFor(uniswapV2Factory, _tokenIn, _tokenOut);
    (uint112 _reserveIn, uint112 _reserveOut, ) = IUniswapV2Pair(_pair).getReserves();
    return UniswapV2Library.getAmountOut(_amountIn, _reserveIn, _reserveOut);
  }
}
