import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OracleWrapperChainlink, OracleWrapperChainlink__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { USDC_ADDRESS, USD_ADDRESS, CHAINLINK_FEED_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OracleWrapperChainlink', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracleWrapperChainlink: OracleWrapperChainlink;
  let oracleWrapperChainlinkFactory: OracleWrapperChainlink__factory;

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

    oracleWrapperChainlinkFactory = (await ethers.getContractFactory('OracleWrapperChainlink')) as OracleWrapperChainlink__factory;
    oracleWrapperChainlink = await oracleWrapperChainlinkFactory.connect(deployer).deploy(CHAINLINK_FEED_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('99989271000000000000000000');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through Chainlink feed', async function () {
      expect(await oracleWrapperChainlink.connect(randomUser).getAmountOut(USDC_ADDRESS, amountIn, USD_ADDRESS)).to.equal(amountOut);
    });
  });
});
