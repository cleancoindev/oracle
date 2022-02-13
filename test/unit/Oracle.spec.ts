import chai from 'chai';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Oracle, Oracle__factory, OracleWrapperUniswapV2, OracleWrapperCurve, OracleWrapper1inch } from '@typechained';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { evm, wallet, behaviours } from '@utils';
import { toUnit } from '@utils/bn';
import { BigNumber } from 'ethers';
import { DAI_ADDRESS, USDC_ADDRESS, UNI_ADDRESS } from '@utils/constants';
import { FakeContract, smock } from '@defi-wonderland/smock';

chai.use(smock.matchers);

describe('Oracle', function () {
  let oracle: Oracle;
  let oracleFactory: Oracle__factory;
  let governance: SignerWithAddress;
  let randomUser: SignerWithAddress;
  let tokenWrapper: string;
  let pairWrapper: string;
  let defaultWrapper: string;
  let snapshotId: string;

  before(async () => {
    [, governance, randomUser] = await ethers.getSigners();
    oracleFactory = (await ethers.getContractFactory('Oracle')) as Oracle__factory;
    oracle = await oracleFactory.connect(governance).deploy();
    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    defaultWrapper = wallet.generateRandomAddress();
    tokenWrapper = wallet.generateRandomAddress();
    pairWrapper = wallet.generateRandomAddress();
    await evm.snapshot.revert(snapshotId);
  });

  describe('setDefaultWrapper', async function () {
    behaviours.fnShouldOnlyBeCallableByGovernance(
      () => oracle,
      'setDefaultWrapper',
      governance,
      () => [defaultWrapper]
    );
  });

  describe('setTokenWrapper', async function () {
    behaviours.fnShouldOnlyBeCallableByGovernance(
      () => oracle,
      'setTokenWrapper',
      governance,
      () => [USDC_ADDRESS, tokenWrapper]
    );
  });

  describe('setPairWrapper', async function () {
    behaviours.fnShouldOnlyBeCallableByGovernance(
      () => oracle,
      'setPairWrapper',
      governance,
      () => [USDC_ADDRESS, DAI_ADDRESS, pairWrapper]
    );
  });

  describe('getWrapperAddress', async function () {
    it('returns a default wrapper if no token/pair wrappers are set', async function () {
      await oracle.setDefaultWrapper(defaultWrapper);
      expect(await oracle.getWrapperAddress(USDC_ADDRESS, DAI_ADDRESS)).to.eq(defaultWrapper);
    });

    it("returns a token wrapper if it's set", async function () {
      await oracle.setTokenWrapper(USDC_ADDRESS, tokenWrapper);
      expect(await oracle.getWrapperAddress(USDC_ADDRESS, DAI_ADDRESS)).to.eq(tokenWrapper);
    });

    it("returns a pair wrapper if it's set", async function () {
      await oracle.setPairWrapper(USDC_ADDRESS, DAI_ADDRESS, pairWrapper);
      expect(await oracle.getWrapperAddress(USDC_ADDRESS, DAI_ADDRESS)).to.eq(pairWrapper);
    });

    it('prioritizes pair over token wrapper', async function () {
      await oracle.setPairWrapper(USDC_ADDRESS, DAI_ADDRESS, pairWrapper);
      await oracle.setTokenWrapper(USDC_ADDRESS, tokenWrapper);
      expect(await oracle.getWrapperAddress(USDC_ADDRESS, DAI_ADDRESS)).to.eq(pairWrapper);
    });

    it('prioritizes token over default wrapper', async function () {
      await oracle.setTokenWrapper(USDC_ADDRESS, tokenWrapper);
      expect(await oracle.getWrapperAddress(USDC_ADDRESS, DAI_ADDRESS)).to.eq(tokenWrapper);
    });
  });

  describe('getAmountOut', async function () {
    // Wrappers
    let oracleWrapperUniswapV2: FakeContract<OracleWrapperUniswapV2>;
    let oracleWrapperCurve: FakeContract<OracleWrapperCurve>;
    let oracleWrapper1inch: FakeContract<OracleWrapper1inch>;
    let amountIn: BigNumber;
    let amountOut: BigNumber;

    beforeEach(async () => {
      await evm.snapshot.revert(snapshotId);

      oracleWrapperUniswapV2 = await smock.fake('OracleWrapperUniswapV2');
      oracleWrapperCurve = await smock.fake('OracleWrapperCurve');
      oracleWrapper1inch = await smock.fake('OracleWrapper1inch');

      amountIn = toUnit(1);
      amountOut = toUnit(5);

      oracle.connect(governance).setDefaultWrapper(oracleWrapper1inch.address);
      oracle.connect(governance).setTokenWrapper(DAI_ADDRESS, oracleWrapperUniswapV2.address);
      oracle.connect(governance).setPairWrapper(DAI_ADDRESS, USDC_ADDRESS, oracleWrapperCurve.address);
    });

    describe('getAmountOut', async function () {
      it('should route requests through token wrapper', async function () {
        oracleWrapperUniswapV2.getAmountOut.returns(amountOut);
        await oracle.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, UNI_ADDRESS);
        expect(oracleWrapperUniswapV2.getAmountOut.atCall(0)).to.be.calledWith(DAI_ADDRESS, amountIn, UNI_ADDRESS);
      });

      it('should route requests through pair wrapper', async function () {
        oracleWrapperCurve.getAmountOut.returns(amountOut);
        await oracle.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS);
        expect(oracleWrapperCurve.getAmountOut.atCall(0)).to.be.calledWith(DAI_ADDRESS, amountIn, USDC_ADDRESS);
      });

      it('should route requests through default wrapper', async function () {
        oracleWrapper1inch.getAmountOut.returns(amountOut);
        await oracle.connect(randomUser).getAmountOut(UNI_ADDRESS, amountIn, USDC_ADDRESS);
        expect(oracleWrapper1inch.getAmountOut.atCall(0)).to.be.calledWith(UNI_ADDRESS, amountIn, USDC_ADDRESS);
      });
    });
  });
});
