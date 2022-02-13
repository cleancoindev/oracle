// SPDX-License-Identifier: WTFPLv2
pragma solidity >=0.8.4 <0.9.0;

import './interfaces/IOracle.sol';
import './interfaces/IOracleWrapper.sol';
import './Governable.sol';

contract Oracle is IOracle, Governable {
  mapping(address => mapping(address => address)) public pairWrappers;
  mapping(address => address) public tokenWrappers;

  address public defaultWrapper;

  constructor(address _governance) Governable(_governance) {}

  /// @inheritdoc IOracle
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external returns (uint256) {
    address _wrapperAddress = getWrapperAddress(_tokenIn, _tokenOut);
    if (_wrapperAddress == address(0)) revert ZeroAddress();
    return IOracleWrapper(_wrapperAddress).getAmountOut(_tokenIn, _amountIn, _tokenOut);
  }

  /// @inheritdoc IOracle
  function setDefaultWrapper(address _wrapper) external onlyGovernance {
    if (_wrapper == address(0)) revert ZeroAddress();
    defaultWrapper = _wrapper;
    emit DefaultWrapperUpdated(_wrapper);
  }

  /// @inheritdoc IOracle
  function setPairWrapper(
    address _tokenIn,
    address _tokenOut,
    address _wrapper
  ) external onlyGovernance {
    pairWrappers[_tokenIn][_tokenOut] = _wrapper;
    emit PairWrapperUpdated(_tokenIn, _tokenOut, _wrapper);
  }

  /// @inheritdoc IOracle
  function setTokenWrapper(address _tokenIn, address _wrapper) external onlyGovernance {
    tokenWrappers[_tokenIn] = _wrapper;
    emit TokenWrapperUpdated(_tokenIn, _wrapper);
  }

  /// @inheritdoc IOracle
  function getWrapperAddress(address _tokenIn, address _tokenOut) public view returns (address) {
    address _pairWrapper = pairWrappers[_tokenIn][_tokenOut];
    if (_pairWrapper != address(0)) return _pairWrapper;

    address _tokenWrapper = tokenWrappers[_tokenIn];
    if (_tokenWrapper != address(0)) return _tokenWrapper;

    return defaultWrapper;
  }
}
