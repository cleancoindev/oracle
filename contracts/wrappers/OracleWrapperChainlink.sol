// SPDX-License-Identifier: WTFPLv2
pragma solidity >=0.8.4 <0.9.0;

import '../interfaces/external/IChainlinkOracle.sol';
import '../interfaces/IOracleWrapper.sol';

contract OracleWrapperChainlink is IOracleWrapper {
  address public immutable oracle;

  constructor(address _oracle) {
    oracle = _oracle;
  }

  /// @dev _tokenIn and _tokenOut are not used because we're wrapping a certain oracle, e.g. providing ETH/USD price, and passing other assets in does not make sense
  /// @inheritdoc IOracleWrapper
  function getAmountOut(
    address, /* _tokenIn */
    uint256 _amountIn,
    address /* _tokenOut */
  ) external view override returns (uint256 _amountOut) {
    _amountOut = IChainlinkOracle(oracle).latestAnswer() * _amountIn;
  }
}
