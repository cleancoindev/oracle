import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';
import {
  DAI_ADDRESS,
  USDC_ADDRESS,
  USD_ADDRESS,
  CURVE_SYNTH_SWAP_ADDRESS,
  UNISWAP_V3_QUOTER_ADDRESS,
  UNISWAP_V3_FACTORY_ADDRESS,
  ONE_INCH_AGGREGATOR_ADDRESS,
  CHAINLINK_FEED_ADDRESS,
  UNISWAP_V2_FACTORY_ADDRESS,
  SUSHISWAP_FACTORY_ADDRESS,
} from '@utils/constants';
import {
  // Chainlink
  OracleWrapperChainlink,
  OracleWrapperChainlink__factory,

  // Curve
  OracleWrapperCurve,
  OracleWrapperCurve__factory,

  // 1inch
  OracleWrapper1inch,
  OracleWrapper1inch__factory,

  // UniswapV2
  OracleWrapperUniswapV2,
  OracleWrapperUniswapV2__factory,

  // UniswapV3
  OracleWrapperUniswapV3,
  OracleWrapperUniswapV3__factory,

  // UniswapV3TWAP
  OracleWrapperUniswapV3TWAP,
  OracleWrapperUniswapV3TWAP__factory,

  // Sushiswap
  OracleWrapperSushiswap,
  OracleWrapperSushiswap__factory,
} from '@typechained';

describe('Wrappers', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

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
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('OracleWrapper1inch', async function () {
    let oracleWrapper1inch: OracleWrapper1inch;
    let oracleWrapper1inchFactory: OracleWrapper1inch__factory;

    before(async () => {
      oracleWrapper1inchFactory = (await ethers.getContractFactory('OracleWrapper1inch')) as OracleWrapper1inch__factory;
      oracleWrapper1inch = await oracleWrapper1inchFactory.connect(deployer).deploy(ONE_INCH_AGGREGATOR_ADDRESS);

      amountIn = toUnit(1);
      amountOut = toBN('1004470');

      snapshotId = await evm.snapshot.take();
    });

    it('calculates the swap amount through OneSplitAudit', async function () {
      expect(await oracleWrapper1inch.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });

  describe('OracleWrapperChainlink', async function () {
    let oracleWrapperChainlink: OracleWrapperChainlink;
    let oracleWrapperChainlinkFactory: OracleWrapperChainlink__factory;

    before(async () => {
      oracleWrapperChainlinkFactory = (await ethers.getContractFactory('OracleWrapperChainlink')) as OracleWrapperChainlink__factory;
      oracleWrapperChainlink = await oracleWrapperChainlinkFactory.connect(deployer).deploy(CHAINLINK_FEED_ADDRESS);

      amountIn = toUnit(1);
      amountOut = toBN('99989271000000000000000000');
      snapshotId = await evm.snapshot.take();
    });

    it('calculates the swap amount through Chainlink feed', async function () {
      expect(await oracleWrapperChainlink.connect(randomUser).getAmountOut(USDC_ADDRESS, amountIn, USD_ADDRESS)).to.equal(amountOut);
    });
  });

  describe('OracleWrapperCurve', async function () {
    let oracleWrapperCurve: OracleWrapperCurve;
    let oracleWrapperCurveFactory: OracleWrapperCurve__factory;

    before(async () => {
      oracleWrapperCurveFactory = (await ethers.getContractFactory('OracleWrapperCurve')) as OracleWrapperCurve__factory;
      oracleWrapperCurve = await oracleWrapperCurveFactory.connect(deployer).deploy(CURVE_SYNTH_SWAP_ADDRESS);

      amountIn = toUnit(1);
      amountOut = toBN('995970');
      snapshotId = await evm.snapshot.take();
    });

    it('calculates the swap amount through Curve synth swap', async function () {
      expect(await oracleWrapperCurve.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });

  describe('OracleWrapperSushiswap', async function () {
    let oracleWrapperSushiswap: OracleWrapperSushiswap;
    let oracleWrapperSushiswapFactory: OracleWrapperSushiswap__factory;

    before(async () => {
      oracleWrapperSushiswapFactory = (await ethers.getContractFactory('OracleWrapperSushiswap')) as OracleWrapperSushiswap__factory;
      oracleWrapperSushiswap = await oracleWrapperSushiswapFactory.connect(deployer).deploy(SUSHISWAP_FACTORY_ADDRESS);

      amountIn = toUnit(1);
      amountOut = toBN('995382');
      snapshotId = await evm.snapshot.take();
    });

    it('calculates the swap amount through Sushiswap pair', async function () {
      expect(await oracleWrapperSushiswap.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });

  describe('OracleWrapperUniswapV2', async function () {
    let oracleWrapperUniswapV2: OracleWrapperUniswapV2;
    let oracleWrapperUniswapV2Factory: OracleWrapperUniswapV2__factory;

    before(async () => {
      oracleWrapperUniswapV2Factory = (await ethers.getContractFactory('OracleWrapperUniswapV2')) as OracleWrapperUniswapV2__factory;
      oracleWrapperUniswapV2 = await oracleWrapperUniswapV2Factory.connect(deployer).deploy(UNISWAP_V2_FACTORY_ADDRESS);

      amountIn = toUnit(1);
      amountOut = toBN('996207');
      snapshotId = await evm.snapshot.take();
    });

    it('calculates the swap amount through Uniswap pair', async function () {
      expect(await oracleWrapperUniswapV2.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });

  describe('OracleWrapperUniswapV3', async function () {
    let oracleWrapperUniswapV3: OracleWrapperUniswapV3;
    let oracleWrapperUniswapV3Factory: OracleWrapperUniswapV3__factory;

    before(async () => {
      oracleWrapperUniswapV3Factory = (await ethers.getContractFactory('OracleWrapperUniswapV3')) as OracleWrapperUniswapV3__factory;
      oracleWrapperUniswapV3 = await oracleWrapperUniswapV3Factory.connect(deployer).deploy(UNISWAP_V3_QUOTER_ADDRESS);

      amountIn = toUnit(1);
      amountOut = toUnit(1);
      snapshotId = await evm.snapshot.take();
    });

    it('calculates swap amount through Uniswap quoter', async function () {
      expect(await oracleWrapperUniswapV3.connect(randomUser).callStatic.getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });

  describe('OracleWrapperUniswapV3TWAP', async function () {
    let oracleWrapperUniswapV3TWAP: OracleWrapperUniswapV3TWAP;
    let oracleWrapperUniswapV3TWAPFactory: OracleWrapperUniswapV3TWAP__factory;

    before(async () => {
      oracleWrapperUniswapV3TWAPFactory = (await ethers.getContractFactory('OracleWrapperUniswapV3TWAP')) as OracleWrapperUniswapV3TWAP__factory;
      oracleWrapperUniswapV3TWAP = await oracleWrapperUniswapV3TWAPFactory.connect(deployer).deploy(UNISWAP_V3_FACTORY_ADDRESS);

      amountIn = toUnit(1);
      amountOut = toBN('1000002');
      snapshotId = await evm.snapshot.take();
    });

    it('calculates swap amount through Uniswap quoter', async function () {
      expect(
        await oracleWrapperUniswapV3TWAP.connect(randomUser).callStatic.getTWAPAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS, 3600)
      ).to.equal(amountOut);
    });
  });
});
