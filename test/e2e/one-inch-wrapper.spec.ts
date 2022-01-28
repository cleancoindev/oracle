import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OneInchWrapper, OneInchWrapper__factory } from '@typechained';
import { evm, bn } from '@utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { USDC_ADDRESS, DAI_ADDRESS, ONE_INCH_AGGREGATOR_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OneInchWrapper', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oneInchWrapper: OneInchWrapper;
  let oneInchWrapperFactory: OneInchWrapper__factory;

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

    oneInchWrapperFactory = (await ethers.getContractFactory('OneInchWrapper')) as OneInchWrapper__factory;
    oneInchWrapper = await oneInchWrapperFactory.connect(deployer).deploy(ONE_INCH_AGGREGATOR_ADDRESS);

    amountIn = bn.toUnit(1);
    amountOut = bn.toBN('1004470');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through OneSplitAudit', async function () {
      expect(await oneInchWrapper.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
