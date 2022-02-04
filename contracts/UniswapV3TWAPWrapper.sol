//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import './interfaces/IUniswapV3Factory.sol';
import './libraries/OracleLibrary.sol';
import './libraries/TickMath.sol';
import './libraries/FullMath.sol';

contract UniswapV3TWAPWrapper {
  address public immutable uniswapV3Factory;

  // We assume no fee and no restrictions on the max price
  uint24 public constant SWAP_FEE = 500;

  constructor(address _uniswapV3Factory) {
    uniswapV3Factory = _uniswapV3Factory;
  }

  function getTWAPAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut,
    uint32 _timeAgo
  ) external view returns (uint256 _amountOut) {
    address _pool = IUniswapV3Factory(uniswapV3Factory).getPool(_tokenIn, _tokenOut, SWAP_FEE);
    int24 _timeWeightedAverageTick = OracleLibrary.consult(_pool, _timeAgo);
    uint160 _sqrtRatioX96 = TickMath.getSqrtRatioAtTick(_timeWeightedAverageTick);

    // Calculate _amountOut with better precision if it doesn't overflow when multiplied by itself
    if (_sqrtRatioX96 <= type(uint128).max) {
      uint256 _ratioX192 = uint256(_sqrtRatioX96) * _sqrtRatioX96;
      _amountOut = _tokenIn < _tokenOut ? FullMath.mulDiv(_ratioX192, _amountIn, 1 << 192) : FullMath.mulDiv(1 << 192, _amountIn, _ratioX192);
    } else {
      uint256 _ratioX128 = FullMath.mulDiv(_sqrtRatioX96, _sqrtRatioX96, 1 << 64);
      _amountOut = _tokenIn < _tokenOut ? FullMath.mulDiv(_ratioX128, _amountIn, 1 << 128) : FullMath.mulDiv(1 << 128, _amountIn, _ratioX128);
    }
  }
}
