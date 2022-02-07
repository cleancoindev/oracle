import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { UniswapV3TWAPWrapper, UniswapV3TWAPWrapper__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, UNISWAP_V3_FACTORY_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('UniswapV3TWAPWrapper', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let uniswapV3TWAPWrapper: UniswapV3TWAPWrapper;
  let uniswapV3TWAPWrapperFactory: UniswapV3TWAPWrapper__factory;

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

    uniswapV3TWAPWrapperFactory = (await ethers.getContractFactory('UniswapV3TWAPWrapper')) as UniswapV3TWAPWrapper__factory;
    uniswapV3TWAPWrapper = await uniswapV3TWAPWrapperFactory.connect(deployer).deploy(UNISWAP_V3_FACTORY_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('1000002');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getTWAPAmountOut', async function () {
    it('calculates swap amount through Uniswap quoter', async function () {
      expect(await uniswapV3TWAPWrapper.connect(randomUser).callStatic.getTWAPAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS, 3600)).to.equal(
        amountOut
      );
    });
  });
});
