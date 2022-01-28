//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './interfaces/IExchangeWrapper.sol';
import './interfaces/IOneSplitAudit.sol';

contract OneInchWrapper is IExchangeWrapper {
  uint256 public constant FLAGS = 0;
  uint256 public constant PARTS = 1;
  address public immutable oneInchAggregator;

  constructor(address _oneInchAggregator) {
    oneInchAggregator = _oneInchAggregator;
  }

  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256) {
    (uint256 amountOut, ) = IOneSplitAudit(oneInchAggregator).getExpectedReturn(IERC20(_tokenIn), IERC20(_tokenOut), _amountIn, PARTS, FLAGS);

    return amountOut;
  }
}
