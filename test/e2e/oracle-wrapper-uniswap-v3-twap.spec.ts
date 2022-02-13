import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OracleWrapperUniswapV3TWAP, OracleWrapperUniswapV3TWAP__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, UNISWAP_V3_FACTORY_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OracleWrapperUniswapV3TWAP', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracleWrapperUniswapV3TWAP: OracleWrapperUniswapV3TWAP;
  let oracleWrapperUniswapV3TWAPFactory: OracleWrapperUniswapV3TWAP__factory;

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

    oracleWrapperUniswapV3TWAPFactory = (await ethers.getContractFactory('OracleWrapperUniswapV3TWAP')) as OracleWrapperUniswapV3TWAP__factory;
    oracleWrapperUniswapV3TWAP = await oracleWrapperUniswapV3TWAPFactory.connect(deployer).deploy(UNISWAP_V3_FACTORY_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('1000002');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getTWAPAmountOut', async function () {
    it('calculates swap amount through Uniswap quoter', async function () {
      expect(
        await oracleWrapperUniswapV3TWAP.connect(randomUser).callStatic.getTWAPAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS, 3600)
      ).to.equal(amountOut);
    });
  });
});
