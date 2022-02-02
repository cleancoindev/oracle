import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Oracle, Oracle__factory } from '@typechained';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { evm, wallet, behaviours } from '@utils';
import { DAI_ADDRESS, USDC_ADDRESS } from '@utils/constants';

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
});
