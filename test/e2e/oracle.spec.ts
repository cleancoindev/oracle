import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { evm, bn } from '@utils';
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
  UniswapV2Wrapper,
  UniswapV2Wrapper__factory,
  CurveWrapper,
  CurveWrapper__factory,
  OneInchWrapper,
  OneInchWrapper__factory,
} from '@typechained';

describe('Oracle', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracle: Oracle;
  let oracleFactory: Oracle__factory;
  let uniswapV2Wrapper: UniswapV2Wrapper;
  let uniswapV2WrapperFactory: UniswapV2Wrapper__factory;
  let curveWrapper: CurveWrapper;
  let curveWrapperFactory: CurveWrapper__factory;
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

    oracleFactory = (await ethers.getContractFactory('Oracle')) as Oracle__factory;
    oracle = await oracleFactory.connect(deployer).deploy();

    uniswapV2WrapperFactory = (await ethers.getContractFactory('UniswapV2Wrapper')) as UniswapV2Wrapper__factory;
    uniswapV2Wrapper = await uniswapV2WrapperFactory.connect(deployer).deploy(UNISWAP_V2_FACTORY_ADDRESS);

    curveWrapperFactory = (await ethers.getContractFactory('CurveWrapper')) as CurveWrapper__factory;
    curveWrapper = await curveWrapperFactory.connect(deployer).deploy(CURVE_SYNTH_SWAP_ADDRESS);

    oneInchWrapperFactory = (await ethers.getContractFactory('OneInchWrapper')) as OneInchWrapper__factory;
    oneInchWrapper = await oneInchWrapperFactory.connect(deployer).deploy(ONE_INCH_AGGREGATOR_ADDRESS);

    amountIn = bn.toUnit(1);

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);

    oracle.connect(deployer).setDefaultWrapper(oneInchWrapper.address);
    oracle.connect(deployer).setTokenWrapper(DAI_ADDRESS, uniswapV2Wrapper.address);
    oracle.connect(deployer).setPairWrapper(DAI_ADDRESS, USDC_ADDRESS, curveWrapper.address);
  });

  describe('getAmountOut', async function () {
    it('should route requests through token wrapper', async function () {
      amountOut = bn.toBN('11565650680152156432');
      expect(await oracle.connect(randomUser).callStatic.getAmountOut(DAI_ADDRESS, amountIn, UNI_ADDRESS)).to.eq(amountOut);
    });

    it('should route requests through pair wrapper', async function () {
      await expect(await oracle.connect(randomUser).callStatic.getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.eq(amountOut);
    });

    it('should route requests through default wrapper', async function () {
      amountOut = bn.toBN('14599952');
      expect(await oracle.connect(randomUser).callStatic.getAmountOut(UNI_ADDRESS, amountIn, USDC_ADDRESS)).to.eq(amountOut);
    });
  });
});
