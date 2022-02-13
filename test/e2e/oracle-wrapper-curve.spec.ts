import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OracleWrapperCurve, OracleWrapperCurve__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, CURVE_SYNTH_SWAP_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OracleWrapperCurve', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracleWrapperCurve: OracleWrapperCurve;
  let oracleWrapperCurveFactory: OracleWrapperCurve__factory;

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

    oracleWrapperCurveFactory = (await ethers.getContractFactory('OracleWrapperCurve')) as OracleWrapperCurve__factory;
    oracleWrapperCurve = await oracleWrapperCurveFactory.connect(deployer).deploy(CURVE_SYNTH_SWAP_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('995970');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through Curve synth swap', async function () {
      expect(await oracleWrapperCurve.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
