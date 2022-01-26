//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import './interfaces/IExchangeWrapper.sol';
import './interfaces/IUniswapV2Pair.sol';
import './libraries/UniswapV2Library.sol';

contract UniswapV2Wrapper is IExchangeWrapper {
  address public immutable uniswapV2Factory;

  constructor(address _uniswapV2Factory) {
    uniswapV2Factory = _uniswapV2Factory;
  }

  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256) {
    address pair = UniswapV2Library.pairFor(uniswapV2Factory, _tokenIn, _tokenOut);
    (uint256 reserveIn, uint256 reserveOut, ) = IUniswapV2Pair(pair).getReserves();
    return UniswapV2Library.getAmountOut(_amountIn, reserveIn, reserveOut);
  }
}
