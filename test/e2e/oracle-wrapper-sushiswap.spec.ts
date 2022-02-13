import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OracleWrapperSushiswap, OracleWrapperSushiswap__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, SUSHISWAP_FACTORY_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OracleWrapperSushiswap', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracleWrapperSushiswap: OracleWrapperSushiswap;
  let oracleWrapperSushiswapFactory: OracleWrapperSushiswap__factory;

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

    oracleWrapperSushiswapFactory = (await ethers.getContractFactory('OracleWrapperSushiswap')) as OracleWrapperSushiswap__factory;
    oracleWrapperSushiswap = await oracleWrapperSushiswapFactory.connect(deployer).deploy(SUSHISWAP_FACTORY_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('995382');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through Sushiswap pair', async function () {
      expect(await oracleWrapperSushiswap.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
