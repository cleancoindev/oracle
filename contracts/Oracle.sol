//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import './interfaces/IOracle.sol';
import './interfaces/IExchangeWrapper.sol';
import './Governable.sol';

/// @notice Pairs have priority over tokens, and tokens over default
contract Oracle is IOracle, Governable {
  mapping(address => mapping(address => address)) public pairWrappers;
  mapping(address => address) public tokenWrappers;

  address public defaultWrapper;

  constructor() Governable(msg.sender) {}

  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external returns (uint256) {
    address wrapperAddress = getWrapperAddress(_tokenIn, _tokenOut);
    if (wrapperAddress == address(0)) revert ZeroAddress();
    return IExchangeWrapper(wrapperAddress).getAmountOut(_tokenIn, _amountIn, _tokenOut);
  }

  function setDefaultWrapper(address _wrapper) external onlyGovernance {
    if (_wrapper == address(0)) revert ZeroAddress();
    defaultWrapper = _wrapper;
    emit DefaultWrapperUpdated(_wrapper);
  }

  function setTokenWrapper(address _tokenIn, address _wrapper) external onlyGovernance {
    tokenWrappers[_tokenIn] = _wrapper;
    emit TokenWrapperUpdated(_tokenIn, _wrapper);
  }

  function setPairWrapper(
    address _tokenIn,
    address _tokenOut,
    address _wrapper
  ) external onlyGovernance {
    pairWrappers[_tokenIn][_tokenOut] = _wrapper;
    emit PairWrapperUpdated(_tokenIn, _tokenOut, _wrapper);
  }

  function getWrapperAddress(address _tokenIn, address _tokenOut) public view returns (address) {
    address pairWrapper = pairWrappers[_tokenIn][_tokenOut];
    if (pairWrapper != address(0)) return pairWrapper;

    address tokenWrapper = tokenWrappers[_tokenIn];
    if (tokenWrapper != address(0)) return tokenWrapper;

    return defaultWrapper;
  }
}
