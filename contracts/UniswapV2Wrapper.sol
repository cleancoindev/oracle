//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <0.9.0;

import './interfaces/IExchangeWrapper.sol';
import './Governable.sol';

contract UniswapV2Wrapper is IExchangeWrapper, Governable {
  address public uniswapV2Address;

  constructor (address _uniswapV2) Governable(msg.sender) public {
    uniswapV2Address = _uniswapV2;
  }

  function getAmountOut(address _tokenIn, uint256 _amountIn, address _tokenOut) external override returns (uint256) {
    // TODO: Proxying the call to Uniswap
  }

  function setUniswapV2Address(address _uniswapV2) public onlyGovernance {
    uniswapV2Address = _uniswapV2;
    emit ExchangeAddressUpdated(_uniswapV2);
  }
}
