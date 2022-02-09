//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../interfaces/IExchangeWrapper.sol';
import '../interfaces/IOneSplitAudit.sol';

contract OneInchWrapper is IExchangeWrapper {
  /// @dev Flags are used to enable/disable certain features; we use the default value
  uint256 public constant FLAGS = 0;
  /// @dev 1inch allows to split the swap in parts and execute them through different DEXes
  uint256 public constant PARTS = 1;
  address public immutable oneInchAggregator;

  constructor(address _oneInchAggregator) {
    oneInchAggregator = _oneInchAggregator;
  }

  /// @inheritdoc IExchangeWrapper
  /// @return _amountOut The amount of _tokenOut that can be exchanged to _amountIn of _tokenIn
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256 _amountOut) {
    (_amountOut, ) = IOneSplitAudit(oneInchAggregator).getExpectedReturn(IERC20(_tokenIn), IERC20(_tokenOut), _amountIn, PARTS, FLAGS);
  }
}
