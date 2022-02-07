import * as chai from 'chai';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { BigNumber } from 'ethers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import {
  DAI_ADDRESS,
  USDC_ADDRESS,
  UNISWAP_V2_FACTORY_ADDRESS,
  UNISWAP_V2_PAIR_ADDRESS,
  SUSHISWAP_FACTORY_ADDRESS,
  SUSHISWAP_PAIR_ADDRESS,
} from '@utils/constants';
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

  // Sushiswap
  SushiswapWrapper,
  SushiswapWrapper__factory,
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

    amountIn = toBN('1');
    amountOut = toBN('2');

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

  describe('UniswapV2Wrapper', function () {
    let wrapper: UniswapV2Wrapper;
    let wrapperFactory: UniswapV2Wrapper__factory;
    let uniswapPair: FakeContract<IUniswapV2Pair>;

    before(async () => {
      uniswapPair = await smock.fake('IUniswapV2Pair', { address: UNISWAP_V2_PAIR_ADDRESS });

      wrapperFactory = (await ethers.getContractFactory('UniswapV2Wrapper')) as UniswapV2Wrapper__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(UNISWAP_V2_FACTORY_ADDRESS);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      uniswapPair.getReserves.returns([amountIn, amountIn, 0]);
    });

    describe('getAmountOut', async function () {
      it('should return the amount based on the current pair balance', async function () {
        expect(await wrapper.connect(randomUser).getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(uniswapPair.getReserves).to.have.been.called;
      });
    });
  });

  describe('SushiswapWrapper', function () {
    let wrapper: SushiswapWrapper;
    let wrapperFactory: SushiswapWrapper__factory;
    let uniswapPair: FakeContract<IUniswapV2Pair>;

    before(async () => {
      uniswapPair = await smock.fake('IUniswapV2Pair', { address: SUSHISWAP_PAIR_ADDRESS });

      wrapperFactory = (await ethers.getContractFactory('SushiswapWrapper')) as SushiswapWrapper__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(SUSHISWAP_FACTORY_ADDRESS);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      uniswapPair.getReserves.returns([amountIn, amountIn, 0]);
    });

    describe('getAmountOut', async function () {
      it('should return the amount based on the current pair balance', async function () {
        expect(await wrapper.connect(randomUser).getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(uniswapPair.getReserves).to.have.been.called;
      });
    });
  });

  describe('UniswapV3Wrapper', function () {
    let wrapper: UniswapV3Wrapper;
    let wrapperFactory: UniswapV3Wrapper__factory;
    let quoter: FakeContract<IQuoter>;
    let swapFee: Number;
    let priceLimit: BigNumber;

    before(async () => {
      quoter = await smock.fake('IQuoter');

      wrapperFactory = (await ethers.getContractFactory('UniswapV3Wrapper')) as UniswapV3Wrapper__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(quoter.address);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      swapFee = await wrapper.SWAP_FEE();
      priceLimit = await wrapper.PRICE_LIMIT();
      quoter.quoteExactInputSingle.whenCalledWith(tokenIn, tokenOut, swapFee, amountIn, priceLimit).returns(amountOut);
    });

    describe('getAmountOut', async function () {
      it('should return the amount fetched from the quoter contract', async function () {
        expect(await wrapper.connect(randomUser).callStatic.getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(quoter.quoteExactInputSingle).to.have.been.calledWith(tokenIn, tokenOut, swapFee, amountIn, priceLimit);
      });
    });
  });
});
