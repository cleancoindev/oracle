import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Oracle, Oracle__factory } from '@typechained';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { evm, wallet } from '@utils';
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

  it('should allow governance to set default wrapper', async function () {
    await oracle.setDefaultWrapper(defaultWrapper);
    expect(await oracle.defaultWrapper()).to.eq(defaultWrapper);
  });

  it('should allow governance to set a token wrapper', async function () {
    await oracle.setTokenWrapper(USDC_ADDRESS, tokenWrapper);
    expect(await oracle.tokenWrappers(USDC_ADDRESS)).to.eq(tokenWrapper);
  });

  it('should allow governance to set a pair wrapper', async function () {
    await oracle.setPairWrapper(USDC_ADDRESS, DAI_ADDRESS, pairWrapper);
    expect(await oracle.pairWrappers(USDC_ADDRESS, DAI_ADDRESS)).to.eq(pairWrapper);
  });

  it('should not allow users to set default wrapper', async function () {
    await expect(oracle.connect(randomUser).setDefaultWrapper(defaultWrapper)).to.be.revertedWith('OnlyGovernance');
  });

  it('should not allow users to set a token wrapper', async function () {
    await expect(oracle.connect(randomUser).setTokenWrapper(USDC_ADDRESS, tokenWrapper)).to.be.revertedWith('OnlyGovernance');
  });

  it('should not allow users to set a pair wrapper', async function () {
    await expect(oracle.connect(randomUser).setPairWrapper(USDC_ADDRESS, DAI_ADDRESS, pairWrapper)).to.be.revertedWith('OnlyGovernance');
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
      await oracle.setPairWrapper(USDC_ADDRESS, DAI_ADDRESS, pairWrapper);
      await oracle.setTokenWrapper(USDC_ADDRESS, tokenWrapper);
      expect(await oracle.getWrapperAddress(USDC_ADDRESS, DAI_ADDRESS)).to.eq(pairWrapper);
    });
  });
});
