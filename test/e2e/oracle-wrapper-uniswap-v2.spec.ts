import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { OracleWrapperUniswapV2, OracleWrapperUniswapV2__factory } from '@typechained';
import { evm } from '@utils';
import { toUnit, toBN } from '@utils/bn';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAI_ADDRESS, USDC_ADDRESS, UNISWAP_V2_FACTORY_ADDRESS } from '@utils/constants';
import { getNodeUrl } from 'utils/network';
import forkBlockNumber from './fork-block-numbers';

describe('OracleWrapperUniswapV2', async function () {
  // Signers
  let deployer: SignerWithAddress;
  let randomUser: SignerWithAddress;

  // Contracts
  let oracleWrapperUniswapV2: OracleWrapperUniswapV2;
  let oracleWrapperUniswapV2Factory: OracleWrapperUniswapV2__factory;

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

    oracleWrapperUniswapV2Factory = (await ethers.getContractFactory('OracleWrapperUniswapV2')) as OracleWrapperUniswapV2__factory;
    oracleWrapperUniswapV2 = await oracleWrapperUniswapV2Factory.connect(deployer).deploy(UNISWAP_V2_FACTORY_ADDRESS);

    amountIn = toUnit(1);
    amountOut = toBN('996207');

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('getAmountOut', async function () {
    it('calculates the swap amount through Uniswap pair', async function () {
      expect(await oracleWrapperUniswapV2.connect(randomUser).getAmountOut(DAI_ADDRESS, amountIn, USDC_ADDRESS)).to.equal(amountOut);
    });
  });
});
