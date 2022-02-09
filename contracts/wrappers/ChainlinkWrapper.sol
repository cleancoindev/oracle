//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/IExchangeWrapper.sol';
import '../interfaces/IChainlinkOracle.sol';

contract ChainlinkWrapper is IExchangeWrapper {
  address public immutable oracle;

  constructor(address _oracle) {
    oracle = _oracle;
  }

  /// @dev _tokenIn and _tokenOut are not used because we're wrapping a certain oracle, e.g. providing ETH/USD price, and passing other assets in does not make sense
  /// @inheritdoc IExchangeWrapper
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view override returns (uint256) {
    uint256 _price = IChainlinkOracle(oracle).latestAnswer();
    return _price * _amountIn;
  }
}
