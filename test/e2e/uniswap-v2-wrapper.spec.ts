import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { UniswapV2Wrapper, UniswapV2Wrapper__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, UNISWAP_V2_FACTORY_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('UniswapV2Wrapper', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let uniswapV2Wrapper: UniswapV2Wrapper;
  let uniswapV2WrapperFactory: UniswapV2Wrapper__factory;

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

    uniswapV2WrapperFactory = (await ethers.getContractFactory('UniswapV2Wrapper')) as UniswapV2Wrapper__factory;
    uniswapV2Wrapper = await uniswapV2WrapperFactory.connect(deployer).deploy(UNISWAP_V2_FACTORY_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('996207');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through Uniswap pair', async function () {
      expect(await uniswapV2Wrapper.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
