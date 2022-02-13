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
  OracleWrapperChainlink,
  OracleWrapperChainlink__factory,
  IChainlinkOracle,

  // Curve
  OracleWrapperCurve,
  OracleWrapperCurve__factory,
  ISynthSwap,

  // 1inch
  OracleWrapper1inch,
  OracleWrapper1inch__factory,
  IOneSplitAudit,

  // UniswapV2
  OracleWrapperUniswapV2,
  OracleWrapperUniswapV2__factory,
  IUniswapV2Pair,

  // UniswapV3
  OracleWrapperUniswapV3,
  OracleWrapperUniswapV3__factory,
  IQuoter,

  // Sushiswap
  OracleWrapperSushiswap,
  OracleWrapperSushiswap__factory,
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

  describe('OracleWrapperChainlink', function () {
    let wrapper: OracleWrapperChainlink;
    let wrapperFactory: OracleWrapperChainlink__factory;
    let chainlinkOracle: FakeContract<IChainlinkOracle>;

    before(async () => {
      chainlinkOracle = await smock.fake('IChainlinkOracle');

      wrapperFactory = (await ethers.getContractFactory('OracleWrapperChainlink')) as OracleWrapperChainlink__factory;
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

  describe('OracleWrapperCurve', function () {
    let wrapper: OracleWrapperCurve;
    let wrapperFactory: OracleWrapperCurve__factory;
    let syntSwap: FakeContract<ISynthSwap>;

    before(async () => {
      syntSwap = await smock.fake('ISynthSwap');

      wrapperFactory = (await ethers.getContractFactory('OracleWrapperCurve')) as OracleWrapperCurve__factory;
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

  describe('OracleWrapper1inch', function () {
    let wrapper: OracleWrapper1inch;
    let wrapperFactory: OracleWrapper1inch__factory;
    let oneSplit: FakeContract<IOneSplitAudit>;

    before(async () => {
      oneSplit = await smock.fake('IOneSplitAudit');

      wrapperFactory = (await ethers.getContractFactory('OracleWrapper1inch')) as OracleWrapper1inch__factory;
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

  describe('OracleWrapperUniswapV2', function () {
    let wrapper: OracleWrapperUniswapV2;
    let wrapperFactory: OracleWrapperUniswapV2__factory;
    let uniswapPair: FakeContract<IUniswapV2Pair>;

    before(async () => {
      uniswapPair = await smock.fake('IUniswapV2Pair', { address: UNISWAP_V2_PAIR_ADDRESS });

      wrapperFactory = (await ethers.getContractFactory('OracleWrapperUniswapV2')) as OracleWrapperUniswapV2__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(UNISWAP_V2_FACTORY_ADDRESS);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      uniswapPair.getReserves.returns([amountIn, amountIn.mul(5), 1]);
    });

    describe('getAmountOut', async function () {
      it('should return the amount based on the current pair balance', async function () {
        expect(await wrapper.connect(randomUser).getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(uniswapPair.getReserves).to.have.been.called;
      });
    });
  });

  describe('OracleWrapperSushiswap', function () {
    let wrapper: OracleWrapperSushiswap;
    let wrapperFactory: OracleWrapperSushiswap__factory;
    let uniswapPair: FakeContract<IUniswapV2Pair>;

    before(async () => {
      uniswapPair = await smock.fake('IUniswapV2Pair', { address: SUSHISWAP_PAIR_ADDRESS });

      wrapperFactory = (await ethers.getContractFactory('OracleWrapperSushiswap')) as OracleWrapperSushiswap__factory;
      wrapper = await wrapperFactory.connect(deployer).deploy(SUSHISWAP_FACTORY_ADDRESS);

      snapshotId = await evm.snapshot.take();
    });

    beforeEach(async () => {
      uniswapPair.getReserves.returns([amountIn, amountIn.mul(5), 1]);
    });

    describe('getAmountOut', async function () {
      it('should return the amount based on the current pair balance', async function () {
        expect(await wrapper.connect(randomUser).getAmountOut(tokenIn, amountIn, tokenOut)).to.eq(amountOut);
        expect(uniswapPair.getReserves).to.have.been.called;
      });
    });
  });

  describe('OracleWrapperUniswapV3', function () {
    let wrapper: OracleWrapperUniswapV3;
    let wrapperFactory: OracleWrapperUniswapV3__factory;
    let quoter: FakeContract<IQuoter>;
    let swapFee: Number;
    let priceLimit: BigNumber;

    before(async () => {
      quoter = await smock.fake('IQuoter');

      wrapperFactory = (await ethers.getContractFactory('OracleWrapperUniswapV3')) as OracleWrapperUniswapV3__factory;
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
