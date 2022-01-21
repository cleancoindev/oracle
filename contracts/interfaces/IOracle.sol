//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

interface IOracle {
  /// @notice Fires when the default wrapper's address is changed.
  event DefaultWrapperUpdated(address wrapper);
  event PairWrapperUpdated(address _tokenIn, address _tokenOut, address _wrapper);
  event TokenWrapperUpdated(address _tokenIn, address _wrapper);

  /// @notice 0x0 was passed to a function as a parameter for either a wrapper or a token
  error ZeroAddress();

  /// @param _tokenIn The address of the base token
  /// @param _amountIn The amount of base token to be converted
  /// @param _tokenOut The address of the quote token
  /// @return The amount of _tokenOut that can be exchanged to _amountIn of _tokenIn
  function getAmountOut(
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external returns (uint256);

  function setDefaultWrapper(address _wrapper) external;

  function setPairWrapper(
    address _tokenIn,
    address _tokenOut,
    address _wrapper
  ) external;

  function setTokenWrapper(address _tokenIn, address _wrapper) external;
}
