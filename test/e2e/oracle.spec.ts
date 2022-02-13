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
  UNI_ADDRESS,
  UNISWAP_V2_FACTORY_ADDRESS,
  CURVE_SYNTH_SWAP_ADDRESS,
  ONE_INCH_AGGREGATOR_ADDRESS,
} from '@utils/constants';
import {
  Oracle,
  Oracle__factory,
  OracleWrapperUniswapV2,
  OracleWrapperUniswapV2__factory,
  OracleWrapperCurve,
  OracleWrapperCurve__factory,
  OracleWrapper1inch,
  OracleWrapper1inch__factory,
} from '@typechained';

describe('Oracle', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracle: Oracle;
  let oracleFactory: Oracle__factory;
  let oracleWrapperUniswapV2: OracleWrapperUniswapV2;
  let oracleWrapperUniswapV2Factory: OracleWrapperUniswapV2__factory;
  let oracleWrapperCurve: OracleWrapperCurve;
  let oracleWrapperCurveFactory: OracleWrapperCurve__factory;
  let oracleWrapper1inch: OracleWrapper1inch;
  let oracleWrapper1inchFactory: OracleWrapper1inch__factory;

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

    oracleFactory = (await ethers.getContractFactory('Oracle')) as Oracle__factory;
    oracle = await oracleFactory.connect(deployer).deploy();

    oracleWrapperUniswapV2Factory = (await ethers.getContractFactory('OracleWrapperUniswapV2')) as OracleWrapperUniswapV2__factory;
    oracleWrapperUniswapV2 = await oracleWrapperUniswapV2Factory.connect(deployer).deploy(UNISWAP_V2_FACTORY_ADDRESS);

    oracleWrapperCurveFactory = (await ethers.getContractFactory('OracleWrapperCurve')) as OracleWrapperCurve__factory;
    oracleWrapperCurve = await oracleWrapperCurveFactory.connect(deployer).deploy(CURVE_SYNTH_SWAP_ADDRESS);

    oracleWrapper1inchFactory = (await ethers.getContractFactory('OracleWrapper1inch')) as OracleWrapper1inch__factory;
    oracleWrapper1inch = await oracleWrapper1inchFactory.connect(deployer).deploy(ONE_INCH_AGGREGATOR_ADDRESS);

    oracle.connect(deployer).setDefaultWrapper(oracleWrapper1inch.address);
    oracle.connect(deployer).setTokenWrapper(DAI_ADDRESS, oracleWrapperUniswapV2.address);
    oracle.connect(deployer).setPairWrapper(DAI_ADDRESS, USDC_ADDRESS, oracleWrapperCurve.address);

    amountIn = toUnit(1);

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('should route requests through token wrapper', async function () {
      amountOut = toBN('11565650680152156432');
      expect(await oracle.connect(randomUser).callStatic.getAmountOut(DAI_ADDRESS, amountIn, UNI_ADDRESS)).to.eq(amountOut);
    });

    it('should route requests through pair wrapper', async function () {
      await expect(await oracle.connect(randomUser).callStatic.getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.eq(amountOut);
    });

    it('should route requests through default wrapper', async function () {
      amountOut = toBN('14599952');
      expect(await oracle.connect(randomUser).callStatic.getAmountOut(UNI_ADDRESS, amountIn, USDC_ADDRESS)).to.eq(amountOut);
    });
  });
});
