import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OracleWrapper1inch, OracleWrapper1inch__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { USDC_ADDRESS, DAI_ADDRESS, ONE_INCH_AGGREGATOR_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OracleWrapper1inch', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
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

    oracleWrapper1inchFactory = (await ethers.getContractFactory('OracleWrapper1inch')) as OracleWrapper1inch__factory;
    oracleWrapper1inch = await oracleWrapper1inchFactory.connect(deployer).deploy(ONE_INCH_AGGREGATOR_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('1004470');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through OneSplitAudit', async function () {
      expect(await oracleWrapper1inch.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
