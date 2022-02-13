import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OracleWrapperUniswapV3, OracleWrapperUniswapV3__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, UNISWAP_V3_ROUTER_ADDRESS, UNISWAP_V3_QUOTER_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OracleWrapperUniswapV3', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracleWrapperUniswapV3: OracleWrapperUniswapV3;
  let oracleWrapperUniswapV3Factory: OracleWrapperUniswapV3__factory;

  // Misc
  let amountIn: BigNumber;
  let amountOut: BigNumber;
  let snapshotId: string;

  before(async () => {
    await evm.reset({
      jsonRpcUrl: getNodeUrl('mainnet'),
      forkBlockNumber: forkBlockNumber.oracle,
    });

    [, deployer, randomUser] = await ethers.getSigners();

    oracleWrapperUniswapV3Factory = (await ethers.getContractFactory('OracleWrapperUniswapV3')) as OracleWrapperUniswapV3__factory;
    oracleWrapperUniswapV3 = await oracleWrapperUniswapV3Factory.connect(deployer).deploy(UNISWAP_V3_QUOTER_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toUnit(1);

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates swap amount through Uniswap quoter', async function () {
      expect(await oracleWrapperUniswapV3.connect(randomUser).callStatic.getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
