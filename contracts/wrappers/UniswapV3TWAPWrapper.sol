// SPDX-License-Identifier: WTFPLv2
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/external/IUniswapV3Factory.sol';
import '../libraries/OracleLibrary.sol';

contract UniswapV3TWAPWrapper {
  address public immutable uniswapV3Factory;
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
    _amountOut = OracleLibrary.getQuoteAtTick(_timeWeightedAverageTick, _amountIn, _tokenIn, _tokenOut);
  }
}
