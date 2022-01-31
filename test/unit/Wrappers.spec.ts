import * as chai from 'chai';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { evm, bn } from '@utils';
import { BigNumber } from 'ethers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { DAI_ADDRESS, USDC_ADDRESS } from '@utils/constants';
import {
  // Chainlink
  ChainlinkWrapper,
  ChainlinkWrapper__factory,
  IChainlinkOracle,

  // Curve
  CurveWrapper,
  CurveWrapper__factory,
  ISynthSwap,

  // 1inch
  OneInchWrapper,
  OneInchWrapper__factory,
  IOneSplitAudit,

  // UniswapV2
  UniswapV2Wrapper,
  UniswapV2Wrapper__factory,
  IUniswapV2Pair,

  // UniswapV3
  UniswapV3Wrapper,
  UniswapV3Wrapper__factory,
  IQuoter,
} from '@typechained';

chai.use(smock.matchers);

describe('Wrappers', function () {
  // Common variables for all tests
  let randomUser: SignerWithAddress;
  let deployer: SignerWithAddress;
  let tokenIn: string;
  let tokenOut: string;
  let amountIn: BigNumber;
  let amountOut: BigNumber;
  let snapshotId: string;

  before(async () => {
    [, deployer, randomUser] = await ethers.getSigners();

    amountIn = bn.toBN('1');
    amountOut = bn.toBN('2');

    tokenIn = DAI_ADDRESS;
    tokenOut = USDC_ADDRESS;
  });

  describe('ChainlinkWrapper', function () {
    let wrapper: ChainlinkWrapper;
    let wrapperFactory: ChainlinkWrapper__factory;
    let chainlinkOracle: FakeContract<IChainlinkOracle>;

    before(async () => {
      chainlinkOracle = await smock.fake('IChainlinkOracle');

      wrapperFactory = (await ethers.getContractFactory('ChainlinkWrapper')) as ChainlinkWrapper__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(chainlinkOracle.address);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      let latestPrice = amountOut.div(amountIn);
      chainlinkOracle.latestAnswer.returns(latestPrice);
    });

    describe('getAmountOut', async function () {
      it('should return the amount based on the oracle price', async function () {
        expect(await wrapper.connect(randomUser).getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(chainlinkOracle.latestAnswer).to.have.been.called;
      });
    });
  });

  describe('CurveWrapper', function () {
    let wrapper: CurveWrapper;
    let wrapperFactory: CurveWrapper__factory;
    let syntSwap: FakeContract<ISynthSwap>;

    before(async () => {
      syntSwap = await smock.fake('ISynthSwap');

      wrapperFactory = (await ethers.getContractFactory('CurveWrapper')) as CurveWrapper__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(syntSwap.address);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      syntSwap.get_estimated_swap_amount.whenCalledWith(tokenIn, tokenOut, amountIn).returns(amountOut);
    });

    describe('getAmountOut', async function () {
      it('should return the amount fetched from the SynthSwap contract', async function () {
        expect(await wrapper.connect(randomUser).getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(syntSwap.get_estimated_swap_amount).to.have.been.calledWith(tokenIn, tokenOut, amountIn);
      });
    });
  });

  describe('OneInchWrapper', function () {
    let wrapper: OneInchWrapper;
    let wrapperFactory: OneInchWrapper__factory;
    let oneSplit: FakeContract<IOneSplitAudit>;

    before(async () => {
      oneSplit = await smock.fake('IOneSplitAudit');

      wrapperFactory = (await ethers.getContractFactory('OneInchWrapper')) as OneInchWrapper__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(oneSplit.address);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      oneSplit.getExpectedReturn.returns([amountOut, []]);
    });

    describe('getAmountOut', async function () {
      it('should return the amount fetched from the OneSplitAudit contract', async function () {
        expect(await wrapper.connect(randomUser).getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(oneSplit.getExpectedReturn).to.have.been.called;
      });
    });
  });
});
