import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { SushiswapWrapper, SushiswapWrapper__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, SUSHISWAP_FACTORY_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('SushiswapWrapper', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let sushiswapWrapper: SushiswapWrapper;
  let sushiswapWrapperFactory: SushiswapWrapper__factory;

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

    sushiswapWrapperFactory = (await ethers.getContractFactory('SushiswapWrapper')) as SushiswapWrapper__factory;
    sushiswapWrapper = await sushiswapWrapperFactory.connect(deployer).deploy(SUSHISWAP_FACTORY_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('995382');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through Sushiswap pair', async function () {
      expect(await sushiswapWrapper.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
