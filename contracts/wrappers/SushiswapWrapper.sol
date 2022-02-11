// SPDX-License-Identifier: WTFPLv2
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/IExchangeWrapper.sol';
import '../interfaces/IUniswapV2Pair.sol';
import '../libraries/SushiswapLibrary.sol';

contract SushiswapWrapper is IExchangeWrapper {
  address public immutable sushiswapFactory;

  constructor(address _sushiswapFactory) {
    sushiswapFactory = _sushiswapFactory;
  }

  /// @inheritdoc IExchangeWrapper
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256) {
    address _pair = SushiswapLibrary.pairFor(sushiswapFactory, _tokenIn, _tokenOut);
    (uint112 _reserveIn, uint112 _reserveOut, ) = IUniswapV2Pair(_pair).getReserves();
    return SushiswapLibrary.getAmountOut(_amountIn, _reserveIn, _reserveOut);
  }
}
