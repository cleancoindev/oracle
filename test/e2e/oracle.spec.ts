import chai from 'chai';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { Oracle, Oracle__factory, UniswapV2Wrapper, CurveWrapper, OneInchWrapper } from '@typechained';
import { evm, bn } from '@utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, UNI_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';
import { FakeContract, smock } from '@defi-wonderland/smock';

chai.use(smock.matchers);

describe('Oracle', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracle: Oracle;
  let oracleFactory: Oracle__factory;

  // Wrappers
  let uniswapV2Wrapper: FakeContract<UniswapV2Wrapper>;
  let curveWrapper: FakeContract<CurveWrapper>;
  let oneInchWrapper: FakeContract<OneInchWrapper>;

  // Misc
  let amountIn: BigNumber;
  let amountOut: BigNumber;
  let snapshotId: string;

  before(async () => {
    await evm.reset({
      jsonRpcUrl: getNodeUrl('ropsten'),
      forkBlockNumber: forkBlockNumber.oracle,
    });

    [, deployer, randomUser] = await ethers.getSigners();

    oracleFactory = (await ethers.getContractFactory('Oracle')) as Oracle__factory;
    oracle = await oracleFactory.connect(deployer).deploy();

    amountIn = bn.toUnit(1);
    amountOut = bn.toUnit(5);

    uniswapV2Wrapper = await smock.fake('UniswapV2Wrapper');
    curveWrapper = await smock.fake('CurveWrapper');
    oneInchWrapper = await smock.fake('OneInchWrapper');

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
      uniswapV2Wrapper.getAmountOut.returns(amountOut);
      await oracle.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, UNI_ADDRESS);
      expect(uniswapV2Wrapper.getAmountOut.atCall(0)).to.be.calledWith(DAI_ADDRESS, amountIn, UNI_ADDRESS);
    });

    it('should route requests through pair wrapper', async function () {
      curveWrapper.getAmountOut.returns(amountOut);
      await oracle.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS);
      expect(curveWrapper.getAmountOut.atCall(0)).to.be.calledWith(DAI_ADDRESS, amountIn, USDC_ADDRESS);
    });

    it('should route requests through default wrapper', async function () {
      oneInchWrapper.getAmountOut.returns(amountOut);
      await oracle.connect(randomUser).getAmountOut(UNI_ADDRESS, amountIn, USDC_ADDRESS);
      expect(oneInchWrapper.getAmountOut.atCall(0)).to.be.calledWith(UNI_ADDRESS, amountIn, USDC_ADDRESS);
    });
  });
});
