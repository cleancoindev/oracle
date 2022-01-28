import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { CurveWrapper, CurveWrapper__factory } from '@typechained';
import { evm, bn } from '@utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, CURVE_SYNTH_SWAP_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('CurveWrapper', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let curveWrapper: CurveWrapper;
  let curveWrapperFactory: CurveWrapper__factory;

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

    curveWrapperFactory = (await ethers.getContractFactory('CurveWrapper')) as CurveWrapper__factory;
    curveWrapper = await curveWrapperFactory.connect(deployer).deploy(CURVE_SYNTH_SWAP_ADDRESS);

    amountIn = bn.toUnit(1);
    amountOut = bn.toBN('995970');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through Curve synth swap', async function () {
      expect(await curveWrapper.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
