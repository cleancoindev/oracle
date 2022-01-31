//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import './interfaces/IOracle.sol';
import './interfaces/IExchangeWrapper.sol';
import './Governable.sol';

contract Oracle is IOracle, Governable {
  mapping(address => mapping(address => address)) public pairWrappers;
  mapping(address => address) public tokenWrappers;

  address public defaultWrapper;

  constructor() Governable(msg.sender) {}

  /// @inheritdoc IOracle
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external returns (uint256) {
    address wrapperAddress = getWrapperAddress(_tokenIn, _tokenOut);
    if (wrapperAddress == address(0)) revert ZeroAddress();
    return IExchangeWrapper(wrapperAddress).getAmountOut(_tokenIn, _amountIn, _tokenOut);
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

  /// @notice Pairs have priority over tokens, and tokens over default
  /// @param _tokenIn The address of the base token
  /// @param _tokenOut The address of the quote token
  /// @return The address of the wrapper
  function getWrapperAddress(address _tokenIn, address _tokenOut) public view returns (address) {
    address pairWrapper = pairWrappers[_tokenIn][_tokenOut];
    if (pairWrapper != address(0)) return pairWrapper;

    address tokenWrapper = tokenWrappers[_tokenIn];
    if (tokenWrapper != address(0)) return tokenWrapper;

    return defaultWrapper;
  }
}
